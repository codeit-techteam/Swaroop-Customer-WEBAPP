import { isAxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import { num, type Envelope } from "@/lib/api-envelope";
import type { CreditSummary, OutstandingPayment } from "@/types/dashboard";
import type {
  CreditAccountSnapshot,
  CreditApplicationDocument,
  CreditApplicationStatus,
  CreditApplicationView,
  CreditDocumentType,
  CreditMissingDocument,
  CreditTimelineEvent,
} from "@/types/credit-application";

export type BackendCreditLimit = {
  approvedLimit?: string;
  availableLimit?: string;
  pendingCredit?: string;
  utilizedAmount?: string;
  outstandingAmount?: string;
  status?: string;
  currency?: string;
};

export type BackendCreditApplicationBrief = {
  id: string;
  applicationNumber: string;
  status: CreditApplicationStatus;
  requestedLimit: string;
  requestedTenureDays?: number | null;
  purpose?: string | null;
  submittedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** `GET /customer/credit/summary` */
export type BackendCreditAccount = {
  customerId?: string;
  application?: BackendCreditApplicationBrief | null;
  account?: CreditAccountSnapshot | null;
  status?: string;
};

export type CreditApplicationStatusSnapshot = {
  id: string;
  applicationNumber: string;
  status: CreditApplicationStatus;
  insuranceStatus: string | null;
  arrangementStatus: string | null;
  customerMessage: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  approvedLimit: string | null;
  approvedTenureDays: number | null;
  missingDocuments: CreditMissingDocument[];
  canSubmit: boolean;
  nextStep: string;
};

export type CreditDraftInput = {
  requestedLimit: number;
  requestedTenureDays?: number;
  purpose?: string;
  metadata?: Record<string, unknown>;
};

export type CreditDocumentCreateInput = {
  documentType: CreditDocumentType;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  metadata?: Record<string, unknown>;
};

/** `uploadUrl` is absent whenever R2 is not configured on the backend. */
export type CreditDocumentCreated = CreditApplicationDocument & {
  uploadUrl?: string | null;
  storageConfigured?: boolean;
};

// ---------------------------------------------------------------------------
// Account + limits
// ---------------------------------------------------------------------------

export async function fetchCustomerCreditLimit(): Promise<BackendCreditLimit> {
  const payload = await apiClient.get<Envelope<BackendCreditLimit>>(
    "/customer/credit/limit",
  );
  return payload.data;
}

export async function fetchCustomerCreditSummary(): Promise<BackendCreditAccount> {
  const payload = await apiClient.get<Envelope<BackendCreditAccount>>(
    "/customer/credit/summary",
  );
  return payload.data;
}

/**
 * One-shot submit without documents. Kept for the legacy `creditService.apply`
 * facade — the wizard uses saveDraft + documents + submit instead.
 */
export async function applyCustomerCredit(input: CreditDraftInput) {
  const payload = await apiClient.post<Envelope<unknown>>(
    "/customer/credit/apply",
    input,
  );
  return payload.data;
}

// ---------------------------------------------------------------------------
// Application lifecycle
// ---------------------------------------------------------------------------

export async function fetchLatestCreditApplication(): Promise<CreditApplicationView | null> {
  const payload = await apiClient.get<Envelope<CreditApplicationView | null>>(
    "/customer/credit/application",
  );
  return payload.data ?? null;
}

export async function fetchCreditApplication(
  id: string,
): Promise<CreditApplicationView> {
  const payload = await apiClient.get<Envelope<CreditApplicationView>>(
    `/customer/credit/applications/${id}`,
  );
  return payload.data;
}

export async function fetchCreditApplicationStatus(
  id: string,
): Promise<CreditApplicationStatusSnapshot> {
  const payload = await apiClient.get<
    Envelope<CreditApplicationStatusSnapshot>
  >(`/customer/credit/applications/${id}/status`);
  return payload.data;
}

export async function fetchCreditApplicationTimeline(
  id: string,
): Promise<CreditTimelineEvent[]> {
  const payload = await apiClient.get<Envelope<CreditTimelineEvent[]>>(
    `/customer/credit/applications/${id}/timeline`,
  );
  return payload.data ?? [];
}

/** Creates the open DRAFT, or updates it when one already exists. */
export async function saveCreditApplicationDraft(
  input: CreditDraftInput,
): Promise<CreditApplicationView> {
  const payload = await apiClient.post<Envelope<CreditApplicationView>>(
    "/customer/credit/applications",
    input,
  );
  return payload.data;
}

export async function submitCreditApplication(id: string): Promise<{
  id: string;
  applicationNumber: string;
  status: CreditApplicationStatus;
  submittedAt: string | null;
  nextStep: string;
}> {
  const payload = await apiClient.post<
    Envelope<{
      id: string;
      applicationNumber: string;
      status: CreditApplicationStatus;
      submittedAt: string | null;
      nextStep: string;
    }>
  >(`/customer/credit/applications/${id}/submit`);
  return payload.data;
}

export async function resubmitCreditApplicationDocuments(
  id: string,
  message?: string,
): Promise<{
  id: string;
  applicationNumber: string;
  status: CreditApplicationStatus;
  nextStep: string;
}> {
  const payload = await apiClient.post<
    Envelope<{
      id: string;
      applicationNumber: string;
      status: CreditApplicationStatus;
      nextStep: string;
    }>
  >(
    `/customer/credit/applications/${id}/resubmit-documents`,
    message ? { message } : {},
  );
  return payload.data;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function createCreditApplicationDocument(
  applicationId: string,
  input: CreditDocumentCreateInput,
): Promise<CreditDocumentCreated> {
  const payload = await apiClient.post<Envelope<CreditDocumentCreated>>(
    `/customer/credit/applications/${applicationId}/documents`,
    input,
  );
  return payload.data;
}

export async function replaceCreditApplicationDocument(
  applicationId: string,
  documentId: string,
  input: Omit<CreditDocumentCreateInput, "documentType">,
): Promise<CreditDocumentCreated> {
  const payload = await apiClient.post<Envelope<CreditDocumentCreated>>(
    `/customer/credit/applications/${applicationId}/documents/${documentId}/replace`,
    input,
  );
  return payload.data;
}

export async function fetchCreditDocumentUploadUrl(
  applicationId: string,
  documentId: string,
): Promise<{ id: string; uploadUrl: string | null; storageKey?: string }> {
  const payload = await apiClient.get<
    Envelope<{ id: string; uploadUrl: string | null; storageKey?: string }>
  >(
    `/customer/credit/applications/${applicationId}/documents/${documentId}/upload-url`,
  );
  return payload.data;
}

export async function fetchCreditDocumentDownloadUrl(
  applicationId: string,
  documentId: string,
): Promise<{
  id: string;
  url: string | null;
  fileName?: string;
  storagePending?: boolean;
}> {
  const payload = await apiClient.get<
    Envelope<{
      id: string;
      url: string | null;
      fileName?: string;
      storagePending?: boolean;
    }>
  >(
    `/customer/credit/applications/${applicationId}/documents/${documentId}/download`,
  );
  return payload.data;
}

// ---------------------------------------------------------------------------
// Signed R2 upload
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Browsers leave `File.type` empty for some PDFs — fall back to the extension. */
export function resolveCreditDocumentMime(file: File): string {
  if (file.type && ALLOWED_MIME_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return file.type || "application/octet-stream";
}

export const CREDIT_STORAGE_UPLOAD_FAILED = "STORAGE_UPLOAD_FAILED";

/** PUT the file straight to R2 and report byte progress. */
export function putCreditDocumentFile(
  uploadUrl: string,
  file: File,
  mimeType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(CREDIT_STORAGE_UPLOAD_FAILED));
    };
    xhr.onerror = () => reject(new Error(CREDIT_STORAGE_UPLOAD_FAILED));
    xhr.onabort = () => reject(new Error(CREDIT_STORAGE_UPLOAD_FAILED));
    xhr.send(file);
  });
}

