-- Fix RLS policy for conversations table to allow both buyers and sellers to create conversations

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Create a new policy that allows both buyers and sellers to create conversations
CREATE POLICY "Users can create conversations as buyer or seller" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Also ensure the SELECT policy covers both cases properly
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );
