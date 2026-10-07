# Project: Revasy SaaS Production Deployment & Edge Verification

## Architecture
- **Framework**: Next.js 14 App Router on Cloudflare Pages via `@opennextjs/cloudflare`.
- **Hosting & Edge**: Cloudflare Pages (`revasy`), custom domain `https://revasy.widox.in`, fallback `https://revasy.pages.dev`.
- **Database**: Cloudflare D1 SQL Database `revasy-db` (`52df4dc3-0470-4abb-a41d-c1d9c534defc`), tables `businesses`, `review_logs`, `_cf_KV`.
- **AI Inference**: Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`) bound via `env.AI` (`globalThis.AI`), with deterministic template failover.
- **Authentication**: Clerk Next.js SDK with session middleware guarding `/dashboard` routes, allowing public `/b/*`.
- **NFC/QR Studio**: Dynamic SVG/Canvas QR generation with print stylesheets and multi-tenant branding.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Edge Build & Runtime | Stub `node:vm`, `worker_threads`, and `fs` in `scripts/build-cloudflare.js`; eliminate runtime 500 error | M1 | Completed |
| F2 | Static Asset Edge Delivery | Direct edge serving for `/_next/static/*`, `/favicon.ico`, `/icon-192.png`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` | M1 | Completed |
| F3 | Cloudflare D1 Persistence | Asynchronous D1 queries (`SELECT`/`INSERT`) in `lib/business-store.ts` via `globalThis.DB` / `env.DB` | M2 | Completed |
| F4 | Places Autocomplete & Pin Resolution | Location search in `/api/places/search` with Photon OSM geocoding, shortlinks (`maps.app.goo.gl`), hex CID conversion, and `ChIJ` Place ID parsing in `GooglePlaceIdFinder.tsx` | M2 | Completed |
| F5 | Cloudflare Workers AI Engine | Workers AI inference in `lib/openai.ts` for `/api/review/generate` & `/api/admin/reply/generate` via `globalThis.AI` with multi-tier fallback | M3 | Completed |
| F6 | Customer Review & Feedback Safeguard | 1-5 star review experience at `/b/:slug` with Private Feedback Safeguard for <= 3 stars | M3 | Completed |
| F7 | NFC/QR Table Stand Studio | Live SVG/canvas previews, print tent templates, multi-tenant creation at `/dashboard/new` and `/dashboard/:slug` | M4 | Completed |
| F8 | Clerk Authentication & Security | Session protection on `/dashboard`, Google OAuth at `/login`, CSP compliance in `middleware.ts` & `lib/security.ts` | M4 | Completed |
| F9 | E2E Production Verification & QA | Pass `challenger_live_edge_stress.js` and `challenger_d1_persistence_stress.js` against `https://revasy.widox.in` (72/72 tests pass) | M4 | Completed |
| F10 | Private Management Feedback API | Asynchronous `/api/feedback` route saving low-rating feedback directly to Cloudflare D1 `review_logs` table | M3 | Completed |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Edge Build Pipeline & Runtime Stabilization | Patch `scripts/build-cloudflare.js` to stub `vm`/`worker_threads`/`fs`, bind `globalThis.DB`/`AI`, build and deploy, verify HTTP 200 on `https://revasy.widox.in` | none | COMPLETED |
| 2 | M2: Cloudflare D1 Persistence & Core APIs | Wire asynchronous D1 queries into `lib/business-store.ts` and `/api/businesses` using `globalThis.DB`, ensure multi-tenant persistence | M1 | COMPLETED |
| 3 | M3: Workers AI & Private Feedback Safeguard | Wire `globalThis.AI` into `lib/openai.ts`, implement private feedback capture in `BusinessReviewClient.tsx` for <= 3 stars and `/api/feedback` routing | M1, M2 | COMPLETED |
| 4 | M4: Production Verification & Victory QA | Execute live edge & D1 persistence stress harnesses against `https://revasy.widox.in`, forensic audit | M1, M2, M3 | COMPLETED |

## Interface Contracts
### `scripts/build-cloudflare.js` -> Workerd Runtime
- Banner and replacement regexes must stub `node:vm` (`runInNewContext`, `createContext`), `node:worker_threads`, and `node:fs`.
- Fetch handler binds `globalThis.DB = env.DB` and `globalThis.AI = env.AI`.
- Static assets served directly via `env.ASSETS.fetch(request)`.

### `lib/business-store.ts` ↔ Cloudflare D1
- `getD1Binding()`: Resolves `(globalThis as any).DB || (process.env as any).DB`.
- `getAllBusinessesAsync()`, `getBusinessesByOwnerAsync()`, `getBusinessBySlugAsync()`: Query table `businesses` via `db.prepare(...).all()`, falling back to `inMemoryBusinesses`.
- `saveBusinessAsync(business)`: Executes `INSERT OR REPLACE INTO businesses ...` on D1 and updates in-memory cache.
- `saveFeedbackAsync(feedback)`: Executes `INSERT INTO review_logs ...` on D1.

### `lib/openai.ts` ↔ Cloudflare Workers AI
- `getCloudflareAiBinding()`: Resolves `(globalThis as any).AI || (process.env as any).AI`.
- Multi-tier pipeline:
  1. Primary: `@cf/meta/llama-3.1-8b-instruct` via `ai.run()`.
  2. Secondary: Cloudflare Workers AI REST API via account token.
  3. Tertiary: OpenAI API fallback.
  4. Quaternary: Deterministic zero-hallucination template engine.

### `components/maps/GooglePlaceIdFinder.tsx` ↔ `/api/places/search`
- Supports geocoded search via Photon OSM and direct Google Maps link extraction (`maps.app.goo.gl`, `goo.gl/maps`, `/maps/place/`, hex CID, `ChIJ...`).
- Direct paste bar extracts exact Pin Name, official Google Place ID, and embed iframe URL.
- Live map preview provides link to open the exact business pin in Google Maps.

### `components/review/BusinessReviewClient.tsx` ↔ Customer Review Experience
- For ratings 4–5: Continue to Google button copies text, triggers confetti, and opens `business.googleReviewUrl`.
- For ratings 1–3: Displays Private Feedback form / modal to submit private feedback directly to the business owner via `/api/feedback`, preventing public review gating violations while safeguarding online reputation.

## Code Layout
- `scripts/build-cloudflare.js`: Cloudflare Pages build and bundler script.
- `lib/business-store.ts`: Database access and business repository (Cloudflare D1 & in-memory).
- `lib/openai.ts`: Workers AI inference and multi-tier fallback engine.
- `components/maps/GooglePlaceIdFinder.tsx`: Interactive Google Maps pin search and Place ID extractor.
- `components/review/BusinessReviewClient.tsx`: Customer-facing review flow and feedback safeguard.
- `app/api/businesses/route.ts`: Merchant multi-tenant management API.
- `app/api/places/search/route.ts`: Google Maps pin and Place ID resolution API.
- `app/api/feedback/route.ts`: Customer private feedback submission API.
- `app/api/review/generate/route.ts`: Customer review polishing API.
- `app/api/admin/reply/generate/route.ts`: Merchant reply generation API.
- `app/dashboard/`: SaaS admin dashboard (overview, `/new` onboarding, `/[slug]` QR & NFC studio).
- `tests/challenger_live_edge_stress.js`: Live edge probe suite.
- `tests/challenger_d1_persistence_stress.js`: Live D1 database persistence test suite.
