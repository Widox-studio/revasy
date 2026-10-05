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
} from "lucide-react";
import { Business } from "@/lib/business-store";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
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
    if (c.includes("cafe") || c.includes("coffee")) return <Coffee className="w-5 h-5 text-brand-pink" />;
    if (c.includes("dental") || c.includes("health")) return <HeartPulse className="w-5 h-5 text-brand-mint" />;
    if (c.includes("salon") || c.includes("spa")) return <Scissors className="w-5 h-5 text-brand-lavender" />;
    return <Building2 className="w-5 h-5 text-brand-teal" />;
  };

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
              className="press inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary rounded-md text-xs font-semibold hover:bg-black"
            >
              <Plus className="w-4 h-4" />
              <span>Add Business</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-muted hover:text-ink hover:bg-surface-card rounded-md transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-8 flex-1">
        {/* Welcome Banner */}
        <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-hairline shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">
              Multi-Business Management
            </span>
            <h1 className="font-display font-medium text-3xl sm:text-4xl text-ink tracking-[-0.02em]">
              Your Registered Businesses
            </h1>
            <p className="text-sm text-body leading-relaxed">
              Generate customized QR &amp; NFC guest review cards, review generation flows, and AI reply assistants for all your locations.
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="press inline-flex items-center gap-2 px-5 py-3.5 bg-brand-teal text-white rounded-xl text-sm font-semibold shadow-widox hover:opacity-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Business</span>
          </Link>
        </div>

        {/* Businesses List */}
        {isLoading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-hairline border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted">Loading your businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-hairline text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-surface-card border border-hairline mx-auto flex items-center justify-center text-muted">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink">No businesses registered yet</h3>
            <p className="text-xs text-muted">
              Add your first cafe, clinic, salon, or store to generate your custom Google review flow.
            </p>
            <Link
              href="/dashboard/new"
              className="press inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Business</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-2xl border border-hairline p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-5"
              >
                {/* Header: Logo, Name, Category */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-card border border-hairline flex items-center justify-center overflow-hidden shrink-0">
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
                  <div className="bg-surface-soft/60 p-2 rounded-xl">
                    <span className="block font-display font-semibold text-base text-ink">
                      {biz.stats?.totalReviewsGenerated || 0}
                    </span>
                    <span className="text-[10px] text-muted uppercase font-medium">Reviews AI</span>
                  </div>
                  <div className="bg-surface-soft/60 p-2 rounded-xl">
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
                    className="press w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-black"
                  >
                    <MessageSquareQuote className="w-4 h-4 text-brand-pink" />
                    <span>Manage &amp; AI Replies</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Link>

                  <a
                    href={`/b/${biz.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-surface-card hover:bg-surface-strong border border-hairline text-ink rounded-xl text-xs font-medium transition-colors"
                  >
                    <span>View Guest Review Flow</span>
                    <ExternalLink className="w-3 h-3 text-muted" />
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
