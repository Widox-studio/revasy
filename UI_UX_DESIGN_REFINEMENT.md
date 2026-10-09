# Revasy — Production UI/UX Design Refinement Specification

> **Document Type:** Production UI/UX Refinement Master Specification  
> **Target Repository:** `D:\widox\revasy`  
> **Status:** Source of Truth for Implementation  
> **Philosophy:** Systematic Refinement — NOT a Redesign. Same Product, Same Architecture, Commercial SaaS Polish.

---

## 1. Executive Summary & Core Objective

### 1.1 Objective
Transform the existing Revasy application into an uncompromising, production-grade SaaS product. Revasy already possesses sound architectural bones, robust dual-runtime persistence (Edge D1 + Node filesystem), multi-tenant business models, AI review generation, and native Google Maps deep linking. 

This specification directs a **focused, high-craft refinement pass** to eliminate prototype artifacts, harmonize design tokens, elevate visual hierarchy, and ensure seamless mobile and desktop ergonomics without breaking any existing business logic or API contracts.

### 1.2 Target Aesthetic
- **Minimal + Modern SaaS + Restrained Elegance**
- Calm, intentional slate canvas (`#f8fafc`) with Obsidian Slate typography (`#0f172a`) and Electric Revasy Indigo primary accents (`#4f46e5`).
- Tactile, responsive micro-interactions (subtle `scale(0.98)` press states, gentle 2px hover lifts, smooth Doherty-threshold skeleton shimmers).
- Clean typographic contrast between Display (`Bricolage Grotesque`) and Body (`Inter`).
- Trustworthy, finished commercial product feeling — never template-like, over-gradiented, or toyish.

### 1.3 Strict Constraints & Non-Negotiable Rules
1. **Zero Redesign / Rebuild:** Preserve all existing routes, components, data flows, validation schemas, and database mappings.
2. **Feature Preservation:** All core features (voice/text capture, rating selection, 3 AI drafts, inline draft editing, 1-click clipboard copy, native Maps deep-linking, return detection celebration, private feedback routing for ratings $\le 3$, multi-business dashboard, QR stand simulator, AI reply generation) must remain fully operational.
3. **TypeScript Strictness:** Every component modification must maintain 100% type safety (`npx tsc --noEmit` must pass with 0 errors).
4. **No Dev Server Launch or Git Commits:** Do not run long-running server processes or make git commits without explicit instruction.

---

## 2. Product Architecture & User Journey Map

```
                                      REVASY ARCHITECTURE
                                      
  [In-Store Customer Flow]                                  [Merchant Operations Flow]
             │                                                          │
             ▼                                                          ▼
     NFC Tap / QR Scan                                          Merchant Login
    `https://.../b/[slug]`                                         `/login`
             │                                                          │
             ▼                                                          ▼
  [Step 1: Capture Experience]                                 Multi-Business Dashboard
  - Star Rating (1 - 5)                                               `/dashboard`
  - Highlight Prompt Chips                                              │
  - Freeform Textarea (0-1000)                                          ├── Add Location (`/dashboard/new`)
             │                                                          │   - Google Places Autocomplete
             ├──────────────────────────┐                               │   - Interactive Map Pinning
             ▼                          ▼                               │   - Accent Theme & Chip Editor
      [Rating >= 4]              [Rating <= 3]                          │
             │                          │                               └── Location Workspace (`/dashboard/[slug]`)
             ▼                          ▼                                   - Stand Kit & QR Generator
      AI Draft Generation       Private Safeguard                           - Printable Table Tent Card
      (3 Authentic Styles)      - Direct Owner Email                        - AI Google Reply Generator
             │                  - Private Feedback API                      - Profile & Target URL Settings
             ▼                          │
    Review Selection Card               ▼
    - Warm / Natural / Short    Manager Receives
    - In-place Inline Edit      Private Feedback Note
    - 1-Click Clipboard Copy
             │
             ▼
   Google Review Launch
   `components/review/GoogleReviewLaunchModal`
   - Android Intent URI (`intent://...`)
   - iOS Universal Link
   - Desktop Web Window
             │
             ▼
     Return Detection
     (`visibilitychange` / `pageshow`)
             │
             ▼
  Celebratory Success Screen
  - Contributor Badge
  - Animated Check & Confetti
  - Web Share API Link
```

---

## 3. Design Token Harmonization & System Audit

### 3.1 Color Token Matrix & Audit Findings
Inspection of `tailwind.config.ts`, `app/globals.css`, and `lib/theme.ts` revealed several naming divergences and token decouplings that must be cleaned up in the refinement pass.

#### A. Core Neutral Tokens
| Token Name | Hex Code | Semantic Role | Tailwind Class | CSS Variable |
|---|---|---|---|---|
| `canvas` | `#f8fafc` | Base application canvas (Porcelain Slate) | `bg-canvas` | `--color-canvas` |
| `ink` | `#0f172a` | Primary headline & high-contrast text | `text-ink` | `--color-ink` |
| `body-strong` | `#1e293b` | Secondary titles & strong body copy | `text-body-strong` | `--color-body-strong` |
| `body` | `#334155` | Primary body prose & labels | `text-body` | `--color-body` |
| `muted` | `#64748b` | Subtitles, hints, and secondary icons | `text-muted` | `--color-muted` |
| `muted-soft` | `#94a3b8` | Placeholders, disabled states, counters | `text-muted-soft` | `--color-muted-soft` |
| `hairline` | `#e2e8f0` | Standard component border divider | `border-hairline` | `--color-hairline` |
| `hairline-soft` | `#f1f5f9` | Subtle internal card divider | `border-hairline-soft` | `--color-hairline-soft` |

