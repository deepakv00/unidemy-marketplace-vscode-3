-- Update the product_status enum to include inventory status options
-- First, add the new enum values
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'in_stock';
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'on_hold';
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'out_of_stock';

-- Update existing products to use the new status system
-- Convert 'active' products to 'in_stock'
UPDATE products SET status = 'in_stock' WHERE status = 'active';

-- Update RLS policies to show both in_stock and on_hold products to public
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Anyone can view available products" ON public.products
  FOR SELECT USING (status IN ('in_stock', 'on_hold'));

-- Add quantity column if it doesn't exist (for inventory management)
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 CHECK (quantity >= 0);

-- Add views column if it doesn't exist (for tracking product views)
ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create function to automatically update status based on quantity
CREATE OR REPLACE FUNCTION update_product_status_on_quantity_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If quantity becomes 0, set status to out_of_stock (unless it's already sold or draft)
  IF NEW.quantity = 0 AND OLD.quantity > 0 AND NEW.status NOT IN ('sold', 'draft') THEN
    NEW.status = 'out_of_stock';
  -- If quantity becomes > 0 and status was out_of_stock, set to in_stock
  ELSIF NEW.quantity > 0 AND OLD.quantity = 0 AND NEW.status = 'out_of_stock' THEN
    NEW.status = 'in_stock';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
DROP TRIGGER IF EXISTS trigger_update_product_status_on_quantity_change ON products;
CREATE TRIGGER trigger_update_product_status_on_quantity_change
  BEFORE UPDATE OF quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_status_on_quantity_change();
