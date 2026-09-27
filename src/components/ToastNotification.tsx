import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, ToastItem, ToastType } from '../context/ToastContext';

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  const config: Record<
    ToastType,
    {
      icon: React.ReactNode;
      borderColor: string;
      accentBg: string;
      titleColor: string;
      badge: string;
    }
  > = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
      borderColor: 'border-emerald-500/30 dark:border-emerald-500/25',
      accentBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-700 dark:text-emerald-400',
      badge: 'Success',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
      borderColor: 'border-rose-500/30 dark:border-rose-500/25',
      accentBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      titleColor: 'text-rose-700 dark:text-rose-400',
      badge: 'Error',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
      borderColor: 'border-amber-500/30 dark:border-amber-500/25',
      accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-700 dark:text-amber-400',
      badge: 'Warning',
    },
    info: {
      icon: <Info className="w-4 h-4 text-[#0072F5] shrink-0 mt-0.5" />,
      borderColor: 'border-blue-500/30 dark:border-blue-500/25',
      accentBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-700 dark:text-blue-400',
      badge: 'Notice',
    },
  };

  const { icon, borderColor, titleColor } = config[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.94, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`pointer-events-auto w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border ${borderColor} rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] p-3.5 flex items-start justify-between gap-3 text-xs overflow-hidden relative group`}
    >
      <div className="flex items-start space-x-2.5 min-w-0 flex-1">
        {icon}
        <div className="space-y-0.5 min-w-0 flex-1">
          {toast.title && (
            <div className={`font-semibold tracking-tight text-[12px] ${titleColor}`}>
              {toast.title}
            </div>
          )}
          <p className="text-[#333333] dark:text-[#E2E8F0] font-sans leading-relaxed break-words text-[11px] sm:text-xs">
            {toast.message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="p-1 rounded-md text-[#8F8F8F] hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[150] flex flex-col space-y-2 pointer-events-none max-w-[calc(100vw-2rem)] items-end"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
