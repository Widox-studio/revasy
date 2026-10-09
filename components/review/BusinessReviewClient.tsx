"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Star,
  Edit3,
  CheckCircle2,
  Building2,
  Coffee,
  HeartPulse,
  Scissors,
  ShoppingBag,
  Wrench,
  ThumbsUp,
  Clock,
  FileText,
  Mail,
  ShieldCheck,
  MessageSquare,
  Send,
  Share2,
} from "lucide-react";
import { RatingSelector } from "./RatingSelector";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/ui/Confetti";
import { Business } from "@/lib/business-store";
import { getAccentTheme } from "@/lib/theme";
import { copyToClipboard } from "@/lib/clipboard";
import { GoogleReviewLaunchModal } from "./GoogleReviewLaunchModal";
import { launchGoogleMapsReview, checkReviewReturn } from "@/lib/maps-launcher";

interface ReviewDrafts {
  natural: string;
  warm: string;
  short: string;
}

const LOADING_PHRASES = [
  "Reading your visit highlights...",
  "Polishing into 3 natural, authentic styles...",
  "Formatting for Google Reviews...",
];

export function BusinessReviewClient({ business }: { business: Business }) {
  const theme = getAccentTheme(business.accentColor);

  // Flow State
  const [currentStep, setCurrentStep] = useState<"input" | "results">("input");
  const [rating, setRating] = useState<number>(5);
  const [customerText, setCustomerText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [drafts, setDrafts] = useState<ReviewDrafts | null>(null);

  // Loading indicator phrases for Doherty Threshold
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating || isRegenerating) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isGenerating, isRegenerating]);

  // Results State
  const [naturalText, setNaturalText] = useState("");
  const [warmText, setWarmText] = useState("");
  const [shortText, setShortText] = useState("");
  const [selectedKey, setSelectedKey] = useState<"natural" | "warm" | "short">("warm");
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCopiedToGoogle, setIsCopiedToGoogle] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isReviewCompleted, setIsReviewCompleted] = useState(false);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [contactInfo, setContactInfo] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);
  };

  // Listen for user returning to the app after submitting their review on Google Maps / Chrome
  useEffect(() => {
    const handleReturn = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        if (checkReviewReturn()) {
          setIsLaunchModalOpen(false);
          setIsReviewCompleted(true);
          setShowConfetti(true);
          showToast("🎉 Welcome back! Thank you for sharing your review on Google!");
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
  }, []);

  const isPromptSelected = (prompt: string): boolean => {
    const normText = customerText.toLowerCase();
    const normPrompt = prompt.toLowerCase().trim();
    if (!normText || !normPrompt) return false;
    return normText.includes(normPrompt);
  };

  const handleTogglePrompt = (prompt: string) => {
    const normPrompt = prompt.trim();
    if (!normPrompt) return;

    if (isPromptSelected(normPrompt)) {
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerText.trim().length < 3) {
      showToast("Please enter at least 3 characters describing your experience.");
      return;
    }

    setIsGenerating(true);
    setRegenerationCount(0);

    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          customerText: customerText.trim(),
          businessSlug: business.slug,
          variationIndex: 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate reviews.");
      }

      setDrafts(data.drafts);
      setNaturalText(data.drafts.natural);
      setWarmText(data.drafts.warm);
      setShortText(data.drafts.short);
      setCurrentStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed.";
      showToast(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    const nextCount = regenerationCount + 1;
    setRegenerationCount(nextCount);
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          customerText: customerText.trim(),
          businessSlug: business.slug,
          variationIndex: nextCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      setDrafts(data.drafts);
      setNaturalText(data.drafts.natural);
      setWarmText(data.drafts.warm);
      setShortText(data.drafts.short);
      showToast("Generated fresh review drafts!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error regenerating";
      showToast(msg);
    } finally {
      setIsRegenerating(false);
    }
  };

  const getSelectedText = () => {
    if (selectedKey === "natural") return naturalText;
    if (selectedKey === "warm") return warmText;
    return shortText;
  };

  const handleContinueToGoogle = async () => {
    const textToCopy = getSelectedText();
    await copyToClipboard(textToCopy);
    setIsCopiedToGoogle(true);
    setShowConfetti(true);
    showToast(`Draft copied! Tap ${rating} stars & paste on Google.`);

    // Open guidance assistant modal
    setIsLaunchModalOpen(true);

    // Deep link directly to native Google Maps on mobile with Chrome fallback,
    // or open Google Reviews window on desktop
    setTimeout(() => {
      launchGoogleMapsReview({
        googleReviewUrl: business.googleReviewUrl,
        placeId: business.placeId,
      });
    }, 450);
  };

  const handleSendPrivateFeedback = async () => {
    setIsSubmittingFeedback(true);
    const textToSend = getSelectedText();
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: business.slug,
          rating,
          customerText: textToSend,
          contactInfo: contactInfo.trim() || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      setFeedbackSubmitted(true);
      showToast("Private feedback sent directly to management. Thank you!");
    } catch {
      setFeedbackSubmitted(true);
      showToast("Thank you! Your feedback has been noted directly for management.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleCopyCard = async (key: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      showToast("Copied draft to clipboard!");
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      showToast("Copy failed");
    }
  };

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("cafe") || c.includes("coffee") || c.includes("bakery")) return <Coffee className="w-6 h-6 text-brand-pink" />;
    if (c.includes("dental") || c.includes("health") || c.includes("clinic")) return <HeartPulse className="w-6 h-6 text-brand-mint" />;
    if (c.includes("salon") || c.includes("spa") || c.includes("hair")) return <Scissors className="w-6 h-6 text-brand-lavender" />;
    if (c.includes("retail") || c.includes("shop")) return <ShoppingBag className="w-6 h-6 text-brand-peach" />;
    if (c.includes("auto") || c.includes("garage")) return <Wrench className="w-6 h-6 text-brand-ochre" />;
    return <Building2 className="w-6 h-6 text-brand-teal" />;
  };

  // Quick word/read time estimation
  const getDraftMeta = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const readTimeSec = Math.max(2, Math.round((words / 200) * 60));
    return { words, readTimeSec };
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between pb-safe">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display font-bold">revasy<span className="text-brand-pink">.</span></span>
          </Link>

          <div className="flex items-center gap-1.5 min-w-0 max-w-[210px]">
            <span className="font-display font-semibold text-sm text-ink truncate">
              {business.name}
            </span>
            <span title="Verified Business" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
              <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
            </span>
          </div>
        </div>
      </header>

      {/* Progress Step Bar (Hick's Law & Miller's Law) */}
      <div className="max-w-md w-full mx-auto px-4 pt-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted px-1 pb-1.5">
          <span className={currentStep === "input" ? "text-ink font-bold" : "text-muted"}>
            1. Rate &amp; Share Thoughts
          </span>
          <span className={currentStep === "results" ? "text-ink font-bold" : "text-muted-soft"}>
            2. Pick Draft &amp; Post to Google
          </span>
        </div>
        <div className="w-full bg-hairline rounded-full h-1.5 overflow-hidden">
          <div
            className={`${theme.bar} h-full transition-all duration-300`}
            style={{ width: currentStep === "input" ? "50%" : "100%" }}
          />
        </div>
      </div>

      {/* Main Review Form / Results Container */}
      <main className="max-w-md w-full mx-auto px-4 pt-5 pb-8 flex-1">
        {isGenerating ? (
          /* Shimmer Skeleton Loading State (Doherty Threshold) */
          <div className="space-y-5 animate-fadeIn pt-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-pink/15 border border-brand-pink/30 flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6 text-brand-pink" />
              </div>
              <h3 className="font-display font-semibold text-xl text-ink">
                Generating Review Drafts
              </h3>
              <p className={`text-xs ${theme.text} font-medium transition-all`}>
                {LOADING_PHRASES[loadingPhraseIndex]}
              </p>
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-hairline shadow-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-4 rounded-pill shimmer-box" />
                    <div className="w-24 h-4 rounded-lg shimmer-box" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="w-full h-3.5 rounded shimmer-box" />
                    <div className="w-5/6 h-3.5 rounded shimmer-box" />
                    <div className="w-4/6 h-3.5 rounded shimmer-box" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : currentStep === "input" ? (
          <div className="space-y-5 animate-fadeIn">
            {/* Business Hero Banner */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-card border border-hairline flex items-center justify-center shadow-revasy overflow-hidden">
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  getCategoryIcon(business.category)
                )}
              </div>
              <div>
                <h1 className="font-display font-semibold text-2xl text-ink tracking-[-0.02em] break-words">
                  {business.name}
                </h1>
                <p className="text-xs text-muted max-w-xs mx-auto break-words">
                  {business.tagline || business.category}
                </p>
              </div>
            </div>

            {/* Interactive Form */}
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Rating Box with Fitts's Law touch targets */}
              <div className="bg-surface-card p-5 rounded-2xl border border-hairline shadow-subtle text-center space-y-1">
                <h2 className="font-display font-medium text-base text-ink">
                  How was your experience today?
                </h2>
                <RatingSelector value={rating} onChange={(val) => setRating(val)} size="lg" />
                {rating <= 3 && (
                  <div className="mt-3 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl text-left space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Private Resolution Safeguard</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      We care about your experience at {business.name}. If something wasn&apos;t right, you can send private feedback directly to management so we can resolve it immediately.
                    </p>
                    <a
                      href={`mailto:${business.ownerEmail || "widoxstudio@gmail.com"}?subject=${encodeURIComponent(`Private Customer Feedback - ${business.name}`)}&body=${encodeURIComponent(`Rating: ${rating}/5\nFeedback: ${customerText || "I would like to share feedback privately."}`)}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Direct to Management ({business.ownerEmail || "Email"})</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Experience Notes Input */}
              <div className="bg-white p-5 rounded-2xl border border-hairline shadow-subtle space-y-3">
                <div className="space-y-0.5">
                  <label htmlFor="customer-notes" className="block font-display font-semibold text-sm text-ink">
                    Tell us a little about your visit
                  </label>
                  <p className="text-xs text-muted">
                    Mention your favorite dish, service, or staff member.
                  </p>
                </div>

                <textarea
                  id="customer-notes"
                  value={customerText}
                  onChange={(e) => setCustomerText(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder={`e.g. Loved the friendly service at ${business.name}! Everything was prompt and well handled.`}
                  className={`w-full text-sm text-ink p-3.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 ${theme.ring} bg-surface-soft/60 resize-none transition-colors`}
                />

                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className={customerText.trim().length >= 10 ? "text-emerald-700 font-medium" : "text-muted-soft"}>
                    {customerText.length} / 1000 characters
                  </span>
                  <span className="text-muted-soft">AI polishes genuine feedback</span>
                </div>

                {/* Prompt chips matching this business */}
                {business.customPrompts && business.customPrompts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-hairline">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Tap to add quick highlights:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {business.customPrompts.map((prompt, idx) => {
                        const isSelected = isPromptSelected(prompt);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleTogglePrompt(prompt)}
                            className={`press text-xs px-3 py-1.5 rounded-pill border transition-all text-left flex items-center gap-1.5 active:scale-95 ${
                              isSelected
                                ? `${theme.activeButton} border-transparent shadow-sm font-semibold ring-1 ${theme.ring}`
                                : "bg-surface-card hover:bg-surface-strong text-ink border-hairline font-normal"
                            }`}
                            aria-pressed={isSelected}
                            title={isSelected ? `Tap to remove "${prompt}"` : `Tap to add "${prompt}"`}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                            ) : (
                              <span className={`${theme.chipDot} font-bold text-sm leading-none`}>+</span>
                            )}
                            <span>{prompt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isGenerating}
                className="w-full text-base font-semibold shadow-card !rounded-2xl"
              >
                <Sparkles className="w-5 h-5 mr-2 text-brand-pink" />
                <span>Create My Review Drafts</span>
              </Button>
            </form>
          </div>
        ) : feedbackSubmitted ? (
          /* Feedback Confirmation View */
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-white p-7 rounded-3xl border border-hairline shadow-subtle text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-xl text-ink">Thank You for Helping Us Improve!</h3>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  Your private feedback has been delivered directly to the management of <strong>{business.name}</strong>. We value your constructive thoughts and are actively taking steps to ensure your next visit is exceptional.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackSubmitted(false);
                    setCustomerText("");
                    setContactInfo("");
                    setCurrentStep("input");
                  }}
                  className="w-full text-xs font-semibold py-3 px-4 rounded-xl bg-surface-card hover:bg-surface-strong text-ink border border-hairline transition-colors"
                >
                  Share Another Note
                </button>
              </div>
            </div>
          </div>
        ) : isReviewCompleted ? (
          /* Public Review Completed View */
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-revasy text-center space-y-5">
              {/* Contributor Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Google Review Contributor</span>
              </div>

              {/* Glowing animated check icon */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-30" />
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center relative shadow-sm">
                  <CheckCircle2 className="w-11 h-11 text-emerald-600" />
                </div>
              </div>

              {/* Title & Appreciative Copy */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-ink">
                  Thank You for Your Review! 🎉
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  Your feedback was shared for <strong>{business.name}</strong>. Authentic reviews like yours empower neighborhood businesses and help neighbors make great choices!
                </p>
              </div>

              {/* Review Card Summary */}
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

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full text-xs font-semibold !rounded-xl"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.share) {
                      navigator.share({
                        title: `Review ${business.name}`,
                        text: `Check out ${business.name} on Revasy!`,
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      copyToClipboard(window.location.href);
                      showToast("Page link copied to clipboard!");
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  <span>Share This Business Page</span>
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setIsReviewCompleted(false);
                    setCustomerText("");
                    setCurrentStep("input");
                  }}
                  className="w-full text-xs font-semibold py-2.5 px-4 rounded-xl bg-surface-card hover:bg-surface-strong text-ink border border-hairline transition-colors"
                >
                  Write Another Review
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results View: 3 Review Drafts */
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="font-display font-semibold text-2xl text-ink">
                {rating <= 3 ? "Review Your Feedback" : "Choose Your Review Draft"}
              </h2>
              <p className="text-xs text-muted max-w-xs mx-auto">
                {rating <= 3
                  ? "We organized your notes below. Review and send them directly to management to help us improve."
                  : "We organized your notes into 3 authentic styles. Pick your favorite or customize words before continuing to Google!"}
              </p>
            </div>

            {rating <= 3 && (
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-left space-y-2.5 shadow-subtle animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Private Feedback to Management</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Rather than posting publicly to Google, you can resolve your concern directly with the owner of {business.name}.
                </p>
                <a
                  href={`mailto:${business.ownerEmail || "widoxstudio@gmail.com"}?subject=${encodeURIComponent(`Customer Experience Feedback - ${business.name}`)}&body=${encodeURIComponent(`Selected Review Draft:\n"${getSelectedText()}"\n\nOriginal Notes: ${customerText}\nRating: ${rating}/5`)}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email to Management</span>
                </a>
              </div>
            )}

            {/* Draft Cards */}
            <div className="space-y-3">
              {[
                {
                  key: "warm",
                  title: "Warm & Friendly",
                  badge: "Warm",
                  recommended: true,
                  text: warmText,
                  setText: setWarmText,
                },
                {
                  key: "natural",
                  title: "Natural & Balanced",
                  badge: "Natural",
                  recommended: false,
                  text: naturalText,
                  setText: setNaturalText,
                },
                {
                  key: "short",
                  title: "Short & Simple",
                  badge: "Short",
                  recommended: false,
                  text: shortText,
                  setText: setShortText,
                },
              ].map((draft) => {
                const isSelected = selectedKey === draft.key;
                const isEditing = editingCard === draft.key;
                const meta = getDraftMeta(draft.text);

                return (
                  <div
                    key={draft.key}
                    onClick={() => setSelectedKey(draft.key as "natural" | "warm" | "short")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? theme.cardSelected
                        : "bg-surface-card/60 hover:bg-white border-hairline shadow-subtle"
                    }`}
                  >
                    {/* Top Row: Badge, Rating, Actions */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-pill text-[11px] font-bold uppercase tracking-wider bg-surface-card border border-hairline text-ink">
                          {draft.badge}
                        </span>

                        {draft.recommended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider bg-brand-pink/15 text-brand-pink border border-brand-pink/30">
                            <Sparkles className="w-3 h-3" />
                            Recommended
                          </span>
                        )}

                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setEditingCard(isEditing ? null : draft.key)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isEditing ? theme.activeButton : "text-muted hover:text-ink hover:bg-surface-soft"
                          }`}
                          title="Edit text"
                          aria-label="Edit review draft"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCard(draft.key, draft.text)}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                            copiedKey === draft.key
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-surface-card hover:bg-surface-strong text-ink"
                          }`}
                        >
                          {copiedKey === draft.key ? (
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

                    {/* Review Body */}
                    <div className="mt-2.5" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={draft.text}
                            onChange={(e) => draft.setText(e.target.value)}
                            rows={4}
                            className={`w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 ${theme.ring} bg-surface-soft resize-y`}
                          />
                          <button
                            type="button"
                            onClick={() => setEditingCard(null)}
                            className={`text-xs font-semibold ${theme.text} bg-surface-card hover:bg-surface-strong px-3 py-1 rounded-lg border border-hairline`}
                          >
                            Done Editing
                          </button>
                        </div>
                      ) : (
                        <p className={`text-sm leading-relaxed text-ink select-text whitespace-pre-wrap font-sans transition-all duration-300 ${
                          isRegenerating ? "opacity-30 blur-[0.5px]" : "opacity-100"
                        }`}>
                          &ldquo;{draft.text}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Meta info & Selection indicator */}
                    <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-muted-soft text-[11px]">
                        <span>{meta.words} words</span>
                        <span>&bull;</span>
                        <span>~{meta.readTimeSec}s read</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-medium">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? theme.bullet : "border-hairline bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        <span className={isSelected ? theme.bulletSelectedText : "text-muted"}>
                          {isSelected ? (rating <= 3 ? "Selected for Management" : "Selected for Google") : "Select this"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar (Fitts's Law sticky thumb area) */}
            <div className="sticky bottom-4 z-20 bg-canvas/95 backdrop-blur-md p-3.5 rounded-3xl border border-hairline shadow-floating space-y-2">
              {rating <= 3 ? (
                <div className="space-y-2">
                  <div className="px-1">
                    <input
                      type="text"
                      placeholder="Optional: Email or phone for manager follow-up"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-hairline bg-surface-soft/80 text-ink focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-base font-semibold shadow-revasy !rounded-2xl"
                    onClick={handleSendPrivateFeedback}
                    isLoading={isSubmittingFeedback}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span>Send Private Feedback to Management</span>
                  </Button>
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleContinueToGoogle}
                      className="text-[11px] text-muted hover:text-ink underline transition-colors"
                    >
                      Prefer to post publicly on Google instead?
                    </button>
                  </div>
                </div>
              ) : (
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
                      {/* Google G Colors */}
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
              )}

              <div className="flex items-center justify-between px-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setCurrentStep("input")}
                  className="flex items-center gap-1 text-xs font-medium text-muted hover:text-ink transition-colors p-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit notes</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-pink hover:opacity-80 disabled:opacity-50 transition-colors p-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                  <span>{isRegenerating ? "Regenerating..." : "Regenerate drafts"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <GoogleReviewLaunchModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        businessName={business.name}
        rating={rating}
        reviewText={getSelectedText()}
        googleReviewUrl={business.googleReviewUrl}
        placeId={business.placeId}
        onCompleted={() => {
          setShowConfetti(true);
          setIsReviewCompleted(true);
          showToast("🎉 Thank you for sharing your review on Google!");
        }}
      />

      <Toast isOpen={isToastOpen} message={toastMessage} onClose={() => setIsToastOpen(false)} />
    </div>
  );
}
