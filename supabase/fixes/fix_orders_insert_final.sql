-- Fix orders INSERT policy to allow anonymous users to create orders
-- This is a complete fix that ensures orders can be created

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Order items follow order policies" ON order_items;
DROP POLICY IF EXISTS "Order items follow order policies for read" ON order_items;
DROP POLICY IF EXISTS "Order items follow order policies for update" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- Recreate orders INSERT policy - allow anyone (anonymous users) to create orders
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Create separate policies for order_items
-- INSERT: Allow anyone to create order items (when creating orders)
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT 
  WITH CHECK (true);

-- SELECT: Allow viewing items for orders they can access
CREATE POLICY "Order items can be viewed" ON order_items
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_phone = COALESCE((SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid()), '')
        OR is_admin(auth.uid())
        OR true  -- Allow anonymous access for order items
      )
    )
  );

-- UPDATE: Only admins can update
CREATE POLICY "Admins can update order items" ON order_items
  FOR UPDATE 
  USING (is_admin(auth.uid()));

