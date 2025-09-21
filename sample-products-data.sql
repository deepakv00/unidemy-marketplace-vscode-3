-- Sample products data for testing location-based search
-- Run this in your Supabase SQL Editor after setting up the database

-- First, let's add some sample users (you can skip this if you already have users)
INSERT INTO public.users (id, email, name, location, verified, rating)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'seller1@example.com', 'John Smith', 'Mumbai, Maharashtra, India', true, 4.8),
  ('22222222-2222-2222-2222-222222222222', 'seller2@example.com', 'Sarah Johnson', 'Delhi, Delhi, India', true, 4.9),
  ('33333333-3333-3333-3333-333333333333', 'seller3@example.com', 'Mike Davis', 'Bangalore, Karnataka, India', false, 4.5),
  ('44444444-4444-4444-4444-444444444444', 'seller4@example.com', 'Lisa Chen', 'Chennai, Tamil Nadu, India', true, 4.7),
  ('55555555-5555-5555-5555-555555555555', 'seller5@example.com', 'Raj Patel', 'Pune, Maharashtra, India', false, 4.6)
ON CONFLICT (id) DO NOTHING;

-- Add sample products with different locations
INSERT INTO public.products (
  title, 
  description, 
  price, 
  original_price, 
  category, 
  condition, 
  location, 
  seller_id, 
  images, 
  specifications, 
  status
) VALUES 
  -- Mumbai products
  ('iPhone 15 Pro Max - Like New', 'Excellent condition iPhone 15 Pro Max with original box and accessories. Barely used, perfect for tech enthusiasts.', 89999, 99999, 'electronics', 'Like New', 'Mumbai, Maharashtra, India', '11111111-1111-1111-1111-111111111111', '{"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"}', '{"Brand": "Apple", "Model": "iPhone 15 Pro Max", "Storage": "256GB", "Color": "Titanium Blue"}', 'active'),
  
  ('MacBook Pro 16" M3 - Barely Used', 'Powerful MacBook Pro with M3 chip, perfect for developers and designers. Includes original charger and box.', 185000, 199000, 'electronics', 'Like New', 'Mumbai, Maharashtra, India', '11111111-1111-1111-1111-111111111111', '{"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"}', '{"Brand": "Apple", "Model": "MacBook Pro 16-inch", "Processor": "M3", "RAM": "16GB", "Storage": "512GB SSD"}', 'active'),
  
  ('Samsung Galaxy S24 Ultra', 'Latest Samsung flagship phone with S Pen, excellent camera quality. Perfect condition with all accessories.', 85000, 95000, 'electronics', 'Like New', 'Mumbai, Maharashtra, India', '11111111-1111-1111-1111-111111111111', '{"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"}', '{"Brand": "Samsung", "Model": "Galaxy S24 Ultra", "Storage": "256GB", "Color": "Titanium Black"}', 'active'),

  -- Delhi products
  ('2019 Honda Civic - Excellent Condition', 'Well-maintained Honda Civic with low mileage and full service history. Perfect for daily commute.', 850000, 900000, 'vehicles', 'Excellent', 'Delhi, Delhi, India', '22222222-2222-2222-2222-222222222222', '{"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400", "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400"}', '{"Make": "Honda", "Model": "Civic", "Year": "2019", "Mileage": "45,000 km", "Fuel": "Petrol"}', 'active'),
  
  ('Sony PlayStation 5', 'Brand new PS5 console with DualSense controller. Still in original packaging with warranty.', 55000, 60000, 'electronics', 'New', 'Delhi, Delhi, India', '22222222-2222-2222-2222-222222222222', '{"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400"}', '{"Brand": "Sony", "Model": "PlayStation 5", "Storage": "825GB SSD", "Controller": "DualSense Included"}', 'active'),
  
  ('Modern Sofa Set - 3 Piece', 'Comfortable 3-piece sofa set in excellent condition. Perfect for living room. Dark gray color.', 45000, 60000, 'home-garden', 'Good', 'Delhi, Delhi, India', '22222222-2222-2222-2222-222222222222', '{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"}', '{"Material": "Fabric", "Color": "Dark Gray", "Pieces": "3", "Condition": "Good"}', 'active'),

  -- Bangalore products
  ('Dell XPS 13 Laptop', 'Ultra-thin laptop with excellent performance. Perfect for students and professionals. Lightweight and portable.', 75000, 85000, 'electronics', 'Very Good', 'Bangalore, Karnataka, India', '33333333-3333-3333-3333-333333333333', '{"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"}', '{"Brand": "Dell", "Model": "XPS 13", "Processor": "Intel i7", "RAM": "16GB", "Storage": "512GB SSD"}', 'active'),
  
  ('Canon EOS R6 Camera', 'Professional mirrorless camera with 24-70mm lens. Perfect for photography enthusiasts and professionals.', 180000, 200000, 'electronics', 'Excellent', 'Bangalore, Karnataka, India', '33333333-3333-3333-3333-333333333333', '{"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400", "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400"}', '{"Brand": "Canon", "Model": "EOS R6", "Lens": "24-70mm f/2.8", "Condition": "Excellent"}', 'active'),
  
  ('Office Chair - Ergonomic', 'High-quality ergonomic office chair with lumbar support. Perfect for home office or gaming setup.', 12000, 15000, 'home-garden', 'Good', 'Bangalore, Karnataka, India', '33333333-3333-3333-3333-333333333333', '{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"}', '{"Type": "Ergonomic Office Chair", "Color": "Black", "Features": "Lumbar Support, Adjustable Height"}', 'active'),

  -- Chennai products
  ('Yamaha FZ V3 Motorcycle', 'Well-maintained motorcycle with low mileage. Perfect for city commute. Recent service done.', 120000, 135000, 'vehicles', 'Very Good', 'Chennai, Tamil Nadu, India', '44444444-4444-4444-4444-444444444444', '{"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400"}', '{"Make": "Yamaha", "Model": "FZ V3", "Year": "2022", "Mileage": "8,000 km", "Fuel": "Petrol"}', 'active'),
  
  ('Gaming PC Setup', 'High-performance gaming PC with RTX 3070, 16GB RAM, and 1TB SSD. Ready to play latest games.', 85000, 95000, 'electronics', 'Excellent', 'Chennai, Tamil Nadu, India', '44444444-4444-4444-4444-444444444444', '{"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"}', '{"GPU": "RTX 3070", "RAM": "16GB DDR4", "Storage": "1TB SSD", "CPU": "Intel i5-12400F"}', 'active'),
  
  ('Dining Table Set - 6 Seater', 'Beautiful wooden dining table with 6 chairs. Perfect for family dining. Excellent condition.', 25000, 30000, 'home-garden', 'Very Good', 'Chennai, Tamil Nadu, India', '44444444-4444-4444-4444-444444444444', '{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"}', '{"Material": "Wood", "Seating": "6 People", "Color": "Brown", "Condition": "Very Good"}', 'active'),

  -- Pune products
  ('Nikon D750 DSLR Camera', 'Professional DSLR camera with 50mm lens. Perfect for portrait and landscape photography.', 95000, 110000, 'electronics', 'Excellent', 'Pune, Maharashtra, India', '55555555-5555-5555-5555-555555555555', '{"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400"}', '{"Brand": "Nikon", "Model": "D750", "Lens": "50mm f/1.8", "Condition": "Excellent"}', 'active'),
  
  ('Royal Enfield Classic 350', 'Beautiful Classic 350 in excellent condition. Well-maintained with all service records.', 180000, 195000, 'vehicles', 'Very Good', 'Pune, Maharashtra, India', '55555555-5555-5555-5555-555555555555', '{"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"}', '{"Make": "Royal Enfield", "Model": "Classic 350", "Year": "2021", "Mileage": "12,000 km", "Fuel": "Petrol"}', 'active'),
  
  ('Study Table with Bookshelf', 'Compact study table with built-in bookshelf. Perfect for students and small apartments.', 8000, 10000, 'home-garden', 'Good', 'Pune, Maharashtra, India', '55555555-5555-5555-5555-555555555555', '{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"}', '{"Type": "Study Table with Bookshelf", "Material": "Wood", "Color": "White", "Condition": "Good"}', 'active'),

  -- Some donate/giveaway items
  ('Books - Various Genres', 'Collection of books including fiction, non-fiction, and academic books. Perfect for book lovers.', 0, 0, 'books', 'Good', 'Mumbai, Maharashtra, India', '11111111-1111-1111-1111-111111111111', '{"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"}', '{"Type": "Book Collection", "Genres": "Fiction, Non-fiction, Academic", "Condition": "Good"}', 'active'),
  
  ('Old Furniture - Free Pickup', 'Old wooden furniture pieces. Free for pickup. Perfect for DIY projects or renovation.', 0, 0, 'home-garden', 'Fair', 'Delhi, Delhi, India', '22222222-2222-2222-2222-222222222222', '{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"}', '{"Type": "Old Furniture", "Material": "Wood", "Condition": "Fair", "Note": "Free Pickup"}', 'active');

-- Success message
SELECT 'Sample products added successfully! You can now test location-based search.' as message;

