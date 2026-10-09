"use client";

import React, { useState, useEffect } from "react";
import { ReviewCard, ReviewOption } from "./ReviewCard";
import { Button } from "@/components/ui/Button";
import { RefreshCw, ExternalLink, ArrowLeft, CheckCircle2, Sparkles, Star } from "lucide-react";
import { config } from "@/lib/config";
import { copyToClipboard } from "@/lib/clipboard";
import { GoogleReviewLaunchModal } from "./GoogleReviewLaunchModal";
import { launchGoogleMapsReview, checkReviewReturn } from "@/lib/maps-launcher";

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
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync state if props change (e.g. after regeneration)
  useEffect(() => {
    setNaturalText(drafts.natural);
    setWarmText(drafts.warm);
    setShortText(drafts.short);
  }, [drafts]);

  // Listen for user returning from Google Maps / Chrome
  useEffect(() => {
    const handleReturn = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        if (checkReviewReturn()) {
          setIsLaunchModalOpen(false);
          setIsCompleted(true);
          onCopySuccess("🎉 Welcome back! Thank you for sharing your review on Google!");
        }
      }
    };

    const handlePageShow = () => {
      handleReturn();
    };

    const handleFocus = () => {
      handleReturn();
    };

    document.addEventListener("visibilitychange", handleReturn);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleReturn);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, [onCopySuccess]);

  const options: ReviewOption[] = [
    {
      key: "warm",
      title: "Warm & Friendly",
      badge: "Warm",
      badgeVariant: "amber",
      text: warmText,
    },
    {
      key: "natural",
      title: "Natural & Balanced",
      badge: "Natural",
      badgeVariant: "indigo",
      text: naturalText,
    },
    {
      key: "short",
      title: "Short & Simple",
      badge: "Short",
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
    await copyToClipboard(textToSubmit);
    setIsCopiedToGoogle(true);
    onCopySuccess(`Draft copied! Tap ${rating} stars & paste on Google.`);
    setIsLaunchModalOpen(true);

    setTimeout(() => {
      launchGoogleMapsReview({
        googleReviewUrl: config.googleReviewUrl,
      });
    }, 450);
  };

  if (isCompleted) {
    return (
      <div className="space-y-5 animate-fadeIn">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-revasy text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Google Review Contributor</span>
          </div>

          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-30" />
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center relative shadow-sm">
              <CheckCircle2 className="w-11 h-11 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-2xl text-ink">
              Thank You for Your Review! 🎉
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
              Your feedback was shared for <strong>{config.cafe.name}</strong>. Authentic reviews empower local businesses and help our community!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-soft/60 border border-hairline text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Shared on Google Maps
              </span>
            </div>
            <p className="text-xs text-ink/90 italic leading-relaxed line-clamp-3 select-text">
              &ldquo;{getSelectedText()}&rdquo;
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="md"
              className="w-full text-xs font-semibold !rounded-xl"
              onClick={onStartOver}
            >
              Write Another Review
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-1.5">
        <h2 className="font-display font-semibold text-2xl text-ink">
          Choose Your Review Draft
        </h2>
        <p className="text-xs text-muted max-w-sm mx-auto">
          We organized your experience into 3 authentic styles. Pick your favorite, tweak any words, and post it to Google!
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
      <div className="sticky bottom-4 z-20 bg-canvas/95 backdrop-blur-md p-3.5 rounded-3xl border border-hairline shadow-floating space-y-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full text-base font-semibold shadow-revasy !rounded-2xl"
          onClick={handleContinueToGoogle}
        >
          {isCopiedToGoogle ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2 text-brand-mint" />
              <span>Copied! Opening Google...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue to Google</span>
              <ExternalLink className="w-4 h-4 ml-1.5 text-muted-soft" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-between px-1.5 pt-0.5">
          <button
            type="button"
            onClick={onStartOver}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-ink p-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit notes</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-pink hover:opacity-80 disabled:opacity-50 p-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Regenerating..." : "Regenerate drafts"}</span>
          </button>
        </div>
      </div>

      <GoogleReviewLaunchModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        businessName={config.cafe.name}
        rating={rating}
        reviewText={getSelectedText()}
        googleReviewUrl={config.googleReviewUrl}
        onCompleted={() => {
          setIsCompleted(true);
          onCopySuccess("🎉 Welcome back! Thank you for sharing your review on Google!");
        }}
      />
    </div>
  );
};
