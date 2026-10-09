import crypto from "crypto";
import { config } from "./config";
import {
  Business,
  AutoReplyLog,
  updateBusinessGoogleOAuth,
  addBusinessAutoReplyLog,
  updateBusinessAutoReplyConfig,
} from "./business-store";
import { generateOwnerReplyDrafts } from "./openai";

export interface SignedOAuthStatePayload {
  slug: string;
  returnUrl?: string;
  email?: string;
  ts: number;
  nonce: string;
}

/**
 * Generates an HMAC-SHA256 signed OAuth 2.0 state parameter.
 * Prevents CSRF attacks, session fixation, and tampering.
 */
export function generateSignedOAuthState(data: { slug: string; returnUrl?: string; email?: string }): string {
  const payload: SignedOAuthStatePayload = {
    slug: data.slug,
    returnUrl: data.returnUrl || `/dashboard/${data.slug}`,
    email: data.email || undefined,
    ts: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = config.admin.sessionSecret;
  const hmac = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${hmac}`;
}

/**
 * Cryptographically verifies the HMAC-SHA256 signature and freshness of the OAuth state.
 * Returns null if the signature is invalid, tampered, or expired (> 15 minutes).
 */
export function verifySignedOAuthState(state: string): SignedOAuthStatePayload | null {
  if (!state || typeof state !== "string" || !state.includes(".")) {
    return null;
  }

  const parts = state.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, receivedHmac] = parts;
  if (!encodedPayload || !receivedHmac) {
    return null;
  }

  const secret = config.admin.sessionSecret;
  const expectedHmac = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  // Timing-safe comparison to prevent timing attacks
  const expectedBuf = Buffer.from(expectedHmac);
  const receivedBuf = Buffer.from(receivedHmac);
  if (expectedBuf.length !== receivedBuf.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr) as SignedOAuthStatePayload;

    // Enforce 15-minute expiration window to prevent replay attacks
    const MAX_STATE_AGE_MS = 15 * 60 * 1000;
    if (!payload.ts || Date.now() - payload.ts > MAX_STATE_AGE_MS) {
      console.warn("OAuth state has expired (exceeded 15 minutes window)");
      return null;
    }

    if (!payload.slug) {
      return null;
    }

    return payload;
  } catch (err) {
    console.warn("Failed to parse verified OAuth state payload:", err);
    return null;
  }
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

export interface GoogleAccount {
  name: string; // e.g. "accounts/1183204928"
  accountName: string;
  type: string;
}

export interface GoogleLocation {
  name: string; // e.g. "locations/92384729"
  title: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
  };
  metadata?: {
    placeId?: string;
  };
}

export interface GoogleReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
    isAnonymous?: boolean;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

/**
 * Convert Google starRating enum string to numerical rating 1-5
 */
export function starRatingToNumber(rating: string): number {
  switch (rating) {
    case "FIVE":
      return 5;
    case "FOUR":
      return 4;
    case "THREE":
      return 3;
    case "TWO":
      return 2;
    case "ONE":
    default:
      return 1;
  }
}

/**
 * Generate Google OAuth 2.0 authorization URL
 */
export function getGoogleAuthUrl(slug: string, returnUrl?: string, sessionEmail?: string): string {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const state = generateSignedOAuthState({
    slug,
    returnUrl,
    email: sessionEmail,
  });

  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUri,
    response_type: "code",
    scope: config.google.scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `${rootUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for OAuth tokens
 */
export async function exchangeGoogleCode(code: string): Promise<GoogleTokens | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Google token exchange error:", errText);
      return null;
    }

    return (await res.json()) as GoogleTokens;
  } catch (err) {
    console.error("Failed exchanging Google OAuth code:", err);
    return null;
  }
}

/**
 * Refresh an expired access token using the stored refresh token
 */
export async function refreshGoogleAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!res.ok) {
      console.error("Failed refreshing Google access token");
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error("Error during Google token refresh:", err);
    return null;
  }
}

/**
 * Fetch authenticated Google user profile details
 */
export async function fetchGoogleUserInfo(
  accessToken: string
): Promise<{ email: string; name: string } | null> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      email: data.email || "",
      name: data.name || data.given_name || "Merchant Owner",
    };
  } catch {
    return null;
  }
}

/**
 * Fetch Google Business Profile Accounts
 */
export async function fetchGoogleBusinessAccounts(
  accessToken: string
): Promise<GoogleAccount[]> {
  try {
    const res = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.accounts || [];
  } catch {
    return [];
  }
}

/**
 * Fetch Google Business Locations for a given account
 */
export async function fetchGoogleBusinessLocations(
  accessToken: string,
  accountName: string
): Promise<GoogleLocation[]> {
  try {
    const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress,metadata`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.locations || [];
  } catch {
    return [];
  }
}

/**
 * Fetch Reviews from Google Business Profile
 */
export async function fetchGoogleReviews(
  accessToken: string,
  accountName: string,
  locationName: string
): Promise<GoogleReview[]> {
  try {
    // Format: https://mybusiness.googleapis.com/v4/{name=accounts/*/locations/*}/reviews
    const cleanAccount = accountName.startsWith("accounts/") ? accountName : `accounts/${accountName}`;
    const cleanLocation = locationName.startsWith("locations/") ? locationName : `locations/${locationName}`;
    const url = `https://mybusiness.googleapis.com/v4/${cleanAccount}/${cleanLocation}/reviews`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.reviews || [];
  } catch {
    return [];
  }
}

/**
 * Publish Reply to a Google Review via Google My Business API
 */
