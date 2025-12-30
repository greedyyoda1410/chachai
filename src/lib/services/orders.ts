import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import { calculatePrepTime } from './menuItems';
import { generateTrackingToken, calculateTrackingTokenExpiration } from './orderTracking';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    menu_item: {
      id: string;
      name_en: string;
      name_bn: string;
    };
  })[];
}

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'pickup' | 'delivery';
  pickupTime: string;
  deliveryAddress?: {
    street: string;
    city: string;
    landmark?: string;
    zone?: string;
  };
  deliveryFee?: number;
  paymentMethod: 'pickup' | 'online';
  customerNotes?: string;
  items: Array<{
    menuItemId: string;
    promotionId?: string;
    quantity: number;
    unitPrice: number;
    selectedAddOns: string[];
    specialNotes?: string;
  }>;
}

/**
 * Get next daily order number
 */
async function getNextDailyOrderNumber(orderDate: Date): Promise<number> {
  const dateStr = orderDate.toISOString().split('T')[0];
  
  const { data, error } = await supabase.rpc('get_next_daily_order_number', {
    order_date: dateStr,
  });

  if (error) {
    throw new Error(`Failed to get next order number: ${error.message}`);
  }

  return data || 1;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderData): Promise<OrderWithItems> {
  const orderDate = new Date();
  const dateStr = orderDate.toISOString().split('T')[0];

  // Calculate subtotal
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // Calculate VAT (10%)
  const vatAmount = subtotal * 0.1;
  const total = subtotal + vatAmount + (orderData.deliveryFee || 0);

  // Get daily order number
  const dailyOrderNumber = await getNextDailyOrderNumber(orderDate);

  // Calculate estimated prep time
  const itemIds = orderData.items.map(item => item.menuItemId);
  const estimatedPrepTime = await calculatePrepTime(itemIds);

  // Generate tracking token and set initial expiration (30 min from now)
  const trackingToken = generateTrackingToken();
  const trackingTokenExpiresAt = calculateTrackingTokenExpiration(null);

  // Create order - base fields
  const baseOrderInsert: OrderInsert = {
    daily_order_number: dailyOrderNumber,
    order_date: dateStr,
    customer_name: orderData.customerName,
    customer_phone: orderData.customerPhone,
    customer_email: orderData.customerEmail,
    order_type: orderData.orderType,
    status: 'received',
    pickup_time: orderData.pickupTime,
    delivery_address: orderData.deliveryAddress ? JSON.stringify(orderData.deliveryAddress) : null,
    delivery_fee: orderData.deliveryFee || 0,
    subtotal,
    vat_amount: vatAmount,
    total,
    payment_method: orderData.paymentMethod,
    payment_status: 'pending',
    customer_notes: orderData.customerNotes,
    estimated_prep_time: estimatedPrepTime,
    received_at: new Date().toISOString(),
    placed_at: new Date().toISOString(),
  };

  // Try to insert with tracking fields first (if migration has been run)
  // If it fails with a column error, retry without tracking fields
  let orderInsert: any = {
    ...baseOrderInsert,
    tracking_token: trackingToken,
    tracking_token_expires_at: trackingTokenExpiresAt.toISOString(),
  };

  let { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderInsert)
    .select()
    .single();

  // If error is about unknown columns, retry without tracking fields
  // Check for various error codes and messages that indicate missing columns
  const errorMessage = orderError?.message?.toLowerCase() || '';
  const errorCode = orderError?.code || '';
  const isColumnError = orderError && (
    errorCode === '42703' || // undefined_column
    errorCode === '42P01' || // undefined_table
    errorCode === 'PGRST116' || // Not found (shouldn't apply here)
    errorMessage.includes('column') ||
    errorMessage.includes('does not exist') ||
    errorMessage.includes('tracking_token') ||
    errorMessage.includes('tracking_token_expires_at') ||
    errorMessage.includes('unknown') ||
    // If it's a 400 error, it might be a column issue - try retry
    (orderError.code === '400' || orderError.code === 'PGRST301' || String(orderError.code).includes('400'))
  );

  if (isColumnError) {
    console.warn('Tracking token columns not found, creating order without tracking fields. Please run migration 003_add_order_tracking_token.sql');
    console.warn('Original error code:', errorCode, 'message:', orderError.message);
    
    // Create a completely clean insert object without tracking fields
    // Build it explicitly to avoid any type issues
    const retryInsert: any = {
      daily_order_number: baseOrderInsert.daily_order_number,
      order_date: baseOrderInsert.order_date,
      customer_name: baseOrderInsert.customer_name,
      customer_phone: baseOrderInsert.customer_phone,
      customer_email: baseOrderInsert.customer_email,
      order_type: baseOrderInsert.order_type,
      status: baseOrderInsert.status,
      pickup_time: baseOrderInsert.pickup_time,
      delivery_address: baseOrderInsert.delivery_address,
      delivery_fee: baseOrderInsert.delivery_fee,
      subtotal: baseOrderInsert.subtotal,
      vat_amount: baseOrderInsert.vat_amount,
      total: baseOrderInsert.total,
      payment_method: baseOrderInsert.payment_method,
      payment_status: baseOrderInsert.payment_status,
      customer_notes: baseOrderInsert.customer_notes,
      estimated_prep_time: baseOrderInsert.estimated_prep_time,
      received_at: baseOrderInsert.received_at,
      placed_at: baseOrderInsert.placed_at,
    };
    
    const retryResult = await supabase
      .from('orders')
      .insert(retryInsert)
      .select()
      .single();
    order = retryResult.data;
    orderError = retryResult.error;
    
    if (retryResult.error) {
      console.error('Retry insert error:', retryResult.error);
    } else {
      console.log('Order created successfully without tracking fields');
    }
  }

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Create order items
  const orderItems: OrderItemInsert[] = orderData.items.map(item => ({
    order_id: order.id,
    menu_item_id: item.menuItemId,
    promotion_id: item.promotionId || null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
    selected_add_ons: item.selectedAddOns.length > 0 ? JSON.stringify(item.selectedAddOns) : null,
    special_notes: item.specialNotes || null,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // Rollback order if items fail
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  // Create initial status history entry
  const { error: statusError } = await supabase
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status: 'received',
      status_timestamp: new Date().toISOString(),
    });

  if (statusError) {
    console.error('Failed to create status history:', statusError);
    // Don't throw - order is still created
  }

  // Fetch complete order with items
  return getOrderById(order.id) as Promise<OrderWithItems>;
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(id, name_en, name_bn)
      )
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  return data as OrderWithItems;
}

