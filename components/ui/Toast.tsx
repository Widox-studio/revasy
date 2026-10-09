"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  message?: string;
  title?: string;
  type?: ToastType;
  isOpen?: boolean;
  show?: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  title,
  type = "success",
  isOpen,
  show,
  onClose,
  duration = 3200,
}) => {
  const visible = show !== undefined ? show : !!isOpen;

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const bgStyles = {
    success: "bg-ink text-on-primary border-hairline/20 shadow-floating",
    error: "bg-red-950 text-white border-red-700/50 shadow-floating",
    warning: "bg-amber-950 text-white border-amber-700/50 shadow-floating",
    info: "bg-surface-card text-ink border-hairline shadow-floating",
  };

  const icons = {
    success: (
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
    ),
    error: (
      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
        <AlertCircle className="w-4 h-4 text-red-300" />
      </div>
    ),
    warning: (
      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-300" />
      </div>
    ),
    info: (
      <div className="w-6 h-6 rounded-full bg-brand-teal/20 flex items-center justify-center shrink-0">
        <Info className="w-4 h-4 text-brand-teal" />
      </div>
    ),
  };

  const closeButtonColor = type === "info" ? "text-muted hover:text-ink" : "text-muted-soft hover:text-white";

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md max-w-sm w-full animate-slideUp transition-all ${bgStyles[type]}`}
        role="status"
        aria-live="polite"
      >
        {icons[type]}
        <div className="flex-1 min-w-0">
          {title && <p className="text-xs sm:text-sm font-semibold leading-snug">{title}</p>}
          {message && <p className="text-xs text-muted-soft leading-snug">{message}</p>}
        </div>
        <button
          onClick={onClose}
          className={`${closeButtonColor} transition-colors p-1.5 rounded-lg -mr-1`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

