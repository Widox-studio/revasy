# Revasy - Cloudflare Deployment Guide

## Overview
Revasy is production-ready for deployment on **Cloudflare Pages** and **Cloudflare Workers**.
- **Live Project**: `revasy`
- **Assigned Subdomain**: `https://revasy.pages.dev`
- **GitHub Repository**: `https://github.com/Anand-kumar-dev/revasy.git`

---

## 1. Cloudflare Pages Deployment (Recommended & Automated)

The Cloudflare Pages project `revasy` is provisioned under account `Widoxstudio@gmail.com's Account` (`38d1ceb6731de305dc93daf3659e371c`).

### Automatic Git Integration:
1. In Cloudflare Dashboard, go to **Workers & Pages** -> **revasy**.
2. Under **Settings** -> **Builds & Deployments**, connect the GitHub repository:
   - **Repository**: `Anand-kumar-dev/revasy`
   - **Production Branch**: `main`
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npx @opennextjs/cloudflare`
   - **Build Output Directory**: `.open-next/assets`
3. Add the Environment Variables below.
4. Any push to `main` automatically deploys to `https://revasy.pages.dev`.

---

## 2. Environment Variables Checklist

Set these in your Cloudflare Pages / Workers project settings under **Settings -> Variables and Secrets**:

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public production URL | `https://revasy.pages.dev` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend publishable key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk backend secret key | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Route for signing in | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Route for signing up | `/login` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Post-login redirect | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Post-signup redirect | `/dashboard` |
| `OPENAI_API_KEY` | OpenAI API key for review polishing | `sk-proj-...` |
| `ADMIN_EMAIL` | Super admin email | `admin@revasy.com` |
| `ADMIN_PASSWORD` | Super admin password | `CocovaSecure2026!` |
| `SESSION_SECRET` | HMAC token secret | `revasy-session-secret-2026` |

---

## 3. Storage Bindings (Cloudflare KV & R2)

1. **KV Namespace**:
   - Create KV namespace in Cloudflare: `npx wrangler kv:namespace create BUSINESSES_KV`
   - Bind `BUSINESSES_KV` in `wrangler.toml` or Pages project settings.
2. **R2 Bucket**:
   - Create R2 bucket: `npx wrangler r2 bucket create revasy-logos`
   - Bind `R2_BUCKET` in `wrangler.toml` or Pages settings.

---

## 4. Manual CLI Deploy (Direct from Terminal)

```bash
# 1. Build using OpenNext for Cloudflare
npx @opennextjs/cloudflare

# 2. Deploy directly to Cloudflare
npx wrangler pages deploy .open-next/assets --project-name=revasy
# Or deploy as a Worker:
npx wrangler deploy
```
