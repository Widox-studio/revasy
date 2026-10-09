"use client";

import React, { useState } from "react";
import { Copy, Check, Edit3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface ReplyOption {
  key: "professional" | "warm" | "concise";
  title: string;
  badge: string;
  badgeVariant: "espresso" | "amber" | "neutral" | "indigo" | "teal" | "green";
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
    <div className="bg-white rounded-2xl border border-hairline shadow-subtle hover:shadow-card transition-all p-5 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={option.badgeVariant}>{option.title}</Badge>
          <span className="text-xs text-muted hidden sm:inline">
            {option.description}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-soft transition-colors"
            title={isEditing ? "Finish editing" : "Edit response"}
            aria-label="Edit response"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`press flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-primary text-on-primary hover:bg-primary-hover active:bg-indigo-800"
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
            className="w-full text-sm text-ink p-3.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft resize-y"
          />
        ) : (
          <p className="text-sm leading-relaxed text-ink bg-surface-soft/60 p-4 rounded-xl border border-hairline select-text whitespace-pre-wrap font-sans">
            {option.text}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-soft pt-1">
        <span>Ready to paste directly into Google Business Profile</span>
        <span>{option.text.length} characters</span>
      </div>
    </div>
  );
};
