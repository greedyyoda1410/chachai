-- Cha Chai Ordering System - Initial Database Schema
-- This migration creates all tables, functions, triggers, and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  icon_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_bn TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  takeaway_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  prep_time_minutes INTEGER NOT NULL,
  is_for_sale BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  allow_pickup BOOLEAN DEFAULT true,
  allow_delivery BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add-ons table
CREATE TABLE add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  group_name_en TEXT NOT NULL,
  group_name_bn TEXT NOT NULL,
  applicable_to_items JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  image_url TEXT,
  promotional_price DECIMAL(10, 2) NOT NULL,
  is_for_sale BOOLEAN DEFAULT false,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Promotion items junction table
CREATE TABLE promotion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(promotion_id, menu_item_id)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_order_number INTEGER NOT NULL,
  order_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  order_type TEXT NOT NULL CHECK (order_type IN ('pickup', 'delivery')),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'completed', 'cancelled')),
  pickup_time TEXT NOT NULL,
  delivery_address JSONB,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  vat_amount DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pickup', 'online')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  customer_notes TEXT,
  estimated_prep_time INTEGER,
  received_at TIMESTAMP WITH TIME ZONE,
  preparing_started_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  collected_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_date, daily_order_number)
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  promotion_id UUID REFERENCES promotions(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  selected_add_ons JSONB,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content assets table
CREATE TABLE content_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('splash_screen', 'cart_empty', 'checkout_header', 'delivery_banner', 'other')),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  image_url TEXT,
  description_en TEXT,
  description_bn TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Delivery zones table
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2),
  estimated_delivery_time_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  polygon_coordinates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  report_date DATE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id),
  report_data JSONB,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report metrics table (for fast daily metric lookups)
CREATE TABLE report_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date DATE UNIQUE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_items_sold INTEGER DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,
  avg_prep_time_minutes DECIMAL(10, 2) DEFAULT 0,
  avg_time_to_ready_minutes DECIMAL(10, 2) DEFAULT 0,
  avg_time_to_completed_minutes DECIMAL(10, 2) DEFAULT 0,
  peak_hour INTEGER,
  top_item_id UUID REFERENCES menu_items(id),
  top_category_id UUID REFERENCES categories(id),
  pickup_orders INTEGER DEFAULT 0,
  delivery_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history table (audit trail)
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('received', 'preparing', 'ready', 'completed', 'cancelled')),
  status_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_for_sale ON menu_items(is_for_sale);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_daily_order_number ON orders(order_date, daily_order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX idx_promotion_items_promotion_id ON promotion_items(promotion_id);
CREATE INDEX idx_promotion_items_menu_item_id ON promotion_items(menu_item_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_status_timestamp ON order_status_history(status_timestamp);
CREATE INDEX idx_report_metrics_date ON report_metrics(report_date);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_add_ons_is_active ON add_ons(is_active);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get next daily order number
CREATE OR REPLACE FUNCTION get_next_daily_order_number(order_date DATE)
RETURNS INTEGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(daily_order_number), 0) + 1
  INTO next_number
  FROM orders
  WHERE orders.order_date = get_next_daily_order_number.order_date;
  
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate promotion savings
CREATE OR REPLACE FUNCTION calculate_promotion_savings(promo_id UUID)
RETURNS JSONB AS $$
DECLARE
  promo_price DECIMAL;
  individual_total DECIMAL;
  savings_amount DECIMAL;
  savings_percentage DECIMAL;
  result JSONB;
BEGIN
  -- Get promotional price
  SELECT promotional_price INTO promo_price
  FROM promotions
  WHERE id = promo_id;

  -- Calculate total if items bought separately
  SELECT COALESCE(SUM(mi.takeaway_price * pi.quantity), 0)
  INTO individual_total
  FROM promotion_items pi
  JOIN menu_items mi ON pi.menu_item_id = mi.id
  WHERE pi.promotion_id = promo_id;

  -- Calculate savings
  savings_amount := individual_total - promo_price;
  savings_percentage := CASE 
    WHEN individual_total > 0 THEN (savings_amount / individual_total) * 100
    ELSE 0
  END;

  -- Return result
  result := jsonb_build_object(
    'savings_amount', savings_amount,
    'savings_percentage', savings_percentage,
    'individual_total', individual_total,
    'promotional_price', promo_price
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate daily metrics
CREATE OR REPLACE FUNCTION generate_daily_metrics(report_date DATE)
RETURNS JSONB AS $$
DECLARE
  metrics JSONB;
BEGIN
  SELECT jsonb_build_object(
    'date', report_date,
    'total_orders', COUNT(*),
    'total_revenue', COALESCE(SUM(total), 0),
    'total_items_sold', COALESCE(SUM((SELECT COUNT(*) FROM order_items WHERE order_id = orders.id)), 0),
    'avg_order_value', COALESCE(AVG(total), 0),
    'avg_prep_time', COALESCE(AVG(estimated_prep_time), 0),
    'avg_time_to_ready', COALESCE(AVG(EXTRACT(EPOCH FROM (ready_at - received_at)) / 60), 0),
    'avg_time_to_completed', COALESCE(AVG(EXTRACT(EPOCH FROM (collected_at - received_at)) / 60), 0),
    'pickup_orders', COUNT(*) FILTER (WHERE order_type = 'pickup'),
    'delivery_orders', COUNT(*) FILTER (WHERE order_type = 'delivery'),
    'cancelled_orders', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'hourly_breakdown', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'hour', EXTRACT(HOUR FROM received_at)::INTEGER,
          'orders', COUNT(*),
          'revenue', SUM(total)
        )
      )
      FROM orders
      WHERE DATE(received_at) = report_date AND is_deleted = false
      GROUP BY EXTRACT(HOUR FROM received_at)
      ORDER BY EXTRACT(HOUR FROM received_at)
    )
  )
  INTO metrics
  FROM orders
  WHERE DATE(received_at) = report_date
    AND is_deleted = false;
  
  RETURN metrics;
