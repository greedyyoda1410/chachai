import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useMenuItem } from '../../hooks/useMenuItems';
import { useAddOnsForMenuItem } from '../../hooks/useAddOns';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

export const ItemDetailScreen: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { addToCart, language } = useApp();
  const t = useTranslation();
  const { data: item, isLoading } = useMenuItem(itemId);
  const { data: availableAddOns = [] } = useAddOnsForMenuItem(itemId);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Item not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    const basePrice = Number(item.takeaway_price) * quantity;
    const addOnsPrice = selectedAddOns.reduce((sum, addonId) => {
      const addon = availableAddOns.find(a => a.id === addonId);
      return sum + Number(addon?.price || 0);
    }, 0) * quantity;
    return basePrice + addOnsPrice;
  };

  const handleAddToCart = () => {
    const selectedAddOnObjects = availableAddOns.filter(addon => 
      selectedAddOns.includes(addon.id)
    );
    addToCart(item, quantity, selectedAddOnObjects, notes);
    toast.success(`${language === 'bn' ? item.name_bn : item.name_en} ${t.itemDetail.itemAdded}`);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header Image */}
      <div className="relative h-64 bg-gray-200">
        <img
          src={item.image_url || ''}
          alt={language === 'bn' ? item.name_bn : item.name_en}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-8xl">🍽️</div>';
            }
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/90 hover:bg-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-t-3xl shadow-lg p-6"
        >
          {/* Item Info */}
          <div className="mb-6">
            <h1 className="text-2xl mb-2">{language === 'bn' ? item.name_bn : item.name_en}</h1>
            <p className="text-gray-600 mb-4">
              {language === 'bn' ? item.description_bn : item.description_en}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-2xl text-orange-600">
                {t.common.currency}{Number(item.takeaway_price).toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">{t.menuList.takeaway}</span>
              <span className="text-sm text-gray-500">
                • {item.prep_time_minutes} {t.orderConfirmation.minutes}
              </span>
            </div>
          </div>

          {/* Add-Ons Section */}
          {availableAddOns.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3">{t.itemDetail.selectAddOns}</h2>
              <div className="space-y-3">
                {availableAddOns.map(addon => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors"
                    onClick={() => toggleAddOn(addon.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedAddOns.includes(addon.id)}
                        onCheckedChange={() => toggleAddOn(addon.id)}
                      />
                      <span>{language === 'bn' ? addon.name_bn : addon.name_en}</span>
                    </div>
                    <span className="text-orange-600">
                      +{t.common.currency}{Number(addon.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <h2 className="mb-3">Quantity</h2>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="mb-6">
            <h2 className="mb-3">{t.itemDetail.specialInstructions} ({t.common.optional})</h2>
            <Textarea
              placeholder={t.itemDetail.instructionsPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </motion.div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600">{t.common.total}</div>
            <div className="text-2xl text-orange-600">{t.common.currency}{calculateTotal().toFixed(2)}</div>
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600 flex-1 max-w-xs h-12"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {t.common.addToCart}
          </Button>
        </div>
      </div>
    </div>
  );
};
