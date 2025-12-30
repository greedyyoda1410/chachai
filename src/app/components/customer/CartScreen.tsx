import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';

export const CartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartItem, getCartTotal, clearCart, language } = useApp();
  const t = useTranslation();

  const subtotal = getCartTotal();
  const vat = subtotal * 0.1; // 10% VAT
  const total = subtotal + vat;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl">{t.cart.title}</h1>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl mb-2 text-gray-800">{t.cart.emptyCart}</h2>
          <p className="text-gray-600 mb-6 text-center">{t.cart.emptyCartDescription}</p>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => navigate('/home')}
          >
            {t.cart.browseMenu}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl">{t.cart.title}</h1>
              <p className="text-sm text-white/80">{cart.length} {t.checkout.items}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={clearCart}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {cart.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex gap-4">
                <img
                  src={item.menuItem.image_url || ''}
                  alt={language === 'bn' ? item.menuItem.name_bn : item.menuItem.name_en}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<div class="w-20 h-20 flex items-center justify-center bg-gray-200 text-2xl rounded-lg">🍽️</div>';
                    }
                  }}
                />
                
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <h3>{language === 'bn' ? item.menuItem.name_bn : item.menuItem.name_en}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {item.selectedAddOns.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                      {t.addOns.title}: {item.selectedAddOns.map(a => language === 'bn' ? a.name_bn : a.name_en).join(', ')}
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="text-sm text-gray-600 mb-2">
                      {t.common.notes}: {item.notes}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <span className="text-orange-600">
                      {t.common.currency}{((Number(item.menuItem.takeaway_price) + item.selectedAddOns.reduce((sum, a) => sum + Number(a.price), 0)) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Summary */}
        <Card className="p-4 mt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{t.common.subtotal}</span>
              <span>{t.common.currency}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>VAT (10%)</span>
              <span>{t.common.currency}{vat.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Estimated prep time: {Math.max(...cart.map(item => item.menuItem.prep_time_minutes))} {t.orderConfirmation.minutes}
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg">
              <span>{t.common.total}</span>
              <span className="text-orange-600">{t.common.currency}{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
            onClick={() => navigate('/checkout')}
          >
            {t.cart.proceedToCheckout} · {t.common.currency}{total.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
};