#### B. Surface Hierarchy Tokens
| Surface Token | Hex Code | Use Case |
|---|---|---|
| `surface.card` | `#ffffff` | Elevated primary cards, form containers, modal sheets |
| `surface.soft` | `#f1f5f9` | Inset input backgrounds, subtle chip fills, table striping |
| `surface.strong` | `#e2e8f0` | Active hover states, selected chip borders, divider rules |
| `surface.dark` | `#0f172a` | Toast notification cards, high-contrast dark banners |
| `surface.dark-elevated` | `#1e293b` | Tooltip overlays, dark dropdown popovers |

#### C. Brand Accent System
| Theme Key | Hex Code | Display Name | Best Suited For |
|---|---|---|---|
| `teal` | `#0d9488` | Deep Emerald-Teal | Modern Healthcare, Dental, Tech, Professional Services |
| `pink` | `#6366f1` | Electric Indigo-Violet *(flagship)* | Cafes, Diners, High-Growth Retail *(Note: Legacy named 'pink')* |
| `peach` | `#f97316` | Warm Coral-Peach | Bakeries, Artisan Sweets, Bistros, Cozy Eateries |
| `lavender` | `#8b5cf6` | Royal Luxe Violet | Hair Salons, Spas, Wellness Clinics, Boutiques |
| `ochre` | `#f59e0b` | Golden Warm Amber | Automotive, Garages, Fitness Centers, Bars |
| `mint` | `#10b981` | Fresh Mint-Emerald | Organic Markets, Clean Health, Yoga Studios |
| `coral` | `#f43f5e` | Vivid Coral-Rose | Special Events, Nightlife, Florists |

#### D. Critical Color Audits to Harmonize:
1. **The `brand.pink` Legacy Misnomer**: In `tailwind.config.ts`, `brand.pink` is set to `#6366f1` (Tailwind Indigo 500), marked as `// Revasy Indigo-Violet Flagship Accent`. All code referring to `brand-pink` renders as vibrant indigo/violet, not pink. In the refinement pass:
   - Keep `brand.pink: "#6366f1"` for backward-compatibility with saved `data/businesses.json`.
   - Add an alias `brand.indigo: "#4f46e5"` and `brand.violet: "#6366f1"`.
   - Ensure `Toast.tsx` uses emerald/mint for success notifications instead of `text-brand-pink`.
2. **`Badge.tsx` Token Bypass**: In `components/ui/Badge.tsx`, the component bypasses theme tokens and contains a dead coffee shop artifact `"espresso"` (identical to `"indigo"`). Refine `Badge.tsx` to map cleanly to the token system.
3. **CSS Variables vs Tailwind Hex**: `app/globals.css` defines `:root` variables, but `tailwind.config.ts` hardcodes hex codes. Harmonize so changing custom properties updates utilities consistently.

---

### 3.2 Typography Tokens & Hierarchy
Revasy uses a two-font typographic architecture loaded in `app/layout.tsx`:

| Family Token | Font Face | Weights | Usage In Application |
|---|---|---|---|
| `font-display` | `Bricolage Grotesque` | 500 (Medium), 600 (SemiBold), 700 (Bold) | Hero headlines, section titles, business titles, primary CTA text |
| `font-sans` / `font-body` | `Inter` | 400 (Regular), 500 (Medium), 600 (SemiBold) | Body copy, input fields, review draft prose, meta stats, badges |
| `font-hand` | `Kalam` *(optional)* | 400, 700 | Handwritten note annotations on table-tent stand preview |

#### Typography Fix Required:
`font-hand` is registered in `tailwind.config.ts`, but `Kalam` is **not imported** in `app/layout.tsx`. If `font-hand` is used, it falls back to system cursive (e.g., Segoe Print / Comic Sans). Either load `Kalam` in `app/layout.tsx` or gracefully fallback to `Inter` italic.

#### Standard Type Scale:
- **Hero Title (`H1`)**: `text-4xl sm:text-5xl md:text-6xl font-display font-medium tracking-[-0.03em] leading-[1.08]`
- **Section Heading (`H2`)**: `text-2xl sm:text-3xl font-display font-semibold tracking-[-0.02em]`
- **Card Title (`H3`)**: `text-lg sm:text-xl font-display font-semibold tracking-[-0.01em]`
- **Sub-headline / Body Large**: `text-base sm:text-lg text-body leading-relaxed`
- **Body Standard**: `text-sm text-body leading-relaxed`
- **Caption / Meta**: `text-xs text-muted leading-normal`
- **Micro-Label / Pill Badge**: `text-[10px] sm:text-[11px] font-bold uppercase tracking-wider`

---

### 3.3 Elevation & Shadows
The shadow system conveys tactile elevation and separation:

