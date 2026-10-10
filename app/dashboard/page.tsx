"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ExternalLink,
  MessageSquareQuote,
  LogOut,
  Coffee,
  HeartPulse,
  Scissors,
  ArrowRight,
  Search,
  Sparkles,
  X,
  Clock,
  CheckCircle2,
  Mail,
  MessageCircle,
} from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";
import { Business } from "@/lib/business-store";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBiz() {
      try {
        const res = await fetch("/api/businesses");
        const data = await res.json();

        // If not authenticated, redirect to login
        if (data && data.isAuthenticated === false) {
          router.replace("/login?redirect_url=/dashboard");
          return;
        }

        if (data.businesses) {
          setBusinesses(data.businesses);
          setUserEmail(data.userEmail || null);
        }
      } catch (err) {
        console.error("Failed loading businesses:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBiz();
  }, [router]);

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
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display font-bold text-2xl tracking-[-0.03em] text-ink flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <img src="/revasy-logo.png" alt="revasy logo" className="w-full h-full object-contain" />
              </div>
              <span>revasy</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold uppercase tracking-wider bg-surface-card border border-hairline text-muted">
              Client Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
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

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-8 flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
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
        ) : businesses.length === 0 ? (
          /* Widox Team White-Glove Onboarding in Progress */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-hairline p-6 sm:p-10 shadow-subtle text-center space-y-6 animate-fadeIn my-6">
            <div className="w-20 h-20 rounded-2xl bg-white border border-hairline mx-auto flex items-center justify-center shadow-sm overflow-hidden p-2.5">
              <img
                src="/revasy-logo.png"
                alt="revasy"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                White-Glove Setup In Progress
              </span>
              <h1 className="font-display font-medium text-2xl sm:text-3xl text-ink tracking-tight">
                Your Review Assistant Is Being Configured
              </h1>
              <p className="text-sm text-body leading-relaxed max-w-lg mx-auto">
                Welcome to revasy! The Widox team is currently setting up your verified Google Place ID integration, NFC/QR print assets, and tailored AI review prompt models.
              </p>
            </div>

            {/* Account & Setup Status Box */}
            <div className="bg-surface-card rounded-2xl p-5 border border-hairline text-left space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-xs font-semibold text-muted">Registered Account:</span>
                <span className="text-xs font-bold text-ink bg-white px-2.5 py-1 rounded-lg border border-hairline">
                  {userEmail || "Signed In"}
                </span>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-ink">Account Authentication Active</p>
                    <p className="text-[11px] text-muted">Your credentials and security session are verified.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-900">Google Place ID &amp; Location Linking</p>
                    <p className="text-[11px] text-muted">Widox team linking your exact Google review destination.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <Clock className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-ink">Dashboard &amp; AI Reply Activation</p>
                    <p className="text-[11px] text-muted">Ready to manage reviews and download stand materials.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="pt-2 space-y-3">
              <p className="text-xs text-muted font-medium">Need immediate onboarding or have questions?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* 
                  =============================================================================
                  WIDOX WHATSAPP NUMBER:
                  To add your WhatsApp number, put it in the quotes below (e.g., "919876543210" with country code).
                  =============================================================================
                */}
                {(() => {
                  const WIDOX_WHATSAPP_NUMBER = "9428363238"; // <-- PLACE YOUR WHATSAPP NUMBER HERE (e.g. "919876543210")
                  const cleanPhone = WIDOX_WHATSAPP_NUMBER.replace(/\D/g, "");
                  const whatsappHref = cleanPhone
                    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hello Widox Team, I registered my account (${userEmail || ""}) on revasy and would like to configure my business dashboard.`
                      )}`
                    : `https://wa.me/?text=${encodeURIComponent(
                        `Hello Widox Team, I registered my account (${userEmail || ""}) on revasy and would like to configure my business dashboard.`
                      )}`;

                  return (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat with Widox Team</span>
                    </a>
                  );
                })()}

                <a
                  href={`mailto:widoxstudio@gmail.com?subject=${encodeURIComponent(
                    "revasy Business Dashboard Setup Request - Widox Studio"
                  )}&body=${encodeURIComponent(
                    `Hello Widox Team,\n\nI have signed up with the email: ${userEmail || ""}.\nPlease configure the dashboard for my business:\n\nBusiness Name:\nGoogle Maps Link or Address:\n\nThank you!`
                  )}`}
                  className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-card hover:bg-surface-strong border border-hairline text-ink rounded-xl text-xs font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4 text-muted" />
                  <span>Email Support Team</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Location Switcher (for Multi-Unit Franchise Owners) */
          <>
            {/* Welcome & Stats Hero */}
            <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-hairline shadow-subtle flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-indigo-50 text-primary text-xs font-bold uppercase tracking-wider border border-indigo-100">
                  <Sparkles className="w-3 h-3" />
                  <span>Your Locations</span>
                </div>
                <h1 className="font-display font-medium text-2xl sm:text-4xl text-ink tracking-[-0.02em]">
                  Select Business Location
                </h1>
                <p className="text-xs sm:text-sm text-body leading-relaxed">
                  Manage branded QR &amp; NFC table stand kits, inspect guest review flows, and compose AI replies for your locations.
                </p>
              </div>

              {/* Quick Metrics Bar */}
              <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                <div className="bg-white p-4 rounded-2xl border border-hairline shadow-subtle min-w-[110px] flex-1 lg:flex-initial text-center sm:text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                      Locations
                    </span>
                    <Building2 className="w-3.5 h-3.5 text-muted hidden sm:block" />
                  </div>
                  <span className="block font-display font-bold text-xl sm:text-2xl text-ink">
                    {businesses.length}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/30 shadow-subtle min-w-[110px] flex-1 lg:flex-initial text-center sm:text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-semibold text-teal-800 tracking-wider">
                      Reviews AI
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-brand-teal hidden sm:block" />
                  </div>
                  <span className="block font-display font-bold text-xl sm:text-2xl text-brand-teal">
                    {totalReviewsGenerated}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 shadow-subtle min-w-[110px] flex-1 lg:flex-initial text-center sm:text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-semibold text-indigo-800 tracking-wider">
                      Replies AI
                    </span>
                    <MessageSquareQuote className="w-3.5 h-3.5 text-primary hidden sm:block" />
                  </div>
                  <span className="block font-display font-bold text-xl sm:text-2xl text-primary">
                    {totalRepliesGenerated}
                  </span>
                </div>
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location name or category..."
                  className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl border border-hairline bg-white focus:outline-none focus:ring-2 focus:ring-primary text-ink placeholder:text-muted-soft transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-0.5 rounded-md"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
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
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-surface-card text-ink border-hairline hover:bg-surface-strong"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Businesses Cards Grid */}
            {filteredBusinesses.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-hairline text-center space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-surface-card border border-hairline mx-auto flex items-center justify-center text-muted">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="font-display font-semibold text-lg text-ink">
                  {searchQuery ? "No matching locations found" : "No locations assigned"}
                </h3>
                <p className="text-xs text-muted">
                  {searchQuery
                    ? "Try searching for a different keyword or clear your filter."
                    : "Contact the Widox team (widoxstudio@gmail.com) to configure additional branches."}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Clear Search
                  </button>
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
                        <div className="w-12 h-12 rounded-xl bg-white border border-hairline flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                          {biz.logoUrl ? (
                            <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-contain" />
                          ) : (
                            getCategoryIcon(biz.category)
                          )}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-surface-card border border-hairline text-muted">
                          {biz.category}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-base sm:text-lg text-ink">
                          {biz.name}
                        </h3>
                        <p className="text-xs text-muted line-clamp-1">
                          {biz.tagline || biz.description || "Active location"}
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
                        className="press w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm shadow-indigo-500/15"
                      >
                        <MessageSquareQuote className="w-4 h-4 text-brand-pink" />
                        <span>Open Location Dashboard</span>
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-surface-soft py-6 px-4 text-center text-xs text-muted">
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
    </div>
  );
}
