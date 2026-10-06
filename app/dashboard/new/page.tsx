"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Palette,
  Tag,
  Plus,
  Trash2,
  Eye,
  Star,
  QrCode,
  Coffee,
  HeartPulse,
  Scissors,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GooglePlaceIdFinder } from "@/components/maps/GooglePlaceIdFinder";

const CATEGORIES = [
  "Cafe & Restaurant",
  "Bakery & Sweets",
  "Dental & Healthcare",
  "Salon & Hair Spa",
  "Retail & Boutique",
  "Fitness & Yoga Gym",
  "Automotive & Garage",
  "Professional Services",
  "Hospitality & Hotel",
];

const CATEGORY_PROMPTS: Record<string, string[]> = {
  "Cafe & Restaurant": [
    "Artisan coffee was superb",
    "Delicious pastries & brunch",
    "Warm, welcoming staff",
    "Cozy seating & vibe",
  ],
  "Bakery & Sweets": [
    "Freshly baked pastries",
    "Beautiful custom cakes",
    "Wonderful aromas",
    "Quick, courteous counter",
  ],
  "Dental & Healthcare": [
    "Gentle & painless treatment",
    "Caring, reassuring doctors",
    "Immaculate clean clinic",
    "Zero waiting time",
  ],
  "Salon & Hair Spa": [
    "Expert styling & cut",
    "Relaxing hair wash & massage",
    "Premium hair products",
    "Attentive consultation",
  ],
  "Retail & Boutique": [
    "Curated collection & fabrics",
    "Helpful styling assistance",
    "Great fitting rooms",
    "Lovely store ambiance",
  ],
  "Fitness & Yoga Gym": [
    "Energetic instructors",
    "Top-tier equipment",
    "Spotless locker rooms",
    "Motivating environment",
  ],
  "Automotive & Garage": [
    "Transparent pricing",
    "Fast turnaround time",
    "Knowledgeable technicians",
    "Smooth car handover",
  ],
  "Professional Services": [
    "Thorough expertise",
    "Clear communication",
    "On-time delivery",
    "Dedicated team support",
  ],
  "Hospitality & Hotel": [
    "Comfortable luxury suite",
    "Attentive concierge",
    "Delicious morning breakfast",
    "Effortless check-in",
  ],
};

const ACCENTS = [
  { key: "teal", label: "Teal (AI & Precision)", bg: "bg-brand-teal", ring: "ring-brand-teal" },
  { key: "pink", label: "Pink (Growth & Warmth)", bg: "bg-brand-pink", ring: "ring-brand-pink" },
  { key: "peach", label: "Peach (Artisan & Cozy)", bg: "bg-brand-peach", ring: "ring-brand-peach" },
  { key: "lavender", label: "Lavender (Modern & Luxe)", bg: "bg-brand-lavender", ring: "ring-brand-lavender" },
  { key: "ochre", label: "Ochre (Bold & Friendly)", bg: "bg-brand-ochre", ring: "ring-brand-ochre" },
  { key: "mint", label: "Mint (Fresh & Health)", bg: "bg-brand-mint", ring: "ring-brand-mint" },
];

