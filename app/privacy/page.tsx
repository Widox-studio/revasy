import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, CheckCircle2, Globe, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | revasy",
  description:
    "Privacy Policy for revasy. Explains how we collect, use, and protect your information, including Google Business Profile integration and Google API Limited Use compliance.",
};

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Official Policy Documentation</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Last Updated: October 9, 2026 • Effective Date: October 9, 2026
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              1. Introduction &amp; Overview
            </h2>
            <p>
              Welcome to <strong>revasy</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). revasy provides contactless NFC/QR guest feedback tools and autonomous artificial intelligence review reply services for hospitality and local businesses.
            </p>
            <p>
              This Privacy Policy explains how revasy collects, uses, stores, and discloses information when you visit our website, use our application, or connect your Google Business Profile account with our services. We take your privacy seriously and adhere strictly to data protection laws and third-party API platform requirements.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              2. Information We Collect
            </h2>
            <p>We collect information in the following categories:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong>Account &amp; Merchant Information:</strong> Email address, business name, category, physical location address, contact information, and account authentication details.
              </li>
              <li>
                <strong>Guest Feedback Data:</strong> Ratings and feedback notes submitted by customers via your contactless NFC/QR smart stands to generate Google review drafts.
              </li>
              <li>
                <strong>Google Account &amp; Google Business Profile Data:</strong> When you connect your business via Google OAuth 2.0, we request permission to access:
                <ul className="list-circle pl-5 mt-1 space-y-1 text-slate-500">
                  <li>Your basic profile information (email and name) to identify your merchant account.</li>
                  <li>Google Business Profile accounts and locations to associate your business profile.</li>
                  <li>Customer reviews published on your Google Business Profile to analyze feedback and compose owner responses.</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Section 3 - Google API Disclosure */}
          <section className="space-y-4 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Lock className="w-4 h-4 text-primary" />
              <span>3. Google API Services User Data Policy Compliance (Limited Use)</span>
            </div>
            <p className="text-slate-700">
              revasy&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-indigo-800 font-medium"
              >
                Google API Services User Data Policy
              </a>
              , including the <strong>Limited Use</strong> requirements.
            </p>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Purpose Limitation:</strong> We only access Google Business Profile reviews to generate and publish business-owner replies on your behalf when authorized.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Human Reading of Sensitive Tokens:</strong> OAuth access tokens are encrypted in transit and at rest. Human staff cannot view your credentials.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Sale of Google Data:</strong> We do not sell, rent, or trade any customer reviews or Google Business data to third parties, data brokers, or advertising networks.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Generalized AI Model Training:</strong> Your business reviews and owner replies are not used to train generalized foundation AI models outside your explicit customer account context.
                </span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              4. How We Use Your Information
            </h2>
            <p>We use collected data to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Provide, maintain, and optimize the revasy platform and contactless review flows.</li>
              <li>Synthesize tailored, hospitality-grade review replies using our AI pipeline.</li>
              <li>Publish approved or automated owner replies to Google Maps on your behalf.</li>
              <li>Provide analytics on review velocity and customer sentiment.</li>
              <li>Communicate administrative notifications, technical updates, and customer support.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              5. Data Storage, Security &amp; Retention
            </h2>
            <p>
              We implement industry-standard cryptographic measures (HTTPS/TLS 1.3, AES-256 encryption at rest) to safeguard your data. OAuth refresh tokens are stored securely and used exclusively by backend workers to communicate with Google&apos;s APIs.
            </p>
            <p>
              We retain merchant data for as long as your account is active. If you delete your account or disconnect Google access, your OAuth tokens are purged from our database immediately.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              6. Revoking Google Access &amp; User Rights
            </h2>
            <p>
              You maintain total control over your Google Business Profile connection:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>One-Click Disconnect:</strong> You can disconnect your Google Business account at any time directly in your revasy Dashboard settings under the AI Auto-Reply tab.
              </li>
              <li>
                <strong>Google Account Permissions:</strong> You can also revoke access anytime through the{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-indigo-800"
                >
                  Google Security Permissions Console
                </a>
                .
              </li>
              <li>
                <strong>Right to Erasure:</strong> You may request complete deletion of your account and associated logs by contacting our privacy team.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              7. Contact Information
            </h2>
            <p>
              If you have any questions, inquiries, or requests regarding this Privacy Policy or our handling of Google user data, please contact us:
            </p>
            <div className="p-4 bg-white rounded-xl border border-hairline space-y-1 text-xs sm:text-sm">
              <p><strong>revasy Privacy &amp; Support Team</strong></p>
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
            <Link href="/privacy" className="hover:text-ink font-semibold">Privacy Policy</Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

