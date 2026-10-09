"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to log in as administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 relative overflow-hidden">
      {/* Background radial subtle accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden shadow-revasy mb-4">
            <img src="/revasy-logo.png" alt="revasy logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            revasy Ops Console
          </h1>
          <p className="mt-2 text-sm text-muted">
            White-Glove Business Provisioning & Fleet Command
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-hairline shadow-card p-6 sm:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 text-sm text-rose-800">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Authentication Failed</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Super-Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@revasy.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline bg-slate-50/50 text-sm text-ink placeholder:text-muted-soft focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline bg-slate-50/50 text-sm text-ink placeholder:text-muted-soft focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="revasy"
              isLoading={loading}
              className="w-full py-2.5 text-sm font-semibold mt-2"
            >
              Sign In to Ops Hub
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        </div>

        {/* Security Notice & Merchant Portal Link */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-muted-soft">
            Restricted to authorized revasy operators.
          </p>
          <p className="text-xs text-muted">
            Merchant tenant? Sign in via Clerk at the{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-semibold"
            >
              Customer Portal
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
