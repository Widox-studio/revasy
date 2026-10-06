# Revasy — Multi-Tenant Google Review & NFC Table Stand SaaS Platform

**Revasy** is an enterprise-grade, multi-tenant AI review acceleration and reputation management platform built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, designed for physical storefronts, cafes, clinics, salons, and retail chains.

---

## 🌐 Live URLs & Deployment

- **Custom Domain**: [https://revasy.widox.in](https://revasy.widox.in)
- **Cloudflare Edge**: [https://revasy.pages.dev](https://revasy.pages.dev)
- **GitHub Repository**: [https://github.com/Anand-kumar-dev/revasy](https://github.com/Anand-kumar-dev/revasy)

---

## 🚀 Key Features

### 1. Multi-Tenant Merchant System (`/dashboard`)
- **Self-Serve Onboarding**: Register any business with instant slug generation, category tagging, and custom AI prompt keywords.
- **Embedded Google Maps Place ID Finder**: Live interactive map with Nominatim & Photon geocoding search to automatically pinpoint physical storefronts and generate 1-click Google review deep-links (`writereview?placeid=...`).
- **NFC & QR Table Stand Studio**: Dynamic vector SVG QR codes with printable acrylic table stands in 6 designer themes (Teal, Pink, Peach, Lavender, Ochre, Mint).

### 2. High-Conversion Customer Review Experience (`/b/[slug]`)
- **Laws of UX Engineered**:
  - **Fitts's Law**: 48px touch targets and bottom sticky action bar for thumb ergonomics.
  - **Doherty Threshold**: Real-time shimmer skeleton loading states (<400ms feedback).
  - **Peak-End Rule**: Confetti celebration modal upon completion with 1-click auto-clipboard copy before jumping to Google Maps.
  - **Hick's Law**: Clean 3-tier card steps reducing cognitive load.
  - **Zeigarnik Effect**: Visual progress stepper (Rating $\to$ Highlights $\to$ Polish).
- **Anti-Hallucination AI Review Polisher**: Formulates authentic customer feedback into 3 tailored drafts (*Natural*, *Warm & Friendly*, *Short & Simple*) strictly without hallucinating items or staff.
- **Private Feedback Safeguard**: Ratings $\le 3$ stars route to private direct feedback to protect public ratings.

### 3. AI Owner Reply Generator (`/dashboard/[slug]`)
- Paste any incoming customer review to generate instant professional hospitality responses with 3 tones (*Professional*, *Warm*, *Concise*).

### 4. Enterprise Security & Architecture
- **Clerk Authentication**: Production auth with Google OAuth, session cookies, and developer demo bypass.
- **Hardened CSP**: Strict Content Security Policy compliant with Clerk and Cloudflare Edge bot detection.
- **Progressive Web App (PWA)**: Standalone installable PWA manifest with native mobile optimization.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.4 (Revasy Porcelain & Obsidian Slate theme)
- **Icons**: Lucide React
- **Auth**: Clerk (`@clerk/nextjs`) + HMAC signed sessions
- **AI Engine**: OpenAI GPT-4o-mini / OpenRouter compatible
- **Hosting**: Cloudflare Pages / Workers
- **DNS**: Spaceship DNS (`revasy.widox.in` CNAME `revasy.pages.dev`)

---

## 🧪 Testing & Quality Assurance

Run the automated test suites:

```bash
# Run SaaS multi-tenant test suite
npm test

# Run all verification suites
npm run test:all
```

---

## 📄 License
MIT © Revasy / Widox Studio
