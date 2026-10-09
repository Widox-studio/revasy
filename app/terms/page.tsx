import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Service | revasy",
  description:
    "Terms of Service for revasy. Terms governing the use of revasy contactless review stands, AI review replies, and Google Business Profile integrations.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display font-bold text-xl tracking-tight text-ink group"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <img src="/revasy-logo.png" alt="revasy logo" className="w-full h-full object-contain" />
            </div>
            <span>revasy</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10 flex-1">
        {/* Header */}
        <div className="space-y-3 border-b border-hairline pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Last Updated: October 9, 2026 • Effective Date: October 9, 2026
          </p>
        </div>

        {/* Terms Body */}
        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using the <strong>revasy</strong> application, NFC table stands, or associated software services provided by revasy (&quot;Service&quot;), you agree to be legally bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              2. Description of Services
            </h2>
            <p>
              revasy provides merchant solutions including contactless NFC &amp; QR feedback displays, an AI-assisted customer review draft generator, and autonomous Google Business Profile review reply automation.
            </p>
            <p>
              The Service is designed to assist businesses in communicating with their patrons and maintaining an active, responsive presence on Google Business Profile.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              3. Google Business Profile &amp; Third-Party Services
            </h2>
            <p>
              When you enable revasy AI Review Auto-Reply, you authorize revasy to connect via Google OAuth to your designated Google Business Profile account and publish business owner responses on your behalf.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                You confirm that you are the verified owner, manager, or authorized representative of the Google Business Profile linked to revasy.
              </li>
              <li>
                You acknowledge that revasy complies with Google&apos;s API policies and guidelines, and you agree to comply with Google&apos;s Terms of Service and Content Policies regarding reviews and replies.
              </li>
              <li>
                You retain ultimate authority over your account and may enable, disable, or modify auto-reply rules, or disconnect Google integration at any time.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              4. AI-Generated Content &amp; Merchant Responsibility
            </h2>
            <p>
              revasy utilizes artificial intelligence models to synthesize polite, helpful, and personalized review responses based on the rating and text provided by customers. While our AI is tuned for hospitality and accuracy:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                You are responsible for the overall conduct and public communication of your business profile.
              </li>
              <li>
                revasy provides configuration options (including tone, star rating thresholds, and signatures) to ensure replies align with your business standards.
              </li>
              <li>
                You may edit or remove any published reply directly via the Google Maps or Google Business Profile manager at any time.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              5. Acceptable Use Policy
            </h2>
            <p>
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Generate deceptive, abusive, defamatory, or fraudulent content.</li>
              <li>Violate any local, state, national, or international consumer protection or privacy law.</li>
              <li>Attempt to reverse-engineer, exploit, or disrupt the Service infrastructure or third-party APIs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, revasy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, goodwill, or business interruption arising from the use of or inability to use the Service or changes implemented by third-party platforms such as Google.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              7. Termination
            </h2>
            <p>
              Either party may terminate this agreement at any time. You may cancel your subscription and disconnect your integrations through your account settings. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              8. Contact &amp; Inquiries
            </h2>
            <p>
              For legal inquiries or questions regarding these Terms, please contact us:
            </p>
            <div className="p-4 bg-white rounded-xl border border-hairline space-y-1 text-xs sm:text-sm">
              <p><strong>revasy Legal &amp; Support Team</strong></p>
              <p>For any query: <a href="mailto:widoxstudio@gmail.com" className="text-primary hover:underline font-semibold">widoxstudio@gmail.com</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline py-6 px-4 text-center text-xs text-muted">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms" className="hover:text-ink font-semibold">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

