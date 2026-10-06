export const runtime = "edge";

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBusinessesByOwner, saveBusiness, getBusinessBySlug, Business } from "@/lib/business-store";
import { BusinessCreateInputSchema, sanitizeText } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    const ownerEmail = session?.email || "owner@cocovacafe.com";
    const businesses = getBusinessesByOwner(ownerEmail);
    return NextResponse.json({ success: true, businesses });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    const ownerEmail = session?.email || "owner@cocovacafe.com";

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parseResult = BusinessCreateInputSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 422 });
    }

    const data = parseResult.data;

    // Check if slug is taken
    const existing = getBusinessBySlug(data.slug);
    if (existing) {
      return NextResponse.json(
        { error: `URL slug "${data.slug}" is already taken. Please choose a different slug.` },
        { status: 409 }
      );
    }

    const newBusiness: Business = {
      id: `biz_${Date.now()}`,
      slug: data.slug.toLowerCase().trim(),
      name: sanitizeText(data.name),
      tagline: sanitizeText(data.tagline),
      category: sanitizeText(data.category),
      description: sanitizeText(data.description),
      googleReviewUrl: data.googleReviewUrl.trim(),
      logoUrl: data.logoUrl,
      accentColor: data.accentColor,
      customPrompts: data.customPrompts.map((p) => sanitizeText(p)).filter(Boolean),
      ownerEmail,
      createdAt: new Date().toISOString(),
      stats: {
        totalReviewsGenerated: 0,
        totalRepliesGenerated: 0,
      },
    };

    saveBusiness(newBusiness);

    return NextResponse.json({ success: true, business: newBusiness }, { status: 201 });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json({ error: "Failed to register business" }, { status: 500 });
  }
}
