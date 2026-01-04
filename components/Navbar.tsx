import React from 'react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrack: () => void;
  currentTheme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, onOpenTrack, currentTheme, onToggleTheme }) => {
  return (
    <nav className="sticky top-0 z-40 theme-nav backdrop-blur-xl border-b px-2 sm:px-6 transition-colors w-full shadow-lg h-16 sm:h-20 flex items-center pt-[env(safe-area-inset-top,0px)]">
      {/* 
          Main Container: 
          Uses a balanced flex layout. The left and right "anchors" are flex-1 
          to push the trust bar to the center, but they allow the center to 
          occupy the space it needs on small screens.
      */}
      <div className="flex justify-between items-center w-full max-w-[1400px] mx-auto">
        
        {/* Left Anchor: Balancer for centering */}
        <div className="flex-1 hidden sm:flex items-center justify-start">
          {/* Empty on mobile to maximize center space */}
        </div>
        
        {/* Center: Trust Bar (Frozen, Tengah, Premium) */}
        <div className="flex flex-[2] sm:flex-initial justify-center items-center px-1">
          <div className="flex items-center gap-1.5 sm:gap-4 py-1.5 px-2.5 sm:px-5 border border-[var(--border-color)] sm:border-y sm:border-x-0 bg-slate-500/5 sm:bg-transparent rounded-full sm:rounded-none">
            {/* Frozen */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] sm:text-xs">❄️</span>
              <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest theme-text-muted whitespace-nowrap">Frozen</span>
            </div>
            
            <div className="w-px h-2.5 bg-[var(--border-color)] opacity-30 flex-shrink-0"></div>
            
            {/* Tengah */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] sm:text-xs">📍</span>
              <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest theme-text-muted whitespace-nowrap">Tengah</span>
            </div>
            
            <div className="w-px h-2.5 bg-[var(--border-color)] opacity-30 flex-shrink-0"></div>
            
            {/* Premium */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] sm:text-xs">✨</span>
              <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest theme-text-muted whitespace-nowrap">Premium</span>
            </div>
          </div>
        </div>
        
        {/* Right Anchor: Action Tools */}
        <div className="flex-1 flex justify-end items-center gap-1 sm:gap-3">
          {/* Search/Track */}
          <button 
            onClick={onOpenTrack}
            className="w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-500/5 rounded-lg sm:rounded-xl text-[var(--text-color)] hover:bg-slate-500/10 hover:text-pink-400 transition-all active:scale-90 border border-[var(--border-color)]"
            aria-label="Track Receipt"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-500/5 rounded-lg sm:rounded-xl text-[var(--text-color)] hover:bg-slate-500/10 transition-all active:scale-90 border border-[var(--border-color)]"
            aria-label="Toggle Theme"
          >
            {currentTheme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </button>

          {/* Cart */}
          <button 
            onClick={onOpenCart}
            className="relative w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-500/5 rounded-lg sm:rounded-xl text-[var(--text-color)] hover:bg-slate-500/10 hover:text-pink-400 transition-all active:scale-90 border border-[var(--border-color)]"
            aria-label="Open Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-pink-500 text-white text-[7px] sm:text-[10px] font-black w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border border-[var(--bg-color)] shadow-xl">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;