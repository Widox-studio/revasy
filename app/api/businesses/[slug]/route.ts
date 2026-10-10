
import { NextResponse } from "next/server";
import { getBusinessBySlugAsync, saveBusinessAsync, deleteBusinessAsync } from "@/lib/business-store";
import { getAdminSession, isAuthorizedForBusiness, isSuperAdminEmail } from "@/lib/auth";
import { sanitizeText } from "@/lib/validation";
import { extractPlaceId } from "@/lib/maps-launcher";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = params;
    const business = await getBusinessBySlugAsync(slug);

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const session = await getAdminSession();
    if (!session || !session.email) {
      return NextResponse.json(
        { error: "Authentication required to access business portal data." },
        { status: 401 }
      );
    }

    // Verify tenant authorization
    if (!isAuthorizedForBusiness(session.email, business.ownerEmail, slug)) {
      return NextResponse.json(
        { error: "Access denied: You do not have permission to access this business." },
        { status: 403 }
      );
    }

    // Sanitize business object: Never leak OAuth tokens or secrets to client
    const sanitizedBusiness = {
      ...business,
      googleOAuth: business.googleOAuth
        ? {
            connected: business.googleOAuth.connected,
            connectedEmail: business.googleOAuth.connectedEmail,
            connectedName: business.googleOAuth.connectedName,
            locationName: business.googleOAuth.locationName,
            accountName: business.googleOAuth.accountName,
            connectedAt: business.googleOAuth.connectedAt,
            scopes: business.googleOAuth.scopes,
          }
        : undefined,
    };

    return NextResponse.json({ success: true, business: sanitizedBusiness });
  } catch (error) {
    console.error("Error fetching business by slug:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { slug } = params;
    const existing = await getBusinessBySlugAsync(slug);

    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const session = await getAdminSession();
    if (!session || !session.email) {
      return NextResponse.json(
        { error: "Authentication required to modify business settings." },
        { status: 401 }
      );
    }

    // Enforce tenant authorization on mutation
    if (!isAuthorizedForBusiness(session.email, existing.ownerEmail, slug)) {
      return NextResponse.json(
        { error: "Access denied: You do not have permission to modify this business." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const isSuper = isSuperAdminEmail(session?.email);

    // Only super-admins can alter Google Review URLs or Place IDs
    const googleReviewUrl = isSuper && body.googleReviewUrl
      ? body.googleReviewUrl.trim()
      : existing.googleReviewUrl;
    const placeId = isSuper
      ? (body.placeId !== undefined ? body.placeId : (body.googleReviewUrl ? extractPlaceId(body.googleReviewUrl) || undefined : existing.placeId))
      : existing.placeId;
    const address = isSuper && body.address !== undefined
      ? sanitizeText(body.address)
      : existing.address;

    const updated = {
      ...existing,
      name: body.name ? sanitizeText(body.name) : existing.name,
      tagline: body.tagline !== undefined ? sanitizeText(body.tagline) : existing.tagline,
      category: body.category ? sanitizeText(body.category) : existing.category,
      description: body.description !== undefined ? sanitizeText(body.description) : existing.description,
      address,
      googleReviewUrl,
      placeId,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : existing.logoUrl,
      accentColor: body.accentColor || existing.accentColor,
      ownerEmail: isSuper && body.ownerEmail ? body.ownerEmail.trim().toLowerCase() : existing.ownerEmail,
      customPrompts: Array.isArray(body.customPrompts)
        ? body.customPrompts.map((p: string) => sanitizeText(p)).filter(Boolean)
        : existing.customPrompts,
    };

    await saveBusinessAsync(updated);

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { slug } = params;
    const existing = await getBusinessBySlugAsync(slug);

    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const session = await getAdminSession();
    if (!session || !session.email) {
      return NextResponse.json(
        { error: "Authentication required to delete a business." },
        { status: 401 }
      );
    }

    const isSuper = session.isSuperAdmin || isSuperAdminEmail(session.email);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Access denied: Only super-administrators can delete business locations." },
        { status: 403 }
      );
    }

    await deleteBusinessAsync(slug);

    return NextResponse.json({ success: true, message: "Business deleted successfully" });
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

