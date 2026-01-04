import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import StaffDashboardModal from './components/StaffDashboardModal';
import OrderReceipt from './components/OrderReceipt';
import FindOrderModal from './components/FindOrderModal';
import LiveStatusBoard from './components/LiveStatusBoard';
import { Product, CartItem, Order, OrderStatus } from './types';
import { PRODUCTS, PICKUP_LOCATION, BUSINESS_NAME, ORDER_NOTIFICATION_SOUND } from './constants';
import { getFlavorRecommendation } from './services/geminiService';

const STOCK_STORAGE_KEY = 'air-batu-stock-v3';
const ORDERS_STORAGE_KEY = 'air-batu-orders-v3';
const ACTIVE_ORDER_ID_KEY = 'active-order-id-v3';
const CUSTOMER_THEME_KEY = 'air-batu-theme-customer';
const STAFF_THEME_KEY = 'air-batu-theme-staff';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  const [productStocks, setProductStocks] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [activeOrderID, setActiveOrderID] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [staffTheme, setStaffTheme] = useState<'dark' | 'light'>('dark');
  
  const hasFetchedRec = useRef(false);

  // Initial setup: Loads stock, orders, and theme preferences
  useEffect(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedCustomerTheme = localStorage.getItem(CUSTOMER_THEME_KEY) as 'dark' | 'light' | null;
    setTheme(savedCustomerTheme || (systemPrefersDark ? 'dark' : 'light'));

    const savedStaffTheme = localStorage.getItem(STAFF_THEME_KEY) as 'dark' | 'light' | null;
    setStaffTheme(savedStaffTheme || 'dark');

    const savedStock = localStorage.getItem(STOCK_STORAGE_KEY);
    if (savedStock) {
      setProductStocks(JSON.parse(savedStock));
    } else {
      const initialStock: Record<string, number> = {};
      PRODUCTS.forEach(p => initialStock[p.id] = 20);
      setProductStocks(initialStock);
    }

    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedActiveID = localStorage.getItem(ACTIVE_ORDER_ID_KEY);
    if (savedActiveID) setActiveOrderID(savedActiveID);
  }, []);

  // Synchronize theme state with the document class for global CSS variable updates
  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  // AI Recommendation Fetch (Non-blocking)
  useEffect(() => {
    if (!hasFetchedRec.current) {
      hasFetchedRec.current = true;
      const fetchRecommendation = async () => {
        try {
          const rec = await getFlavorRecommendation('Happy', 'Hot');
          setAiRecommendation(rec);
        } catch (err) {
          console.error("AI Recommendation failed:", err);
          setAiRecommendation("The kampung spirits recommend: A juicy Watermelon stick for these sunny vibes!");
        }
      };
      
      const timer = setTimeout(fetchRecommendation, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const addToCart = (product: Product) => {
    const totalStock = productStocks[product.id] || 0;
    const existingInCart = cart.find(item => item.id === product.id)?.quantity || 0;
    if (existingInCart >= totalStock) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const placeOrder = (customerName: string, customerPhone: string) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const updatedStocks = { ...productStocks };
    cart.forEach(item => {
      updatedStocks[item.id] = Math.max(0, (updatedStocks[item.id] || 0) - item.quantity);
    });
    setProductStocks(updatedStocks);
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(updatedStocks));

    const newOrderID = Math.random().toString(36).substr(2, 4).toUpperCase();
    const newOrder: Order = {
      id: newOrderID,
      customerName,
      customerPhone,
      items: [...cart],
      total: subtotal,
      status: 'pending',
      timestamp: Date.now()
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    
    setActiveOrderID(newOrderID);
    localStorage.setItem(ACTIVE_ORDER_ID_KEY, newOrderID);
    setCart([]);
  };

  const handleFindOrder = (input: string, type: 'id' | 'phone') => {
    let foundOrder: Order | undefined;
    if (type === 'id') {
      const id = input.toUpperCase().replace('#', '');
      foundOrder = orders.find(o => o.id === id);
    } else {
      const cleanPhone = input.replace(/\D/g, '');
      foundOrder = [...orders].reverse().find(o => o.customerPhone.replace(/\D/g, '') === cleanPhone);
    }

    if (foundOrder) {
      if (['completed', 'cancelled'].includes(foundOrder.status)) {
        alert("This order is finalized or cancelled.");
      } else {
        setActiveOrderID(foundOrder.id);
        localStorage.setItem(ACTIVE_ORDER_ID_KEY, foundOrder.id);
        setIsFindModalOpen(false);
      }
    } else {
      alert("No active order found.");
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (activeOrderID && !isAdmin) {
    const currentOrder = orders.find(o => o.id === activeOrderID);
    if (currentOrder && !['completed', 'cancelled'].includes(currentOrder.status)) {
      return (
        <div className={`theme-container min-h-screen w-full app-container transition-colors`}>
          <OrderReceipt order={currentOrder} onClose={() => {setActiveOrderID(null); localStorage.removeItem(ACTIVE_ORDER_ID_KEY);}} />
        </div>
      );
    } else {
      setActiveOrderID(null);
      localStorage.removeItem(ACTIVE_ORDER_ID_KEY);
    }
  }

  return (
    <div className={`theme-container app-container w-full mx-auto flex flex-col transition-colors relative`}>
      <div className="bg-red-600 text-white text-[10px] font-black py-3 uppercase tracking-widest overflow-hidden relative border-b border-red-500 w-full shrink-0">
        <div className="animate-marquee whitespace-nowrap">
          ✨ NEW FLAVORS JUST LANDED! ✨ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✨ HAND-PACKED WITH LOVE ✨ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✨ STAY COOL WITH KAMPUNG CHILL ✨
        </div>
      </div>

      <Navbar 
        cartCount={cartItemCount} 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenTrack={() => setIsFindModalOpen(true)}
        currentTheme={theme}
        onToggleTheme={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          localStorage.setItem(CUSTOMER_THEME_KEY, next);
        }}
      />

      <main className={`flex-1 px-4 sm:px-8 pt-4 w-full ${cartItemCount > 0 ? 'pb-32' : 'pb-20'}`}>
        <header className="mb-8 text-center flex flex-col items-center">
          <h1 className="font-kampung text-4xl sm:text-5xl md:text-6xl tracking-tighter leading-tight font-black text-gradient-primary mb-10 max-w-lg">
            AIR BATU MALAYSIA / ICE LOLLY MALAYSIA
          </h1>
          
          <div className="flex flex-col gap-3 items-center w-full">
            <div className="bg-slate-500/5 border border-[var(--border-color)] p-6 rounded-[2.5rem] shadow-lg w-full max-w-xs flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="theme-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">Our Promise</p>
                <p className="text-[var(--text-color)] text-[11px] font-bold">Hand-packed and frozen with love</p>
              </div>
              <div className="w-12 h-px bg-[var(--border-color)] opacity-50"></div>
              <div className="text-center">
                <p className="theme-text-muted text-[9px] uppercase font-black tracking-widest mb-1">Self Pickup @ Tengah</p>
                <strong className="text-[var(--text-color)] font-black text-xs tracking-tight">{PICKUP_LOCATION}</strong>
              </div>
            </div>
          </div>
        </header>

        <LiveStatusBoard orders={orders} />

        <section className="mb-8 w-full">
          <div className="relative bg-slate-500/5 border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center min-h-[120px] flex flex-col justify-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-3">AI Flavor Guide</h4>
            <p className="text-[var(--text-color)] font-bold text-sm sm:text-lg italic opacity-90">
              "{aiRecommendation || "The kampung guide is thinking..."}"
            </p>
          </div>
        </section>

        <section className="w-full">
          <div className="flex flex-col items-center mb-10">
            <h2 className="font-kampung text-4xl sm:text-5xl text-[var(--text-color)] uppercase tracking-tighter">Our Flavours</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 mt-3 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full">
            {PRODUCTS.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                currentStock={Math.max(0, (productStocks[product.id] || 0) - (cart.find(item => item.id === product.id)?.quantity || 0))} 
                isShopOpen={true} 
                onAddToCart={addToCart} 
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="px-8 py-20 text-center bg-slate-500/5 border-t border-[var(--border-color)] flex flex-col items-center gap-10 w-full transition-colors">
         <div className="flex flex-col items-center gap-2">
           <h3 className="text-gradient-primary font-kampung text-4xl font-black uppercase tracking-tighter">AIR BATU MALAYSIA</h3>
           <p className="text-[12px] font-black theme-text-muted uppercase tracking-[0.25em]">{PICKUP_LOCATION}</p>
         </div>
         
         <div className="flex flex-col items-center gap-6">
           <div className="flex flex-col items-center gap-1.5">
             <p className="text-[15px] font-black uppercase tracking-[0.15em] font-kampung text-gradient-primary">
               © 2026 AIR BATU MALAYSIA
             </p>
             <p className="text-[9px] font-black theme-text-muted uppercase tracking-[0.35em] opacity-80">
               ALL RIGHTS RESERVED.
             </p>
           </div>
           
           <button 
             onClick={() => setIsAdmin(true)} 
             className="text-[10px] text-slate-500 hover:text-emerald-500 underline uppercase font-bold tracking-widest transition-colors py-1"
           >
             Staff Access
           </button>
         </div>
      </footer>

      {/* Floating Cart Preview */}
      {cartItemCount > 0 && !isAdmin && (
        <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
          <div className="max-w-[500px] mx-auto w-full px-4 sm:px-0">
            <div className="pointer-events-auto theme-nav backdrop-blur-xl border-t px-6 py-6 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.2)] rounded-t-[2.5rem] border-x border-t border-[var(--border-color)]">
              <div className="flex flex-col">
                <span className="text-[9px] font-black theme-text-muted uppercase tracking-widest mb-0.5">Total Amount</span>
                <span className="font-kampung text-3xl text-[var(--text-color)] tracking-tighter leading-none">${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => setIsCartOpen(true)} className="bg-[var(--text-color)] text-[var(--bg-color)] font-black py-4 px-8 rounded-2xl flex items-center gap-3 hover:bg-emerald-400 active:scale-95 shadow-xl group">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-[var(--bg-color)] font-black">{cartItemCount}</span>
                </div>
                <span className="uppercase text-[11px] tracking-widest">Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} setCart={setCart} onOrderPlaced={placeOrder} />
      <FindOrderModal isOpen={isFindModalOpen} onClose={() => setIsFindModalOpen(false)} onFind={handleFindOrder} />
      <StaffDashboardModal 
        isOpen={isAdmin} 
        onClose={() => setIsAdmin(false)} 
        orders={orders} 
        onUpdateStatus={(id, status) => {
          const updated = orders.map(o => o.id === id ? { ...o, status } : o);
          setOrders(updated);
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
        }} 
        onClearOrders={() => {
          const filtered = orders.filter(o => ['pending', 'accepted', 'ready'].includes(o.status));
          setOrders(filtered);
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filtered));
        }} 
        stocks={productStocks} 
        onUpdateStock={(id, delta) => {
          const next = { ...productStocks, [id]: Math.max(0, (productStocks[id] || 0) + delta) };
          setProductStocks(next);
          localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(next));
        }} 
        onRestockAll={() => {
          const next: Record<string, number> = {};
          PRODUCTS.forEach(p => next[p.id] = 20);
          setProductStocks(next);
          localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(next));
        }} 
        currentTheme={staffTheme} 
        onToggleTheme={() => setStaffTheme(staffTheme === 'dark' ? 'light' : 'dark')} 
      />
    </div>
  );
};

export default App;