"use client";

import React, { useState } from "react";
import { ReviewCard, ReviewOption } from "./ReviewCard";
import { Button } from "@/components/ui/Button";
import { RefreshCw, ExternalLink, ArrowLeft, CheckCircle2 } from "lucide-react";
import { config } from "@/lib/config";

interface ReviewResultsProps {
  rating: number;
  drafts: {
    natural: string;
    warm: string;
    short: string;
  };
  onRegenerate: () => void;
  onStartOver: () => void;
  isRegenerating: boolean;
  onCopySuccess: (text: string) => void;
}

export const ReviewResults: React.FC<ReviewResultsProps> = ({
  rating,
  drafts,
  onRegenerate,
  onStartOver,
  isRegenerating,
  onCopySuccess,
}) => {
  const [naturalText, setNaturalText] = useState(drafts.natural);
  const [warmText, setWarmText] = useState(drafts.warm);
  const [shortText, setShortText] = useState(drafts.short);
  const [selectedKey, setSelectedKey] = useState<"natural" | "warm" | "short">("warm");
  const [isCopiedToGoogle, setIsCopiedToGoogle] = useState(false);

  // Sync state if props change (e.g. after regeneration)
  React.useEffect(() => {
    setNaturalText(drafts.natural);
    setWarmText(drafts.warm);
    setShortText(drafts.short);
  }, [drafts]);

  const options: ReviewOption[] = [
    {
      key: "natural",
      title: "Natural & Balanced",
      badge: "Natural",
      badgeVariant: "espresso",
      text: naturalText,
    },
    {
      key: "warm",
      title: "Warm & Friendly",
      badge: "Warm",
      badgeVariant: "amber",
      text: warmText,
    },
    {
      key: "short",
      title: "Short & Simple",
      badge: "Concise",
      badgeVariant: "neutral",
      text: shortText,
    },
  ];

  const getSelectedText = () => {
    if (selectedKey === "natural") return naturalText;
    if (selectedKey === "warm") return warmText;
    return shortText;
  };

  const handleContinueToGoogle = async () => {
    const textToSubmit = getSelectedText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToSubmit);
      }
      setIsCopiedToGoogle(true);
      onCopySuccess("Draft copied! Opening Google Reviews...");
    } catch {
      // Fallback
    }

    setTimeout(() => {
      window.open(config.googleReviewUrl, "_blank", "noopener,noreferrer");
    }, 450);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-espresso">
          Choose Your Review Draft
        </h2>
        <p className="text-xs sm:text-sm text-espresso-muted max-w-sm mx-auto">
          We organized your experience into 3 styles. Pick your favorite, tweak any words, and post it to Google!
        </p>
      </div>

      {/* Review Cards list */}
      <div className="space-y-3.5">
        {options.map((option) => (
          <ReviewCard
            key={option.key}
            option={option}
            rating={rating}
            isSelected={selectedKey === option.key}
            onSelect={() => setSelectedKey(option.key)}
            onTextChange={(newText) => {
              if (option.key === "natural") setNaturalText(newText);
              if (option.key === "warm") setWarmText(newText);
              if (option.key === "short") setShortText(newText);
            }}
            onCopy={onCopySuccess}
          />
        ))}
      </div>

      {/* Action CTA Bar */}
      <div className="sticky bottom-4 z-20 bg-cream/90 backdrop-blur-md p-3 rounded-2xl border border-cafe-200/80 shadow-floating space-y-2.5">
        <Button
          variant="amber"
          size="lg"
          className="w-full text-base font-semibold shadow-glow"
          onClick={handleContinueToGoogle}
        >
          {isCopiedToGoogle ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span>Copied! Opening Google...</span>
            </>
          ) : (
            <>
              <span>Continue to Google</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={onStartOver}
            className="flex items-center gap-1 text-xs font-medium text-espresso-muted hover:text-espresso p-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit notes</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-900 disabled:opacity-50 p-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Regenerate drafts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
