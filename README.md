# Cocova Cafe - AI-Powered Google Review Assistant & Owner Reply Platform

A production-ready MVP built with **Next.js (App Router) + TypeScript + Tailwind CSS** for **Cocova Cafe**.

## Features

### ☕ 1. Customer Review Flow (`/review`)
- **NFC / QR Code Ready**: Point your table QR stands directly to `/review`.
- **Interactive 1–5 Star Rating**: Touch-friendly rating selector with friendly sentiment cues.
- **Genuine Thought Helpers**: Quick prompt chips (*"What did you enjoy?"*, *"How was the food/drinks?"*, *"How was the service?"*) to inspire natural reviews.
- **Strict Anti-Hallucination AI**: Server-side AI only polishes information provided by the customer; never invents items, staff, or fake details.
- **3 Polished Options**:
  - **Natural**: Everyday, balanced, conversational.
  - **Warm & Friendly**: Enthusiastic, grateful, neighborhood cafe vibe.
  - **Short & Simple**: Punchy 1–2 sentence summary.
- **Direct Google Redirection**: One-click **"Continue to Google"** copies the draft to the clipboard and opens Cocova Cafe's Google review URL.

### 🛡️ 2. Cafe Owner Reply Dashboard (`/admin`)
- **Protected Route**: Protected by HTTP-only, secure HMAC-signed session cookies.
- **Owner AI Reply Generator**: Paste any Google review, pick the rating, and generate 3 professional replies:
  - **Professional**: Formal, respectful hospitality standard.
  - **Warm**: Friendly, personal, neighborhood connection.
  - **Concise**: Quick 2-3 sentence acknowledgement.
- **Safe Hospitality Responses**: Never makes unvetted promises or invents policies.

### 🔒 3. Production Security & Performance
- **Zero Database / Zero CMS**: Stateless, lightweight, zero bloat.
- **Server-Side API Key Protection**: `OPENAI_API_KEY` never leaks to the client.
- **Sliding-Window Rate Limiting**: Built-in rate limiter protects AI endpoints against abuse.
- **Security Headers**: Standard production headers injected via `middleware.ts` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

---

## Architecture

```text
app/
  page.tsx                       # Branded landing page
  review/
    page.tsx                     # Customer NFC/QR review flow
  admin/
    login/
      page.tsx                   # Owner login
    page.tsx                     # Protected owner dashboard
  api/
    review/
      generate/
        route.ts                 # Customer review AI generation
    admin/
      reply/
        generate/
          route.ts               # Owner reply AI generation
      login/
        route.ts                 # Owner login & HTTP-only cookie
      logout/
        route.ts                 # Owner logout

components/
  review/                        # RatingSelector, ReviewForm, ReviewResults, QuickPromptChips
  admin/                         # ReplyGenerator, ReplyCard, AdminHeader
  ui/                            # Button, Card, Badge, Toast

lib/
  auth.ts                        # HMAC-SHA256 JWT session sign/verify
  openai.ts                      # OpenAI client & fallback generator
  validation.ts                  # Zod validation schemas & sanitization
  config.ts                      # Centralized configuration
  rate-limit.ts                  # Sliding-window in-memory IP rate limiter
  security.ts                    # Security headers configuration
```

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
# OpenAI API key (server-side only)
OPENAI_API_KEY=your_openai_api_key_here

# Cocova Cafe's official Google review link
COCOVA_GOOGLE_REVIEW_URL=https://search.google.com/local/writereview?placeid=ChIJplaceholder_cocova

# Cafe Owner single-account credentials
ADMIN_EMAIL=owner@cocovacafe.com
ADMIN_PASSWORD=CocovaSecure2026!

# Session signing secret (minimum 32 characters)
SESSION_SECRET=cocova-cafe-session-secret-change-in-production-2026-xyz
```

---

## Local Development & Build

```bash
# Navigate to project folder
cd D:\google-review-assistant

# Install dependencies (locked to Tailwind CSS 3.4)
npm install

# Run development server
npm run dev

# Run production build & typecheck
npm run build

# Start production server
npm run start
```

---

## Subdomain Configuration (`cocova.widox.in`)

For deployment with your Spaceship domain `widox.in`:
- **Record Type**: CNAME
- **Host / Name**: `cocova`
- **Target**: `cname.vercel-dns.com` (for Vercel) or your Pages deployment domain.
