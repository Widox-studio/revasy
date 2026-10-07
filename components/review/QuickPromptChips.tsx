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
      <div className="flex items-center gap-1.5 text-xs font-medium text-espresso-muted">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>Quick ideas (tap to add or remove highlights):</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item, index) => {
          const isSelected = Boolean(
            currentText && currentText.toLowerCase().includes(item.toLowerCase().trim())
          );

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectPrompt(item)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 text-left select-none flex items-center gap-1.5 ${
                isSelected
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm font-semibold ring-1 ring-amber-600"
                  : "bg-cafe-100/80 hover:bg-cafe-200/90 active:bg-cafe-300 text-espresso border-cafe-200"
              }`}
              aria-pressed={isSelected}
              title={isSelected ? `Tap to remove "${item}"` : `Tap to add "${item}"`}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
              ) : (
                <span className="font-bold">+</span>
              )}
              <span>{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

