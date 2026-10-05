// Automated verification script for Cocova Cafe MVP
const baseUrl = "http://localhost:3005";

async function runTests() {
  console.log("=== STARTING COCOVA CAFE ENDPOINT VERIFICATION ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Landing Page GET /
    const homeRes = await fetch(`${baseUrl}/`);
    assert(homeRes.status === 200, "GET / returns 200 OK");
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("Cocova Cafe"), "Landing page contains 'Cocova Cafe' branding");
    assert(homeHtml.includes("Review Flow") || homeHtml.includes("review"), "Landing page links to review flow");

    // Test 2: Security Headers check
    const xFrameOptions = homeRes.headers.get("x-frame-options");
    const xContentType = homeRes.headers.get("x-content-type-options");
    assert(xFrameOptions === "DENY", `Security Header X-Frame-Options is DENY (received: ${xFrameOptions})`);
    assert(xContentType === "nosniff", `Security Header X-Content-Type-Options is nosniff (received: ${xContentType})`);

    // Test 3: Customer Review Flow Page GET /review
    const reviewPageRes = await fetch(`${baseUrl}/review`);
    assert(reviewPageRes.status === 200, "GET /review returns 200 OK");
    const reviewPageHtml = await reviewPageRes.text();
    assert(reviewPageHtml.includes("How was your experience at Cocova?"), "Review page renders main customer heading");

    // Test 4: AI Review Generation API POST /api/review/generate (Positive 5-star)
    const reviewGenRes = await fetch(`${baseUrl}/api/review/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        customerText: "The almond croissant was flaky and delicious, and the barista made a wonderful flat white.",
      }),
    });
    assert(reviewGenRes.status === 200, "POST /api/review/generate returns 200 for 5-star review");
    const reviewGenData = await reviewGenRes.json();
    assert(reviewGenData.success === true, "Response has success: true");
    assert(!!reviewGenData.drafts.natural, "Generated 'natural' draft exists");
    assert(!!reviewGenData.drafts.warm, "Generated 'warm' draft exists");
    assert(!!reviewGenData.drafts.short, "Generated 'short' draft exists");
    console.log("   Sample generated natural draft:", reviewGenData.drafts.natural);

    // Test 5: AI Review Generation for 2-star feedback (Fair, constructive, no gating)
    const critRes = await fetch(`${baseUrl}/api/review/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 2,
        customerText: "Waited 25 minutes for my iced matcha and it was overly sweet. Tables needed cleaning.",
      }),
    });
    assert(critRes.status === 200, "POST /api/review/generate returns 200 for 2-star constructive feedback");
    const critData = await critRes.json();
    assert(!critData.drafts.natural.toLowerCase().includes("exceptional"), "2-star draft does not force artificial praise");

    // Test 6: Input Validation (< 3 characters)
    const invalidRes = await fetch(`${baseUrl}/api/review/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        customerText: "hi",
      }),
    });
    assert(invalidRes.status === 422, "POST /api/review/generate rejects short input with 422 Unprocessable Entity");

    // Test 7: Admin Protection: Visiting /admin without auth cookie redirects to /admin/login
    const unauthAdminRes = await fetch(`${baseUrl}/admin`, { redirect: "manual" });
    assert(unauthAdminRes.status === 307 || unauthAdminRes.status === 302, "GET /admin redirects unauthenticated user (Status 302/307)");
    const location = unauthAdminRes.headers.get("location");
    assert(location && location.includes("/admin/login"), `Redirect destination points to /admin/login (${location})`);

    // Test 8: Admin API Protection: /api/admin/reply/generate without auth returns 401
    const unauthReplyRes = await fetch(`${baseUrl}/api/admin/reply/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        customerReview: "Great coffee",
      }),
    });
    assert(unauthReplyRes.status === 401, "POST /api/admin/reply/generate rejects unauthenticated request with 401");

    // Test 9: Admin Login with incorrect password returns 401
    const wrongLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@cocovacafe.com",
        password: "WrongPassword123!",
      }),
    });
    assert(wrongLoginRes.status === 401, "POST /api/admin/login rejects bad password with 401");

    // Test 10: Admin Login with correct credentials returns 200 & sets session cookie
    const goodLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@cocovacafe.com",
        password: "CocovaSecure2026!",
      }),
    });
    assert(goodLoginRes.status === 200, "POST /api/admin/login accepts valid credentials with 200");
    const setCookieHeader = goodLoginRes.headers.get("set-cookie");
    assert(!!setCookieHeader && setCookieHeader.includes("cocova_session"), "Login sets 'cocova_session' cookie");
    assert(setCookieHeader.includes("HttpOnly"), "Session cookie has HttpOnly flag set");

    // Extract cookie value
    const sessionCookie = setCookieHeader.split(";")[0];

    // Test 11: Authenticated Owner AI Reply Generation
    const authReplyRes = await fetch(`${baseUrl}/api/admin/reply/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        rating: 5,
        reviewerName: "David M.",
        customerReview: "Hands down the best cortado in town. Baristas are always warm and welcoming.",
      }),
    });
    assert(authReplyRes.status === 200, "Authenticated owner can generate AI replies with 200 OK");
    const replyData = await authReplyRes.json();
    assert(replyData.success === true, "Reply response has success: true");
    assert(!!replyData.replies.professional, "Generated 'professional' reply exists");
    assert(!!replyData.replies.warm, "Generated 'warm' reply exists");
    assert(!!replyData.replies.concise, "Generated 'concise' reply exists");
    console.log("   Sample generated owner reply (Warm):", replyData.replies.warm);

    // Test 12: Admin Logout clears cookie
    const logoutRes = await fetch(`${baseUrl}/api/admin/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    assert(logoutRes.status === 200, "POST /api/admin/logout returns 200");
    const logoutCookie = logoutRes.headers.get("set-cookie");
    assert(logoutCookie.includes("Max-Age=0") || logoutCookie.includes("expires="), "Logout expires session cookie");

    console.log(`\n========================================`);
    console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  }
}

runTests();
