"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "md" | "lg";
}

const RATING_CONFIG: Record<
  number,
  { label: string; emoji: string; color: string; bg: string }
> = {
  1: { label: "Needs Improvement", emoji: "😕", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  2: { label: "Could Be Better", emoji: "😐", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  3: { label: "Good Experience", emoji: "🙂", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  4: { label: "Great Visit!", emoji: "😊", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  5: { label: "Exceptional / Loved It!", emoji: "🌟", color: "text-amber-800", bg: "bg-amber-100/70 border-amber-300" },
};

export const RatingSelector: React.FC<RatingSelectorProps> = ({
  value,
  onChange,
  size = "lg",
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating ?? value;

  const starSize = size === "lg" ? "w-9 h-9 sm:w-11 sm:h-11" : "w-7 h-7 sm:w-8 sm:h-8";
  const currentConfig = RATING_CONFIG[activeRating] || RATING_CONFIG[5];

  return (
    <div className="flex flex-col items-center select-none" role="radiogroup" aria-label="Rating selector">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label={`${star} star${star > 1 ? "s" : ""}: ${RATING_CONFIG[star].label}`}
            >
              <Star
                className={`${starSize} transition-all duration-200 ${
                  isFilled
                    ? "fill-amber-400 text-amber-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.45)]"
                    : "text-stone-300 hover:text-amber-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="h-8 mt-1.5 flex items-center justify-center">
        {value > 0 ? (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border text-xs font-semibold animate-fadeIn ${currentConfig.bg} ${currentConfig.color}`}
          >
            <span>{currentConfig.emoji}</span>
            <span>{currentConfig.label}</span>
          </div>
        ) : (
          <span className="text-xs font-medium text-muted">
            Tap a star to rate your visit
          </span>
        )}
      </div>
    </div>
  );
};

