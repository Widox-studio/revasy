const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== 1. Building OpenNext Bundle ===");
execSync("npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion", {
  stdio: "inherit",
});

console.log("=== 2. Stripping Durable Objects from worker.js ===");
const workerSourcePath = path.join(".open-next", "worker.js");
if (fs.existsSync(workerSourcePath)) {
  let src = fs.readFileSync(workerSourcePath, "utf8");
  src = src.replace(/export\s*\{\s*DOQueueHandler\s*\}\s*from\s*["'].*?["'];?/g, "");
  src = src.replace(/export\s*\{\s*DOShardedTagCache\s*\}\s*from\s*["'].*?["'];?/g, "");
  src = src.replace(/export\s*\{\s*BucketCachePurge\s*\}\s*from\s*["'].*?["'];?/g, "");
  fs.writeFileSync(workerSourcePath, src, "utf8");
}

console.log("=== 3. Bundling _worker.js for Cloudflare Pages ===");
const esbuild = require("esbuild");
esbuild.buildSync({
  entryPoints: [path.join(".open-next", "worker.js")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "es2022",
  outfile: path.join(".open-next", "assets", "_worker.js"),
  external: ["node:*", "cloudflare:*"],
  banner: {
    js: 'import { createRequire } from "node:module"; const _cfReq = createRequire("/worker.js"); const require = (m) => (m === "fs" || m === "node:fs" ? { existsSync: () => false, readFileSync: () => "", writeFileSync: () => {}, mkdirSync: () => {}, statSync: () => ({ isDirectory: () => false }), promises: { readFile: async () => "", writeFile: async () => "" } } : _cfReq(m));',
  },
  define: {
    "process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      "pk_test_d29ydGh5LWNoaWNrZW4tNTY2NC5jbGVyay5hY2NvdW50cy5kZXYk"
    ),
    "process.env.NEXT_PUBLIC_APP_URL": JSON.stringify(
      "https://revasy.widox.in"
    ),
  },
});

console.log("=== 4. Cleaning exports and injecting safety wrapper ===");
const workerOutPath = path.join(".open-next", "assets", "_worker.js");
if (fs.existsSync(workerOutPath)) {
  let content = fs.readFileSync(workerOutPath, "utf8");

  // Ensure only worker_default is exported, no Durable Objects
  content = content.replace(
    /export\s*\{[^}]*worker_default\s+as\s+default[^}]*\};/g,
    "export { worker_default as default };"
  );

  // Replace any direct __require("node:fs") or __require("fs") with stub
  const fsStub = '({ existsSync: () => false, readFileSync: () => "", writeFileSync: () => {}, mkdirSync: () => {}, statSync: () => ({ isDirectory: () => false }), promises: { readFile: async () => "", writeFile: async () => "" } })';
  content = content.replace(/__require\(["']node:fs["']\)/g, fsStub);
  content = content.replace(/__require\(["']fs["']\)/g, fsStub);

  // In the fetch handler, sync env vars and check env.ASSETS for static assets
  const assetCheck = `
      // Sync environment variables and Cloudflare bindings
      if (env) {
        if (env.DB) globalThis.DB = env.DB;
        if (env.AI) globalThis.AI = env.AI;
        for (const [k, v] of Object.entries(env)) {
          if (typeof v === "string" && typeof process !== "undefined" && process?.env) {
            process.env[k] = v;
          }
        }
      }
      if (typeof process !== "undefined" && process?.env) {
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_d29ydGh5LWNoaWNrZW4tNTY2NC5jbGVyay5hY2NvdW50cy5kZXYk";
        process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_g743T3yB0QhX3zGqI5Z1WvL4kP9rS2vN8mM0jL3hK1";
        process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://revasy.widox.in";
      }

      // Serve static assets directly if available
      const url = new URL(request.url);
      if (env && env.ASSETS && (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname === "/favicon.ico" ||
        url.pathname === "/icon-192.png" ||
        url.pathname === "/icon-512.png" ||
        url.pathname.startsWith("/uploads/")
      )) {
        return await env.ASSETS.fetch(request);
      }
  `;

  content = content.replace(
    /async\s+fetch\s*\(\s*request\s*,\s*env\s*,\s*ctx\s*\)\s*\{/g,
    `async fetch(request, env, ctx) {\n${assetCheck}\n    try {`
  );

  // Ensure runWithCloudflareRequestContext is awaited inside try/catch
  content = content.replace(
    /return runWithCloudflareRequestContext\(/g,
    "return await runWithCloudflareRequestContext("
  );

  // Inject catch block before export
  content = content.replace(
    /\}\s*\n\};\s*\nexport\s*\{\s*worker_default\s+as\s+default\s*\};/g,
    `    } catch (err) {
      console.error("[Pages Worker Unhandled Error]:", err);
      return new Response("App Error: " + (err.stack || err.message), {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }
};
export { worker_default as default };`
  );

  fs.writeFileSync(workerOutPath, content, "utf8");
}

console.log("=== 5. Writing _routes.json ===");
const routesJson = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/static/*",
    "/favicon.ico",
    "/icon-192.png",
    "/icon-512.png",
    "/uploads/*",
  ],
};
fs.writeFileSync(
  path.join(".open-next", "assets", "_routes.json"),
  JSON.stringify(routesJson, null, 2),
  "utf8"
);

console.log("=== Build for Cloudflare Pages Complete! ===");
