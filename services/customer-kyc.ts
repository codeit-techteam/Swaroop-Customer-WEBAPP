import { isAxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";

export type CustomerKycStatus =
  "NOT_SUBMITTED" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED";

export type CustomerKycSlotCode = "pan" | "gst" | "aadhaar" | "cancelledCheque";

export type CustomerKycDocument = {
  id: string;
  slot: string | null;
  category: string;
  fileName: string;
  mimeType: string | null;
  fileSizeBytes: string | null;
  status: string;
  r2Confirmed: boolean;
  rejectionReason: string | null;
  uploadedAt: string;
};

export type CustomerKycChangeRequest = {
  reason: string;
  documentIds: string[];
  slots: string[];
  requestedAt: string;
};

export type CustomerKycSlot = {
  slot: CustomerKycSlotCode;
  category: string;
  name: string;
  description: string;
  required: boolean;
  changeRequested: boolean;
  document: CustomerKycDocument | null;
};

export type KycVerificationStatus =
  "VERIFYING" | "VERIFIED" | "FAILED" | "MANUAL_REVIEW";

export type KycVerificationDetails = {
  legalName?: string | null;
  tradeName?: string | null;
  gstStatus?: string | null;
  registrationDate?: string | null;
  cancellationDate?: string | null;
  taxpayerType?: string | null;
  constitution?: string | null;
  address?: string | null;
  state?: string | null;
  stateCode?: string | null;
  pincode?: string | null;
  panMasked?: string | null;
  nameOnPan?: string | null;
  /** Date of birth / incorporation (YYYY-MM-DD) confirmed by PAN Verify. */
  dateOnPan?: string | null;
  panStatus?: string | null;
  panCategory?: string | null;
};

export type KycVerification = {
  id: string;
  type: "PAN" | "GST";
  status: KycVerificationStatus;
  method: "PROVIDER" | "MANUAL" | null;
  identifierMasked: string;
  provider: string;
  details: KycVerificationDetails;
  failureCode: string | null;
  message: string;
  verifiedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type KycVerifyResult = KycVerification & {
  mismatch?: boolean;
  warning: string | null;
};

export type KycChecklistItem = {
  key: "pan" | "gst" | "documents" | "review";
  label: string;
  state: "done" | "pending" | "attention" | "todo";
  detail: string;
};

export type CustomerKycOverview = {
  status: CustomerKycStatus;
  kycVerified: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  rejectedReason: string | null;
  changeRequest: CustomerKycChangeRequest | null;
  locked: boolean;
  canSubmit: boolean;
  missingRequired: string[];
  verifications: {
    pan: KycVerification | null;
    gst: KycVerification | null;
    mismatch?: boolean;
  };
  checklist: KycChecklistItem[];
  organization: {
    name: string | null;
    legalName: string | null;
    gstin: string | null;
    pan: string | null;
    businessType?: string | null;
    constitutionType?: string | null;
    natureOfBusiness?: string | null;
    email?: string | null;
    phone?: string | null;
    memberSince?: string | null;
    verificationStatus: string | null;
  };
  slots: CustomerKycSlot[];
};

export type CustomerKycSubmitInput = {
  businessName?: string;
};

/** Must match the backend document MIME allow-list. */
export const CUSTOMER_KYC_MIME_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

/** Backend default STORAGE_MAX_DOCUMENT_SIZE_MB; the API re-validates. */
export const CUSTOMER_KYC_MAX_BYTES = 10 * 1024 * 1024;

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const STORAGE_UPLOAD_FAILED = "KYC_STORAGE_UPLOAD_FAILED";

function resolveMime(file: File): string {
  const type = file.type.toLowerCase();
  if (type && type in CUSTOMER_KYC_MIME_TYPES) return type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  throw new Error(
    "Unsupported file type. Upload a PDF, JPG, PNG or WEBP file.",
  );
}

export async function fetchCustomerKyc(): Promise<CustomerKycOverview> {
  const res =
    await apiClient.get<Envelope<CustomerKycOverview>>("/customer/kyc");
  return res.data;
}

function putToSignedUrl(
  uploadUrl: string,
  file: File,
  mimeType: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
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
      else reject(new Error(STORAGE_UPLOAD_FAILED));
    };
    xhr.onerror = () => reject(new Error(STORAGE_UPLOAD_FAILED));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(file);
  });
}

