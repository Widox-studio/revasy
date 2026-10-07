// Challenger 1: D1 Persistence Stress Harness
// Tests /api/feedback and /api/businesses against both target environments.

const targetUrl = process.env.TARGET_URL || "https://revasy.widox.in";

async function runD1PersistenceStress() {
  console.log(`=== CHALLENGER 1: D1 PERSISTENCE STRESS HARNESS (${targetUrl}) ===\n`);
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

  // ----------------------------------------------------
  // SECTION 1: /api/feedback Stress
  // ----------------------------------------------------
  console.log("--- Probing /api/feedback ---");

  // 1.1 Valid Feedback (1-star constructive with contact)
  try {
    const res = await fetch(`${targetUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: "cocova",
        rating: 1,
        customerText: "The cold brew tasted burnt and wait time exceeded 30 minutes.",
        contactInfo: "adversary@qa-test.org"
      }),
    });
    assert(res.status === 200, `Valid 1-star feedback returns 200 (got: ${res.status})`);
    const data = await res.json();
    assert(data.success === true, "Valid feedback returns success: true");
    assert(data.message.includes("received and routed"), "Response confirms receipt for management");
  } catch (e) {
    assert(false, `Valid feedback request threw: ${e.message}`);
  }

  // 1.2 Valid Feedback without contact info
  try {
    const res = await fetch(`${targetUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: "cocova",
        rating: 2,
        customerText: "Pastry was dry this morning."
      }),
    });
    assert(res.status === 200, `Valid feedback without contactInfo returns 200 (got: ${res.status})`);
  } catch (e) {
    assert(false, `Feedback without contact request threw: ${e.message}`);
  }

  // 1.3 Invalid payload: missing businessSlug
  try {
    const res = await fetch(`${targetUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 2,
        customerText: "Missing slug test."
      }),
    });
    assert(res.status === 422, `Missing businessSlug returns 422 (got: ${res.status})`);
  } catch (e) {
    assert(false, `Missing slug test threw: ${e.message}`);
  }

  // 1.4 Invalid payload: non-numeric rating
  try {
    const res = await fetch(`${targetUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: "cocova",
        rating: "two",
        customerText: "String rating test."
      }),
    });
    assert(res.status === 422, `String rating returns 422 (got: ${res.status})`);
  } catch (e) {
    assert(false, `String rating test threw: ${e.message}`);
  }

  // 1.5 Invalid payload: empty customerText
  try {
    const res = await fetch(`${targetUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: "cocova",
        rating: 2,
        customerText: ""
      }),
    });
    assert(res.status === 422, `Empty customerText returns 422 (got: ${res.status})`);
  } catch (e) {
    assert(false, `Empty customerText test threw: ${e.message}`);
  }

  // 1.6 Malformed JSON body
  try {
    const res = await fetch(`${targetUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"businessSlug": "cocova", "rating": 2, "unclosed_json:`,
    });
    assert(res.status === 400, `Malformed JSON returns 400 Bad Request (got: ${res.status})`);
  } catch (e) {
    assert(false, `Malformed JSON test threw: ${e.message}`);
  }

  // 1.7 SQL Injection resilience in feedback
  try {
    const res = await fetch(`${targetUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: "cocova",
        rating: 1,
        customerText: "'; DROP TABLE review_logs; SELECT * FROM businesses WHERE '1'='1",
        contactInfo: "sql_inject'; DROP TABLE businesses; --"
      }),
    });
    assert(res.status === 200, `SQL injection in feedback handled gracefully without 500 error (got: ${res.status})`);
  } catch (e) {
    assert(false, `SQL injection feedback test threw: ${e.message}`);
  }

  // 1.8 XSS attack vector sanitization
  try {
    const res = await fetch(`${targetUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: "cocova",
        rating: 3,
        customerText: "<script>alert('XSS_ATTACK')</script>Music was slightly too loud.",
        contactInfo: "<img src=x onerror=alert(1)>contact@test.com"
      }),
    });
    assert(res.status === 200, `XSS vector payload handled cleanly (got: ${res.status})`);
  } catch (e) {
    assert(false, `XSS feedback test threw: ${e.message}`);
  }

  // ----------------------------------------------------
  // SECTION 2: /api/businesses Persistence Stress
  // ----------------------------------------------------
  console.log("\n--- Probing /api/businesses ---");

  // 2.1 GET /api/businesses
  let initialCount = 0;
  try {
    const res = await fetch(`${targetUrl}/api/businesses`);
    assert(res.status === 200, `GET /api/businesses returns 200 OK (got: ${res.status})`);
    const data = await res.json();
    assert(data.success === true, "GET /api/businesses returns success: true");
    assert(Array.isArray(data.businesses), "GET /api/businesses returns businesses array");
    initialCount = data.businesses.length;
    console.log(`   Initial businesses count: ${initialCount}`);
    const cocova = data.businesses.find((b) => b.slug === "cocova");
    assert(!!cocova, "Seeded business 'cocova' exists in D1/store");
    if (cocova) {
      assert(cocova.name === "Cocova Cafe", "Cocova Cafe business name is correct");
      assert(cocova.category === "Cafe & Bakery" || cocova.category.includes("Cafe"), "Cocova Cafe category is populated");
    }
  } catch (e) {
    assert(false, `GET /api/businesses threw: ${e.message}`);
  }

  // 2.2 POST /api/businesses: Valid creation with unique slug
  const testSlug = `challenger-${Date.now().toString().slice(-6)}`;
  try {
    const res = await fetch(`${targetUrl}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Challenger Roast Lab",
        slug: testSlug,
        category: "Specialty Coffee Roaster",
        tagline: "Empirically Tested Espresso",
        description: "Adversarially audited batch brews and artisanal pastries.",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJchallenger_d1_test",
        accentColor: "ochre",
        customPrompts: [
          "Incredible Ethiopian anaerobic pour-over",
          "Crispy sourdough croissants",
          "Knowledgeable and friendly baristas"
        ]
      }),
    });
    assert(res.status === 201, `POST /api/businesses creates business (status 201, got: ${res.status})`);
    const data = await res.json();
    assert(data.success === true, "Creation response returns success: true");
    assert(data.business && data.business.slug === testSlug, `Created business slug matches '${testSlug}'`);

    // 2.3 Verify newly created business page is immediately live on the edge
    const pageRes = await fetch(`${targetUrl}/b/${testSlug}`);
    assert(pageRes.status === 200, `Dynamic route /b/${testSlug} immediately serves 200 OK`);
    const pageHtml = await pageRes.text();
    assert(pageHtml.includes("Challenger Roast Lab"), "Dynamic page renders created business name");
  } catch (e) {
    assert(false, `POST /api/businesses creation threw: ${e.message}`);
  }

  // 2.4 POST /api/businesses: Duplicate slug collision rejection
  try {
    const res = await fetch(`${targetUrl}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate Attempt Cafe",
        slug: testSlug, // Same slug
        category: "Cafe",
        tagline: "Should fail",
        description: "Duplicate collision test",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJdup",
        accentColor: "teal",
      }),
    });
    assert(res.status === 409, `Duplicate slug creation returns 409 Conflict (got: ${res.status})`);
    const data = await res.json();
    assert(data.error && data.error.includes("already taken"), "Duplicate error message specifies slug already taken");
  } catch (e) {
    assert(false, `Duplicate slug test threw: ${e.message}`);
  }

  // 2.5 POST /api/businesses: Malformed slugs (uppercase, spaces, symbols)
  const invalidSlugs = [
    "UpperCaseSlug",
    "slug with spaces",
    "slug_underscores",
    "slug!special@chars",
    "x" // too short (< 2)
  ];
  for (const invSlug of invalidSlugs) {
    try {
      const res = await fetch(`${targetUrl}/api/businesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Invalid Slug Tester",
          slug: invSlug,
          category: "Cafe",
          googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJinv",
        }),
      });
      assert(res.status === 422, `Invalid slug '${invSlug}' returns 422 Unprocessable (got: ${res.status})`);
    } catch (e) {
      assert(false, `Invalid slug '${invSlug}' test threw: ${e.message}`);
    }
  }

  // 2.6 POST /api/businesses: Missing required fields
  try {
    const res = await fetch(`${targetUrl}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Missing name
        slug: `valid-slug-${Date.now().toString().slice(-4)}`,
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJmissingname",
      }),
    });
    assert(res.status === 422, `Missing business name returns 422 (got: ${res.status})`);
  } catch (e) {
    assert(false, `Missing name test threw: ${e.message}`);
  }

  // 2.7 POST /api/businesses: Invalid googleReviewUrl format
  try {
    const res = await fetch(`${targetUrl}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bad URL Cafe",
        slug: `bad-url-${Date.now().toString().slice(-4)}`,
        googleReviewUrl: "not-a-valid-http-url",
      }),
    });
    assert(res.status === 422, `Invalid googleReviewUrl returns 422 (got: ${res.status})`);
  } catch (e) {
    assert(false, `Invalid URL test threw: ${e.message}`);
  }

  // 2.8 Single quote escaping SQL injection in business creation
  const sqlTestSlug = `sql-test-${Date.now().toString().slice(-4)}`;
  try {
    const res = await fetch(`${targetUrl}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "O'Reilly & D'Angelo's Roastery",
        slug: sqlTestSlug,
        category: "Cafe & Restaurant",
        tagline: "World's Best Single's Origin",
        description: "Testing single quotes '' and SQL strings: '; DROP TABLE businesses; --",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJsqlescape",
        accentColor: "mint",
        customPrompts: ["Best barista's choice"]
      }),
    });
    assert(res.status === 201, `Single-quoted strings in business fields succeed with 201 (got: ${res.status})`);
    
    // Verify it renders safely
    const pageRes = await fetch(`${targetUrl}/b/${sqlTestSlug}`);
    assert(pageRes.status === 200, `Single-quoted business page loads with 200 OK`);
    const pageHtml = await pageRes.text();
    assert(pageHtml.includes("O&#x27;Reilly") || pageHtml.includes("O'Reilly"), "Page renders escaped business name safely");
  } catch (e) {
    assert(false, `Single quote SQL escape test threw: ${e.message}`);
  }

  console.log(`\n========================================`);
  console.log(`D1 PERSISTENCE STRESS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runD1PersistenceStress();
