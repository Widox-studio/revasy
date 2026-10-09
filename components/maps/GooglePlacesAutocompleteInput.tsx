"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Search,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export interface PlaceResult {
  name: string;
  placeId?: string;
  address: string;
  category?: string;
  lat?: number;
  lng?: number;
  embedMapUrl: string;
  googleReviewUrl: string;
  isExactPlaceId: boolean;
  source?: string;
}

interface GooglePlacesAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectPlace: (place: PlaceResult) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function GooglePlacesAutocompleteInput({
  value,
  onChange,
  onSelectPlace,
  placeholder = "Search Google Maps (e.g. Cocova Cafe Bardoli)...",
  id,
  required = false,
  className = "",
  autoFocus = false,
  disabled = false,
}: GooglePlacesAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search when value changes
  const fetchSuggestions = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const storedKey =
        typeof window !== "undefined"
          ? localStorage.getItem("revasy_google_maps_api_key") || ""
          : "";
      const keyParam = storedKey ? `&key=${encodeURIComponent(storedKey)}` : "";
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}${keyParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) {
          setSuggestions(data.results);
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      }
    } catch (e) {
      console.warn("Autocomplete suggestions error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (newVal: string) => {
    onChange(newVal);
    setHighlightedIndex(-1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (newVal.trim().length >= 2) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(newVal);
      }, 280);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleSelect = (place: PlaceResult) => {
    onChange(place.name);
    onSelectPlace(place);
    setIsOpen(false);
    setSuggestions([]);
  };

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < suggestions.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input wrapper */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
          <Search className="w-4 h-4 text-brand-teal" />
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          required={required}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
            else if (value.trim().length >= 2) fetchSuggestions(value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full text-sm text-ink pl-10 pr-10 py-3 rounded-xl border border-hairline focus:outline-none focus:ring-2 focus:ring-brand-teal bg-surface-soft/40 placeholder:text-muted/70 transition-all"
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-brand-teal animate-spin" />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setSuggestions([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-muted hover:text-ink rounded-lg transition-colors"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-hairline shadow-floating overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-3.5 py-2 bg-surface-soft/80 border-b border-hairline flex items-center justify-between text-[11px] text-muted">
            <span className="font-semibold text-ink flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
              <span>Google Maps Suggestions</span>
            </span>
            <span className="text-[10px] text-muted-soft">Click to sync exact business</span>
          </div>

          {/* Options List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-hairline/60">
            {suggestions.map((item, idx) => {
              const isHighlighted = highlightedIndex === idx;
              return (
                <div
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`p-3 transition-colors cursor-pointer flex items-start gap-3 text-left ${
                    isHighlighted ? "bg-brand-teal/5" : "hover:bg-surface-soft/70"
                  }`}
                >
                  {/* Google Pin Icon */}
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-100">
                    <MapPin className="w-4 h-4 fill-red-500/20" />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-ink truncate">
                        {item.name}
                      </span>
                      {item.isExactPlaceId && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Exact Google Pin</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted truncate leading-relaxed">
                      {item.address}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="shrink-0 pt-2 text-muted">
                    <ChevronRight className="w-4 h-4 text-muted/60" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dropdown Footer */}
          <div className="px-3.5 py-1.5 bg-surface-card/60 border-t border-hairline flex items-center justify-between text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-ochre" />
              <span>Selects official Google Place ID &amp; 1-click review link</span>
            </span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