/**
 * Get orders with filters
 */
export async function getOrders(filters: {
  status?: string;
  orderType?: 'pickup' | 'delivery';
  startDate?: Date;
  endDate?: Date;
  customerPhone?: string;
  limit?: number;
}): Promise<OrderWithItems[]> {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(id, name_en, name_bn)
      )
    `)
    .eq('is_deleted', false)
    .order('placed_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.orderType) {
    query = query.eq('order_type', filters.orderType);
  }

  if (filters.startDate) {
    query = query.gte('order_date', filters.startDate.toISOString().split('T')[0]);
  }

  if (filters.endDate) {
    query = query.lte('order_date', filters.endDate.toISOString().split('T')[0]);
  }

  if (filters.customerPhone) {
    query = query.eq('customer_phone', filters.customerPhone);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return (data || []) as OrderWithItems[];
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['status'],
  adminId?: string,
  notes?: string
): Promise<Order> {
  // Update order status
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to update order status: ${orderError.message}`);
  }

  // Create status history entry
  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: newStatus,
      status_timestamp: new Date().toISOString(),
      changed_by: adminId || null,
      notes: notes || null,
    });

  if (historyError) {
    console.error('Failed to create status history:', historyError);
    // Don't throw - order status is still updated
  }

  // Update completed_at and tracking token expiration if status is completed
  if (newStatus === 'completed') {
    const completedAt = new Date();
    const expirationAt = calculateTrackingTokenExpiration(completedAt);
    
    // Try to update with tracking token expiration
    // If columns don't exist, just update completed_at
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        completed_at: completedAt.toISOString(),
        tracking_token_expires_at: expirationAt.toISOString(),
      })
      .eq('id', orderId);
    
    // If tracking column doesn't exist, retry without it
    if (updateError && (updateError.message.includes('column') || updateError.message.includes('does not exist') || updateError.code === '42703')) {
      await supabase
        .from('orders')
        .update({ completed_at: completedAt.toISOString() })
        .eq('id', orderId);
    }
  }

  return order;
}

/**
 * Get daily order number for a date
 */
export async function getDailyOrderNumber(date: Date): Promise<number> {
  return getNextDailyOrderNumber(date);
}

/**
 * Format daily order number as string (YYYYMMDD-XXX)
 */
export function formatDailyOrderNumber(orderDate: string, dailyNumber: number): string {
  const date = new Date(orderDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const number = String(dailyNumber).padStart(3, '0');
  
  return `${year}${month}${day}-${number}`;
}

