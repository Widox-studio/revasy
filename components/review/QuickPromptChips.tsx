"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface QuickPromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
  rating: number;
}

export const QuickPromptChips: React.FC<QuickPromptChipsProps> = ({
  onSelectPrompt,
  rating,
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
        <span>Quick ideas (tap to add to your thoughts):</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt(item)}
            className="text-xs bg-cafe-100/80 hover:bg-cafe-200/90 active:bg-cafe-300 text-espresso px-3 py-1.5 rounded-full border border-cafe-200 transition-colors duration-150 text-left select-none"
          >
            + {item}
          </button>
        ))}
      </div>
    </div>
  );
};
