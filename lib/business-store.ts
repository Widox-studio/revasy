import { isSuperAdminEmail } from "./auth";

let fs: any = null;
let path: any = null;
try {
  if (typeof process !== "undefined" && process.env.NEXT_RUNTIME !== "edge") {
    // @ts-ignore
    fs = require("fs");
    // @ts-ignore
    path = require("path");
  }
} catch (e) {
  // Ignore in edge environments
}

export interface GoogleOAuthData {
  connected: boolean;
  connectedEmail?: string;
  connectedName?: string;
  accountId?: string;
  accountName?: string;
  locationId?: string;
  locationName?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  connectedAt?: string;
  scopes?: string[];
}

export interface AutoReplyConfig {
  enabled: boolean;
  tone: "warm" | "professional" | "concise";
  minRating: number; // e.g., 1 (all reviews) or 4 (4-5 stars only)
  signature: string; // e.g. "— The Cocova Team"
  autoPublish: boolean; // default true
  lastSyncAt?: string;
  totalAutoRepliesSent: number;
}

export interface AutoReplyLog {
  id: string;
  reviewId: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  replyText: string;
  repliedAt: string;
  status: "published" | "pending" | "failed";
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  address?: string;
  googleReviewUrl: string;
  placeId?: string;
  logoUrl?: string;
  accentColor: "teal" | "pink" | "peach" | "lavender" | "ochre" | "mint" | "coral";
  customPrompts: string[];
  ownerEmail: string;
  createdAt: string;
  stats: {
    totalReviewsGenerated: number;
    totalRepliesGenerated: number;
  };
  googleOAuth?: GoogleOAuthData;
  autoReplyConfig?: AutoReplyConfig;
  autoReplyLogs?: AutoReplyLog[];
}

const DATA_DIR = path ? path.join(process.cwd(), "data") : "";
const DATA_FILE = path ? path.join(DATA_DIR, "businesses.json") : "";

// Default initial businesses (empty in production - populated via persistent store or onboarding)
const DEFAULT_BUSINESSES: Business[] = [];

let inMemoryBusinesses: Business[] = [...DEFAULT_BUSINESSES];

function isFsAvailable(): boolean {
  try {
    return (
      typeof process !== "undefined" &&
      process.env.NEXT_RUNTIME !== "edge" &&
      typeof fs !== "undefined" &&
      typeof fs.existsSync === "function" &&
      DATA_FILE !== ""
    );
  } catch {
    return false;
  }
}

function getD1Binding(): any {
  try {
    const env = (process.env as any) || {};
    return (globalThis as any).DB || env.DB || (globalThis as any).d1 || env.d1 || null;
  } catch {
    return null;
  }
}

function mapRowToBusiness(row: any): Business {
  let customPrompts: string[] = [];
  try {
    if (typeof row.custom_prompts === "string") {
      customPrompts = JSON.parse(row.custom_prompts);
    } else if (Array.isArray(row.custom_prompts)) {
      customPrompts = row.custom_prompts;
    } else if (typeof row.customPrompts === "string") {
      customPrompts = JSON.parse(row.customPrompts);
    } else if (Array.isArray(row.customPrompts)) {
      customPrompts = row.customPrompts;
    }
  } catch {
    customPrompts = [];
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline || "",
    category: row.category || "General Business",
    description: row.description || "",
    address: row.address || "",
    googleReviewUrl: row.google_review_url || row.googleReviewUrl || "",
    logoUrl: row.logo_url || row.logoUrl || "",
    accentColor: row.accent_color || row.accentColor || "teal",
    customPrompts,
    ownerEmail: row.owner_email || row.ownerEmail || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    stats: {
      totalReviewsGenerated: row.total_reviews_generated ?? row.stats?.totalReviewsGenerated ?? 0,
      totalRepliesGenerated: row.total_replies_generated ?? row.stats?.totalRepliesGenerated ?? 0,
    },
    googleOAuth: row.google_oauth
      ? (typeof row.google_oauth === "string" ? JSON.parse(row.google_oauth) : row.google_oauth)
      : (row.googleOAuth || undefined),
    autoReplyConfig: row.auto_reply_config
      ? (typeof row.auto_reply_config === "string" ? JSON.parse(row.auto_reply_config) : row.auto_reply_config)
      : (row.autoReplyConfig || undefined),
    autoReplyLogs: row.auto_reply_logs
      ? (typeof row.auto_reply_logs === "string" ? JSON.parse(row.auto_reply_logs) : row.auto_reply_logs)
      : (row.autoReplyLogs || []),
  };
}

function ensureDataFile() {
  if (!isFsAvailable()) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_BUSINESSES, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write to data file, using in-memory store:", err);
  }
}

