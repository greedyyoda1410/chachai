// Mock data for Cha Chai ordering system

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  takeawayPrice: number;
  image: string;
  available: boolean;
  addOns?: string[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  group: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  items: CartItem[];
  total: number;
  status: 'received' | 'preparing' | 'ready' | 'completed';
  pickupTime: string;
  placedAt: Date;
  notes?: string;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedAddOns: AddOn[];
  notes?: string;
}

export const categories: Category[] = [
  { id: 'tea', name: 'Tea', icon: '🍵' },
  { id: 'rolls', name: 'Rolls', icon: '🌯' },
  { id: 'toast', name: 'Toast', icon: '🍞' },
  { id: 'snacks', name: 'Snacks', icon: '🥟' },
  { id: 'pitha', name: 'Pitha', icon: '🥞' },
  { id: 'juice', name: 'Juice', icon: '🧃' },
  { id: 'addons', name: 'Add-Ons', icon: '➕' },
];

export const menuItems: MenuItem[] = [
  // Tea
  {
    id: '1',
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea with aromatic spices',
    category: 'tea',
    price: 3.99,
    takeawayPrice: 3.49,
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f',
    available: true,
  },
  {
    id: '2',
    name: 'Green Tea',
    description: 'Light and refreshing green tea',
    category: 'tea',
    price: 2.99,
    takeawayPrice: 2.49,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9',
    available: true,
  },
  {
    id: '3',
    name: 'Ginger Lemon Tea',
    description: 'Warming ginger tea with a hint of lemon',
    category: 'tea',
    price: 3.49,
    takeawayPrice: 2.99,
    image: 'https://images.unsplash.com/photo-1597318560233-69470c4d26ea',
    available: true,
  },
  // Rolls
  {
    id: '4',
    name: 'Chicken Roll',
    description: 'Grilled chicken with fresh vegetables wrapped in paratha',
    category: 'rolls',
    price: 8.99,
    takeawayPrice: 7.99,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
    available: true,
    addOns: ['extra-sauce', 'extra-chicken', 'cheese'],
  },
  {
    id: '5',
    name: 'Egg Roll',
    description: 'Classic egg roll with onions and spices',
    category: 'rolls',
    price: 5.99,
    takeawayPrice: 4.99,
    image: 'https://images.unsplash.com/photo-1612392062798-2ceffb9da77d',
    available: true,
    addOns: ['extra-sauce', 'cheese'],
  },
  {
    id: '6',
    name: 'Paneer Roll',
    description: 'Cottage cheese with vegetables in a soft paratha',
    category: 'rolls',
    price: 7.99,
    takeawayPrice: 6.99,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
    available: true,
    addOns: ['extra-sauce', 'extra-paneer', 'cheese'],
  },
  // Toast
  {
    id: '7',
    name: 'Butter Toast',
    description: 'Crispy toast with rich butter',
    category: 'toast',
    price: 2.99,
    takeawayPrice: 2.49,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
    available: true,
  },
  {
    id: '8',
    name: 'Cheese Toast',
    description: 'Golden toast with melted cheese',
    category: 'toast',
    price: 4.99,
    takeawayPrice: 4.49,
    image: 'https://images.unsplash.com/photo-1619574038641-f77aed76b370',
    available: true,
  },
  // Snacks
  {
    id: '9',
    name: 'Samosa',
    description: 'Crispy pastry filled with spiced potatoes',
    category: 'snacks',
    price: 3.49,
    takeawayPrice: 2.99,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
    available: true,
  },
  {
    id: '10',
    name: 'Pakora',
    description: 'Mixed vegetable fritters',
    category: 'snacks',
    price: 4.99,
    takeawayPrice: 4.49,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be',
    available: true,
  },
  // Pitha
  {
    id: '11',
    name: 'Chitoi Pitha',
    description: 'Traditional rice pancake',
    category: 'pitha',
    price: 3.99,
    takeawayPrice: 3.49,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    available: true,
  },
  // Juice
  {
    id: '12',
    name: 'Mango Juice',
    description: 'Fresh mango juice',
    category: 'juice',
    price: 4.99,
    takeawayPrice: 4.49,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4',
    available: true,
  },
  {
    id: '13',
    name: 'Orange Juice',
    description: 'Freshly squeezed orange juice',
    category: 'juice',
    price: 4.49,
    takeawayPrice: 3.99,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
    available: true,
  },
];

export const addOns: AddOn[] = [
  { id: 'extra-sauce', name: 'Extra Sauce', price: 0.5, group: 'Roll Add-Ons' },
  { id: 'extra-chicken', name: 'Extra Chicken', price: 2.0, group: 'Roll Add-Ons' },
  { id: 'extra-paneer', name: 'Extra Paneer', price: 1.5, group: 'Roll Add-Ons' },
  { id: 'cheese', name: 'Cheese Slice', price: 1.0, group: 'Roll Add-Ons' },
];

export const timeSlots = [
  '10:15 AM',
  '10:30 AM',
  '10:45 AM',
  '11:00 AM',
  '11:15 AM',
  '11:30 AM',
  '11:45 AM',
  '12:00 PM',
  '12:15 PM',
  '12:30 PM',
  '12:45 PM',
  '1:00 PM',
  '1:15 PM',
  '1:30 PM',
];
