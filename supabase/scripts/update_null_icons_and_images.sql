-- Update NULL icon_url values in categories table with appropriate emojis
-- Based on category name_en
-- This matches the getCategoryIcon function in HomeScreen.tsx

UPDATE categories
SET icon_url = CASE
  WHEN LOWER(name_en) = 'breakfast' OR LOWER(name_en) LIKE '%breakfast%' THEN '🍳'
  WHEN LOWER(name_en) = 'tea' OR LOWER(name_en) LIKE '%tea%' OR LOWER(name_en) LIKE '%chai%' THEN '🍵'
  WHEN LOWER(name_en) = 'coffee' OR LOWER(name_en) LIKE '%coffee%' THEN '☕'
  WHEN LOWER(name_en) LIKE '%snack%' OR LOWER(name_en) LIKE '%samosa%' OR LOWER(name_en) LIKE '%pakora%' OR LOWER(name_en) LIKE '%fried%' THEN '🥟'
  WHEN LOWER(name_en) = 'rolls' OR LOWER(name_en) LIKE '%roll%' THEN '🌯'
  WHEN LOWER(name_en) LIKE '%fuchka%' OR LOWER(name_en) LIKE '%fuchka%' THEN '🥟'
  WHEN LOWER(name_en) = 'pitha' OR LOWER(name_en) LIKE '%pitha%' THEN '🥞'
  WHEN LOWER(name_en) = 'juice' OR LOWER(name_en) LIKE '%juice%' THEN '🧃'
  WHEN LOWER(name_en) LIKE '%add%' OR LOWER(name_en) LIKE '%extra%' OR LOWER(name_en) LIKE '%add-on%' THEN '➕'
  ELSE '📦' -- Default fallback
END,
updated_at = NOW()
WHERE icon_url IS NULL OR icon_url = '' OR TRIM(icon_url) = '';

-- Update NULL image_url values in menu_items table with placeholder emoji
-- Using a simple emoji that can be displayed as text
-- Note: This is a temporary placeholder. Real images should be uploaded via Supabase Storage
UPDATE menu_items
SET image_url = '🍽️',
    updated_at = NOW()
WHERE image_url IS NULL OR image_url = '' OR TRIM(image_url) = '';

-- Verify the updates
SELECT 
  'Categories updated' as table_name,
  COUNT(*) as null_icons_remaining
FROM categories
WHERE icon_url IS NULL OR icon_url = ''

UNION ALL

SELECT 
  'Menu items updated' as table_name,
  COUNT(*) as null_images_remaining
FROM menu_items
WHERE image_url IS NULL OR image_url = '';

