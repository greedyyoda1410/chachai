-- Fix orders INSERT policy to allow anonymous users to create orders
-- This ensures the "Anyone can create orders" policy works correctly

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Recreate the INSERT policy that allows anyone to create orders
-- This is needed for anonymous customers to place orders
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Also ensure order_items can be inserted by anyone when creating orders
-- Drop existing policy
DROP POLICY IF EXISTS "Order items follow order policies" ON order_items;

-- Create separate policies for SELECT/UPDATE and INSERT
-- INSERT: Allow anyone to insert order items (when creating orders)
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT 
  WITH CHECK (true);

-- SELECT/UPDATE: Only allow viewing/updating items for orders they can access
CREATE POLICY "Order items follow order policies for read" ON order_items
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_phone = COALESCE((SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid()), '')
        OR is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Order items follow order policies for update" ON order_items
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND is_admin(auth.uid())
    )
  );

