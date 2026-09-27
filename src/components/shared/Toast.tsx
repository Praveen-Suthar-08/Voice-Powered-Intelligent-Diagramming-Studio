import React, { useEffect } from 'react';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
      <div className="liquid-glass px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl text-sm text-white">
        {type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
        {type === 'error' && <AlertCircle size={18} className="text-rose-400" />}
        {type === 'info' && <Info size={18} className="text-blue-400" />}
        <span>{message}</span>
      </div>
    </div>
  );
};
