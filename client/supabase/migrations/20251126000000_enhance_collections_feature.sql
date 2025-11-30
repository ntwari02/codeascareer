/*
  # Collections Feature Enhancement
  
  This migration enhances the collections table to support:
  - Manual and Smart collection types
  - Many-to-many relationship with products
  - Advanced sorting, visibility, and SEO features
  - Scheduled publishing
*/

-- =====================================================
-- 1. ENHANCE COLLECTIONS TABLE
-- =====================================================

-- Add new columns to collections table
ALTER TABLE collections 
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'manual' CHECK (type IN ('manual', 'smart')),
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS conditions jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS sort_order text DEFAULT 'manual' CHECK (sort_order IN ('manual', 'price_asc', 'price_desc', 'newest', 'oldest', 'best_selling', 'name_asc', 'name_desc')),
  ADD COLUMN IF NOT EXISTS visibility jsonb DEFAULT '{"storefront": true, "mobile_app": true}',
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_image_url text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create unique index on slug per seller
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_seller_slug 
  ON collections(seller_id, slug) 
  WHERE slug IS NOT NULL;

-- Create index for featured collections
CREATE INDEX IF NOT EXISTS idx_collections_featured 
  ON collections(is_featured, is_active) 
  WHERE is_featured = true AND is_active = true;

-- Create index for scheduled publishing
CREATE INDEX IF NOT EXISTS idx_collections_scheduled 
  ON collections(scheduled_publish_at) 
  WHERE scheduled_publish_at IS NOT NULL;

-- =====================================================
-- 2. CREATE PRODUCT-COLLECTION JUNCTION TABLE
-- =====================================================

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  position int DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(product_id, collection_id)
);

ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view product-collection relationships for active collections
CREATE POLICY "Anyone can view active product collections"
  ON product_collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = product_collections.collection_id
      AND collections.is_active = true
    )
  );

-- Policy: Sellers can manage product-collection relationships for their collections
CREATE POLICY "Sellers can manage own product collections"
  ON product_collections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = product_collections.collection_id
      AND collections.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = product_collections.collection_id
      AND collections.seller_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_collections_product 
  ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection 
  ON product_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_position 
  ON product_collections(collection_id, position);

-- =====================================================
-- 3. REMOVE OLD COLLECTION_ID FROM PRODUCTS
-- =====================================================

-- Note: We keep collection_id for backward compatibility but it's deprecated
-- New code should use product_collections junction table

-- =====================================================
-- 4. CREATE FUNCTION TO AUTO-UPDATE SMART COLLECTIONS
-- =====================================================

-- Function to evaluate smart collection conditions
CREATE OR REPLACE FUNCTION evaluate_smart_collection(collection_uuid uuid)
RETURNS TABLE(product_id uuid) AS $$
DECLARE
  collection_record collections%ROWTYPE;
  condition_item jsonb;
  query_text text;
  condition_type text;
  condition_field text;
  condition_value text;
  condition_operator text;
BEGIN
  -- Get collection record
  SELECT * INTO collection_record 
  FROM collections 
  WHERE id = collection_uuid AND type = 'smart';
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Start building query
  query_text := 'SELECT id FROM products WHERE status = ''active'' AND seller_id = $1';
  
  -- Process each condition
  FOR condition_item IN SELECT * FROM jsonb_array_elements(collection_record.conditions)
  LOOP
    condition_type := condition_item->>'type';
    condition_field := condition_item->>'field';
    condition_value := condition_item->>'value';
    condition_operator := condition_item->>'operator';
    
    CASE condition_type
      WHEN 'tag' THEN
        IF condition_operator = 'equals' THEN
          query_text := query_text || ' AND $' || (array_length(string_to_array(query_text, '$'), 1))::text || ' = ANY(tags)';
        ELSIF condition_operator = 'contains' THEN
          query_text := query_text || ' AND tags && ARRAY[''' || condition_value || ''']';
        END IF;
      WHEN 'price' THEN
        IF condition_operator = 'greater_than' THEN
          query_text := query_text || ' AND price > ' || condition_value;
        ELSIF condition_operator = 'less_than' THEN
          query_text := query_text || ' AND price < ' || condition_value;
        ELSIF condition_operator = 'between' THEN
          query_text := query_text || ' AND price BETWEEN ' || (condition_item->>'min') || ' AND ' || (condition_item->>'max');
        END IF;
      WHEN 'category' THEN
        query_text := query_text || ' AND category_id = ''' || condition_value || '''';
      WHEN 'vendor' THEN
        query_text := query_text || ' AND seller_id = ''' || condition_value || '''';
      WHEN 'stock' THEN
        IF condition_operator = 'in_stock' THEN
          query_text := query_text || ' AND stock_quantity > 0';
        ELSIF condition_operator = 'out_of_stock' THEN
          query_text := query_text || ' AND stock_quantity = 0';
        END IF;
    END CASE;
  END LOOP;
  
  -- Execute query and return product IDs
  RETURN QUERY EXECUTE query_text USING collection_record.seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync smart collection products
CREATE OR REPLACE FUNCTION sync_smart_collection_products()
RETURNS TRIGGER AS $$
DECLARE
  collection_record collections%ROWTYPE;
  product_record products%ROWTYPE;
BEGIN
  -- If product was updated, check all smart collections
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    product_record := NEW;
    
    -- Find all smart collections for this seller
    FOR collection_record IN 
      SELECT * FROM collections 
      WHERE seller_id = product_record.seller_id 
      AND type = 'smart' 
      AND is_active = true
    LOOP
      -- Check if product matches collection conditions
      IF EXISTS (
        SELECT 1 FROM evaluate_smart_collection(collection_record.id) 
        WHERE product_id = product_record.id
      ) THEN
        -- Add product to collection if not already there
        INSERT INTO product_collections (product_id, collection_id)
        VALUES (product_record.id, collection_record.id)
        ON CONFLICT (product_id, collection_id) DO NOTHING;
      ELSE
        -- Remove product from collection if it no longer matches
        DELETE FROM product_collections 
        WHERE product_id = product_record.id 
        AND collection_id = collection_record.id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update smart collections when products change
DROP TRIGGER IF EXISTS trigger_sync_smart_collections ON products;
CREATE TRIGGER trigger_sync_smart_collections
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_smart_collection_products();

-- =====================================================
-- 5. UPDATE RLS POLICIES
-- =====================================================

-- Update collections policy to allow viewing based on visibility and publish date
DROP POLICY IF EXISTS "Anyone can view active collections" ON collections;
CREATE POLICY "Anyone can view active collections"
  ON collections FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    AND (published_at IS NULL OR published_at <= now())
    AND (scheduled_publish_at IS NULL OR scheduled_publish_at <= now())
  );

-- Allow admins to view all collections
CREATE POLICY "Admins can view all collections"
  ON collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 6. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_collection_slug(collection_name text, seller_uuid uuid)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  -- Generate base slug
  base_slug := lower(regexp_replace(collection_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Check if slug exists
  final_slug := base_slug;
  WHILE EXISTS (
    SELECT 1 FROM collections 
    WHERE seller_id = seller_uuid 
    AND slug = final_slug
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_collections_updated_at ON collections;
CREATE TRIGGER trigger_update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_collections_updated_at();

