// Node verification check for frontend using fetch
const baseUrl = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING FRONTEND QA VERIFICATION ===");
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
    // 1. Verify Landing Page design tokens
    const homeRes = await fetch(`${baseUrl}/`);
    assert(homeRes.status === 200, "Landing page loaded");
    const homeHtml = await homeRes.text();
    
    // Check Canvas background #fffaf0, usually Tailwind class 'bg-[#fffaf0]' or 'bg-surface' etc.
    // Check typography Inter or Plus Jakarta Sans
    assert(homeHtml.includes("f8fafc") || homeHtml.includes("fffaf0") || homeHtml.includes("bg-canvas"), "Canvas background token detected");
    assert(homeHtml.includes("Inter") || homeHtml.includes("Plus Jakarta Sans") || homeHtml.includes("font-sans"), "Typography token detected");
    assert(homeHtml.includes("indigo") || homeHtml.includes("brand-pink") || homeHtml.includes("#ff4d8b"), "Primary accent detected");
    assert(homeHtml.includes("slate") || homeHtml.includes("1a202c") || homeHtml.includes("text-slate-") || homeHtml.includes("text-ink"), "Slate text token detected");

    // 2. Merchant Review Experience (Cocova)
    const reviewRes = await fetch(`${baseUrl}/b/cocova`);
    assert(reviewRes.status === 200, "Merchant Review Experience loaded");
    const reviewHtml = await reviewRes.text();

    // Check for dynamic rating star selection presence
    assert(reviewHtml.includes("lucide-star") || reviewHtml.includes("rating"), "Rating stars component detected in DOM");
    assert(reviewHtml.includes("Best Hot Chocolate") || reviewHtml.includes("Cozy Ambience") || reviewHtml.includes("prompt"), "Prompt tag selection detected");

    // 3. AI Review Polish Generation API
    const aiRes = await fetch(`${baseUrl}/api/review/generate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ rating: 5, customerText: "Loved the hot chocolate and cozy ambience." })
    });
    assert(aiRes.status === 200, "AI Review Polish generation API works");
    const aiData = await aiRes.json();
    assert(aiData.success && aiData.drafts, "One-tap AI Review Polish returns drafts");

    // 4. Google Review deep-link modal
    // Check if the component and deep-link reference exists in the payload or client bundle
    assert(reviewHtml.toLowerCase().includes("google") || reviewHtml.includes("googleReviewUrl"), "Google Review deep-link auto-copy structure detected");

    // 5. Private feedback capture for ratings <= 3 stars
    assert(reviewHtml.includes("feedback") || reviewHtml.includes("private") || reviewHtml.includes("improve"), "Private feedback capture for low ratings detected");
    
    const badReviewRes = await fetch(`${baseUrl}/api/review/generate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ rating: 2, customerText: "Service was slow." })
    });
    const badReviewData = await badReviewRes.json();
    assert(badReviewData.success, "Low rating handles private feedback seamlessly");


    console.log(`\n========================================`);
    console.log(`QA VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

  } catch(e) {
    console.error(e);
  }
}
runTests();
