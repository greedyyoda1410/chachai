import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Package, X, Loader2, Copy, Check, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../../hooks/useTranslation';
import { useOrder } from '../../hooks/useOrders';
import { formatDailyOrderNumber } from '../../../lib/services/orders';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

export const OrderStatusScreen: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const [progress, setProgress] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const { data: order, isLoading } = useOrder(orderId);

  const trackingLink = order?.tracking_token 
    ? `${window.location.origin}/track/${order.tracking_token}`
    : null;

  const handleCopyLink = async () => {
    if (!trackingLink) return;
    
    try {
      await navigator.clipboard.writeText(trackingLink);
      setLinkCopied(true);
      toast.success('Tracking link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const getExpirationTime = () => {
    if (!order?.tracking_token_expires_at) return null;
    const expiration = new Date(order.tracking_token_expires_at);
    return expiration.toLocaleString();
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
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
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl">{t.orderStatus.title}</h1>
            <p className="text-sm text-white/80">{t.orderStatus.orderNumber}{dailyOrderNumber}</p>
          </div>
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
              {(order.items as any[]).map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm mb-1">
                  <span>{item.quantity}x {t.language === 'bn' ? item.menu_item?.name_bn : item.menu_item?.name_en || 'Unknown'}</span>
                  <span>{t.common.currency}{Number(item.total_price).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="text-gray-900">{t.common.total}</span>
                <span className="text-orange-600 text-lg">{t.common.currency}{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tracking Link */}
        {trackingLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <Receipt className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Shareable Tracking Link</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Share this link to track your order status. {getExpirationTime() && `Link valid until ${getExpirationTime()}`}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={trackingLink}
                      className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Cancel Button (only if not ready/completed) */}
        {order.status !== 'ready' && order.status !== 'completed' && (
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Order
          </Button>
        )}

        {/* Contact Support */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help with your order?</p>
          <Button variant="link" className="text-orange-600 p-0">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};