END;
$$ LANGUAGE plpgsql;

-- Function to update order timestamps based on status history
CREATE OR REPLACE FUNCTION update_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'received' THEN
    UPDATE orders SET received_at = NEW.status_timestamp WHERE id = NEW.order_id;
  ELSIF NEW.status = 'preparing' THEN
    UPDATE orders SET preparing_started_at = NEW.status_timestamp WHERE id = NEW.order_id;
  ELSIF NEW.status = 'ready' THEN
    UPDATE orders SET ready_at = NEW.status_timestamp WHERE id = NEW.order_id;
  ELSIF NEW.status = 'completed' THEN
    UPDATE orders SET collected_at = NEW.status_timestamp, completed_at = NEW.status_timestamp WHERE id = NEW.order_id;
  ELSIF NEW.status = 'cancelled' THEN
    UPDATE orders SET cancelled_at = NEW.status_timestamp WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update order timestamps when status changes
CREATE TRIGGER order_status_timestamp_trigger
AFTER INSERT ON order_status_history
FOR EACH ROW
EXECUTE FUNCTION update_order_timestamps();

-- Triggers to update updated_at for all tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_add_ons_updated_at BEFORE UPDATE ON add_ons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_assets_updated_at BEFORE UPDATE ON content_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_metrics_updated_at BEFORE UPDATE ON report_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Categories: Public read for active, admins can do everything
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Menu items: Public read for items for sale, admins can do everything
CREATE POLICY "Menu items for sale are viewable by everyone" ON menu_items
  FOR SELECT USING (is_for_sale = true AND is_available = true);

CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Add-ons: Public read for active, admins can do everything
CREATE POLICY "Add-ons are viewable by everyone" ON add_ons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage add-ons" ON add_ons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Promotions: Public read for active promotions for sale, admins can do everything
CREATE POLICY "Active promotions are viewable by everyone" ON promotions
  FOR SELECT USING (
    is_for_sale = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
  );

CREATE POLICY "Admins can manage promotions" ON promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Promotion items: Public read, admins can do everything
CREATE POLICY "Promotion items are viewable by everyone" ON promotion_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage promotion items" ON promotion_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Orders: Customers can read their own orders, admins can do everything
CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (
    customer_phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin', 'staff')
    )
  );

-- Order items: Same as orders
CREATE POLICY "Order items follow order policies" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM admins
          WHERE admins.id = auth.uid()
          AND admins.is_active = true
        )
      )
    )
  );

-- Admins: Only admins can read, super_admin can manage
CREATE POLICY "Admins can view other admins" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.id = auth.uid()
      AND a.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role = 'super_admin'
    )
  );

-- Content assets: Public read for active, admins can do everything
CREATE POLICY "Active content assets are viewable by everyone" ON content_assets
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage content assets" ON content_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Delivery zones: Public read for active, admins can do everything
CREATE POLICY "Active delivery zones are viewable by everyone" ON delivery_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage delivery zones" ON delivery_zones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Reports: Only admins can access
CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Report metrics: Only admins can access
CREATE POLICY "Admins can view report metrics" ON report_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Order status history: Same as orders
CREATE POLICY "Order status history follows order policies" ON order_status_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (
        orders.customer_phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM admins
          WHERE admins.id = auth.uid()
          AND admins.is_active = true
        )
      )
    )
  );

