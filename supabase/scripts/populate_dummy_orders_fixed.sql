-- Populate Dummy Orders for Past Week (FIXED VERSION)
-- This creates realistic dummy orders for testing the admin dashboard

DO $$
DECLARE
  -- Get random category and menu item IDs
  cat_breakfast_id UUID;
  cat_tea_id UUID;
  cat_rolls_id UUID;
  cat_snacks_id UUID;
  
  breakfast_item_id UUID;
  tea_item_id UUID;
  roll_item_id UUID;
  snack_item_id UUID;
  
  -- Order variables
  order_id UUID;
  order_number INTEGER;
  current_date_val DATE := CURRENT_DATE;
  days_ago INTEGER;
  hour_offset INTEGER;
  order_time TIMESTAMP;
  target_order_date DATE;
  status_list TEXT[] := ARRAY['received', 'preparing', 'ready', 'completed', 'completed'];
  status TEXT;
  order_type_list TEXT[] := ARRAY['pickup', 'pickup', 'pickup', 'delivery'];
  order_type TEXT;
  payment_list TEXT[] := ARRAY['pickup', 'pickup', 'online'];
  payment_method TEXT;
  
  -- Customer names
  customer_names TEXT[] := ARRAY[
    'Rahim Ali', 'Fatima Khan', 'Karim Uddin', 'Ayesha Begum', 
    'Mohammad Hassan', 'Jahanara Akter', 'Sajjad Ahmed', 'Nusrat Jahan',
    'Abdul Malek', 'Tasnim Rahman', 'Imran Hossain', 'Sharmin Akter',
    'Mahmud Hasan', 'Roksana Begum', 'Nazmul Islam', 'Shirin Sultana'
  ];
  
  -- Phone numbers
  phone_numbers TEXT[] := ARRAY[
    '01712345678', '01823456789', '01934567890', '01545678901',
    '01656789012', '01767890123', '01878901234', '01989012345',
    '01590123456', '01601234567', '01712345670', '01823456701',
    '01934567812', '01545678923', '01656789034', '01767890145'
  ];
  
  customer_name TEXT;
  customer_phone TEXT;
  customer_email TEXT;
  
  -- Order calculations
  item_quantity INTEGER;
  item_price DECIMAL;
  subtotal DECIMAL;
  vat_amount DECIMAL;
  delivery_fee DECIMAL;
  total DECIMAL;
  prep_time INTEGER;
  
  i INTEGER;
  j INTEGER;
  num_orders INTEGER;
  max_order_num INTEGER;
