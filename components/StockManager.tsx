

import React from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';

interface StockManagerProps {
  stocks: Record<string, number>;
  onUpdateStock: (id: string, delta: number) => void;
  onRestockAll: () => void; // Now triggers worker action
  onLogout: () => void; // Now triggers worker action (to clear active order if admin was active)
}

const StockManager: React.FC<StockManagerProps> = ({ stocks, onUpdateStock, onRestockAll, onLogout }) => {
  const getStockBadgeColor = (count: number) => {
    if (count <= 0) return 'bg-red-500 text-white border-red-600 shadow-lg';
    if (count < 5) return 'bg-orange-500 text-white border-orange-600 shadow-lg';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  };

  const getRowHighlight = (count: number) => {
    if (count <= 0) return 'bg-red-500/5';
    if (count < 5) return 'bg-orange-500/5';
    return '';
  };

  return (
    <div className="theme-card rounded-[2.5rem] shadow-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
      <div className="p-8 border-b theme-nav/30 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
        <div>
          <h2 className="font-kampung text-3xl text-[var(--text-color)]">Inventory Dashboard</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-orange-500 text-center sm:text-left">Live Stock Management</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRestockAll}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-500 hover:bg-orange-500/20 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
            Restock All
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-500/5 border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest theme-text-muted hover:text-red-500 hover:border-red-500/20 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Logout
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-500/5">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest theme-text-muted">Flavor</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest theme-text-muted text-center">In Stock</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest theme-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y border-[var(--border-color)]">
            {PRODUCTS.map(product => {
              const currentStock = stocks[product.id] || 0;
              return (
                <tr key={product.id} className={`hover:bg-slate-500/5 transition-colors ${getRowHighlight(currentStock)}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img src={product.image} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-[var(--border-color)]" alt="" />
                      <div>
                        <h4 className="font-black text-[var(--text-color)] text-sm leading-none mb-1">{product.name}</h4>
                        <span className="text-[9px] font-bold theme-text-muted uppercase tracking-tighter">{product.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border shadow-sm transition-colors ${getStockBadgeColor(currentStock)}`}>
                        {currentStock}
                      </span>
                      {currentStock === 0 && (
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Out of Stock</span>
                      )}
                      {currentStock > 0 && currentStock < 5 && (
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter animate-pulse">Low Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onUpdateStock(product.id, -1)}
                        className="w-10 h-10 rounded-xl bg-slate-500/5 border border-[var(--border-color)] text-[var(--text-color)] flex items-center justify-center hover:text-red-500 transition-all font-black text-lg shadow-sm active:scale-90"
                      >-</button>
                      <button 
                        onClick={() => onUpdateStock(product.id, 1)}
                        className="w-10 h-10 rounded-xl bg-[var(--text-color)] text-[var(--bg-color)] flex items-center justify-center hover:opacity-80 transition-all font-black text-lg shadow-md active:scale-90"
                      >+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-8 bg-slate-500/5 border-t border-[var(--border-color)] text-center transition-colors">
        <div className="flex justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-[9px] font-black uppercase theme-text-muted">Sold Out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-[9px] font-black uppercase theme-text-muted">Low Stock (&lt;5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] font-black uppercase theme-text-muted">Good Stock</span>
          </div>
        </div>
        <p className="text-[10px] font-bold theme-text-muted uppercase tracking-widest">
          Customer stock levels update automatically on checkout.
        </p>
      </div>
    </div>
  );
};

export default StockManager;