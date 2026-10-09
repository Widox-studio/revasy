/**
 * Verification Test Suite: White-Glove Tenant Isolation & Customer RBAC
 */
import assert from "node:assert";
import {
  isSuperAdminEmail,
  isAuthorizedForBusiness,
  createSessionToken,
  verifySessionToken,
} from "../lib/auth";
import {
  getBusinessesByOwner,
  getBusinessesByOwnerAsync,
  getBusinessBySlug,
} from "../lib/business-store";

async function runTenantIsolationTests() {
  console.log("=== STARTING WHITE-GLOVE TENANT ISOLATION & RBAC TESTS ===\n");

  // 1. Super-Admin Verification
  assert(isSuperAdminEmail("widoxstudio@gmail.com") === true, "widoxstudio@gmail.com is recognized as sole super-admin");
  assert(isSuperAdminEmail("admin@revasy.com") === false, "admin@revasy.com is NOT super-admin");
  assert(isSuperAdminEmail("admin@widox.in") === false, "admin@widox.in is NOT super-admin");
  assert(isSuperAdminEmail("owner@cocovacafe.com") === false, "owner@cocovacafe.com is regular customer (NOT super-admin)");
  assert(isSuperAdminEmail("random@stranger.com") === false, "random@stranger.com is not super-admin");
  console.log("✅ PASS: Super-admin role detection is airtight (widoxstudio@gmail.com only)");

  // 2. Authorization Boundary Check
  assert(
    isAuthorizedForBusiness("owner@cocovacafe.com", "owner@cocovacafe.com") === true,
    "Owner has full access to their own business"
  );
  assert(
    isAuthorizedForBusiness("owner@cocovacafe.com", "owner@apexdental.com") === false,
    "Owner CANNOT access competitor business (Strict Tenant Isolation)"
  );
  assert(
    isAuthorizedForBusiness("owner@apexdental.com", "owner@cocovacafe.com") === false,
    "Dental owner CANNOT access Cocova Cafe"
  );
  assert(
    isAuthorizedForBusiness("widoxstudio@gmail.com", "owner@cocovacafe.com") === true,
    "Super-admin has administrative oversight across businesses"
  );
  console.log("✅ PASS: isAuthorizedForBusiness strictly enforces single-tenant isolation");

  // 3. JWT Session Token RBAC Encoding
  const customerToken = await createSessionToken("owner@cocovacafe.com");
  const customerPayload = await verifySessionToken(customerToken);
  assert(customerPayload !== null, "Customer token verified");
  assert(customerPayload.role === "business_owner", "Role is business_owner");
  assert(customerPayload.isSuperAdmin === false, "isSuperAdmin is false");

  const adminToken = await createSessionToken("widoxstudio@gmail.com");
  const adminPayload = await verifySessionToken(adminToken);
  assert(adminPayload !== null, "Admin token verified");
  assert(adminPayload.role === "super_admin", "Role is super_admin");
  assert(adminPayload.isSuperAdmin === true, "isSuperAdmin is true");
  console.log("✅ PASS: Cryptographic session tokens encode role and super-admin flags correctly");

  // 4. Query Tenant Filtering
  const cocovaList = getBusinessesByOwner("owner@cocovacafe.com");
  assert(cocovaList.length >= 1, "Cocova owner retrieves assigned business");
  assert(
    cocovaList.every((b) => b.ownerEmail.toLowerCase() === "owner@cocovacafe.com"),
    "Cocova query results contain ONLY Cocova owner businesses (Zero leakage of Apex Dental or Luxe Salon)"
  );
  assert(
    !cocovaList.some((b) => b.slug === "tiesh"),
    "tiesh is NOT visible to Cocova owner"
  );
  console.log("✅ PASS: Customer query returns strictly their business, 0 competitor leakage");

  // 5. Unassigned User (Pending Onboarding) Test
  const unassignedList = getBusinessesByOwner("new_client_pending@gmail.com");
  assert(unassignedList.length === 0, "Unassigned user retrieves 0 businesses");
  console.log("✅ PASS: Unassigned user retrieves 0 businesses, triggering Concierge Onboarding view");

  // 6. Super-Admin Complete Fleet Overview
  const adminList = getBusinessesByOwner("widoxstudio@gmail.com");
  assert(adminList.length >= 3, "Super-admin can view full fleet for white-glove management");
  console.log("✅ PASS: Super-admin retains full multi-location management oversight");

  console.log("\n===========================================================");
  console.log("ALL 6 WHITE-GLOVE TENANT ISOLATION TESTS PASSED CLEANLY!");
  console.log("===========================================================\n");
}

runTenantIsolationTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
