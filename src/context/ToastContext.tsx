import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => string;
  showSuccess: (message: string, title?: string, duration?: number) => string;
  showError: (message: string, title?: string, duration?: number) => string;
  showInfo: (message: string, title?: string, duration?: number) => string;
  showWarning: (message: string, title?: string, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration?: number): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const autoDismissDuration = duration ?? (type === 'error' ? 5000 : 3500);

      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration: autoDismissDuration,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 visible toasts

      if (autoDismissDuration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, autoDismissDuration);
      }

      return id;
    },
    [dismissToast]
  );

  const showSuccess = useCallback(
    (message: string, title: string = 'Success', duration?: number) => {
      return showToast(message, 'success', title, duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title: string = 'Error', duration?: number) => {
      return showToast(message, 'error', title, duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title: string = 'Notice', duration?: number) => {
      return showToast(message, 'info', title, duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title: string = 'Warning', duration?: number) => {
      return showToast(message, 'warning', title, duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        dismissToast,
        clearAllToasts,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
