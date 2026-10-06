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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "businesses.json");

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
      totalReviewsGenerated: 42,
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
];

let inMemoryBusinesses: Business[] = [...DEFAULT_BUSINESSES];

function isFsAvailable(): boolean {
  try {
    return (
      typeof process !== "undefined" &&
      process.env.NEXT_RUNTIME !== "edge" &&
      typeof fs !== "undefined" &&
      typeof fs.existsSync === "function"
    );
  } catch {
    return false;
  }
}

function getKvBinding(): any {
  try {
    const env = (process.env as any) || {};
    return env.BUSINESSES_KV || env.KV || (globalThis as any).BUSINESSES_KV || null;
  } catch {
    return null;
  }
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
  // If owner is the demo/admin or default owner, show businesses, or filter by email
  return all.filter(
    (b) =>
      b.ownerEmail.toLowerCase() === ownerEmail.toLowerCase() ||
      ownerEmail.toLowerCase() === "owner@cocovacafe.com" ||
      ownerEmail.toLowerCase() === "admin@widox.in"
  );
}

export function getBusinessBySlug(slug: string): Business | null {
  const all = getAllBusinesses();
  const normalized = slug.toLowerCase().trim();
  return all.find((b) => b.slug.toLowerCase() === normalized) || null;
}

export function saveBusiness(business: Business): Business {
  const all = getAllBusinesses();
  const existingIdx = all.findIndex((b) => b.id === business.id || b.slug === business.slug);

  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...business };
  } else {
    all.push(business);
  }

  inMemoryBusinesses = all;

  // Cloudflare KV persistence if deployed to Cloudflare Workers
  const kv = getKvBinding();
  if (kv && typeof kv.put === "function") {
    try {
      kv.put("businesses", JSON.stringify(all));
      kv.put(`biz_${business.slug}`, JSON.stringify(business));
    } catch (kvErr) {
      console.warn("Failed saving to Cloudflare KV:", kvErr);
    }
  }

  // Local filesystem persistence if running in Node.js
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
