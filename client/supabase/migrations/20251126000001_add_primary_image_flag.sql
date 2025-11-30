/*
  # Add Primary Image Flag to Product Images
  
  This migration adds an `is_primary` flag to the product_images table
  to explicitly designate the main/primary image for a product.
*/

-- Add is_primary column
ALTER TABLE product_images 
  ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_primary 
  ON product_images(product_id, is_primary) 
  WHERE is_primary = true;

-- Create unique constraint: only one primary image per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_unique_primary 
  ON product_images(product_id) 
  WHERE is_primary = true;

-- Function to set first image as primary if no primary exists
CREATE OR REPLACE FUNCTION ensure_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first image for a product and no primary exists, make it primary
  IF NOT EXISTS (
    SELECT 1 FROM product_images 
    WHERE product_id = NEW.product_id 
    AND is_primary = true
  ) THEN
    NEW.is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set first image as primary
DROP TRIGGER IF EXISTS trigger_ensure_primary_image ON product_images;
CREATE TRIGGER trigger_ensure_primary_image
  BEFORE INSERT ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_primary_image();

-- Update existing records: set the first image (lowest position) as primary for each product
UPDATE product_images pi1
SET is_primary = true
WHERE pi1.position = (
  SELECT MIN(pi2.position)
  FROM product_images pi2
  WHERE pi2.product_id = pi1.product_id
)
AND NOT EXISTS (
  SELECT 1 FROM product_images pi3
  WHERE pi3.product_id = pi1.product_id
  AND pi3.is_primary = true
);

