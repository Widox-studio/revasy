import { NextResponse } from "next/server";
import { getAdminSession, isAuthorizedForBusiness } from "@/lib/auth";
import {
  getBusinessBySlugAsync,
  clearBusinessGoogleOAuth,
} from "@/lib/business-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "cocova";

    const business = await getBusinessBySlugAsync(slug);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!isAuthorizedForBusiness(session.email, business.ownerEmail, slug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await clearBusinessGoogleOAuth(slug);

    return NextResponse.json({
      success: true,
      message: "Google Business Profile disconnected successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed disconnecting Google" },
      { status: 500 }
    );
  }
}
