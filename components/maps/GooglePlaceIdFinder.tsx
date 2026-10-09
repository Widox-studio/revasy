"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  Key,
  ClipboardPaste,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GooglePlacesAutocompleteInput } from "./GooglePlacesAutocompleteInput";
import { encodeGooglePlaceIdFromHex } from "@/lib/google-place-id";

interface PlaceResult {
  name: string;
  placeId?: string;
  address: string;
  category?: string;
  lat?: number;
  lng?: number;
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

/**
 * Client-side fast parser for Google Maps links, Place IDs, and CIDs
 */
function parseClientMapsInput(input: string): {
  placeId?: string;
  googleReviewUrl?: string;
  name?: string;
  isExact: boolean;
} | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. Direct ChIJ Place ID check
  const chijMatch = trimmed.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  if (chijMatch) {
    const pid = chijMatch[0];
    return {
      placeId: pid,
      googleReviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
      name: "Verified Google Place",
      isExact: true,
    };
  }

  // 2. Direct writereview URL
  if (trimmed.includes("search.google.com/local/writereview")) {
    const pid = trimmed.match(/placeid=([a-zA-Z0-9_-]+)/);
    if (pid && pid[1]) {
      return {
        placeId: pid[1],
        googleReviewUrl: `https://search.google.com/local/writereview?placeid=${pid[1]}`,
        name: "Verified Google Place",
        isExact: true,
      };
    }
  }

