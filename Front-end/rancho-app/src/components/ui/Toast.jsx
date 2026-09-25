// Toast.jsx — Notificación temporal flotante

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error:   <AlertCircle size={18} className="text-red-500"     />,
  info:    <Info         size={18} className="text-blue-500"    />,
};

/**
 * @param {object|null} toast   - { message: string, type: 'success'|'error'|'info' }
 * @param {function}    onClose - Callback para limpiar el toast
 * @param {number}      duration - ms antes de auto-cerrar (default 3500)
 */
export default function Toast({ toast, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-start gap-3 bg-white rounded-xl shadow-lg border border-slate-100 p-4 min-w-[300px] max-w-sm">
        <div className="flex-shrink-0 mt-0.5">
          {ICONS[toast.type] ?? ICONS.info}
        </div>
        <p className="flex-1 text-sm text-slate-700 leading-snug">{toast.message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
