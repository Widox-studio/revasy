import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "amber";
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
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-espresso text-cream hover:bg-espresso-light shadow-md shadow-espresso/10 active:bg-espresso-dark",
    secondary:
      "bg-cafe-100 text-espresso hover:bg-cafe-200 border border-cafe-200 active:bg-cafe-300",
    amber:
      "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-600/20 active:from-amber-800",
    outline:
      "border-2 border-cafe-300 text-espresso hover:bg-cafe-50 hover:border-cafe-400 active:bg-cafe-100",
    ghost:
      "text-espresso-muted hover:text-espresso hover:bg-cafe-100/60 active:bg-cafe-200/50",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs tracking-wide",
    md: "px-5 py-2.5 text-sm tracking-wide",
    lg: "px-6 py-3.5 text-base font-semibold",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
