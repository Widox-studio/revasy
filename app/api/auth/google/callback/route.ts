import { NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  fetchGoogleBusinessAccounts,
  fetchGoogleBusinessLocations,
  verifySignedOAuthState,
} from "@/lib/google-business";
import {
  getBusinessBySlugAsync,
  updateBusinessGoogleOAuth,
  updateBusinessAutoReplyConfig,
} from "@/lib/business-store";
import { getAdminSession, isAuthorizedForBusiness } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth cancellation or error
  if (error) {
    console.warn("Google OAuth error from callback:", error);
    return NextResponse.redirect(
      new URL(`/dashboard?google_error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard?google_error=missing_code_or_state", req.url)
    );
  }

  try {
    // 1. Cryptographically verify the signed HMAC-SHA256 state parameter
    const verifiedState = verifySignedOAuthState(state);
    if (!verifiedState) {
      console.warn("Security Alert: Invalid, expired, or tampered OAuth state parameter rejected.");
      return NextResponse.redirect(
        new URL("/dashboard?google_error=invalid_or_tampered_oauth_state", req.url)
      );
    }

    const slug = verifiedState.slug;
    const returnUrl = verifiedState.returnUrl || `/dashboard/${slug}`;
    const business = await getBusinessBySlugAsync(slug);

    if (!business) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Security Constraint: Verify merchant session from Clerk / auth cookie
    const session = await getAdminSession();
    if (!session || !session.email) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_url", returnUrl);
      loginUrl.searchParams.set("google_error", "session_expired");
      return NextResponse.redirect(loginUrl);
    }

    // Verify session matches state email if state included it
    if (verifiedState.email && verifiedState.email.toLowerCase().trim() !== session.email.toLowerCase().trim()) {
      return NextResponse.redirect(
        new URL(`${returnUrl}?google_error=session_mismatch`, req.url)
      );
    }

    // Verify merchant is authorized to manage this specific business
    if (!isAuthorizedForBusiness(session.email, business.ownerEmail, slug)) {
      return NextResponse.redirect(
        new URL(`${returnUrl}?google_error=unauthorized_business_access`, req.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code);
    if (!tokens || !tokens.access_token) {
      return NextResponse.redirect(
        new URL(
          `${returnUrl}?google_error=token_exchange_failed`,
          req.url
        )
      );
    }

    // Retrieve user details
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);

    // Retrieve Google Business Profile accounts and locations
    const accounts = await fetchGoogleBusinessAccounts(tokens.access_token);
    let chosenAccountName = "";
    let chosenLocationName = "";

    if (accounts.length > 0) {
      chosenAccountName = accounts[0].name;
      const locations = await fetchGoogleBusinessLocations(
        tokens.access_token,
        accounts[0].name
      );

      // Attempt matching business placeId or take the first location
      const matchingLoc =
        locations.find((l) => l.metadata?.placeId === business.placeId) ||
        locations[0];

      if (matchingLoc) {
        chosenLocationName = matchingLoc.name;
      }
    }

    // Save Google connection to business store
    await updateBusinessGoogleOAuth(slug, {
      connected: true,
      connectedEmail: userInfo?.email || business.ownerEmail,
      connectedName: userInfo?.name || business.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
      accountId: chosenAccountName,
      accountName: chosenAccountName,
      locationName: chosenLocationName,
      connectedAt: new Date().toISOString(),
      scopes: tokens.scope ? tokens.scope.split(" ") : [],
    });

    // Only enable auto-reply if a valid Google Business Profile location was found
    const hasValidLocation = Boolean(chosenLocationName);
    await updateBusinessAutoReplyConfig(slug, {
      enabled: hasValidLocation,
      tone: "warm",
      minRating: 1,
      signature: `— Team ${business.name}`,
      autoPublish: hasValidLocation,
    });

    const successRedirect = new URL(returnUrl, req.url);
    successRedirect.searchParams.set("google_connected", "true");
    return NextResponse.redirect(successRedirect);
  } catch (err: any) {
    console.error("Fatal error in Google OAuth callback:", err);
    return NextResponse.redirect(
      new URL("/dashboard?google_error=unexpected_server_error", req.url)
    );
  }
}
