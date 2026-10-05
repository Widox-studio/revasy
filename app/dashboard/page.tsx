"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  ExternalLink,
  QrCode,
  MessageSquareQuote,
  Star,
  ShieldCheck,
  LogOut,
  Coffee,
  HeartPulse,
  Scissors,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Business } from "@/lib/business-store";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBiz() {
      try {
        const res = await fetch("/api/businesses");
        const data = await res.json();
        if (data.businesses) {
          setBusinesses(data.businesses);
        }
      } catch (err) {
        console.error("Failed loading businesses:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBiz();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("cafe") || c.includes("coffee") || c.includes("bakery")) return <Coffee className="w-5 h-5 text-brand-pink" />;
    if (c.includes("dental") || c.includes("health")) return <HeartPulse className="w-5 h-5 text-brand-mint" />;
    if (c.includes("salon") || c.includes("spa")) return <Scissors className="w-5 h-5 text-brand-lavender" />;
    return <Building2 className="w-5 h-5 text-brand-teal" />;
  };

  // Filtered businesses
  const filteredBusinesses = businesses.filter((biz) => {
    const matchesSearch =
      biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biz.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (biz.tagline && biz.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      biz.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totalReviewsGenerated = businesses.reduce(
    (sum, b) => sum + (b.stats?.totalReviewsGenerated || 0),
    0
  );
  const totalRepliesGenerated = businesses.reduce(
    (sum, b) => sum + (b.stats?.totalRepliesGenerated || 0),
    0
  );

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* SaaS Admin Header */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display font-semibold text-2xl tracking-[-0.04em] text-ink">
              widox<span className="text-brand-pink">.</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold uppercase tracking-wider bg-surface-card border border-hairline text-brand-teal">
              <ShieldCheck className="w-3.5 h-3.5" />
              SaaS Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/new"
              className="press inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-black shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Business</span>
            </Link>

            <UserButton afterSignOutUrl="/" />

            <button
              onClick={handleLogout}
              className="press p-2 text-muted hover:text-ink hover:bg-surface-card rounded-xl border border-hairline transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-8 flex-1">
        {/* Welcome & Stats Hero */}
        <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-hairline shadow-subtle flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-brand-pink/15 text-brand-pink text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Multi-Business Operations</span>
            </div>
            <h1 className="font-display font-medium text-3xl sm:text-4xl text-ink tracking-[-0.02em]">
              Your Registered Businesses
            </h1>
            <p className="text-sm text-body leading-relaxed">
              Generate branded QR &amp; NFC table stand kits, manage dynamic guest review flows, and compose AI replies for every location.
            </p>
          </div>

          {/* Quick Metrics Bar (Miller's Law chunking) */}
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <div className="bg-white p-4 rounded-2xl border border-hairline shadow-subtle text-center min-w-[110px] flex-1 lg:flex-initial">
              <span className="block font-display font-bold text-2xl text-ink">
                {businesses.length}
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                Locations
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-hairline shadow-subtle text-center min-w-[110px] flex-1 lg:flex-initial">
              <span className="block font-display font-bold text-2xl text-brand-teal">
                {totalReviewsGenerated}
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                Reviews AI
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-hairline shadow-subtle text-center min-w-[110px] flex-1 lg:flex-initial">
              <span className="block font-display font-bold text-2xl text-brand-pink">
                {totalRepliesGenerated}
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                Replies AI
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls (Hick's Law - fast search) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, category, or vibe..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-hairline bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal text-ink placeholder:text-muted-soft"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: "all", label: "All" },
              { key: "cafe", label: "Cafes" },
              { key: "dental", label: "Dental" },
              { key: "salon", label: "Salons" },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`text-xs px-3 py-1.5 rounded-pill border font-medium transition-all ${
                  selectedCategory === cat.key
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-surface-card text-ink border-hairline hover:bg-surface-strong"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Businesses Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-hairline p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl shimmer-box" />
                  <div className="w-16 h-5 rounded-pill shimmer-box" />
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-5 rounded shimmer-box" />
                  <div className="w-1/2 h-3.5 rounded shimmer-box" />
                </div>
                <div className="w-full h-10 rounded-xl shimmer-box" />
              </div>
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-hairline text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-surface-card border border-hairline mx-auto flex items-center justify-center text-muted">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink">
              {searchQuery ? "No matching businesses found" : "No businesses registered yet"}
            </h3>
            <p className="text-xs text-muted">
              {searchQuery
                ? "Try searching for a different keyword or clear your filter."
                : "Add your first cafe, clinic, salon, or store to generate your custom Google review flow."}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-brand-teal hover:underline"
              >
                Clear Search
              </button>
            ) : (
              <Link
                href="/dashboard/new"
                className="press inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Business</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-2xl border border-hairline p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-5"
              >
                {/* Header: Logo, Name, Category */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-card border border-hairline flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {biz.logoUrl ? (
                        <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                      ) : (
                        getCategoryIcon(biz.category)
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-surface-card border border-hairline text-muted">
                      {biz.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink">
                      {biz.name}
                    </h3>
                    <p className="text-xs text-muted line-clamp-1">
                      {biz.tagline || biz.description || "Active profile"}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hairline text-center">
                  <div className="bg-surface-soft/60 p-2 rounded-xl border border-hairline/60">
                    <span className="block font-display font-semibold text-base text-ink">
                      {biz.stats?.totalReviewsGenerated || 0}
                    </span>
                    <span className="text-[10px] text-muted uppercase font-medium">Reviews AI</span>
                  </div>
                  <div className="bg-surface-soft/60 p-2 rounded-xl border border-hairline/60">
                    <span className="block font-display font-semibold text-base text-ink">
                      {biz.stats?.totalRepliesGenerated || 0}
                    </span>
                    <span className="text-[10px] text-muted uppercase font-medium">Replies AI</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2 pt-1">
                  <Link
                    href={`/dashboard/${biz.slug}`}
                    className="press w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-black shadow-sm"
                  >
                    <MessageSquareQuote className="w-4 h-4 text-brand-pink" />
                    <span>Manage &amp; AI Replies</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Link>

                  <a
                    href={`/b/${biz.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-surface-card hover:bg-surface-strong border border-hairline text-ink rounded-xl text-xs font-medium transition-colors"
                  >
                    <span>View Guest Review Flow</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-surface-soft py-6 px-4 text-center text-xs text-muted">
        <p>Widox Google Review Assistant Platform &bull; Made with pride in India</p>
      </footer>
    </div>
  );
}
