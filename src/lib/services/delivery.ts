import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type DeliveryZone = Database['public']['Tables']['delivery_zones']['Row'];
type DeliveryZoneInsert = Database['public']['Tables']['delivery_zones']['Insert'];
type DeliveryZoneUpdate = Database['public']['Tables']['delivery_zones']['Update'];

/**
 * Get all delivery zones
 */
export async function getDeliveryZones(activeOnly: boolean = true): Promise<DeliveryZone[]> {
  let query = supabase
    .from('delivery_zones')
    .select('*')
    .order('name_en', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch delivery zones: ${error.message}`);
  }

  return data || [];
}

/**
 * Get delivery zone by ID
 */
export async function getDeliveryZoneById(id: string): Promise<DeliveryZone | null> {
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch delivery zone: ${error.message}`);
  }

  return data;
}

/**
 * Calculate delivery fee for a zone
 */
export async function calculateDeliveryFee(
  zoneId: string,
  orderAmount: number
): Promise<{ fee: number; estimatedMinutes: number }> {
  const zone = await getDeliveryZoneById(zoneId);

  if (!zone) {
    throw new Error('Delivery zone not found');
  }

  // Check minimum order amount
  if (zone.min_order_amount && orderAmount < zone.min_order_amount) {
    throw new Error(`Minimum order amount is ${zone.min_order_amount} for this zone`);
  }

  return {
    fee: zone.delivery_fee,
    estimatedMinutes: zone.estimated_delivery_time_minutes,
  };
}

/**
 * Create a delivery zone
 */
export async function createDeliveryZone(zone: DeliveryZoneInsert): Promise<DeliveryZone> {
  const { data, error } = await supabase
    .from('delivery_zones')
    .insert(zone)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create delivery zone: ${error.message}`);
  }

  return data;
}

/**
 * Update a delivery zone
 */
export async function updateDeliveryZone(id: string, updates: DeliveryZoneUpdate): Promise<DeliveryZone> {
  const { data, error } = await supabase
    .from('delivery_zones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update delivery zone: ${error.message}`);
  }

  return data;
}

/**
 * Delete a delivery zone
 */
export async function deleteDeliveryZone(id: string): Promise<void> {
  const { error } = await supabase
    .from('delivery_zones')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete delivery zone: ${error.message}`);
  }
}

