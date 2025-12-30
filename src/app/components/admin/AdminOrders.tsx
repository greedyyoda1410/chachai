import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentAdmin } from '../../../lib/supabase/auth';
import { useOrders } from '../../hooks/useOrders';
import { useUpdateOrderStatus } from '../../hooks/useOrders';
import { formatDailyOrderNumber } from '../../../lib/services/orders';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = checking
  const [adminId, setAdminId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useOrders({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const updateStatusMutation = useUpdateOrderStatus();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const admin = await getCurrentAdmin();
    setIsAdmin(!!admin);
    if (admin) {
      setAdminId(admin.id);
    }
  };

  // Show loading while checking auth
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Redirect if not admin (after check completes)
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      formatDailyOrderNumber(order.order_date, order.daily_order_number).includes(searchQuery) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    return matchesSearch;
  });

  // Sort orders: incomplete first, then by timestamp (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aIsCompleted = a.status === 'completed';
    const bIsCompleted = b.status === 'completed';
    
    // Prioritize incomplete orders over completed ones
    if (aIsCompleted && !bIsCompleted) return 1;
    if (!aIsCompleted && bIsCompleted) return -1;
    
    // Within the same completion status, sort by timestamp (newest first)
    const aTime = new Date(a.placed_at).getTime();
    const bTime = new Date(b.placed_at).getTime();
    return bTime - aTime;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus,
        adminId,
      });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-2xl">Live Orders</h1>
                <p className="text-sm text-gray-400">{sortedOrders.length} orders</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order #, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}

        {!isLoading && sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600">No orders found</p>
          </div>
        )}

        {!isLoading && sortedOrders.map((order, index) => {
          const dailyOrderNumber = formatDailyOrderNumber(order.order_date, order.daily_order_number);
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {/* Order Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg text-xs">#{dailyOrderNumber}</span>
                      </div>
                      <div>
                        <h3 className="mb-1">{order.customer_name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{order.customer_phone}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>🕐 {order.pickup_time}</span>
                          <span>·</span>
                          <span>{new Date(order.placed_at).toLocaleTimeString()}</span>
                          {order.order_type === 'delivery' && (
                            <Badge variant="secondary" className="ml-2">Delivery</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="text-right">
                      <div className="text-xl text-orange-600 mb-2">৳{Number(order.total).toFixed(2)}</div>
                      <Select
                        value={order.status}
                        onValueChange={(value: any) => handleStatusChange(order.id, value)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className={`w-32 ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{(order.items as any[]).length} items</Badge>
                    {(order.items as any[]).slice(0, 3).map((item: any, i: number) => (
                      <span key={i} className="text-sm text-gray-600">
                        {item.quantity}x {item.menu_item?.name_en || 'Unknown'}
                        {i < Math.min(2, (order.items as any[]).length - 1) && ','}
                      </span>
                    ))}
                    {(order.items as any[]).length > 3 && (
                      <span className="text-sm text-gray-400">+{(order.items as any[]).length - 3} more</span>
                    )}
                  </div>

                  {/* Expand Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    {expandedOrder === order.id ? 'Hide Details' : 'Show Details'}
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                  </Button>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 p-4 bg-gray-50"
                  >
                    <h4 className="text-sm mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {(order.items as any[]).map((item: any, i: number) => {
                        const addOns = item.selected_add_ons ? (typeof item.selected_add_ons === 'string' ? JSON.parse(item.selected_add_ons) : item.selected_add_ons) : [];
                        return (
                          <div key={i} className="flex justify-between text-sm">
                            <div>
                              <span>{item.quantity}x {item.menu_item?.name_en || 'Unknown'}</span>
                              {addOns.length > 0 && (
                                <div className="text-xs text-gray-500 ml-4">
                                  + {addOns.join(', ')}
                                </div>
                              )}
                              {item.special_notes && (
                                <div className="text-xs text-gray-500 ml-4 italic">
                                  Note: {item.special_notes}
                                </div>
                              )}
                            </div>
                            <span className="text-gray-600">
                              ৳{Number(item.total_price).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {order.customer_notes && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="text-xs text-gray-600 mb-1">Customer Notes:</div>
                        <div className="text-sm">{order.customer_notes}</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};