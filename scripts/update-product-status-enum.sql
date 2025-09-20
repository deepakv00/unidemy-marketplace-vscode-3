-- Update the product_status enum to include inventory management statuses
-- First, add the new enum values
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'in_stock';
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'on_hold';
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'out_of_stock';

-- Update existing 'active' products to 'in_stock' as default
UPDATE public.products 
SET status = 'in_stock' 
WHERE status = 'active';

-- Update RLS policies to show both 'in_stock' and 'on_hold' products to public
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Anyone can view available products" ON public.products
  FOR SELECT USING (status IN ('in_stock', 'on_hold'));

-- Add index for better performance on status filtering
CREATE INDEX IF NOT EXISTS idx_products_status_visibility ON public.products(status) 
WHERE status IN ('in_stock', 'on_hold', 'out_of_stock');

-- Add a function to automatically update product status based on quantity
CREATE OR REPLACE FUNCTION update_product_status_on_quantity_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If quantity becomes 0, set status to out_of_stock (unless it's draft or sold)
  IF NEW.quantity = 0 AND OLD.status IN ('in_stock', 'on_hold') THEN
    NEW.status = 'out_of_stock';
  -- If quantity becomes > 0 and status was out_of_stock, set to in_stock
  ELSIF NEW.quantity > 0 AND OLD.status = 'out_of_stock' THEN
    NEW.status = 'in_stock';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
DROP TRIGGER IF EXISTS trigger_update_product_status_on_quantity ON public.products;
CREATE TRIGGER trigger_update_product_status_on_quantity
  BEFORE UPDATE OF quantity ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_status_on_quantity_change();
