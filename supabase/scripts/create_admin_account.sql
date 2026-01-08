-- Create Admin Account
-- This script helps you create an admin account
-- 
-- INSTRUCTIONS:
-- 1. First, create a user in Supabase Auth Dashboard:
--    - Go to Authentication > Users
--    - Click "Add user" > "Create new user"
--    - Enter email and password
--    - Copy the User ID (UUID) that gets created
--
-- 2. Then run this SQL with the user ID and details:
--
-- Example:
-- INSERT INTO admins (id, email, full_name, role, is_active)
-- VALUES (
--   'YOUR_USER_UUID_HERE',  -- Replace with the UUID from step 1
--   'admin@chachai.com',     -- Replace with admin email
--   'Admin User',            -- Replace with admin name
--   'super_admin',           -- Options: 'super_admin', 'admin', or 'staff'
--   true
-- );

-- TEMPLATE (uncomment and fill in your details):
/*
INSERT INTO admins (id, email, full_name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- REPLACE: User UUID from Supabase Auth
  'admin@example.com',                      -- REPLACE: Admin email
  'Admin User',                             -- REPLACE: Admin full name
  'super_admin',                            -- 'super_admin', 'admin', or 'staff'
  true
);
*/

-- To verify admin was created:
-- SELECT * FROM admins;

