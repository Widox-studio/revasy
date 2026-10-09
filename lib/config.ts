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
    email: process.env.ADMIN_EMAIL || "widoxstudio@gmail.com",
    password: process.env.ADMIN_PASSWORD || "widox@1502",
    sessionSecret:
      process.env.SESSION_SECRET ||
      "cocova-cafe-session-secret-change-in-production-2026-xyz",
    cookieName: "cocova_session",
    sessionMaxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`,
    scopes: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/business.manage",
    ],
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct",
  },
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "38d1ceb6731de305dc93daf3659e371c",
    apiToken: process.env.CLOUDFLARE_API_TOKEN || "",
    workerUrl: process.env.CLOUDFLARE_WORKER_URL || "https://revasy-api.widoxstudio.workers.dev",
    model: process.env.CLOUDFLARE_AI_MODEL || "@cf/meta/llama-3-8b-instruct",
  },
  rateLimits: {
    reviewGenerate: {
      windowMs: 60 * 1000, // 1 minute
      max: 60, // max 60 reviews per minute per IP
    },
    adminReplyGenerate: {
      windowMs: 60 * 1000,
      max: 20, // max 20 replies per minute per IP
    },
  },
};
