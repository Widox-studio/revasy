import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "bordered";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const variantStyles = {
    default: "bg-white border border-cafe-200/80 shadow-subtle rounded-2xl",
    elevated: "bg-white border border-cafe-200/60 shadow-card rounded-2xl",
    flat: "bg-crema-warm border border-cafe-200/50 rounded-2xl",
    bordered: "bg-white border-2 border-cafe-300 rounded-2xl",
  };

  return (
    <div className={`${variantStyles[variant]} p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
