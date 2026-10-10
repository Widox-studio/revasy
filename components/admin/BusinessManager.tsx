"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Sparkles,
  MapPin,
  Mail,
  Printer,
  ShieldCheck,
  Star,
  RefreshCw,
  Plus,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Business } from "@/lib/business-store";
import { THEME_ACCENTS, AccentColor } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast, ToastType } from "@/components/ui/Toast";
import { LogoUploader } from "@/components/ui/LogoUploader";

interface BusinessManagerProps {
  initialBusiness: Business;
  userAppUrl: string;
  qrDataUrl?: string;
}

export function BusinessManager({
  initialBusiness,
  userAppUrl,
  qrDataUrl = "",
}: BusinessManagerProps) {
  const router = useRouter();

  // QR Code State (Client Generated with fallback)
  const [currentQr, setCurrentQr] = useState<string>(qrDataUrl);

  // Form State
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");

  // AI Reply Test Bench State
  const [testRating, setTestRating] = useState<number>(5);
  const [testAuthor, setTestAuthor] = useState("");
  const [testReviewText, setTestReviewText] = useState("");
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message?: string;
    type: ToastType;
  }>({
    show: false,
    title: "",
    type: "info",
  });

  const showToast = (title: string, message?: string, type: ToastType = "success") => {
    setToast({ show: true, title, message, type });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to Clipboard", `${label} copied successfully.`, "success");
    } catch {
      showToast("Copy failed", "Could not copy to clipboard", "error");
    }
  };

  // Stand and Dashboard URLs
  const baseUrl = typeof window !== "undefined" ? window.location.origin : (userAppUrl || "");
  const standUrl = `${baseUrl}/b/${business.slug}`;
  const clientDashboardUrl = `/dashboard/${business.slug}`;

  // Automatically ensure QR code is generated on client
  useEffect(() => {
    if (!currentQr && standUrl) {
      import("@/lib/qr")
        .then(({ generateQrDataUrl }) => generateQrDataUrl(standUrl))
        .then((url) => {
          if (url) setCurrentQr(url);
        })
        .catch(() => {});
    }
  }, [standUrl, currentQr]);

  // Save changes via API
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/businesses/${initialBusiness.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update business");
      }

      showToast("Changes Saved", "Business configuration has been updated across all nodes.");

      // If slug changed, route to new slug
      if (data.business.slug !== initialBusiness.slug) {
        router.push(`/admin/businesses/${data.business.slug}`);
      } else {
        setBusiness(data.business);
      }
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to save changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete business via API
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/businesses/${initialBusiness.slug}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete business");
      }

      showToast("Business Deleted", "Location removed successfully.");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      showToast("Deletion Failed", err.message || "Failed to delete business", "error");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // AI Reply generation test
  const handleGenerateAiReply = async () => {
    if (!testReviewText.trim()) {
      showToast("Input Required", "Please enter a review text to draft an AI reply.", "warning");
      return;
    }
    setIsGeneratingReply(true);
    try {
      const res = await fetch("/api/admin/reply/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business.name,
          rating: testRating,
          authorName: testAuthor,
          reviewText: testReviewText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate reply");
      }

      setGeneratedReply(data.reply);
      showToast("Reply Generated", "AI hospitality response crafted.");
    } catch (err: any) {
      showToast("AI Error", err.message || "Failed to generate AI response", "error");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const addPrompt = () => {
    if (!newPrompt.trim()) return;
    setBusiness({
      ...business,
      customPrompts: [...(business.customPrompts || []), newPrompt.trim()],
    });
    setNewPrompt("");
  };

  const removePrompt = (index: number) => {
    setBusiness({
      ...business,
      customPrompts: business.customPrompts.filter((_, i) => i !== index),
    });
  };

  const updatePrompt = (index: number, val: string) => {
    const updated = [...business.customPrompts];
    updated[index] = val;
    setBusiness({
      ...business,
      customPrompts: updated,
    });
  };

  const activeAccent = THEME_ACCENTS[business.accentColor] || THEME_ACCENTS.teal;

  return (
    <div className="space-y-8">
      <Toast
        show={toast.show}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl border border-hairline hover:bg-slate-100 text-muted hover:text-ink transition-colors"
            title="Back to Fleet"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {business.logoUrl ? (
            <div className="w-11 h-11 rounded-xl bg-white border border-hairline overflow-hidden p-1 shrink-0 shadow-2xs flex items-center justify-center">
              <img
                src={business.logoUrl}
                alt={business.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-2xs"
              style={{ backgroundColor: activeAccent.primary }}
            >
              {business.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
                {business.name}
              </h1>
              <Badge variant="brand" size="sm">
                /{business.slug}
              </Badge>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Configured on {new Date(business.createdAt).toLocaleDateString()} • Managed Location
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print Stand
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>

          <Button
            variant="revasy"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            className="shadow-revasy text-xs font-semibold"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Magic Links & Direct Endpoints Card */}
      <div className="bg-white rounded-2xl border border-hairline p-5 shadow-card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          Live Endpoint Routing & Tenant Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Review Stand Link */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                  Customer Stand Review Link (NFC / QR)
                </span>
                <p className="text-[11px] text-muted font-mono break-all mt-0.5">
                  {standUrl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(standUrl, "Customer Stand URL")}
                className="text-xs py-1 h-8"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy URL
              </Button>
              <a
                href={standUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Open in Tab</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Client Tenant Dashboard Link */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Client Tenant Dashboard (Owner Only)
                </span>
                <p className="text-[11px] text-muted font-mono break-all mt-0.5">
                  {clientDashboardUrl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(clientDashboardUrl, "Client Dashboard URL")}
                className="text-xs py-1 h-8"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy URL
              </Button>
              <a
                href={clientDashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Open in Tab</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-ink text-base">
              General Identity & Slugs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  URL Slug (/r/[slug])
                </label>
                <input
                  type="text"
                  value={business.slug}
                  onChange={(e) => setBusiness({ ...business, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={business.tagline || ""}
                  onChange={(e) => setBusiness({ ...business, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={business.category || ""}
                  onChange={(e) => setBusiness({ ...business, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Description / Welcome Message
              </label>
              <textarea
                rows={2}
                value={business.description || ""}
                onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none resize-none"
              />
            </div>

            <div>
              <LogoUploader
                value={business.logoUrl || ""}
                onChange={(val) => setBusiness({ ...business, logoUrl: val })}
                businessName={business.name}
                accentColor={activeAccent.primary}
              />
            </div>
          </div>

          {/* Tenant Client Owner Email */}
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              <h3 className="font-display font-semibold text-ink text-base">
                Tenant Client Owner Email
              </h3>
            </div>
            <p className="text-xs text-muted">
              The assigned client operator email. Only this user will be allowed to log in and access this business dashboard on the customer portal.
            </p>

            <input
              type="email"
              value={business.ownerEmail}
              onChange={(e) => setBusiness({ ...business, ownerEmail: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* Google Place Pin & Direct Review Link */}
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <h3 className="font-display font-semibold text-ink text-base">
                Google Place ID & Review Link
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Place ID
                </label>
                <input
                  type="text"
                  value={business.placeId || ""}
                  onChange={(e) => setBusiness({ ...business, placeId: e.target.value })}
                  placeholder="ChIJ..."
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Direct Google Review URL
                </label>
                <input
                  type="url"
                  value={business.googleReviewUrl}
                  onChange={(e) => setBusiness({ ...business, googleReviewUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted mb-1">
                  Verified Physical Address (Google Maps)
                </label>
                <input
                  type="text"
                  value={business.address || ""}
                  onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                  placeholder="e.g. Shop- 1, COCOVA, Sardar Patel Marg, Bardoli, Gujarat 394601"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                />
                <p className="text-[11px] text-muted-soft mt-1">
                  Official street address. This is locked as unchangeable in the merchant's portal.
                </p>
              </div>
            </div>
          </div>

          {/* Brand Accent Color */}
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-ink text-base">
              Brand Accent Palette
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {(Object.keys(THEME_ACCENTS) as AccentColor[]).map((col) => {
                const theme = THEME_ACCENTS[col];
                const isSelected = business.accentColor === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setBusiness({ ...business, accentColor: col })}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary bg-indigo-50/50 shadow-sm"
                        : "border-hairline hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="text-[11px] font-medium capitalize text-slate-700">
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Prompt Chips */}
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-ink text-base">
              Customer 1-Tap Review Chips ({business.customPrompts?.length || 0})
            </h3>
            <div className="space-y-2">
              {(business.customPrompts || []).map((prompt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-soft w-4 text-center">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => updatePrompt(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removePrompt(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Add new review prompt..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPrompt();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addPrompt}
                className="text-xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): QR Stand & AI Test Bench */}
        <div className="lg:col-span-5 space-y-6">
          {/* QR Code Stand Preview & Print Card */}
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card text-center">
            <h3 className="font-display font-semibold text-ink text-sm mb-1">
              Table Stand & QR Code
            </h3>
            <p className="text-xs text-muted mb-4">
              Direct scan target points to <span className="font-mono text-primary font-medium">{standUrl}</span>
            </p>

            {/* Printable Table Tent Container */}
            <div className="printable-stand mx-auto max-w-[240px] bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-lg mb-4">
              <div
                className="h-10 w-10 mx-auto rounded-lg flex items-center justify-center text-white text-base font-bold shadow-sm mb-2 overflow-hidden border border-slate-200"
                style={{ backgroundColor: business.logoUrl ? "#ffffff" : activeAccent.primary }}
              >
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={business.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  business.name.charAt(0).toUpperCase()
                )}
              </div>
              <h4 className="font-display font-bold text-ink text-sm leading-tight">
                {business.name}
              </h4>
              <p className="text-[10px] text-muted mb-3">Scan to Review Us on Google</p>

              {currentQr ? (
                <img
                  src={currentQr}
                  alt="Review QR Code"
                  className="w-36 h-36 mx-auto rounded-lg"
                />
              ) : (
                <div className="w-36 h-36 mx-auto bg-slate-100 rounded-lg flex items-center justify-center text-muted text-xs">
                  Generating QR...
                </div>
              )}

              <div className="flex justify-center gap-0.5 text-amber-400 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[9px] font-mono text-slate-500 mt-1">revasy.com/r/{business.slug}</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              {currentQr && (
                <a
                  href={currentQr}
                  download={`${business.slug}-qr-code.png`}
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download PNG
                  </Button>
                </a>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                <Printer className="h-3.5 w-3.5 mr-1" />
                Print Stand
              </Button>
            </div>
          </div>

          {/* AI Hospitality Reply Playground */}
          <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h3 className="font-display font-semibold text-ink text-sm">
                  AI Hospitality Reply Bench
                </h3>
              </div>
              <Badge variant="purple" size="sm">
                AI Test Bench
              </Badge>
            </div>

            <p className="text-xs text-muted">
              Test how Revasy AI drafts personalized responses for customer reviews submitted to this location.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Rating Preview
                </label>
                <div className="flex gap-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setTestRating(stars)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        testRating === stars
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "border-hairline bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {stars} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Sample Customer Review
                </label>
                <textarea
                  rows={3}
                  value={testReviewText}
                  onChange={(e) => setTestReviewText(e.target.value)}
                  placeholder="Paste or enter a customer review here to test AI reply synthesis..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>

              <Button
                variant="revasy"
                size="sm"
                onClick={handleGenerateAiReply}
                isLoading={isGeneratingReply}
                className="w-full text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Generate Hospitality Reply
              </Button>

              {generatedReply && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs space-y-2 mt-2">
                  <div className="flex items-center justify-between text-purple-900 font-semibold text-[11px]">
                    <span>Suggested Response</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedReply, "AI Hospitality Reply")}
                      className="text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed italic">
                    "{generatedReply}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-sm text-muted">
              Are you sure you want to permanently delete <strong>{business.name}</strong>?
              This will remove its Google Review routing and client dashboard access. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Yes, Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
