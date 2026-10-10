function getEnv(key: string, fallback = ""): string {
  try {
    if (typeof process !== "undefined" && process?.env && process.env[key]) {
      return process.env[key]!;
    }
    const cf = (globalThis as any).env || (globalThis as any).CLOUDFLARE_ENV;
    if (cf && typeof cf[key] === "string" && cf[key]) {
      return cf[key];
    }
  } catch {}
  return fallback;
}

export const config = {
  cafe: {
    name: "Cocova Cafe",
    tagline: "Artisan Coffee & Warm Moments",
    description: "Handcrafted coffee, artisan pastries, and heartfelt hospitality.",
  },
  get googleReviewUrl() {
    return (
      getEnv("COCOVA_GOOGLE_REVIEW_URL") ||
      "https://search.google.com/local/writereview?placeid=ChIJcocova_demo_place"
    );
  },
  get admin() {
    return {
      email: getEnv("ADMIN_EMAIL", "widoxstudio@gmail.com"),
      password: getEnv("ADMIN_PASSWORD", "widox@1502"),
      sessionSecret: getEnv(
        "SESSION_SECRET",
        "cocova-cafe-session-secret-change-in-production-2026-xyz"
      ),
      cookieName: "cocova_session",
      sessionMaxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
    };
  },
  get google() {
    return {
      clientId: getEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
      redirectUri:
        getEnv("GOOGLE_REDIRECT_URI") ||
        `${getEnv("NEXT_PUBLIC_APP_URL", "https://revasy.widox.in")}/api/auth/google/callback`,
      scopes: [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/business.manage",
      ],
    };
  },
  get openai() {
    return {
      apiKey: getEnv("OPENAI_API_KEY"),
      model: getEnv("OPENAI_MODEL", "gpt-4o-mini"),
    };
  },
  get gemini() {
    return {
      apiKey: getEnv("GEMINI_API_KEY") || getEnv("GOOGLE_API_KEY"),
      model: getEnv("GEMINI_MODEL", "gemini-1.5-flash"),
    };
  },
  get groq() {
    return {
      apiKey: getEnv("GROQ_API_KEY"),
      model: getEnv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    };
  },
  get openrouter() {
    return {
      apiKey: getEnv("OPENROUTER_API_KEY"),
      model: getEnv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct"),
    };
  },
  get cloudflare() {
    return {
      accountId: getEnv("CLOUDFLARE_ACCOUNT_ID", "38d1ceb6731de305dc93daf3659e371c"),
      apiToken: getEnv("CLOUDFLARE_API_TOKEN"),
      workerUrl: getEnv("CLOUDFLARE_WORKER_URL", "https://revasy-api.widoxstudio.workers.dev"),
      model: getEnv("CLOUDFLARE_AI_MODEL", "@cf/meta/llama-3-8b-instruct"),
    };
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
