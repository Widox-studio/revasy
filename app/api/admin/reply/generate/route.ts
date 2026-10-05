import { NextResponse } from "next/server";
import { AdminReplyGenerateInputSchema, sanitizeText } from "@/lib/validation";
import { generateOwnerReplyDrafts } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { config } from "@/lib/config";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Double check authentication server-side
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit check for admin
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `admin-reply:${clientIp}`,
      config.rateLimits.adminReplyGenerate.max,
      config.rateLimits.adminReplyGenerate.windowMs
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    // 3. Parse & validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parseResult = AdminReplyGenerateInputSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: errorMsg }, { status: 422 });
    }

    const { customerReview, rating, reviewerName } = parseResult.data;
    const cleanReview = sanitizeText(customerReview);
    const cleanName = reviewerName ? sanitizeText(reviewerName) : undefined;

    if (cleanReview.length < 5) {
      return NextResponse.json(
        { error: "Review text must be at least 5 characters long." },
        { status: 422 }
      );
    }

    // 4. Generate reply options
    const replies = await generateOwnerReplyDrafts(rating, cleanReview, cleanName);

    return NextResponse.json({
      success: true,
      replies,
    });
  } catch (error) {
    console.error("Error generating admin reply:", error);
    return NextResponse.json(
      { error: "Failed to generate reply suggestions. Please try again." },
      { status: 500 }
    );
  }
}
