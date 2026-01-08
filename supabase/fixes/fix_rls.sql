-- Fix infinite recursion in RLS policies
-- This script fixes the admins table policy that causes infinite recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view other admins" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
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

-- Create a function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = user_id
    AND admins.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has admin role
CREATE OR REPLACE FUNCTION has_admin_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = user_id
    AND admins.is_active = true
    AND admins.role = required_role::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has admin or super_admin role
CREATE OR REPLACE FUNCTION has_admin_or_super_role(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = user_id
    AND admins.is_active = true
    AND admins.role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies using the functions (no recursion!)
-- Admins table policies
CREATE POLICY "Admins can view other admins" ON admins
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (has_admin_role(auth.uid(), 'super_admin'));

-- Categories policies
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

-- Menu items policies
CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

-- Add-ons policies
CREATE POLICY "Admins can manage add-ons" ON add_ons
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

-- Promotions policies
CREATE POLICY "Admins can manage promotions" ON promotions
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

-- Promotion items policies
CREATE POLICY "Admins can manage promotion items" ON promotion_items
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

-- Orders policies
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    is_admin(auth.uid())
  );

-- Content assets policies
CREATE POLICY "Admins can manage content assets" ON content_assets
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

-- Delivery zones policies
CREATE POLICY "Admins can manage delivery zones" ON delivery_zones
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

-- Reports policies
CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (has_admin_or_super_role(auth.uid()));

CREATE POLICY "Admins can view report metrics" ON report_metrics
  FOR SELECT USING (has_admin_or_super_role(auth.uid()));

