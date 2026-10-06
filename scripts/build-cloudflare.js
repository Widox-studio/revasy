const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== 1. Building OpenNext Bundle ===");
execSync("npx opennextjs-cloudflare build --skipNextBuild --dangerouslyUseUnsupportedNextVersion", {
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

console.log("=== 2.5. Collecting Manifests into In-Memory VFS ===");
const vfs = {};
const serverFuncsNextDir = path.join(".open-next", "server-functions", "default", ".next");
if (fs.existsSync(serverFuncsNextDir)) {
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (ext === ".json" || (ext === ".js" && entry.name.includes("manifest"))) {
          try {
            const relFromNext = path.relative(serverFuncsNextDir, fullPath).replace(/\\/g, "/");
            const fileContent = fs.readFileSync(fullPath, "utf8");
            vfs[entry.name] = fileContent;
            vfs[relFromNext] = fileContent;
            vfs[".next/" + relFromNext] = fileContent;
          } catch {}
        }
      }
    }
  }
  scanDir(serverFuncsNextDir);
}
console.log(`Collected ${Object.keys(vfs).length} manifest paths into in-memory VFS.`);

console.log("=== 3. Bundling _worker.js for Cloudflare Pages ===");
const bannerCode = `
import { createRequire } from "node:module";
import { AsyncLocalStorage } from "node:async_hooks";
import process from "node:process";

if (typeof globalThis.AsyncLocalStorage === "undefined") {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
}
if (typeof globalThis.process === "undefined") {
  globalThis.process = process;
}
const _cfReq = createRequire("/worker.js");

const _vfs = ${JSON.stringify(vfs)};

const _fsStub = {
  existsSync: (p) => {
    if (typeof p !== "string") return false;
    const norm = p.replace(/\\\\/g, "/");
    const base = norm.split("/").pop();
    if (_vfs[base] !== undefined || _vfs[norm] !== undefined) return true;
    for (const k in _vfs) {
      if (norm.endsWith(k)) return true;
    }
    return false;
  },
  readFileSync: (p, enc) => {
    if (typeof p !== "string") return "";
    const norm = p.replace(/\\\\/g, "/");
    const base = norm.split("/").pop();
    if (_vfs[base] !== undefined) return _vfs[base];
    if (_vfs[norm] !== undefined) return _vfs[norm];
    for (const k in _vfs) {
      if (norm.endsWith(k)) return _vfs[k];
    }
    if (norm.endsWith(".json")) return "{}";
    return "";
  },
  writeFileSync: () => {},
  mkdirSync: () => {},
  statSync: (p) => ({
    isDirectory: () => false,
    isFile: () => true,
    mtime: new Date(),
    size: typeof p === "string" && (_fsStub.readFileSync(p) || "").length || 0
  }),
  lstatSync: (p) => ({
    isDirectory: () => false,
    isFile: () => true,
    mtime: new Date(),
    isSymbolicLink: () => false,
    size: typeof p === "string" && (_fsStub.readFileSync(p) || "").length || 0
  }),
  readdirSync: () => [],
  unlinkSync: () => {},
  rmdirSync: () => {},
  accessSync: () => {},
  constants: { F_OK: 0, R_OK: 4, W_OK: 2, X_OK: 1 },
  promises: {
    readFile: async (p, enc) => _fsStub.readFileSync(p, enc),
    writeFile: async () => {},
    mkdir: async () => {},
    stat: async (p) => _fsStub.statSync(p),
    readdir: async () => [],
    access: async () => {}
  }
};

const _vmStub = {
  runInNewContext: (code, ctx = {}) => {
    try {
      const fn = new Function("self", "process", code + "; return self;");
      fn(ctx, typeof process !== "undefined" ? process : { env: {} });
    } catch (e) {
      try {
        const fn = new Function("self", code + "; return self;");
        fn(ctx);
      } catch (err) {}
    }
    return ctx;
  },
  runInThisContext: (code) => {
    try { return eval(code); } catch { return undefined; }
  },
  runInContext: (code, ctx = {}) => _vmStub.runInNewContext(code, ctx),
  createContext: (ctx = {}) => ctx,
  isContext: () => true,
  Script: class Script {
    constructor(code) { this.code = code; }
    runInContext(ctx) { return _vmStub.runInContext(this.code, ctx); }
    runInNewContext(ctx) { return _vmStub.runInNewContext(this.code, ctx); }
    runInThisContext() { return _vmStub.runInThisContext(this.code); }
  }
};

const _wtStub = {
  Worker: class Worker { on() {} postMessage() {} terminate() {} },
  isMainThread: true,
  parentPort: null,
  threadId: 0,
  workerData: null
};

const _stubs = {
  "fs": _fsStub,
  "node:fs": _fsStub,
  "vm": _vmStub,
  "node:vm": _vmStub,
  "async_hooks": { AsyncLocalStorage },
  "node:async_hooks": { AsyncLocalStorage },
  "worker_threads": _wtStub,
  "node:worker_threads": _wtStub,
  "http": { Agent: class Agent {}, STATUS_CODES: { 200: "OK", 404: "Not Found", 500: "Internal Server Error" }, METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"], createServer: () => ({ listen: () => {}, on: () => {}, close: () => {} }), request: () => ({ on: () => {}, write: () => {}, end: () => {} }), get: () => ({ on: () => {} }) },
  "node:http": { Agent: class Agent {}, STATUS_CODES: { 200: "OK", 404: "Not Found", 500: "Internal Server Error" }, METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"], createServer: () => ({ listen: () => {}, on: () => {}, close: () => {} }), request: () => ({ on: () => {}, write: () => {}, end: () => {} }), get: () => ({ on: () => {} }) },
  "https": { Agent: class Agent {}, STATUS_CODES: { 200: "OK", 404: "Not Found", 500: "Internal Server Error" }, METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"], createServer: () => ({ listen: () => {}, on: () => {}, close: () => {} }), request: () => ({ on: () => {}, write: () => {}, end: () => {} }), get: () => ({ on: () => {} }) },
  "node:https": { Agent: class Agent {}, STATUS_CODES: { 200: "OK", 404: "Not Found", 500: "Internal Server Error" }, METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"], createServer: () => ({ listen: () => {}, on: () => {}, close: () => {} }), request: () => ({ on: () => {}, write: () => {}, end: () => {} }), get: () => ({ on: () => {} }) },
  "child_process": { exec: (cmd, cb) => cb && cb(null, "", ""), execSync: () => "", spawn: () => ({ on: () => {}, stdout: { on: () => {} }, stderr: { on: () => {} } }), fork: () => ({ on: () => {} }) },
  "node:child_process": { exec: (cmd, cb) => cb && cb(null, "", ""), execSync: () => "", spawn: () => ({ on: () => {}, stdout: { on: () => {} }, stderr: { on: () => {} } }), fork: () => ({ on: () => {} }) },
  "cluster": { isMaster: true, isWorker: false },
  "node:cluster": { isMaster: true, isWorker: false },
  "dgram": {},
  "node:dgram": {},
  "dns": { lookup: () => {} },
  "node:dns": { lookup: () => {} },
  "net": { Socket: class Socket {}, createServer: () => ({ listen: () => {}, on: () => {} }), connect: () => {} },
  "node:net": { Socket: class Socket {}, createServer: () => ({ listen: () => {}, on: () => {} }), connect: () => {} },
  "tls": { connect: () => {}, createSecureContext: () => ({}) },
  "node:tls": { connect: () => {}, createSecureContext: () => ({}) },
  "perf_hooks": { performance: globalThis.performance },
  "node:perf_hooks": { performance: globalThis.performance }
};

const require = (m) => {
  if (m === "fs" || m === "node:fs") return _fsStub;
  if (m === "vm" || m === "node:vm") return _vmStub;
  if (m === "worker_threads" || m === "node:worker_threads") return _wtStub;
  const norm = typeof m === "string" ? m.replace(/^node:/, "") : m;
  if (_stubs[m]) return _stubs[m];
  if (_stubs[norm]) return _stubs[norm];
  try {
    return _cfReq(m);
  } catch (err) {
    try {
      return _cfReq(norm);
    } catch (err2) {
      if (_stubs[m]) return _stubs[m];
      if (_stubs[norm]) return _stubs[norm];
      console.warn("[Module fallback for " + m + "]:", err2.message);
      return {};
    }
  }
};
`;

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
    js: bannerCode.trim(),
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

  // Replace direct __require calls for fs, vm, and worker_threads with stubs
  content = content.replace(/__require\(["']node:fs["']\)/g, "_fsStub");
  content = content.replace(/__require\(["']fs["']\)/g, "_fsStub");
  content = content.replace(/__require\(["']node:vm["']\)/g, "_vmStub");
  content = content.replace(/__require\(["']vm["']\)/g, "_vmStub");
  content = content.replace(/__require\(["']node:worker_threads["']\)/g, "_wtStub");
  content = content.replace(/__require\(["']worker_threads["']\)/g, "_wtStub");

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
