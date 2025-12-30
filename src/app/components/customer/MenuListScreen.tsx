import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCategory } from '../../hooks/useCategories';
import { useMenuItems } from '../../hooks/useMenuItems';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export const MenuListScreen: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { cart, language } = useApp();
  const t = useTranslation();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: category, isLoading: categoryLoading } = useCategory(categoryId);
  const { data: items = [], isLoading: itemsLoading } = useMenuItems(categoryId, true);

  const handleQuantityChange = (itemId: string, delta: number) => {
    const current = quantities[itemId] || 0;
    const newQuantity = Math.max(0, current + delta);
    setQuantities({ ...quantities, [itemId]: newQuantity });
  };

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  if (categoryLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Category not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const categoryName = language === 'bn' ? category.name_bn : category.name_en;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl">{categoryName}</h1>
              <p className="text-sm text-white/80">{items.length} {t.checkout.items}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 relative"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs p-0">
                {cart.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`overflow-hidden ${!item.is_available ? 'opacity-50' : ''}`}>
              <div className="flex gap-4 p-4">
                {/* Image */}
                <div
                  className="w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0 cursor-pointer overflow-hidden"
                  onClick={() => handleItemClick(item.id)}
                >
                  <img
                    src={item.image_url || ''}
                    alt={language === 'bn' ? item.name_bn : item.name_en}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-4xl">🍽️</div>';
                      }
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 cursor-pointer" onClick={() => handleItemClick(item.id)}>
                    <h3 className="mb-1">{language === 'bn' ? item.name_bn : item.name_en}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {language === 'bn' ? item.description_bn : item.description_en}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">
                        {t.common.currency}{Number(item.takeaway_price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.prep_time_minutes} {t.orderConfirmation.minutes}
                      </span>
                    </div>
                  </div>

                  {/* Add Button */}
                  <div className="mt-2">
                    {!item.is_available ? (
                      <div className="text-sm text-gray-500">{t.menuList.unavailable}</div>
                    ) : quantities[item.id] > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{quantities[item.id]}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => handleItemClick(item.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {!item.is_available && (
                <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  {t.menuList.unavailable}
                </div>
              )}
            </Card>
          </motion.div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No items available in this category
          </div>
        )}
      </div>
    </div>
  );
};
