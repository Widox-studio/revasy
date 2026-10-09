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
    default: "bg-surface-card border border-hairline shadow-subtle rounded-2xl",
    elevated: "bg-surface-card border border-hairline shadow-card rounded-2xl sm:rounded-3xl",
    flat: "bg-surface-soft border border-hairline/80 rounded-2xl",
    bordered: "bg-surface-card border-2 border-hairline rounded-2xl",
  };

  return (
    <div className={`${variantStyles[variant]} p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
