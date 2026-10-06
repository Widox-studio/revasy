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
execSync(
  "npx esbuild .open-next/worker.js --bundle --platform=node --format=esm --target=es2022 --outfile=.open-next/assets/_worker.js --external:node:* --external:cloudflare:*",
  { stdio: "inherit" }
);

console.log("=== 4. Cleaning exports and injecting safety wrapper ===");
const workerOutPath = path.join(".open-next", "assets", "_worker.js");
if (fs.existsSync(workerOutPath)) {
  let content = fs.readFileSync(workerOutPath, "utf8");

  // Ensure only worker_default is exported, no Durable Objects
  content = content.replace(
    /export\s*\{[^}]*worker_default\s+as\s+default[^}]*\};/g,
    "export { worker_default as default };"
  );

  // In the fetch handler, check env.ASSETS first for static assets
  const assetCheck = `
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

  // Inject catch block before export
  content = content.replace(
    /\}\s*\n\};\s*\nexport\s*\{\s*worker_default\s+as\s+default\s*\};/g,
    `    } catch (err) {
      console.error("[Pages Worker Unhandled Error]:", err);
      if (env && env.ASSETS) {
        try { return await env.ASSETS.fetch(request); } catch (_) {}
      }
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
