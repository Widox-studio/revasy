import { NextResponse } from "next/server";
import { saveFeedbackAsync, getBusinessBySlugAsync } from "@/lib/business-store";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { businessSlug, rating, customerText, contactInfo } = body;

    if (!businessSlug || typeof rating !== "number" || !customerText) {
      return NextResponse.json({ error: "Missing required feedback fields" }, { status: 422 });
    }

    const cleanText = sanitizeText(String(customerText));
    const cleanContact = contactInfo ? sanitizeText(String(contactInfo)) : undefined;

    // Check business exists
    const biz = await getBusinessBySlugAsync(businessSlug);

    // Save to Cloudflare D1 / persistence
    await saveFeedbackAsync({
      businessSlug,
      rating,
      customerText: cleanText,
      contactInfo: cleanContact,
    });

    return NextResponse.json({
      success: true,
      message: "Your private feedback has been received and routed directly to management. Thank you for helping us improve!",
      businessName: biz?.name || businessSlug,
    });
  } catch (error) {
    console.error("Error submitting private feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
