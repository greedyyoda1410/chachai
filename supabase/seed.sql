-- Cha Chai Ordering System - Seed Data
-- This file seeds the database with initial categories, menu items, and add-ons from Current Menu.csv

-- ============================================================================
-- CATEGORIES
-- ============================================================================
-- Generate deterministic UUIDs for categories using gen_random_uuid() with seed values
-- We'll use DO block to generate and store UUIDs

DO $$
DECLARE
  cat_breakfast_id UUID := gen_random_uuid();
  cat_tea_id UUID := gen_random_uuid();
  cat_coffee_id UUID := gen_random_uuid();
  cat_fried_snacks_id UUID := gen_random_uuid();
  cat_rolls_id UUID := gen_random_uuid();
  cat_fuchka_id UUID := gen_random_uuid();
  cat_pitha_id UUID := gen_random_uuid();
  cat_juice_id UUID := gen_random_uuid();
  cat_addons_id UUID := gen_random_uuid();
BEGIN
  -- Insert categories with generated UUIDs
  INSERT INTO categories (id, name_en, name_bn, icon_url, display_order, is_active) VALUES
  (cat_breakfast_id, 'Breakfast', 'নাস্তা', NULL, 1, true),
  (cat_tea_id, 'Tea', 'চা', NULL, 2, true),
  (cat_coffee_id, 'Coffee', 'কফি', NULL, 3, true),
  (cat_fried_snacks_id, 'Fried Snacks', 'ভাজা স্ন্যাকস', NULL, 4, true),
  (cat_rolls_id, 'Rolls', 'রোল', NULL, 5, true),
  (cat_fuchka_id, 'Fuchka', 'ফুচকা', NULL, 6, true),
  (cat_pitha_id, 'Pitha', 'পিঠা', NULL, 7, true),
  (cat_juice_id, 'Juice', 'জুস', NULL, 8, true),
  (cat_addons_id, 'Add-Ons', 'এক্সট্রা', NULL, 9, true);

  -- ============================================================================
  -- MENU ITEMS
  -- ============================================================================

  -- Breakfast Items
  INSERT INTO menu_items (category_id, name_en, name_bn, description_en, description_bn, price, takeaway_price, prep_time_minutes, is_for_sale, is_available, allow_pickup, allow_delivery) VALUES
  (cat_breakfast_id, '2 Pcs Paratha + 1 Egg Bhaji + 1 Cup Milk Tea', '২ পিস পরোটা + ১ ডিম ভাজি + ১ কাপ দুধ চা', 'Traditional breakfast combo', 'ঐতিহ্যবাহী নাস্তা কম্বো', 120, 120, 15, false, true, true, true),
  (cat_breakfast_id, '2 Pcs Paratha + 1 Egg Bhaji + Dal + 1 Cup Milk Tea', '২ পিস পরোটা + ১ ডিম ভাজি + ডাল + ১ কাপ দুধ চা', 'Breakfast combo with dal', 'ডাল সহ নাস্তা কম্বো', 140, 140, 15, false, true, true, true),
  (cat_breakfast_id, '2 Pcs Paratha + 1 Egg Bhaji + Mixed Veg + Milk Tea', '২ পিস পরোটা + ১ ডিম ভাজি + মিক্সড সবজি + দুধ চা', 'Breakfast combo with mixed vegetables', 'মিক্সড সবজি সহ নাস্তা কম্বো', 150, 150, 15, false, true, true, true),
  (cat_breakfast_id, '2 Pcs Paratha + 1 Egg Bhaji + Dal + Veg + Milk Tea', '২ পিস পরোটা + ১ ডিম ভাজি + ডাল + সবজি + দুধ চা', 'Complete breakfast combo', 'সম্পূর্ণ নাস্তা কম্বো', 160, 160, 15, false, true, true, true);

  -- Tea Items
  INSERT INTO menu_items (category_id, name_en, name_bn, description_en, description_bn, price, takeaway_price, prep_time_minutes, is_for_sale, is_available, allow_pickup, allow_delivery) VALUES
  (cat_tea_id, 'Rong Cha', 'রং চা', 'Colored tea', 'রং চা', 25, 25, 5, false, true, true, true),
  (cat_tea_id, 'Lemon Cha', 'লেবু চা', 'Lemon tea', 'লেবু চা', 25, 25, 5, false, true, true, true),
  (cat_tea_id, 'Ada Cha', 'আদা চা', 'Ginger tea', 'আদা চা', 25, 25, 5, false, true, true, true),
  (cat_tea_id, 'Tetul Cha', 'তেঁতুল চা', 'Tamarind tea', 'তেঁতুল চা', 25, 25, 5, false, true, true, true),
  (cat_tea_id, 'Herbal Cha', 'হারবাল চা', 'Herbal tea', 'হারবাল চা', 50, 50, 5, false, true, true, true),
  (cat_tea_id, 'Dudh Cha', 'দুধ চা', 'Milk tea', 'দুধ চা', 45, 45, 5, false, true, true, true),
  (cat_tea_id, 'Special Dudh Cha', 'স্পেশাল দুধ চা', 'Special milk tea', 'স্পেশাল দুধ চা', 55, 55, 5, false, true, true, true),
  (cat_tea_id, 'Masala Cha', 'মসলা চা', 'Spiced tea', 'মসলা চা', 55, 55, 5, false, true, true, true),
  (cat_tea_id, 'Malai Cha', 'মালাই চা', 'Cream tea', 'মালাই চা', 65, 65, 5, false, true, true, true),
  (cat_tea_id, 'Tandoori Cha', 'তন্দুরি চা', 'Tandoori tea', 'তন্দুরি চা', 65, 65, 5, false, true, true, true),
  (cat_tea_id, 'Badam Cha', 'বাদাম চা', 'Almond tea', 'বাদাম চা', 65, 65, 5, false, true, true, true),
  (cat_tea_id, 'Chocolate Cha', 'চকোলেট চা', 'Chocolate tea', 'চকোলেট চা', 60, 60, 5, false, true, true, true),
  (cat_tea_id, 'Maltova Cha', 'মালটোভা চা', 'Maltova tea', 'মালটোভা চা', 60, 60, 5, false, true, true, true);

  -- Coffee
  INSERT INTO menu_items (category_id, name_en, name_bn, description_en, description_bn, price, takeaway_price, prep_time_minutes, is_for_sale, is_available, allow_pickup, allow_delivery) VALUES
  (cat_coffee_id, 'Bangla Coffee', 'বাংলা কফি', 'Traditional Bengali coffee', 'ঐতিহ্যবাহী বাংলা কফি', 60, 60, 5, false, true, true, true);

  -- Fried Snacks
  INSERT INTO menu_items (category_id, name_en, name_bn, description_en, description_bn, price, takeaway_price, prep_time_minutes, is_for_sale, is_available, allow_pickup, allow_delivery) VALUES
  (cat_fried_snacks_id, 'Vegetable Shingara', 'ভেজিটেবল সমুচা', 'Vegetable samosa - 1 pc', 'ভেজিটেবল সমুচা - ১ পিস', 15, 15, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Vegetable Shingara', 'ভেজিটেবল সমুচা', 'Vegetable samosa - 3 pcs', 'ভেজিটেবল সমুচা - ৩ পিস', 42, 42, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Vegetable Shingara', 'ভেজিটেবল সমুচা', 'Vegetable samosa - 6 pcs', 'ভেজিটেবল সমুচা - ৬ পিস', 85, 85, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Vegetable Shingara', 'ভেজিটেবল সমুচা', 'Vegetable samosa - 12 pcs', 'ভেজিটেবল সমুচা - ১২ পিস', 170, 170, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Vegetable Shingara', 'ভেজিটেবল সমুচা', 'Vegetable samosa - 24 pcs', 'ভেজিটেবল সমুচা - ২৪ পিস', 350, 350, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Kolija Shingara', 'কলিজা সমুচা', 'Liver samosa - 1 pc', 'কলিজা সমুচা - ১ পিস', 20, 20, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Kolija Shingara', 'কলিজা সমুচা', 'Liver samosa - 3 pcs', 'কলিজা সমুচা - ৩ পিস', 57, 57, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Kolija Shingara', 'কলিজা সমুচা', 'Liver samosa - 6 pcs', 'কলিজা সমুচা - ৬ পিস', 110, 110, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Kolija Shingara', 'কলিজা সমুচা', 'Liver samosa - 12 pcs', 'কলিজা সমুচা - ১২ পিস', 220, 220, 10, false, true, true, true),
  (cat_fried_snacks_id, 'Kolija Shingara', 'কলিজা সমুচা', 'Liver samosa - 24 pcs', 'কলিজা সমুচা - ২৪ পিস', 440, 440, 10, false, true, true, true),
  (cat_fried_snacks_id, 'French Fries', 'ফ্রেঞ্চ ফ্রাই', 'Crispy french fries', 'মচমচে ফ্রেঞ্চ ফ্রাই', 125, 125, 10, false, true, true, true),
  (cat_fried_snacks_id, 'BBQ Chicken Wings', 'বিবিকিউ চিকেন উইংস', 'BBQ chicken wings - 3 pcs', 'বিবিকিউ চিকেন উইংস - ৩ পিস', 150, 150, 15, false, true, true, true),
  (cat_fried_snacks_id, 'Loaded Masala Fry', 'লোডেড মসলা ফ্রাই', 'Loaded masala fry', 'লোডেড মসলা ফ্রাই', 160, 160, 15, false, true, true, true);

  -- Rolls
  INSERT INTO menu_items (category_id, name_en, name_bn, description_en, description_bn, price, takeaway_price, prep_time_minutes, is_for_sale, is_available, allow_pickup, allow_delivery) VALUES
  (cat_rolls_id, 'Egg Roll', 'ডিম রোল', 'Classic egg roll', 'ক্লাসিক ডিম রোল', 120, 120, 10, false, true, true, true),
  (cat_rolls_id, 'Paneer Roll', 'পনির রোল', 'Cottage cheese roll', 'পনির রোল', 140, 140, 10, false, true, true, true),
  (cat_rolls_id, 'Egg Paneer Roll', 'ডিম পনির রোল', 'Egg and paneer roll', 'ডিম পনির রোল', 160, 160, 10, false, true, true, true),
  (cat_rolls_id, 'Chicken Roll (Signature)', 'চিকেন রোল (সিগনেচার)', 'Signature chicken roll', 'সিগনেচার চিকেন রোল', 195, 195, 12, false, true, true, true),
  (cat_rolls_id, 'Chicken Roll (Authentic)', 'চিকেন রোল (অথেন্টিক)', 'Authentic chicken roll', 'অথেন্টিক চিকেন রোল', 235, 235, 12, false, true, true, true),
  (cat_rolls_id, 'Egg Chicken Roll', 'ডিম চিকেন রোল', 'Egg and chicken roll', 'ডিম চিকেন রোল', 225, 225, 12, false, true, true, true),
  (cat_rolls_id, 'Chicken Tikka Roll', 'চিকেন টিক্কা রোল', 'Chicken tikka roll', 'চিকেন টিক্কা রোল', 225, 225, 12, false, true, true, true),
  (cat_rolls_id, 'Egg Chicken Tikka Roll', 'ডিম চিকেন টিক্কা রোল', 'Egg and chicken tikka roll', 'ডিম চিকেন টিক্কা রোল', 270, 270, 12, false, true, true, true),
  (cat_rolls_id, 'Beef Roll', 'বিফ রোল', 'Beef roll', 'বিফ রোল', 250, 250, 15, false, true, true, true),
  (cat_rolls_id, 'Egg Beef Roll', 'ডিম বিফ রোল', 'Egg and beef roll', 'ডিম বিফ রোল', 280, 280, 15, false, true, true, true),
  (cat_rolls_id, 'Beef Paneer Roll', 'বিফ পনির রোল', 'Beef and paneer roll', 'বিফ পনির রোল', 270, 270, 15, false, true, true, true),
  (cat_rolls_id, 'Egg Beef Paneer Roll', 'ডিম বিফ পনির রোল', 'Egg, beef and paneer roll', 'ডিম বিফ পনির রোল', 300, 300, 15, false, true, true, true);

  -- Fuchka
  INSERT INTO menu_items (category_id, name_en, name_bn, description_en, description_bn, price, takeaway_price, prep_time_minutes, is_for_sale, is_available, allow_pickup, allow_delivery) VALUES
  (cat_fuchka_id, 'Fuchka Tok Mishti', 'ফুচকা টক মিষ্টি', 'Fuchka with sweet and sour - 8 pcs', 'ফুচকা টক মিষ্টি - ৮ পিস', 110, 125, 10, false, true, true, true),
  (cat_fuchka_id, 'Fuchka Jhal Tok', 'ফুচকা ঝাল টক', 'Spicy and sour fuchka - 8 pcs', 'ফুচকা ঝাল টক - ৮ পিস', 110, 125, 10, false, true, true, true),
  (cat_fuchka_id, 'Doi Fuchka', 'দই ফুচকা', 'Yogurt fuchka - 8 pcs', 'দই ফুচকা - ৮ পিস', 130, 145, 10, false, true, true, true),
  (cat_fuchka_id, 'Chotpoti', 'চটপটি', 'Spicy chotpoti', 'ঝাল চটপটি', 90, 105, 10, false, true, true, true),
  (cat_fuchka_id, 'Jhal-Muri', 'ঝাল-মুড়ি', 'Spicy puffed rice', 'ঝাল-মুড়ি', 50, 65, 5, false, true, true, true),
  (cat_fuchka_id, 'Dim Jhal-Muri', 'ডিম ঝাল-মুড়ি', 'Egg with spicy puffed rice', 'ডিম ঝাল-মুড়ি', 70, 85, 5, false, true, true, true);

  -- Pitha
  INSERT INTO menu_items (category_id, name_en, name_bn, description_en, description_bn, price, takeaway_price, prep_time_minutes, is_for_sale, is_available, allow_pickup, allow_delivery) VALUES
  (cat_pitha_id, 'Chitoi Pitha', 'চিতই পিঠা', 'Traditional rice pancake', 'ঐতিহ্যবাহী চালের প্যানকেক', 40, 40, 10, false, true, true, true),
  (cat_pitha_id, 'Dim Chitoi', 'ডিম চিতই', 'Egg with rice pancake', 'ডিম চিতই', 55, 55, 10, false, true, true, true),
  (cat_pitha_id, 'Vapa Pitha', 'ভাপা পিঠা', 'Steamed rice cake', 'ভাপা পিঠা', 60, 60, 10, false, true, true, true);

  -- Juice
  INSERT INTO menu_items (category_id, name_en, name_bn, description_en, description_bn, price, takeaway_price, prep_time_minutes, is_for_sale, is_available, allow_pickup, allow_delivery) VALUES
  (cat_juice_id, 'Lemon Juice', 'লেবু জুস', 'Fresh lemon juice', 'তাজা লেবু জুস', 70, 70, 5, false, true, true, true),
  (cat_juice_id, 'Jeera Pani', 'জিরা পানি', 'Cumin water', 'জিরা পানি', 70, 70, 5, false, true, true, true),
  (cat_juice_id, 'Lemon Ice Tea', 'লেবু আইস টি', 'Lemon iced tea', 'লেবু আইস টি', 80, 80, 5, false, true, true, true),
  (cat_juice_id, 'Tok Mishti Lassi', 'টক মিষ্টি লassi', 'Sweet and sour lassi', 'টক মিষ্টি লassi', 190, 190, 5, false, true, true, true),
  (cat_juice_id, 'Mint Lemon Juice', 'মিন্ট লেবু জুস', 'Mint lemon juice', 'মিন্ট লেবু জুস', 120, 120, 5, false, true, true, true),
  (cat_juice_id, 'Water (Pani)', 'পানি', 'Water', 'পানি', 20, 20, 1, false, true, true, true);

  -- ============================================================================
  -- ADD-ONS
  -- ============================================================================

  INSERT INTO add_ons (name_en, name_bn, price, group_name_en, group_name_bn, is_active) VALUES
  ('Egg', 'ডিম', 20, 'Roll Add-Ons', 'রোল এক্সট্রা', true),
  ('Paneer', 'পনির', 60, 'Roll Add-Ons', 'রোল এক্সট্রা', true),
  ('Dynamic Chilli', 'ডাইনামিক চিলি', 25, 'Roll Add-Ons', 'রোল এক্সট্রা', true),
  ('Garlic Mayonnaise', 'রসুন মেয়োনিজ', 25, 'Roll Add-Ons', 'রোল এক্সট্রা', true),
  ('Extra Chicken', 'এক্সট্রা চিকেন', 50, 'Roll Add-Ons', 'রোল এক্সট্রা', true),
  ('Extra Beef', 'এক্সট্রা বিফ', 70, 'Roll Add-Ons', 'রোল এক্সট্রা', true),
  ('Malai', 'মালাই', 10, 'Tea Add-Ons', 'চা এক্সট্রা', true),
  ('Nut', 'বাদাম', 10, 'Tea Add-Ons', 'চা এক্সট্রা', true),
  ('Chocolate', 'চকোলেট', 10, 'Tea Add-Ons', 'চা এক্সট্রা', true),
  ('Maltova', 'মালটোভা', 10, 'Tea Add-Ons', 'চা এক্সট্রা', true),
  ('Honey', 'মধু', 10, 'Tea Add-Ons', 'চা এক্সট্রা', true);

  -- Update applicable_to_items for Roll Add-Ons to apply to all rolls
  UPDATE add_ons 
  SET applicable_to_items = (
    SELECT jsonb_agg(id::text)
    FROM menu_items
    WHERE category_id = cat_rolls_id
  )
  WHERE group_name_en = 'Roll Add-Ons';

  -- Update applicable_to_items for Tea Add-Ons to apply to all tea items
  UPDATE add_ons 
  SET applicable_to_items = (
    SELECT jsonb_agg(id::text)
    FROM menu_items
    WHERE category_id = cat_tea_id
  )
  WHERE group_name_en = 'Tea Add-Ons';

END $$;
