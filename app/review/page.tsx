"use client";

import React, { useState } from "react";
import { Coffee, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReviewForm } from "@/components/review/ReviewForm";
import { ReviewResults } from "@/components/review/ReviewResults";
import { Toast } from "@/components/ui/Toast";
import { config } from "@/lib/config";

export default function CustomerReviewPage() {
  const [currentStep, setCurrentStep] = useState<"input" | "results">("input");
  const [activeRating, setActiveRating] = useState<number>(5);
  const [activeCustomerText, setActiveCustomerText] = useState<string>("");
  const [drafts, setDrafts] = useState<{
    natural: string;
    warm: string;
    short: string;
  } | null>(null);

  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isToastOpen, setIsToastOpen] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastOpen(true);
  };

  const handleReviewGenerated = (data: {
    rating: number;
    customerText: string;
    drafts: { natural: string; warm: string; short: string };
  }) => {
    setActiveRating(data.rating);
    setActiveCustomerText(data.customerText);
    setDrafts(data.drafts);
    setCurrentStep("results");
  };

  const handleRegenerate = async () => {
    if (!activeCustomerText) return;
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: activeRating,
          customerText: activeCustomerText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to regenerate drafts.");
      }

      setDrafts(data.drafts);
      showToast("Generated new drafts!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error regenerating";
      showToast(msg);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between pb-safe">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display font-bold">revasy<span className="text-brand-pink">.</span></span>
          </Link>

          <span className="font-display font-semibold text-sm text-ink truncate max-w-[180px]">
            {config.cafe.name}
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-pill bg-emerald-50 border border-emerald-200 text-emerald-800">
            Verified
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-4 pt-6 pb-8 flex-1">
        {currentStep === "input" ? (
          <div className="space-y-4">
            {/* Branding Banner */}
            <div className="text-center space-y-2 pb-1">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-card border border-hairline flex items-center justify-center shadow-revasy overflow-hidden">
                <Coffee className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="font-display font-semibold text-2xl text-ink tracking-[-0.02em]">
                  {config.cafe.name}
                </h1>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  {config.cafe.tagline}
                </p>
              </div>
            </div>

            <ReviewForm
              onSubmitSuccess={handleReviewGenerated}
              initialRating={activeRating}
              initialText={activeCustomerText}
            />
          </div>
        ) : (
          drafts && (
            <ReviewResults
              rating={activeRating}
              drafts={drafts}
              onRegenerate={handleRegenerate}
              onStartOver={() => setCurrentStep("input")}
              isRegenerating={isRegenerating}
              onCopySuccess={(text) => showToast("Copied to clipboard!")}
            />
          )
        )}
      </main>

      <Toast
        isOpen={isToastOpen}
        message={toastMessage}
        onClose={() => setIsToastOpen(false)}
      />
    </div>
  );
}
