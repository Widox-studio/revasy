# Cloudflare Deployment Guide

## Overview
This Next.js application is configured for deployment to Cloudflare Workers using OpenNext. The configuration uses `@opennextjs/cloudflare` to compile Next.js (Node.js runtime defaults) into a Cloudflare Worker compatible bundle.

## 1. Environment Variables Checklist
Before deploying, ensure you have set up the following environment variables. In Cloudflare, these are set via the Cloudflare Dashboard under your Worker's Settings -> Variables, or via `.dev.vars` for local development.

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk frontend key
- `CLERK_SECRET_KEY`: Clerk backend secret
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/login`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: `/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: `/dashboard`
- `OPENAI_API_KEY`: API key for generating AI reviews/replies
- `ADMIN_EMAIL`: Demo admin email (e.g. `admin@widox.in`)
- `ADMIN_PASSWORD`: Demo admin password

### Storage Bindings (Cloudflare specific)
- **KV Namespace**: Bind a KV namespace to the `BUSINESSES_KV` binding in `wrangler.toml`. This is used to persist data across edge locations.
- **R2 Bucket**: Bind an R2 bucket to the `R2_BUCKET` binding in `wrangler.toml`. This is used for logo uploads.

## 2. Pre-Deployment Configuration
1. Open `wrangler.toml`.
2. Uncomment the `[[kv_namespaces]]` block and add your `id` for `BUSINESSES_KV`.
3. Uncomment the `[[r2_buckets]]` block and set the proper `bucket_name`.

## 3. Build Command
Since the project relies on OpenNext for Cloudflare, use the dedicated builder:
```bash
npm install -D @opennextjs/cloudflare
npx @opennextjs/cloudflare
```

*Note: The `fs` and `path` Node.js built-ins have been dynamically imported in `lib/business-store.ts` and `app/api/upload/route.ts` to prevent edge build crashes.*

## 4. Deploy Command
Deploy the compiled worker using wrangler:
```bash
npx wrangler deploy
```

This will upload the `.open-next/worker.js` and sync static assets to the configured R2 bucket via the `[site]` binding in `wrangler.toml`.
