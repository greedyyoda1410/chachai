import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCurrentAdmin } from '../../../lib/supabase/auth';
import { AdminCategories } from './AdminCategories';
import { AdminMenuItems } from './AdminMenuItems';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export const AdminMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');

  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await getCurrentAdmin();
      setIsAdmin(!!admin);
    };
    checkAdmin();
  }, []);

  // Determine active tab from URL
  useEffect(() => {
    if (location.pathname.includes('/menu/items')) {
      setActiveTab('items');
    } else {
      setActiveTab('categories');
    }
  }, [location.pathname]);

  // Show loading while checking auth
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleTabChange = (value: string) => {
    if (value === 'categories') {
      navigate('/admin/menu');
      setActiveTab('categories');
    } else if (value === 'items') {
      navigate('/admin/menu/items');
      setActiveTab('items');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Tabs */}
      <div className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl">Menu Management</h1>
              <p className="text-sm text-gray-400">Manage categories and menu items</p>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="bg-transparent border-b border-white/20 p-0 h-auto">
              <TabsTrigger 
                value="categories" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 hover:text-white px-6 py-3 rounded-t-lg"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger 
                value="items"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 hover:text-white px-6 py-3 rounded-t-lg"
              >
                Menu Items
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsContent value="categories" className="mt-0">
          <AdminCategories />
        </TabsContent>

        <TabsContent value="items" className="mt-0">
          <AdminMenuItems />
        </TabsContent>
      </Tabs>
    </div>
  );
};

