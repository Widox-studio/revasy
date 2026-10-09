/**
 * Verification test for Google Place ID Finder and Google Review Link generation
 */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING GOOGLE PLACE ID FINDER & REVIEW LINK VERIFICATION ===\n");

  // 1. Test Direct Place ID (ChIJ...)
  const placeIdInput = "ChIJN1t_tDeuEmsRUsoyG83frY4";
  const res1 = await fetch(`${BASE_URL}/api/places/search?q=${encodeURIComponent(placeIdInput)}`);
  assert(res1.ok, "API returns 200 for Place ID");
  const data1 = await res1.json();
  assert(data1.success, "Response has success: true");
  assert(data1.results?.[0]?.isExactPlaceId === true, "Result is flagged as exact Place ID");
  assert(
    data1.results?.[0]?.googleReviewUrl === `https://search.google.com/local/writereview?placeid=${placeIdInput}`,
    `Review URL is official writereview link (got: ${data1.results?.[0]?.googleReviewUrl})`
  );
  console.log("✅ PASS: Direct Place ID (ChIJ...) returns official writereview URL");

  // 2. Test Direct writereview URL
  const writeReviewUrl = `https://search.google.com/local/writereview?placeid=${placeIdInput}`;
  const res2 = await fetch(`${BASE_URL}/api/places/search?q=${encodeURIComponent(writeReviewUrl)}`);
  assert(res2.ok, "API returns 200 for writereview URL");
  const data2 = await res2.json();
  assert(data2.results?.[0]?.placeId === placeIdInput, "Extracted placeId matches");
  assert(data2.results?.[0]?.isExactPlaceId === true, "isExactPlaceId is true");
  console.log("✅ PASS: Direct writereview URL extracts Place ID properly");

  // 3. Test Full Google Maps place URL with hex CID
  const fullMapsUrl = "https://www.google.com/maps/place/COCOVA/@21.1184646,73.1166418,17z/data=!4m6!3m5!1s0x3be05985860d5b9d:0x70529d3810a9f5d!8m2!3d21.1184646!4d73.1166418";
  const res3 = await fetch(`${BASE_URL}/api/places/search?q=${encodeURIComponent(fullMapsUrl)}`);
  assert(res3.ok, "API returns 200 for Google Maps place URL");
  const data3 = await res3.json();
  const cidDec = "505856521528844125";
  assert(
    data3.results?.[0]?.placeId === cidDec || (data3.results?.[0]?.placeId && data3.results?.[0]?.placeId.startsWith("ChIJ")),
    `CID hex is converted to decimal or ChIJ Place ID (got: ${data3.results?.[0]?.placeId})`
  );
  assert(
    data3.results?.[0]?.googleReviewUrl?.includes("writereview?placeid=") || data3.results?.[0]?.googleReviewUrl === `https://maps.google.com/?cid=${cidDec}`,
    "Review URL is exact review link"
  );
  assert(data3.results?.[0]?.isExactPlaceId === true, "Marked as exact Place ID");
  console.log("✅ PASS: Google Maps place URL unrolls hex CID to decimal review link");

  // 4. Test CID URL (cid=...)
  const cidUrl = `https://maps.google.com/?cid=${cidDec}`;
  const res4 = await fetch(`${BASE_URL}/api/places/search?q=${encodeURIComponent(cidUrl)}`);
  assert(res4.ok, "API returns 200 for CID URL");
  const data4 = await res4.json();
  assert(data4.results?.[0]?.placeId === cidDec, "CID extracted");
  assert(data4.results?.[0]?.googleReviewUrl === cidUrl, "Review URL matches CID link");
  console.log("✅ PASS: Direct CID URL resolves to exact review link");

  // 5. Test Search Query Keyword fix (MUST NOT contain /maps/search/?api=1&query=)
  const searchQuery = "Cocova Cafe Surat";
  const res5 = await fetch(`${BASE_URL}/api/places/search?q=${encodeURIComponent(searchQuery)}`);
  assert(res5.ok, "API returns 200 for search query");
  const data5 = await res5.json();
  assert(data5.results && data5.results.length > 0, "Returns search candidates");
  
  for (const r of data5.results) {
    assert(
      !r.googleReviewUrl.includes("/maps/search/?api=1&query="),
      `Review URL must NOT be generic query keyword search! Got: ${r.googleReviewUrl}`
    );
  }
  console.log("✅ PASS: Geocoded results do NOT produce broken keyword search URLs");

  // 5b. Test Live Map Pin Extraction as Source of Truth (Cocova Cafe)
  const res5b = await fetch(`${BASE_URL}/api/places/search?q=${encodeURIComponent("Cocova Cafe")}`);
  assert(res5b.ok, "API returns 200 for Cocova Cafe");
  const data5b = await res5b.json();
  assert(data5b.results && data5b.results.length > 0, "Returns results for Cocova Cafe");
  const pinnedMatch = data5b.results.find((r) => r.source === "google_maps_pinned" || r.isExactPlaceId);
  assert(pinnedMatch, "Found exact pinned Google place");
  assert(
    pinnedMatch.placeId === "ChIJaS8pZMdn4DsRrA8wg4kapzo" || pinnedMatch.placeId === "4226375953224306604",
    `Extracted exact Place ID or CID for Cocova (got: ${pinnedMatch.placeId})`
  );
  assert(pinnedMatch.isExactPlaceId === true, "isExactPlaceId is true");
  assert(
    pinnedMatch.googleReviewUrl.includes("writereview") || pinnedMatch.googleReviewUrl.includes("cid="),
    `Review URL is direct 1-click review link (got: ${pinnedMatch.googleReviewUrl})`
  );
  console.log("✅ PASS: Live map pin extraction acts as exact location source of truth");

  // 6. Test GooglePlaceIdFinder component structure
  const componentPath = path.resolve(process.cwd(), "components/maps/GooglePlaceIdFinder.tsx");
  const componentCode = fs.readFileSync(componentPath, "utf-8");

  // Must contain official Place ID Finder embedded widget
  assert(
    componentCode.includes("maps-docs-team.web.app/samples/places-placeid-finder/dist/"),
    "Component embeds the official Google Place ID Finder tool"
  );

  // Must NOT redirect out to developers.google.com documentation
  assert(
    !componentCode.includes("href=\"https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder\""),
    "Component does not redirect users away to developers.google.com docs"
  );

  // Must support official writereview link construction
  assert(
    componentCode.includes("https://search.google.com/local/writereview?placeid="),
    "Component generates official https://search.google.com/local/writereview?placeid= links"
  );

  // Must support Google Places Autocomplete integration
  assert(
    componentCode.includes("google.maps.places.Autocomplete"),
    "Component supports real Google Places Autocomplete"
  );
  // 7. Strict Exact Place enforcement check
  assert(
    componentCode.includes("!selectedPlace.isExactPlaceId"),
    "Component guards against submitting non-exact search queries"
  );
  assert(
    componentCode.includes("parseClientMapsInput"),
    "Component contains fast client-side Place ID and CID parser"
  );
  assert(
    componentCode.includes("handlePasteFromClipboardMethod1"),
    "Component provides 1-click clipboard paste for Google Maps links"
  );
  console.log("✅ PASS: Strict exact place locking and clipboard paste features verified");

  console.log("\n=======================================================");
  console.log("ALL GOOGLE PLACE ID FINDER VERIFICATION TESTS PASSED!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

