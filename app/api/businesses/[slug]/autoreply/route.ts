import { NextResponse } from "next/server";
import { getAdminSession, isAuthorizedForBusiness } from "@/lib/auth";
import {
  getBusinessBySlugAsync,
  updateBusinessAutoReplyConfig,
  clearBusinessAutoReplyLogs,
} from "@/lib/business-store";
import { syncAndAutoReplyForBusiness } from "@/lib/google-business";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const business = await getBusinessBySlugAsync(slug);

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!isAuthorizedForBusiness(session.email, business.ownerEmail, slug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      googleConnected: !!business.googleOAuth?.connected,
      googleEmail: business.googleOAuth?.connectedEmail || null,
      googleName: business.googleOAuth?.connectedName || null,
      locationName: business.googleOAuth?.locationName || business.name,
      connectedAt: business.googleOAuth?.connectedAt || null,
      config: business.autoReplyConfig || {
        enabled: false,
        tone: "warm",
        minRating: 1,
        signature: `— Team ${business.name}`,
        autoPublish: true,
        totalAutoRepliesSent: 0,
      },
      logs: business.autoReplyLogs || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed fetching auto-reply data" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const business = await getBusinessBySlugAsync(slug);

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!isAuthorizedForBusiness(session.email, business.ownerEmail, slug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, enabled, tone, minRating, signature } = body;

    if (action === "toggle") {
      const isTryingToEnable = Boolean(enabled);
      const hasLocation = Boolean(business.googleOAuth?.connected && business.googleOAuth?.locationName);

      if (isTryingToEnable && !hasLocation) {
        return NextResponse.json(
          {
            error: "Cannot enable auto-reply: No Google Business Profile location detected under this account.",
            enabled: false,
          },
          { status: 400 }
        );
      }

      const updated = await updateBusinessAutoReplyConfig(slug, {
        enabled: isTryingToEnable && hasLocation,
      });
      return NextResponse.json({
        success: true,
        enabled: updated?.autoReplyConfig?.enabled ?? false,
      });
    }

    if (action === "update_settings") {
      const updated = await updateBusinessAutoReplyConfig(slug, {
        ...(typeof enabled === "boolean" ? { enabled } : {}),
        ...(tone ? { tone } : {}),
        ...(typeof minRating === "number" ? { minRating } : {}),
        ...(typeof signature === "string" ? { signature } : {}),
      });
      return NextResponse.json({
        success: true,
        config: updated?.autoReplyConfig,
      });
    }

    if (action === "sync_now") {
      // Execute on-demand review check & auto-reply synthesis
      const result = await syncAndAutoReplyForBusiness(business);
      return NextResponse.json(result);
    }

    if (action === "clear_logs") {
      await clearBusinessAutoReplyLogs(slug);
      return NextResponse.json({ success: true, message: "Activity history cleared." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed processing auto-reply request" },
      { status: 500 }
    );
  }
}
