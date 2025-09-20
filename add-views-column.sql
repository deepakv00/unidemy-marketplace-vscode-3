-- Add views column to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN views INTEGER DEFAULT 0 NOT NULL;

-- Update existing products to have 0 views initially
UPDATE products SET views = 0 WHERE views IS NULL;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_views ON products(views);

-- Optional: Update existing products with some random view counts for demo
-- You can comment this out if you want all products to start with 0 views
UPDATE products 
SET views = FLOOR(RANDOM() * 500 + 1)::INTEGER 
WHERE views = 0;

-- Create RPC function to increment product views atomically
CREATE OR REPLACE FUNCTION increment_product_views(product_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET views = views + 1 
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
