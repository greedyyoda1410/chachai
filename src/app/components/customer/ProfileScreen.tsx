import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, History, Settings, ChevronRight, Globe, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDailyOrderNumber } from '../../../lib/services/orders';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, language, setLanguage } = useApp();
  // TODO: Fetch user orders using useOrders hook when needed
  const t = useTranslation();
  const [languageDialogOpen, setLanguageDialogOpen] = React.useState(false);

  // TODO: Implement order fetching for user profile
  const pastOrders: any[] = [];

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English' },
    { code: 'bn' as const, name: 'Bangla', nativeName: 'বাংলা' },
  ];

  const currentLanguageName = languages.find(l => l.code === language)?.nativeName || 'English';

  const handleLanguageChange = (langCode: 'en' | 'bn') => {
    const selectedLanguage = languages.find(l => l.code === langCode);
    setLanguage(langCode);
    setLanguageDialogOpen(false);
    toast.success(`Language changed to ${selectedLanguage?.name}`);
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
          <h1 className="text-2xl">{t.profile.title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl mb-1">{user?.name || t.profile.guest}</h2>
                {user?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                {t.common.edit}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl text-orange-600 mb-1">{pastOrders.length}</div>
                <div className="text-sm text-gray-600">{t.adminDashboard.totalOrders}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl text-green-600 mb-1">{pastOrders.filter((o: any) => o.status === 'completed').length}</div>
                <div className="text-sm text-gray-600">{t.orderStatuses.completed}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-orange-600" />
                <h2>{t.profile.orderHistory}</h2>
              </div>
              {pastOrders.length > 3 && (
                <Button variant="link" className="text-orange-600 p-0">
                  {t.common.viewAll}
                </Button>
              )}
            </div>

            {pastOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <p>{t.profile.noOrders}</p>
                <Button
                  size="sm"
                  className="mt-4 bg-orange-500 hover:bg-orange-600"
                  onClick={() => navigate('/home')}
                >
                  {t.common.orderNow}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {pastOrders.slice(0, 5).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors"
                    onClick={() => navigate(`/order-status/${order.id}`)}
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">
                        {order.status === 'completed' ? '✅' : 
                         order.status === 'ready' ? '🔔' : 
                         order.status === 'preparing' ? '👨‍🍳' : '📦'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{t.orderStatus.orderNumber}{formatDailyOrderNumber(order.daily_order_number, order.order_date)}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.placed_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {(order.items as any[])?.length || 0} {t.checkout.items} · {t.common.currency}{Number(order.total).toFixed(2)}
                      </div>
                      <div className="text-xs text-orange-600 mt-1 capitalize">
                        {t.orderStatuses[order.status as keyof typeof t.orderStatuses] || order.status}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}

                {pastOrders.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/home')}
                    >
                      Reorder Favorite
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-orange-600" />
              <h2>Settings</h2>
            </div>
            
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>Notification Preferences</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-3"
                onClick={() => setLanguageDialogOpen(true)}
              >
                <span>{t.profile.language}</span>
                <span className="flex items-center gap-2 text-gray-600">
                  {currentLanguageName} <ChevronRight className="w-5 h-5 text-gray-400" />
                </span>
              </Button>
              <Button variant="ghost" className="w-full justify-between h-auto py-3">
                <span>About Cha Chai</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto py-3 text-orange-600"
                onClick={() => navigate('/admin')}
              >
                {t.profile.adminPanel}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Language Dialog */}
      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-600" />
                <span>{t.profile.selectLanguage}</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              Select the language you want to use for the app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {languages.map(lang => (
              <button
                key={lang.code}
                type="button"
                className={`w-full rounded-lg px-4 py-4 text-left transition-colors ${
                  language === lang.code 
                    ? "bg-orange-50 hover:bg-orange-100 border-2 border-orange-200" 
                    : "bg-white hover:bg-gray-50 border-2 border-gray-200"
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 flex items-center justify-center ${
                    language === lang.code ? "text-orange-600" : "text-transparent"
                  }`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-sm text-gray-500">{lang.nativeName}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};