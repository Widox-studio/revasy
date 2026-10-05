// Verify edge cases: accent colors, long names, manifest, robots, sitemap, rating variants
const baseUrl = "http://localhost:3000";

async function runUXEdgeCaseTests() {
  console.log("=== WIDOX UX EDGE-CASE VERIFICATION ===\n");
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
    // --- 1. PWA Metadata Endpoints ---
    const manifestRes = await fetch(`${baseUrl}/manifest.webmanifest`);
    assert(manifestRes.status === 200, "GET /manifest.webmanifest returns 200");
    assert(
      manifestRes.headers.get("content-type")?.includes("manifest+json") ||
        manifestRes.headers.get("content-type")?.includes("json"),
      "Manifest has JSON content-type"
    );
    const manifest = await manifestRes.json();
    assert(manifest.name === "Widox Review Assistant", "Manifest has correct name");
    assert(manifest.display === "standalone", "Manifest has standalone display mode");
    assert(manifest.theme_color === "#fffaf0", "Manifest has correct Widox cream theme color");

    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    assert(robotsRes.status === 200, "GET /robots.txt returns 200");
    const robotsTxt = await robotsRes.text();
    assert(robotsTxt.includes("User-Agent: *"), "robots.txt has User-Agent wildcard");
    assert(robotsTxt.includes("Allow: /"), "robots.txt allows public crawling");
    assert(robotsTxt.includes("Disallow"), "robots.txt has Disallow rules");

    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    assert(sitemapRes.status === 200, "GET /sitemap.xml returns 200");
    assert(
      sitemapRes.headers.get("content-type")?.includes("xml"),
      "Sitemap has XML content-type"
    );
    const sitemapBody = await sitemapRes.text();
    assert(sitemapBody.includes("/b/cocova"), "Sitemap includes /b/cocova");
    assert(sitemapBody.includes("/b/apex-dental"), "Sitemap includes /b/apex-dental");

    // --- 2. All 6 Accent Colors: Register businesses ---
    const accentColors = ["teal", "pink", "peach", "lavender", "ochre", "mint"];
    const createdSlugs = [];

    for (const color of accentColors) {
      const slug = `ux-test-${color}-${Date.now().toString().slice(-4)}`;
      const createRes = await fetch(`${baseUrl}/api/businesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Test Business ${color.charAt(0).toUpperCase() + color.slice(1)}`,
          slug,
          category: "Cafe & Restaurant",
          tagline: `Testing ${color} accent theme`,
          description: `A test business with ${color} accent color.`,
          googleReviewUrl: `https://g.co/review/test-${color}`,
          accentColor: color,
          customPrompts: ["Great service", "Nice ambience"],
        }),
      });
      assert(createRes.status === 201, `POST /api/businesses creates business with '${color}' accent`);
      createdSlugs.push(slug);
    }

    // --- 3. Dynamic landing page for each accent color ---
    for (const slug of createdSlugs) {
      const pageRes = await fetch(`${baseUrl}/b/${slug}`);
      assert(pageRes.status === 200, `GET /b/${slug} returns 200`);
    }

    // --- 4. Long business name edge case ---
    const longNameSlug = `long-name-biz-${Date.now().toString().slice(-4)}`;
    const longNameRes = await fetch(`${baseUrl}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "A Very Long Business Name That Might Overflow UI Elements And Should Still Render Gracefully",
        slug: longNameSlug,
        category: "Salon & Wellness",
        tagline: "This is an extremely long tagline designed to test text overflow and wrapping in all UI components",
        description: "Testing edge case with maximum length business name and description text to ensure UI layout does not break.",
        googleReviewUrl: "https://g.co/review/longname",
        accentColor: "teal",
        customPrompts: ["Great service"],
      }),
    });
    assert(longNameRes.status === 201, "POST /api/businesses handles very long business name");
    const longPageRes = await fetch(`${baseUrl}/b/${longNameSlug}`);
    assert(longPageRes.status === 200, "GET /b/long-name page renders without crashing");

    // --- 5. AI Review Generation: 5-star, 3-star, 1-star ---
    const ratings = [
      { rating: 5, text: "Absolutely exceptional service, best coffee ever!" },
      { rating: 3, text: "Decent place, nothing particularly special." },
      { rating: 1, text: "Disappointing experience, long wait and cold food." },
    ];

    for (const { rating, text } of ratings) {
      const genRes = await fetch(`${baseUrl}/api/review/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          customerText: text,
          businessSlug: "cocova",
        }),
      });
      assert(genRes.status === 200, `POST /api/review/generate works for ${rating}-star rating`);
      const genData = await genRes.json();
      assert(genData.drafts?.natural, `${rating}-star review generates 'natural' draft`);
      assert(genData.drafts?.warm, `${rating}-star review generates 'warm' draft`);
      assert(genData.drafts?.short, `${rating}-star review generates 'short' draft`);
    }

    // --- 6. Business API individual lookup ---
    const bizLookupRes = await fetch(`${baseUrl}/api/businesses/cocova`);
    assert(bizLookupRes.status === 200, "GET /api/businesses/cocova returns 200");
    const bizData = await bizLookupRes.json();
    assert(bizData.business?.name === "Cocova Cafe", "Business slug API returns correct business");

    // --- Final Summary ---
    console.log(`\n==========================================`);
    console.log(`UX EDGE CASE TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runUXEdgeCaseTests();
