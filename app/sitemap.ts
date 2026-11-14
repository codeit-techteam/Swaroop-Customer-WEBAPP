import type { MetadataRoute } from "next";
import { ROUTES, marketplaceGradePath } from "@/constants";
import { absoluteUrl, PUBLIC_SITEMAP_PATHS } from "@/lib/seo";
import { env } from "@/lib/env";

type GradeRow = { id: string; updatedAt?: string };
type GradesEnvelope = {
  data?: GradeRow[];
  meta?: { page: number; totalPages: number; total: number };
};

/**
 * Public grade detail URLs for grades that currently have live marketplace offers.
 * Caps pages so sitemap generation stays bounded.
 */
async function fetchLiveGradeIds(): Promise<
  Array<{ id: string; lastModified?: Date }>
> {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  const limit = 100;
  const maxPages = 5;
  const out: Array<{ id: string; lastModified?: Date }> = [];
  const seen = new Set<string>();

  for (let page = 1; page <= maxPages; page += 1) {
    try {
      const res = await fetch(
        `${base}/public/marketplace/grades?hasOffers=true&page=${page}&limit=${limit}`,
        {
          next: { revalidate: 3600 },
          headers: { Accept: "application/json" },
        },
      );
      if (!res.ok) break;
      const body = (await res.json()) as GradesEnvelope;
      const rows = body.data ?? [];
      for (const row of rows) {
        if (!row?.id || seen.has(row.id)) continue;
        seen.add(row.id);
        out.push({
          id: row.id,
          lastModified: row.updatedAt ? new Date(row.updatedAt) : undefined,
        });
      }
      const totalPages = body.meta?.totalPages ?? 1;
      if (page >= totalPages) break;
    } catch {
      break;
    }
  }

  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_SITEMAP_PATHS.map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: path.startsWith("/marketplace") ? "daily" : "monthly",
      priority: path === ROUTES.marketplace ? 0.9 : 0.6,
    }),
  );

  const grades = await fetchLiveGradeIds();
  const gradeEntries: MetadataRoute.Sitemap = grades.map((grade) => ({
    url: absoluteUrl(marketplaceGradePath(grade.id)),
    lastModified: grade.lastModified ?? lastModified,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...gradeEntries];
}