export function getAllBusinesses(): Business[] {
  if (!isFsAvailable()) {
    return inMemoryBusinesses;
  }
  ensureDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      inMemoryBusinesses = JSON.parse(content);
    }
  } catch (err) {
    console.warn("Error reading data file, using in-memory store:", err);
  }
  return inMemoryBusinesses;
}

export function getBusinessesByOwner(ownerEmail: string): Business[] {
  const all = getAllBusinesses();
  if (isSuperAdminEmail(ownerEmail)) {
    return all;
  }
  const normalized = (ownerEmail || "").toLowerCase().trim();
  return all.filter((b) => b.ownerEmail.toLowerCase() === normalized);
}

export function getBusinessBySlug(slug: string): Business | null {
  const all = getAllBusinesses();
  const normalized = slug.toLowerCase().trim();
  return all.find((b) => b.slug.toLowerCase() === normalized) || null;
}

const WORKER_D1_API = process.env.CLOUDFLARE_WORKER_URL || "https://revasy-api.widoxstudio.workers.dev";

export async function getAllBusinessesAsync(): Promise<Business[]> {
  const d1 = getD1Binding();
  if (d1 && typeof d1.prepare === "function") {
    try {
      const res = await d1.prepare("SELECT * FROM businesses ORDER BY created_at DESC;").all();
      if (res && Array.isArray(res.results)) {
        const d1Businesses = res.results.map(mapRowToBusiness);
        inMemoryBusinesses = d1Businesses;
        return inMemoryBusinesses;
      }
    } catch (e) {
      console.warn("D1 query error in getAllBusinessesAsync:", e);
    }
  }

  // Cloudflare D1 Edge Worker Gateway (syncs with live Cloudflare D1 database in local dev)
  try {
    const workerRes = await fetch(`${WORKER_D1_API}/api/businesses`, {
      method: "GET",
      cache: "no-store",
    });
    if (workerRes.ok) {
      const data = await workerRes.json();
      if (data && Array.isArray(data.results)) {
        const remoteBusinesses = data.results.map(mapRowToBusiness);
        inMemoryBusinesses = remoteBusinesses;
        if (isFsAvailable()) {
          try {
            ensureDataFile();
            fs.writeFileSync(DATA_FILE, JSON.stringify(remoteBusinesses, null, 2), "utf-8");
          } catch {}
        }
        return inMemoryBusinesses;
      }
    }
  } catch (e) {
    // Fall back to local store if offline
  }

  return getAllBusinesses();
}

export async function getBusinessBySlugAsync(slug: string): Promise<Business | null> {
  const normalized = slug.toLowerCase().trim();
  const d1 = getD1Binding();
  if (d1 && typeof d1.prepare === "function") {
    try {
      const row = await d1.prepare("SELECT * FROM businesses WHERE lower(slug) = ? LIMIT 1;").bind(normalized).first();
      if (row) {
        const biz = mapRowToBusiness(row);
        const idx = inMemoryBusinesses.findIndex((b) => b.slug.toLowerCase() === normalized);
        if (idx >= 0) inMemoryBusinesses[idx] = biz;
        else inMemoryBusinesses.push(biz);
        return biz;
      } else {
        // Confirmed absent in D1 database - prune from memory cache and return null
        inMemoryBusinesses = inMemoryBusinesses.filter((b) => b.slug.toLowerCase() !== normalized && b.id !== normalized);
        return null;
      }
    } catch (e) {
      console.warn("D1 query error in getBusinessBySlugAsync:", e);
    }
  }
  return getBusinessBySlug(slug);
}

export async function getBusinessesByOwnerAsync(ownerEmail: string): Promise<Business[]> {
  const all = await getAllBusinessesAsync();
  if (isSuperAdminEmail(ownerEmail)) {
    return all;
  }
  const normalized = (ownerEmail || "").toLowerCase().trim();
  return all.filter((b) => b.ownerEmail.toLowerCase() === normalized);
}

export async function getSingleBusinessForOwnerAsync(ownerEmail: string): Promise<Business | null> {
  const owned = await getBusinessesByOwnerAsync(ownerEmail);
  return owned.length > 0 ? owned[0] : null;
}

