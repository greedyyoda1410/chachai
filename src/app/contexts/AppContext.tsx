import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { MenuItemWithCategory } from '../../lib/services/menuItems';
import type { AddOn } from '../../lib/services/addOns';
import type { OrderWithItems } from '../../lib/services/orders';

export interface CartItem {
  id: string;
  menuItem: MenuItemWithCategory;
  quantity: number;
  selectedAddOns: AddOn[];
  notes?: string;
}

interface User {
  name: string;
  phone: string;
  email?: string;
}

export type Language = 'en' | 'bn';

interface AppState {
  // Cart (local state)
  cart: CartItem[];
  addToCart: (item: MenuItemWithCategory, quantity: number, addOns: AddOn[], notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  
  // User
  user: User | null;
  setUser: (user: User) => void;
  
  // Language
  language: Language;
  setLanguage: (language: Language) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const addToCart = (item: MenuItemWithCategory, quantity: number, addOns: AddOn[], notes?: string) => {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedAddOns: addOns,
      notes,
    };
    setCart([...cart, cartItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartItem = (itemId: string, quantity: number) => {
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = Number(item.menuItem.takeaway_price) * item.quantity;
      const addOnsPrice = item.selectedAddOns.reduce((sum, addOn) => sum + Number(addOn.price), 0) * item.quantity;
      return total + itemPrice + addOnsPrice;
    }, 0);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider
        value={{
          cart,
          addToCart,
          removeFromCart,
          updateCartItem,
          clearCart,
          getCartTotal,
          user,
          setUser,
          language,
          setLanguage,
        }}
      >
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};