"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Building2, 
  PlusCircle, 
  ExternalLink, 
  LogOut, 
  ShieldCheck,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AdminNavProps {
  userEmail?: string;
}

export function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isFleetActive = pathname === "/admin";
  const isOnboardActive = pathname === "/admin/businesses/new";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-xs transition-transform group-hover:scale-105">
              <img src="/revasy-logo.png" alt="revasy logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-ink">
                revasy
              </span>
              <Badge variant="brand" size="sm" className="font-semibold tracking-wider">
                ADMIN
              </Badge>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isFleetActive
                  ? "bg-slate-100 text-ink font-semibold"
                  : "text-muted hover:text-ink hover:bg-slate-50"
              }`}
            >
              <Layers className="h-4 w-4" />
              Fleet Overview
            </Link>
            <Link
              href="/admin/businesses/new"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isOnboardActive
                  ? "bg-indigo-50 text-primary font-semibold"
                  : "text-muted hover:text-ink hover:bg-slate-50"
              }`}
            >
              <PlusCircle className="h-4 w-4 text-primary" />
              Onboard Business
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Merchant Customer Portal Link */}
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
            title="Open Merchant Customer Dashboard"
          >
            <span>Customer Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          {/* Super Admin Badge & Email */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-hairline">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-muted font-medium truncate max-w-[160px]">
              {userEmail || "Super Admin"}
            </span>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-muted hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