| Token | Box Shadow Definition | Intended Component |
|---|---|---|
| `shadow-subtle` | `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)` | Default cards, secondary buttons, input wrappers |
| `shadow-card` | `0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)` | Elevated review cards, dashboard summary containers |
| `shadow-revasy` | `0 10px 30px -4px rgba(79, 70, 229, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.04)` | Flagship primary CTA buttons, hero callouts |
| `shadow-floating` | `0 20px 40px -10px rgba(15, 23, 42, 0.12)` | Toast notifications, floating sticky thumb action bar, dialogs |
| `shadow-glow` | `0 0 20px -2px rgba(79, 70, 229, 0.25)` | NFC active state focus, celebration glow |

> **Audit Warning:** The legacy shadow `shadow-widox` is hardcoded across multiple files. It should be alias-mapped to `shadow-revasy` in `tailwind.config.ts` and systematically replaced.

---

### 3.4 Corner Radii Standards
- **Small (`rounded-lg`, 8px)**: Small buttons (`size="sm"`), nested action toggles, badge chips.
- **Medium (`rounded-xl`, 12px)**: Inputs, textareas, standard buttons (`size="md"`), table tent preview frames.
- **Large (`rounded-2xl`, 16px)**: Standard cards, draft selection cards, modal cards, large buttons (`size="lg"`).
- **Extra Large (`rounded-3xl`, 24px)**: Outer page section wrappers, mobile simulated device frames.
- **Pill (`rounded-pill` / `rounded-full`, 9999px)**: Status badges, category pills, verified indicator, quick prompt chips.

---

