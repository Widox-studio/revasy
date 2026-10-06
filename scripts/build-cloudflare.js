const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== 1. Building OpenNext Bundle ===");
execSync("npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion", {
  stdio: "inherit",
});

console.log("=== 2. Bundling _worker.js for Cloudflare Pages ===");
execSync(
  "npx esbuild .open-next/worker.js --bundle --platform=node --format=esm --target=es2022 --outfile=.open-next/assets/_worker.js --packages=external",
  { stdio: "inherit" }
);

console.log("=== 3. Injecting safety wrapper and _routes.json ===");
const workerPath = path.join(".open-next", "assets", "_worker.js");
if (fs.existsSync(workerPath)) {
  let content = fs.readFileSync(workerPath, "utf8");
  // Inject try-catch fallback for fetch handler
  content = content.replace(
    /var worker_default = \{\s*async fetch\(request, env, ctx\) \{/g,
    `var worker_default = {
  async fetch(request, env, ctx) {
    try {`
  );
  content = content.replace(
    /return handler4\(reqOrResp, env, ctx, request\.signal\);\s*\}\);\s*\}\s*\};/g,
    `return await handler4(reqOrResp, env, ctx, request.signal);
      });
    } catch (err) {
      console.error("[Worker Error]", err);
      // Fallback to static assets if handler fails
      if (env && env.ASSETS) {
        try { return await env.ASSETS.fetch(request); } catch (_) {}
      }
      return new Response("Application Error: " + (err.stack || err.message), {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }
};`
  );
  fs.writeFileSync(workerPath, content, "utf8");
}

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
