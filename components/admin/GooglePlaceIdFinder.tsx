"use client";

import React, { useState } from "react";
import {
  Search,
  Check,
  Copy,
  AlertCircle,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GooglePlaceIdFinderProps {
  onSelectReviewUrl: (url: string, placeId?: string) => void;
  initialUrl?: string;
}

export const GooglePlaceIdFinder: React.FC<GooglePlaceIdFinderProps> = ({
  onSelectReviewUrl,
  initialUrl = "",
}) => {
  const [inputVal, setInputVal] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    placeId?: string;
    googleReviewUrl: string;
    embedMapUrl?: string;
    address?: string;
    name?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResolve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a Google Maps link or Place ID.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok || !data.results || data.results.length === 0) {
        throw new Error(data.error || "Could not resolve Google Place details. Try searching by business name.");
      }

      const match = data.results[0];
      setExtractedData(match);
      onSelectReviewUrl(match.googleReviewUrl, match.placeId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to extract Place ID";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!extractedData?.googleReviewUrl) return;
    navigator.clipboard.writeText(extractedData.googleReviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-2xl bg-surface-card border border-hairline p-5 shadow-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-teal" />
            <h4 className="font-display font-semibold text-sm text-ink">
              Direct Google Maps Link or Place ID Extractor
            </h4>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Paste any Google Maps link, share URL (<code className="bg-surface-soft px-1 rounded">maps.app.goo.gl</code>), or Place ID (<code className="bg-surface-soft px-1 rounded">ChIJ...</code>).
          </p>
        </div>
      </div>

      <form onSubmit={handleResolve} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. https://maps.app.goo.gl/... or ChIJN1t_tDeuEmsRUsoyG83frY4"
            className="flex-1 text-sm text-ink px-3.5 py-2.5 rounded-xl border border-hairline bg-surface-soft/40 focus:outline-none focus:ring-2 focus:ring-brand-teal placeholder:text-muted/60"
          />
          <Button
            type="submit"
            variant="secondary"
            size="md"
            isLoading={isLoading}
            className="whitespace-nowrap font-medium"
          >
            <Search className="w-4 h-4 mr-1 text-muted" />
            <span>Extract &amp; Verify</span>
          </Button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {extractedData && (
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Google Place ID Verified</span>
            </span>

            {extractedData.placeId && (
              <span className="text-[11px] font-mono text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {extractedData.placeId}
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-semibold text-emerald-950">
              Official 1-Click Review URL:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={extractedData.googleReviewUrl}
                className="flex-1 bg-white border border-emerald-200 text-ink text-xs p-2 rounded-lg font-mono select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="press p-2 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100/50 transition-colors"
                title="Copy URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
