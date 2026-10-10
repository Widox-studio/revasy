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
  ShieldAlert,
  Power,
  Globe,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Bot,
  Heart,
  Zap,
  Lock,
  MapPin,
  Ban,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { UserButton, useClerk } from "@clerk/nextjs";
import { Business, AutoReplyLog } from "@/lib/business-store";
import { generateQrDataUrl } from "@/lib/qr";
import { getAccentTheme } from "@/lib/theme";
import { LogoUploader } from "@/components/ui/LogoUploader";

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const theme = getAccentTheme(business?.accentColor);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [hasMultipleLocations, setHasMultipleLocations] = useState(false);
  const [activeTab, setActiveTab] = useState<"replies" | "qr" | "settings">("replies");

  // QR Code data URL
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [publicUrl, setPublicUrl] = useState<string>("");

  // Stand Theme Simulator
  const [standBackdrop, setStandBackdrop] = useState<"wood" | "marble" | "canvas">("canvas");
  const [standFormat, setStandFormat] = useState<"tent" | "acrylic">("tent");

  // Auto-Reply Settings & State
  const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState(false);
  const [autoReplyTone, setAutoReplyTone] = useState<"warm" | "professional" | "concise">("warm");
  const [autoReplyMinRating, setAutoReplyMinRating] = useState<number>(1);
  const [autoReplySignature, setAutoReplySignature] = useState<string>("");
  const [isTogglingAutoReply, setIsTogglingAutoReply] = useState(false);
  const [isSyncingAutoReply, setIsSyncingAutoReply] = useState(false);
  const [isSavingAutoReplySettings, setIsSavingAutoReplySettings] = useState(false);
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false);
  const [autoReplyLogs, setAutoReplyLogs] = useState<AutoReplyLog[]>([]);

  // Manual AI Reply Generator State
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
  const [editDescription, setEditDescription] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
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
          if (res.status === 403 || res.status === 404) {
            setIsForbidden(true);
            setIsLoading(false);
            return;
          }
          router.push("/dashboard");
          return;
        }
        const data = await res.json();
        const biz: Business = data.business;
        setBusiness(biz);
        setEditName(biz.name);
        setEditTagline(biz.tagline || "");
        setEditDescription(biz.description || "");
        setEditLogoUrl(biz.logoUrl || "");

        // Initialize Auto-Reply State (only enabled if Google connected AND verified location exists)
        const hasValidLoc = Boolean(biz.googleOAuth?.connected && biz.googleOAuth?.locationName);
        setIsAutoReplyEnabled(hasValidLoc && (biz.autoReplyConfig?.enabled ?? false));
        setAutoReplyTone(biz.autoReplyConfig?.tone || "warm");
        setAutoReplyMinRating(biz.autoReplyConfig?.minRating || 1);
        setAutoReplySignature(biz.autoReplyConfig?.signature || `— Team ${biz.name}`);
        setAutoReplyLogs(biz.autoReplyLogs || []);

        // Check if caller has multiple locations
        try {
          const listRes = await fetch("/api/businesses");
          const listData = await listRes.json();
          if (listData.businesses) {
            setHasMultipleLocations(listData.businesses.length > 1);
          }
        } catch {}

        // Check URL for Google OAuth redirect query param
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("google_connected") === "true") {
            showToast("Google Business Profile connected! Autonomous Auto-Reply is active.");
            window.history.replaceState({}, "", window.location.pathname);
          } else if (urlParams.get("google_error")) {
            showToast(`Google OAuth Notice: ${urlParams.get("google_error")}`);
            window.history.replaceState({}, "", window.location.pathname);
          }
        }

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

  // Toggle Auto-Reply Master Switch
  const handleToggleAutoReply = async () => {
    if (!business?.googleOAuth?.connected) {
      showToast("Please connect your Google Business Profile first to enable auto-replies.");
      return;
    }

    if (!business?.googleOAuth?.locationName) {
      showToast("Cannot enable auto-reply: No Google Business Profile location detected under this Google account.");
      return;
    }

    const nextState = !isAutoReplyEnabled;
    setIsTogglingAutoReply(true);

    try {
      const res = await fetch(`/api/businesses/${slug}/autoreply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", enabled: nextState }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed toggling auto-reply");

      setIsAutoReplyEnabled(data.enabled);
      showToast(
        data.enabled
          ? "Autonomous Auto-Reply enabled! revasy AI will reply to incoming reviews."
          : "Auto-Reply paused. Incoming reviews will await manual response."
      );
    } catch (err: any) {
      showToast(err?.message || "Error toggling auto-reply");
    } finally {
      setIsTogglingAutoReply(false);
    }
  };

  // Save Auto-Reply Preferences
  const handleSaveAutoReplySettings = async () => {
    setIsSavingAutoReplySettings(true);
    try {
      const res = await fetch(`/api/businesses/${slug}/autoreply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          tone: autoReplyTone,
          minRating: autoReplyMinRating,
          signature: autoReplySignature.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed saving preferences");

      showToast("Auto-Reply preferences saved successfully!");
    } catch (err: any) {
      showToast(err?.message || "Error saving preferences");
    } finally {
      setIsSavingAutoReplySettings(false);
    }
  };

  // Trigger On-Demand Review Sync & Auto-Reply Run
  const handleSyncNow = async () => {
    setIsSyncingAutoReply(true);
    try {
      const res = await fetch(`/api/businesses/${slug}/autoreply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_now" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      showToast(data.message || "Sync completed!");

      // Refresh business data & logs
      const refreshRes = await fetch(`/api/businesses/${slug}`);
      if (refreshRes.ok) {
        const freshData = await refreshRes.json();
        setBusiness(freshData.business);
        setAutoReplyLogs(freshData.business.autoReplyLogs || []);
      }
    } catch (err: any) {
      showToast(err?.message || "Sync error occurred");
    } finally {
      setIsSyncingAutoReply(false);
    }
  };

  // Disconnect Google Account
  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect Google Business Profile? Automated replies will stop.")) {
      return;
    }

    setIsDisconnectingGoogle(true);
    try {
      const res = await fetch(`/api/auth/google/disconnect?slug=${slug}`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed disconnecting");

      setIsAutoReplyEnabled(false);
      showToast("Google Business Profile disconnected.");

      // Refresh business
      const refreshRes = await fetch(`/api/businesses/${slug}`);
      if (refreshRes.ok) {
        const freshData = await refreshRes.json();
        setBusiness(freshData.business);
      }
    } catch (err: any) {
      showToast(err?.message || "Error disconnecting Google");
    } finally {
      setIsDisconnectingGoogle(false);
    }
  };

  // Clear Auto-Reply Logs History
  const [isClearingLogs, setIsClearingLogs] = useState(false);
  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear the auto-reply activity log history?")) return;
    setIsClearingLogs(true);
    try {
      const res = await fetch(`/api/businesses/${slug}/autoreply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_logs" }),
      });
      if (res.ok) {
        setAutoReplyLogs([]);
        showToast("Activity history cleared.");
      }
    } catch {
      showToast("Failed clearing activity history.");
    } finally {
      setIsClearingLogs(false);
    }
  };

  // Manual AI Reply Generator
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
          description: editDescription.trim(),
          logoUrl: editLogoUrl,
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

  const { signOut } = useClerk();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}

    try {
      await signOut({ redirectUrl: "/login" });
    } catch {
      window.location.href = "/login";
    }
  };

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-hairline p-8 shadow-subtle text-center space-y-5 animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-pill bg-red-50 border border-red-200 text-red-700">
              Access Revoked or Location Inactive
            </span>
            <h1 className="font-display font-semibold text-xl text-ink">
              Access Restricted
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              This business is either no longer active or access has been revoked by administration. Your account does not have permission to manage this location.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="press w-full py-2.5 px-4 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm"
            >
              Return to My Dashboard
            </Link>
            <Link
              href="/"
              className="text-xs text-muted hover:text-ink font-medium py-1.5"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const isGoogleConnected = !!business.googleOAuth?.connected;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 md:px-8 py-3.5 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-muted hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-surface-card flex items-center gap-2"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <img src="/revasy-logo.png" alt="revasy" className="w-5 h-5 object-contain rounded" />
            </Link>
            <span className="font-display font-semibold text-lg text-ink truncate max-w-[200px] sm:max-w-none">
              {business.name}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-surface-card border border-hairline text-brand-teal">
              {business.category}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-muted hover:text-ink font-medium px-2.5 py-1.5 rounded-lg hover:bg-surface-soft transition-colors"
            >
              Dashboard
            </Link>

            <a
              href={`/b/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card hover:bg-surface-strong border border-hairline rounded-lg text-xs font-semibold text-ink transition-colors"
            >
              <span>Guest Review Flow</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted" />
            </a>

            <UserButton afterSignOutUrl="/login" />

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="press p-2 text-muted hover:text-ink hover:bg-surface-card rounded-xl border border-hairline transition-colors disabled:opacity-50"
              title="Log out"
            >
              <LogOut className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`} />
            </button>
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
                <img src={business.logoUrl} alt={business.name} className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="w-7 h-7 text-muted" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-semibold text-2xl text-ink">
                  {business.name}
                </h1>
                {isGoogleConnected && isAutoReplyEnabled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 animate-fadeIn">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Auto-Reply Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                Public Review Link:{" "}
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono"
                >
                  {publicUrl}
                </a>
              </p>
            </div>
          </div>

          {/* Stats pills */}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-hairline gap-2 overflow-x-auto no-print">
          <button
            onClick={() => setActiveTab("replies")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "replies"
                ? "border-primary text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI Google Auto-Reply</span>
            {isGoogleConnected && isAutoReplyEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            )}
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

        {/* ========================================================================= */}
        {/* TAB 1: AI GOOGLE AUTO-REPLY & OAUTH MANAGEMENT                           */}
        {/* ========================================================================= */}
        {activeTab === "replies" && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Google OAuth Connection Banner & Auto-Reply Master Toggle */}
            <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-subtle space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-hairline">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-ink">
                        Autonomous Google Review Auto-Reply
                      </h3>
                      <p className="text-xs text-muted">
                        Automatically synthesize and publish warm, personalized business replies to customer Google reviews.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Master Autonomous Toggle Switch */}
                {(() => {
                  const hasLocation = Boolean(business?.googleOAuth?.connected && business?.googleOAuth?.locationName);
                  const isActuallyActive = hasLocation && isAutoReplyEnabled;

                  return (
                    <div
                      className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl border transition-all duration-200 ${
                        isActuallyActive
                          ? "bg-emerald-50/80 border-emerald-200/80 shadow-2xs"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="text-right select-none">
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActuallyActive
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-slate-400"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold font-display ${
                              isActuallyActive ? "text-emerald-900" : "text-slate-700"
                            }`}
                          >
                            {isActuallyActive ? "Auto-Reply: ON" : "Auto-Reply: OFF"}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] block font-medium ${
                            isActuallyActive
                              ? "text-emerald-700"
                              : !business?.googleOAuth?.connected
                              ? "text-slate-500"
                              : !business?.googleOAuth?.locationName
                              ? "text-amber-700 font-semibold"
                              : "text-slate-500"
                          }`}
                        >
                          {isActuallyActive
                            ? "Autonomous publishing active"
                            : !business?.googleOAuth?.connected
                            ? "Connect Google account"
                            : !business?.googleOAuth?.locationName
                            ? "Requires Google listing"
                            : "Auto-publishing paused"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleAutoReply}
                        disabled={isTogglingAutoReply || !hasLocation}
                        className={`relative inline-flex h-7 w-14 shrink-0 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          !hasLocation
                            ? "bg-slate-200 cursor-not-allowed opacity-60"
                            : isActuallyActive
                            ? "bg-emerald-600 shadow-inner cursor-pointer"
                            : "bg-slate-300 cursor-pointer"
                        }`}
                        role="switch"
                        aria-checked={isActuallyActive}
                        title={
                          !hasLocation
                            ? "Cannot enable: No Google Business Profile location detected"
                            : isActuallyActive
                            ? "Click to pause autonomous auto-replies"
                            : "Click to enable autonomous auto-replies"
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                            isActuallyActive ? "translate-x-7" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* 2. Connection Status */}
              {!isGoogleConnected ? (
                /* Disconnected State */
                <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-slate-50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-semibold text-sm text-ink">
                        Connect Google Business Profile to Activate Auto-Reply
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        Authorize revasy to access your Google Business Profile (<code>https://www.googleapis.com/auth/business.manage</code>). revasy AI will monitor new customer reviews and publish owner responses automatically on your behalf.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`/api/auth/google/authorize?slug=${slug}`}
                      className="press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold shadow-xs transition-all"
                    >
                      {/* Google G Logo */}
                      <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                      <span>Connect with Google OAuth</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Strictly Google Limited Use Compliant
                    </span>
                    <span>•</span>
                    <Link href="/privacy" className="hover:text-ink underline">
                      Privacy Policy &amp; Scopes
                    </Link>
                  </div>
                </div>
              ) : (
                /* Connected State */
                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-sm text-emerald-950">
                            Google Business Profile Connected
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800">
                          Connected as <strong>{business.googleOAuth?.connectedEmail}</strong> • Location: <strong>{business.name}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSyncNow}
                        disabled={isSyncingAutoReply}
                        className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-300 text-xs font-semibold text-emerald-900 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAutoReply ? "animate-spin text-emerald-700" : ""}`} />
                        <span>{isSyncingAutoReply ? "Syncing Reviews..." : "Sync & Reply Now"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDisconnectGoogle}
                        disabled={isDisconnectingGoogle}
                        className="press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-red-50 text-xs font-medium text-red-600 border border-transparent hover:border-red-200 transition-all"
                        title="Disconnect Google account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>

                  {!business.googleOAuth?.locationName && (
                    <div className="text-xs text-amber-900 bg-amber-50/90 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-amber-950">
                          No Google Business Profile locations detected under {business.googleOAuth?.connectedEmail}
                        </p>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Google returned 0 business listings for this Google account. To fetch and reply to real Google reviews, ensure this email is added as an <strong>Owner or Manager</strong> in Google Business Profile at{" "}
                          <a
                            href="https://business.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-bold text-amber-900 hover:text-black inline-flex items-center gap-0.5"
                          >
                            business.google.com
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Auto-Reply Preferences Panel */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-sm text-ink">
                    Auto-Reply Rules &amp; Tone Settings
                  </h4>
                  <button
                    type="button"
                    onClick={handleSaveAutoReplySettings}
                    disabled={isSavingAutoReplySettings}
                    className="press text-xs font-semibold text-primary hover:text-indigo-800 disabled:opacity-50"
                  >
                    {isSavingAutoReplySettings ? "Saving..." : "Save Preferences"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tone Preference */}
                  <div className="space-y-1.5 bg-surface-soft p-3.5 rounded-2xl border border-hairline">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Response Tone
                    </label>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      {[
                        { key: "warm", label: "Warm", icon: Heart },
                        { key: "professional", label: "Formal", icon: Building2 },
                        { key: "concise", label: "Short", icon: Zap },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSelected = autoReplyTone === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setAutoReplyTone(t.key as typeof autoReplyTone)}
                            className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-primary text-on-primary shadow-xs"
                                : "bg-white text-muted hover:text-ink hover:bg-slate-50 border border-hairline"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating Scope */}
                  <div className="space-y-1.5 bg-surface-soft p-3.5 rounded-2xl border border-hairline">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Review Scope
                    </label>
                    <select
                      value={autoReplyMinRating}
                      onChange={(e) => setAutoReplyMinRating(Number(e.target.value))}
                      className="w-full text-xs text-ink p-2.5 rounded-xl border border-hairline bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value={1}>Reply to all ratings (1 to 5 Stars)</option>
                      <option value={4}>4 &amp; 5 Stars only (Recommended)</option>
                      <option value={5}>5 Stars only</option>
                    </select>
                    <p className="text-[10px] text-muted-soft pt-1">
                      Lower ratings receive compassionate, helpful customer care replies.
                    </p>
                  </div>

                  {/* Brand Signature */}
                  <div className="space-y-1.5 bg-surface-soft p-3.5 rounded-2xl border border-hairline">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                      Brand Sign-Off Signature
                    </label>
                    <input
                      type="text"
                      value={autoReplySignature}
                      onChange={(e) => setAutoReplySignature(e.target.value)}
                      placeholder={`— Team ${business.name}`}
                      className="w-full text-xs text-ink p-2.5 rounded-xl border border-hairline bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-[10px] text-muted-soft pt-1">
                      Appended to the end of each AI synthesized response.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Live Auto-Reply Activity Stream / Published History */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-semibold text-sm text-ink">
                      Recent Auto-Reply Activity ({autoReplyLogs.length})
                    </h4>
                    <p className="text-xs text-muted">
                      Live audit log of reviews answered automatically on Google Maps.
                    </p>
                  </div>

                  {autoReplyLogs.length > 0 && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleClearLogs}
                        disabled={isClearingLogs}
                        className="text-xs text-muted hover:text-red-600 font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear History</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSyncNow}
                        disabled={isSyncingAutoReply}
                        className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncingAutoReply ? "animate-spin" : ""}`} />
                        <span>Sync Latest</span>
                      </button>
                    </div>
                  )}
                </div>

                {autoReplyLogs.length === 0 ? (
                  <div className="p-8 bg-surface-soft/50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                    <Bot className="w-8 h-8 text-muted mx-auto" />
                    <p className="text-xs text-muted font-medium">
                      No automated replies published yet.
                    </p>
                    <p className="text-[11px] text-muted-soft max-w-sm mx-auto">
                      Click <strong>&quot;Sync &amp; Reply Now&quot;</strong> above to check for pending Google reviews and let revasy AI compose and publish responses.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {autoReplyLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-white rounded-2xl border border-hairline p-4 sm:p-5 shadow-2xs space-y-3"
                      >
                        {/* Reviewer & Meta */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                              {log.reviewerName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-ink block">
                                {log.reviewerName}
                              </span>
                              <div className="flex items-center gap-1 text-amber-400">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${
                                        s <= log.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-slate-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-muted ml-1 font-medium">
                                  {log.reviewDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Live on Google Maps</span>
                          </span>
                        </div>

                        {/* Customer Review text */}
                        <p className="text-xs text-slate-800 italic bg-surface-soft/40 p-2.5 rounded-xl border border-hairline/60">
                          &quot;{log.reviewText}&quot;
                        </p>

                        {/* Indented Published Owner Response */}
                        <div className="border-l-2 border-primary/50 pl-3 py-1 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-ink">
                              Response from the owner (revasy AI)
                            </span>
                            <span className="text-[10px] text-muted">
                              Published
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-sans">
                            {log.replyText}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Manual One-Off Reply Generator (Accordion / Sub-section) */}
            <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-base text-ink">
                  Manual One-Off Reply Drafting Tool
                </h3>
                <p className="text-xs text-muted">
                  Need to compose a custom response to a specific review manually? Paste it below to generate 3 tailored options.
                </p>
              </div>

              <form onSubmit={handleGenerateReplies} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            className={`w-5 h-5 ${
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
                      className="w-full text-xs text-ink p-2.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
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
                    rows={3}
                    maxLength={2500}
                    placeholder={`e.g. Had an amazing visit at ${business.name}! The atmosphere was warm and staff were attentive.`}
                    className="w-full text-xs text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40 resize-y"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isGeneratingReplies}
                  className="shadow-revasy !text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-pink" />
                  <span>Draft 3 Response Variations</span>
                </Button>
              </form>

              {/* Generated Replies Display */}
              {replies && (
                <div className="space-y-4 pt-3 border-t border-hairline animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: "professional", title: "Professional", desc: "Formal hospitality standard", text: replies.professional },
                      { key: "warm", title: "Warm & Friendly", desc: "Heartfelt neighborhood tone", text: replies.warm },
                      { key: "concise", title: "Concise", desc: "Direct 2-sentence acknowledgement", text: replies.concise },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="bg-white rounded-2xl border border-hairline p-4 shadow-subtle flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-surface-card border border-hairline text-ink">
                              {item.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyReply(item.key, item.text)}
                              className={`press flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                                copiedReplyKey === item.key
                                  ? "bg-emerald-600 text-white"
                                  : "bg-primary text-on-primary hover:bg-primary-hover"
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
                          <p className="text-xs text-body leading-relaxed bg-surface-soft/60 p-3 rounded-xl border border-hairline/80 font-sans">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NFC & QR STAND KIT                                                 */}
        {/* ========================================================================= */}
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
                  <div className={`absolute top-0 inset-x-0 h-2 ${theme.bar}`} />

                  {/* Brand Logo & Name */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-hairline flex items-center justify-center overflow-hidden shadow-sm p-1">
                      {business.logoUrl ? (
                        <img src={business.logoUrl} alt={business.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-7 h-7 text-muted" />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-xl text-ink leading-tight break-words">
                      {business.name}
                    </h3>
                    <p className="text-xs text-muted font-medium line-clamp-1 break-words">
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
                    Powered by revasy Review Assistant
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
                    className="w-full text-sm font-semibold shadow-revasy !rounded-xl"
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

        {/* ========================================================================= */}
        {/* TAB 3: BUSINESS SETTINGS                                                  */}
        {/* ========================================================================= */}
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
                Customize your customer-facing presentation details.
              </p>
            </div>

            {/* Editable Presentation Fields */}
            <div className="space-y-1.5">
              <label htmlFor="edit-name" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Business Display Name *
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Cocova Cafe"
                className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-tagline" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Tagline / Hospitality Vibe
              </label>
              <input
                id="edit-tagline"
                type="text"
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
                placeholder="e.g. Artisan Coffee &amp; Warm Moments"
                className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
              />
            </div>

            {/* Physical Store Address (Locked) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Physical Store Address
              </label>
              <div className="group relative">
                <div className="w-full text-sm text-ink/80 p-3 rounded-xl border border-hairline bg-slate-50/80 select-none flex items-center justify-between gap-3 transition-colors md:hover:cursor-not-allowed md:hover:bg-slate-100/80">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 break-words line-clamp-2 md:truncate font-normal">
                      {business.address || "Shop- 1, COCOVA, Sardar Patel Marg, Bardoli, Gujarat 394601"}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center pl-2">
                    <Lock className="w-4 h-4 text-slate-400 md:group-hover:hidden transition-opacity" />
                    <Ban className="w-4 h-4 text-rose-500 hidden md:group-hover:block transition-opacity" />
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Message / Hospitality Greeting */}
            <div className="space-y-1.5">
              <label htmlFor="edit-description" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Welcome Message / Hospitality Greeting
              </label>
              <textarea
                id="edit-description"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="e.g. Welcome to COCOVA! We are passionate about artisanal coffee, fresh bakes, and great hospitality."
                className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40 resize-none"
              />
              <p className="text-[11px] text-muted-soft">
                Customer-facing welcome message shown on your smart NFC review stand and feedback portal.
              </p>
            </div>

            <LogoUploader
              value={editLogoUrl}
              onChange={setEditLogoUrl}
              businessName={editName || business.name}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSavingSettings}
              className="shadow-revasy"
            >
              <span>Save Changes</span>
            </Button>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-surface-soft py-6 px-4 text-center text-xs text-muted no-print">
        <p>
          &copy; {new Date().getFullYear()} revasy &bull; Made and maintained by{" "}
          <a
            href="https://widox.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary hover:text-indigo-700 hover:underline transition-colors"
          >
            widox
          </a>{" "}
          &bull; All rights reserved
        </p>
      </footer>

      <Toast isOpen={isToastOpen} message={toastMessage} onClose={() => setIsToastOpen(false)} />
    </div>
  );
}
