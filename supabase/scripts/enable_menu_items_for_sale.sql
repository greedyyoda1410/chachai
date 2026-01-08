-- Enable all menu items for sale so they appear in the customer menu
-- This updates all existing menu items to be available for sale

UPDATE menu_items 
SET is_for_sale = true
WHERE is_for_sale = false;

-- Verify the update
SELECT COUNT(*) as total_items, 
       SUM(CASE WHEN is_for_sale = true THEN 1 ELSE 0 END) as for_sale_count
FROM menu_items;

