import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type Report = Database['public']['Tables']['reports']['Row'];
type ReportMetrics = Database['public']['Tables']['report_metrics']['Row'];

export interface ReportMetricsData {
  date: string;
  total_orders: number;
  total_revenue: number;
  total_items_sold: number;
  avg_order_value: number;
  avg_prep_time: number;
  avg_time_to_ready: number;
  avg_time_to_completed: number;
  pickup_orders: number;
  delivery_orders: number;
  cancelled_orders: number;
  hourly_breakdown?: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
}

export interface OrderExportData {
  dailyOrderNumber: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'pickup' | 'delivery';
  status: string;
  receivedAt: string;
  preparingStartedAt?: string;
  readyAt?: string;
  collectedAt?: string;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    addOns: string[];
  }>;
  subtotal: number;
  vatAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress?: string;
  deliveryFee?: number;
  customerNotes?: string;
}

/**
 * Generate daily report metrics
 */
export async function generateDailyReport(date: Date): Promise<ReportMetricsData> {
  const dateStr = date.toISOString().split('T')[0];

  const { data, error } = await supabase.rpc('generate_daily_metrics', {
    report_date: dateStr,
  });

  if (error) {
    throw new Error(`Failed to generate daily report: ${error.message}`);
  }

  return data as ReportMetricsData;
}

/**
 * Generate weekly report (aggregate of 7 days)
 */
export async function generateWeeklyReport(startDate: Date, endDate: Date): Promise<ReportMetricsData> {
  // Get all orders in the date range
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .gte('order_date', startDate.toISOString().split('T')[0])
    .lte('order_date', endDate.toISOString().split('T')[0])
    .eq('is_deleted', false);

  if (error) {
    throw new Error(`Failed to generate weekly report: ${error.message}`);
  }

  if (!orders || orders.length === 0) {
    return {
      date: startDate.toISOString().split('T')[0],
      total_orders: 0,
      total_revenue: 0,
      total_items_sold: 0,
      avg_order_value: 0,
      avg_prep_time: 0,
      avg_time_to_ready: 0,
      avg_time_to_completed: 0,
      pickup_orders: 0,
      delivery_orders: 0,
      cancelled_orders: 0,
    };
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const pickupOrders = orders.filter(o => o.order_type === 'pickup').length;
  const deliveryOrders = orders.filter(o => o.order_type === 'delivery').length;

  // Get order items count
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('order_id')
    .in('order_id', orders.map(o => o.id));

  const totalItemsSold = orderItems?.length || 0;

  // Calculate averages
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const avgPrepTime = orders.reduce((sum, o) => sum + (o.estimated_prep_time || 0), 0) / totalOrders;

  // Calculate time averages
  const ordersWithTimes = orders.filter(o => o.received_at && o.ready_at);
  const avgTimeToReady = ordersWithTimes.length > 0
    ? ordersWithTimes.reduce((sum, o) => {
        const diff = new Date(o.ready_at!).getTime() - new Date(o.received_at!).getTime();
        return sum + (diff / 60000); // Convert to minutes
      }, 0) / ordersWithTimes.length
    : 0;

  const ordersCompleted = orders.filter(o => o.received_at && o.collected_at);
  const avgTimeToCompleted = ordersCompleted.length > 0
    ? ordersCompleted.reduce((sum, o) => {
        const diff = new Date(o.collected_at!).getTime() - new Date(o.received_at!).getTime();
        return sum + (diff / 60000);
      }, 0) / ordersCompleted.length
    : 0;

  return {
    date: startDate.toISOString().split('T')[0],
    total_orders: totalOrders,
    total_revenue,
    total_items_sold,
    avg_order_value: avgOrderValue,
    avg_prep_time: avgPrepTime,
    avg_time_to_ready,
    avg_time_to_completed,
    pickup_orders,
    delivery_orders,
    cancelled_orders,
  };
}

/**
 * Generate monthly report
 */
export async function generateMonthlyReport(year: number, month: number): Promise<ReportMetricsData> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return generateWeeklyReport(startDate, endDate);
}

/**
 * Generate custom date range report
 */
export async function generateCustomReport(startDate: Date, endDate: Date): Promise<ReportMetricsData> {
  return generateWeeklyReport(startDate, endDate);
}

/**
 * Get orders for export
 */
