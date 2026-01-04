
import React, { useState } from 'react';
import { STAFF_PASSWORD } from '../constants';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === STAFF_PASSWORD) {
      onLogin(password);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-xs theme-card border rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 transition-colors">
          <div className="text-center mb-6">
            <h3 className="font-black uppercase tracking-widest text-[var(--text-color)] text-sm">Staff Login</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className={`w-full bg-slate-500/5 border-2 ${error ? 'border-red-500 animate-shake' : 'border-[var(--border-color)]'} rounded-xl px-4 py-3 text-center font-bold text-[var(--text-color)] focus:outline-none focus:border-pink-500 transition-all`}
              autoFocus
            />
            <button type="submit" className="w-full bg-[var(--text-color)] text-[var(--bg-color)] font-black py-3 rounded-xl uppercase tracking-widest text-xs shadow-lg">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
