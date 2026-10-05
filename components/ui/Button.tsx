import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "teal" | "pink" | "amber" | "outline" | "ghost";
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
    "press inline-flex items-center justify-center font-display font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variantStyles = {
    primary:
      "bg-primary text-on-primary hover:bg-[#1a1a1a] shadow-sm active:bg-black",
    secondary:
      "bg-surface-card text-ink hover:bg-surface-strong border border-hairline active:bg-surface-strong/80",
    teal:
      "bg-brand-teal text-white hover:bg-brand-teal/90 shadow-sm active:bg-brand-teal/80",
    pink:
      "bg-brand-pink text-white hover:bg-brand-pink/90 shadow-sm active:bg-brand-pink/80",
    amber:
      "bg-brand-ochre text-ink hover:bg-brand-ochre/90 shadow-sm active:bg-brand-ochre/80",
    outline:
      "border border-hairline text-ink hover:bg-surface-soft active:bg-surface-card",
    ghost:
      "text-muted hover:text-ink hover:bg-surface-soft active:bg-surface-card",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2",
    lg: "px-6 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5",
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

