
import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderQueueProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onClearOrders: () => void;
  // onOrderAccepted removed as it's now managed by the worker and App.tsx passes onUpdateStatus
}

const OrderQueue: React.FC<OrderQueueProps> = ({ orders, onUpdateStatus, onClearOrders }) => {
  const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'accepted': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'ready': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'completed': return 'bg-slate-500/10 theme-text-muted border-[var(--border-color)]';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 theme-text-muted border-[var(--border-color)]';
    }
  };

  return (
    <div className="theme-card rounded-[2.5rem] shadow-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8 transition-colors">
      <div className="p-8 border-b theme-nav/30 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
        <div>
          <h2 className="font-kampung text-3xl text-[var(--text-color)]">Order Queue</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-500 text-center sm:text-left">Live Order Tracking</p>
        </div>
        <button 
          onClick={onClearOrders}
          className="px-4 py-2 bg-slate-500/5 border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest theme-text-muted hover:text-red-500 transition-all shadow-sm"
        >
          Clear History
        </button>
      </div>

      <div className="p-6 space-y-4">
        {sortedOrders.length === 0 ? (
          <div className="py-12 text-center theme-text-muted">
            <p className="text-sm font-bold uppercase tracking-widest">No orders yet</p>
          </div>
        ) : (
          sortedOrders.map(order => (
            <div key={order.id} className="bg-slate-500/5 rounded-3xl p-6 border border-[var(--border-color)] relative overflow-hidden transition-colors">
              {/* Receipt Number Header */}
              <div className="absolute top-0 right-0 px-6 py-2 bg-[var(--text-color)] text-[var(--bg-color)] rounded-bl-3xl">
                <span className="text-[8px] font-black uppercase tracking-widest mr-2 opacity-60">Receipt</span>
                <span className="text-sm font-black font-kampung">#{order.id}</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 mt-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-[var(--text-color)] text-lg">{order.customerName}</span>
                    <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold theme-text-muted">📞 {order.customerPhone}</p>
                  <p className="text-[10px] theme-text-muted mt-1 uppercase font-medium opacity-60">
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => onUpdateStatus(order.id, 'accepted')} 
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-colors animate-pulse"
                    >
                      Accept Order
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'accepted') && (
                    <button 
                      onClick={() => onUpdateStatus(order.id, 'ready')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-blue-600 transition-colors"
                    >
                      Ready for Pickup
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => onUpdateStatus(order.id, 'completed')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-colors"
                    >
                      Picked Up
                    </button>
                  )}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <button 
                      onClick={() => onUpdateStatus(order.id, 'cancelled')}
                      className="px-4 py-2 bg-slate-500/10 border border-[var(--border-color)] text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="theme-card rounded-2xl p-4 border transition-colors">
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-[var(--text-color)]">x{item.quantity} {item.name}</span>
                      <span className="theme-text-muted text-xs">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-dashed border-[var(--border-color)] flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest theme-text-muted">Total Charged</span>
                  <span className="font-kampung text-xl text-[var(--text-color)]">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderQueue;