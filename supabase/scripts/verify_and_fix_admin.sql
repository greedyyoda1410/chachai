-- Verify and Fix Admin Account
-- This script helps you check existing auth users and add them to admins table

-- 1. First, let's see all auth users (this shows users in Supabase Auth)
-- Note: You may need to check the Supabase Dashboard > Authentication > Users
-- to see the actual users and their UUIDs

-- 2. Check current admins table
SELECT * FROM admins;

-- 3. To add an admin, you need:
--    a) The UUID of the user from auth.users table
--    b) Run the INSERT statement below with that UUID

-- Example: Add admin (REPLACE THE VALUES)
-- First, get the user UUID from Supabase Dashboard > Authentication > Users
-- Then run:

/*
INSERT INTO admins (id, email, full_name, role, is_active)
VALUES (
  'USER_UUID_FROM_AUTH_USERS',  -- Get this from Auth > Users > User ID
  'admin@chachai.com',           -- Your admin email
  'Admin User',                  -- Admin name
  'super_admin',                 -- Role
  true
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
*/

-- 4. Verify the admin was added
-- SELECT * FROM admins WHERE is_active = true;