export function creditApiError(error: unknown, fallback: string): string {
  if (
    isAxiosError<Envelope<unknown> & { message?: string | string[] }>(error)
  ) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && message[0]) return String(message[0]);
    if (!error.response) {
      return "Unable to reach PetroTrade. Check your connection and try again.";
    }
  }
  if (
    error instanceof Error &&
    error.message === CREDIT_STORAGE_UPLOAD_FAILED
  ) {
    return "Could not store the file. Please retry the upload.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// ---------------------------------------------------------------------------
// Dashboard mapping
// ---------------------------------------------------------------------------

export function toDashboardCredit(limit: BackendCreditLimit): {
  creditSummary: CreditSummary;
  outstanding: OutstandingPayment;
} {
  const approved = num(limit.approvedLimit);
  const available = num(limit.availableLimit);
  const outstanding = num(limit.outstandingAmount);
  return {
    creditSummary: {
      availableCredit: available,
      creditLimit: approved,
      currency: "INR",
      availablePercent:
        approved > 0 ? Math.round((available / approved) * 100) : 0,
    },
    outstanding: {
      amount: outstanding,
      currency: "INR",
      invoiceId: "",
      dueLabel:
        outstanding > 0 ? "Outstanding PetroTrade credit" : "No invoices due",
    },
  };
}
