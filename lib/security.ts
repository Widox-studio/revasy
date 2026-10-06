// Content Security Policy & Cloudflare Edge best practices for Clerk & Widox SaaS
// Reference: https://clerk.com/docs/guides/secure/best-practices/csp-headers
const cspDirectives = [
  "default-src 'self' https://revasy.pages.dev",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev https://*.accounts.dev https://challenges.cloudflare.com https://*.protect.clerk.com https://revasy.pages.dev",
  "connect-src 'self' https://revasy.pages.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.accounts.dev https://*.clerk-telemetry.com https://clerk-telemetry.com https://*.protect.clerk.com:* https://img.clerk.com https://challenges.cloudflare.com https://photon.komoot.io https://nominatim.openstreetmap.org",
  "img-src 'self' data: blob: https://revasy.pages.dev https://img.clerk.com https://*.clerk.com https://*.clerk.accounts.dev https://*.accounts.dev https://*.googleusercontent.com https://*.openstreetmap.org",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.com https://*.clerk.accounts.dev https://*.accounts.dev https://*.protect.clerk.com https://maps.google.com https://www.google.com https://revasy.pages.dev",
  "form-action 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.accounts.dev https://accounts.google.com https://revasy.pages.dev",
];

export const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": cspDirectives.join("; "),
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};
