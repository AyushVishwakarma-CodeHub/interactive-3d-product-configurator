import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const toastMessage = useUIStore((s) => s.toastMessage);
  const clearToast = useUIStore((s) => s.clearToast);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-subtle">
      <div className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs text-white max-w-md">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="font-medium">{toastMessage}</span>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

