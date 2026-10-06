import type { MetadataRoute } from "next";
import { getAllBusinesses } from "@/lib/business-store";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://revasy.pages.dev";
  const businesses = getAllBusinesses();

  const businessEntries: MetadataRoute.Sitemap = businesses.map((biz) => ({
    url: `${baseUrl}/b/${biz.slug}`,
    lastModified: biz.createdAt ? new Date(biz.createdAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...businessEntries,
  ];
}
