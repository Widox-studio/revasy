"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  ThumbsUp,
  Share2,
  Sparkles,
  CheckCircle2,
  Check,
  RefreshCw,
  Search,
  ArrowLeft,
  Wifi,
  Battery,
  MapPin,
} from "lucide-react";

const CUSTOMER_REVIEW = {
  author: "Vinay Phalod",
  metadata: "Local Guide · 27 reviews · 1,837 photos",
  rating: 5,
  timestamp: "Just now",
  text: "Absolutely love this place! The ice cream is delicious and the waffles are made fresh right in front of you. We also tried the family pack, and it was perfect for sharing. Highly recommend stopping by if you have a sweet tooth!",
};

const OWNER_REPLY_FULL =
  "Thank you so much for your lovely review, Vinay! We're delighted that you enjoyed our ice cream and freshly made waffles. It's wonderful to hear that the family pack made sharing even more special. We look forward to welcoming you again soon!";

type AnimationPhase =
  | "review_received"
  | "ai_writing"
  | "typing"
  | "publishing"
  | "published";

export function AiReplyShowcase() {
  const [phase, setPhase] = useState<AnimationPhase>("review_received");
  const [charIndex, setCharIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Check user's reduced-motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Viewport intersection observer to start autoplay when visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isPlaying = isInView && !prefersReducedMotion;

  // Synchronized animation state machine controlling both columns
  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase("published");
      setCharIndex(OWNER_REPLY_FULL.length);
      return;
    }

    if (!isPlaying) return;

    let timer: NodeJS.Timeout;

    if (phase === "review_received") {
      setCharIndex(0);
      timer = setTimeout(() => {
        setPhase("ai_writing");
      }, 1900);
    } else if (phase === "ai_writing") {
      timer = setTimeout(() => {
        setPhase("typing");
      }, 1300);
    } else if (phase === "typing") {
      const typeInterval = setInterval(() => {
        if (!isPlaying) return;

        setCharIndex((prev) => {
          const nextIndex = Math.min(prev + 2, OWNER_REPLY_FULL.length);
          if (nextIndex >= OWNER_REPLY_FULL.length) {
            clearInterval(typeInterval);
            setPhase("publishing");
          }
          return nextIndex;
        });
      }, 35);

      return () => clearInterval(typeInterval);
    } else if (phase === "publishing") {
      timer = setTimeout(() => {
        setPhase("published");
      }, 1300);
    } else if (phase === "published") {
      // Hold completed state so visitors can read the final owner reply comfortably
      timer = setTimeout(() => {
        setPhase("review_received");
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [phase, isPlaying, prefersReducedMotion]);

  const currentTypedText =
    phase === "publishing" || phase === "published"
      ? OWNER_REPLY_FULL
      : OWNER_REPLY_FULL.slice(0, charIndex);

  // Active step synchronization
  const isStep1Active = phase === "review_received";
  const isStep1Done = phase !== "review_received";

  const isStep2Active = phase === "ai_writing" || phase === "typing";
  const isStep2Done = phase === "publishing" || phase === "published";

  const isStep3Active = phase === "publishing" || phase === "published";
  const isStep3Done = phase === "published";

  return (
    <div ref={containerRef} className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Editorial Explanation & Synchronized Process Steps           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 sm:space-y-8">
          {/* Headline & Supporting Copy */}
          <div className="space-y-4">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-[2.65rem] text-ink leading-[1.18] tracking-tight">
              Every review deserves a reply.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 block sm:inline">
                revasy handles it automatically.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-xl">
              revasy AI understands incoming customer feedback, writes thoughtful
              owner responses, and publishes them automatically — helping your
              business stay responsive without manual effort.
            </p>
          </div>

          {/* 3 Compact Animated Process Steps (Hidden in mobile view) */}
          <div className="hidden lg:block space-y-3.5 pt-1">
            {/* Step 01 */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                isStep1Active
                  ? "bg-white border-primary/30 shadow-subtle ring-1 ring-primary/20"
                  : isStep1Done
                  ? "bg-slate-50/70 border-slate-200/80 opacity-90"
                  : "bg-slate-50/40 border-slate-100 opacity-60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                  isStep1Done
                    ? "bg-emerald-100 text-emerald-700"
                    : isStep1Active
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isStep1Done ? <Check className="w-4 h-4" /> : "01"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-display text-sm font-bold ${
                      isStep1Active
                        ? "text-ink"
                        : isStep1Done
                        ? "text-slate-700"
                        : "text-muted"
                    }`}
                  >
                    01 — Review received
                  </h4>
                  {isStep1Active && (
                    <span className="text-[10px] font-bold text-primary bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  A customer posts a review on your verified Google Business Profile.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                isStep2Active
                  ? "bg-white border-primary/30 shadow-subtle ring-1 ring-primary/20"
                  : isStep2Done
                  ? "bg-slate-50/70 border-slate-200/80 opacity-90"
                  : "bg-slate-50/40 border-slate-100 opacity-60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                  isStep2Done
                    ? "bg-emerald-100 text-emerald-700"
                    : isStep2Active
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isStep2Done ? <Check className="w-4 h-4" /> : "02"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-display text-sm font-bold ${
                      isStep2Active
                        ? "text-ink"
                        : isStep2Done
                        ? "text-slate-700"
                        : "text-muted"
                    }`}
                  >
                    02 — AI writes a reply
                  </h4>
                  {isStep2Active && (
                    <span className="text-[10px] font-bold text-primary bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full animate-pulse">
                      Composing live
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  revasy AI prepares a personalized, warm response tailored to the customer&apos;s feedback.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                isStep3Active
                  ? "bg-white border-emerald-500/30 shadow-subtle ring-1 ring-emerald-500/20"
                  : "bg-slate-50/40 border-slate-100 opacity-60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                  isStep3Done
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isStep3Active
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isStep3Done ? <Check className="w-4 h-4" /> : "03"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-display text-sm font-bold ${
                      isStep3Active ? "text-ink" : "text-muted"
                    }`}
                  >
                    03 — Automatically published
                  </h4>
                  {isStep3Done && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Live on Google Maps
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  revasy publishes the response on your business&apos;s behalf. No manual intervention required.
                </p>
              </div>
            </div>
          </div>

          {/* Subtle Trust Highlight */}
          <div className="hidden lg:flex items-center gap-2.5 pt-2 text-xs text-muted font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Direct Google Business Profile API integration · 24/7 automated hospitality</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Enhanced Smartphone Mockup (-5% compact scaling)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[370px] sm:max-w-[398px]">
            {/* Ambient Dimensional Colored Aura */}
            <div className="absolute -inset-3.5 rounded-[54px] bg-gradient-to-b from-indigo-500/18 via-primary/8 to-emerald-500/8 blur-xl -z-10" />

            {/* Smartphone Outer Hardware Chassis (-5% proportional scale) */}
            <div className="relative rounded-[50px] p-[8px] sm:p-[9px] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-[0_30px_80px_-15px_rgba(15,23,42,0.42),0_12px_28px_-5px_rgba(15,23,42,0.22)] ring-1 ring-white/20">
              {/* Hardware Button Accents on Outer Silhouette */}
              <div className="absolute -left-[3px] top-24 w-[3px] h-7 bg-slate-700 rounded-l-sm" />
              <div className="absolute -left-[3px] top-36 w-[3px] h-11 bg-slate-700 rounded-l-sm" />
              <div className="absolute -left-[3px] top-52 w-[3px] h-11 bg-slate-700 rounded-l-sm" />
              <div className="absolute -right-[3px] top-32 w-[3px] h-14 bg-slate-700 rounded-r-sm" />

              {/* High-Resolution Screen Surface */}
              <div className="rounded-[42px] bg-white overflow-hidden flex flex-col min-h-[625px] sm:min-h-[685px] border border-slate-900/30 shadow-inner">
                {/* 1. Status Bar & Dynamic Island */}
                <div className="pt-3 pb-2 px-6 flex items-center justify-between bg-white text-slate-800 border-b border-slate-100 select-none">
                  <span className="text-[12px] font-bold tracking-tight text-slate-800">
                    9:41
                  </span>

                  {/* Dynamic Island Sensor Pill */}
                  <div className="w-24 h-4.5 bg-black rounded-full mx-auto flex items-center justify-between px-2.5 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-[#1e293b] ring-1 ring-slate-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                  </div>

                  {/* Status Icons */}
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4 fill-slate-800 text-slate-800" />
                  </div>
                </div>

                {/* 2. Google Maps Navigation Header */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <ArrowLeft className="w-4 h-4 text-slate-600 shrink-0" />
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-ink font-display truncate">
                        The Creamery &amp; Waffles
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Auto-Sync Active
                    </span>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>

                {/* 3. Google Place Meta & Reviews Navigation Bar */}
                <div className="px-4 py-2 bg-white border-b border-slate-100 text-left">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900">4.9</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-soft">(142 reviews)</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Open · Closes 10 PM
                    </span>
                  </div>

                  {/* Tab bar */}
                  <div className="flex items-center gap-4 pt-2 text-[11px] font-semibold text-muted">
                    <span className="hover:text-slate-800">Overview</span>
                    <span className="text-primary border-b-2 border-primary pb-0.5">Reviews</span>
                    <span className="hover:text-slate-800">Photos</span>
                    <span className="hover:text-slate-800">About</span>
                  </div>
                </div>

                {/* 4. Live Review Thread Container (Flex-1 for balanced vertical height) */}
                <div className="p-3.5 sm:p-4 space-y-3 bg-white text-left flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Customer Reviewer Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar with Local Guide gold star */}
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            VP
                          </div>
                          <div
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[8px] text-white shadow-2xs"
                            title="Local Guide"
                          >
                            ★
                          </div>
                        </div>

                        <div>
                          <h4 className="font-display font-semibold text-xs text-ink leading-tight">
                            {CUSTOMER_REVIEW.author}
                          </h4>
                          <p className="text-[10px] text-muted-soft">
                            {CUSTOMER_REVIEW.metadata}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating & Timestamp */}
                    <div className="flex items-center gap-1 text-amber-400">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted ml-1 font-medium">
                        {CUSTOMER_REVIEW.timestamp}
                      </span>
                    </div>

                    {/* Full Customer Review Text */}
                    <p className="text-xs text-slate-800 leading-relaxed font-normal">
                      {CUSTOMER_REVIEW.text}
                    </p>

                    {/* Review Actions */}
                    <div className="flex items-center gap-4 pt-0.5 text-[11px] text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 hover:text-slate-800 cursor-default">
                        <ThumbsUp className="w-3 h-3" /> Helpful (12)
                      </span>
                      <span className="inline-flex items-center gap-1 hover:text-slate-800 cursor-default">
                        <Share2 className="w-3 h-3" /> Share
                      </span>
                    </div>

                    {/* Indented Business Owner Response (Google Maps layout) */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100">
                      <div className="border-l-2 border-indigo-500 bg-slate-50/70 rounded-r-2xl p-3.5 space-y-2 transition-all">
                        {/* Response Label & Status */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-ink">
                            Response from the owner
                          </span>

                          {/* Dynamic Phase Status */}
                          {phase === "review_received" && (
                            <span className="text-[10px] text-muted-soft italic">
                              Pending reply
                            </span>
                          )}
                          {phase === "ai_writing" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary animate-fadeIn">
                              <Sparkles className="w-3 h-3 text-primary animate-spin" />
                              <span>revasy AI is replying…</span>
                            </span>
                          )}
                          {phase === "typing" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                              <span>revasy AI is replying…</span>
                            </span>
                          )}
                          {phase === "publishing" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 animate-fadeIn">
                              <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                              <span>Publishing to Google…</span>
                            </span>
                          )}
                          {phase === "published" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 animate-fadeIn">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Published just now</span>
                            </span>
                          )}
                        </div>

                        {/* Owner Reply Typing Content */}
                        <div className="min-h-[96px]">
                          {phase === "review_received" ? (
                            <p className="text-[11px] text-muted-soft italic pt-1">
                              Awaiting automated response...
                            </p>
                          ) : phase === "ai_writing" ? (
                            <div className="pt-2 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse delay-150" />
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse delay-300" />
                              <span className="text-[10px] text-muted-soft ml-1">
                                Analyzing review context...
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-700 leading-relaxed font-normal">
                              {currentTypedText}
                              {phase === "typing" && (
                                <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse align-middle" />
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Automated Lifecycle Status Bar */}
                  <div className="space-y-3 pt-2">
                    <div
                      className={`w-full py-2.5 px-3 rounded-xl text-center text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                        phase === "published"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : phase === "publishing"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : phase === "ai_writing" || phase === "typing"
                          ? "bg-indigo-50 text-primary border border-indigo-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {phase === "review_received" && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>New review received</span>
                        </>
                      )}
                      {(phase === "ai_writing" || phase === "typing") && (
                        <>
                          <Sparkles className="w-3 h-3 text-primary animate-spin" />
                          <span>revasy AI is writing a reply</span>
                        </>
                      )}
                      {phase === "publishing" && (
                        <>
                          <RefreshCw className="w-3 h-3 text-white animate-spin" />
                          <span>Publishing response…</span>
                        </>
                      )}
                      {phase === "published" && (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Response published · Live on Google Maps</span>
                        </>
                      )}
                    </div>

                    {/* iOS Home Indicator Bar */}
                    <div className="w-32 h-1 bg-slate-900/30 rounded-full mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
