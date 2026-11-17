import { env } from "@/lib/env";

function readableName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    return null;
  }
  return trimmed;
}

async function readCatalogueName(path: string): Promise<string | null> {
  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: Record<string, unknown> };
    const data = body.data ?? {};
    const grade =
      data.grade && typeof data.grade === "object"
        ? (data.grade as Record<string, unknown>)
        : null;
    return (
      readableName(data.displayName) ??
      readableName(data.fullGradeName) ??
      readableName(grade?.displayName) ??
      readableName(grade?.fullGradeName) ??
      readableName(data.name) ??
      readableName(grade?.name)
    );
  } catch {
    return null;
  }
}

export function fetchPublicGradeTitle(id: string): Promise<string | null> {
  return readCatalogueName(
    `/public/marketplace/grades/${encodeURIComponent(id)}`,
  );
}

export function fetchPublicProductTitle(id: string): Promise<string | null> {
  return readCatalogueName(
    `/public/marketplace/products/${encodeURIComponent(id)}`,
  );
}
