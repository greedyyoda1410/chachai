import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider, useApp } from '../../../contexts/AppContext';
import { CartScreen } from '../CartScreen';
import type { MenuItemWithCategory } from '../../../../lib/services/menuItems';
import type { AddOn } from '../../../../lib/services/addOns';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockMenuItem: MenuItemWithCategory = {
  id: '1',
  name_en: 'Chicken Roll',
  name_bn: 'চিকেন রোল',
  description_en: 'Grilled chicken roll',
  description_bn: 'গ্রিল করা চিকেন রোল',
  takeaway_price: '100',
  dine_in_price: '120',
  category_id: 'cat1',
  is_available: true,
  is_for_sale: true,
  image_url: null,
  category: {
    id: 'cat1',
    name_en: 'Rolls',
    name_bn: 'রোল',
    icon_url: null,
    display_order: 1,
  },
};

const mockAddOn: AddOn = {
  id: 'addon1',
  name_en: 'Extra Sauce',
  name_bn: 'এক্সট্রা সস',
  price: '10',
  category_id: 'cat1',
  is_available: true,
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AppProvider>
      {children}
    </AppProvider>
  </BrowserRouter>
);

describe('CartScreen', () => {
  beforeEach(() => {
    // Clear any previous state
  });

  it('should display empty cart message when cart is empty', () => {
    render(
      <TestWrapper>
        <CartScreen />
      </TestWrapper>
    );

    // Check for empty cart text - it comes from translations
    // English: "Your cart is empty" and "Start adding some delicious items!"
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Start adding/i)).toBeInTheDocument();
  });

  it('should display cart items when cart has items', async () => {
    const TestComponent = () => {
      const { addToCart } = useApp();
      
      React.useEffect(() => {
        addToCart(mockMenuItem, 2, [mockAddOn]);
      }, []);

      return <CartScreen />;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/chicken roll/i)).toBeInTheDocument();
    });
  });

  it('should calculate and display total correctly', async () => {
    const TestComponent = () => {
      const { addToCart } = useApp();
      
      React.useEffect(() => {
        addToCart(mockMenuItem, 2, [mockAddOn]);
      }, []);

      return <CartScreen />;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      // Item: 100 * 2 = 200, AddOn: 10 * 2 = 20, Subtotal: 220, VAT: 22, Total: 242
      // Check for total amount - it might be split across nodes, so check for "242" anywhere
      const container = document.body;
      expect(container.textContent).toContain('242');
    }, { timeout: 3000 });
  });
});

