"use client";

import { createContext, useCallback, useMemo, useState } from "react";

export const ToastContext = createContext(null);

const TOAST_VARIANTS = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-slate-200 bg-slate-50 text-slate-900",
};

const DEFAULT_TITLES = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 4500 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast = {
        id,
        type,
        title: title || DEFAULT_TITLES[type] || "Notice",
        message,
        duration,
      };

      setToasts((current) => [toast, ...current]);

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const contextValue = useMemo(
    () => ({ showToast, removeToast }),
    [showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex justify-center px-4 sm:justify-end sm:px-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto overflow-hidden rounded-3xl border p-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm ${TOAST_VARIANTS[toast.type] || TOAST_VARIANTS.info}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-black">{toast.title}</div>
                  <p className="mt-1 text-sm leading-6">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full border border-white/30 bg-white/90 px-2 py-1 text-xs font-black text-slate-900 hover:bg-white"
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
