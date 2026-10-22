import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import { marketplaceApiBase } from "@/lib/marketplace-api-base";

export type GradeTdsDocument = {
  id: string;
  type?: string;
  title?: string;
  description?: string;
  fileName?: string;
  version?: number;
  status?: string;
  productId?: string;
  productCode?: string | null;
  productName?: string | null;
  manufacturer?: string | null;
  downloadRequiresAuth?: boolean;
};

export type GradeTdsResponse = {
  grade: {
    id: string;
    code: string;
    name: string;
  };
  available: boolean;
  message: string | null;
  items: GradeTdsDocument[];
};

export async function fetchGradeTds(
  gradeId: string,
): Promise<GradeTdsResponse> {
  const base = marketplaceApiBase();
  const payload = await apiClient.get<Envelope<GradeTdsResponse>>(
    `${base}/grades/${encodeURIComponent(gradeId)}/tds`,
    { skipAuth: base === "/public/marketplace" },
  );
  return (
    payload.data ?? {
      grade: { id: gradeId, code: "", name: "" },
      available: false,
      message: "TDS unavailable",
      items: [],
    }
  );
}

export type ProductDocumentUrl = {
  url: string;
  fileName?: string;
  title?: string;
};

/** Authenticated signed URL for a product document (TDS download). */
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
