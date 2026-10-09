"use client";

import React, { useState } from "react";
import { Copy, Check, Star, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface ReviewOption {
  key: "natural" | "warm" | "short";
  title: string;
  badge: string;
  badgeVariant: "espresso" | "amber" | "neutral" | "indigo" | "teal" | "green";
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
          ? "bg-white border-primary shadow-card ring-2 ring-primary/20"
          : "bg-surface-card/60 hover:bg-white border-hairline shadow-subtle hover:shadow-card"
      }`}
    >
      {/* Top Header: Badge, Stars, Copy Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
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
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-soft transition-colors"
            title={isEditing ? "Done editing" : "Edit draft"}
            aria-label="Edit review draft"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopyClick}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              copied
                ? "bg-emerald-100 text-emerald-800"
                : "bg-surface-card hover:bg-surface-strong text-ink border border-hairline"
            }`}
            title="Copy this draft"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-muted" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editable or Display Review Text */}
      <div className="mt-2" onClick={(e) => isEditing && e.stopPropagation()}>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={option.text}
              onChange={(e) => onTextChange(e.target.value)}
              rows={4}
              className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-primary bg-surface-soft resize-y"
              placeholder="Edit review text..."
            />
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-primary bg-surface-card hover:bg-surface-strong px-3 py-1 rounded-lg border border-hairline"
            >
              Done Editing
            </button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-ink font-normal whitespace-pre-wrap select-text">
            &ldquo;{option.text}&rdquo;
          </p>
        )}
      </div>

      {/* Bottom Bar: Selection Radio / Cue */}
      <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs">
        <span className="text-muted-soft text-[11px]">
          {isEditing ? "Tap to finish editing" : "Click card to select"}
        </span>
        <div className="flex items-center gap-1.5 font-medium">
          <span
            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
              isSelected
                ? "border-primary bg-primary text-white"
                : "border-hairline bg-white"
            }`}
          >
            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </span>
          <span className={isSelected ? "text-primary font-semibold" : "text-muted"}>
            {isSelected ? "Selected for Google" : "Select"}
          </span>
        </div>
      </div>
    </div>
  );
};
