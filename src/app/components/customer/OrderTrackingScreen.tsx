import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Package, Home, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../../hooks/useTranslation';
import { getOrderByTrackingToken, isTrackingTokenValid } from '../../../lib/services/orderTracking';
import { formatDailyOrderNumber } from '../../../lib/services/orders';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import type { OrderWithItems } from '../../../lib/services/orders';

export const OrderTrackingScreen: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError('Invalid tracking link');
        setIsLoading(false);
        return;
      }

      try {
        const orderData = await getOrderByTrackingToken(token);
        
        if (!orderData) {
          setError('Order not found or tracking link has expired');
          setIsLoading(false);
          return;
        }

        if (!isTrackingTokenValid(orderData)) {
          setError('This tracking link has expired');
          setIsLoading(false);
          return;
        }

        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  // Update progress based on order status
  useEffect(() => {
    if (!order) return;
    
    const statusProgress: Record<string, number> = {
      received: 33,
      preparing: 66,
      ready: 100,
      completed: 100,
      cancelled: 0,
    };
    
    setProgress(statusProgress[order.status] || 0);
  }, [order?.status]);

  // Calculate time remaining until expiration
  useEffect(() => {
    if (!order?.tracking_token_expires_at) return;

    const updateTimeRemaining = () => {
      const expirationTime = new Date(order.tracking_token_expires_at!).getTime();
      const now = new Date().getTime();
      const remaining = expirationTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [order?.tracking_token_expires_at]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl mb-2 text-gray-900">Tracking Link Expired</h1>
          <p className="text-gray-600 mb-6">{error || 'This tracking link is no longer valid.'}</p>
          <Button onClick={() => navigate('/home')} className="bg-orange-500 hover:bg-orange-600">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const dailyOrderNumber = formatDailyOrderNumber(order.order_date, order.daily_order_number);

  const statusSteps = [
    { id: 'received' as const, label: t.orderStatus.orderReceived, icon: Package, description: t.orderStatus.orderReceivedDesc },
    { id: 'preparing' as const, label: t.orderStatus.preparing, icon: Clock, description: t.orderStatus.preparingDesc },
    { id: 'ready' as const, label: t.orderStatus.readyForPickup, icon: CheckCircle, description: t.orderStatus.readyDesc },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.id === order.status);

  const getEstimatedTime = () => {
    if (order.status === 'ready' || order.status === 'completed') return 'Ready now!';
    if (order.status === 'preparing' && order.preparing_started_at) {
      const now = new Date();
      const started = new Date(order.preparing_started_at);
      const elapsed = Math.floor((now.getTime() - started.getTime()) / 60000);
      const remaining = Math.max(0, (order.estimated_prep_time || 15) - elapsed);
      return `${remaining} ${t.orderConfirmation.minutes}`;
    }
    return `${order.estimated_prep_time || 15}-${(order.estimated_prep_time || 15) + 5} ${t.orderConfirmation.minutes}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/home')}
          >
            <Home className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl">{t.orderStatus.title}</h1>
            <p className="text-sm text-white/80">{t.orderStatus.orderNumber}{dailyOrderNumber}</p>
          </div>
          {order.status === 'completed' && timeRemaining && timeRemaining !== 'Expired' && (
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full">
              Link expires in {timeRemaining}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Status Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">
                {order.status === 'received' && '📦'}
                {order.status === 'preparing' && '👨‍🍳'}
                {order.status === 'ready' && '✅'}
                {order.status === 'completed' && '🎉'}
              </div>
              <h2 className="text-2xl mb-1 text-gray-900">
                {t.orderStatuses[order.status]}
              </h2>
              <p className="text-gray-600">
                {order.status === 'received' && t.orderStatus.orderReceivedDesc}
                {order.status === 'preparing' && t.orderStatus.preparingDesc}
                {order.status === 'ready' && t.orderStatus.readyDesc}
                {order.status === 'completed' && t.orderStatus.completedDesc}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="text-orange-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Timeline */}
            <div className="relative space-y-6">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-orange-200' : ''}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className={`${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </div>
                      <div className="text-sm text-gray-500">{step.description}</div>
                    </div>
                    {isCurrent && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-orange-600 text-sm px-3 py-1 bg-orange-50 rounded-full"
                      >
                        {t.orderStatus.currentStatus}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* ETA */}
        {order.status !== 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <div className="flex items-center gap-4">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-600">{t.orderConfirmation.estimatedTime}</div>
                  <div className="text-xl text-orange-600">{getEstimatedTime()}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Order Details */}
        <Card className="p-6">
          <h3 className="mb-4">{t.orderConfirmation.orderDetails}</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.orderConfirmation.pickupTime}</span>
              <span className="text-gray-900">{order.pickup_time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.adminOrders.customer}</span>
              <span className="text-gray-900">{order.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.adminOrders.phone}</span>
              <span className="text-gray-900">{order.customer_phone}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="text-sm text-gray-600 mb-2">{t.checkout.items}</div>
              {(order.items as any[]).map((item: any, index: number) => {
                const addOns = item.selected_add_ons ? (typeof item.selected_add_ons === 'string' ? JSON.parse(item.selected_add_ons) : item.selected_add_ons) : [];
                return (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>
                      {item.quantity}x {item.menu_item?.name_en || 'Unknown'}
                      {addOns.length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">(+{addOns.length} add-ons)</span>
                      )}
                    </span>
                    <span>{t.common.currency}{Number(item.total_price).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="text-gray-900">{t.common.total}</span>
                <span className="text-orange-600 text-lg">{t.common.currency}{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Back to Home */}
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600"
          onClick={() => navigate('/home')}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

