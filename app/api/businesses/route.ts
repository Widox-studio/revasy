import { NextResponse } from "next/server";
import { getAdminSession, isSuperAdminEmail } from "@/lib/auth";
import { getBusinessesByOwnerAsync, saveBusinessAsync, getBusinessBySlugAsync, Business } from "@/lib/business-store";
import { BusinessCreateInputSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();

    // If caller is not authenticated, return empty list and unauthenticated status
    if (!session) {
      return NextResponse.json({
        success: true,
        businesses: [],
        isAuthenticated: false,
        isPendingSetup: false,
        userEmail: null,
      });
    }

    // Authenticated client only sees businesses assigned to their account email
    // (or all businesses if caller is super-admin, handled by getBusinessesByOwnerAsync)
    const callerEmail = session.email;
    const businesses = await getBusinessesByOwnerAsync(callerEmail);
    const isPendingSetup = businesses.length === 0;

    return NextResponse.json({
      success: true,
      businesses,
      isAuthenticated: true,
      isPendingSetup,
      userEmail: callerEmail,
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    const isSuper = session?.isSuperAdmin || isSuperAdminEmail(session?.email);

    if (!isSuper) {
      return NextResponse.json(
        {
          error:
            "Business onboarding is white-glove managed by revasy Concierge. Super-admin access required.",
        },
        { status: 403 }
      );
    }

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

    // Check if slug already exists
    const existing = await getBusinessBySlugAsync(data.slug);
    if (existing) {
      return NextResponse.json(
        { error: `URL slug "${data.slug}" is already taken. Please choose a different slug.` },
        { status: 409 }
      );
    }

    const assignedEmail = (data.ownerEmail || body.ownerEmail || session?.email || "widoxstudio@gmail.com").trim().toLowerCase();

    const newBusiness: Business = {
      id: `biz_${Date.now()}`,
      slug: data.slug.toLowerCase().trim(),
      name: sanitizeText(data.name),
      tagline: sanitizeText(data.tagline || ""),
      category: sanitizeText(data.category),
      description: sanitizeText(data.description || ""),
      address: data.address ? sanitizeText(data.address) : (body.address ? sanitizeText(body.address) : undefined),
      googleReviewUrl: data.googleReviewUrl.trim(),
      placeId: data.placeId || undefined,
      logoUrl: data.logoUrl || "",
      accentColor: data.accentColor,
      customPrompts: data.customPrompts.map((p) => sanitizeText(p)).filter(Boolean),
      ownerEmail: assignedEmail,
      createdAt: new Date().toISOString(),
      stats: {
        totalReviewsGenerated: 0,
        totalRepliesGenerated: 0,
      },
    };

    await saveBusinessAsync(newBusiness);

    return NextResponse.json({ success: true, business: newBusiness }, { status: 201 });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json({ error: "Failed to register business" }, { status: 500 });
  }
}

