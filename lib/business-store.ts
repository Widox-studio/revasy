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

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  googleReviewUrl: string;
  logoUrl?: string;
  accentColor: "teal" | "pink" | "peach" | "lavender" | "ochre" | "mint";
  customPrompts: string[];
  ownerEmail: string;
  createdAt: string;
  stats: {
    totalReviewsGenerated: number;
    totalRepliesGenerated: number;
  };
}

const DATA_DIR = path ? path.join(process.cwd(), "data") : "";
const DATA_FILE = path ? path.join(DATA_DIR, "businesses.json") : "";

// Default initial businesses
const DEFAULT_BUSINESSES: Business[] = [
  {
    id: "biz_cocova",
    slug: "cocova",
    name: "Cocova Cafe",
    tagline: "Artisan Coffee & Warm Moments",
    category: "Cafe & Bakery",
    description: "Handcrafted espresso, artisan pastries, and heartwarming neighborhood hospitality.",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJcocova_demo_place",
    logoUrl: "",
    accentColor: "teal",
    customPrompts: [
      "Amazing coffee & latte art",
      "Super friendly baristas",
      "Delicious pastries & fresh bites",
      "Cozy atmosphere & great vibe",
      "Fast service & relaxing music",
    ],
    ownerEmail: "owner@cocovacafe.com",
    createdAt: new Date().toISOString(),
    stats: {
      totalReviewsGenerated: 45,
      totalRepliesGenerated: 18,
    },
  },
  {
    id: "biz_apex_dental",
    slug: "apex-dental",
    name: "Apex Smile Dental",
    tagline: "Gentle Care & Radiant Smiles",
    category: "Dental & Healthcare",
    description: "Modern family dental clinic offering gentle checkups, cosmetic dentistry, and dental hygiene.",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJapexdental_demo",
    logoUrl: "",
    accentColor: "mint",
    customPrompts: [
      "Completely painless treatment",
      "Very gentle and thorough dentist",
      "Friendly front-desk team",
      "Immaculately clean modern clinic",
      "Transparent consultation & pricing",
    ],
    ownerEmail: "owner@cocovacafe.com",
    createdAt: new Date().toISOString(),
    stats: {
      totalReviewsGenerated: 19,
      totalRepliesGenerated: 8,
    },
  },
  {
    id: "biz_luxe_salon",
    slug: "luxe-salon",
    name: "Luxe Studio & Hair Spa",
    tagline: "Elevate Your Style",
    category: "Salon & Wellness",
    description: "Bespoke styling, hair transformations, rejuvenating facials, and luxury care.",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJluxesalon_demo",
    logoUrl: "",
    accentColor: "lavender",
    customPrompts: [
      "Flawless haircut and color",
      "Relaxing head massage & hair spa",
      "Attentive and talented stylist",
      "Chic aesthetic & great hospitality",
      "Booked appointment started right on time",
    ],
    ownerEmail: "owner@cocovacafe.com",
    createdAt: new Date().toISOString(),
    stats: {
      totalReviewsGenerated: 27,
      totalRepliesGenerated: 12,
    },
  },
  {
    id: "biz_1791267909539",
    slug: "cocova-cafe",
    name: "Cocova Cafe",
    tagline: "Artisan Coffee & Warm Moments",
    category: "Cafe & Restaurant",
    description: "Aesthetic coffee shop with cozy ambience and handcrafted treats.",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=cocova-cafe",
    logoUrl: "/uploads/logo_1791267891343_jn2hrv.png",
    accentColor: "peach",
    customPrompts: [
      "Artisan coffee was superb",
      "Delicious pastries & brunch",
      "Warm, welcoming staff",
      "Cozy seating & vibe",
    ],
    ownerEmail: "advertising.coral@gmail.com",
    createdAt: new Date().toISOString(),
    stats: {
      totalReviewsGenerated: 3,
      totalRepliesGenerated: 1,
    },
  },
];

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
  return all.filter(
    (b) =>
      b.ownerEmail.toLowerCase() === ownerEmail.toLowerCase() ||
      ownerEmail.toLowerCase() === "owner@cocovacafe.com" ||
      ownerEmail.toLowerCase() === "admin@revasy.com" ||
      ownerEmail.toLowerCase() === "admin@widox.in"
  );
}

export function getBusinessBySlug(slug: string): Business | null {
  const all = getAllBusinesses();
  const normalized = slug.toLowerCase().trim();
  return all.find((b) => b.slug.toLowerCase() === normalized) || null;
}

export async function getAllBusinessesAsync(): Promise<Business[]> {
  const d1 = getD1Binding();
  if (d1 && typeof d1.prepare === "function") {
    try {
      const res = await d1.prepare("SELECT * FROM businesses ORDER BY created_at DESC;").all();
      if (res && res.results && res.results.length > 0) {
        const d1Businesses = res.results.map(mapRowToBusiness);
        const existingSlugs = new Set(d1Businesses.map((b: Business) => b.slug.toLowerCase()));
        const merged = [...d1Businesses];
        for (const defBiz of inMemoryBusinesses) {
          if (!existingSlugs.has(defBiz.slug.toLowerCase())) {
            merged.push(defBiz);
          }
        }
        inMemoryBusinesses = merged;
        return inMemoryBusinesses;
      }
    } catch (e) {
      console.warn("D1 query error in getAllBusinessesAsync:", e);
    }
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
      }
    } catch (e) {
      console.warn("D1 query error in getBusinessBySlugAsync:", e);
    }
  }
  return getBusinessBySlug(slug);
}

export async function getBusinessesByOwnerAsync(ownerEmail: string): Promise<Business[]> {
  const all = await getAllBusinessesAsync();
  return all.filter(
    (b) =>
      b.ownerEmail.toLowerCase() === ownerEmail.toLowerCase() ||
      ownerEmail.toLowerCase() === "owner@cocovacafe.com" ||
      ownerEmail.toLowerCase() === "admin@revasy.com" ||
      ownerEmail.toLowerCase() === "admin@widox.in"
  );
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
