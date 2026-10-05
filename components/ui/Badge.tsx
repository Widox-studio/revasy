import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "amber" | "espresso" | "green";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const styles = {
    neutral: "bg-cafe-100 text-espresso-muted border border-cafe-200",
    amber: "bg-amber-50 text-amber-800 border border-amber-200/80",
    espresso: "bg-espresso text-cream border border-espresso-light",
    green: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
