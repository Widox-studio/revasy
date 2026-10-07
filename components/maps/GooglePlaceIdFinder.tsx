"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  Compass,
  Building,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlaceResult {
  name: string;
  placeId?: string;
  address: string;
  category?: string;
  embedMapUrl: string;
  googleReviewUrl: string;
  isExactPlaceId: boolean;
}

interface GooglePlaceIdFinderProps {
  currentUrl: string;
  onSelect: (data: {
    googleReviewUrl: string;
    placeId?: string;
    businessName?: string;
    address?: string;
    category?: string;
  }) => void;
  initialBusinessName?: string;
  className?: string;
}

export function GooglePlaceIdFinder({
  currentUrl,
  onSelect,
  initialBusinessName = "",
  className = "",
}: GooglePlaceIdFinderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "placeid">("search");
  const [searchQuery, setSearchQuery] = useState(initialBusinessName || "Cocova Cafe");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  // Manual Place ID state
  const [manualPlaceId, setManualPlaceId] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [directPinInput, setDirectPinInput] = useState("");
  const [isExtractingPin, setIsExtractingPin] = useState(false);

  // Sync initial search query when initialBusinessName changes
  useEffect(() => {
    if (initialBusinessName && initialBusinessName.trim().length > 0) {
      setSearchQuery(initialBusinessName);
    }
  }, [initialBusinessName]);

  // Execute Search
  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q || q.length < 2) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setSelectedPlace(data.results[0]);
      } else {
        // Fallback default result - uses official Google Maps Search URL
        const fallback: PlaceResult = {
          name: q,
          address: `Google Maps Pin: ${q}`,
          embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
          googleReviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
          isExactPlaceId: false,
        };
        setResults([fallback]);
        setSelectedPlace(fallback);
      }
    } catch (err) {
      console.error("Failed to search places:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Direct Pin Link / Place ID Extraction
  const handleExtractPin = async (inputVal: string) => {
    const val = inputVal.trim();
    if (!val) return;
    setIsExtractingPin(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const match = data.results[0];
        setResults((prev) => [match, ...prev.filter((r) => r.googleReviewUrl !== match.googleReviewUrl)]);
        setSelectedPlace(match);
        setDirectPinInput("");
      }
    } catch (e) {
      console.error("Failed to extract pin:", e);
    } finally {
      setIsExtractingPin(false);
    }
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    const q = searchQuery.trim() || initialBusinessName.trim() || "Cocova Cafe";
    handleSearch(q);
  };

  const handleApplySelected = () => {
    if (!selectedPlace) return;

    onSelect({
      googleReviewUrl: selectedPlace.googleReviewUrl,
      placeId: selectedPlace.placeId,
      businessName: selectedPlace.name,
      address: selectedPlace.address,
      category: selectedPlace.category,
    });
    setIsOpen(false);
  };

  const handleApplyManualPlaceId = () => {
    const pid = manualPlaceId.trim();
    if (!pid) return;

    const generatedUrl = `https://search.google.com/local/writereview?placeid=${pid}`;
    onSelect({
      googleReviewUrl: generatedUrl,
      placeId: pid,
      businessName: initialBusinessName,
    });
    setIsOpen(false);
  };

  return (
    <div className={className}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal text-white hover:bg-[#254d4d] text-xs font-semibold shadow-sm transition-all"
        title="Find on Google Maps and extract Place ID"
      >
        <MapPin className="w-3.5 h-3.5 text-brand-pink" />
        <span>Search Map &amp; Get Place ID</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-hairline shadow-floating flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-surface-card/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-pink/15 text-brand-pink flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-ink">
                    Google Maps &amp; Place ID Finder
                  </h3>
                  <p className="text-[11px] text-muted">
                    Search your business pin on Google Maps or paste your Place ID directly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-muted hover:text-ink hover:bg-surface-soft transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="px-6 pt-3 pb-2 border-b border-hairline flex items-center gap-3 bg-white">
              <button
                type="button"
                onClick={() => setActiveTab("search")}
                className={`text-xs font-semibold pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "search"
                    ? "border-brand-pink text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Method 1: Search &amp; Pin on Map</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("placeid")}
                className={`text-xs font-semibold pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "placeid"
                    ? "border-brand-pink text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-ochre" />
                <span>Method 2: Google Place ID Tool</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeTab === "search" ? (
                <>
                  {/* Search Input Bar */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearch(searchQuery);
                          }
                        }}
                        placeholder="Search business name, city, or address (e.g. Cocova Cafe Bangalore)..."
                        className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal text-ink bg-surface-soft/40"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSearch(searchQuery)}
                      disabled={isSearching}
                      className="press px-4 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 shrink-0"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>

                  {/* Embedded Google Map Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="font-semibold text-ink flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-brand-teal" />
                        Live Map Pin Preview:
                      </span>
                      <a
                        href={
                          selectedPlace?.googleReviewUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-teal hover:underline font-semibold"
                        title="Open this business pin on Google Maps in a new tab"
                      >
                        <span>Open Pin in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-hairline shadow-subtle bg-surface-card relative">
                      {selectedPlace?.embedMapUrl ? (
                        <iframe
                          title="Google Maps Pin Preview"
                          src={selectedPlace.embedMapUrl}
                          className="w-full h-full border-0"
                          loading="lazy"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                          Search for a business above to preview map pin
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Pin Link / Place ID Quick Paste Bar */}
                  <div className="bg-surface-soft/60 border border-hairline p-3 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                        <span>Have the exact Google Maps Link or Pin?</span>
                      </span>
                      <span className="text-[10px] text-muted">Auto-extracts Place ID &amp; Pin Name</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={directPinInput}
                        onChange={(e) => setDirectPinInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleExtractPin(directPinInput);
                          }
                        }}
                        placeholder="Paste link from Google Maps (e.g. maps.app.goo.gl/... or /maps/place/... or Place ID)"
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-hairline bg-white text-ink focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      />
                      <button
                        type="button"
                        onClick={() => handleExtractPin(directPinInput)}
                        disabled={isExtractingPin || !directPinInput.trim()}
                        className="press px-3.5 py-2 bg-brand-teal text-white rounded-xl text-xs font-semibold hover:bg-[#254d4d] disabled:opacity-50 shrink-0"
                      >
                        {isExtractingPin ? "Applying..." : "Apply Pin"}
                      </button>
                    </div>
                  </div>

                  {/* Search Results List */}
                  {results.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                        Matching Places ({results.length}):
                      </span>

                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {results.map((res, idx) => {
                          const isSelected = selectedPlace?.name === res.name && selectedPlace?.address === res.address;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedPlace(res)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                isSelected
                                  ? "bg-brand-pink/5 border-brand-pink shadow-subtle"
                                  : "bg-surface-card/40 border-hairline hover:bg-surface-soft"
                              }`}
                            >
                              <div className="space-y-0.5 text-left min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-ink truncate">
                                    {res.name}
                                  </span>
                                  {res.isExactPlaceId && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                      Place ID Verified
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted truncate">
                                  {res.address}
                                </p>
                              </div>

                              <div className="shrink-0 flex items-center pt-0.5">
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4 text-brand-pink" />
                                ) : (
                                  <span className="text-[10px] font-semibold text-muted bg-white px-2 py-0.5 rounded-pill border border-hairline">
                                    Pin on Map
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Tab 2: Method 2 Google Place ID Tool */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span>Official Google Place ID Finder Tool (Method 2)</span>
                    </div>
                    <p className="leading-relaxed">
                      Google provides an official developer tool that lets you search any registered place and reveals its unique Place ID (starts with <code>ChIJ...</code>).
                    </p>
                    <a
                      href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <span>Open Google Place ID Finder Tool</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Paste Your Google Place ID (e.g. ChIJ...):
                    </label>
                    <input
                      type="text"
                      value={manualPlaceId}
                      onChange={(e) => setManualPlaceId(e.target.value.trim())}
                      placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal text-ink bg-surface-soft/40"
                    />
                    <p className="text-[11px] text-muted-soft">
                      Entering your Place ID will automatically construct:
                      <br />
                      <code className="text-brand-teal font-mono">
                        https://search.google.com/local/writereview?placeid={manualPlaceId || "YOUR_PLACE_ID"}
                      </code>
                    </p>
                  </div>

                  {manualPlaceId && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleApplyManualPlaceId}
                      className="w-full !rounded-xl"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      <span>Apply Place ID Review URL</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer / Selected Confirmation */}
            {activeTab === "search" && (
              <div className="px-6 py-4 border-t border-hairline bg-surface-card/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
                      Selected Destination:
                    </span>
                    {selectedPlace?.isExactPlaceId ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        ✓ Exact Pin / Place ID
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white text-muted border border-hairline">
                        Google Maps Pin
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-ink truncate block">
                    {selectedPlace?.name || "No business selected"}
                  </span>
                  <span className="text-[10px] text-muted-soft truncate block font-mono">
                    {selectedPlace?.googleReviewUrl || ""}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink transition-colors flex-1 sm:flex-initial"
                  >
                    Cancel
                  </button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleApplySelected}
                    disabled={!selectedPlace}
                    className="!rounded-xl shadow-revasy flex-1 sm:flex-initial"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    <span>Apply &amp; Set Review URL</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