  // 3. /maps/place/ with hex cell + CID (!1s0x<cellHex>:0x<cidHex>)
  if (trimmed.includes("/maps/place/")) {
    const nameMatch = trimmed.match(/\/maps\/place\/([^/@?#]+)/);
    const placeName = nameMatch
      ? decodeURIComponent(nameMatch[1].replace(/\+/g, " "))
      : "Google Place";
    const hexMatch = trimmed.match(/1s(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
    if (hexMatch && hexMatch[1] && hexMatch[2]) {
      const pid = encodeGooglePlaceIdFromHex(hexMatch[1], hexMatch[2]);
      if (pid) {
        return {
          placeId: pid,
          googleReviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
          name: placeName,
          isExact: true,
        };
      }
    }
  }

  // 4. cid=
  if (trimmed.includes("cid=")) {
    const cidMatch = trimmed.match(/cid=([0-9]+)/);
    if (cidMatch && cidMatch[1]) {
      return {
        placeId: cidMatch[1],
        googleReviewUrl: `https://maps.google.com/?cid=${cidMatch[1]}`,
        name: "Google Business Pin",
        isExact: true,
      };
    }
  }

  return null;
}

/**
 * Helper to dynamically load Google Maps JavaScript API with Places library
 */
function loadGoogleMapsScript(apiKey: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  // @ts-ignore
  if (window.google?.maps?.places) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.getElementById("google-maps-api-script");
    if (existing) {
      // @ts-ignore
      if (window.google?.maps?.places) return resolve(true);
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-api-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
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

  // Method 2 (Place ID Tool) state
  const [manualInput, setManualInput] = useState("");
  const [resolvedPlaceId, setResolvedPlaceId] = useState("");
  const [resolvedReviewUrl, setResolvedReviewUrl] = useState("");
  const [isResolvingPlaceId, setIsResolvingPlaceId] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Direct Pin Link quick bar in Method 1
  const [directPinInput, setDirectPinInput] = useState("");
  const [isExtractingPin, setIsExtractingPin] = useState(false);

  // Optional API key settings
  const [showApiKeySetting, setShowApiKeySetting] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [isMapsApiReady, setIsMapsApiReady] = useState(false);

  // Autocomplete input refs
  const method1InputRef = useRef<HTMLInputElement | null>(null);
  const method2InputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial search query when initialBusinessName changes
  useEffect(() => {
    if (initialBusinessName && initialBusinessName.trim().length > 0) {
      setSearchQuery(initialBusinessName);
    }
  }, [initialBusinessName]);

  // Read stored API key and try loading Google Maps JS API if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey =
        localStorage.getItem("revasy_google_maps_api_key") ||
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
        "";
      if (storedKey) {
        setCustomApiKey(storedKey);
        loadGoogleMapsScript(storedKey).then((loaded) => {
          setIsMapsApiReady(loaded);
        });
      }
    }
  }, []);

  // Parse initial currentUrl when modal opens
  useEffect(() => {
    if (isOpen && currentUrl) {
      const parsed = parseClientMapsInput(currentUrl);
      if (parsed && parsed.placeId && parsed.googleReviewUrl) {
        setResolvedPlaceId(parsed.placeId);
        setResolvedReviewUrl(parsed.googleReviewUrl);
        setManualInput(parsed.placeId);
      }
    }
  }, [isOpen, currentUrl]);

  // Attach Google Maps Places Autocomplete to Method 1 input if API is ready
  useEffect(() => {
    // @ts-ignore
    if (isMapsApiReady && window.google?.maps?.places && method1InputRef.current) {
      try {
        // @ts-ignore
        const autocomplete = new window.google.maps.places.Autocomplete(
          method1InputRef.current,
          { fields: ["place_id", "name", "formatted_address", "geometry"] }
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place && place.place_id) {
            const lat = place.geometry?.location?.lat ? place.geometry.location.lat() : undefined;
            const lng = place.geometry?.location?.lng ? place.geometry.location.lng() : undefined;
            const placeObj: PlaceResult = {
              name: place.name || searchQuery,
              placeId: place.place_id,
              address: place.formatted_address || place.name || "",
              lat,
              lng,
              embedMapUrl: `https://maps.google.com/maps?q=place_id:${place.place_id}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
              googleReviewUrl: `https://search.google.com/local/writereview?placeid=${place.place_id}`,
              isExactPlaceId: true,
            };
            setResults((prev) => [placeObj, ...prev]);
            setSelectedPlace(placeObj);
            setSearchQuery(place.name || searchQuery);
          }
        });
      } catch (e) {
        console.warn("Failed to attach Places Autocomplete:", e);
      }
    }
  }, [isMapsApiReady, isOpen, activeTab]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // Execute Search in Method 1
  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q || q.length < 2) return;

    // Check if input is already a direct link or Place ID
    const fastParsed = parseClientMapsInput(q);
    if (fastParsed && fastParsed.isExact) {
      const match: PlaceResult = {
        name: fastParsed.name || q,
        placeId: fastParsed.placeId,
        address: `Official Google Place: ${fastParsed.placeId}`,
        embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
          fastParsed.placeId || q
        )}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
        googleReviewUrl: fastParsed.googleReviewUrl!,
        isExactPlaceId: true,
      };
      setResults([match]);
      setSelectedPlace(match);
      return;
    }

    setIsSearching(true);
    try {
      const storedKey =
        typeof window !== "undefined"
          ? localStorage.getItem("revasy_google_maps_api_key") || ""
          : "";
      const keyParam = storedKey ? `&key=${encodeURIComponent(storedKey)}` : "";
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}${keyParam}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setSelectedPlace(data.results[0]);
      } else {
        // Fallback search query preview (flagged as non-exact so user cannot save a broken search query)
        const fallback: PlaceResult = {
          name: q,
          address: `Search Query Preview: "${q}"`,
          embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
            q
          )}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
          googleReviewUrl: `https://maps.google.com/?q=${encodeURIComponent(q)}`,
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

  // Direct Pin Link / Place ID Extraction in Method 1
  const handleExtractPin = async (inputVal: string) => {
    const val = inputVal.trim();
    if (!val) return;

    // Fast client check
    const fastParsed = parseClientMapsInput(val);
    if (fastParsed && fastParsed.isExact) {
      const match: PlaceResult = {
        name: fastParsed.name || "Verified Google Business",
        placeId: fastParsed.placeId,
        address: `Exact Google Place Identifier: ${fastParsed.placeId}`,
        embedMapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
          fastParsed.placeId || val
        )}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
        googleReviewUrl: fastParsed.googleReviewUrl!,
        isExactPlaceId: true,
      };
      setResults((prev) => [match, ...prev]);
      setSelectedPlace(match);
      setDirectPinInput("");
      return;
    }

    setIsExtractingPin(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const match = data.results[0];
        setResults((prev) => [
          match,
          ...prev.filter((r) => r.googleReviewUrl !== match.googleReviewUrl),
        ]);
        setSelectedPlace(match);
        setDirectPinInput("");
      }
    } catch (e) {
      console.error("Failed to extract pin:", e);
    } finally {
      setIsExtractingPin(false);
    }
  };

  // Clipboard paste helper for Method 1
  const handlePasteFromClipboardMethod1 = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setDirectPinInput(text.trim());
          handleExtractPin(text.trim());
        }
      }
    } catch (err) {
      console.warn("Clipboard access denied:", err);
    }
  };

  // Clipboard paste helper for Method 2
  const handlePasteFromClipboardMethod2 = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setManualInput(text.trim());
          handleResolveManualInput(text.trim());
        }
      }
    } catch (err) {
      console.warn("Clipboard access denied:", err);
    }
  };

  // Handle parsing / resolving in Method 2
  const handleResolveManualInput = async (inputVal: string) => {
    const val = inputVal.trim();
    if (!val) return;

    // Fast client check
    const fastParsed = parseClientMapsInput(val);
    if (fastParsed && fastParsed.isExact) {
      if (fastParsed.placeId) setResolvedPlaceId(fastParsed.placeId);
      if (fastParsed.googleReviewUrl) setResolvedReviewUrl(fastParsed.googleReviewUrl);
      return;
    }

    setIsResolvingPlaceId(true);
    try {
      const storedKey =
        typeof window !== "undefined"
          ? localStorage.getItem("revasy_google_maps_api_key") || ""
          : "";
      const keyParam = storedKey ? `&key=${encodeURIComponent(storedKey)}` : "";
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(val)}${keyParam}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const match = data.results[0];
        if (match.placeId && match.isExactPlaceId) {
          setResolvedPlaceId(match.placeId);
          setResolvedReviewUrl(match.googleReviewUrl);
        } else if (match.googleReviewUrl && match.isExactPlaceId) {
          setResolvedReviewUrl(match.googleReviewUrl);
          if (match.placeId) setResolvedPlaceId(match.placeId);
        }
      }
    } catch (e) {
      console.error("Error resolving input in Method 2:", e);
    } finally {
      setIsResolvingPlaceId(false);
    }
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    const q = searchQuery.trim() || initialBusinessName.trim() || "Cocova Cafe";
    handleSearch(q);
  };

  // Apply selected place from Method 1
  const handleApplySelected = () => {
    if (!selectedPlace) return;

    // Safety guard: NEVER allow saving a generic search query
    if (!selectedPlace.isExactPlaceId) {
      // Guide the user directly to Method 2 to lock in the exact Place ID
      setActiveTab("placeid");
      setManualInput(selectedPlace.name || searchQuery);
      handleResolveManualInput(selectedPlace.name || searchQuery);
      return;
    }

    onSelect({
      googleReviewUrl: selectedPlace.googleReviewUrl,
      placeId: selectedPlace.placeId,
      businessName: selectedPlace.name,
      address: selectedPlace.address,
      category: selectedPlace.category,
    });
    setIsOpen(false);
  };

  // Apply resolved Place ID review URL from Method 2
  const handleApplyMethod2 = () => {
    const pid = resolvedPlaceId.trim();
    const url =
      resolvedReviewUrl.trim() ||
      (pid ? `https://search.google.com/local/writereview?placeid=${pid}` : "");
    if (!url) return;

    onSelect({
      googleReviewUrl: url,
      placeId: pid || undefined,
      businessName: initialBusinessName,
    });
    setIsOpen(false);
  };

  // Save custom Google Maps API Key
  const handleSaveApiKey = async () => {
    if (typeof window !== "undefined") {
      const key = customApiKey.trim();
      if (key) {
        localStorage.setItem("revasy_google_maps_api_key", key);
        const loaded = await loadGoogleMapsScript(key);
        setIsMapsApiReady(loaded);
      } else {
        localStorage.removeItem("revasy_google_maps_api_key");
        setIsMapsApiReady(false);
      }
      setShowApiKeySetting(false);
    }
  };

  return (
    <div className={className}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal text-white hover:bg-[#254d4d] text-xs font-semibold shadow-sm transition-all"
        title="Find on Google Maps and extract exact Place ID"
      >
        <MapPin className="w-3.5 h-3.5 text-brand-pink" />
        <span>Search Map &amp; Get Place ID</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-hairline shadow-floating flex flex-col max-h-[94vh] overflow-hidden">
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
                    Locate your exact business pin or retrieve your official Google Place ID for 1-click reviews.
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
            <div className="px-6 pt-3 pb-2 border-b border-hairline flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
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
                  onClick={() => {
                    setActiveTab("placeid");
                    if (!manualInput && searchQuery) {
                      setManualInput(searchQuery);
                    }
                  }}
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

              {/* Optional API Key Button */}
              <button
                type="button"
                onClick={() => setShowApiKeySetting(!showApiKeySetting)}
                className="text-[10px] text-muted hover:text-ink flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-surface-soft"
                title="Configure Google Maps Platform API Key"
              >
                <Key className="w-3 h-3 text-brand-teal" />
                <span>{isMapsApiReady ? "Maps API Active" : "API Key"}</span>
              </button>
            </div>

            {/* API Key Modal / Settings Drawer */}
            {showApiKeySetting && (
              <div className="px-6 py-3 bg-surface-soft/80 border-b border-hairline flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Google Maps Platform API Key (Optional)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowApiKeySetting(false)}
                    className="text-[11px] text-muted hover:text-ink"
                  >
                    Close
                  </button>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Provide your own Google Maps API Key to enable native real-time Places Autocomplete. Leave blank to use built-in search and the official Place ID Finder.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-hairline bg-white text-ink focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="press px-3 py-1.5 bg-brand-teal text-white rounded-xl text-xs font-semibold hover:bg-[#254d4d]"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeTab === "search" ? (
                <>
                  {/* Search Input Bar with Google Maps Autocomplete Dropdown */}
                  <div className="flex gap-2 items-start">
                    <GooglePlacesAutocompleteInput
                      value={searchQuery}
                      onChange={(val) => setSearchQuery(val)}
                      onSelectPlace={(place) => {
                        setSearchQuery(place.name);
                        setSelectedPlace(place);
                        setResults((prev) => [
                          place,
                          ...prev.filter((p) => p.googleReviewUrl !== place.googleReviewUrl),
                        ]);
                      }}
                      placeholder="Search business name, city, or address (e.g. Cocova Cafe Bardoli)..."
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleSearch(searchQuery)}
                      disabled={isSearching}
                      className="press px-4 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary-hover active:bg-indigo-800 disabled:opacity-50 shrink-0"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>

                  {/* Embedded Google Map Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-brand-teal" />
                          Live Map Pin Preview:
                        </span>
                        {selectedPlace?.isExactPlaceId && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Pinned Location Locked as Source of Truth
                          </span>
                        )}
                      </div>
                      <a
                        href={
                          selectedPlace?.placeId && selectedPlace.isExactPlaceId
                            ? (selectedPlace.placeId.startsWith("ChIJ")
                                ? `https://search.google.com/local/reviews?placeid=${selectedPlace.placeId}`
                                : `https://maps.google.com/?cid=${selectedPlace.placeId}`)
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                searchQuery
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-teal hover:underline font-semibold bg-brand-teal/5 px-2.5 py-1 rounded-lg border border-brand-teal/20"
                        title="Open exact pinned business on Google Maps"
                      >
                        <span>Open Pin in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="w-full h-52 sm:h-56 rounded-2xl overflow-hidden border border-hairline shadow-subtle bg-surface-card relative">
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
                  <div className="bg-surface-soft/60 border border-hairline p-3.5 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                        <span>Have the exact Google Maps Link or Pin?</span>
                      </span>
                      <span className="text-[10px] text-muted">Auto-extracts CID, Place ID &amp; Pin Name</span>
                    </div>

                    <p className="text-[11px] text-muted leading-relaxed">
                      1. Click <strong className="text-ink">Open Pin in Google Maps ↗</strong> above &rarr; 2. Click <strong className="text-ink">Share &gt; Copy link</strong> &rarr; 3. Paste here:
                    </p>

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
                        placeholder="Paste link from Google Maps (maps.app.goo.gl/... or /maps/place/... or Place ID)"
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-hairline bg-white text-ink focus:outline-none focus:ring-1 focus:ring-brand-teal font-mono"
                      />
                      <button
                        type="button"
                        onClick={handlePasteFromClipboardMethod1}
                        className="press px-3 py-2 bg-white hover:bg-surface-card text-ink rounded-xl text-xs font-semibold border border-hairline flex items-center gap-1 shrink-0"
                        title="Paste from clipboard"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-muted" />
                        <span className="hidden sm:inline">Paste</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExtractPin(directPinInput)}
                        disabled={isExtractingPin || !directPinInput.trim()}
                        className="press px-3.5 py-2 bg-brand-teal text-white rounded-xl text-xs font-semibold hover:bg-brand-teal/90 disabled:opacity-50 shrink-0"
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
                          const isSelected =
                            selectedPlace?.name === res.name &&
                            selectedPlace?.address === res.address;
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
                                  {res.isExactPlaceId ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                      Exact Place Verified
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                      Query Pin (Needs Place ID)
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
                                    Select
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Banner if selected place is not yet an exact place */}
                  {selectedPlace && !selectedPlace.isExactPlaceId && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2.5 text-xs text-amber-900 shadow-sm animate-fadeIn">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Action Required: Lock in Exact Place (Not a Search Query)</span>
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        A search query link like <code>"{selectedPlace.name}"</code> will show customers a search list of multiple matching places instead of opening your review box directly. To wire reviews directly to this exact place:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("placeid");
                            setManualInput(selectedPlace.name || searchQuery);
                            handleResolveManualInput(selectedPlace.name || searchQuery);
                          }}
                          className="press px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>Get Place ID via Method 2 &rarr;</span>
                        </button>
                        <button
                          type="button"
                          onClick={handlePasteFromClipboardMethod1}
                          className="press px-3.5 py-2.5 bg-white hover:bg-surface-soft text-amber-900 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-amber-300 shadow-sm"
                        >
                          <ClipboardPaste className="w-3.5 h-3.5 text-amber-700" />
                          <span>Paste Copied Maps Link</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Tab 2: Method 2 Google Place ID Tool */
                <div className="space-y-4">
                  {/* Instructions banner */}
                  <div className="bg-brand-teal/5 border border-brand-teal/20 p-3.5 rounded-2xl text-xs text-ink space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-brand-teal">
                      <Sparkles className="w-4 h-4 text-brand-ochre" />
                      <span>Official Google Place ID Finder &amp; Review Link Generator</span>
                    </div>
                    <p className="text-muted leading-relaxed text-[11px]">
                      Search any registered business in the live Google Place ID Finder widget below to extract its unique Place ID (starts with <code>ChIJ...</code>) and automatically generate your official 5-star Google review link.
                    </p>
                  </div>

                  {/* Live Embedded Official Google Place ID Finder Widget */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="font-semibold text-ink flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-brand-teal" />
                        Interactive Google Place ID Finder Widget:
                      </span>
                      <span className="text-[10px] text-muted">Powered by Google Maps Platform</span>
                    </div>

                    <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-hairline shadow-subtle bg-surface-card relative">
                      <iframe
                        title="Official Google Place ID Finder"
                        src="https://maps-docs-team.web.app/samples/places-placeid-finder/dist/"
                        className="w-full h-full border-0"
                        loading="lazy"
                        allow="geolocation"
                      />
                    </div>
                  </div>

                  {/* Direct Place ID / Google Maps Link Resolver Bar */}
                  <div className="bg-surface-soft/60 border border-hairline p-4 rounded-2xl space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Paste Place ID or Business Maps Link:
                      </label>
                      <div className="flex gap-2">
                        <input
                          ref={method2InputRef}
                          type="text"
                          value={manualInput}
                          onChange={(e) => {
                            setManualInput(e.target.value);
                            handleResolveManualInput(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleResolveManualInput(manualInput);
                            }
                          }}
                          placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4 or paste maps.app.goo.gl link..."
                          className="flex-1 text-xs sm:text-sm p-2.5 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal text-ink bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={handlePasteFromClipboardMethod2}
                          className="press px-3 py-2 bg-white hover:bg-surface-card text-ink rounded-xl text-xs font-semibold border border-hairline flex items-center gap-1 shrink-0"
                          title="Paste from clipboard"
                        >
                          <ClipboardPaste className="w-3.5 h-3.5 text-muted" />
                          <span className="hidden sm:inline">Paste</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveManualInput(manualInput)}
                          disabled={isResolvingPlaceId || !manualInput.trim()}
                          className="press px-4 py-2 bg-brand-teal text-white rounded-xl text-xs font-semibold hover:bg-[#254d4d] disabled:opacity-50 shrink-0"
                        >
                          {isResolvingPlaceId ? "Resolving..." : "Fetch"}
                        </button>
                      </div>
                    </div>

                    {/* Verified Place ID & Review URL Display Card */}
                    {(resolvedPlaceId || resolvedReviewUrl) && (
                      <div className="bg-white border border-emerald-200 p-3.5 rounded-xl space-y-2.5 shadow-subtle animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Official Google Review URL Generated
                          </span>
                          {resolvedPlaceId && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Place ID: {resolvedPlaceId}
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 bg-surface-soft/60 rounded-lg flex items-center justify-between gap-2">
                          <code className="text-xs text-brand-teal font-mono truncate flex-1 block">
                            {resolvedReviewUrl ||
                              `https://search.google.com/local/writereview?placeid=${resolvedPlaceId}`}
                          </code>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  resolvedReviewUrl ||
                                    `https://search.google.com/local/writereview?placeid=${resolvedPlaceId}`,
                                  "Review URL copied"
                                )
                              }
                              className="p-1 rounded text-muted hover:text-ink hover:bg-white transition-colors"
                              title="Copy URL"
                            >
                              {copyFeedback === "Review URL copied" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={
                                resolvedReviewUrl ||
                                `https://search.google.com/local/writereview?placeid=${resolvedPlaceId}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded text-muted hover:text-ink hover:bg-white transition-colors"
                              title="Test Review Link in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleApplyMethod2}
                          className="w-full !rounded-xl shadow-revasy"
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          <span>Apply Place ID Review URL</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Selected Confirmation (for Tab 1) */}
            {activeTab === "search" && (
              <div className="px-6 py-4 border-t border-hairline bg-surface-card/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
                      Selected Destination:
                    </span>
                    {selectedPlace?.isExactPlaceId ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Exact Place Locked (Source of Truth)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Query Search (Place ID Needed)
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-ink truncate block">
                    {selectedPlace?.name || "No business selected"}
                  </span>
                  {selectedPlace?.address && (
                    <span className="text-[10px] text-muted truncate block">
                      {selectedPlace.address}
                    </span>
                  )}
                  {selectedPlace?.isExactPlaceId ? (
                    <span className="text-[10px] text-brand-teal truncate block font-mono">
                      {selectedPlace.googleReviewUrl}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 truncate block">
                      Search queries show multiple places to customers. Lock exact Place ID before applying.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink transition-colors flex-1 sm:flex-initial"
                  >
                    Cancel
                  </button>

                  {selectedPlace?.isExactPlaceId ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleApplySelected}
                      className="!rounded-xl shadow-revasy flex-1 sm:flex-initial"
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      <span>Apply Pinned Location &amp; Review URL</span>
                    </Button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("placeid");
                        setManualInput(selectedPlace?.name || searchQuery);
                        handleResolveManualInput(selectedPlace?.name || searchQuery);
                      }}
                      className="press px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Get Exact Place ID &rarr;</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
