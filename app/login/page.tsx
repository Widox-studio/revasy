"use client";

import React from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display font-bold text-3xl tracking-[-0.04em] text-ink group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <img src="/revasy-logo.png" alt="revasy logo" className="w-full h-full object-contain" />
            </div>
            <span>revasy</span>
          </Link>
          <h1 className="font-display font-medium text-xl text-ink">
            Merchant &amp; Client Portal
          </h1>
          <p className="text-xs text-muted max-w-xs mx-auto">
            Sign in to access your verified Google Place ID, NFC smart stand kits, and AI review assistant.
          </p>
        </div>

        {/* Official Clerk Universal Authentication */}
        <div className="w-full flex justify-center">
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/dashboard"
            signUpUrl="/login"
            appearance={{
              elements: {
                rootBox: "w-full flex justify-center",
                card: "shadow-card border border-hairline rounded-3xl w-full bg-white",
                headerTitle: "text-ink font-display font-semibold text-lg",
                headerSubtitle: "text-muted text-xs",
                socialButtonsBlockButton:
                  "rounded-xl border border-hairline hover:bg-slate-50 transition-colors text-xs font-semibold py-2.5",
                formButtonPrimary:
                  "bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-xs font-semibold shadow-revasy py-2.5",
                footerActionLink: "text-primary hover:underline font-semibold text-xs",
              },
            }}
          />
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-2 text-xs text-muted pt-4">
          <div>
            <Link href="/" className="font-medium hover:text-ink transition-colors">
              ← Return to revasy Home
            </Link>
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-soft pt-1">
            <Link href="/privacy" className="hover:text-ink underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-ink underline">
              Terms of Service
            </Link>
          </div>
          <p className="text-[11px] text-muted-soft">
            Made and maintained by{" "}
            <a
              href="https://widox.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary hover:text-indigo-700 hover:underline transition-colors"
            >
              widox
            </a>{" "}
            • widoxstudio@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
