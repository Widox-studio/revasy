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
| F1 | Edge Build & Runtime | Stub `node:vm`, `worker_threads`, and `fs` in `scripts/build-cloudflare.js`; eliminate runtime 500 error | M1 | Survey (Explorer 1) |
| F2 | Static Asset Edge Delivery | Direct edge serving for `/_next/static/*`, `/favicon.ico`, `/icon-192.png`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml` | M1 | Survey (Explorer 1) |
| F3 | Cloudflare D1 Persistence | Asynchronous D1 queries (`SELECT`/`INSERT`) in `lib/business-store.ts` via `globalThis.DB` / `env.DB` | M2 | Survey (Explorer 2) |
| F4 | Places Autocomplete & Search | Location search in `/api/places/search` with Photon OSM geocoding and ChIJ Place ID parsing | M2 | Survey (Explorer 2) |
| F5 | Cloudflare Workers AI Engine | Workers AI inference in `lib/openai.ts` for `/api/review/generate` & `/api/admin/reply/generate` via `globalThis.AI` | M3 | Survey (Explorer 3) |
| F6 | Customer Review & Feedback Safeguard | 1-5 star review experience at `/b/cocova` with Private Feedback Safeguard for <= 3 stars | M3 | Survey (Explorer 3) |
| F7 | NFC/QR Table Stand Studio | Live SVG/canvas previews, print tent templates, multi-tenant creation at `/dashboard/new` | M4 | Survey (Explorer 1, 3) |
| F8 | Clerk Authentication & Security | Session protection on `/dashboard`, Google OAuth at `/login`, CSP compliance | M4 | Survey (Explorer 1, 3) |
| F9 | E2E Production Verification & QA | Pass `verify_saas.js`, live curl probes on `https://revasy.widox.in`, visual and browser QA | M4 | Survey (All) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Edge Build Pipeline & Runtime Stabilization | Patch `scripts/build-cloudflare.js` to stub `vm`/`worker_threads`/`fs`, bind `globalThis.DB`/`AI`, build and deploy, verify HTTP 200 on `https://revasy.widox.in` | none | IN_PROGRESS |
| 2 | M2: Cloudflare D1 Persistence & Core APIs | Wire asynchronous D1 queries into `lib/business-store.ts` and `/api/businesses` using `globalThis.DB`, ensure multi-tenant persistence | M1 | PLANNED |
| 3 | M3: Workers AI & Private Feedback Safeguard | Wire `globalThis.AI` into `lib/openai.ts`, implement private feedback capture in `BusinessReviewClient.tsx` for <= 3 stars | M1, M2 | PLANNED |
| 4 | M4: Production Verification & Victory QA | Execute `node verify_saas.js`, edge probes, browser tests against `https://revasy.widox.in`, forensic audit | M1, M2, M3 | PLANNED |

## Interface Contracts
### `scripts/build-cloudflare.js` -> Workerd Runtime
- Banner and replacement regexes must stub `node:vm` (`runInNewContext`, `createContext`), `node:worker_threads`, and `node:fs`.
- Fetch handler must bind `globalThis.DB = env.DB` and `globalThis.AI = env.AI`.

### `lib/business-store.ts` ↔ Cloudflare D1
- `getD1Binding()`: Resolves `(globalThis as any).DB || (process.env as any).DB`.
- `getAllBusinesses()`, `getBusinessesByOwner()`, `getBusinessBySlug()`: Return `Promise<Business[]>` or `Promise<Business | null>` querying table `businesses` via `db.prepare(...).all()`, falling back to `inMemoryBusinesses`.
- `saveBusiness(business)`: Executes `INSERT OR REPLACE INTO businesses ...` on D1 and updates in-memory cache.

### `lib/openai.ts` ↔ Cloudflare Workers AI
- `getCloudflareAiBinding()`: Resolves `(globalThis as any).AI || (process.env as any).AI`.
- Invokes `@cf/meta/llama-3.1-8b-instruct` via `ai.run()`, falling back to deterministic template generator.

### `components/review/BusinessReviewClient.tsx` ↔ Customer Review Experience
- For ratings 4–5: Continue to Google button copies text, triggers confetti, and opens `business.googleReviewUrl`.
- For ratings 1–3: Displays Private Feedback form / modal to submit private feedback directly to the business owner, preventing public review gating violations while safeguarding online reputation.

## Code Layout
- `scripts/build-cloudflare.js`: Cloudflare Pages build and bundler script.
- `lib/business-store.ts`: Database access and business repository.
- `lib/openai.ts`: Workers AI inference and mock fallback engine.
- `components/review/BusinessReviewClient.tsx`: Customer-facing review flow and feedback safeguard.
- `app/api/businesses/route.ts`: Merchant multi-tenant management API.
- `app/api/review/generate/route.ts`: Customer review polishing API.
- `app/api/admin/reply/generate/route.ts`: Merchant reply generation API.