export async function saveBusinessAsync(business: Business): Promise<Business> {
  const all = getAllBusinesses();
  const existingIdx = all.findIndex((b) => b.id === business.id || b.slug.toLowerCase() === business.slug.toLowerCase());

  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...business };
  } else {
    all.push(business);
  }

  inMemoryBusinesses = all;

  // 1. Cloudflare D1 Native Edge Binding
  const d1 = getD1Binding();
  if (d1 && typeof d1.prepare === "function") {
    try {
      await d1.prepare(`INSERT OR REPLACE INTO businesses (
        id, slug, name, tagline, category, description, google_review_url, logo_url, accent_color, custom_prompts, owner_email, total_reviews_generated, total_replies_generated, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`).bind(
        business.id,
        business.slug,
        business.name,
        business.tagline || "",
        business.category || "",
        business.description || "",
        business.googleReviewUrl,
        business.logoUrl || "",
        business.accentColor,
        JSON.stringify(business.customPrompts || []),
        business.ownerEmail,
        business.stats?.totalReviewsGenerated || 0,
        business.stats?.totalRepliesGenerated || 0,
        business.createdAt
      ).run();
    } catch (d1Err) {
      console.warn("D1 edge save warning:", d1Err);
    }
  }

  // 2. Cloudflare D1 HTTP API Background Persistence (if API token present)
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || "38d1ceb6731de305dc93daf3659e371c";
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (cfAccountId && cfApiToken) {
    try {
      const sql = `INSERT OR REPLACE INTO businesses (
        id, slug, name, tagline, category, description, google_review_url, logo_url, accent_color, custom_prompts, owner_email, total_reviews_generated, total_replies_generated, created_at
      ) VALUES (
        '${business.id}', '${business.slug}', '${business.name.replace(/'/g, "''")}', '${(business.tagline || "").replace(/'/g, "''")}', '${(business.category || "").replace(/'/g, "''")}', '${(business.description || "").replace(/'/g, "''")}', '${business.googleReviewUrl}', '${business.logoUrl || ""}', '${business.accentColor}', '${JSON.stringify(business.customPrompts || []).replace(/'/g, "''")}', '${business.ownerEmail}', ${business.stats?.totalReviewsGenerated || 0}, ${business.stats?.totalRepliesGenerated || 0}, '${business.createdAt}'
      );`;
      await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/d1/database/52df4dc3-0470-4abb-a41d-c1d9c534defc/query`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${cfApiToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sql })
      }).catch(() => {});
    } catch {}
  }

  // 3. Cloudflare D1 Edge Worker Gateway (direct cloud sync from local dev)
  try {
    await fetch(`${WORKER_D1_API}/api/businesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(business),
    });
  } catch {}

  // 3. Local filesystem persistence if running in Node.js
  if (isFsAvailable()) {
    try {
      ensureDataFile();
      fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed saving business to file:", err);
    }
  }

  return business;
}

export function saveBusiness(business: Business): Business {
  saveBusinessAsync(business).catch((e) => console.warn("saveBusiness error:", e));
  return business;
}

export async function saveFeedbackAsync(feedback: {
  businessSlug: string;
  rating: number;
  customerText: string;
  contactInfo?: string;
}): Promise<boolean> {
  const d1 = getD1Binding();
  if (d1 && typeof d1.prepare === "function") {
    try {
      await d1.prepare(`INSERT INTO review_logs (
        id, business_id, rating, review_text, created_at
      ) VALUES (?, ?, ?, ?, ?);`).bind(
        `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        feedback.businessSlug,
        feedback.rating,
        feedback.contactInfo ? `${feedback.customerText}\n[Contact: ${feedback.contactInfo}]` : feedback.customerText,
        new Date().toISOString()
      ).run();
      return true;
    } catch (e) {
      console.warn("D1 review_logs save error:", e);
    }
  }

  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || "38d1ceb6731de305dc93daf3659e371c";
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (cfAccountId && cfApiToken) {
    try {
      const fullText = feedback.contactInfo ? `${feedback.customerText}\n[Contact: ${feedback.contactInfo}]` : feedback.customerText;
      const sql = `INSERT INTO review_logs (id, business_id, rating, review_text, created_at) VALUES ('log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}', '${feedback.businessSlug.replace(/'/g, "''")}', ${feedback.rating}, '${fullText.replace(/'/g, "''")}', '${new Date().toISOString()}');`;
      await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/d1/database/52df4dc3-0470-4abb-a41d-c1d9c534defc/query`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${cfApiToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sql })
      }).catch(() => {});
    } catch {}
  }

  return true;
}

export function incrementBusinessReviewStats(slug: string): void {
  const b = getBusinessBySlug(slug);
  if (b) {
    b.stats.totalReviewsGenerated += 1;
    saveBusiness(b);
  }
}

export function incrementBusinessReplyStats(slug: string): void {
  const b = getBusinessBySlug(slug);
  if (b) {
    b.stats.totalRepliesGenerated += 1;
    saveBusiness(b);
  }
}