export async function publishGoogleReply(
  accessToken: string,
  accountName: string,
  locationName: string,
  reviewId: string,
  replyText: string
): Promise<boolean> {
  try {
    const cleanAccount = accountName.startsWith("accounts/") ? accountName : `accounts/${accountName}`;
    const cleanLocation = locationName.startsWith("locations/") ? locationName : `locations/${locationName}`;
    const url = `https://mybusiness.googleapis.com/v4/${cleanAccount}/${cleanLocation}/reviews/${reviewId}/reply`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: replyText }),
    });

    return res.ok;
  } catch (err) {
    console.error("Error publishing reply to Google:", err);
    return false;
  }
}

/**
 * Master Sync & Auto-Reply Runner for a Business
 * 1. Checks if Google OAuth is connected & auto-reply toggle is enabled
 * 2. Fetches pending Google reviews
 * 3. Synthesizes personalized owner replies using AI
 * 4. Publishes replies back to Google
 * 5. Logs the activity and updates business stats
 */
export async function syncAndAutoReplyForBusiness(business: Business): Promise<{
  success: boolean;
  repliesGenerated: number;
  message: string;
  logs: AutoReplyLog[];
}> {
  const configData = business.autoReplyConfig || {
    enabled: true,
    tone: "warm",
    minRating: 1,
    signature: `— Team ${business.name}`,
    autoPublish: true,
    totalAutoRepliesSent: 0,
  };

  const isConnected = !!business.googleOAuth?.connected;
  const newLogs: AutoReplyLog[] = [];

  // If live Google API tokens exist, execute real sync
  if (isConnected && business.googleOAuth?.accessToken) {
    let token = business.googleOAuth.accessToken;

    // Refresh token if expired
    if (
      business.googleOAuth.tokenExpiresAt &&
      Date.now() > business.googleOAuth.tokenExpiresAt &&
      business.googleOAuth.refreshToken
    ) {
      const refreshed = await refreshGoogleAccessToken(business.googleOAuth.refreshToken);
      if (refreshed) {
        token = refreshed;
        await updateBusinessGoogleOAuth(business.slug, {
          accessToken: refreshed,
          tokenExpiresAt: Date.now() + 3500 * 1000,
        });
      }
    }

    // If accountName or locationName missing, attempt dynamic discovery
    let accountName = business.googleOAuth.accountName;
    let locationName = business.googleOAuth.locationName;

    if (!accountName || !locationName) {
      try {
        const accounts = await fetchGoogleBusinessAccounts(token);
        if (accounts.length > 0) {
          accountName = accounts[0].name;
          const locations = await fetchGoogleBusinessLocations(token, accounts[0].name);
          const matchingLoc =
            locations.find((l) => l.metadata?.placeId === business.placeId) ||
            locations[0];

          if (matchingLoc) {
            locationName = matchingLoc.name;
            await updateBusinessGoogleOAuth(business.slug, {
              accountId: accountName,
              accountName,
              locationName,
            });
          }
        }
      } catch (discErr) {
        console.warn("Failed discovering Google locations:", discErr);
      }
    }

    // If still no location, report truthful status
    if (!accountName || !locationName) {
      return {
        success: false,
        repliesGenerated: 0,
        message: `Connected to Google as ${business.googleOAuth.connectedEmail || "merchant"}, but no Google Business listings were found under this account. Please verify this email has Owner or Manager permissions on business.google.com.`,
        logs: [],
      };
    }

    try {
      const reviews = await fetchGoogleReviews(token, accountName, locationName);

      for (const rev of reviews) {
        // Skip reviews that already have an owner reply
        if (rev.reviewReply?.comment) continue;

        const ratingNum = starRatingToNumber(rev.starRating);
        if (ratingNum < (configData.minRating || 1)) continue;

        const customerReviewText = rev.comment || `Rated ${ratingNum} stars.`;
        const reviewer = rev.reviewer?.displayName || "Valued Customer";

        // Synthesize response with Revasy AI
        const drafts = await generateOwnerReplyDrafts(
          ratingNum,
          customerReviewText,
          business.name,
          reviewer
        );

        let selectedReply = drafts[configData.tone || "warm"] || drafts.warm;
        if (configData.signature && !selectedReply.includes(configData.signature)) {
          selectedReply = `${selectedReply}\n\n${configData.signature}`;
        }

        // Publish to Google
        const publishSuccess = await publishGoogleReply(
          token,
          accountName,
          locationName,
          rev.reviewId,
          selectedReply
        );

        const logItem: AutoReplyLog = {
          id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          reviewId: rev.reviewId,
          reviewerName: reviewer,
          rating: ratingNum,
          reviewText: customerReviewText,
          reviewDate: rev.createTime || new Date().toISOString(),
          replyText: selectedReply,
          repliedAt: new Date().toISOString(),
          status: publishSuccess ? "published" : "failed",
        };

        await addBusinessAutoReplyLog(business.slug, logItem);
        newLogs.push(logItem);
      }

      await updateBusinessAutoReplyConfig(business.slug, {
        lastSyncAt: new Date().toISOString(),
      });

      return {
        success: true,
        repliesGenerated: newLogs.length,
        message:
          newLogs.length > 0
            ? `Successfully auto-replied to ${newLogs.length} new Google review(s).`
            : "Google Reviews are fully up to date. No pending unreplied reviews found.",
        logs: newLogs,
      };
    } catch (apiErr: any) {
      console.warn("Live Google API sync error:", apiErr);
      return {
        success: false,
        repliesGenerated: 0,
        message: `Google review sync error: ${apiErr?.message || "Check API permissions"}`,
        logs: [],
      };
    }
  }

  return {
    success: false,
    repliesGenerated: 0,
    message: "Google Business Profile is not connected yet. Click 'Connect with Google OAuth' to link your profile.",
    logs: [],
  };
}
