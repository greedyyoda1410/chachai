-- Simple fix for RLS infinite recursion
-- This version uses a simpler approach that won't cause recursion

-- First, drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view other admins" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

-- Drop the problematic admin check policies
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can manage add-ons" ON add_ons;
DROP POLICY IF EXISTS "Admins can manage promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can manage promotion items" ON promotion_items;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage content assets" ON content_assets;
DROP POLICY IF EXISTS "Admins can manage delivery zones" ON delivery_zones;
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
DROP POLICY IF EXISTS "Admins can view report metrics" ON report_metrics;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS has_admin_role(UUID, TEXT);
DROP FUNCTION IF EXISTS has_admin_or_super_role(UUID);

-- Temporarily disable RLS on admins table for the functions to work
-- Create SECURITY DEFINER functions that bypass RLS entirely
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with elevated privileges and bypasses RLS
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = user_id
    AND admins.is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION has_admin_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = user_id
    AND admins.is_active = true
    AND admins.role = required_role::TEXT
  );
END;
$$;

CREATE OR REPLACE FUNCTION has_admin_or_super_role(user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = user_id
    AND admins.is_active = true
    AND admins.role IN ('super_admin', 'admin')
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION has_admin_role(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION has_admin_or_super_role(UUID) TO anon, authenticated;

-- Recreate admins policies using the functions
CREATE POLICY "Admins can view other admins" ON admins
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (has_admin_role(auth.uid(), 'super_admin'));

-- Recreate other admin policies
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can manage add-ons" ON add_ons
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can manage promotions" ON promotions
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can manage promotion items" ON promotion_items
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage content assets" ON content_assets
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can manage delivery zones" ON delivery_zones
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can view report metrics" ON report_metrics
  FOR SELECT USING (has_admin_or_super_role(auth.uid()));

