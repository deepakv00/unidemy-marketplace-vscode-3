-- Location-based marketplace updates
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Add location indexes for better performance (if not already added)
CREATE INDEX IF NOT EXISTS idx_products_location ON public.products(location);
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(location);

-- 2. Add the missing UPDATE policy for messages (required for notifications to work)
-- First drop the policy if it exists, then create it
DROP POLICY IF EXISTS "Users can update messages they received" ON public.messages;
CREATE POLICY "Users can update messages they received" ON public.messages
  FOR UPDATE USING (
    auth.uid() = receiver_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- 3. Optional: Add a function to calculate distance between coordinates
-- This can be used for more advanced location-based features
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN 6371 * acos(
    cos(radians(lat1)) * 
    cos(radians(lat2)) * 
    cos(radians(lon2) - radians(lon1)) + 
    sin(radians(lat1)) * 
    sin(radians(lat2))
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Optional: Add a view for nearby products (requires coordinates in products table)
-- This is for future enhancement if you want to add lat/lng coordinates to products
/*
CREATE VIEW nearby_products AS
SELECT 
  p.*,
  u.name as seller_name,
  u.rating as seller_rating,
  u.verified as seller_verified,
  u.avatar as seller_avatar
FROM products p
JOIN users u ON p.seller_id = u.id
WHERE p.status = 'active';
*/

-- 5. Grant necessary permissions
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- 6. Optional: Create a function to get products by city
CREATE OR REPLACE FUNCTION get_products_by_city(city_name TEXT)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  description TEXT,
  price DECIMAL(10,2),
  location TEXT,
  seller_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.location,
    p.seller_id,
    p.created_at
  FROM products p
  WHERE p.status = 'active'
    AND p.location ILIKE '%' || city_name || '%'
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_products_by_city(TEXT) TO authenticated;

-- 8. Optional: Create a trigger to automatically update the time_ago field
CREATE OR REPLACE FUNCTION update_time_ago()
RETURNS TRIGGER AS $$
BEGIN
  NEW.time_ago = EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600;
  IF NEW.time_ago < 1 THEN
    NEW.time_ago = 'Just now';
  ELSIF NEW.time_ago < 24 THEN
    NEW.time_ago = ROUND(NEW.time_ago) || ' hours ago';
  ELSE
    NEW.time_ago = ROUND(NEW.time_ago / 24) || ' days ago';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Optional: Create trigger for products table
-- DROP TRIGGER IF EXISTS update_products_time_ago ON products;
-- CREATE TRIGGER update_products_time_ago
--   BEFORE INSERT OR UPDATE ON products
--   FOR EACH ROW
--   EXECUTE FUNCTION update_time_ago();

-- Success message
SELECT 'Location-based marketplace setup completed successfully!' as message;
