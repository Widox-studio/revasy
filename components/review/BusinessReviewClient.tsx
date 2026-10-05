"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { RatingSelector } from "./RatingSelector";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Business } from "@/lib/business-store";

interface ReviewDrafts {
  natural: string;
  warm: string;
  short: string;
}

export function BusinessReviewClient({ business }: { business: Business }) {
  // Flow State
  const [currentStep, setCurrentStep] = useState<"input" | "results">("input");
  const [rating, setRating] = useState<number>(5);
  const [customerText, setCustomerText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [drafts, setDrafts] = useState<ReviewDrafts | null>(null);

  // Results State
  const [naturalText, setNaturalText] = useState("");
  const [warmText, setWarmText] = useState("");
  const [shortText, setShortText] = useState("");
  const [selectedKey, setSelectedKey] = useState<"natural" | "warm" | "short">("warm");
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCopiedToGoogle, setIsCopiedToGoogle] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);
  };

  const handleAddPrompt = (prompt: string) => {
    setCustomerText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return prompt;
      return `${trimmed}. ${prompt}`;
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerText.trim().length < 3) {
      showToast("Please enter at least 3 characters describing your experience.");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          customerText: customerText.trim(),
          businessSlug: business.slug,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed.";
      showToast(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          customerText: customerText.trim(),
          businessSlug: business.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      setDrafts(data.drafts);
      setNaturalText(data.drafts.natural);
      setWarmText(data.drafts.warm);
      setShortText(data.drafts.short);
      showToast("Generated new drafts!");
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
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setIsCopiedToGoogle(true);
      showToast("Draft copied! Opening Google Reviews...");
    } catch {
      // Fallback
    }

    const targetUrl = business.googleReviewUrl || "https://search.google.com";
    setTimeout(() => {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }, 450);
  };

  const handleCopyCard = async (key: string, text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      showToast("Copied to clipboard!");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
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

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>widox<span className="text-brand-pink">.</span></span>
          </Link>

          <span className="font-display font-semibold text-sm text-ink truncate max-w-[180px]">
            {business.name}
          </span>

          <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-card border border-hairline text-muted px-2.5 py-0.5 rounded-pill">
            Verified
          </span>
        </div>
      </header>

      {/* Main Review Form / Results Container */}
      <main className="max-w-md w-full mx-auto px-4 pt-6 flex-1">
        {currentStep === "input" ? (
          <div className="space-y-5 animate-fadeIn">
            {/* Business Hero Banner */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-card border border-hairline flex items-center justify-center shadow-widox overflow-hidden">
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  getCategoryIcon(business.category)
                )}
              </div>
              <div>
                <h1 className="font-display font-semibold text-2xl text-ink tracking-[-0.02em]">
                  {business.name}
                </h1>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  {business.tagline || business.category}
                </p>
              </div>
            </div>

            {/* Interactive Form */}
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Rating Box */}
              <div className="bg-surface-card p-5 rounded-2xl border border-hairline shadow-subtle text-center space-y-1">
                <h2 className="font-display font-medium text-base text-ink">
                  How was your experience today?
                </h2>
                <RatingSelector value={rating} onChange={(val) => setRating(val)} size="lg" />
              </div>

              {/* Experience Notes */}
              <div className="bg-white p-5 rounded-2xl border border-hairline shadow-subtle space-y-3">
                <div className="space-y-0.5">
                  <label htmlFor="customer-notes" className="block font-display font-semibold text-sm text-ink">
                    Tell us a little about your visit
                  </label>
                  <p className="text-xs text-muted">
                    Mention your favorite part, staff member, or service.
                  </p>
                </div>

                <textarea
                  id="customer-notes"
                  value={customerText}
                  onChange={(e) => setCustomerText(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder={`e.g. Really loved the service at ${business.name}! Everything was smooth, professional, and well organized.`}
                  className="w-full text-sm text-ink p-3.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/60 resize-none transition-colors"
                />

                <div className="flex items-center justify-between text-[11px] text-muted-soft px-1">
                  <span>{customerText.length} / 1000</span>
                  <span>AI polishes only genuine notes</span>
                </div>

                {/* Prompt chips matching this business */}
                {business.customPrompts && business.customPrompts.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-hairline">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
                      <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Tap to add quick highlights:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {business.customPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddPrompt(prompt)}
                          className="text-xs bg-surface-card hover:bg-surface-strong active:scale-95 text-ink px-3 py-1.5 rounded-pill border border-hairline transition-all text-left"
                        >
                          + {prompt}
                        </button>
                      ))}
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
                <span>Create My Review</span>
              </Button>
            </form>
          </div>
        ) : (
          /* Results View: 3 Review Drafts */
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="font-display font-semibold text-2xl text-ink">
                Choose Your Review Draft
              </h2>
              <p className="text-xs text-muted max-w-xs mx-auto">
                We polished your notes into 3 authentic styles. Pick your favorite or tweak words before posting to Google!
              </p>
            </div>

            {/* Draft Cards */}
            <div className="space-y-3">
              {[
                { key: "natural", title: "Natural & Balanced", badge: "Natural", text: naturalText, setText: setNaturalText },
                { key: "warm", title: "Warm & Friendly", badge: "Warm", text: warmText, setText: setWarmText },
                { key: "short", title: "Short & Simple", badge: "Short", text: shortText, setText: setShortText },
              ].map((draft) => {
                const isSelected = selectedKey === draft.key;
                const isEditing = editingCard === draft.key;

                return (
                  <div
                    key={draft.key}
                    onClick={() => setSelectedKey(draft.key as "natural" | "warm" | "short")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-brand-teal shadow-card ring-2 ring-brand-teal/20"
                        : "bg-surface-card/60 hover:bg-white border-hairline shadow-subtle"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-pill text-[11px] font-bold uppercase tracking-wider bg-surface-card border border-hairline text-ink">
                          {draft.badge}
                        </span>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setEditingCard(isEditing ? null : draft.key)}
                          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-soft transition-colors"
                          title="Edit text"
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

                    <div className="mt-2" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <textarea
                          value={draft.text}
                          onChange={(e) => draft.setText(e.target.value)}
                          rows={4}
                          className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft resize-y"
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-ink select-text whitespace-pre-wrap">
                          &ldquo;{draft.text}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between text-xs">
                      <span className="text-muted-soft">
                        {isEditing ? "Tap icon when finished" : "Tap card to select"}
                      </span>
                      <div className="flex items-center gap-1.5 font-medium">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? "border-brand-teal bg-brand-teal text-white" : "border-hairline bg-white"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className={isSelected ? "text-brand-teal font-semibold" : "text-muted"}>
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="sticky bottom-4 z-20 bg-canvas/90 backdrop-blur-md p-3.5 rounded-2xl border border-hairline shadow-floating space-y-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-semibold shadow-widox !rounded-2xl"
                onClick={handleContinueToGoogle}
              >
                {isCopiedToGoogle ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2 text-brand-mint" />
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
                  <span>Regenerate drafts</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toast isOpen={isToastOpen} message={toastMessage} onClose={() => setIsToastOpen(false)} />
    </div>
  );
}
