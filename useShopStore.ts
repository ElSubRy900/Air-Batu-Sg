import { useState, useEffect } from 'react';
import { Order, OrderStatus, CartItem } from './types.ts';
import { 
  ALL_PRODUCT_IDS, 
  INITIAL_STOCK_COUNT 
} from './constants.ts';

const LOCAL_STORAGE_KEYS = {
  ORDERS: 'kampung-chill-orders-v1',
  STOCKS: 'kampung-chill-stocks-v1',
  SHOP_STATUS: 'kampung-chill-status-v1',
  ACTIVE_ORDER: 'active-order-id-v3'
};

export const useShopStore = () => {
  // Initialize state from LocalStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [productStocks, setProductStocks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.STOCKS);
    if (saved) return JSON.parse(saved);
    const initial: Record<string, number> = {};
    ALL_PRODUCT_IDS.forEach(id => initial[id] = INITIAL_STOCK_COUNT);
    return initial;
  });

  const [isShopOpen, setIsShopOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOP_STATUS);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [activeOrderID, setActiveOrderID] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_ORDER);
  });

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STOCKS, JSON.stringify(productStocks));
  }, [productStocks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SHOP_STATUS, JSON.stringify(isShopOpen));
  }, [isShopOpen]);

  // Handle storage sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEYS.ORDERS && e.newValue) setOrders(JSON.parse(e.newValue));
      if (e.key === LOCAL_STORAGE_KEYS.STOCKS && e.newValue) setProductStocks(JSON.parse(e.newValue));
      if (e.key === LOCAL_STORAGE_KEYS.SHOP_STATUS && e.newValue) setIsShopOpen(JSON.parse(e.newValue));
      if (e.key === LOCAL_STORAGE_KEYS.ACTIVE_ORDER) setActiveOrderID(e.newValue);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const placeOrder = async (name: string, phone: string, cart: CartItem[]) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const id = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const newOrder: Order = {
      id,
      customerName: name,
      customerPhone: phone,
      items: [...cart],
      total,
      status: 'pending',
      timestamp: Date.now()
    };

    // Update Stocks Locally
    const nextStocks = { ...productStocks };
    cart.forEach(item => {
      const current = nextStocks[item.id] || 0;
      nextStocks[item.id] = Math.max(0, current - item.quantity);
    });

    setOrders(prev => [newOrder, ...prev]);
    setProductStocks(nextStocks);
    setActiveOrderID(id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_ORDER, id);
    
    return id;
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const updateStock = async (id: string, delta: number) => {
    setProductStocks(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const restockAll = async () => {
    const initial: Record<string, number> = {};
    ALL_PRODUCT_IDS.forEach(id => initial[id] = INITIAL_STOCK_COUNT);
    setProductStocks(initial);
  };

  const toggleShopStatus = async () => {
    setIsShopOpen(prev => !prev);
  };

  const clearHistory = async () => {
    // Only clear completed/cancelled orders
    setOrders(prev => prev.filter(o => ['pending', 'accepted', 'ready'].includes(o.status)));
  };

  const clearActiveOrder = () => {
    setActiveOrderID(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACTIVE_ORDER);
  };

  const setActiveOrderIDWrapper = (id: string) => {
    setActiveOrderID(id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_ORDER, id);
  };

  return {
    orders,
    productStocks,
    isShopOpen,
    activeOrderID,
    syncStatus,
    placeOrder,
    updateOrderStatus,
    updateStock,
    restockAll,
    toggleShopStatus,
    clearHistory,
    clearActiveOrder,
    setActiveOrderID: setActiveOrderIDWrapper
  };
};