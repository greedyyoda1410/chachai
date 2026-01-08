import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Phone, Mail, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCreateOrder } from '../../hooks/useOrders';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card } from '../ui/card';
import { toast } from 'sonner';

export const CheckoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useApp();
  const t = useTranslation();
  const createOrderMutation = useCreateOrder();
  
  const [pickupType, setPickupType] = useState<'asap' | 'scheduled'>('asap');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pickup' | 'online'>('pickup');
  const [orderType] = useState<'pickup' | 'delivery'>('pickup'); // Locked to pickup for now

  const subtotal = getCartTotal();
  const vat = subtotal * 0.1;
  const total = subtotal + vat;

  const handlePlaceOrder = async () => {
    if (!customerName || !phone) {
      toast.error(t.checkout.allFieldsRequired);
      return;
    }

    const pickupTime = pickupType === 'asap' ? 'ASAP (15-20 mins)' : selectedTime;
    if (pickupType === 'scheduled' && !selectedTime) {
      toast.error(t.checkout.selectPickupTime);
      return;
    }

    // Validate delivery items (delivery is disabled for now)
    if (orderType === 'delivery') {
      toast.error('Delivery is coming soon! Please select pickup for now.');
      return;
    }

    try {
      const orderData = {
        customerName,
        customerPhone: phone,
        customerEmail: email || undefined,
        orderType,
        pickupTime,
        paymentMethod,
        customerNotes: undefined,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          unitPrice: Number(item.menuItem.takeaway_price),
          selectedAddOns: item.selectedAddOns.map(a => a.id),
          specialNotes: item.notes,
        })),
      };

      const order = await createOrderMutation.mutateAsync(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    }
  };

  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl">{t.checkout.title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Order Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="p-4">
            <h2 className="mb-4">Order Type</h2>
            <RadioGroup value={orderType} disabled>
              <div className="flex items-center space-x-2 p-3 border rounded-lg mb-2 bg-orange-50">
                <RadioGroupItem value="pickup" id="pickup" checked />
                <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                  <div>Pickup</div>
                  <div className="text-sm text-gray-500">Collect from store</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-100 opacity-60 cursor-not-allowed">
                <RadioGroupItem value="delivery" id="delivery" disabled />
                <Label htmlFor="delivery" className="flex-1 cursor-not-allowed">
                  <div>Delivery</div>
                  <div className="text-sm text-gray-500">Coming Soon</div>
                </Label>
              </div>
            </RadioGroup>
          </Card>
        </motion.div>

        {/* Pickup Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2>{orderType === 'pickup' ? t.checkout.selectPickupTime : 'Select Delivery Time'}</h2>
            </div>
            
            <RadioGroup value={pickupType} onValueChange={(value: any) => setPickupType(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="asap" id="asap" />
                <Label htmlFor="asap" className="flex-1 cursor-pointer">
                  <div>ASAP</div>
                  <div className="text-sm text-gray-500">Ready in 15-20 minutes</div>
                </Label>
              </div>
              {/* Scheduled pickup hidden for now */}
            </RadioGroup>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-orange-500" />
              <h2>{t.checkout.customerDetails}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t.checkout.name} *</Label>
                <Input
                  id="name"
                  placeholder={t.checkout.namePlaceholder}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">{t.checkout.phone} *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.checkout.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email ({t.common.optional})</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <h2>Payment Method</h2>
            </div>
            
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg mb-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                  <div>Pay at Pickup</div>
                  <div className="text-sm text-gray-500">Cash or card at counter</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">
                  <div>Pay Online</div>
                  <div className="text-sm text-gray-500">Stripe card payment</div>
                </Label>
              </div>
            </RadioGroup>
          </Card>
        </motion.div>

        {/* Order Summary */}
        <Card className="p-4">
          <h2 className="mb-3">{t.checkout.orderSummary}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{t.checkout.items} ({cart.length})</span>
              <span>{t.common.currency}{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>VAT (10%)</span>
              <span>{t.common.currency}{(getCartTotal() * 0.1).toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg">
              <span>{t.common.total}</span>
              <span className="text-orange-600">{t.common.currency}{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
            onClick={handlePlaceOrder}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? t.checkout.processing : `${t.checkout.placeOrder} · ${t.common.currency}${total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};