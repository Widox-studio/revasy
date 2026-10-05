import Link from "next/link";
import { Coffee, Star, QrCode, Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { config } from "@/lib/config";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-cafe-50 via-crema to-cafe-100/50">
      {/* Top Navbar */}
      <header className="px-5 py-4 border-b border-cafe-200/60 backdrop-blur-sm sticky top-0 z-10 bg-crema/80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-espresso text-cream flex items-center justify-center shadow-sm">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-espresso tracking-tight">
                {config.cafe.name}
              </h1>
              <p className="text-[10px] text-espresso-muted tracking-wider uppercase">
                Artisan Coffee & Bakery
              </p>
            </div>
          </div>

          <Link
            href="/admin/login"
            className="text-xs font-medium text-espresso-muted hover:text-espresso flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-cafe-100 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Owner Portal</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 text-xs font-semibold mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>AI-Powered Google Review Assistant</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-espresso tracking-tight leading-tight">
            How was your visit to <br />
            <span className="text-amber-700">{config.cafe.name}?</span>
          </h2>
          <p className="text-sm sm:text-base text-espresso-muted max-w-md mx-auto leading-relaxed">
            Scan the table QR or tap the NFC stand to turn your quick impressions into a polished, authentic Google review in seconds.
          </p>
        </div>

        {/* Central Card with QR preview and primary CTA */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cafe-200 shadow-card max-w-md mx-auto w-full space-y-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-cafe-50 border-2 border-dashed border-cafe-300 flex items-center justify-center text-espresso-muted">
            <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-espresso" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <p className="text-xs font-medium text-espresso-muted">
              Tap below to try the guest review experience
            </p>
          </div>

          <Link
            href="/review"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-glow transition-all active:scale-[0.98]"
          >
            <span>Start Review Flow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* How It Works Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="bg-white/60 p-4 rounded-2xl border border-cafe-200/60 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-espresso text-cream flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h3 className="font-serif font-semibold text-sm text-espresso">
              Select Your Rating
            </h3>
            <p className="text-xs text-espresso-muted">
              Pick 1 to 5 stars and enter your genuine impressions.
            </p>
          </div>

          <div className="bg-white/60 p-4 rounded-2xl border border-cafe-200/60 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h3 className="font-serif font-semibold text-sm text-espresso">
              Instant AI Drafts
            </h3>
            <p className="text-xs text-espresso-muted">
              Receive 3 distinct styles: Natural, Warm, or Short.
            </p>
          </div>

          <div className="bg-white/60 p-4 rounded-2xl border border-cafe-200/60 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h3 className="font-serif font-semibold text-sm text-espresso">
              Post to Google
            </h3>
            <p className="text-xs text-espresso-muted">
              Auto-copied to clipboard and forwarded to Google Reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-6 border-t border-cafe-200/60 text-center text-xs text-espresso-muted space-y-1">
        <p className="flex items-center justify-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
          <span>for {config.cafe.name}</span>
        </p>
        <p className="text-[11px] text-stone-400">
          Mobile NFC & QR Review Experience
        </p>
      </footer>
    </main>
  );
}
