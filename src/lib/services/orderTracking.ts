import { supabase } from '../supabase/client';
import type { OrderWithItems } from './orders';

/**
 * Generate a unique tracking token
 */
export function generateTrackingToken(): string {
  // Use crypto.randomUUID() if available, otherwise fallback to timestamp + random
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random string
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Check if a tracking token is valid (not expired)
 */
export function isTrackingTokenValid(order: OrderWithItems): boolean {
  if (!order.tracking_token_expires_at) {
    return false;
  }
  
  const expirationTime = new Date(order.tracking_token_expires_at).getTime();
  const now = new Date().getTime();
  
  return now < expirationTime;
}

/**
 * Get order by tracking token
 * Returns null if token is invalid or expired
 */
export async function getOrderByTrackingToken(token: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(id, name_en, name_bn)
      )
    `)
    .eq('tracking_token', token)
    .eq('is_deleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  if (!data) return null;

  const order = data as OrderWithItems;

  // Check if token is expired
  if (!isTrackingTokenValid(order)) {
    return null;
  }

  return order;
}

/**
 * Calculate expiration time: 30 minutes after completion, or 30 minutes from now if not completed
 */
export function calculateTrackingTokenExpiration(orderCompletedAt: Date | null | undefined): Date {
  const now = new Date();
  
  if (orderCompletedAt) {
    // 30 minutes after completion
    const expiration = new Date(orderCompletedAt);
    expiration.setMinutes(expiration.getMinutes() + 30);
    return expiration;
  }
  
  // 30 minutes from now (fallback for orders not yet completed)
  const expiration = new Date(now);
  expiration.setMinutes(expiration.getMinutes() + 30);
  return expiration;
}

