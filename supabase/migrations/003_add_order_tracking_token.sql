-- Add tracking token columns to orders table
-- This allows customers to access their order status via a unique, expiring link

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS tracking_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token);

-- Add comment for documentation
COMMENT ON COLUMN orders.tracking_token IS 'Unique token for public order tracking. Expires 30 minutes after order completion.';
COMMENT ON COLUMN orders.tracking_token_expires_at IS 'Timestamp when the tracking token expires. Set to 30 minutes after order completion.';

