export const config = {
  cafe: {
    name: "Cocova Cafe",
    tagline: "Artisan Coffee & Warm Moments",
    description: "Handcrafted coffee, artisan pastries, and heartfelt hospitality.",
  },
  googleReviewUrl:
    process.env.COCOVA_GOOGLE_REVIEW_URL ||
    "https://search.google.com/local/writereview?placeid=ChIJcocova_demo_place",
  admin: {
    email: process.env.ADMIN_EMAIL || "owner@cocovacafe.com",
    password: process.env.ADMIN_PASSWORD || "CocovaSecure2026!",
    sessionSecret:
      process.env.SESSION_SECRET ||
      "cocova-cafe-session-secret-change-in-production-2026-xyz",
    cookieName: "cocova_session",
    sessionMaxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  rateLimits: {
    reviewGenerate: {
      windowMs: 60 * 1000, // 1 minute
      max: 6, // max 6 reviews per minute per IP
    },
    adminReplyGenerate: {
      windowMs: 60 * 1000,
      max: 20, // max 20 replies per minute per IP
    },
  },
};