### 3.5 Micro-Interactions & Animation Standards
- **Tactile Press (`.press`)**:  
  `transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, box-shadow 0.15s ease;`  
  Active state: `transform: scale(0.98);` (Fitts's Law tactile feedback on touch devices).
- **Card Hover Lift (`.card-hover`)**:  
  `transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;`  
  Hover state: `transform: translateY(-2px); shadow-card;`
- **Skeleton Shimmer (`.shimmer-box`)**:  
  Linear gradient animation running at 1.8s infinite linear. Harmonize duration between `tailwind.config.ts` (2s) and `globals.css` (1.8s) to exactly 1.8s.

---

## 4. Screen-by-Screen Refinement Specifications

---

### Screen 1: Landing Page (`/` — `app/page.tsx`)

#### Current State Analysis:
A well-structured marketing page showcasing value proposition, 3 live business demo cards, a comparison table (Old Friction-Heavy Way vs Revasy Assistant Way), and 3 onboarding steps. Uses Clerk for authentication modal triggers.

#### Refinement Requirements:
1. **Typography & Token Alignment**:
   - Replace hardcoded `bg-indigo-600 hover:bg-indigo-700` with `bg-primary hover:bg-primary-hover` on main CTA buttons.
   - Replace `selection:bg-indigo-100 selection:text-indigo-900` with the global `:selection` token.
   - Refine the hero gradient text: `from-indigo-600 via-indigo-700 to-violet-600` is slightly harsh; soften with subtle letter-spacing adjustment (`tracking-[-0.03em]`).
2. **Demo Cards Refinement**:
   - The 3 cards (`Cocova Cafe`, `Apex Smile Dental`, `Luxe Studio & Hair Spa`) should feature subtle accent color indicators in the category badge.
   - Add a subtle "Tap to test guest flow" pill with an animated arrow on hover to improve discoverability.
3. **Friction vs Solution Matrix**:
   - The rose/emerald cards (`bg-rose-50/60`, `bg-emerald-50/60`) currently look slightly utilitarian.
   - Refine border hairlines to `border-rose-200/50` and `border-emerald-200/50`, add `shadow-subtle`, and improve list item vertical rhythm (`py-1`).
4. **Header Navigation**:
   - Elevate the glassmorphism blur: `backdrop-blur-md` with `bg-white/70 border-b border-hairline/80`.
   - Ensure the Clerk `UserButton` container has identical height to the sign-in buttons for zero layout shift upon auth load.

---

### Screen 2: Public Guest Review Experience (`/b/[slug]` — `BusinessReviewClient.tsx`)

#### Current State Analysis:
This is the most critical screen in the entire application. It is accessed by real customers in physical stores via NFC puck or QR code scan on their mobile devices. It manages a two-step review flow:
1. Rating & note capture
2. 3 AI draft presentations with inline editing and copy/handoff triggers
Includes a private resolution safeguard banner for $\le 3$ stars, return detection listener, and celebratory success screen.

#### Refinement Requirements:

```
┌────────────────────────────────────────────────────────┐
│  ← revasy.            Cocova Cafe            ✓ Verified│
├────────────────────────────────────────────────────────┤
│  [Step 1: Rate & Share]       [Step 2: Pick & Post]    │
│  █████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
├────────────────────────────────────────────────────────┤
│                     [Store Logo]                       │
│                     Cocova Cafe                        │
│             Artisan Coffee & Warm Moments              │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         How was your experience today?           │  │
│  │            ★   ★   ★   ★   ★                 │  │
│  │           [🌟 Exceptional / Loved It!]            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Tell us a little about your visit                │  │
│  │ [ Textarea with smooth focus ring               ]│  │
│  │ 120 / 1000 characters      AI polishes feedback  │  │
│  │                                                  │  │
│  │ ✨ Tap to add quick highlights:                  │  │
│  │ [+ Amazing coffee] [+ Friendly staff] [+ Pastries]│  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ✨ Create My Review Drafts                       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

1. **Header & Verified Badge**:
   - The verified badge is now positioned after the business name. Ensure the verified checkmark is a crisp SVG `Check` icon inside a small green circle (`w-3.5 h-3.5 text-emerald-600`) with zero clipping.
   - Text truncation on `business.name` should be responsive (`max-w-[160px] sm:max-w-[220px]`) so long business names do not crowd the badge on small screens (iPhone SE / 375px width).
2. **Rating Selector Ergonomics (Fitts's Law)**:
   - Ensure minimum 48px $\times$ 48px touch targets for each star button.
   - Refine the sentiment badge (`RatingSelector.tsx`) to render with high-contrast text and a subtle backdrop tint.
3. **Private Resolution Safeguard ($\le 3$ Stars)**:
   - When 1, 2, or 3 stars are selected, the alert banner appears.
   - Refine typography: ensure the warning reads constructively ("We want to make this right — tell the management directly").
   - **Crucial Fix**: In line 434 of `BusinessReviewClient.tsx`, replace the hardcoded fallback email `mailto:${business.ownerEmail || "contact@widox.in"}` with `mailto:${business.ownerEmail || "support@revasy.com"}`.
4. **Highlight Prompt Chips**:
   - Prompt chips must wrap cleanly without horizontal scroll.
   - Active selected chip: `theme.activeButton` with a checkmark icon and slight elevation.
   - Unselected chip: `bg-surface-card hover:bg-surface-soft border-hairline` with a subtle `+` prefix.
   - Micro-interaction: `active:scale-95` on touch.
5. **Doherty Threshold Shimmer Screen**:
   - During AI generation (`isGenerating`), the shimmer skeleton must display 3 placeholder cards matching the exact layout of the eventual review cards to prevent cumulative layout shift (CLS).
   - Rotating status phrases cycle every 700ms. Refine transitions so text fades smoothly between phrases (`transition-opacity duration-200`).
6. **Draft Selection Cards (Step 2)**:
   - The 3 cards: "Warm & Friendly" (Recommended), "Natural & Balanced", "Short & Simple".
   - Selected card: `theme.cardSelected` (`ring-2 ring-brand-*/20 border-brand-* shadow-card bg-white`).
   - In-place textarea edit mode: When "Edit" is tapped, expand textarea smoothly with auto-focus and clear "Done Editing" button.
   - Individual draft copy button: Display feedback ("Copied!") for 2000ms.
7. **Floating Sticky Bottom Bar**:
   - Constrained within `max-w-md mx-auto`.
   - Floating elevation: `shadow-floating rounded-3xl border border-hairline bg-canvas/95 backdrop-blur-md p-3.5`.
   - Primary "Continue to Google" button must feature the official 4-color Google 'G' icon or high-contrast Google Maps icon.

---

### Screen 3: Google Maps Launch Assistant Modal (`GoogleReviewLaunchModal.tsx`)

#### Current State Analysis:
A walkthrough modal that opens when the customer taps "Continue to Google". It informs the customer that their draft has been copied and instructs them on what to do when Google Maps opens.

#### Refinement Requirements:
1. **Backdrop & Animation**:
   - Backdrop: `bg-black/50 backdrop-blur-sm animate-fadeIn`.
   - Dialog card: `animate-scaleIn rounded-3xl bg-surface-card border border-hairline shadow-floating p-6 sm:p-7 max-w-sm w-full mx-4`.
2. **Three-Step Walkthrough Visuals**:
   - **Step 1**: "Star rating confirmed" (displays the selected number of filled amber stars).
   - **Step 2**: "Draft copied to clipboard" (displays preview snippet of copied text with a green checkmark).
   - **Step 3**: "Paste & publish on Google" (indicates where to paste on the Google Maps screen).
3. **Platform-Specific Button Copy**:
   - On Android: "Open Google Maps App" (triggers intent URL).
   - On iOS: "Continue to Google Maps" (triggers universal link).
   - On Desktop: "Open Google Review Window" (triggers window.open).
4. **Auto-Return Notification Note**:
   - Add a subtle foot-note: "We'll be right here waiting when you return!" to prime the user for the celebratory success screen.

---

### Screen 4: Celebratory Success Screen (`BusinessReviewClient.tsx` & `ReviewResults.tsx`)

#### Current State Analysis:
When the customer returns from Google Maps, session detection (`checkReviewReturn()`) fires Confetti and transitions the screen to the completion state.

#### Refinement Requirements:
1. **Visual Hierarchy**:
   - Glowing animated check icon: double pulse rings with emerald tones (`bg-emerald-400/20 animate-ping` and central `CheckCircle2` in `text-emerald-600`).
   - "Verified Google Review Contributor" pill badge.
   - Headline: "Thank You for Your Review! 🎉".
2. **Review Summary Card**:
   - Displays the selected star rating and quotation snippet in an italicized container (`bg-surface-soft/60 border border-hairline rounded-2xl p-4`).
3. **Sharing & Next Actions**:
   - Primary button: "Share This Business Page" utilizing the native Web Share API (`navigator.share`), falling back to copying URL.
   - Secondary button: "Write Another Review" (resets state cleanly to step 1).

---

### Screen 5: Multi-Tenant Business Dashboard (`/dashboard` — `app/dashboard/page.tsx`)

#### Current State Analysis:
Overview page for business owners and platform admins. Displays multi-business metric cards, category filters, a search bar, and a responsive grid of registered business cards.

#### Refinement Requirements:
1. **Metrics Bar Refinement**:
   - Currently uses three plain text cards for "Locations", "Reviews AI", and "Replies AI".
   - Refine into modern SaaS metric widgets:
     - Locations: Slate background, `Building2` icon, count.
     - Reviews AI: Soft teal background (`bg-brand-teal/5 border-brand-teal/20`), `Sparkles` icon, review generation count.
     - Replies AI: Soft indigo background (`bg-brand-pink/5 border-brand-pink/20`), `MessageSquareQuote` icon, reply generation count.
2. **Search & Filter Controls**:
   - The search input must have an explicit clear button (`X`) when a query is entered.
   - Category filter pills ("All", "Cafes", "Dental", "Salons"):
     - Selected: `bg-primary text-on-primary border-primary shadow-sm`.
     - Unselected: `bg-surface-card hover:bg-surface-strong border-hairline text-ink`.
3. **Business Cards Grid**:
   - Card container: `bg-white rounded-2xl border border-hairline p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between`.
   - Card actions:
     - Primary button: "Manage & AI Replies" with `bg-primary hover:bg-primary-hover text-on-primary` (replace legacy `hover:bg-black`).
     - Secondary button: "View Guest Review Flow" with external link icon.
4. **Empty State Polish**:
   - Refine the empty search state with a dedicated "Clear Search" button and cleaner empty graphic.
5. **Footer Branding**:
   - **Crucial Fix**: Line 335 currently reads `"Widox Google Review Assistant Platform • Made with pride in India"`. Change to `"Revasy Review Assistant • Multi-Location Operations Platform"`.

---

### Screen 6: New Business Registration & Map Picker (`/dashboard/new` — `app/dashboard/new/page.tsx`)

#### Current State Analysis:
A split-screen registration flow:
- Left Column (7 cols): Form with logo upload, Google Places autocomplete search, business name, slug, category selector, tagline, Google review URL, Place ID finder, brand accent color picker, and custom prompt chip editor.
- Right Column (5 cols): Live simulated mobile device preview.

#### Refinement Requirements:
1. **Google Maps Search & Auto-Fill Ergonomics**:
   - The Google Places search bar takes full width at the top of the form with an "Auto-fills Details" badge.
   - When a location is selected from Google Maps:
     - Auto-fill Business Name.
     - Auto-fill slug with sanitized lowercase hyphenated string.
     - Auto-fill Google Review URL with exact Place ID.
     - Display the pinned location preview card with live embedded Google Map iframe.
2. **Brand Accent Color Selector**:
   - Display the 6 accent choices (`teal`, `pink/indigo`, `peach`, `lavender`, `ochre`, `mint`).
   - Selected button: display an active ring and checkmark inside the color swatch circle for color-blind accessibility.
3. **Prompt Chips Editor**:
   - Limit to 8 chips.
   - Chip items: display text with a discrete delete button (`x`).
   - Add input: supports pressing Enter to add chip immediately.
4. **Live Mobile Preview (Right Column)**:
   - Sticky positioned (`sticky top-24`).
   - Simulated device bezel: `border-2 border-hairline rounded-3xl p-5 shadow-card bg-canvas`.
   - Live updates to Name, Tagline, Category icon, and Prompt chips in real-time as the merchant types.

---

### Screen 7: Individual Business Workspace & Stand Kit (`/dashboard/[slug]` — `app/dashboard/[slug]/page.tsx`)

#### Current State Analysis:
Location-specific management hub with three tabs:
1. **AI Google Reply Generator**
2. **NFC & QR Stand Kit**
3. **Business Profile Settings**

#### Refinement Requirements:
1. **Header & Summary Card**:
   - Location logo, business name, category badge, public URL copy button, and location-specific metrics.
2. **Tab 1: AI Google Review Reply Generator**:
   - Rating input (1-5 stars) + reviewer name + pasted customer review textarea.
   - Output cards: 3 distinct hospitality-grade replies ("Professional", "Warm & Friendly", "Concise").
   - Each card has word count, character count, and a 1-click "Copy Reply" button that updates to "Copied!" with tactile feedback.
3. **Tab 2: NFC & QR Stand Kit Simulator**:
   - **Material Backdrop Switcher**: Allows merchant to preview their table tent stand on Studio Canvas, Cafe Wood (`from-[#3b2317] to-[#1c0e08]`), or Marble Desk.
   - **Printable Table Tent Card**:
     - Branded color bar at the top (`theme.bar`).
     - Merchant logo and title.
     - High-contrast generated QR code.
     - "Tap NFC or Scan QR" callout with 5 stars.
     - Footer: **Fix legacy branding** — change `"Powered by Widox Review Assistant"` to `"Powered by Revasy Review Assistant"`.
   - **Download Actions**:
     - High-Res PNG QR code download button.
     - "Print Table Tent Card" button (triggers `@media print` layout which hides all navigation and formats strictly to a 90mm table card).
4. **Tab 3: Settings**:
   - Sync from Google Maps button to re-fetch verified Place ID and update URL.
   - Form save button with loading indicator and toast confirmation.

---

### Screen 8: Authentication Portal (`/login` — `app/login/page.tsx`)

#### Current State Analysis:
Unified authentication portal supporting both Clerk Google Sign-In and one-click demo logins for Cocova Cafe Owner (`owner@cocovacafe.com`) and Revasy Super Admin (`admin@revasy.com`).

#### Refinement Requirements:
1. **Visual Polish**:
   - Centered card: `bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-card max-w-md w-full`.
   - Brand header with `revasy.` logo and indigo dot.
2. **Google OAuth Button**:
   - Official 4-color Google 'G' icon with `bg-primary hover:bg-[#1a1a1a] text-on-primary rounded-xl`.
3. **Demo Quick Access Card**:
   - Slate container (`bg-slate-50 border border-hairline rounded-2xl p-4`).
   - One-click buttons with auto-fill badges ("☕ Cocova Cafe Owner" and "⚡ Revasy Super Admin").
   - Instant authentication and redirect to `/dashboard`.

---

### Screen 9: 404 Not Found Screen (`app/not-found.tsx`)

#### Current State Analysis:
Basic 18-line 404 page.

#### Refinement Requirements:
1. Elevate to match SaaS visual design:
   - Centered 64px rounded card with indigo `404` icon.
   - Headline: "Page Not Found".
   - Descriptive copy: "The business review page or dashboard resource you requested does not exist or has moved."
   - Primary button: "Return to Revasy Home" with `Button variant="primary"` and `shadow-revasy`.

---

## 5. Component-by-Component Refinement Guidelines

### 5.1 `components/ui/Button.tsx`
- **Variants**: `primary`, `secondary`, `teal`, `pink`, `amber`, `outline`, `ghost`.
- **Sizes**: `sm` (36px min-h), `md` (44px min-h), `lg` (48px min-h).
- **Refinements**:
  - Add `revasy` variant alias to `primary`.
  - Ensure focus rings use `focus-visible:ring-2 focus-visible:ring-offset-2`.
  - Harmonize `active:scale-98` with `.press` behavior.
  - Fix loading state: ensure spinner maintains button height and width to prevent layout shifts.

### 5.2 `components/ui/Card.tsx`
- **Variants**: `default`, `elevated`, `flat`, `bordered`.
- **Refinements**:
  - Standardize inner padding across cards: `p-5 sm:p-6`.
  - Maintain `rounded-2xl` on mobile, scaling to `sm:rounded-3xl` on elevated cards.
  - Border token: always `border-hairline` (`#e2e8f0`).

### 5.3 `components/ui/Badge.tsx`
- **Variants**: `neutral`, `amber`, `indigo`, `green`, `teal`.
- **Refinements**:
  - Remove deprecated `"espresso"` variant alias.
  - Ensure all variants use `rounded-pill` (`9999px`) with `text-[10px] sm:text-xs font-semibold uppercase tracking-wider`.
  - Ensure border contrast meets WCAG AA standards.

### 5.4 `components/ui/Toast.tsx`
- **Types**: `success`, `error`, `info`.
- **Refinements**:
  - Fix `info` icon: change from `CheckCircle2` to `Info` icon.
  - Fix `success` icon color: change from `text-brand-pink` (which renders indigo) to `text-emerald-400` or `text-brand-mint`.
  - Container positioning: `fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none`.
  - Card elevation: `shadow-floating backdrop-blur-md rounded-2xl`.

### 5.5 `components/ui/Confetti.tsx`
- **Refinements**:
  - Align particle palette with brand tokens: include Electric Indigo (`#4f46e5`), Royal Violet (`#8b5cf6`), Mint Emerald (`#10b981`), Amber (`#f59e0b`), Coral Rose (`#f43f5e`), and Brand Teal (`#0d9488`).
  - Maintain canvas origin at `height * 0.7` for upward celebratory burst.
  - Retain auto-teardown after 2500ms.

### 5.6 `components/review/RatingSelector.tsx`
- **Refinements**:
  - Ensure 48px tap targets for mobile index/thumb tapping.
  - Hover / active state scale: `hover:scale-110 active:scale-95`.
  - Drop shadow on active stars: `drop-shadow-[0_4px_12px_rgba(245,158,11,0.45)]`.
  - Dynamic sentiment pill badge: smooth `animate-fadeIn` on rating transition.

### 5.7 `components/review/QuickPromptChips.tsx`
- **Refinements**:
  - Rating-aware suggestion list: positive suggestions for ratings $\ge 4$, constructive suggestions for ratings $\le 3$.
  - Clear toggle state: `theme.activeButton` with checkmark icon when selected, hairline border with `+` when unselected.

### 5.8 `components/maps/GooglePlacesAutocompleteInput.tsx` & `GooglePlaceIdFinder.tsx`
- **Refinements**:
  - Seamless input styling matching design system (`rounded-xl border border-hairline bg-surface-soft/40 focus:ring-2 focus:ring-brand-teal`).
  - Dropdown suggestion list: elevated card (`bg-white border border-hairline shadow-floating rounded-2xl overflow-hidden`).
  - Pinned place preview card: emerald border with map icon and verified checkmark.

---

## 6. UX Laws & Accessibility Guidelines

### 6.1 Fitts's Law (Touch Target Ergonomics)
- On mobile devices, all interactive elements (star ratings, prompt chips, copy buttons, form inputs) must maintain a minimum touch target size of **$44 \times 44$ px** (recommended **$48 \times 48$ px** for primary actions).
- The primary CTA on `/b/[slug]` ("Continue to Google") is anchored in a **sticky bottom bar** within the natural sweep radius of the user's thumb.
- Add `pb-safe` to containers to guarantee content is never obstructed by the iOS Safari home indicator bar.

### 6.2 Hick's Law & Miller's Law (Cognitive Load Reduction)
- **2-Step Progress Funnel**: The guest review flow is strictly bifurcated into two stages:
  - Step 1: Capture (Rating + Highlights)
  - Step 2: Handoff (Pick 1 of 3 polished drafts $\rightarrow$ Continue to Google)
- Never present more than 3 review drafts simultaneously.
- Limit prompt chips to 8 per business, chunked logically into common visit highlights.
- Metric cards on dashboards are chunked into 3 distinct numbers (`Locations`, `Reviews AI`, `Replies AI`).

### 6.3 Doherty Threshold (< 400ms Feedback)
- Any action exceeding 200ms (AI review generation, reply generation, image upload, place search) must immediately render an active loading state.
- During AI review generation, skeleton placeholders (`.shimmer-box`) appear instantly, paired with rotating descriptive status phrases ("Reading visit highlights...", "Polishing authentic styles...", "Formatting for Google...").
- Copy actions must yield immediate visual feedback ("Copied!" badge + haptic visual cue).

### 6.4 Jakob's Law (Familiarity & Conventions)
- Use standard, recognized form conventions (clear labels, explicit placeholders, visible focus states, password visibility toggle).
- The Google Maps handoff features the standard Google branding so customers immediately understand where their review is heading.

---

## 7. Native Mobile Polish & Deep Linking Protocol

### 7.1 Android Intent URI Protocol
In `lib/maps-launcher.ts`, Android devices must receive a native Intent URI:
```
intent://search.google.com/local/writereview?placeid={PLACE_ID}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url={ENCODED_WEB_URL};end
```
- **Primary outcome**: Opens the native Google Maps app directly to the write-review modal.
- **Fallback outcome**: If the Maps app is uninstalled or blocked, Chrome automatically opens the review page.
- **Safety timer**: A 1200ms blur listener detects if the app was launched; if the browser remains visible, `window.open(fallbackWebUrl)` fires automatically.

### 7.2 iOS Universal Link Protocol
- iOS Safari and Chrome process clean HTTPS URLs (`https://search.google.com/local/writereview?placeid={PLACE_ID}`).
- iOS automatically redirects to the native Google Maps app if installed; otherwise, it opens directly in Safari.

### 7.3 Return Detection & Auto-Celebration
- When the customer taps "Continue to Google", `markReviewLaunched()` stores a timestamp in `sessionStorage`.
- `BusinessReviewClient.tsx` and `ReviewResults.tsx` attach event listeners to:
  - `document.addEventListener("visibilitychange", ...)`
  - `window.addEventListener("pageshow", ...)`
  - `window.addEventListener("focus", ...)`
- When the customer returns to the Revasy browser tab after posting their review on Google, `checkReviewReturn()` detects that $\ge 2500$ ms have elapsed, closes any open launch modal, bursts confetti, and renders the celebratory success screen.

---

## 8. Defect & Inconsistency Inventory (Prioritized)

### Priority 0 (Critical Polish & Brand Integrity)
| ID | Area | Issue Description | Required Fix |
|---|---|---|---|
| P0-1 | Global Branding | Lingering "Widox" references in user-facing UI: dashboard footer (`app/dashboard/page.tsx:335`), table tent card footer (`app/dashboard/[slug]/page.tsx:604`), and fallback owner email (`BusinessReviewClient.tsx:434`). | Replace all instances with "Revasy" branding and `support@revasy.com`. |
| P0-2 | Shadows Token | `shadow-widox` hardcoded across 8+ files. | Map `shadow-widox` to `shadow-revasy` in `tailwind.config.ts`, migrate usages to `shadow-revasy`. |
| P0-3 | Toast Feedback | Success toast uses `text-brand-pink` which renders violet/indigo. Info toast uses checkmark icon. | Success toast: use `text-emerald-400` / `bg-emerald-500/20`. Info toast: use `Info` icon. |

### Priority 1 (Design System & Token Harmonization)
| ID | Area | Issue Description | Required Fix |
|---|---|---|---|
| P1-1 | Badge Component | `components/ui/Badge.tsx` uses raw Tailwind classes (`indigo-50`, `amber-50`) and contains dead `"espresso"` coffee variant. | Harmonize variants: `neutral`, `amber`, `indigo`, `green`, `teal`. Align with design tokens. |
| P1-2 | Button Variants | `Button.tsx` defines variant `"amber"` that internally maps to `bg-brand-ochre`, while `primary` hardcodes `active:bg-indigo-800`. | Normalize variant names and active states to reference tokens. |
| P1-3 | Typography Loading | `fontFamily.hand` in `tailwind.config.ts` specifies `"Kalam"`, but `app/layout.tsx` never loads Kalam via `next/font/google`. | Either load `Kalam` in `app/layout.tsx` or standardize hand font fallbacks. |
| P1-4 | Accent Theme Parity | `tailwind.config.ts` defines `brand.coral` (`#f43f5e`), but `lib/theme.ts` omits coral from `AccentColor` and `ACCENT_THEMES`. | Add coral theme definition to `ACCENT_THEMES` and update Tailwind safelist. |
| P1-5 | Shimmer Animation | Shimmer duration is 2s in `tailwind.config.ts` and 1.8s in `globals.css` `.shimmer-box`. | Harmonize both to exactly 1.8s. |

### Priority 2 (Screen Ergonomics & Layout Polish)
| ID | Area | Issue Description | Required Fix |
|---|---|---|---|
| P2-1 | `/dashboard` Metrics | Dashboard summary metrics are plain text boxes. | Upgrade to polished SaaS stat cards with subtle category-colored backgrounds and icons. |
| P2-2 | `/dashboard/new` Form | Accent color selection buttons lack high-contrast checkmarks when active. | Add white checkmark inside active color swatch circle for accessibility. |
| P2-3 | `/dashboard/[slug]` Stand | Table tent card preview could have higher visual fidelity. | Add subtle acrylic reflection glare effect and clean drop shadow. |
| P2-4 | `/b/[slug]` Verified Badge | Business title truncation can crowd verified badge on 375px screens. | Use responsive max-width (`max-w-[150px] sm:max-w-[200px]`) and ensure badge never wraps. |

### Priority 3 (Delight & Micro-Interactions)
| ID | Area | Issue Description | Required Fix |
|---|---|---|---|
| P3-1 | Confetti Palette | `REVASY_PALETTE` in `Confetti.tsx` hardcodes `#06b6d4` (cyan) and omits `brand.teal` and `brand.peach`. | Align palette strictly with brand tokens (`#4f46e5`, `#8b5cf6`, `#10b981`, `#f59e0b`, `#f97316`, `#0d9488`). |
| P3-2 | 404 Screen | `app/not-found.tsx` is basic and minimal. | Polish with branded icon, refined typography, and `Button` component. |

---

## 9. Implementation Roadmap for the Future Coding Agent

When executing this design refinement pass, the coding agent must proceed in the following structured sequence:

```
Step 1: Design Tokens & Foundations
  ├── Update `tailwind.config.ts` (alias `shadow-widox` -> `shadow-revasy`, add coral to safelist, harmonize shimmer)
  ├── Clean up `app/globals.css` (harmonize CSS variables, shimmer timing)
  ├── Update `lib/theme.ts` (add `coral` theme support)
  └── Update `app/layout.tsx` (add `Kalam` font if keeping `font-hand`)

Step 2: UI Primitive Components
  ├── Refine `components/ui/Button.tsx` (variant tokens, active states)
  ├── Refine `components/ui/Badge.tsx` (remove dead 'espresso' variant, align with tokens)
  ├── Refine `components/ui/Toast.tsx` (fix icons, use emerald for success)
  └── Refine `components/ui/Confetti.tsx` (align particle palette with brand tokens)

Step 3: Core Review Experience (`/b/[slug]`)
  ├── Polish `components/review/BusinessReviewClient.tsx`
  │     ├── Fix legacy fallback email (`contact@widox.in` -> `support@revasy.com`)
  │     ├── Refine verified badge responsive truncation
  │     └── Polish transitions between Step 1 and Step 2
  ├── Polish `components/review/RatingSelector.tsx` (touch targets, sentiment badge)
  ├── Polish `components/review/QuickPromptChips.tsx` (selection states)
  ├── Polish `components/review/ReviewCard.tsx` (card hierarchy, inline textarea)
  └── Polish `components/review/GoogleReviewLaunchModal.tsx` (walkthrough cards, platform copy)

Step 4: Merchant Dashboard & Operations (`/dashboard`, `/dashboard/new`, `/dashboard/[slug]`)
  ├── Polish `app/dashboard/page.tsx`
  │     ├── Eradicate "Widox" footer text -> "Revasy Review Assistant"
  │     ├── Elevate metric stat cards (Locations, Reviews AI, Replies AI)
  │     └── Refine card button hover states
  ├── Polish `app/dashboard/new/page.tsx`
  │     ├── Ensure Google Places search and map preview feel cohesive
  │     └── Add accessibility checkmarks to accent color swatches
  └── Polish `app/dashboard/[slug]/page.tsx`
        ├── Eradicate "Widox" footer text in table tent preview
        ├── Refine AI reply cards and copy button tactile states
        └── Polish acrylic stand material preview switcher

Step 5: Supporting Pages (`/`, `/login`, `/not-found.tsx`)
  ├── Polish `app/page.tsx` (hero CTA tokens, demo card badges)
  ├── Polish `app/login/page.tsx` (form inputs, Google OAuth button, demo buttons)
  └── Polish `app/not-found.tsx` (SaaS 404 card, branded button)

Step 6: Verification
  ├── Run `npx tsc --noEmit` to confirm 0 TypeScript errors
  └── Run `npm test` to verify automated tests pass
```

---

## 10. Summary & Sign-Off

This document constitutes the comprehensive, application-specific source of truth for refining Revasy. It explicitly protects all working features, maps every file and token, defines UX and accessibility standards, and catalogs every inconsistency with exact remediation instructions. A coding agent receiving this specification can execute the refinement systematically without ambiguity or disruption to user workflows.
