import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from './components/ui/sonner';

// Customer Screens
import { SplashScreen } from './components/customer/SplashScreen';
import { HomeScreen } from './components/customer/HomeScreen';
import { MenuListScreen } from './components/customer/MenuListScreen';
import { ItemDetailScreen } from './components/customer/ItemDetailScreen';
import { CartScreen } from './components/customer/CartScreen';
import { CheckoutScreen } from './components/customer/CheckoutScreen';
import { OrderConfirmationScreen } from './components/customer/OrderConfirmationScreen';
import { OrderStatusScreen } from './components/customer/OrderStatusScreen';
import { OrderTrackingScreen } from './components/customer/OrderTrackingScreen';
import { ProfileScreen } from './components/customer/ProfileScreen';

// Admin Screens
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminReports } from './components/admin/AdminReports';
import { AdminMenu } from './components/admin/AdminMenu';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminMenuItems } from './components/admin/AdminMenuItems';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/menu/:categoryId" element={<MenuListScreen />} />
          <Route path="/item/:itemId" element={<ItemDetailScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationScreen />} />
          <Route path="/order-status/:orderId" element={<OrderStatusScreen />} />
          <Route path="/track/:token" element={<OrderTrackingScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/menu/items" element={<AdminMenu />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/menu-items" element={<AdminMenuItems />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AppProvider>
    </BrowserRouter>
  );
}
