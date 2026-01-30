import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-white dark:bg-zinc-900 border-l-4 border-green-500',
    error: 'bg-white dark:bg-zinc-900 border-l-4 border-red-500',
    warning: 'bg-white dark:bg-zinc-900 border-l-4 border-amber-500',
    info: 'bg-white dark:bg-zinc-900 border-l-4 border-blue-500',
  };

  return (
    <div className={`flex items-start p-4 mb-3 rounded shadow-lg border border-gray-100 dark:border-zinc-800 w-full max-w-sm transform transition-all duration-300 animate-slide-in ${bgColors[toast.type]}`}>
      <div className="flex-shrink-0 mr-3">
        {icons[toast.type]}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.message}</p>
      </div>
      <button onClick={() => onClose(toast.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};