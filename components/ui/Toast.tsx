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
  duration = 3000,
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
    success: "bg-espresso text-cream border-amber-600/30",
    error: "bg-red-900 text-white border-red-700",
    info: "bg-stone-800 text-cream border-stone-700",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />,
    info: <CheckCircle2 className="w-5 h-5 text-cafe-300 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn px-4 max-w-sm w-full">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-floating border backdrop-blur-md ${bgStyles[type]}`}
      >
        {icons[type]}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
