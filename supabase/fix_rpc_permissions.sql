-- Fix RPC function permissions for get_next_daily_order_number
-- Allow anonymous users to call this function

-- Drop and recreate the function with proper permissions
DROP FUNCTION IF EXISTS get_next_daily_order_number(DATE);

CREATE OR REPLACE FUNCTION get_next_daily_order_number(order_date DATE)
RETURNS INTEGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(daily_order_number), 0) + 1
  INTO next_number
  FROM orders
  WHERE orders.order_date = get_next_daily_order_number.order_date;
  
  RETURN next_number;
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION get_next_daily_order_number(DATE) TO anon, authenticated;

