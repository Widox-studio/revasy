// Verification script for Widox Multi-Tenant SaaS platform
const baseUrl = "http://localhost:3000";

async function runSaaSTests() {
  console.log("=== STARTING WIDOX MULTI-TENANT SAAS VERIFICATION ===\n");
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
    // 1. Homepage Widox SaaS
    const homeRes = await fetch(`${baseUrl}/`);
    assert(homeRes.status === 200, "GET / returns 200 OK");
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("widox"), "Homepage contains Widox wordmark");
    assert(homeHtml.includes("5-Star Google Reviews"), "Homepage contains '5-Star Google Reviews' headline");

    // 2. Login Page
    const loginRes = await fetch(`${baseUrl}/login`);
    assert(loginRes.status === 200, "GET /login returns 200 OK");
    const loginHtml = await loginRes.text();
    assert(loginHtml.includes("Sign In to Business Portal"), "Login page renders header");
    assert(loginHtml.includes("Continue with Google"), "Login page includes Google OAuth option");

    // 3. Businesses API
    const bizRes = await fetch(`${baseUrl}/api/businesses`);
    assert(bizRes.status === 200, "GET /api/businesses returns 200 OK");
    const bizData = await bizRes.json();
    assert(bizData.success === true, "Businesses API returns success: true");
    assert(bizData.businesses.length >= 3, `Pre-seeded with ${bizData.businesses.length} demo businesses`);

    // 4. Dynamic Review Page for Cocova Cafe
    const cocovaRes = await fetch(`${baseUrl}/b/cocova`);
    assert(cocovaRes.status === 200, "GET /b/cocova returns 200 OK");
    const cocovaHtml = await cocovaRes.text();
    assert(cocovaHtml.includes("Cocova Cafe"), "Cocova review page renders business name");

    // 5. Dynamic Review Page for Apex Dental
    const dentalRes = await fetch(`${baseUrl}/b/apex-dental`);
    assert(dentalRes.status === 200, "GET /b/apex-dental returns 200 OK");
    const dentalHtml = await dentalRes.text();
    assert(dentalHtml.includes("Apex Smile Dental"), "Apex Dental review page renders business name");

    // 6. Dynamic Review Page for Luxe Salon
    const salonRes = await fetch(`${baseUrl}/b/luxe-salon`);
    assert(salonRes.status === 200, "GET /b/luxe-salon returns 200 OK");
    const salonHtml = await salonRes.text();
    assert(salonHtml.includes("Luxe Studio"), "Luxe Studio review page renders business name");

    // 7. Register a New Business dynamically via POST /api/businesses
    const testSlug = `spice-hub-${Date.now().toString().slice(-4)}`;
    const newBizRes = await fetch(`${baseUrl}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Spice Hub Gourmet",
        slug: testSlug,
        category: "Cafe & Restaurant",
        tagline: "Authentic Indian Curries & Tandoor",
        description: "Award-winning traditional cuisine with modern hospitality.",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJspicehub_demo",
        accentColor: "peach",
        customPrompts: ["Butter chicken was heavenly", "Warm garlic naan", "Attentive staff"],
      }),
    });
    assert(newBizRes.status === 201, `POST /api/businesses creates new business '${testSlug}' (Status 201)`);
    const newBizData = await newBizRes.json();
    assert(newBizData.business.slug === testSlug, "Created business has correct slug");

    // 8. Verify the newly generated landing & review page works instantly
    const newPageRes = await fetch(`${baseUrl}/b/${testSlug}`);
    assert(newPageRes.status === 200, `GET /b/${testSlug} loads dynamically for newly created business (Status 200)`);
    const newPageHtml = await newPageRes.text();
    assert(newPageHtml.includes("Spice Hub Gourmet"), "Dynamic page renders new business name");

    // 9. AI Review Generation for the new business
    const genRes = await fetch(`${baseUrl}/api/review/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        customerText: "The paneer tikka and dal makhani were rich, flavorful, and served sizzling hot.",
        businessSlug: testSlug,
      }),
    });
    assert(genRes.status === 200, "POST /api/review/generate generates reviews for new business");
    const genData = await genRes.json();
    assert(genData.drafts.natural.includes("Spice Hub Gourmet"), "Generated draft references 'Spice Hub Gourmet'");
    console.log("   Generated review sample:", genData.drafts.natural);

    // 10. Admin Login
    const loginAuthRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@cocovacafe.com",
        password: "CocovaSecure2026!",
      }),
    });
    assert(loginAuthRes.status === 200, "POST /api/admin/login authenticates with 200 OK");
    const cookieHeader = loginAuthRes.headers.get("set-cookie");
    const sessionCookie = cookieHeader ? cookieHeader.split(";")[0] : "";

    // 11. AI Google Reply Generation for the new business
    const replyRes = await fetch(`${baseUrl}/api/admin/reply/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        rating: 5,
        reviewerName: "Rohan K.",
        customerReview: "Best Indian dinner we have had in months. The biryani was fragrant and fresh.",
        businessSlug: testSlug,
      }),
    });
    assert(replyRes.status === 200, "POST /api/admin/reply/generate returns 200 for new business");
    const replyData = await replyRes.json();
    assert(replyData.replies.warm.includes("Spice Hub Gourmet"), "Owner reply references 'Spice Hub Gourmet'");
    console.log("   Generated owner reply sample (Warm):", replyData.replies.warm);

    // 12. Backward Compatibility Redirects
    const redirAdmin = await fetch(`${baseUrl}/admin`, { redirect: "manual" });
    assert(redirAdmin.status === 307 || redirAdmin.status === 302, "GET /admin redirects (Status 302/307)");
    const redirReview = await fetch(`${baseUrl}/review`, { redirect: "manual" });
    assert(redirReview.status === 307 || redirReview.status === 302, "GET /review redirects to /b/cocova (Status 302/307)");

    console.log(`\n========================================`);
    console.log(`SAAS VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runSaaSTests();
