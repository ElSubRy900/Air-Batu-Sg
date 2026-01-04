
import React, { useState, useEffect, useRef } from 'react';
import OrderQueue from './OrderQueue';
import StockManager from './StockManager';
import { Order, OrderStatus } from '../types';
import { ORDER_NOTIFICATION_SOUND, BUSINESS_NAME } from '../constants';

interface StaffDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onClearOrders: () => void;
  stocks: Record<string, number>;
  onUpdateStock: (id: string, delta: number) => void;
  onRestockAll: () => void;
  currentTheme: 'dark' | 'light';
  onToggleTheme: () => void;
  isShopOpen: boolean;
  onToggleShopStatus: () => void;
  hasPendingOrders: boolean;
  syncStatus: 'synced' | 'syncing' | 'error';
}

const StaffDashboardModal: React.FC<StaffDashboardModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateStatus,
  onClearOrders,
  stocks,
  onUpdateStock,
  onRestockAll,
  currentTheme,
  onToggleTheme,
  isShopOpen,
  onToggleShopStatus,
  hasPendingOrders,
  syncStatus
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const previousPendingOrdersState = useRef(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Function to "unlock" audio on first interaction
  const unlockAudio = () => {
    if (audioRef.current && !isAudioEnabled) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        setIsAudioEnabled(true);
      }).catch(e => console.warn("Audio unlock failed:", e));
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    // Try to unlock audio immediately when dashboard opens
    unlockAudio();

    // Sound logic decoupled from notificationPermission
    if (hasPendingOrders) {
      if (!intervalRef.current) {
        const playSound = () => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => {
               console.warn("Audio play prevented:", e);
               setIsAudioEnabled(false);
            });
          }
        };

        playSound();
        intervalRef.current = window.setInterval(playSound, 5000); 
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    // Desktop notification logic
    if (hasPendingOrders && !previousPendingOrdersState.current && notificationPermission === 'granted') {
      const newPendingOrders = orders.filter(o => o.status === 'pending');
      if (newPendingOrders.length > 0) {
        const firstNewOrder = newPendingOrders[0];
        try {
          new Notification(`${BUSINESS_NAME}: New Order!`, {
            body: `Order #${firstNewOrder.id} - ${firstNewOrder.customerName} ($${firstNewOrder.total.toFixed(2)})`,
            icon: '/favicon.png',
            tag: 'new-order-' + firstNewOrder.id,
          });
        } catch (e) {
          console.warn("Notification failed:", e);
        }
      }
    }
    previousPendingOrdersState.current = hasPendingOrders;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, hasPendingOrders, orders, notificationPermission]);

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } else {
      alert("Notifications are not supported by your browser.");
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`theme-container theme-${currentTheme} fixed inset-0 z-[80] bg-[var(--bg-color)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden transition-colors`}
      onClick={unlockAudio}
    >
      <audio ref={audioRef} src={ORDER_NOTIFICATION_SOUND} preload="auto" />

      <div className="sticky top-0 z-10 theme-nav backdrop-blur-xl border-b px-4 sm:px-6 py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-xs">S</div>
          <div className="hidden sm:block">
            <h2 className="text-[var(--text-color)] font-black uppercase tracking-widest text-xs">Staff Dashboard</h2>
            <p className="text-[9px] theme-text-muted font-bold uppercase tracking-tighter">Live Management Mode</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {!isAudioEnabled && hasPendingOrders && (
            <button 
              onClick={(e) => { e.stopPropagation(); unlockAudio(); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-pink-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              Enable Sound
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-500/5 rounded-full border border-[var(--border-color)]">
             <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'syncing' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`}></div>
             <span className="text-[8px] font-black uppercase tracking-widest theme-text-muted hidden xs:block">
               {syncStatus === 'synced' ? 'Cloud Live' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync Error'}
             </span>
          </div>

          <div className="flex items-center gap-2 hidden sm:flex">
            <span className="text-[9px] font-black uppercase tracking-widest theme-text-muted">Shop:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isShopOpen} onChange={onToggleShopStatus} />
              <div className="w-10 h-5 bg-slate-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              onClick={(e) => { e.stopPropagation(); requestNotificationPermission(); }}
              className="p-2.5 bg-slate-500/10 rounded-xl text-indigo-500 border border-[var(--border-color)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
          )}

          <button onClick={onClose} className="p-2.5 bg-slate-500/10 rounded-xl text-[var(--text-color)] border border-[var(--border-color)]">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
        <OrderQueue 
          orders={orders} 
          onUpdateStatus={onUpdateStatus} 
          onClearOrders={onClearOrders} 
        />
        <StockManager 
          stocks={stocks} 
          onUpdateStock={onUpdateStock} 
          onRestockAll={onRestockAll}
          onLogout={onClose}
        />
      </div>
    </div>
  );
};

// Added missing default export
export default StaffDashboardModal;
