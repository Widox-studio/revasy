"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  QrCode,
  MessageSquareQuote,
  Settings,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Star,
  Printer,
  ShieldCheck,
  Building2,
  CheckCircle,
  Eye,
  Sliders,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { UserButton } from "@clerk/nextjs";
import { Business } from "@/lib/business-store";
import { generateQrDataUrl } from "@/lib/qr";

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"replies" | "qr" | "settings">("replies");

  // QR Code data URL
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [publicUrl, setPublicUrl] = useState<string>("");

  // Stand Theme Simulator
  const [standBackdrop, setStandBackdrop] = useState<"wood" | "marble" | "canvas">("canvas");
  const [standFormat, setStandFormat] = useState<"tent" | "acrylic">("tent");

  // AI Reply Generator State
  const [replyRating, setReplyRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState<string>("");
  const [customerReview, setCustomerReview] = useState<string>("");
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [replies, setReplies] = useState<{
    professional: string;
    warm: string;
    concise: string;
  } | null>(null);
  const [copiedReplyKey, setCopiedReplyKey] = useState<string | null>(null);

  // Settings State
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editGoogleUrl, setEditGoogleUrl] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);
  };

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/businesses/${slug}`);
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await res.json();
        const biz: Business = data.business;
        setBusiness(biz);
        setEditName(biz.name);
        setEditTagline(biz.tagline || "");
        setEditGoogleUrl(biz.googleReviewUrl);

        // Generate QR Code
        const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const url = `${origin}/b/${biz.slug}`;
        setPublicUrl(url);

        const qr = await generateQrDataUrl(url);
        setQrCodeDataUrl(qr);
      } catch (err) {
        console.error("Error loading business:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug, router]);

  const handleGenerateReplies = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (customerReview.trim().length < 5) {
      showToast("Please enter at least 5 characters of review text.");
      return;
    }

    setIsGeneratingReplies(true);

    try {
      const res = await fetch("/api/admin/reply/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: replyRating,
          customerReview: customerReview.trim(),
          reviewerName: reviewerName.trim() || undefined,
          businessSlug: slug,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate replies");

      setReplies(data.replies);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating replies";
      showToast(msg);
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  const handleCopyReply = async (key: string, text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedReplyKey(key);
      showToast("Reply copied! Ready to paste into Google Business Profile.");
      setTimeout(() => setCopiedReplyKey(null), 2500);
    } catch {
      showToast("Failed to copy");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch(`/api/businesses/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          tagline: editTagline.trim(),
          googleReviewUrl: editGoogleUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setBusiness(data.business);
      showToast("Business profile updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      showToast(msg);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `${slug}-google-review-qr.png`;
    a.click();
    showToast("Downloaded high-res QR code image!");
  };

  if (isLoading || !business) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-hairline border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted">Loading business workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 md:px-8 py-3.5 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-muted hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-surface-card"
              title="Return to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-display font-semibold text-lg text-ink truncate max-w-[200px] sm:max-w-none">
              {business.name}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-surface-card border border-hairline text-brand-teal">
              {business.category}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`/b/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card hover:bg-surface-strong border border-hairline rounded-lg text-xs font-semibold text-ink transition-colors"
            >
              <span>Guest Review Flow</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted" />
            </a>

            <Link
              href="/dashboard"
              className="text-xs text-muted hover:text-ink font-medium px-2.5 py-1.5 rounded-lg hover:bg-surface-soft transition-colors"
            >
              All Businesses
            </Link>

            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 md:px-8 pt-6 space-y-6 flex-1">
        {/* Business Summary Card */}
        <div className="bg-surface-card rounded-3xl p-6 border border-hairline shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-hairline flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-7 h-7 text-muted" />
              )}
            </div>
            <div className="space-y-0.5">
              <h1 className="font-display font-semibold text-2xl text-ink">
                {business.name}
              </h1>
              <p className="text-xs text-muted">
                Public Review Link:{" "}
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-pink font-semibold underline underline-offset-2 break-all"
                >
                  {publicUrl}
                </a>
              </p>
            </div>
          </div>

          {/* Stats pills (Miller's Law chunking) */}
          <div className="flex items-center gap-2.5">
            <div className="bg-white px-3.5 py-2 rounded-xl border border-hairline text-center min-w-[85px]">
              <span className="block font-display font-semibold text-base text-ink">
                {business.stats?.totalReviewsGenerated || 0}
              </span>
              <span className="text-[10px] text-muted uppercase font-medium">Reviews AI</span>
            </div>
            <div className="bg-white px-3.5 py-2 rounded-xl border border-hairline text-center min-w-[85px]">
              <span className="block font-display font-semibold text-base text-ink">
                {business.stats?.totalRepliesGenerated || 0}
              </span>
              <span className="text-[10px] text-muted uppercase font-medium">Replies AI</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation with Clear Active State */}
        <div className="flex border-b border-hairline gap-2 overflow-x-auto no-print">
          <button
            onClick={() => setActiveTab("replies")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "replies"
                ? "border-primary text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-brand-pink" />
            <span>AI Google Reply Generator</span>
          </button>

          <button
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "qr"
                ? "border-primary text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <QrCode className="w-4 h-4 text-brand-teal" />
            <span>NFC &amp; QR Stand Kit</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "settings"
                ? "border-primary text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Settings className="w-4 h-4 text-brand-ochre" />
            <span>Business Profile</span>
          </button>
        </div>

        {/* Tab 1: AI Google Reply Generator */}
        {activeTab === "replies" && (
          <div className="space-y-6 animate-fadeIn">
            <form
              onSubmit={handleGenerateReplies}
              className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-subtle space-y-4"
            >
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-lg text-ink">
                  AI Google Review Reply Generator for {business.name}
                </h3>
                <p className="text-xs text-muted">
                  Paste incoming reviews from Google Maps. AI will compose 3 hospitality-grade replies tailored to your {business.category}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Customer Star rating */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Customer&apos;s Star Rating
                  </label>
                  <div className="flex items-center gap-1.5 p-2 bg-surface-soft rounded-xl border border-hairline">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReplyRating(star)}
                        className="p-1.5 rounded-lg hover:scale-115 active:scale-95 transition-transform"
                        aria-label={`Select ${star} stars`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= replyRating ? "fill-amber-400 text-amber-500" : "text-hairline"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-ink ml-2">
                      {replyRating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Reviewer name */}
                <div className="space-y-1.5">
                  <label htmlFor="reviewer-name" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Reviewer Name <span className="text-muted-soft font-normal">(optional)</span>
                  </label>
                  <input
                    id="reviewer-name"
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Jessica Thompson"
                    maxLength={80}
                    className="w-full text-sm text-ink p-2.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
                  />
                </div>
              </div>

              {/* Review Text Area */}
              <div className="space-y-1.5">
                <label htmlFor="pasted-review" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Paste Customer&apos;s Review Text
                </label>
                <textarea
                  id="pasted-review"
                  value={customerReview}
                  onChange={(e) => setCustomerReview(e.target.value)}
                  rows={4}
                  maxLength={2500}
                  placeholder={`e.g. Had an amazing visit at ${business.name}! The atmosphere was warm, staff were attentive, and everything was handled with great care.`}
                  className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40 resize-y"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-soft px-1">
                  <span>{customerReview.length} / 2500 characters</span>
                  <span>AI references only genuine customer feedback</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isGeneratingReplies}
                className="shadow-widox"
              >
                <Sparkles className="w-4 h-4 mr-2 text-brand-pink" />
                <span>Generate Tailored Replies</span>
              </Button>
            </form>

            {/* Generated Replies Display */}
            {replies && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink">
                      Generated Replies
                    </h3>
                    <p className="text-xs text-muted">
                      Copy your preferred reply and paste it directly into Google Business Profile.
                    </p>
                  </div>

                  <button
                    onClick={() => handleGenerateReplies()}
                    disabled={isGeneratingReplies}
                    className="press inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-surface-card hover:bg-surface-strong border border-hairline rounded-lg text-ink disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingReplies ? "animate-spin" : ""}`} />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "professional", title: "Professional", desc: "Formal hospitality standard", text: replies.professional },
                    { key: "warm", title: "Warm & Friendly", desc: "Heartfelt neighborhood tone", text: replies.warm },
                    { key: "concise", title: "Concise", desc: "Direct 2-sentence acknowledgement", text: replies.concise },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="bg-white rounded-2xl border border-hairline p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:shadow-card transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-pill bg-surface-card border border-hairline text-ink">
                            {item.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyReply(item.key, item.text)}
                            className={`press flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                              copiedReplyKey === item.key
                                ? "bg-emerald-600 text-white"
                                : "bg-primary text-on-primary hover:bg-black"
                            }`}
                          >
                            {copiedReplyKey === item.key ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-soft">{item.desc}</p>
                        <p className="text-sm text-body leading-relaxed select-text bg-surface-soft/60 p-3.5 rounded-xl border border-hairline/80 font-sans">
                          {item.text}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-soft pt-1 border-t border-hairline/60">
                        <span>{item.text.split(/\s+/).filter(Boolean).length} words</span>
                        <span>{item.text.length} chars</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: NFC & QR Stand Kit */}
        {activeTab === "qr" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stand Controls & Context */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-card p-4 rounded-2xl border border-hairline no-print">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-semibold text-ink">Stand Preview Settings:</span>
              </div>

              {/* Backdrop toggle */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted">Table Environment:</span>
                {[
                  { key: "canvas", label: "Studio Canvas" },
                  { key: "wood", label: "Cafe Wood" },
                  { key: "marble", label: "Marble Desk" },
                ].map((env) => (
                  <button
                    key={env.key}
                    type="button"
                    onClick={() => setStandBackdrop(env.key as typeof standBackdrop)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      standBackdrop === env.key
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-white text-ink border-hairline hover:bg-surface-soft"
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Stand Preview Simulation Box */}
              <div
                className={`p-6 sm:p-10 rounded-3xl border border-hairline shadow-subtle transition-all duration-300 ${
                  standBackdrop === "wood"
                    ? "bg-gradient-to-br from-[#3b2317] via-[#2c1910] to-[#1c0e08]"
                    : standBackdrop === "marble"
                    ? "bg-gradient-to-br from-[#f3f4f6] via-[#e5e7eb] to-[#d1d5db]"
                    : "bg-surface-soft"
                }`}
              >
                <div className="text-center pb-3 no-print">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    standBackdrop === "wood" ? "text-amber-200/80" : "text-muted"
                  }`}>
                    Acrylic Tent Stand Simulation
                  </span>
                </div>

                {/* Printable Table Tent Card */}
                <div className="printable-stand bg-gradient-to-b from-white to-surface-card p-7 sm:p-8 rounded-3xl border-2 border-hairline shadow-floating text-center max-w-xs mx-auto space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-2 bg-brand-teal" />

                  {/* Brand Logo & Name */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-soft border border-hairline flex items-center justify-center overflow-hidden shadow-sm">
                      {business.logoUrl ? (
                        <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-7 h-7 text-muted" />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-xl text-ink leading-tight">
                      {business.name}
                    </h3>
                    <p className="text-xs text-muted font-medium line-clamp-1">
                      {business.tagline || "We appreciate your feedback!"}
                    </p>
                  </div>

                  {/* High-Contrast QR Code */}
                  <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-hairline shadow-sm flex items-center justify-center">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full" />
                    ) : (
                      <QrCode className="w-24 h-24 text-muted animate-pulse" />
                    )}
                  </div>

                  {/* CTA & Rating Stars */}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-brand-pink/15 text-ink text-[11px] font-bold uppercase tracking-wider">
                      <span>Tap NFC or Scan QR</span>
                    </div>
                    <p className="text-xs text-body font-medium">
                      Share your experience on Google in 30s
                    </p>
                    <div className="flex items-center justify-center gap-1 text-amber-500 pt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-soft pt-2 border-t border-hairline">
                    Powered by Widox Review Assistant
                  </p>
                </div>
              </div>

              {/* QR Management & Export Actions */}
              <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-subtle space-y-6 no-print">
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-xl text-ink">
                    Deploy Your NFC &amp; QR Stand
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    This high-resolution QR code and NFC link directs customers directly to your business&apos;s custom review generator.
                  </p>
                </div>

                {/* Destination link card */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Destination URL
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-surface-soft rounded-xl border border-hairline text-xs font-mono text-ink">
                    <span className="truncate flex-1">{publicUrl}</span>
                    <button
                      onClick={() => {
                        if (navigator.clipboard) navigator.clipboard.writeText(publicUrl);
                        showToast("Copied destination URL!");
                      }}
                      className="text-brand-teal hover:underline font-sans font-semibold text-xs"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={downloadQrCode}
                    className="w-full text-sm font-semibold shadow-widox !rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2 text-brand-mint" />
                    <span>Download High-Res QR Code (.PNG)</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") window.print();
                    }}
                    className="press w-full py-3 px-4 bg-surface-card hover:bg-surface-strong border border-hairline rounded-xl text-xs font-semibold text-ink flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-muted" />
                    <span>Print Table Tent Card</span>
                  </button>
                </div>

                {/* NFC Setup Instructions */}
                <div className="bg-surface-soft p-4 rounded-2xl border border-hairline space-y-1.5 text-xs text-body">
                  <span className="font-semibold text-ink block">How to write NFC pucks &amp; stickers:</span>
                  <p className="text-muted leading-relaxed">
                    Use any free NFC app (e.g. &ldquo;NFC Tools&rdquo;) on iOS or Android, select &ldquo;Write URL&rdquo;, and paste your link above to program NFC tags for acrylic stands, counter pucks, or billing folios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Business Settings */}
        {activeTab === "settings" && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-subtle space-y-5 max-w-2xl animate-fadeIn no-print"
          >
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-ink">
                Business Profile Settings
              </h3>
              <p className="text-xs text-muted">
                Update your business identity and Google review target URL.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-name" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Business Name
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-tagline" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Tagline / Vibe
              </label>
              <input
                id="edit-tagline"
                type="text"
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
                className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-google" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Google Review URL
              </label>
              <input
                id="edit-google"
                type="url"
                required
                value={editGoogleUrl}
                onChange={(e) => setEditGoogleUrl(e.target.value)}
                className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSavingSettings}
              className="shadow-widox"
            >
              <span>Save Changes</span>
            </Button>
          </form>
        )}
      </main>

      <Toast isOpen={isToastOpen} message={toastMessage} onClose={() => setIsToastOpen(false)} />
    </div>
  );
}
