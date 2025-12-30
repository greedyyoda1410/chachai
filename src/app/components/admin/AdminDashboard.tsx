import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Clock, Package, ChefHat, BarChart3, Loader2, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentAdmin } from '../../../lib/supabase/auth';
import { useOrders } from '../../hooks/useOrders';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = checking
  
  // Memoize dates to prevent query key changes on every render
  const { today, todayStr } = useMemo(() => {
    const todayDate = new Date();
    // Set to start of day to ensure consistent date string
    todayDate.setHours(0, 0, 0, 0);
    return {
      today: todayDate,
      todayStr: todayDate.toISOString().split('T')[0],
    };
  }, []); // Only calculate once on mount
  
  const { data: orders = [], isLoading, error } = useOrders({
    startDate: today,
    endDate: today,
    limit: 100, // Limit to prevent loading too many orders
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const admin = await getCurrentAdmin();
    setIsAdmin(!!admin);
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

  // Calculate metrics
  const todayOrders = orders.filter(o => o.order_date === todayStr);
  
  // Sort orders: incomplete first, then by timestamp (newest first)
  const sortedTodayOrders = [...todayOrders].sort((a, b) => {
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
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgPrepTime = todayOrders.length > 0
    ? Math.round(todayOrders.reduce((sum, o) => sum + (o.estimated_prep_time || 0), 0) / todayOrders.length)
    : 0;
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

  // Calculate hourly breakdown
  const hourlyData: Record<number, number> = {};
  todayOrders.forEach(order => {
    const hour = new Date(order.placed_at).getHours();
    hourlyData[hour] = (hourlyData[hour] || 0) + 1;
  });

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    orders: hourlyData[i] || 0,
  })).filter(d => d.orders > 0);

  const metrics = [
    { 
      label: 'Total Orders Today',
      value: todayOrders.length,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'Revenue Today',
      value: `৳${todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Avg Prep Time',
      value: `${avgPrepTime} min`,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      label: 'Active Orders',
      value: activeOrders,
      icon: ChefHat,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-1">Dashboard</h1>
            <p className="text-sm text-gray-400">Cha Chai Admin</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-transparent text-white border-white/20 hover:bg-white/10"
              onClick={() => navigate('/admin/orders')}
            >
              <Package className="w-4 h-4 mr-2" />
              Orders
            </Button>
            <Button
              variant="outline"
              className="bg-transparent text-white border-white/20 hover:bg-white/10"
              onClick={() => navigate('/admin/reports')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </Button>
            <Button
              variant="outline"
              className="bg-transparent text-white border-white/20 hover:bg-white/10"
              onClick={() => navigate('/admin/menu')}
            >
              Menu
            </Button>
            <Button
              variant="outline"
              className="bg-transparent text-white border-white/20 hover:bg-white/10"
              onClick={() => {
                navigate('/home');
              }}
            >
              Exit Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-2">Failed to load orders</div>
            <div className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                      <p className="text-3xl">{metric.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${metric.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h2>Orders by Hour</h2>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Popular Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2>Popular Items Today</h2>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Chicken Roll', count: 24, emoji: '🌯' },
                  { name: 'Masala Chai', count: 18, emoji: '🍵' },
                  { name: 'Samosa', count: 15, emoji: '🥟' },
                  { name: 'Egg Roll', count: 12, emoji: '🥚' },
                  { name: 'Green Tea', count: 10, emoji: '🍃' },
                ].map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="text-orange-600">{item.count} orders</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2>Recent Orders</h2>
              <Button
                variant="link"
                className="text-orange-600"
                onClick={() => navigate('/admin/orders')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {sortedTodayOrders.slice(0, 5).map(order => {
                const dailyOrderNumber = `${order.order_date.replace(/-/g, '')}-${String(order.daily_order_number).padStart(3, '0')}`;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors"
                    onClick={() => navigate('/admin/orders')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs">#{dailyOrderNumber}</span>
                      </div>
                      <div>
                        <div>{order.customer_name}</div>
                        <div className="text-sm text-gray-600">
                          {(order.items as any[]).length} items · {order.pickup_time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-600">৳{Number(order.total).toFixed(2)}</div>
                      <div className={`text-xs capitalize px-2 py-1 rounded-full inline-block ${
                        order.status === 'ready' ? 'bg-green-100 text-green-700' :
                        order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'received' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
};