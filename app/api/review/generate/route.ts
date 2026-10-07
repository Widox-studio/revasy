import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { ReviewGenerateInputSchema, sanitizeText } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateCustomerReviewDrafts } from "@/lib/openai";
import { getBusinessBySlugAsync, incrementBusinessReviewStats } from "@/lib/business-store";

export const dynamic = "force-dynamic";

function deduplicatePhrases(text: string): string {
  if (!text) return "";
  const parts = text.split(/(?<=[.!?\n])\s+/);
  const seen = new Set<string>();
  const uniqueParts: string[] = [];

  for (const part of parts) {
    const norm = part.replace(/[.!?]+$/, "").trim().toLowerCase();
    if (!norm) continue;
    if (!seen.has(norm)) {
      seen.add(norm);
      uniqueParts.push(part.trim());
    }
  }

  return uniqueParts.length > 0 ? uniqueParts.join(" ") : text;
}

export async function POST(req: Request) {
  try {
    // 1. Rate limiting check
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `review-gen:${clientIp}`,
      config.rateLimits.reviewGenerate.max,
      config.rateLimits.reviewGenerate.windowMs
    );

    const headers = new Headers();
    headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
    headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    headers.set("X-RateLimit-Reset", rateLimit.reset.toString());

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a moment before generating more reviews.",
          retryAfter: rateLimit.reset,
        },
        { status: 429, headers }
      );
    }

    // 2. Parse & validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers }
      );
    }

    const parseResult = ReviewGenerateInputSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Validation failed";
      return NextResponse.json(
        { error: firstError },
        { status: 422, headers }
      );
    }

    const { rating, customerText, businessSlug, variationIndex } = parseResult.data;
    const cleanText = deduplicatePhrases(sanitizeText(customerText));


    if (cleanText.length < 3) {
      return NextResponse.json(
        { error: "Please enter at least 3 characters of genuine feedback." },
        { status: 422, headers }
      );
    }

    // Lookup business context if provided
    let businessName = "Cocova Cafe";
    let businessCategory = "Cafe & Restaurant";

    if (businessSlug) {
      const biz = await getBusinessBySlugAsync(businessSlug);
      if (biz) {
        businessName = biz.name;
        businessCategory = biz.category;
        incrementBusinessReviewStats(biz.slug);
      }
    }

    // 3. Generate review drafts with variation rotation
    const effectiveVariationIndex = typeof variationIndex === "number"
      ? variationIndex
      : Math.floor(Math.random() * 10);

    const drafts = await generateCustomerReviewDrafts(
      rating,
      cleanText,
      businessName,
      businessCategory,
      effectiveVariationIndex
    );

    return NextResponse.json(
      {
        success: true,
        rating,
        drafts,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error in review generation route:", error);
    return NextResponse.json(
      { error: "Failed to generate review suggestions. Please try again." },
      { status: 500 }
    );
  }
}
