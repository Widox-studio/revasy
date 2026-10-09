"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  QrCode,
  Star,
  ArrowRight,
  ShieldCheck,
  Building2,
  Coffee,
  HeartPulse,
  Scissors,
  ExternalLink,
  Zap,
  CheckCircle2,
  Smartphone,
  Check,
  TrendingUp,
  Layers,
  Lock,
  Copy,
  ChevronDown,
  ArrowUpRight,
  Radio,
  Clock,
  ThumbsUp,
  UtensilsCrossed,
  Printer,
  Shield,
  HelpCircle,
  MessageSquareQuote,
  Menu,
  X,
} from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { AiReplyShowcase } from "@/components/landing/AiReplyShowcase";

export default function RevasySaaSHomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const faqs = [
    {
      q: "Do customers or diners need to download an app or sign up?",
      a: "No! Guests never download an app or create an account. When they tap the NFC table stand with their smartphone (or scan the QR code), it opens directly in their mobile browser in under 1 second.",
    },
    {
      q: "Is this compliant with Google's Official Review Policies?",
      a: "100% compliant. revasy does NOT gate reviews or filter negative feedback (which violates Google terms). Instead, it solves customer 'writer's block' by providing highlight chips and direct protobuf deep-links straight into Google's native 5-star review dialog.",
    },
    {
      q: "How do the Smart NFC table stands work?",
      a: "Each stand contains a high-speed NTAG213 NFC chip and a high-resolution QR code. When a customer holds any modern iPhone or Android near the stand, their phone automatically pops up your business review generator.",
    },
    {
      q: "How does white-glove onboarding work for my business?",
      a: "You don't have to fiddle with Google Maps APIs, coordinates, or Place IDs. Our team pins your exact Google Place ID, generates the protobuf review URL, programs your custom prompt chips, and assigns your owner email. You simply log in to access your dashboard.",
    },
    {
      q: "Can other business owners see my data or change my location?",
      a: "Never. revasy enforces strict 1-to-1 tenant isolation backed by Google OAuth. You can only view and manage your assigned business. Your Google Maps pin and Place ID are locked to prevent any tampering.",
    },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink overflow-x-hidden flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Header / Navigation Shell */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand Tag */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="font-display font-bold text-xl sm:text-2xl tracking-[-0.03em] text-ink flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <img src="/revasy-logo.png" alt="revasy logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold tracking-tight">revasy</span>
            </Link>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-ink transition-colors cursor-pointer">Features</a>
            <a href="#simulator" onClick={(e) => scrollToSection(e, "simulator")} className="hover:text-ink transition-colors cursor-pointer">AI Reply Demo</a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-ink transition-colors cursor-pointer">How It Works</a>
            <a href="#concierge" onClick={(e) => scrollToSection(e, "concierge")} className="hover:text-ink transition-colors cursor-pointer">For Businesses</a>
          </nav>

          {/* Auth & Portal Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="revasy" size="sm" className="shadow-revasy text-xs font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2">
                  <span>Client Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <Button variant="revasy" size="sm" className="shadow-revasy text-xs font-semibold px-3 py-1.5 sm:px-4 sm:py-2">
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-hairline text-muted hover:text-ink hover:bg-slate-50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-hairline mt-3 -mx-4 px-4 py-4 space-y-3 animate-fadeIn">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, "features")}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-ink transition-colors cursor-pointer"
              >
                Features
              </a>
              <a
                href="#simulator"
                onClick={(e) => scrollToSection(e, "simulator")}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-ink transition-colors cursor-pointer"
              >
                AI Reply Demo
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, "how-it-works")}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-ink transition-colors cursor-pointer"
              >
                How It Works
              </a>
              <a
                href="#concierge"
                onClick={(e) => scrollToSection(e, "concierge")}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-ink transition-colors cursor-pointer"
              >
                For Businesses
              </a>
            </nav>

            <div className="pt-2 border-t border-hairline flex flex-col gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="revasy"
                    size="sm"
                    className="w-full shadow-revasy text-xs font-semibold py-2.5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Client Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="revasy" size="sm" className="w-full shadow-revasy text-xs font-semibold py-2.5">
                    <span>Client Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 space-y-24 sm:space-y-32 pb-24">
        {/* 2. Hero Section */}
        <section className="relative pt-12 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-100 via-indigo-50 to-transparent rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-ink tracking-[-0.03em] leading-[1.08]">
              Turn In-Store Guests into <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-brand-lavender bg-clip-text text-transparent">
                5-Star Google Reviews
              </span>{" "}
              in 30 Seconds.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-body leading-relaxed max-w-2xl mx-auto">
              Place custom NFC &amp; QR smart stands on dining tables and counters. Diners tap highlight chips, AI drafts genuine reviews in seconds, and direct protobuf links pop open Google Maps.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="revasy" size="lg" className="w-full sm:w-auto shadow-revasy text-sm font-semibold px-8 py-4">
                    <Zap className="w-4 h-4 mr-2 text-amber-300" />
                    <span>Enter Client Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="revasy" size="lg" className="w-full sm:w-auto shadow-revasy text-sm font-semibold px-8 py-4">
                    <Zap className="w-4 h-4 mr-2 text-amber-300" />
                    <span>Enter Client Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </SignedIn>
              <a href="#simulator" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-semibold px-6 py-4 bg-white/80">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  <span>Watch AI Auto-Reply Demo</span>
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Apps to Install for Guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Works on All iPhones &amp; Androids</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Google Maps Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. revasy AI Hospitality Auto-Reply Demo */}
        <section id="simulator" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <AiReplyShowcase />
        </section>

        {/* 4. Why Traditional Reviews Fail vs revasy */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              The Real Problem
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
              Why 90% of Happy Diners Never Leave a Review
            </h2>
            <p className="text-sm text-muted max-w-xl mx-auto">
              Satisfied customers intend to review you, but friction stops them before they write a single sentence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Broken Old Way */}
            <div className="bg-white rounded-3xl border border-rose-200/80 p-6 sm:p-8 space-y-5 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                  ✕
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-ink">
                    The Old Broken Way
                  </h3>
                  <p className="text-xs text-rose-700 font-medium">Frustrating &amp; High-Dropoff</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold text-base leading-none">•</span>
                  <span><strong>The &ldquo;Blank Page&rdquo; Freeze:</strong> Guests open an empty text box and don&apos;t know what to write, so they close the tab.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold text-base leading-none">•</span>
                  <span><strong>Generic Search Links:</strong> Clunky QR codes link to Google search pages where guests accidentally review the wrong business branch.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold text-base leading-none">•</span>
                  <span><strong>Lost Momentum:</strong> Guests say &ldquo;I&apos;ll do it when I get home&rdquo; and forget within 10 minutes of walking out the door.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold text-base leading-none">•</span>
                  <span><strong>Ignored Reviews:</strong> Managers don&apos;t have time to write thoughtful replies to incoming customer reviews.</span>
                </li>
              </ul>
            </div>

            {/* The revasy Method */}
            <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 sm:p-8 space-y-5 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-ink">
                    The revasy System
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">Effortless 30-Second Completion</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1-Tap Highlight Chips:</strong> Guests tap prompt chips for food, drinks, service, and vibe without typing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>3 Natural AI Drafts:</strong> AI polishes chips into genuine sentences matching the guest&apos;s true sentiment.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Direct Protobuf Deep Link:</strong> Opens Google&apos;s 5-star rating sheet with 0 extra search steps.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>AI Hospitality Replies:</strong> Managers draft polite, warm responses to 100% of reviews with 1 click.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Six Pillars of revasy (Features) */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Platform Features
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
              Built for High-Growth Hospitality &amp; Local Brands
            </h2>
            <p className="text-sm text-muted max-w-xl mx-auto">
              Everything your venue needs to dominate local Google search and protect your 5-star reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl border border-hairline p-6 shadow-card space-y-3 card-hover">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink">
                Smart NFC &amp; QR Table Kits
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Download print-ready acrylic table tents or write NFC pucks for dining tables, reception desks, and billing folios. Compatible with all modern devices.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl border border-hairline p-6 shadow-card space-y-3 card-hover">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink">
                AI Review Draft Engine
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Generates natural, non-repetitive feedback variations. Keeps reviews fresh, authentic, and compliant with Google&apos;s anti-spam algorithms.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl border border-hairline p-6 shadow-card space-y-3 card-hover">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink">
                Autonomous AI Review Auto-Reply
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Connect your Google Business Profile and let revasy AI automatically compose and publish warm, personalized hospitality responses on your behalf — 24/7 without lifting a finger.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl border border-hairline p-6 shadow-card space-y-3 card-hover">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink">
                White-Glove Setup &amp; Locked Routing
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Zero setup headaches. We pin your verified Google Place ID and lock routing to prevent accidental URL breaks or incorrect location mapping.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-3xl border border-hairline p-6 shadow-card space-y-3 card-hover">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink">
                Strict 1-to-1 Tenant Isolation
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Powered by Google OAuth. Clients can only view and manage their assigned location. Non-authorized access is blocked with 403 enforcement.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white rounded-3xl border border-hairline p-6 shadow-card space-y-3 card-hover">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-ink">
                Multi-Location Fleet Scaling
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Scale seamlessly from a single neighborhood boutique to a multi-city franchise. Provision each store with unique prompt chips and separate owner permissions.
              </p>
            </div>
          </div>
        </section>

        {/* 6. The White-Glove Concierge Process */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              White-Glove Onboarding
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
              How It Works for Your Business
            </h2>
            <p className="text-sm text-muted max-w-xl mx-auto">
              We eliminate technical complexity so you can focus on delivering exceptional guest experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-hairline shadow-card space-y-4 relative">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
                01
              </div>
              <h3 className="font-display font-bold text-lg text-ink">
                We Pin &amp; Customize
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Our team links your official Google Place ID, generates direct protobuf review URLs, and designs custom prompt chips matching your menu or specialties.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-hairline shadow-card space-y-4 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-lavender text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
                02
              </div>
              <h3 className="font-display font-bold text-lg text-ink">
                Deploy Smart Stands
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Download your high-resolution QR stand kit or place programmed NFC acrylic stands on tables, bar counters, and checkout folios.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-hairline shadow-card space-y-4 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-mint text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
                03
              </div>
              <h3 className="font-display font-bold text-lg text-ink">
                Watch Reviews Multiply
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Guests tap with their smartphone and post authentic 5-star feedback in under 30 seconds before paying their check.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Key Performance Metrics */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-floating space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                Proven Results in Live Hospitality Venues
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-indigo-400">
                  <AnimatedCounter target={340} prefix="+" suffix="%" />
                </span>
                <p className="text-xs text-slate-300 font-medium">Monthly Review Volume</p>
              </div>

              <div className="space-y-1">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-amber-400">
                  <AnimatedCounter target={28} suffix="s" />
                </span>
                <p className="text-xs text-slate-300 font-medium">Average Completion Time</p>
              </div>

              <div className="space-y-1">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-400">
                  <AnimatedCounter target={88} suffix="%" />
                </span>
                <p className="text-xs text-slate-300 font-medium">Writer&apos;s Block Eliminated</p>
              </div>

              <div className="space-y-1">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-teal-300">
                  <AnimatedCounter target={100} suffix="%" />
                </span>
                <p className="text-xs text-slate-300 font-medium">Google Policy Compliant</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Frequently Asked Questions
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-hairline overflow-hidden transition-all shadow-subtle"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-display font-semibold text-sm sm:text-base text-ink"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-body leading-relaxed border-t border-hairline/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 9. Final CTA Banner */}
        <section id="concierge" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="bg-primary text-white rounded-3xl p-8 sm:p-12 shadow-revasy text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="max-w-xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Ready to Upgrade Your Reputation?
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Turn Every Dining Table into a 5-Star Review Generator
              </h2>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Connect with our team to pin your location, get custom prompt chips, and launch your smart stands.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm font-bold px-8 py-3.5 bg-white text-primary hover:bg-slate-100 shadow-md">
                    <span>Open Client Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2 text-primary" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm font-bold px-8 py-3.5 bg-white text-primary hover:bg-slate-100 shadow-md">
                    <span>Open Client Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2 text-primary" />
                  </Button>
                </Link>
              </SignedIn>
              <a
                href="mailto:widoxstudio@gmail.com?subject=revasy%20Business%20Inquiry"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-semibold px-6 py-3.5 border-white/40 text-white hover:bg-white/10">
                  <span>Contact Concierge Support</span>
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Modern Production Footer */}
      <footer className="border-t border-hairline bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/revasy-logo.png" alt="revasy logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-base text-ink">revasy</span>
            <span className="text-muted-soft ml-2">Smart NFC Reviews &amp; AI Hospitality Assistant</span>
          </div>

          {/* Links: Privacy Policy & Terms of Service only */}
          <div className="flex items-center gap-6 text-slate-500 font-medium">
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link>
          </div>

          {/* Copyright & Made and maintained by widox */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-muted-soft text-[11px]">
            <span>&copy; {new Date().getFullYear()} revasy. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="font-medium text-slate-600">
              Made and maintained by{" "}
              <a
                href="https://widox.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary hover:text-indigo-700 hover:underline transition-colors"
              >
                widox
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
