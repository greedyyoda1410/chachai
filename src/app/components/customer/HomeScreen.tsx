import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { cart, language } = useApp();
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: categories = [], isLoading, error } = useCategories(true);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/menu/${categoryId}`);
  };

  // Get translated category names
  const getCategoryName = (category: { name_en: string; name_bn: string }) => {
    return language === 'bn' ? category.name_bn : category.name_en;
  };

  // Get category icon (fallback to emoji based on category name)
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, string> = {
      'Breakfast': '🍳',
      'Tea': '🍵',
      'Coffee': '☕',
      'Fried Snacks': '🥟',
      'Rolls': '🌯',
      'Fuchka': '🥟',
      'Pitha': '🥞',
      'Juice': '🧃',
      'Add-Ons': '➕',
    };
    return iconMap[categoryName] || '📦';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/profile')}
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            <h1 className="text-2xl">{t.home.title}</h1>
            
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

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t.home.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/90 border-none"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-xl mb-4 text-gray-800">{t.home.categories}</h2>
        
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            Failed to load categories. Please try again.
          </div>
        )}

        {!isLoading && !error && categories && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-28 flex flex-col items-center justify-center gap-2 bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-400 transition-all"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <span className="text-4xl">{category.icon_url || getCategoryIcon(category.name_en)}</span>
                  <span className="text-sm">{getCategoryName(category)}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-8">
          <h2 className="text-xl mb-4 text-gray-800">{t.home.popularItems}</h2>
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🌯</div>
              <div className="flex-1">
                <h3 className="text-lg text-gray-900 mb-1">{t.home.featuredTitle}</h3>
                <p className="text-sm text-gray-600 mb-2">{t.home.featuredDescription}</p>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => navigate('/menu/rolls')}
                >
                  {t.common.orderNow}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-orange-500 text-2xl mb-2">⚡</div>
            <h3 className="text-sm mb-1">Fast Pickup</h3>
            <p className="text-xs text-gray-600">Ready in 15-20 mins</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-orange-500 text-2xl mb-2">🎯</div>
            <h3 className="text-sm mb-1">Fresh & Hot</h3>
            <p className="text-xs text-gray-600">Made to order</p>
          </div>
        </div>
      </div>
    </div>
  );
};