import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import {
  marketplaceApiBase,
  productsApiBase,
} from "@/lib/marketplace-api-base";

export type GradeTdsDocument = {
  id: string;
  type?: string;
  title?: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  manufacturer?: string | null;
  gradeCode?: string | null;
  categoryCode?: string | null;
  revision?: number | null;
  verificationStatus?: string | null;
  sourceKind?: string | null;
  format?: "pdf" | "image" | "other" | string | null;
  available?: boolean;
  downloadRequiresAuth?: boolean;
  uploadedAt?: string | null;
  approvedAt?: string | null;
  /** @deprecated Grade TDS is independent of product offers */
  productId?: string;
  productCode?: string | null;
  productName?: string | null;
  description?: string;
  version?: number;
  status?: string;
};

export type GradeTdsResponse = {
  grade: {
    id: string;
    code: string;
    name: string;
    manufacturer?: string | null;
  };
  available: boolean;
  message: string | null;
  canRequest: boolean;
  items: GradeTdsDocument[];
};

/** Product TDS = grade-library sheet with titles synced to the product/grade name. */
export type ProductTdsResponse = GradeTdsResponse & {
  product?: {
    id: string;
    code: string;
    name: string;
    manufacturer?: string | null;
  };
};

export type GradeTdsDocumentUrl = {
  url: string;
  fileName?: string | null;
  mimeType?: string | null;
  expiresInSeconds?: number;
};

export type GradeTdsRequestResult = {
  id: string;
  referenceNumber: string;
  status: string;
  alreadyExists?: boolean;
};

const emptyTds = (gradeId: string): GradeTdsResponse => ({
  grade: { id: gradeId, code: "", name: "" },
  available: false,
  message: "TDS unavailable",
  canRequest: true,
  items: [],
});

function normalizeTds(
  data: GradeTdsResponse | ProductTdsResponse | null | undefined,
  fallbackGradeId: string,
): GradeTdsResponse | ProductTdsResponse {
  if (!data) return emptyTds(fallbackGradeId);
  return {
    ...data,
    canRequest: Boolean(
      data.canRequest ?? (!data.available || !data.items?.length),
    ),
    items: data.items ?? [],
  };
}

/** Grade TDS metadata — public for guests; customer marketplace when signed in. */
export async function fetchGradeTds(
  gradeId: string,
): Promise<GradeTdsResponse> {
  const base = marketplaceApiBase();
  const payload = await apiClient.get<Envelope<GradeTdsResponse>>(
    `${base}/grades/${encodeURIComponent(gradeId)}/tds`,
    { skipAuth: base === "/public/marketplace" },
  );
  return normalizeTds(payload.data, gradeId);
}

/**
 * Verified grade-library TDS for a marketplace product (titles synced to product name).
 * Prefers `/products/:id/tds`; falls back to grade TDS when gradeId is known.
 */
export async function fetchProductTdsDocuments(
  productId: string,
  options?: { gradeId?: string | null },
): Promise<ProductTdsResponse> {
  try {
    const base = productsApiBase();
    const payload = await apiClient.get<Envelope<ProductTdsResponse>>(
      `${base}/${encodeURIComponent(productId)}/tds`,
      { skipAuth: base.startsWith("/public/") },
    );
    return normalizeTds(
      payload.data,
      options?.gradeId ?? "",
    ) as ProductTdsResponse;
  } catch {
    if (options?.gradeId) {
      return fetchGradeTds(options.gradeId);
    }
    return emptyTds("");
  }
}

/** Authenticated signed URL for a verified grade-level TDS document. */
export async function fetchGradeTdsDocumentUrl(
  gradeId: string,
  documentId: string,
): Promise<GradeTdsDocumentUrl> {
  const payload = await apiClient.get<Envelope<GradeTdsDocumentUrl>>(
    `/customer/marketplace/grades/${encodeURIComponent(gradeId)}/tds/${encodeURIComponent(documentId)}/url`,
  );
  if (!payload.data?.url) {
    throw new Error("Document URL unavailable");
  }
  return payload.data;
}

/** Request a TDS when none is verified for the grade. */
export async function requestGradeTds(
  gradeId: string,
  input?: { message?: string },
): Promise<GradeTdsRequestResult> {
  const payload = await apiClient.post<Envelope<GradeTdsRequestResult>>(
    `/customer/marketplace/grades/${encodeURIComponent(gradeId)}/tds-requests`,
    input?.message?.trim() ? { message: input.message.trim() } : {},
  );
  if (!payload.data?.id) {
    throw new Error(payload.message || "Unable to submit TDS request");
  }
  return payload.data;
}

export type ProductDocumentUrl = {
  url: string;
  fileName?: string;
  title?: string;
};

/** Authenticated signed URL for a product document (legacy product detail downloads). */
export async function fetchProductDocumentUrl(
  productId: string,
  docId: string,
): Promise<ProductDocumentUrl> {
  const payload = await apiClient.get<Envelope<ProductDocumentUrl>>(
    `/customer/products/${encodeURIComponent(productId)}/documents/${encodeURIComponent(docId)}/url`,
  );
  if (!payload.data?.url) {
    throw new Error("Document URL unavailable");
  }
  return payload.data;
}
