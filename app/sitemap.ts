import type { MetadataRoute } from "next";
import { getSiteVehicles } from "@/lib/server-catalog";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/vehicules"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/conditions"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  const cars = getSiteVehicles().map(v => ({
    url: absoluteUrl(`/vehicules/${v.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: [absoluteUrl(v.photo)],
  }));
  return [...pages, ...cars];
}