export default function RegisterBusinessPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [accentColor, setAccentColor] = useState<"teal" | "pink" | "peach" | "lavender" | "ochre" | "mint">("teal");

  // Prompt chips list
  const [prompts, setPrompts] = useState<string[]>(CATEGORY_PROMPTS["Cafe & Restaurant"]);
  const [newPromptInput, setNewPromptInput] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generated);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (CATEGORY_PROMPTS[val]) {
      setPrompts(CATEGORY_PROMPTS[val]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload logo");
      }

      setLogoUrl(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPrompt = () => {
    const trimmed = newPromptInput.trim();
    if (!trimmed) return;
    if (prompts.length >= 8) {
      setErrorMessage("Maximum 8 prompt chips allowed.");
      return;
    }
    setPrompts([...prompts, trimmed]);
    setNewPromptInput("");
  };

  const handleRemovePrompt = (idx: number) => {
    setPrompts(prompts.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !slug.trim() || !googleReviewUrl.trim()) {
      setErrorMessage("Please fill in Business Name, URL Slug, and Google Review URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          category,
          tagline: tagline.trim(),
          description: description.trim(),
          googleReviewUrl: googleReviewUrl.trim(),
          logoUrl,
          accentColor,
          customPrompts: prompts,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register business");
      }

      router.push(`/dashboard/${data.business.slug}`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("cafe") || c.includes("coffee") || c.includes("bakery")) return <Coffee className="w-6 h-6 text-brand-pink" />;
    if (c.includes("dental") || c.includes("health") || c.includes("clinic")) return <HeartPulse className="w-6 h-6 text-brand-mint" />;
    if (c.includes("salon") || c.includes("spa") || c.includes("hair")) return <Scissors className="w-6 h-6 text-brand-lavender" />;
    if (c.includes("retail") || c.includes("shop")) return <ShoppingBag className="w-6 h-6 text-brand-peach" />;
    if (c.includes("auto") || c.includes("garage")) return <Wrench className="w-6 h-6 text-brand-ochre" />;
    return <Building2 className="w-6 h-6 text-brand-teal" />;
  };

  return (
    <div className="min-h-screen bg-canvas text-ink pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="font-display font-bold text-sm text-ink flex items-center gap-0.5">
            <span>revasy</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
          </span>
        </div>
      </header>

      {/* Main Container: Split-screen for Form + Live Preview */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
            New Business Setup
          </span>
          <h1 className="font-display font-medium text-3xl sm:text-4xl text-ink">
            Register Your Business
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl">
            Configure your brand identity and get an instant guest review landing page, live QR code, and AI reply assistant.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column (7 cols) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-subtle space-y-5"
          >
            {/* Logo Upload Section */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Business Logo <span className="text-muted-soft font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-card border border-hairline flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-7 h-7 text-muted" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="press cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-surface-card hover:bg-surface-strong text-ink rounded-xl border border-hairline text-xs font-semibold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? "Uploading..." : "Upload Logo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-[11px] text-muted-soft">
                    PNG, JPG, or SVG up to 5MB. Stored locally or in cloud storage.
                  </p>
                </div>
              </div>
            </div>

            {/* Name and Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="biz-name" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Business Name *
                </label>
                <input
                  id="biz-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cocova Cafe"
                  className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="biz-slug" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-muted-soft bg-surface-card border border-r-0 border-hairline px-2.5 py-3 rounded-l-xl">
                    /b/
                  </span>
                  <input
                    id="biz-slug"
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="cocova"
                    className="w-full text-sm text-ink p-3 rounded-r-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
                  />
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label htmlFor="biz-category" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Industry / Category *
              </label>
              <select
                id="biz-category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tagline */}
            <div className="space-y-1.5">
              <label htmlFor="biz-tagline" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Tagline / Vibe
              </label>
              <input
                id="biz-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Artisan Coffee & Warm Moments"
                maxLength={120}
                className="w-full text-sm text-ink p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
              />
            </div>

            {/* Google Review URL with Interactive Map & Place ID Finder */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="biz-google-url" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Google Review URL *
                </label>
                <GooglePlaceIdFinder
                  currentUrl={googleReviewUrl}
                  initialBusinessName={name}
                  onSelect={(data) => {
                    setGoogleReviewUrl(data.googleReviewUrl);
                    if ((!name.trim() || name === "My Business") && data.businessName) {
                      handleNameChange(data.businessName);
                    }
                    if (data.category) {
                      const matchedCat = CATEGORIES.find(
                        (c) =>
                          c.toLowerCase().includes(data.category!.toLowerCase()) ||
                          data.category!.toLowerCase().includes(c.toLowerCase())
                      );
                      if (matchedCat) handleCategoryChange(matchedCat);
                    }
                  }}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  id="biz-google-url"
                  type="url"
                  required
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full text-sm text-ink pl-10 pr-3 py-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
                />
              </div>
              <p className="text-[11px] text-muted-soft">
                Found in your Google Business Profile &ldquo;Ask for reviews&rdquo; section, or click the map button above to search and pin automatically.
              </p>
            </div>

            {/* Accent Color Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Brand Accent Surface
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACCENTS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setAccentColor(item.key as typeof accentColor)}
                    className={`press flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left font-medium transition-all ${
                      accentColor === item.key
                        ? "border-primary bg-surface-card ring-1 ring-primary"
                        : "border-hairline hover:bg-surface-soft"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${item.bg}`} />
                    <span className="truncate">{item.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Chips */}
            <div className="space-y-2.5 pt-2 border-t border-hairline">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Guest Thought Prompts (Quick Chips)
                </label>
                <span className="text-[11px] text-muted-soft">{prompts.length} / 8 chips</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {prompts.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-card border border-hairline text-ink rounded-pill text-xs font-medium"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrompt(idx)}
                      className="text-muted hover:text-red-500 font-bold ml-0.5"
                      aria-label="Remove prompt"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPromptInput}
                  onChange={(e) => setNewPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPrompt();
                    }
                  }}
                  placeholder="Add custom highlight (e.g. Painless treatment, Great patio)"
                  className="flex-1 text-xs text-ink p-2.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40"
                />
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="press px-3.5 py-2 bg-surface-card hover:bg-surface-strong border border-hairline rounded-xl text-xs font-semibold text-ink"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full text-base font-semibold shadow-widox !rounded-2xl"
            >
              <Sparkles className="w-5 h-5 mr-2 text-brand-pink" />
              <span>Launch Business Review Flow</span>
            </Button>
          </form>

          {/* Live Preview Column (5 cols) (Aesthetic-Usability Effect) */}
          <div className="lg:col-span-5 space-y-4 sticky top-20">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-teal" />
                <span>Live Guest Page Preview</span>
              </span>
              <span className="text-[10px] font-semibold text-muted bg-surface-card px-2 py-0.5 rounded-pill border border-hairline">
                Mobile View
              </span>
            </div>

            {/* Simulated Mobile Frame */}
            <div className="bg-canvas border-2 border-hairline rounded-3xl p-5 shadow-card space-y-4 max-w-sm mx-auto">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-card border border-hairline flex items-center justify-center overflow-hidden shadow-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    getCategoryIcon(category)
                  )}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-ink">
                    {name || "Your Business Name"}
                  </h3>
                  <p className="text-xs text-muted">
                    {tagline || category}
                  </p>
                </div>
              </div>

              {/* Simulated Rating Box */}
              <div className="bg-surface-card p-3 rounded-xl border border-hairline text-center space-y-1">
                <span className="text-xs font-medium text-ink">How was your experience today?</span>
                <div className="flex justify-center gap-1 text-amber-500 pt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-500" />
                  ))}
                </div>
              </div>

              {/* Simulated Prompt Chips */}
              <div className="bg-white p-3 rounded-xl border border-hairline space-y-2">
                <span className="text-[11px] font-semibold text-muted block">Tap highlights to add:</span>
                <div className="flex flex-wrap gap-1">
                  {prompts.slice(0, 4).map((p, i) => (
                    <span key={i} className="text-[10px] bg-surface-card text-ink px-2 py-0.5 rounded-pill border border-hairline">
                      + {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Simulated Button */}
              <div className="w-full py-2.5 px-3 bg-primary text-on-primary rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                <span>Create My Review</span>
              </div>

              <div className="text-center text-[10px] text-muted-soft">
                Slug: /b/{slug || "your-slug"}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
