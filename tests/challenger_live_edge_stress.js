// Live Production Edge Stress Harness for https://revasy.widox.in
const targetUrl = process.env.TARGET_URL || "https://revasy.widox.in";

async function runEdgeStress() {
  console.log(`=== CHALLENGER 1: LIVE EDGE STRESS PROBES (${targetUrl}) ===\n`);
  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = "") {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message} ${details ? "- " + details : ""}`);
      failed++;
    }
  }

  const routes = [
    { path: "/", expectedStatus: [200], expectedType: "text/html" },
    { path: "/b/cocova", expectedStatus: [200], expectedType: "text/html" },
    { path: "/b/cocova-cafe", expectedStatus: [200], expectedType: "text/html" },
    { path: "/login", expectedStatus: [200], expectedType: "text/html" },
    { path: "/dashboard", expectedStatus: [307, 302], expectedType: null }, // Protected by Clerk
    { path: "/api/businesses", expectedStatus: [200], expectedType: "application/json" },
    { path: "/api/places/search?q=Cocova", expectedStatus: [200], expectedType: "application/json" },
    { path: "/manifest.webmanifest", expectedStatus: [200], expectedType: "application/manifest+json" },
    { path: "/robots.txt", expectedStatus: [200], expectedType: "text/plain" },
    { path: "/sitemap.xml", expectedStatus: [200], expectedType: "xml" },
    { path: "/favicon.ico", expectedStatus: [200], expectedType: "image" },
    { path: "/icon-192.png", expectedStatus: [200], expectedType: "image/png" }
  ];

  for (const r of routes) {
    const fullUrl = `${targetUrl}${r.path}`;
    try {
      const startTime = Date.now();
      const res = await fetch(fullUrl, { redirect: "manual" });
      const durationMs = Date.now() - startTime;
      const statusOk = r.expectedStatus.includes(res.status);
      const contentType = res.headers.get("content-type") || "";
      const typeOk = !r.expectedType || contentType.includes(r.expectedType);
      const cfRay = res.headers.get("cf-ray") || "none";

      assert(statusOk, `Route ${r.path} returns ${res.status} (expected ${r.expectedStatus.join("/")}) [${durationMs}ms, cf-ray: ${cfRay}]`);
      if (r.expectedType) {
        assert(typeOk, `Route ${r.path} content-type matches '${r.expectedType}' (got: '${contentType}')`);
      }
      assert(res.status !== 500 && res.status !== 1101 && res.status !== 522, `Route ${r.path} zero edge 500/1101/522 error`);
    } catch (e) {
      assert(false, `Route ${r.path} network exception: ${e.message}`);
    }
  }

  // Edge resilience: probe non-existent business slug
  try {
    const resBiz404 = await fetch(`${targetUrl}/b/non-existent-slug-${Date.now()}`, { redirect: "manual" });
    assert(resBiz404.status === 404, `Non-existent public business slug returns 404 (status: ${resBiz404.status})`);
    assert(resBiz404.status !== 500 && resBiz404.status !== 1101, "Zero 500 or Error 1101 on 404 route");
  } catch (e) {
    assert(false, `Non-existent business probe network exception: ${e.message}`);
  }

  // Edge resilience: probe default-deny auth redirect on unauthenticated private path
  try {
    const resUnauth = await fetch(`${targetUrl}/unauthenticated-private-page`, { redirect: "manual" });
    assert(resUnauth.status === 307 || resUnauth.status === 302, `Unauthenticated private route securely redirects to /login (status: ${resUnauth.status})`);
    const loc = resUnauth.headers.get("location") || "";
    assert(loc.includes("/login"), `Redirect destination is /login (got: ${loc})`);
  } catch (e) {
    assert(false, `Unauthenticated private path probe failed: ${e.message}`);
  }

  console.log(`\n========================================`);
  console.log(`LIVE EDGE STRESS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runEdgeStress();
