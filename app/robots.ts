import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  PUBLIC_SITEMAP_PATHS,
  publicSiteOrigin,
  robotsDisallowPaths,
} from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [...PUBLIC_SITEMAP_PATHS],
      disallow: robotsDisallowPaths(),
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: publicSiteOrigin(),
  };
}
