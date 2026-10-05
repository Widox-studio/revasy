"use client";

import React, { useState } from "react";
import { Copy, Check, Edit3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface ReplyOption {
  key: "professional" | "warm" | "concise";
  title: string;
  badge: string;
  badgeVariant: "espresso" | "amber" | "neutral";
  description: string;
  text: string;
}

interface ReplyCardProps {
  option: ReplyOption;
  onTextChange: (text: string) => void;
  onCopy: (text: string) => void;
}

export const ReplyCard: React.FC<ReplyCardProps> = ({
  option,
  onTextChange,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    onCopy(option.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-cafe-200/80 shadow-subtle hover:shadow-card transition-all p-5 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={option.badgeVariant}>{option.title}</Badge>
          <span className="text-xs text-espresso-muted hidden sm:inline">
            {option.description}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg text-espresso-muted hover:text-espresso hover:bg-cafe-100 transition-colors"
            title={isEditing ? "Finish editing" : "Edit response"}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-espresso text-cream hover:bg-espresso-light active:bg-espresso-dark"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Reply</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reply Content Area */}
      <div>
        {isEditing ? (
          <textarea
            value={option.text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={4}
            className="w-full text-sm text-espresso p-3.5 rounded-xl border border-cafe-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-cafe-50/50 resize-y"
          />
        ) : (
          <p className="text-sm leading-relaxed text-espresso bg-cafe-50/40 p-4 rounded-xl border border-cafe-100 select-text whitespace-pre-wrap">
            {option.text}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-espresso-muted pt-1">
        <span>Ready to paste directly into Google Business Profile</span>
        <span>{option.text.length} characters</span>
      </div>
    </div>
  );
};