export async function getOrdersForExport(
  startDate: Date,
  endDate: Date
): Promise<OrderExportData[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(name_en, name_bn)
      )
    `)
    .gte('order_date', startDate.toISOString().split('T')[0])
    .lte('order_date', endDate.toISOString().split('T')[0])
    .eq('is_deleted', false)
    .order('order_date', { ascending: true })
    .order('daily_order_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch orders for export: ${error.message}`);
  }

  if (!orders) return [];

  return orders.map(order => {
    const dailyOrderNumber = `${order.order_date.replace(/-/g, '')}-${String(order.daily_order_number).padStart(3, '0')}`;
    
    const items = (order.items as any[]).map((item: any) => ({
      itemName: item.menu_item?.name_en || 'Unknown',
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      totalPrice: Number(item.total_price),
      addOns: item.selected_add_ons ? (typeof item.selected_add_ons === 'string' ? JSON.parse(item.selected_add_ons) : item.selected_add_ons) : [],
    }));

    return {
      dailyOrderNumber,
      orderId: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email || undefined,
      orderType: order.order_type,
      status: order.status,
      receivedAt: order.received_at || order.placed_at,
      preparingStartedAt: order.preparing_started_at || undefined,
      readyAt: order.ready_at || undefined,
      collectedAt: order.collected_at || undefined,
      items,
      subtotal: Number(order.subtotal),
      vatAmount: Number(order.vat_amount),
      total: Number(order.total),
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      deliveryAddress: order.delivery_address ? JSON.stringify(order.delivery_address) : undefined,
      deliveryFee: order.delivery_fee ? Number(order.delivery_fee) : undefined,
      customerNotes: order.customer_notes || undefined,
    };
  });
}

/**
 * Export orders to CSV
 */
export async function exportOrdersToCSV(startDate: Date, endDate: Date): Promise<Blob> {
  const orders = await getOrdersForExport(startDate, endDate);

  // Flatten for CSV (one row per item)
  const rows = orders.flatMap(order =>
    order.items.map(item => ({
      'Daily Order #': order.dailyOrderNumber,
      'Order ID': order.orderId,
      'Customer Name': order.customerName,
      'Phone': order.customerPhone,
      'Email': order.customerEmail || '',
      'Order Type': order.orderType,
      'Status': order.status,
      'Received At': order.receivedAt,
      'Preparing Started At': order.preparingStartedAt || '',
      'Ready At': order.readyAt || '',
      'Collected At': order.collectedAt || '',
      'Item Name': item.itemName,
      'Quantity': item.quantity,
      'Unit Price': item.unitPrice,
      'Add-Ons': item.addOns.join(', '),
      'Item Total': item.totalPrice,
      'Subtotal': order.subtotal,
      'VAT': order.vatAmount,
      'Total': order.total,
      'Payment Method': order.paymentMethod,
      'Payment Status': order.paymentStatus,
      'Delivery Address': order.deliveryAddress || '',
      'Delivery Fee': order.deliveryFee || 0,
      'Customer Notes': order.customerNotes || '',
    }))
  );

  const csv = Papa.unparse(rows);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Export orders to Excel
 */
export async function exportOrdersToExcel(startDate: Date, endDate: Date): Promise<Blob> {
  const orders = await getOrdersForExport(startDate, endDate);

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Summary sheet (one row per order)
  const summaryRows = orders.map(order => ({
    'Daily Order #': order.dailyOrderNumber,
    'Order ID': order.orderId,
    'Customer Name': order.customerName,
    'Phone': order.customerPhone,
    'Email': order.customerEmail || '',
    'Order Type': order.orderType,
    'Status': order.status,
    'Received At': order.receivedAt,
    'Preparing Started At': order.preparingStartedAt || '',
    'Ready At': order.readyAt || '',
    'Collected At': order.collectedAt || '',
    'Subtotal': order.subtotal,
    'VAT': order.vatAmount,
    'Total': order.total,
    'Payment Method': order.paymentMethod,
    'Payment Status': order.paymentStatus,
    'Delivery Address': order.deliveryAddress || '',
    'Delivery Fee': order.deliveryFee || 0,
    'Customer Notes': order.customerNotes || '',
  }));

  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Orders Summary');

  // Items sheet (one row per item)
  const itemRows = orders.flatMap(order =>
    order.items.map(item => ({
      'Daily Order #': order.dailyOrderNumber,
      'Order ID': order.orderId,
      'Item Name': item.itemName,
      'Quantity': item.quantity,
      'Unit Price': item.unitPrice,
      'Add-Ons': item.addOns.join(', '),
      'Item Total': item.totalPrice,
    }))
  );

  const itemsWs = XLSX.utils.json_to_sheet(itemRows);
  XLSX.utils.book_append_sheet(wb, itemsWs, 'Order Items');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Get report by ID
 */
export async function getReport(reportId: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch report: ${error.message}`);
  }

  return data;
}

/**
 * List all generated reports
 */
export async function listReports(
  reportType?: 'daily' | 'weekly' | 'monthly' | 'custom',
  limit: number = 50
): Promise<Report[]> {
  let query = supabase
    .from('reports')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(limit);

  if (reportType) {
    query = query.eq('report_type', reportType);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list reports: ${error.message}`);
  }

  return data || [];
}

