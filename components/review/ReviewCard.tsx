"use client";

import React, { useState } from "react";
import { Copy, Check, Star, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface ReviewOption {
  key: "natural" | "warm" | "short";
  title: string;
  badge: string;
  badgeVariant: "espresso" | "amber" | "neutral";
  text: string;
}

interface ReviewCardProps {
  option: ReviewOption;
  rating: number;
  isSelected: boolean;
  onSelect: () => void;
  onTextChange: (newText: string) => void;
  onCopy: (text: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  option,
  rating,
  isSelected,
  onSelect,
  onTextChange,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopyClick = () => {
    onCopy(option.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onSelect}
      className={`relative p-5 rounded-2xl transition-all duration-200 cursor-pointer border ${
        isSelected
          ? "bg-white border-amber-600 shadow-card ring-2 ring-amber-600/30"
          : "bg-white/95 border-cafe-200/80 hover:border-cafe-300 shadow-subtle hover:shadow-card"
      }`}
    >
      {/* Top Header: Badge, Stars, Copy Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={option.badgeVariant}>{option.title}</Badge>
          <div className="flex items-center text-amber-500">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg text-espresso-muted hover:text-espresso hover:bg-cafe-100 transition-colors"
            title={isEditing ? "Done editing" : "Edit draft"}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCopyClick}
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
              copied
                ? "bg-emerald-100 text-emerald-800"
                : "bg-cafe-100 text-espresso hover:bg-cafe-200"
            }`}
            title="Copy this draft"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-espresso-muted" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editable or Display Review Text */}
      <div className="mt-2" onClick={(e) => isEditing && e.stopPropagation()}>
        {isEditing ? (
          <textarea
            value={option.text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={4}
            className="w-full text-sm text-espresso p-3 rounded-xl border border-cafe-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-cafe-50/50 resize-y"
            placeholder="Edit review text..."
          />
        ) : (
          <p className="text-sm leading-relaxed text-espresso font-normal whitespace-pre-wrap select-text">
            &ldquo;{option.text}&rdquo;
          </p>
        )}
      </div>

      {/* Bottom Bar: Selection Radio / Cue */}
      <div className="mt-4 pt-3 border-t border-cafe-100 flex items-center justify-between text-xs">
        <span className="text-espresso-muted">
          {isEditing ? "Tap icon to finish editing" : "Click card to select"}
        </span>
        <div className="flex items-center gap-1.5 font-medium">
          <span
            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
              isSelected
                ? "border-amber-600 bg-amber-600 text-white"
                : "border-cafe-300 bg-white"
            }`}
          >
            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </span>
          <span className={isSelected ? "text-amber-800 font-semibold" : "text-espresso-muted"}>
            {isSelected ? "Selected for Google" : "Select"}
          </span>
        </div>
      </div>
    </div>
  );
};
