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
    <header className="bg-espresso text-cream border-b border-espresso-light sticky top-0 z-30 shadow-subtle">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base tracking-wide text-cream">
                {config.cafe.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3 h-3" />
                Owner Portal
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              AI Google Review Reply Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {adminEmail && (
            <span className="text-xs text-stone-400 hidden md:inline-block">
              {adminEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700"
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
