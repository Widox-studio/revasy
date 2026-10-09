"use client";

import React from "react";
import { Sparkles, Check } from "lucide-react";

interface QuickPromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
  rating: number;
  currentText?: string;
}

export const QuickPromptChips: React.FC<QuickPromptChipsProps> = ({
  onSelectPrompt,
  rating,
  currentText = "",
}) => {
  const positiveSuggestions = [
    "Amazing coffee & latte art",
    "Super friendly baristas",
    "Delicious pastries & fresh bites",
    "Cozy atmosphere & great vibe",
    "Fast service & relaxing music",
  ];

  const neutralOrCriticalSuggestions = [
    "Wait time was longer than expected",
    "Coffee was good but seating was limited",
    "Food arrived a bit slow",
    "Staff tried their best during rush",
  ];

  const suggestions = rating <= 3 ? neutralOrCriticalSuggestions : positiveSuggestions;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
        <span>Quick highlights (tap to add or remove):</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((item, index) => {
          const isSelected = Boolean(
            currentText && currentText.toLowerCase().includes(item.toLowerCase().trim())
          );

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectPrompt(item)}
              className={`press text-xs px-3 py-1.5 rounded-pill border transition-all text-left select-none flex items-center gap-1.5 active:scale-95 ${
                isSelected
                  ? "bg-primary text-on-primary border-primary shadow-sm font-semibold ring-1 ring-primary"
                  : "bg-surface-card hover:bg-surface-strong text-ink border-hairline font-normal"
              }`}
              aria-pressed={isSelected}
              title={isSelected ? `Tap to remove "${item}"` : `Tap to add "${item}"`}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
              ) : (
                <span className="text-primary font-bold text-sm leading-none">+</span>
              )}
              <span>{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

