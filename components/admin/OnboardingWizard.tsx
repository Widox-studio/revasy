"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Palette, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ExternalLink,
  QrCode,
  Star,
  RefreshCw,
  Search,
  Link as LinkIcon,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { GooglePlacesAutocompleteInput, PlaceResult } from "@/components/maps/GooglePlacesAutocompleteInput";
import { GooglePlaceIdFinder } from "./GooglePlaceIdFinder";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { THEME_ACCENTS, AccentColor } from "@/lib/theme";
import { LogoUploader } from "@/components/ui/LogoUploader";

const CATEGORY_PRESETS: Record<string, string[]> = {
  "Cafe & Bakery": [
    "Amazing coffee & latte art",
    "Super friendly baristas",
    "Delicious fresh pastries",
    "Cozy atmosphere & vibe",
    "Fast service & great music",
  ],
  "Restaurant & Dining": [
    "Delicious signature dishes",
    "Attentive & polite service",
    "Beautiful ambiance",
    "Great value & portion size",
    "Will definitely return!",
  ],
  "Salon & Spa": [
    "Fantastic styling & cut",
    "Relaxing & clean ambiance",
    "Very skilled professionals",
    "Great attention to detail",
    "Highly recommended!",
  ],
  "Clinic & Health": [
    "Caring & thorough doctor",
    "Short wait time & clean clinic",
    "Explained everything clearly",
    "Professional & gentle staff",
    "Excellent medical care",
  ],
  "Retail & Boutique": [
    "Great curated selection",
    "Helpful & knowledgeable staff",
    "Seamless checkout",
    "Quality products",
    "Love shopping here!",
  ],
  "Hotel & Hospitality": [
    "Spotless & comfortable rooms",
    "Super friendly front desk",
    "Great amenities & breakfast",
    "Convenient location",
    "Exceptional hospitality",
  ],
  "Gym & Fitness": [
    "Top quality equipment",
    "Motivating trainers",
    "Clean & hygienic facilities",
    "Great workout energy",
    "Welcoming community",
  ],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function OnboardingWizard() {
  const router = useRouter();

  // Mode tabs for Place ID resolution
  const [resolveMode, setResolveMode] = useState<"search" | "link">("search");

  // Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("Cafe & Bakery");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [accentColor, setAccentColor] = useState<AccentColor>("teal");
  const [customPrompts, setCustomPrompts] = useState<string[]>(
    CATEGORY_PRESETS["Cafe & Bakery"]
  );
  const [newPromptText, setNewPromptText] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle place selection from Autocomplete
  const handleSelectPlace = (place: PlaceResult) => {
    setName(place.name);
    setSearchQuery(place.name);
    const autoSlug = slugify(place.name);
    setSlug(autoSlug);

    if (place.googleReviewUrl) {
      setGoogleReviewUrl(place.googleReviewUrl);
    }
    if (place.placeId) {
      setPlaceId(place.placeId);
    }
    if (place.address) {
      setAddress(place.address);
    }
    if (place.category) {
      setCategory(place.category);
      if (CATEGORY_PRESETS[place.category]) {
        setCustomPrompts(CATEGORY_PRESETS[place.category]);
      }
    }
  };

  const handleManualNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const applyCategoryPresets = (catName: string) => {
    setCategory(catName);
    if (CATEGORY_PRESETS[catName]) {
      setCustomPrompts([...CATEGORY_PRESETS[catName]]);
    }
  };

  const addPrompt = () => {
    if (!newPromptText.trim()) return;
    if (customPrompts.length >= 8) {
      alert("Maximum 8 prompt chips recommended for best customer experience");
      return;
    }
    setCustomPrompts([...customPrompts, newPromptText.trim()]);
    setNewPromptText("");
  };

  const removePrompt = (index: number) => {
    setCustomPrompts(customPrompts.filter((_, i) => i !== index));
  };

  const updatePrompt = (index: number, val: string) => {
    const updated = [...customPrompts];
    updated[index] = val;
    setCustomPrompts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Please enter a business name");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Please enter a unique URL slug");
      return;
    }
    if (!googleReviewUrl.trim()) {
      setErrorMessage("Google Review URL or Place ID is required");
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes("@")) {
      setErrorMessage("Valid tenant owner email is required to assign dashboard access");
      return;
    }
    if (customPrompts.length === 0) {
      setErrorMessage("Please specify at least 1 review prompt chip");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        tagline: tagline.trim(),
        category: category.trim(),
        description: description.trim(),
        address: address.trim() || undefined,
        googleReviewUrl: googleReviewUrl.trim(),
        placeId: placeId.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        ownerEmail: ownerEmail.trim().toLowerCase(),
        accentColor,
        customPrompts: customPrompts.filter(Boolean),
      };

      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to provision business");
      }

      router.push(`/admin/businesses/${data.business.slug}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAccent = THEME_ACCENTS[accentColor] || THEME_ACCENTS.teal;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fleet Command
        </Link>
        <Badge variant="brand" size="md">
          White-Glove Provisioning
        </Badge>
      </div>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Onboard New Client Location
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pin the exact Google Place ID, customize tap prompt chips, and assign client tenant access.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          <p className="font-semibold">Provisioning Error</p>
          <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (Left Column - 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Google Place Pinning */}
            <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="font-display font-semibold text-ink text-base">
                    Google Maps Pin & Direct Review Link
                  </h2>
                  <p className="text-xs text-muted">
                    Extracts official Place ID protobuf and zero-friction review prompt
                  </p>
                </div>
              </div>

              {/* Mode switch: Search autocomplete vs URL Paste */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl max-w-xs">
                <button
                  type="button"
                  onClick={() => setResolveMode("search")}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                    resolveMode === "search"
                      ? "bg-white text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <Search className="h-3 w-3 inline mr-1" />
                  Live Search
                </button>
                <button
                  type="button"
                  onClick={() => setResolveMode("link")}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                    resolveMode === "link"
                      ? "bg-white text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <LinkIcon className="h-3 w-3 inline mr-1" />
                  Paste URL / CID
                </button>
              </div>

              {resolveMode === "search" ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Search Business Location on Google
                  </label>
                  <GooglePlacesAutocompleteInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSelectPlace={handleSelectPlace}
                    placeholder="e.g. Cocova Cafe, Bardoli or Starbucks Seattle..."
                  />
                  <p className="text-[11px] text-muted-soft mt-1.5">
                    Typing will query Google Places / OSM to pin the exact business name and Place ID.
                  </p>
                </div>
              ) : (
                <div>
                  <GooglePlaceIdFinder
                    initialUrl={googleReviewUrl}
                    onSelectReviewUrl={(url, pId) => {
                      setGoogleReviewUrl(url);
                      if (pId) setPlaceId(pId);
                    }}
                  />
                </div>
              )}

              {/* Verified Place details display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Google Place ID
                  </label>
                  <input
                    type="text"
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                    placeholder="ChIJ... or leave blank"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Direct Review URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder="https://search.google.com/local/writereview?placeid=..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Verified Physical Address (Google Maps)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop- 1, COCOVA, Sardar Patel Marg, Bardoli, Gujarat 394601"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                  />
                  <p className="text-[11px] text-muted-soft mt-1">
                    Auto-pinned from Google Places. This address will be locked as unchangeable for merchants in their user dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Location Identity & Slugs */}
            <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="font-display font-semibold text-ink text-base">
                    Business Profile & Custom URL
                  </h2>
                  <p className="text-xs text-muted">
                    Defines the stand routing URL at <code className="text-primary font-mono font-semibold">/r/[slug]</code>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleManualNameChange(e.target.value)}
                    placeholder="e.g. Cocova Cafe"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Slug identifier *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-soft font-mono">
                      /r/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="cocova"
                      className="w-full pl-9 pr-3.5 py-2 text-sm font-mono rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Artisan Coffee & Warm Moments"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Category Presets
                  </label>
                  <select
                    value={category}
                    onChange={(e) => applyCategoryPresets(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                  >
                    {Object.keys(CATEGORY_PRESETS).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Description / Hospitality Note
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers a quick note about your passion and commitment to quality..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div>
                <LogoUploader
                  value={logoUrl}
                  onChange={setLogoUrl}
                  businessName={name || "Business"}
                  accentColor={activeAccent.primary}
                />
              </div>
            </div>

            {/* Step 3: Tenant Client Access Assignment (Owner Email) */}
            <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="font-display font-semibold text-ink text-base">
                    Client Owner Access (Tenant Security)
                  </h2>
                  <p className="text-xs text-muted">
                    Assign the specific business owner email for isolated 1-to-1 dashboard routing
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Tenant Owner Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft" />
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="client.owner@business.com"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="mt-2.5 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-muted">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict Access Control:</strong> Only this verified email will be allowed into{" "}
                    <code className="text-ink font-mono font-medium">/dashboard/{slug || "slug"}</code>. All other users will receive a 403 Forbidden screen.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4: Stand Brand Accent & Review Chips */}
            <div className="bg-white rounded-2xl border border-hairline p-6 shadow-card space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
                <div className="h-8 w-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h2 className="font-display font-semibold text-ink text-base">
                    Brand Accent & Tap Review Prompts
                  </h2>
                  <p className="text-xs text-muted">
                    Design the stand colors and 1-tap customer chips for the NFC review flow
                  </p>
                </div>
              </div>

              {/* Accent Color picker */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">
                  Select Brand Theme Accent
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {(Object.keys(THEME_ACCENTS) as AccentColor[]).map((col) => {
                    const theme = THEME_ACCENTS[col];
                    const isSelected = accentColor === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setAccentColor(col)}
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

              {/* Review Prompt Chips list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-muted">
                    Customer 1-Tap Review Chips ({customPrompts.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => applyCategoryPresets(category)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset to {category} Presets
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  {customPrompts.map((prompt, idx) => (
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
                        title="Remove chip"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new prompt input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    placeholder="Add custom prompt chip (e.g. 'Loved the patio seating')..."
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
                    Add Chip
                  </Button>
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link href="/admin">
                <Button variant="ghost" size="md">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="revasy"
                size="md"
                isLoading={isSubmitting}
                className="shadow-revasy"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Provision Location & Deploy
              </Button>
            </div>
          </form>
        </div>

        {/* Live Stand Preview (Right Column - 5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="bg-white rounded-3xl border border-hairline p-6 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
              <div>
                <h3 className="font-display font-semibold text-ink text-sm">
                  Customer Stand Live Preview
                </h3>
                <p className="text-[11px] text-muted">
                  Real-time appearance at <span className="font-mono text-primary font-semibold">/r/{slug || "slug"}</span>
                </p>
              </div>
              <Badge variant="brand" size="sm">
                Interactive
              </Badge>
            </div>

            {/* Phone Screen Mockup */}
            <div className="mx-auto max-w-[320px] rounded-[36px] border-[6px] border-slate-900 bg-slate-50 p-4 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-between">
              {/* Speaker notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 bg-slate-900 rounded-full z-20" />

              <div className="pt-6 text-center">
                {/* Brand Logo Avatar */}
                <div
                  className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md mb-3 overflow-hidden border border-hairline"
                  style={{ backgroundColor: logoUrl ? "#ffffff" : activeAccent.primary }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={name || "Business"}
                      className="w-full h-full object-contain p-1 rounded-xl"
                    />
                  ) : (
                    (name || "R").charAt(0).toUpperCase()
                  )}
                </div>

                <h4 className="font-display font-bold text-ink text-lg leading-snug">
                  {name || "Your Business Name"}
                </h4>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">
                  {tagline || "Artisan Coffee & Warm Moments"}
                </p>

                {/* Stars Rating banner */}
                <div className="my-4 py-2.5 px-3 rounded-2xl bg-white border border-hairline shadow-subtle flex flex-col items-center">
                  <div className="flex gap-1 text-amber-400 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-ink">
                    Rate us 5 stars on Google
                  </span>
                </div>

                {/* Prompts chips */}
                <div className="text-left mt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-soft block mb-1.5">
                    Tap to include in review:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {customPrompts.slice(0, 5).map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] py-1 px-2.5 rounded-full font-medium transition-all shadow-2xs"
                        style={{
                          backgroundColor: i === 0 ? activeAccent.light : "#ffffff",
                          color: i === 0 ? activeAccent.primary : "#334155",
                          border: `1px solid ${i === 0 ? activeAccent.border : "#e2e8f0"}`,
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom CTA on stand */}
              <div className="pt-4">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-xs shadow-md flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: activeAccent.primary }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Write 5-Star Review on Google
                </button>
                <p className="text-[9px] text-center text-muted-soft mt-2">
                  Powered by Revasy Smart Reviews
                </p>
              </div>
            </div>

            {/* Quick Summary under Mockup */}
            <div className="mt-5 pt-4 border-t border-hairline text-xs space-y-1.5 text-muted">
              <div className="flex justify-between">
                <span>Tenant Client Email:</span>
                <span className="font-medium text-ink truncate max-w-[170px]">
                  {ownerEmail || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Google Review Protobuf:</span>
                <span className="font-mono text-[10px] text-emerald-600 font-semibold">
                  {placeId ? "Place ID Verified" : "URL Configured"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
