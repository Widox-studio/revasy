import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "amber" | "espresso" | "green" | "teal" | "indigo" | "rose" | "purple" | "brand" | "success" | "warning" | "error";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}) => {
  const styles: Record<string, string> = {
    neutral: "bg-surface-soft text-body border border-hairline",
    amber: "bg-amber-50 text-amber-900 border border-amber-200",
    espresso: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    brand: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
    green: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    teal: "bg-teal-50 text-teal-800 border border-teal-200",
    rose: "bg-rose-50 text-rose-800 border border-rose-200",
    purple: "bg-purple-50 text-purple-800 border border-purple-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    error: "bg-red-50 text-red-800 border border-red-200/80",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-0.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill font-medium tracking-wide ${styles[variant] || styles.neutral} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
