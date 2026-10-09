import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-business";
import { config } from "@/lib/config";
import { getBusinessBySlugAsync } from "@/lib/business-store";
import { getAdminSession, isAuthorizedForBusiness } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "cocova";
  const returnUrl = searchParams.get("returnUrl") || `/dashboard/${slug}`;

  // 1. First Tier Auth (Clerk / Merchant Session): Verify user is logged in
  const session = await getAdminSession();
  if (!session || !session.email) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", `/dashboard/${slug}`);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Fetch business
  const business = await getBusinessBySlugAsync(slug);
  if (!business) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. Multi-Tenant Authorization: Verify user is authorized to manage this specific business
  if (!isAuthorizedForBusiness(session.email, business.ownerEmail, slug)) {
    return NextResponse.redirect(
      new URL("/dashboard?google_error=unauthorized_business_access", req.url)
    );
  }

  // 4. Validate Google Client Credentials
  if (!config.google.clientId || !config.google.clientSecret) {
    return NextResponse.redirect(
      new URL(`${returnUrl}?google_error=oauth_credentials_not_configured`, req.url)
    );
  }

  // 5. Initiate Second Tier Auth (Google Business Profile OAuth Connect) with session binding
  const googleAuthUrl = getGoogleAuthUrl(slug, returnUrl, session.email);
  return NextResponse.redirect(googleAuthUrl);
}
