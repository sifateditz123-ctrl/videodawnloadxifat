import React from 'react';
import { ToastNotification } from '../types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toasts: ToastNotification[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-20 left-3 right-3 max-w-[400px] mx-auto z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`p-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-2.5 font-mono-tech text-xs tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto ${
              isError
                ? 'bg-[#120608]/95 border-red-500/40 text-red-300'
                : isInfo
                ? 'bg-[#080d16]/95 border-cyan-500/40 text-cyan-300'
                : 'bg-[#07080f]/95 border-[var(--brda)] text-white'
            }`}
            style={{
              boxShadow: isError
                ? '0 0 25px rgba(239, 68, 68, 0.25)'
                : '0 0 25px var(--ad)',
            }}
          >
            {isError ? (
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            ) : isInfo ? (
              <Info size={16} className="text-cyan-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-[var(--a)] flex-shrink-0" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
