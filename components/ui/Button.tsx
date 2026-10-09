import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "revasy" | "teal" | "pink" | "amber" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles =
    "press inline-flex items-center justify-center font-display font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variantStyles = {
    primary:
      "bg-primary text-on-primary hover:bg-primary-hover active:bg-indigo-900 shadow-sm shadow-indigo-500/15 focus-visible:ring-primary",
    revasy:
      "bg-primary text-on-primary hover:bg-primary-hover active:bg-indigo-900 shadow-sm shadow-indigo-500/15 focus-visible:ring-primary",
    secondary:
      "bg-surface-card text-ink hover:bg-surface-soft border border-hairline active:bg-surface-strong shadow-subtle focus-visible:ring-primary",
    teal:
      "bg-brand-teal text-white hover:bg-brand-teal/90 active:bg-brand-teal/95 shadow-sm shadow-teal-500/15 focus-visible:ring-brand-teal",
    pink:
      "bg-brand-pink text-white hover:bg-brand-pink/90 active:bg-brand-pink/95 shadow-sm shadow-indigo-500/15 focus-visible:ring-brand-pink",
    amber:
      "bg-brand-ochre text-ink hover:bg-brand-ochre/90 active:bg-brand-ochre/95 shadow-sm focus-visible:ring-brand-ochre",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-500/15 focus-visible:ring-rose-500",
    outline:
      "border border-hairline bg-transparent text-ink hover:bg-surface-soft active:bg-surface-card focus-visible:ring-primary",
    ghost:
      "text-muted hover:text-ink hover:bg-surface-soft active:bg-surface-card focus-visible:ring-primary",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 min-h-[36px] text-xs rounded-lg gap-1.5",
    md: "px-4 py-2.5 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm rounded-xl gap-2",
    lg: "px-6 py-3.5 min-h-[48px] text-sm sm:text-base rounded-2xl gap-2.5",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin text-current" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