export async function updateBusinessGoogleOAuth(
  slug: string,
  data: Partial<GoogleOAuthData>
): Promise<Business | null> {
  const b = await getBusinessBySlugAsync(slug);
  if (!b) return null;

  b.googleOAuth = {
    connected: true,
    ...(b.googleOAuth || {}),
    ...data,
  };

  // If autoReplyConfig doesn't exist yet, initialize default
  if (!b.autoReplyConfig) {
    b.autoReplyConfig = {
      enabled: true,
      tone: "warm",
      minRating: 1,
      signature: `— Team ${b.name}`,
      autoPublish: true,
      totalAutoRepliesSent: 0,
      lastSyncAt: new Date().toISOString(),
    };
  }

  await saveBusinessAsync(b);
  return b;
}

export async function updateBusinessAutoReplyConfig(
  slug: string,
  configData: Partial<AutoReplyConfig>
): Promise<Business | null> {
  const b = await getBusinessBySlugAsync(slug);
  if (!b) return null;

  b.autoReplyConfig = {
    enabled: true,
    tone: "warm",
    minRating: 1,
    signature: `— Team ${b.name}`,
    autoPublish: true,
    totalAutoRepliesSent: 0,
    ...(b.autoReplyConfig || {}),
    ...configData,
  };

  await saveBusinessAsync(b);
  return b;
}

export async function addBusinessAutoReplyLog(
  slug: string,
  log: AutoReplyLog
): Promise<Business | null> {
  const b = await getBusinessBySlugAsync(slug);
  if (!b) return null;

  if (!b.autoReplyLogs) {
    b.autoReplyLogs = [];
  }

  // Prepend latest log
  b.autoReplyLogs.unshift(log);

  // Keep last 50 logs
  if (b.autoReplyLogs.length > 50) {
    b.autoReplyLogs = b.autoReplyLogs.slice(0, 50);
  }

  if (b.autoReplyConfig) {
    b.autoReplyConfig.totalAutoRepliesSent = (b.autoReplyConfig.totalAutoRepliesSent || 0) + 1;
    b.autoReplyConfig.lastSyncAt = new Date().toISOString();
  }

  b.stats.totalRepliesGenerated = (b.stats.totalRepliesGenerated || 0) + 1;

  await saveBusinessAsync(b);
  return b;
}

export async function clearBusinessGoogleOAuth(
  slug: string
): Promise<Business | null> {
  const b = await getBusinessBySlugAsync(slug);
  if (!b) return null;

  b.googleOAuth = {
    connected: false,
  };

  if (b.autoReplyConfig) {
    b.autoReplyConfig.enabled = false;
  }

  await saveBusinessAsync(b);
  return b;
}

export async function clearBusinessAutoReplyLogs(
  slug: string
): Promise<Business | null> {
  const b = await getBusinessBySlugAsync(slug);
  if (!b) return null;

  b.autoReplyLogs = [];
  if (b.autoReplyConfig) {
    b.autoReplyConfig.totalAutoRepliesSent = 0;
  }

  await saveBusinessAsync(b);
  return b;
}

export async function deleteBusinessAsync(slugOrId: string): Promise<boolean> {
  const normalized = slugOrId.toLowerCase().trim();
  inMemoryBusinesses = inMemoryBusinesses.filter(
    (b) => b.id !== slugOrId && b.slug.toLowerCase() !== normalized
  );

  if (isFsAvailable()) {
    try {
      ensureDataFile();
      fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryBusinesses, null, 2), "utf-8");
    } catch (err) {
      console.warn("Failed deleting business from file:", err);
    }
  }

  const d1 = getD1Binding();
  if (d1 && typeof d1.prepare === "function") {
    try {
      await d1.prepare("DELETE FROM businesses WHERE lower(slug) = ? OR id = ?;").bind(normalized, slugOrId).run();
      await d1.prepare("DELETE FROM review_logs WHERE lower(business_id) = ? OR business_id = ?;").bind(normalized, slugOrId).run().catch(() => {});
    } catch (e) {
      console.warn("D1 delete error:", e);
    }
  }

  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || "38d1ceb6731de305dc93daf3659e371c";
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (cfAccountId && cfApiToken) {
    try {
      const sql = `DELETE FROM businesses WHERE lower(slug) = '${normalized.replace(/'/g, "''")}' OR id = '${slugOrId.replace(/'/g, "''")}'; DELETE FROM review_logs WHERE lower(business_id) = '${normalized.replace(/'/g, "''")}';`;
      await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/d1/database/52df4dc3-0470-4abb-a41d-c1d9c534defc/query`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${cfApiToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sql })
      }).catch(() => {});
    } catch {}
  }

  // Cloudflare D1 Edge Worker Gateway (direct cloud sync from local dev)
  try {
    await fetch(`${WORKER_D1_API}/api/businesses/${encodeURIComponent(slugOrId)}`, {
      method: "DELETE",
    });
  } catch {}

  return true;
}

