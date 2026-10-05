"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  isOpen,
  onClose,
  duration = 3200,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const bgStyles = {
    success: "bg-ink text-on-primary border-hairline/20 shadow-floating",
    error: "bg-red-950 text-white border-red-700/50 shadow-floating",
    info: "bg-surface-card text-ink border-hairline shadow-floating",
  };

  const icons = {
    success: (
      <div className="w-6 h-6 rounded-full bg-brand-pink/20 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-brand-pink" />
      </div>
    ),
    error: (
      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
        <AlertCircle className="w-4 h-4 text-red-300" />
      </div>
    ),
    info: (
      <div className="w-6 h-6 rounded-full bg-brand-teal/20 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-brand-teal" />
      </div>
    ),
  };

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md max-w-sm w-full animate-slideUp transition-all ${bgStyles[type]}`}
        role="status"
        aria-live="polite"
      >
        {icons[type]}
        <p className="text-xs sm:text-sm font-medium flex-1 leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="text-muted-soft hover:text-white transition-colors p-1.5 rounded-lg -mr-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

