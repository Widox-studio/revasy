"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  PlusCircle, 
  Search, 
  ExternalLink, 
  Star, 
  MessageSquare, 
  Sliders, 
  MapPin, 
  Mail, 
  QrCode, 
  Sparkles,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { Business } from "@/lib/business-store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { THEME_ACCENTS } from "@/lib/theme";

interface FleetOverviewProps {
  initialBusinesses: Business[];
  userAppUrl?: string;
}

export function FleetOverview({ initialBusinesses, userAppUrl = "" }: FleetOverviewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(initialBusinesses.map((b) => b.category).filter(Boolean))),
  ];

  const filteredBusinesses = initialBusinesses.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      b.ownerEmail.toLowerCase().includes(q) ||
      (b.tagline && b.tagline.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q));

    const matchesCat =
      selectedCategory === "all" || b.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  });

  const totalReviews = initialBusinesses.reduce(
    (acc, b) => acc + (b.stats?.totalReviewsGenerated || 0),
    0
  );
  const totalReplies = initialBusinesses.reduce(
    (acc, b) => acc + (b.stats?.totalRepliesGenerated || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Platform Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>revasy Fleet Command &bull; Super-Admin</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Fleet Overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Global management, Google Place ID provisioning, and telemetry across all merchant stands.
          </p>
        </div>

        <Link href="/admin/businesses/new">
          <Button variant="revasy" size="md" className="gap-2 shadow-revasy">
            <PlusCircle className="h-4 w-4" />
            Onboard Business
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-subtle">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Locations</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-display font-bold text-ink">
            {initialBusinesses.length}
          </div>
          <p className="mt-1 text-xs text-muted">Provisioned storefronts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-subtle">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Reviews Assisted</span>
            <Star className="h-4 w-4 text-brand-ochre" />
          </div>
          <div className="text-3xl font-display font-bold text-ink">
            {totalReviews}
          </div>
          <p className="mt-1 text-xs text-muted">Customer submissions initiated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-subtle">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Replies Generated</span>
            <MessageSquare className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-display font-bold text-ink">
            {totalReplies}
          </div>
          <p className="mt-1 text-xs text-muted">Direct protobuf review URLs</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-hairline shadow-subtle">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business name, slug, address, or owner email..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border-none bg-slate-50 text-ink placeholder:text-muted-soft focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {categories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <Filter className="h-3.5 w-3.5 text-muted ml-2" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-muted hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fleet Cards Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-hairline p-12 text-center">
          <Building2 className="h-10 w-10 text-muted-soft mx-auto mb-3" />
          <h3 className="font-display font-semibold text-ink text-base">No businesses found</h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            {search
              ? "No business matches your query. Try searching for a different name, slug, or email."
              : "No locations have been registered yet. Start by onboarding your first business."}
          </p>
          {!search && (
            <div className="mt-6">
              <Link href="/admin/businesses/new">
                <Button variant="revasy" size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Onboard First Business
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((b) => {
            const accent = THEME_ACCENTS[b.accentColor] || THEME_ACCENTS.teal;
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-hairline shadow-subtle hover:shadow-card transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge & Slug */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs text-muted-soft bg-slate-50 px-2.5 py-1 rounded-lg border border-hairline">
                      /{b.slug}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {b.category || "General"}
                    </Badge>
                  </div>

                  {/* Business Identity */}
                  <h3 className="font-display font-bold text-lg text-ink group-hover:text-primary transition-colors flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: accent.primary }}
                    />
                    <span className="truncate">{b.name}</span>
                  </h3>

                  {b.tagline && (
                    <p className="text-xs text-muted line-clamp-1 mt-0.5">
                      {b.tagline}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="mt-4 pt-3 border-t border-hairline space-y-2 text-xs text-muted mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-soft shrink-0" />
                      <span className="truncate font-medium text-ink">{b.ownerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span className="font-mono text-[11px] truncate">
                        {b.placeId ? `Place ID: ${b.placeId}` : "Google Place ID linked"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-muted">⭐ {b.stats?.totalReviewsGenerated || 0} reviews</span>
                      <span>•</span>
                      <span className="text-muted">💬 {b.stats?.totalRepliesGenerated || 0} AI replies</span>
                    </div>
                  </div>

                  {/* Prompt chips preview */}
                  {b.customPrompts && b.customPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {b.customPrompts.slice(0, 3).map((prompt, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium truncate max-w-[150px]"
                        >
                          {prompt}
                        </span>
                      ))}
                      {b.customPrompts.length > 3 && (
                        <span className="text-[10px] text-muted-soft self-center">
                          +{b.customPrompts.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-hairline flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/businesses/${b.slug}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                        <Sliders className="h-3.5 w-3.5 mr-1.5" />
                        Configure Location
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <a
                      href={`/b/${b.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                      title="Customer NFC / QR Review Stand"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Live Stand
                      <ArrowUpRight className="h-3 w-3" />
                    </a>

                    <Link
                      href={`/dashboard/${b.slug}`}
                      className="inline-flex items-center gap-1 text-muted hover:text-ink font-medium"
                      title="Tenant Owner Dashboard View"
                    >
                      <span>Owner Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
