"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "md" | "lg";
}

const RATING_LABELS: Record<number, string> = {
  1: "Could Be Better",
  2: "Needs Improvement",
  3: "Good / Decent",
  4: "Great Experience",
  5: "Exceptional / Loved It!",
};

export const RatingSelector: React.FC<RatingSelectorProps> = ({
  value,
  onChange,
  size = "lg",
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating ?? value;

  const starSize = size === "lg" ? "w-10 h-10 sm:w-11 sm:h-11" : "w-7 h-7 sm:w-8 sm:h-8";

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="p-1 sm:p-2 rounded-2xl transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`${starSize} transition-colors duration-200 ${
                  isFilled
                    ? "fill-amber-400 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
                    : "text-cafe-300 hover:text-amber-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="h-6 mt-1 flex items-center justify-center">
        {value > 0 ? (
          <span className="text-sm font-semibold text-espresso tracking-wide animate-fadeIn">
            {RATING_LABELS[value] || `${value} Stars`}
          </span>
        ) : (
          <span className="text-xs font-medium text-espresso-muted">
            Tap a star to rate your visit
          </span>
        )}
      </div>
    </div>
  );
};
