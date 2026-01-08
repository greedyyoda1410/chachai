-- Emergency fix for RLS causing 500 errors
-- This ensures public read policies work correctly

-- First, let's verify and fix the categories SELECT policy
-- Drop and recreate it to ensure it's correct
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT 
  USING (is_active = true);

-- Ensure the policy allows anonymous access
-- The policy above should work, but let's also check menu items
DROP POLICY IF EXISTS "Menu items for sale are viewable by everyone" ON menu_items;
CREATE POLICY "Menu items for sale are viewable by everyone" ON menu_items
  FOR SELECT 
  USING (is_for_sale = true AND is_available = true);

-- Fix add-ons policy
DROP POLICY IF EXISTS "Add-ons are viewable by everyone" ON add_ons;
CREATE POLICY "Add-ons are viewable by everyone" ON add_ons
  FOR SELECT 
  USING (is_active = true);

-- Fix promotions policy
DROP POLICY IF EXISTS "Active promotions are viewable by everyone" ON promotions;
CREATE POLICY "Active promotions are viewable by everyone" ON promotions
  FOR SELECT 
  USING (
    is_for_sale = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
  );

-- Now fix the admin policies with proper SECURITY DEFINER functions
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS has_admin_role(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS has_admin_or_super_role(UUID) CASCADE;

-- Create functions with explicit search_path to avoid issues
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Query admins table directly (bypasses RLS due to SECURITY DEFINER)
  RETURN EXISTS (
    SELECT 1 
    FROM public.admins
    WHERE id = user_id
    AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION has_admin_or_super_role(user_id UUID)
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admins
    WHERE id = user_id
    AND is_active = true
    AND role IN ('super_admin', 'admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION has_admin_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admins
    WHERE id = user_id
    AND is_active = true
    AND role = required_role
  );
END;
$$;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION has_admin_or_super_role(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION has_admin_role(UUID, TEXT) TO anon, authenticated;

-- Recreate admin management policies (these only apply to INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL 
  USING (has_admin_or_super_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;
CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL 
  USING (has_admin_or_super_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage add-ons" ON add_ons;
CREATE POLICY "Admins can manage add-ons" ON add_ons
  FOR ALL 
  USING (has_admin_or_super_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage promotions" ON promotions;
CREATE POLICY "Admins can manage promotions" ON promotions
  FOR ALL 
  USING (has_admin_or_super_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage promotion items" ON promotion_items;
CREATE POLICY "Admins can manage promotion items" ON promotion_items
  FOR ALL 
  USING (has_admin_or_super_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE 
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage content assets" ON content_assets;
CREATE POLICY "Admins can manage content assets" ON content_assets
  FOR ALL 
  USING (has_admin_or_super_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage delivery zones" ON delivery_zones;
CREATE POLICY "Admins can manage delivery zones" ON delivery_zones
  FOR ALL 
  USING (has_admin_or_super_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL 
  USING (has_admin_or_super_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can view report metrics" ON report_metrics;
CREATE POLICY "Admins can view report metrics" ON report_metrics
  FOR SELECT 
  USING (has_admin_or_super_role(auth.uid()));

-- Fix admins table policies (these need to not cause recursion)
DROP POLICY IF EXISTS "Admins can view other admins" ON admins;
-- Allow admins to view other admins, but use the function to check
CREATE POLICY "Admins can view other admins" ON admins
  FOR SELECT 
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL 
  USING (has_admin_role(auth.uid(), 'super_admin'));

