"use client";

import React, { useState } from "react";
import { ReplyCard, ReplyOption } from "./ReplyCard";
import { Button } from "@/components/ui/Button";
import { Sparkles, RefreshCw, AlertCircle, RotateCcw } from "lucide-react";
import { Star } from "lucide-react";

interface ReplyGeneratorProps {
  onCopySuccess: (text: string) => void;
}

export const ReplyGenerator: React.FC<ReplyGeneratorProps> = ({ onCopySuccess }) => {
  const [rating, setRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState<string>("");
  const [customerReview, setCustomerReview] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [replies, setReplies] = useState<{
    professional: string;
    warm: string;
    concise: string;
  } | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (customerReview.trim().length < 5) {
      setErrorMessage("Please paste the customer's review (at least 5 characters).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/reply/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          customerReview: customerReview.trim(),
          reviewerName: reviewerName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate reply suggestions.");
      }

      setReplies(data.replies);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCustomerReview("");
    setReviewerName("");
    setRating(5);
    setReplies(null);
    setErrorMessage(null);
  };

  const replyOptions: ReplyOption[] = replies
    ? [
        {
          key: "professional",
          title: "Professional & Courteous",
          badge: "Professional",
          badgeVariant: "espresso",
          description: "Polite hospitality tone for high standards",
          text: replies.professional,
        },
        {
          key: "warm",
          title: "Warm & Heartfelt",
          badge: "Warm",
          badgeVariant: "amber",
          description: "Friendly neighborhood cafe connection",
          text: replies.warm,
        },
        {
          key: "concise",
          title: "Concise & Direct",
          badge: "Concise",
          badgeVariant: "neutral",
          description: "Quick 2-3 sentence acknowledgement",
          text: replies.concise,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Input Form Section */}
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-3xl border border-hairline shadow-subtle p-6 sm:p-8 space-y-4"
      >
        <div className="space-y-1">
          <h2 className="font-display font-semibold text-lg sm:text-xl text-ink">
            AI Google Review Reply Generator
          </h2>
          <p className="text-xs text-muted">
            Paste any customer Google review below. Our AI crafts 3 tailored, authentic replies adhering to hospitality standards.
          </p>
        </div>

        {/* Rating and Reviewer Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Rating selector for the customer's review */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Customer&apos;s Star Rating
            </label>
            <div className="flex items-center gap-1.5 p-2 bg-surface-soft rounded-xl border border-hairline">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform"
                  aria-label={`Select ${star} stars`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-500 drop-shadow-sm"
                        : "text-hairline"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-ink ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Optional Reviewer Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="reviewer-name"
              className="block text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Reviewer Name <span className="font-normal lowercase text-[11px] text-muted-soft">(optional)</span>
            </label>
            <input
              id="reviewer-name"
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              maxLength={80}
              className="w-full text-sm text-ink p-2.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
            />
          </div>
        </div>

        {/* Customer Review Textarea */}
        <div className="space-y-1.5">
          <label
            htmlFor="customer-review"
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Paste Google Review Text
          </label>
          <textarea
            id="customer-review"
            value={customerReview}
            onChange={(e) => setCustomerReview(e.target.value)}
            rows={4}
            maxLength={2500}
            placeholder="e.g. Waited 15 minutes for our iced latte during the morning rush, but the coffee was top-notch and the barista apologized for the delay."
            className="w-full text-sm text-ink p-3.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40 resize-y"
          />
          <div className="flex items-center justify-between text-xs text-muted-soft px-1">
            <span>{customerReview.length} / 2500 characters</span>
            <span>Does not invent facts or unapproved business promises</span>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="flex-1 shadow-revasy"
          >
            <Sparkles className="w-4 h-4 mr-2 text-brand-pink" />
            <span>Generate Replies</span>
          </Button>

          {replies && (
            <button
              type="button"
              onClick={handleReset}
              className="press p-2.5 text-xs text-muted hover:text-ink bg-surface-card hover:bg-surface-strong border border-hairline rounded-xl transition-colors flex items-center gap-1 font-semibold"
              title="Clear and start over"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </form>

      {/* Generated Replies Section */}
      {replies && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-lg text-ink">
              Generated Response Options
            </h3>
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="press flex items-center gap-1.5 text-xs font-semibold text-brand-pink bg-surface-card hover:bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Regenerate all</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {replyOptions.map((option) => (
              <ReplyCard
                key={option.key}
                option={option}
                onTextChange={(newText) => {
                  setReplies((prev) =>
                    prev ? { ...prev, [option.key]: newText } : null
                  );
                }}
                onCopy={onCopySuccess}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
