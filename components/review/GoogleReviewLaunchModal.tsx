"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/clipboard";
import {
  launchGoogleMapsReview,
  checkReviewReturn,
  isMobileDevice,
} from "@/lib/maps-launcher";

interface GoogleReviewLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  rating: number;
  reviewText: string;
  googleReviewUrl: string;
  placeId?: string;
  onCompleted?: () => void;
}

export const GoogleReviewLaunchModal: React.FC<GoogleReviewLaunchModalProps> = ({
  isOpen,
  onClose,
  businessName,
  rating,
  reviewText,
  googleReviewUrl,
  placeId,
  onCompleted,
}) => {
  const [copied, setCopied] = useState(true);
  const [hasOpenedGoogle, setHasOpenedGoogle] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Listen for return from Google Maps / Chrome
  useEffect(() => {
    if (!isOpen) return;

    const handleReturn = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        if (checkReviewReturn()) {
          if (onCompleted) {
            onCompleted();
          }
          onClose();
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
  }, [isOpen, onCompleted, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(reviewText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenGoogle = async () => {
    await copyToClipboard(reviewText);
    setCopied(true);
    setHasOpenedGoogle(true);

    launchGoogleMapsReview({
      googleReviewUrl,
      placeId,
      onOpened: () => setHasOpenedGoogle(true),
    });
  };

  const handleDone = () => {
    if (onCompleted) {
      onCompleted();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white w-full max-w-md rounded-3xl border border-hairline shadow-floating overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-launch-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-surface-soft/60">
          <div className="flex items-center gap-2.5">
            {/* Google 'G' colors icon */}
            <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-hairline flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 id="google-launch-modal-title" className="font-display font-bold text-sm text-ink leading-tight">
                Post to Google in 2 Taps
              </h3>
              <p className="text-[11px] text-muted truncate max-w-[220px]">
                {businessName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-ink hover:bg-surface-card transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-left">
          {/* Step 1: Star Rating */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                Step 1: Your Rating
              </span>
              <p className="text-xs font-semibold text-amber-950">
                Tap the {rating}th star on Google
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 shadow-sm">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <Star
                  key={starIndex}
                  className={`w-4 h-4 ${
                    starIndex <= rating
                      ? "fill-amber-400 text-amber-500"
                      : "fill-stone-100 text-stone-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 2: Review Draft & Clipboard */}
          <div className="p-3.5 rounded-2xl bg-surface-card border border-hairline space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-ink uppercase tracking-wider">
                Step 2: Paste Your Review
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                Copied to clipboard
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-hairline text-xs text-ink/90 italic leading-relaxed line-clamp-4 select-text">
              &ldquo;{reviewText}&rdquo;
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-muted">
                Tip: Right-click &amp; paste, or tap &amp; hold in Google
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal hover:underline"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied again!" : "Copy again"}</span>
              </button>
            </div>
          </div>

          {/* Step 3: Publish */}
          <div className="p-3 rounded-xl bg-surface-soft/60 border border-hairline/80 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white border border-hairline flex items-center justify-center shrink-0 text-xs font-bold text-ink">
              3
            </div>
            <p className="text-xs text-muted-soft">
              Tap the blue <strong className="text-ink font-semibold">Post</strong> button on Google to publish!
            </p>
          </div>

          {/* Why Google doesn't allow headless posting info note */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-muted leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-700">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Google Account Security Verification</span>
            </div>
            <p>
              Google requires reviews to be submitted via your verified Google Account to prevent automated bots. Your rating and drafted text are ready to paste in just 2 taps!
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-surface-soft/40 border-t border-hairline space-y-2.5">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-sm font-semibold !rounded-xl shadow-revasy"
            onClick={handleOpenGoogle}
          >
            {/* Google G Colors */}
            <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24">
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
            <span>
              {hasOpenedGoogle
                ? isMobile
                  ? "Reopen in Google Maps"
                  : "Reopen Google Reviews Window"
                : isMobile
                ? "Open in Google Maps App"
                : "Open Google Reviews Now"}
            </span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
          </Button>

          {isMobile && !hasOpenedGoogle && (
            <p className="text-[10px] text-center text-muted flex items-center justify-center gap-1">
              <Smartphone className="w-3 h-3 text-brand-teal" />
              <span>Deep-links to Google Maps app • Automatic Chrome fallback</span>
            </p>
          )}

          {hasOpenedGoogle && (
            <div className="space-y-2 pt-0.5 animate-fadeIn">
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-900 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-spin" />
                <span>Return here after posting — your celebration will trigger automatically!</span>
              </div>
              <button
                type="button"
                onClick={handleDone}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>I Have Posted My Review! 🎉</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