BEGIN
  -- Get category IDs (assuming they exist)
  SELECT id INTO cat_breakfast_id FROM categories WHERE name_en = 'Breakfast' LIMIT 1;
  SELECT id INTO cat_tea_id FROM categories WHERE name_en = 'Tea' LIMIT 1;
  SELECT id INTO cat_rolls_id FROM categories WHERE name_en = 'Rolls' LIMIT 1;
  SELECT id INTO cat_snacks_id FROM categories WHERE name_en = 'Fried Snacks' LIMIT 1;
  
  -- Get menu item IDs
  SELECT id INTO breakfast_item_id FROM menu_items WHERE category_id = cat_breakfast_id LIMIT 1;
  SELECT id INTO tea_item_id FROM menu_items WHERE category_id = cat_tea_id LIMIT 1;
  SELECT id INTO roll_item_id FROM menu_items WHERE category_id = cat_rolls_id LIMIT 1;
  SELECT id INTO snack_item_id FROM menu_items WHERE category_id = cat_snacks_id LIMIT 1;
  
  -- Generate orders for the past 7 days
  FOR days_ago IN 0..6 LOOP
    target_order_date := current_date_val - days_ago;
    
    -- Get max order number for this date
    SELECT COALESCE(MAX(daily_order_number), 0) INTO max_order_num
    FROM orders
    WHERE orders.order_date = target_order_date;
    
    -- Generate different number of orders per day (more recent days have more orders)
    num_orders := 5 + (6 - days_ago) * 2; -- 5 to 17 orders per day
    
    FOR i IN 1..num_orders LOOP
      max_order_num := max_order_num + 1;
      order_number := max_order_num;
      
      -- Random order time during the day (9 AM to 9 PM)
      hour_offset := 9 + (random() * 12)::INTEGER;
      order_time := (target_order_date + (hour_offset || ' hours')::INTERVAL);
      
      -- Random status (more completed orders for older dates)
      IF days_ago > 3 THEN
        status := 'completed';
      ELSE
        status := status_list[1 + floor(random() * array_length(status_list, 1))::INTEGER];
      END IF;
      
      -- Random order type
      order_type := order_type_list[1 + floor(random() * array_length(order_type_list, 1))::INTEGER];
      
      -- Random payment method
      payment_method := payment_list[1 + floor(random() * array_length(payment_list, 1))::INTEGER];
      
      -- Random customer
      customer_name := customer_names[1 + floor(random() * array_length(customer_names, 1))::INTEGER];
      customer_phone := phone_numbers[1 + floor(random() * array_length(phone_numbers, 1))::INTEGER];
      customer_email := lower(replace(customer_name, ' ', '.')) || '@example.com';
      
      -- Random item selection and pricing
      item_quantity := 1 + floor(random() * 3)::INTEGER;
      item_price := 150.00 + (random() * 200.00); -- Prices between 150-350
      subtotal := item_quantity * item_price;
      vat_amount := subtotal * 0.1;
      delivery_fee := CASE WHEN order_type = 'delivery' THEN 50.00 ELSE 0.00 END;
      total := subtotal + vat_amount + delivery_fee;
      prep_time := 15 + floor(random() * 20)::INTEGER; -- 15-35 minutes
      
      -- Create order
      INSERT INTO orders (
        daily_order_number,
        order_date,
        customer_name,
        customer_phone,
        customer_email,
        order_type,
        status,
        pickup_time,
        delivery_address,
        delivery_fee,
        subtotal,
        vat_amount,
        total,
        payment_method,
        payment_status,
        estimated_prep_time,
        received_at,
        placed_at
      ) VALUES (
        order_number,
        target_order_date,
        customer_name,
        customer_phone,
        customer_email,
        order_type,
        status,
        'ASAP',
        CASE WHEN order_type = 'delivery' THEN 
          jsonb_build_object(
            'street', '123 Main Street',
            'city', 'Dhaka',
            'landmark', 'Near Central Park'
          )
        ELSE NULL END,
        delivery_fee,
        subtotal,
        vat_amount,
        total,
        payment_method,
        CASE WHEN payment_method = 'online' THEN 'paid' ELSE 'pending' END,
        prep_time,
        order_time,
        order_time
      ) RETURNING id INTO order_id;
      
      -- Add status timestamps based on status
      IF status IN ('preparing', 'ready', 'completed') THEN
        UPDATE orders SET preparing_started_at = order_time + INTERVAL '5 minutes' WHERE id = order_id;
      END IF;
      
      IF status IN ('ready', 'completed') THEN
        UPDATE orders SET ready_at = order_time + INTERVAL '15 minutes' WHERE id = order_id;
      END IF;
      
      IF status = 'completed' THEN
        UPDATE orders SET 
          collected_at = order_time + INTERVAL '20 minutes',
          completed_at = order_time + INTERVAL '20 minutes'
        WHERE id = order_id;
      END IF;
      
      -- Add order items (1-3 items per order)
      FOR j IN 1..(1 + floor(random() * 2)::INTEGER) LOOP
        -- Choose random item
        CASE (j % 4)
          WHEN 0 THEN
            INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
            VALUES (order_id, breakfast_item_id, item_quantity, item_price, item_quantity * item_price);
          WHEN 1 THEN
            INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
            VALUES (order_id, tea_item_id, item_quantity, item_price, item_quantity * item_price);
          WHEN 2 THEN
            INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
            VALUES (order_id, roll_item_id, item_quantity, item_price, item_quantity * item_price);
          ELSE
            INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
            VALUES (order_id, snack_item_id, item_quantity, item_price, item_quantity * item_price);
        END CASE;
      END LOOP;
      
      -- Add order status history
      INSERT INTO order_status_history (order_id, status, status_timestamp)
      VALUES (order_id, 'received', order_time);
      
      IF status IN ('preparing', 'ready', 'completed') THEN
        INSERT INTO order_status_history (order_id, status, status_timestamp)
        VALUES (order_id, 'preparing', order_time + INTERVAL '5 minutes');
      END IF;
      
      IF status IN ('ready', 'completed') THEN
        INSERT INTO order_status_history (order_id, status, status_timestamp)
        VALUES (order_id, 'ready', order_time + INTERVAL '15 minutes');
      END IF;
      
      IF status = 'completed' THEN
        INSERT INTO order_status_history (order_id, status, status_timestamp)
        VALUES (order_id, 'completed', order_time + INTERVAL '20 minutes');
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Verify the data
SELECT 
  order_date,
  COUNT(*) as orders_count,
  SUM(total) as total_revenue,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_orders
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY order_date
ORDER BY order_date DESC;