/**
 * Creates the KYC document row, streams the file to the signed R2 URL, then
 * confirms so the backend verifies the object and queues it for admin review.
 */
export async function uploadCustomerKycDocument(
  slot: CustomerKycSlotCode,
  file: File,
  options: {
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  } = {},
): Promise<CustomerKycDocument> {
  const mimeType = resolveMime(file);
  if (file.size > CUSTOMER_KYC_MAX_BYTES) {
    throw new Error("File is larger than 10 MB. Upload a smaller copy.");
  }
  const created = await apiClient.post<
    Envelope<{ id: string; uploadUrl?: string | null }>
  >("/customer/kyc/documents", {
    slot,
    fileName: file.name,
    mimeType,
    fileSizeBytes: file.size,
    source: "CUSTOMER_WEB",
  });
  const { id, uploadUrl } = created.data ?? {};
  if (!id || !uploadUrl) {
    throw new Error("Storage upload URL was not issued. Please try again.");
  }
  try {
    await putToSignedUrl(
      uploadUrl,
      file,
      mimeType,
      options.onProgress,
      options.signal,
    );
    const confirmed = await apiClient.post<Envelope<CustomerKycDocument>>(
      `/customer/kyc/documents/${id}/confirm`,
    );
    return confirmed.data;
  } catch (error) {
    await apiClient
      .delete(`/customer/kyc/documents/${id}`)
      .catch(() => undefined);
    throw error;
  }
}

export async function removeCustomerKycDocument(id: string): Promise<void> {
  await apiClient.delete(`/customer/kyc/documents/${id}`);
}

export async function getCustomerKycDocumentUrl(id: string): Promise<string> {
  const res = await apiClient.get<Envelope<{ url: string }>>(
    `/customer/kyc/documents/${id}/download`,
  );
  return res.data.url;
}

export async function submitCustomerKyc(
  input: CustomerKycSubmitInput,
): Promise<CustomerKycOverview> {
  const body: CustomerKycSubmitInput = {};
  if (input.businessName?.trim()) body.businessName = input.businessName.trim();
  const res = await apiClient.post<Envelope<CustomerKycOverview>>(
    "/customer/kyc/submit",
    body,
  );
  return res.data;
}

/** Name and date of birth / incorporation (YYYY-MM-DD) exactly as printed on the PAN card. */
export type PanHolderDetails = { fullName: string; dob: string };

/** PAN / GSTIN are checked server-side; provider credentials never reach the browser. */
export async function verifyCustomerPan(
  pan: string,
  holder: PanHolderDetails,
): Promise<KycVerifyResult> {
  const res = await apiClient.post<Envelope<KycVerifyResult>>(
    "/customer/kyc/pan/verify",
    {
      pan: normalizeIdentifier(pan),
      fullName: holder.fullName.trim().replace(/\s+/g, " "),
      dob: holder.dob,
      source: "CUSTOMER_WEB",
    },
  );
  return res.data;
}

export async function verifyCustomerGst(
  gstin: string,
): Promise<KycVerifyResult> {
  const res = await apiClient.post<Envelope<KycVerifyResult>>(
    "/customer/kyc/gst/verify",
    { gstin: normalizeIdentifier(gstin), source: "CUSTOMER_WEB" },
  );
  return res.data;
}

export function normalizeIdentifier(value: string): string {
  return value.toUpperCase().replace(/[\s-]/g, "");
}

/** VERIFIED, or accepted for manual confirmation by the compliance team. */
export function verificationAccepted(
  verification: KycVerification | null | undefined,
): boolean {
  return (
    verification?.status === "VERIFIED" ||
    verification?.status === "MANUAL_REVIEW"
  );
}

export function customerKycError(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    if (error.response?.status === 429) {
      return "Too many attempts. Please wait a few minutes and try again.";
    }
    if (error.response && error.response.status >= 500) return fallback;
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && message[0]) return String(message[0]);
    if (!error.response) {
      return "Unable to reach PetroTrade. Check your connection and try again.";
    }
  }
  if (error instanceof Error && error.message === STORAGE_UPLOAD_FAILED) {
    return "Could not store the file. Please retry the upload.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** KYC states where the customer has to act before verification continues. */
export function kycNeedsAction(status: CustomerKycStatus | undefined): boolean {
  return status === "CHANGES_REQUESTED" || status === "REJECTED";
}
