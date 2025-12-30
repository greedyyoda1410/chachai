import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type OrderStatusHistory = Database['public']['Tables']['order_status_history']['Row'];

export interface OrderAuditTrail {
  orderId: string;
  dailyOrderNumber: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    changedBy?: string;
    notes?: string;
    whatsappSent: boolean;
  }>;
  timeline: {
    receivedAt: string;
    preparingStartedAt?: string;
    readyAt?: string;
    collectedAt?: string;
    timeToPreparingMinutes?: number;
    timeToReadyMinutes?: number;
    timeToCompletedMinutes?: number;
    prepTimeMinutes?: number;
  };
}

/**
 * Get full audit trail for an order
 */
export async function getOrderAuditTrail(orderId: string): Promise<OrderAuditTrail | null> {
  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return null;
  }

  // Get status history
  const { data: statusHistory, error: historyError } = await supabase
    .from('order_status_history')
    .select(`
      *,
      changed_by_admin:admins(id, full_name)
    `)
    .eq('order_id', orderId)
    .order('status_timestamp', { ascending: true });

  if (historyError) {
    throw new Error(`Failed to fetch status history: ${historyError.message}`);
  }

  // Calculate timeline
  const receivedAt = order.received_at || order.placed_at;
  const preparingStartedAt = order.preparing_started_at;
  const readyAt = order.ready_at;
  const collectedAt = order.collected_at;

  const timeToPreparing = preparingStartedAt && receivedAt
    ? (new Date(preparingStartedAt).getTime() - new Date(receivedAt).getTime()) / 60000
    : undefined;

  const timeToReady = readyAt && receivedAt
    ? (new Date(readyAt).getTime() - new Date(receivedAt).getTime()) / 60000
    : undefined;

  const timeToCompleted = collectedAt && receivedAt
    ? (new Date(collectedAt).getTime() - new Date(receivedAt).getTime()) / 60000
    : undefined;

  const prepTime = readyAt && preparingStartedAt
    ? (new Date(readyAt).getTime() - new Date(preparingStartedAt).getTime()) / 60000
    : undefined;

  // Format daily order number
  const dailyOrderNumber = `${order.order_date.replace(/-/g, '')}-${String(order.daily_order_number).padStart(3, '0')}`;

  return {
    orderId: order.id,
    dailyOrderNumber,
    statusHistory: (statusHistory || []).map((entry: any) => ({
      status: entry.status,
      timestamp: entry.status_timestamp,
      changedBy: entry.changed_by_admin?.full_name || undefined,
      notes: entry.notes || undefined,
      whatsappSent: entry.whatsapp_sent || false,
    })),
    timeline: {
      receivedAt,
      preparingStartedAt: preparingStartedAt || undefined,
      readyAt: readyAt || undefined,
      collectedAt: collectedAt || undefined,
      timeToPreparingMinutes: timeToPreparing,
      timeToReadyMinutes: timeToReady,
      timeToCompletedMinutes: timeToCompleted,
      prepTimeMinutes: prepTime,
    },
  };
}

/**
 * Get all orders with audit trails for date range
 */
export async function getOrdersWithAuditTrails(
  startDate: Date,
  endDate: Date
): Promise<OrderAuditTrail[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .gte('order_date', startDate.toISOString().split('T')[0])
    .lte('order_date', endDate.toISOString().split('T')[0])
    .eq('is_deleted', false)
    .order('order_date', { ascending: true })
    .order('daily_order_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  if (!orders) return [];

  // Get audit trails for all orders
  const auditTrails = await Promise.all(
    orders.map(order => getOrderAuditTrail(order.id))
  );

  return auditTrails.filter(trail => trail !== null) as OrderAuditTrail[];
}

