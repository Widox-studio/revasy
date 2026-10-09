"use client";

import React, { useState } from "react";
import { Coffee, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { config } from "@/lib/config";

interface AdminHeaderProps {
  adminEmail?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ adminEmail }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-canvas/90 backdrop-blur-md text-ink border-b border-hairline sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-base tracking-tight text-ink">
                {config.cafe.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                <ShieldCheck className="w-3 h-3" />
                Owner Portal
              </span>
            </div>
            <p className="text-[11px] text-muted hidden sm:block">
              AI Google Review Reply Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {adminEmail && (
            <span className="text-xs text-muted hidden md:inline-block">
              {adminEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink bg-surface-card hover:bg-surface-strong rounded-xl transition-colors border border-hairline"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? "Exiting..." : "Log out"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
