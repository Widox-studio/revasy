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
    <div className="min-h-screen bg-gradient-to-b from-cafe-50 via-crema to-cafe-100/40 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-crema/90 backdrop-blur-md border-b border-cafe-200/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-espresso-muted hover:text-espresso transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-espresso text-cream flex items-center justify-center">
              <Coffee className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-serif font-bold text-sm text-espresso tracking-tight">
              {config.cafe.name}
            </span>
          </div>

          <div className="w-12 text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-6">
        {currentStep === "input" ? (
          <div className="space-y-4">
            {/* Branding Banner */}
            <div className="text-center space-y-1 pb-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-espresso text-cream flex items-center justify-center shadow-card border border-espresso-light mb-3">
                <Coffee className="w-7 h-7 text-amber-400" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-espresso tracking-tight">
                {config.cafe.name}
              </h1>
              <p className="text-xs text-espresso-muted">
                {config.cafe.tagline}
              </p>
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
