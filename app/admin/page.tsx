"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ReplyGenerator } from "@/components/admin/ReplyGenerator";
import { Toast } from "@/components/ui/Toast";
import { MessageSquareQuote, CheckCircle, ExternalLink, ShieldAlert } from "lucide-react";
import { config } from "@/lib/config";

export default function AdminDashboardPage() {
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const handleCopyToast = (text: string) => {
    setToastMessage("Reply copied to clipboard! Ready to paste into Google Business Profile.");
    setIsToastOpen(true);
  };

  return (
    <div className="min-h-screen bg-crema-warm flex flex-col">
      <AdminHeader adminEmail={config.admin.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-espresso to-espresso-light text-cream rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
              Cafe Owner Tool
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-tight text-white">
              Replying to Google Reviews
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Timely, courteous replies improve your Google Maps ranking and demonstrate top-tier hospitality to future diners.
            </p>
          </div>

          <a
            href={config.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-colors shrink-0"
          >
            <span>Open Google Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* AI Reply Generator Component */}
        <ReplyGenerator onCopySuccess={handleCopyToast} />

        {/* Best Practice Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-cafe-200/80 shadow-subtle space-y-2">
            <div className="flex items-center gap-2 text-espresso font-serif font-semibold text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Handling 5-Star Reviews</span>
            </div>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Always express genuine appreciation, highlight specific items they loved, and invite them back to create lasting loyalty.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cafe-200/80 shadow-subtle space-y-2">
            <div className="flex items-center gap-2 text-espresso font-serif font-semibold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Handling Critical Reviews</span>
            </div>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Acknowledge issues with empathy, apologize without making unvetted legal or monetary promises, and offer an offline email to resolve details.
            </p>
          </div>
        </div>
      </main>

      <Toast
        isOpen={isToastOpen}
        message={toastMessage}
        onClose={() => setIsToastOpen(false)}
        duration={3500}
      />
    </div>
  );
}
