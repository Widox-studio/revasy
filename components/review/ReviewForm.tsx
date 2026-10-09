"use client";

import React, { useState } from "react";
import { RatingSelector } from "./RatingSelector";
import { QuickPromptChips } from "./QuickPromptChips";
import { Button } from "@/components/ui/Button";
import { Sparkles, AlertCircle } from "lucide-react";

interface ReviewFormProps {
  onSubmitSuccess: (data: {
    rating: number;
    customerText: string;
    drafts: { natural: string; warm: string; short: string };
  }) => void;
  initialRating?: number;
  initialText?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmitSuccess,
  initialRating = 5,
  initialText = "",
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [customerText, setCustomerText] = useState<string>(initialText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTogglePrompt = (prompt: string) => {
    const normPrompt = prompt.trim();
    if (!normPrompt) return;

    if (customerText.toLowerCase().includes(normPrompt.toLowerCase())) {
      setCustomerText((prev) => {
        const escaped = normPrompt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        let updated = prev.replace(new RegExp(escaped, "gi"), "");
        updated = updated
          .replace(/\s*\.\s*\./g, ".")
          .replace(/^\s*[.,;!?]\s*/, "")
          .replace(/\s*[.,;!?]\s*$/, "")
          .replace(/[ \t]+/g, " ")
          .trim();
        return updated;
      });
    } else {
      setCustomerText((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return normPrompt;
        if (/[.!?]$/.test(trimmed)) {
          return `${trimmed} ${normPrompt}`;
        }
        return `${trimmed}. ${normPrompt}`;
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage("Please select a star rating.");
      return;
    }

    if (customerText.trim().length < 3) {
      setErrorMessage("Please share a few words about your visit (at least 3 characters).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, customerText: customerText.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate reviews. Please try again.");
      }

      onSubmitSuccess({
        rating,
        customerText: customerText.trim(),
        drafts: data.drafts,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Rating Selector Section */}
      <div className="bg-surface-card p-5 rounded-2xl border border-hairline shadow-subtle text-center space-y-2">
        <h3 className="font-display font-medium text-base sm:text-lg text-ink">
          How was your experience today?
        </h3>
        <RatingSelector value={rating} onChange={(val) => setRating(val)} size="lg" />
      </div>

      {/* 2. Experience Description */}
      <div className="bg-surface-card p-5 rounded-2xl border border-hairline shadow-subtle space-y-3">
        <div className="space-y-0.5">
          <label
            htmlFor="customer-notes"
            className="block font-display font-semibold text-sm text-ink"
          >
            Tell us a little about your experience
          </label>
          <p className="text-xs text-muted">
            Mention your favorite item, staff service, or overall ambiance.
          </p>
        </div>

        <textarea
          id="customer-notes"
          value={customerText}
          onChange={(e) => setCustomerText(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="e.g. Loved the friendly service and relaxing vibe! Everything was prompt and well handled."
          className="w-full text-sm text-ink p-3.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-primary bg-surface-soft/60 resize-none transition-colors placeholder:text-muted/60"
        />

        <div className="flex items-center justify-between text-xs text-muted px-1">
          <span className={customerText.trim().length >= 10 ? "text-emerald-700 font-medium" : "text-muted"}>
            {customerText.length} / 1000 characters
          </span>
          <span className="text-muted-soft">AI polishes genuine feedback</span>
        </div>

        {/* Quick prompt chips */}
        <QuickPromptChips
          onSelectPrompt={handleTogglePrompt}
          rating={rating}
          currentText={customerText}
        />
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Submit CTA */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full text-base font-semibold shadow-revasy !rounded-2xl"
      >
        <Sparkles className="w-5 h-5 mr-2 text-brand-pink" />
        <span>Create My Review Drafts</span>
      </Button>

      <p className="text-center text-[11px] text-muted-soft leading-relaxed">
        Our AI organizes your notes into 3 ready-to-post options. You can edit any draft before continuing to Google.
      </p>
    </form>
  );
};
