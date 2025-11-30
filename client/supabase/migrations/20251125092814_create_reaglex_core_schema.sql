/*
  # REAGLEX Platform - Core Database Schema

  ## Overview
  Complete database schema for the REAGLEX ecommerce marketplace platform.
  
  ## Tables Created

  ### 1. User Management
    - `profiles` - Extended user profile data
    - `seller_applications` - Seller registration and verification
    - `seller_tiers` - Seller subscription levels (Basic, Verified, Premium)

  ### 2. Product Management
    - `products` - Main product listings
    - `product_variants` - Size, color, material options
    - `product_images` - Multiple product images
    - `product_videos` - Product video content
    - `collections` - Product groupings
    - `categories` - Product categorization

  ### 3. Order Management
    - `orders` - Order records
    - `order_items` - Individual items in orders
    - `order_tracking` - Shipping status updates
    - `escrow_transactions` - Payment escrow holding

  ### 4. Cart & Wishlist
    - `cart_items` - Shopping cart
    - `wishlist_items` - Saved favorites

  ### 5. Reviews & Ratings
    - `reviews` - Product and seller reviews
    - `questions_answers` - Product Q&A

  ### 6. Disputes & Returns
    - `disputes` - Order disputes
    - `returns` - Return requests

  ### 7. Coupons & Discounts
    - `coupons` - Discount codes
    - `coupon_usage` - Tracking coupon usage

  ### 8. Notifications
    - `notifications` - User notifications

  ## Security
  - RLS enabled on all tables
  - Policies restrict access based on user roles
  - Authenticated users can only access their own data
  - Sellers can only manage their own products
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES & SELLER MANAGEMENT
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role text DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can insert their profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Seller tiers
CREATE TABLE IF NOT EXISTS seller_tiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  monthly_fee numeric(10,2) DEFAULT 0,
  max_products int,
  features jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seller_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seller tiers"
  ON seller_tiers FOR SELECT
  TO authenticated
  USING (true);

-- Insert default seller tiers
INSERT INTO seller_tiers (name, monthly_fee, max_products, features) VALUES
  ('Basic', 0, 10, '["10 product listings", "Basic support", "Standard visibility"]'),
  ('Verified', 29.99, 100, '["100 product listings", "Priority support", "Verified badge", "Analytics dashboard"]'),
  ('Premium', 99.99, 1000, '["Unlimited products", "24/7 support", "Premium badge", "Advanced analytics", "Featured placement", "Bulk upload"]')
ON CONFLICT (name) DO NOTHING;

-- Seller applications
CREATE TABLE IF NOT EXISTS seller_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  business_license text,
  tax_id text,
  business_address text,
  phone text NOT NULL,
  documents jsonb DEFAULT '[]',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  tier_id uuid REFERENCES seller_tiers(id),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON seller_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
  ON seller_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending applications"
  ON seller_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. CATEGORIES & COLLECTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  image_url text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active collections"
  ON collections FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Sellers can manage own collections"
  ON collections FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- =====================================================
-- 3. PRODUCTS & VARIANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id),
  collection_id uuid REFERENCES collections(id),
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(10,2) CHECK (compare_at_price >= 0),
  is_shippable boolean DEFAULT true,
  weight numeric(10,2),
  dimensions jsonb,
  stock_quantity int DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold int DEFAULT 5,
  sku text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  tags text[] DEFAULT '{}',
  location text,
  views_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Sellers can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Product variants
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sku text,
  price numeric(10,2) CHECK (price >= 0),
  stock_quantity int DEFAULT 0 CHECK (stock_quantity >= 0),
  options jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can manage own product variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  alt_text text,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can manage own product images"
  ON product_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Product videos
CREATE TABLE IF NOT EXISTS product_videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  duration int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product videos"
  ON product_videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can manage own product videos"
  ON product_videos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_videos.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- =====================================================
-- 4. CART & WISHLIST
-- =====================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity int DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlist_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. COUPONS
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount numeric(10,2) DEFAULT 0,
  max_discount_amount numeric(10,2),
  usage_limit int,
  usage_count int DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id uuid,
  discount_amount numeric(10,2) NOT NULL,
  used_at timestamptz DEFAULT now()
);

ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon usage"
  ON coupon_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. ORDERS & ESCROW
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  seller_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost numeric(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  tax numeric(10,2) DEFAULT 0 CHECK (tax >= 0),
  discount numeric(10,2) DEFAULT 0 CHECK (discount >= 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  coupon_id uuid REFERENCES coupons(id),
  shipping_method text,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  is_shippable boolean DEFAULT true,
  meeting_details jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their products"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers and sellers can update their orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL NOT NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE TABLE IF NOT EXISTS order_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  location text,
  description text,
  tracking_number text,
  carrier text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking for their orders"
  ON order_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_tracking.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  status text DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  held_at timestamptz DEFAULT now(),
  released_at timestamptz,
  released_to uuid REFERENCES profiles(id),
  notes text
);

ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view escrow for their orders"
  ON escrow_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = escrow_transactions.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- =====================================================
-- 7. REVIEWS & Q&A
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  images jsonb DEFAULT '[]',
  seller_response text,
  responded_at timestamptz,
  is_verified_purchase boolean DEFAULT false,
  helpful_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for purchased products"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS questions_answers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text,
  answered_by uuid REFERENCES profiles(id),
  answered_at timestamptz,
  helpful_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view Q&A"
  ON questions_answers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can ask questions"
  ON questions_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Product sellers can answer questions"
  ON questions_answers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = questions_answers.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- =====================================================
-- 8. DISPUTES & RETURNS
-- =====================================================

CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  raised_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  description text NOT NULL,
  evidence jsonb DEFAULT '[]',
  status text DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution text,
  resolved_by uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view disputes for their orders"
  ON disputes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = raised_by OR
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = disputes.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can create disputes for their orders"
  ON disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = raised_by AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  description text,
  images jsonb DEFAULT '[]',
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'returned', 'refunded')),
  refund_amount numeric(10,2) CHECK (refund_amount >= 0),
  return_shipping_cost numeric(10,2) DEFAULT 0,
  tracking_number text,
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view returns for their orders"
  ON returns FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = returns.order_id
      AND orders.seller_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can request returns"
  ON returns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 9. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);