
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
  MessageSquareQuote,
  Zap,
  CheckCircle2,
  Smartphone,
  Check,
  Compass,
  TrendingUp,
} from "lucide-react";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function RevasySaaSHomePage() {
  const demoBusinesses = [
    {
      name: "Cocova Cafe",
      category: "Artisan Coffee & Bakery",
      slug: "cocova",
      icon: <Coffee className="w-5 h-5 text-indigo-600" />,
      accent: "border-indigo-200/80 hover:border-indigo-500",
      badge: "Cafe",
    },
    {
      name: "Apex Smile Dental",
      category: "Gentle Care & Family Dentistry",
      slug: "apex-dental",
      icon: <HeartPulse className="w-5 h-5 text-emerald-600" />,
      accent: "border-emerald-200/80 hover:border-emerald-500",
      badge: "Dental",
    },
    {
      name: "Luxe Studio & Hair Spa",
      category: "Bespoke Styling & Wellness",
      slug: "luxe-salon",
      icon: <Scissors className="w-5 h-5 text-purple-600" />,
      accent: "border-purple-200/80 hover:border-purple-500",
      badge: "Salon",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-hairline px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-2xl tracking-[-0.03em] text-ink flex items-center gap-1 group">
            <span>revasy</span>
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block group-hover:scale-125 transition-transform" />
          </Link>

          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-xs font-semibold text-muted hover:text-ink px-3 py-2 rounded-xl transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="press inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-500/20">
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-20 space-y-16 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Review Assistant by Revasy</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-ink tracking-[-0.03em] leading-[1.08]">
            Turn In-Store Visits into <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              5-Star Google Reviews
            </span>
          </h1>

          <p className="text-base sm:text-lg text-body leading-relaxed max-w-xl mx-auto">
            Give your diners and clients an instant NFC &amp; QR experience. AI polishes genuine feedback into 3 authentic review drafts and guides them directly to Google Maps in 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/dashboard/new"
              className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold shadow-revasy"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Create Your Business QR &amp; NFC</span>
            </Link>
            <Link
              href="/login"
              className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 border border-hairline rounded-2xl text-sm font-medium text-ink shadow-subtle transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-muted" />
              <span>Owner Portal Demo</span>
            </Link>
          </div>
        </div>

        {/* Live Experience Previews (Hick's Law - test with 1-click) */}
        <div className="space-y-4 pt-2">
          <div className="text-center space-y-1">
            <h2 className="font-display font-semibold text-lg text-ink">
              Try Active Business Review Experiences
            </h2>
            <p className="text-xs text-muted">
              Click any business below to test the live mobile NFC/QR guest flow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {demoBusinesses.map((biz) => (
              <Link
                key={biz.slug}
                href={`/b/${biz.slug}`}
                className={`card-hover bg-white p-5 rounded-2xl border ${biz.accent} shadow-card space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-hairline flex items-center justify-center shadow-sm">
                      {biz.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-slate-100 border border-slate-200 text-slate-700">
                      {biz.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink group-hover:text-indigo-600 transition-colors">
                      {biz.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {biz.category}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Open NFC Guest Flow</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Friction vs Solution Matrix (Why It Works) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-card space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-display font-semibold text-xl text-ink">
              Eliminate Customer Review Friction
            </h2>
            <p className="text-xs text-muted max-w-md mx-auto">
              Most satisfied customers want to leave a review, but get stuck on what to write or forget after leaving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
                ❌ The Old Friction-Heavy Way
              </span>
              <ul className="space-y-2 text-xs text-body">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&times;</span>
                  <span>Customers stare at an empty blank box (writer&apos;s block).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&times;</span>
                  <span>Manual searching on Google Maps leads to wrong locations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&times;</span>
                  <span>Owner has no easy way to reply promptly to incoming reviews.</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/60 space-y-3 shadow-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                ✨ The Revasy Review Assistant Way
              </span>
              <ul className="space-y-2 text-xs text-body">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Diner taps NFC stand &amp; taps 3 highlight chips in 5 seconds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>AI generates 3 natural review drafts with 1-click copy &amp; direct Google link.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Owner uses AI Reply Generator to respond politely to all reviews.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3 Step Onboarding Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="bg-white p-6 rounded-3xl border border-hairline shadow-card space-y-2.5 card-hover">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
              1
            </div>
            <h3 className="font-display font-semibold text-base text-ink">
              Register in 60 Seconds
            </h3>
            <p className="text-xs text-body leading-relaxed">
              Upload your logo, pick your industry category, and pin your Google Maps location. Your custom landing page is created immediately.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-hairline shadow-card space-y-2.5 card-hover">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
              2
            </div>
            <h3 className="font-display font-semibold text-base text-ink">
              Print QR &amp; NFC Stands
            </h3>
            <p className="text-xs text-body leading-relaxed">
              Download your high-resolution QR stand kit or write NFC pucks for dining tables, reception counters, and billing folios.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-hairline shadow-card space-y-2.5 card-hover">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
              3
            </div>
            <h3 className="font-display font-semibold text-base text-ink">
              AI Replies &amp; Growth
            </h3>
            <p className="text-xs text-body leading-relaxed">
              Paste incoming Google reviews to generate courteous, tailored owner replies in Professional, Warm, or Concise tones.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-white py-8 px-4 text-center text-xs text-muted space-y-2">
        <p className="font-display font-bold text-sm text-ink flex items-center justify-center gap-1">
          <span>revasy</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
        </p>
        <p>Next-Gen Google Review &amp; Smart NFC Engine for High-Growth Businesses</p>
        <p className="text-[11px] text-muted-soft">
          &copy; {new Date().getFullYear()} Revasy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
