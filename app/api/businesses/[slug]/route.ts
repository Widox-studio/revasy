import { NextResponse } from "next/server";
import { getBusinessBySlug, saveBusiness } from "@/lib/business-store";
import { sanitizeText } from "@/lib/validation";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = params;
    const business = getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, business });
  } catch (error) {
    console.error("Error fetching business by slug:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { slug } = params;
    const existing = getBusinessBySlug(slug);

    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const body = await req.json();

    const updated = {
      ...existing,
      name: body.name ? sanitizeText(body.name) : existing.name,
      tagline: body.tagline !== undefined ? sanitizeText(body.tagline) : existing.tagline,
      category: body.category ? sanitizeText(body.category) : existing.category,
      description: body.description !== undefined ? sanitizeText(body.description) : existing.description,
      googleReviewUrl: body.googleReviewUrl ? body.googleReviewUrl.trim() : existing.googleReviewUrl,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : existing.logoUrl,
      accentColor: body.accentColor || existing.accentColor,
      customPrompts: Array.isArray(body.customPrompts)
        ? body.customPrompts.map((p: string) => sanitizeText(p)).filter(Boolean)
        : existing.customPrompts,
    };

    saveBusiness(updated);

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
