import { isAxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";

export type GradeRequestStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INFO_REQUIRED"
  | "GRADE_IDENTIFIED"
  | "QUOTATION_AVAILABLE"
  | "CONVERTED_TO_PR"
  | "REJECTED"
  | "CLOSED";

export const GRADE_REQUEST_UNITS = ["MT", "KG", "LTR"] as const;
export type GradeRequestUnit = (typeof GRADE_REQUEST_UNITS)[number];

export const GRADE_REQUEST_DOCUMENT_TYPES = [
  { value: "TDS", label: "Technical data sheet (TDS)" },
  { value: "TECHNICAL_SPECIFICATION", label: "Technical specification" },
  { value: "MSDS", label: "Safety data sheet (MSDS)" },
  { value: "COA", label: "Certificate of analysis (COA)" },
  { value: "OTHER", label: "Other" },
] as const;
export type GradeRequestDocumentType =
  (typeof GRADE_REQUEST_DOCUMENT_TYPES)[number]["value"];

export interface GradeRequestTimelineItem {
  id: string;
  type: string;
  toStatus: GradeRequestStatus | null;
  toStatusLabel: string | null;
  actor: "YOU" | "POLYSTOREX" | string;
  message: string | null;
  createdAt: string;
}

export interface GradeRequestAttachment {
  id: string;
  fileName: string;
  documentType?: string | null;
  mimeType?: string | null;
}

export interface GradeRequest {
  id: string;
  referenceNumber: string;
  status: GradeRequestStatus;
  statusLabel: string;
  statusDescription: string;
  isOpen: boolean;
  awaitingCustomerResponse: boolean;
  gradeName: string;
  materialCategory: string;
  manufacturer: string | null;
  gradeGroup: string | null;
  application: string | null;
  technicalSpecs: string | null;
  remarks: string | null;
  quantity: string;
  unit: string;
  deliveryLocation: string;
  deliveryPincode: string | null;
  requiredByDate: string | null;
  preferredPackaging: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  adminMessage: string | null;
  closureReason: string | null;
  resolvedGrade: { id: string; code: string; name: string } | null;
  submittedAt: string;
  updatedAt: string;
  timeline: GradeRequestTimelineItem[];
  documents: GradeRequestAttachment[];
}

export interface GradeRequestPrefill {
  companyName: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactPhoneVerified: boolean;
  contactEmail: string | null;
  defaultAddress: {
    id: string;
    label: string | null;
    formatted: string;
    postalCode: string | null;
    city: string | null;
  } | null;
  limits: {
    maxDocuments: number;
    maxFileSizeBytes: number;
    allowedMimeTypes: string[];
    storageConfigured: boolean;
  };
}

export interface CreateGradeRequestInput {
  gradeName: string;
  materialCategory: string;
  manufacturer?: string;
  gradeGroup?: string;
  application?: string;
  technicalSpecs?: string;
  remarks?: string;
  quantity: number;
  unit: GradeRequestUnit;
  deliveryLocation: string;
  deliveryPincode?: string;
  deliveryAddressId?: string;
  requiredByDate?: string;
  preferredPackaging?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  idempotencyKey?: string;
  acknowledgeExisting?: boolean;
}

export interface CatalogueMatch {
  id: string;
  code: string;
  name: string;
  gradeNo?: string | null;
  manufacturer?: string | null;
}

/** Structured failure so the form can react to duplicate / already-in-catalogue cases. */
export class GradeRequestError extends Error {
  code?: string;
  status?: number;
  matches?: CatalogueMatch[];
  existing?: {
    id: string;
    referenceNumber: string;
    status: GradeRequestStatus;
  };
  constructor(message: string, init: Partial<GradeRequestError> = {}) {
    super(message);
    this.name = "GradeRequestError";
    Object.assign(this, init);
  }
}

function toError(error: unknown, fallback: string): GradeRequestError {
  if (isAxiosError(error)) {
    if (!error.response) {
      return new GradeRequestError(
        "Unable to reach PolyStoreX. Check your connection and try again.",
        { code: "NETWORK" },
      );
    }
    const data = (error.response.data ?? {}) as {
      message?: string | string[];
      code?: string;
      details?: {
        matches?: CatalogueMatch[];
        existing?: GradeRequestError["existing"];
      };
    };
    const message = Array.isArray(data.message)
      ? data.message[0]
      : data.message;
    return new GradeRequestError(message || fallback, {
      code: data.code,
      status: error.response.status,
      matches: data.details?.matches,
      existing: data.details?.existing,
    });
  }
  return new GradeRequestError(
    error instanceof Error && error.message ? error.message : fallback,
  );
}

async function call<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw toError(error, fallback);
  }
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const fetchGradeRequestPrefill = () =>
  call(
    async () =>
      (
        await apiClient.get<Envelope<GradeRequestPrefill>>(
          "/customer/grade-requests/prefill",
        )
      ).data,
    "Unable to load your details.",
  );

