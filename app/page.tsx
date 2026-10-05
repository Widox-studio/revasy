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
} from "lucide-react";

export default function WidoxSaaSHomePage() {
  const demoBusinesses = [
    {
      name: "Cocova Cafe",
      category: "Artisan Coffee & Bakery",
      slug: "cocova",
      icon: <Coffee className="w-5 h-5 text-brand-pink" />,
      accent: "border-brand-pink/30 hover:border-brand-pink",
      badge: "Cafe",
    },
    {
      name: "Apex Smile Dental",
      category: "Gentle Care & Family Dentistry",
      slug: "apex-dental",
      icon: <HeartPulse className="w-5 h-5 text-brand-mint" />,
      accent: "border-brand-mint/30 hover:border-brand-mint",
      badge: "Dental",
    },
    {
      name: "Luxe Studio & Hair Spa",
      category: "Bespoke Styling & Wellness",
      slug: "luxe-salon",
      icon: <Scissors className="w-5 h-5 text-brand-lavender" />,
      accent: "border-brand-lavender/30 hover:border-brand-lavender",
      badge: "Salon",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-brand-ochre selection:text-ink">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur-md border-b border-hairline px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display font-semibold text-2xl tracking-[-0.04em] text-ink">
            widox<span className="text-brand-pink">.</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-muted hover:text-ink px-3 py-2 rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard/new"
              className="press inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-md text-xs font-semibold hover:bg-black shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-20 space-y-16 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-5 max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-brand-pink/15 text-ink text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
            <span>AI Review Assistant by Widox</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-ink tracking-[-0.03em] leading-[1.08]">
            Turn In-Store Visits into <br />
            <span className="text-brand-teal">5-Star Google Reviews</span>
          </h1>

          <p className="text-base sm:text-lg text-body leading-relaxed max-w-lg mx-auto">
            Give your diners and clients an instant NFC &amp; QR experience. AI polishes genuine feedback into 3 natural review drafts and guides them directly to Google.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/dashboard/new"
              className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-widox hover:bg-black"
            >
              <Zap className="w-4 h-4 text-brand-pink" />
              <span>Create Your Business QR</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-surface-card hover:bg-surface-strong border border-hairline rounded-xl text-sm font-medium text-ink transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-muted" />
              <span>Owner Portal Demo</span>
            </Link>
          </div>
        </div>

        {/* Live Experience Previews */}
        <div className="space-y-4">
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
                className={`group bg-white p-5 rounded-2xl border ${biz.accent} shadow-subtle hover:shadow-card transition-all space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-surface-card border border-hairline flex items-center justify-center group-hover:scale-105 transition-transform">
                      {biz.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill bg-surface-card border border-hairline text-muted">
                      {biz.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink group-hover:text-brand-teal transition-colors">
                      {biz.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {biz.category}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs font-semibold text-brand-teal">
                  <span>Open NFC Guest Flow</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Value Props & How it Works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-surface-card p-6 rounded-3xl border border-hairline space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-pink text-white flex items-center justify-center font-display font-bold text-sm">
              1
            </div>
            <h3 className="font-display font-semibold text-base text-ink">
              Register in 60 Seconds
            </h3>
            <p className="text-xs text-body leading-relaxed">
              Upload your logo, pick your category, and paste your Google Review link. Your custom landing page is created immediately.
            </p>
          </div>

          <div className="bg-surface-card p-6 rounded-3xl border border-hairline space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-teal text-white flex items-center justify-center font-display font-bold text-sm">
              2
            </div>
            <h3 className="font-display font-semibold text-base text-ink">
              Print QR &amp; NFC Stands
            </h3>
            <p className="text-xs text-body leading-relaxed">
              Download your high-resolution QR stand kit or write NFC pucks for table stands, billing counters, and reception desks.
            </p>
          </div>

          <div className="bg-surface-card p-6 rounded-3xl border border-hairline space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-ochre text-ink flex items-center justify-center font-display font-bold text-sm">
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
      <footer className="border-t border-hairline bg-surface-soft py-8 px-4 text-center text-xs text-muted space-y-2">
        <p className="font-display font-semibold text-sm text-ink">
          widox<span className="text-brand-pink">.</span>
        </p>
        <p>AI Automation &amp; Web Systems for Businesses across India</p>
        <p className="text-[11px] text-muted-soft">
          &copy; {new Date().getFullYear()} Widox Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
