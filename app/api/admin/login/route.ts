
import { NextResponse } from "next/server";
import { AdminLoginInputSchema } from "@/lib/validation";
import { validateAdminCredentials, createSessionToken } from "@/lib/auth";
import { config } from "@/lib/config";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    // Rate limit login attempts to 10 per 5 minutes per IP to prevent brute-force
    const rateLimit = checkRateLimit(`admin-login:${clientIp}`, 10, 5 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parseResult = AdminLoginInputSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: errorMsg }, { status: 422 });
    }

    const { email, password } = parseResult.data;

    const isValid = validateAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionToken = await createSessionToken(email);

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
    });

    response.cookies.set({
      name: config.admin.cookieName,
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: config.admin.sessionMaxAgeSeconds,
    });

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
