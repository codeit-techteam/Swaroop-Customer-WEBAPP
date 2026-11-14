import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_SITEMAP_PATHS } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_SITEMAP_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path.startsWith("/marketplace") ? "daily" : "monthly",
    priority: path === PUBLIC_SITEMAP_PATHS[3] ? 0.9 : 0.6,
  }));
}
