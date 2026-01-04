
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar.tsx';
import ProductCard from './components/ProductCard.tsx';
import Cart from './components/Cart.tsx';
import StaffDashboardModal from './components/StaffDashboardModal.tsx';
import OrderReceipt from './components/OrderReceipt.tsx';
import FindOrderModal from './components/FindOrderModal.tsx';
import LiveStatusBoard from './components/LiveStatusBoard.tsx';
import { Product, CartItem } from './types.ts';
import { PRODUCTS, PICKUP_LOCATION } from './constants.ts';
import { useShopStore } from './useShopStore.ts';

const THEME_KEYS = {
  CUSTOMER: 'air-batu-theme-customer',
  STAFF: 'air-batu-theme-staff'
};

const App: React.FC = () => {
  const store = useShopStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [staffTheme, setStaffTheme] = useState<'dark' | 'light'>('dark');
  
  const hasFetchedRec = useRef(false);

  // Sync Global Theme
  useEffect(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem(THEME_KEYS.CUSTOMER) as 'dark' | 'light';
    setTheme(saved || (systemPrefersDark ? 'dark' : 'light'));
    setStaffTheme((localStorage.getItem(THEME_KEYS.STAFF) as any) || 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  // AI RECOMMENDATION
  useEffect(() => {
    if (!hasFetchedRec.current) {
      hasFetchedRec.current = true;
      const fetchRecommendation = async () => {
        try {
          const { getFlavorRecommendation } = await import('./services/geminiService.ts');
          const rec = await getFlavorRecommendation('Happy', 'Hot');
          setAiRecommendation(rec);
        } catch (err) {
          setAiRecommendation("The kampung spirits recommend: A juicy Watermelon stick for these sunny vibes!");
        }
      };
      setTimeout(fetchRecommendation, 1500);
    }
  }, []);

  const addToCart = (product: Product) => {
    if (!store.isShopOpen) return;
    const currentStock = store.productStocks[product.id] || 0;
    const inCart = cart.find(item => item.id === product.id)?.quantity || 0;
    if (inCart >= currentStock) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handlePlaceOrder = async (name: string, phone: string) => {
    await store.placeOrder(name, phone, cart);
    setCart([]);
  };

  const handleFindOrder = (input: string, type: 'id' | 'phone') => {
    let found = type === 'id' 
      ? store.orders.find(o => o.id === input.toUpperCase().replace('#', ''))
      : [...store.orders].reverse().find(o => o.customerPhone.replace(/\D/g, '') === input.replace(/\D/g, ''));

    if (found) {
      if (['completed', 'cancelled'].includes(found.status)) {
        alert("This order is already finalized.");
      } else {
        store.setActiveOrderID(found.id);
        setIsFindModalOpen(false);
      }
    } else {
      alert("No active order found.");
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  // --- RENDERING ---

  if (store.activeOrderID && !isAdmin) {
    const currentOrder = store.orders.find(o => o.id === store.activeOrderID);
    if (currentOrder && !['completed', 'cancelled'].includes(currentOrder.status)) {
      return (
        <div className="theme-container min-h-screen w-full transition-colors">
          <OrderReceipt order={currentOrder} onClose={store.clearActiveOrder} />
        </div>
      );
    } else {
      store.clearActiveOrder();
    }
  }

  return (
    <div className="theme-container app-container w-full mx-auto flex flex-col transition-colors relative">
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
          localStorage.setItem(THEME_KEYS.CUSTOMER, next);
        }}
      />

      <main className={`flex-1 px-4 sm:px-8 pt-4 w-full ${cartItemCount > 0 ? 'pb-32' : 'pb-20'} relative`}>
        {!store.isShopOpen && (
          <div className="absolute inset-0 z-30 bg-[var(--bg-color)]/80 backdrop-blur-sm flex items-center justify-center p-8 text-center rounded-[2.5rem] mt-4 mb-20">
            <div className="flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              <h3 className="font-kampung text-4xl text-red-500 font-black uppercase tracking-tighter">Shop Closed</h3>
              <p className="text-lg font-bold theme-text-muted">We'll be back soon!</p>
            </div>
          </div>
        )}

        <header className="mb-8 text-center flex flex-col items-center">
          <h1 className="font-kampung text-4xl sm:text-5xl md:text-6xl tracking-tighter leading-tight font-black text-gradient-primary mb-10 max-w-lg">
            AIR BATU MALAYSIA
          </h1>
          
          <div className="bg-slate-500/5 border border-[var(--border-color)] p-6 rounded-[2.5rem] shadow-lg w-full max-w-xs flex flex-col items-center gap-4">
             <p className="theme-text-muted text-[10px] font-black uppercase tracking-[0.2em]">Self Pickup @ Tengah</p>
             <strong className="text-[var(--text-color)] font-black text-xs">{PICKUP_LOCATION}</strong>
          </div>
        </header>

        <LiveStatusBoard orders={store.orders} />

        <section className="mb-8 w-full">
          <div className="relative bg-slate-500/5 border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-2xl text-center min-h-[120px] flex flex-col justify-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-3">AI Flavor Guide</h4>
            <p className="text-[var(--text-color)] font-bold text-sm italic opacity-90">
              "{aiRecommendation || "Thinking of the perfect flavor for you..."}"
            </p>
          </div>
        </section>

        <section className="w-full">
          <div className="flex flex-col items-center mb-10">
            <h2 className="font-kampung text-4xl sm:text-5xl text-[var(--text-color)] uppercase tracking-tighter">Our Flavours</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-green-500 mt-3 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full">
            {PRODUCTS.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                currentStock={(store.productStocks[product.id] || 0) - (cart.find(item => item.id === product.id)?.quantity || 0)} 
                isShopOpen={store.isShopOpen} 
                onAddToCart={addToCart} 
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="px-8 py-20 text-center bg-slate-500/5 border-t border-[var(--border-color)] flex flex-col items-center gap-10 w-full transition-colors">
         <button onClick={() => setIsAdmin(true)} className="text-[10px] text-slate-500 hover:text-emerald-500 underline uppercase font-bold tracking-widest transition-colors py-1">
           Staff Access
         </button>
      </footer>

      {cartItemCount > 0 && !isAdmin && store.isShopOpen && (
        <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
          <div className="max-w-[500px] mx-auto w-full px-4">
            <div className="pointer-events-auto theme-nav backdrop-blur-xl border-t px-6 py-6 flex items-center justify-between shadow-2xl rounded-t-[2.5rem] border-x border-t border-[var(--border-color)]">
              <div className="flex flex-col">
                <span className="text-[9px] font-black theme-text-muted uppercase tracking-widest">Total Amount</span>
                <span className="font-kampung text-3xl text-[var(--text-color)] tracking-tighter">${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => setIsCartOpen(true)} className="bg-[var(--text-color)] text-[var(--bg-color)] font-black py-4 px-8 rounded-2xl flex items-center gap-3 shadow-xl">
                <span className="uppercase text-[11px] tracking-widest">Review ({cartItemCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        setCart={setCart} 
        onOrderPlaced={handlePlaceOrder} 
        isShopOpen={store.isShopOpen} 
      />
      <FindOrderModal isOpen={isFindModalOpen} onClose={() => setIsFindModalOpen(false)} onFind={handleFindOrder} />
      <StaffDashboardModal 
        isOpen={isAdmin} 
        onClose={() => setIsAdmin(false)} 
        orders={store.orders} 
        onUpdateStatus={store.updateOrderStatus} 
        onClearOrders={store.clearHistory} 
        stocks={store.productStocks} 
        onUpdateStock={store.updateStock} 
        onRestockAll={store.restockAll} 
        currentTheme={staffTheme} 
        onToggleTheme={() => {
          const next = staffTheme === 'dark' ? 'light' : 'dark';
          setStaffTheme(next);
          localStorage.setItem(THEME_KEYS.STAFF, next);
        }} 
        isShopOpen={store.isShopOpen} 
        onToggleShopStatus={store.toggleShopStatus} 
        hasPendingOrders={store.orders.some(o => ['pending', 'accepted'].includes(o.status))}
        syncStatus={store.syncStatus}
      />
    </div>
  );
};

export default App;