export const createGradeRequest = (input: CreateGradeRequestInput) =>
  call(
    async () =>
      (
        await apiClient.post<Envelope<GradeRequest>>(
          "/customer/grade-requests",
          input,
        )
      ).data,
    "We could not submit your request. Please try again.",
  );

export const listGradeRequests = (page = 1, limit = 20) =>
  call(async () => {
    const res = await apiClient.get<Envelope<GradeRequest[]>>(
      `/customer/grade-requests?page=${page}&limit=${limit}`,
    );
    return {
      items: res.data ?? [],
      meta: res.meta ?? {
        page,
        limit,
        total: res.data?.length ?? 0,
        totalPages: 1,
      },
    };
  }, "Unable to load your grade requests.");

export const fetchGradeRequest = (id: string) =>
  call(
    async () =>
      (
        await apiClient.get<Envelope<GradeRequest>>(
          `/customer/grade-requests/${encodeURIComponent(id)}`,
        )
      ).data,
    "Unable to load this request.",
  );

export const respondToGradeRequest = (id: string, message: string) =>
  call(
    async () =>
      (
        await apiClient.post<Envelope<GradeRequest>>(
          `/customer/grade-requests/${encodeURIComponent(id)}/respond`,
          { message },
        )
      ).data,
    "Unable to send your response.",
  );

export const cancelGradeRequest = (id: string, reason?: string) =>
  call(
    async () =>
      (
        await apiClient.post<Envelope<GradeRequest>>(
          `/customer/grade-requests/${encodeURIComponent(id)}/cancel`,
          { reason },
        )
      ).data,
    "Unable to cancel this request.",
  );

function putToSignedUrl(uploadUrl: string, file: File): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error("File upload failed. Please try again."));
    xhr.onerror = () =>
      reject(new Error("File upload failed. Please try again."));
    xhr.send(file);
  });
}

/**
 * Attach a file to an already-submitted request. Failure here never loses the
 * request — it is already saved — so callers report it and let the user retry.
 */
export async function uploadGradeRequestDocument(
  requestId: string,
  documentType: GradeRequestDocumentType,
  file: File,
): Promise<void> {
  const created = await call(
    async () =>
      (
        await apiClient.post<
          Envelope<{ id: string; uploadUrl?: string | null }>
        >(
          `/customer/grade-requests/${encodeURIComponent(requestId)}/documents`,
          {
            documentType,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            fileSizeBytes: file.size,
          },
        )
      ).data,
    "Unable to attach the file.",
  );
  if (!created?.uploadUrl) {
    throw new GradeRequestError(
      "File storage is not available right now. Your request was saved; you can attach the file later.",
      { code: "STORAGE_UNAVAILABLE" },
    );
  }
  await putToSignedUrl(created.uploadUrl, file);
}

export async function getGradeRequestDocumentUrl(
  requestId: string,
  documentId: string,
): Promise<string | null> {
  const data = await call(
    async () =>
      (
        await apiClient.get<Envelope<{ url: string | null }>>(
          `/customer/grade-requests/${encodeURIComponent(requestId)}/documents/${encodeURIComponent(documentId)}/download`,
        )
      ).data,
    "Unable to open the document.",
  );
  return data?.url ?? null;
}

export const gradeRequestPath = (id: string) =>
  `/marketplace/grade-requests/${encodeURIComponent(id)}`;
