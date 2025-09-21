-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE product_status AS ENUM ('active', 'sold', 'draft');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  location TEXT,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating DECIMAL(2,1) DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
  verified BOOLEAN DEFAULT FALSE,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  location TEXT NOT NULL,
  time_ago TEXT DEFAULT 'Just now',
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  status product_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, seller_id, product_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Cart items table
CREATE TABLE public.cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_location ON public.products(location);
CREATE INDEX idx_users_location ON public.users(location);
CREATE INDEX idx_products_price ON public.products(price);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON public.conversations(seller_id);
CREATE INDEX idx_conversations_product_id ON public.conversations(product_id);

CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON public.wishlist(product_id);

CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for products table
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own products" ON public.products
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for conversations table
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages they received" ON public.messages
  FOR UPDATE USING (
    auth.uid() = receiver_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- RLS Policies for wishlist table
CREATE POLICY "Users can view own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for cart_items table
CREATE POLICY "Users can view own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name, slug, icon, color, description) VALUES
('Electronics', 'electronics', 'Smartphone', 'from-blue-500 to-cyan-500', 'Phones, laptops, gadgets and electronic devices'),
('Vehicles', 'vehicles', 'Car', 'from-red-500 to-pink-500', 'Cars, motorcycles, bicycles and transportation'),
('Home & Garden', 'home-garden', 'Home', 'from-green-500 to-emerald-500', 'Furniture, appliances, home decor and garden items'),
('Fashion', 'fashion', 'Shirt', 'from-purple-500 to-violet-500', 'Clothing, shoes, accessories and fashion items'),
('Gaming', 'gaming', 'Gamepad2', 'from-orange-500 to-yellow-500', 'Gaming consoles, games, accessories and equipment'),
('Books', 'books', 'Book', 'from-indigo-500 to-blue-500', 'Books, magazines, educational materials and literature'),
('Sports', 'sports', 'Dumbbell', 'from-teal-500 to-green-500', 'Sports equipment, fitness gear and outdoor activities'),
('Baby & Kids', 'baby-kids', 'Baby', 'from-pink-500 to-rose-500', 'Baby gear, toys, children clothing and accessories'),
('Donate/Giveaway', 'donate-giveaway', 'Heart', 'from-emerald-500 to-green-500', 'Free items for donation and community giveaways'),
('Moving Out', 'moving-out', 'Truck', 'from-red-500 to-orange-500', 'Urgent sales for people moving out quickly');

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
