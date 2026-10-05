"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { config } from "@/lib/config";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Check your credentials.");
      }

      // Successful login
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-b from-cafe-100/60 via-crema to-cafe-50">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-espresso text-cream flex items-center justify-center shadow-card border border-espresso-light mb-2">
            <Coffee className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-espresso tracking-tight">
            {config.cafe.name} Owner Portal
          </h1>
          <p className="text-xs text-espresso-muted">
            Sign in to access the AI Google Review Reply Generator
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cafe-200 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-espresso-muted"
              >
                Owner Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-espresso-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@cocovacafe.com"
                  required
                  className="w-full text-sm text-espresso pl-10 pr-3.5 py-3 rounded-xl border border-cafe-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-cafe-50/40"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-espresso-muted"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-espresso-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full text-sm text-espresso pl-10 pr-3.5 py-3 rounded-xl border border-cafe-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-cafe-50/40"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-base font-semibold shadow-md"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Quick Credential Hint for Local Testing */}
          <div className="mt-5 pt-4 border-t border-cafe-100 flex items-start gap-2 text-[11px] text-espresso-muted bg-cafe-50/80 p-3 rounded-xl border">
            <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-espresso">Owner Authentication:</p>
              <p>Default credentials configured via <code className="bg-cafe-200/60 px-1 py-0.5 rounded">.env.local</code></p>
              <p className="mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("owner@cocovacafe.com");
                    setPassword("CocovaSecure2026!");
                  }}
                  className="text-amber-800 underline hover:text-amber-900 font-medium"
                >
                  Auto-fill demo credentials
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-medium text-espresso-muted hover:text-espresso transition-colors"
          >
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
