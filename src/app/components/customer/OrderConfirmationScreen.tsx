import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Receipt, Home, Loader2, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useOrder } from '../../hooks/useOrders';
import { formatDailyOrderNumber } from '../../../lib/services/orders';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';

export const OrderConfirmationScreen: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { language } = useApp();
  const t = useTranslation();
  const { data: order, isLoading } = useOrder(orderId);
  const [linkCopied, setLinkCopied] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
            className="bg-green-500 rounded-full p-6"
          >
            <CheckCircle2 className="w-16 h-16 text-white" />
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl mb-2 text-gray-900">{t.orderConfirmation.title}</h1>
          <p className="text-gray-600">{t.orderConfirmation.thankYou}</p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-1">{t.orderConfirmation.orderNumber}</div>
              <div className="text-3xl text-orange-600">#{dailyOrderNumber}</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">{t.orderConfirmation.pickupTime}</div>
                  <div className="text-gray-900">{order.pickup_time}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">{t.orderConfirmation.totalAmount}</div>
                  <div className="text-xl text-gray-900">{t.common.currency}{Number(order.total).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm mb-2 text-gray-600">{t.orderConfirmation.orderDetails}</h3>
              <div className="space-y-2">
                {(order.items as any[]).map((item: any, index: number) => {
                  const addOns = item.selected_add_ons ? (typeof item.selected_add_ons === 'string' ? JSON.parse(item.selected_add_ons) : item.selected_add_ons) : [];
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {language === 'bn' ? item.menu_item?.name_bn : item.menu_item?.name_en || 'Unknown'}
                      </span>
                      <span className="text-gray-600">
                        {t.common.currency}{Number(item.total_price).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tracking Link */}
        {trackingLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 h-12"
            onClick={() => navigate(`/order-status/${order.id}`)}
          >
            {t.orderConfirmation.trackOrder}
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => navigate('/home')}
          >
            <Home className="w-5 h-5 mr-2" />
            {t.orderConfirmation.backToHome}
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>We'll start preparing your order shortly.</p>
          <p className="mt-1">You'll receive updates on your order status.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};