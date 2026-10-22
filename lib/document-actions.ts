/**
 * Frontend-only document download / print / share helpers.
 * Blind marketplace: documents never expose supplier identity.
 */

import { toast } from "sonner";
import {
  downloadFinanceInvoicePdf,
  downloadProformaPdf,
  type FinancePdfDownload,
} from "@/services/finance";

function triggerDownload(
  filename: string,
  content: string,
  mime = "text/plain",
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * @deprecated Do not use for finance invoices — fabricated PDFs are forbidden.
 * Kept for non-finance support docs until those are also vaulted.
 */
export function simulatePdfDownload(fileName: string, content: string) {
  const safeName = fileName.replace(/\.pdf$/i, "") + ".txt";
  triggerDownload(safeName, content, "text/plain");
}

/** Clear unavailable state when the backend has not generated a PDF artifact. */
export function invoiceDocumentUnavailable(
  kind: "proforma" | "tax" = "proforma",
) {
  const label = kind === "tax" ? "Tax invoice" : "Proforma invoice";
  return {
    available: false as const,
    message: `${label} PDF has not been generated yet. The commercial record is available in the portal; ask support if you need a signed PDF.`,
  };
}

export async function openSignedDocumentUrl(
  url: string | null | undefined,
  label: string,
) {
  if (!url) {
    toast.error(`${label} is not available for download.`);
    return false;
  }
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

async function openFinanceDownloadResult(
  result: FinancePdfDownload,
  label: string,
  kind: "proforma" | "tax",
) {
  if (result.available && result.url) {
    return openSignedDocumentUrl(result.url, label);
  }
  toast.error(result.message ?? invoiceDocumentUnavailable(kind).message);
  return false;
}

/** Download a vaulted proforma PDF when available — never fabricates content. */
export async function downloadProformaInvoicePdf(id: string) {
  try {
    const result = await downloadProformaPdf(id);
    return openFinanceDownloadResult(result, "Proforma invoice", "proforma");
  } catch {
    toast.error(invoiceDocumentUnavailable("proforma").message);
    return false;
  }
}

/** Download a vaulted tax/finance invoice PDF when available. */
export async function downloadTaxInvoicePdf(id: string) {
  try {
    const result = await downloadFinanceInvoicePdf(id);
    return openFinanceDownloadResult(result, "Tax invoice", "tax");
  } catch {
    toast.error(invoiceDocumentUnavailable("tax").message);
    return false;
  }
}

/** Clear toast when an order has no invoice id / PDF artifact. */
export function toastInvoiceUnavailable(kind: "proforma" | "tax" = "tax") {
  toast.error(invoiceDocumentUnavailable(kind).message);
}

export function printDocumentHtml(title: string, content: string) {
  const win = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=820,height=1000",
  );
  if (!win) {
    window.print();
    return;
  }
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: ui-sans-serif, system-ui, sans-serif; color: #0f172a; padding: 40px; }
          h1 { font-size: 20px; margin: 0 0 8px; color: #0B2E59; }
          .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
          pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.55; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <h1>${title.replace(/</g, "&lt;")}</h1>
        <div class="meta">PetroTrade Customer Portal · Document Preview</div>
        <pre>${content.replace(/</g, "&lt;")}</pre>
        <script>window.onload = () => { window.print(); }</script>
      </body>
    </html>
  `);
  win.document.close();
}

export async function shareDocumentText(title: string, text: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title, text });
    return true;
  }
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return "copied" as const;
  }
  return false;
}

export function buildPoDocumentContent(po: {
  poNumber: string;
  orderNumber: string;
  product: string;
  grade: string;
  seller: string;
  warehouse: string;
  quantityMt: number;
  poDate: string;
  amount: number;
  paymentTerms: string;
  deliveryTerms: string;
  buyer: { name: string; gstin: string; address: string };
  sellerInfo: { name: string; gstin: string; address: string };
  pricing: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    freight: number;
    insurance: number;
    grandTotal: number;
  };
}): string {
  return [
    "PETROTRADE — PURCHASE ORDER",
    "===========================",
    "",
    `PO Number     : ${po.poNumber}`,
    `Order Number  : ${po.orderNumber}`,
    `PO Date       : ${po.poDate}`,
    "",
    "BUYER",
    `  ${po.buyer.name}`,
    `  GSTIN: ${po.buyer.gstin}`,
    `  ${po.buyer.address}`,
    "",
    "BILL FROM",
    `  ${po.sellerInfo.name}`,
    `  GSTIN: ${po.sellerInfo.gstin}`,
    `  ${po.sellerInfo.address}`,
    "",
    "SUPPLY NETWORK",
    `  Supply Source : ${po.seller}`,
    `  Warehouse Hub : ${po.warehouse}`,
    "",
    "PRODUCT",
    `  ${po.product} (${po.grade})`,
    `  Quantity: ${po.quantityMt} MT`,
    "",
    "PRICING",
    `  Taxable     : ₹ ${po.pricing.taxableValue.toLocaleString("en-IN")}`,
    `  CGST        : ₹ ${po.pricing.cgst.toLocaleString("en-IN")}`,
    `  SGST        : ₹ ${po.pricing.sgst.toLocaleString("en-IN")}`,
    `  IGST        : ₹ ${po.pricing.igst.toLocaleString("en-IN")}`,
    `  Freight     : ₹ ${po.pricing.freight.toLocaleString("en-IN")}`,
    `  Insurance   : ₹ ${po.pricing.insurance.toLocaleString("en-IN")}`,
    `  Grand Total : ₹ ${po.pricing.grandTotal.toLocaleString("en-IN")}`,
    "",
    `Payment Terms : ${po.paymentTerms}`,
    `Delivery Terms: ${po.deliveryTerms}`,
    "",
    "This is a frontend demo document. No backend generated.",
    "© PetroTrade Customer Portal",
  ].join("\n");
}

export function buildInvoiceDocumentContent(inv: {
  invoiceNumber: string;
  orderNumber: string;
  poNumber: string;
  invoiceDate: string;
  product: string;
  grade: string;
  seller: string;
  warehouse: string;
  company: { name: string; gstin: string };
  buyer: { name: string; gstin: string };
  sellerInfo: { name: string; gstin: string };
  pricing: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    freight: number;
    insurance: number;
    grandTotal: number;
  };
  paymentInfo: { method: string; utr?: string | null };
}): string {
  return [
    "TAX INVOICE",
    "===========",
    "",
    `Invoice No.   : ${inv.invoiceNumber}`,
    `Order Number  : ${inv.orderNumber}`,
    `PO Number     : ${inv.poNumber}`,
    `Invoice Date  : ${inv.invoiceDate}`,
    "",
    `Bill From     : ${inv.company.name} (${inv.company.gstin})`,
    `Buyer         : ${inv.buyer.name} (${inv.buyer.gstin})`,
    `Supply Source : ${inv.seller}`,
    "",
    `Product       : ${inv.product} (${inv.grade})`,
    `Warehouse Hub : ${inv.warehouse}`,
    "",
    `Taxable Value : ₹ ${inv.pricing.taxableValue.toLocaleString("en-IN")}`,
    `CGST / SGST   : ₹ ${inv.pricing.cgst.toLocaleString("en-IN")} / ₹ ${inv.pricing.sgst.toLocaleString("en-IN")}`,
    `IGST          : ₹ ${inv.pricing.igst.toLocaleString("en-IN")}`,
    `Freight       : ₹ ${inv.pricing.freight.toLocaleString("en-IN")}`,
    `Insurance     : ₹ ${inv.pricing.insurance.toLocaleString("en-IN")}`,
    `Grand Total   : ₹ ${inv.pricing.grandTotal.toLocaleString("en-IN")}`,
    "",
    `Payment       : ${inv.paymentInfo.method}`,
    `UTR           : ${inv.paymentInfo.utr ?? "—"}`,
    `Payment To    : PetroTrade`,
    "",
    "This is a frontend demo document. No backend generated.",
    "© PetroTrade Customer Portal",
  ].join("\n");
}

export function buildGenericDocumentContent(meta: {
  title: string;
  documentNumber: string;
  orderNumber?: string;
  seller?: string;
  warehouse?: string;
  product?: string;
  extraLines?: string[];
}): string {
  return [
    `PETROTRADE CUSTOMER PORTAL — ${meta.title.toUpperCase()}`,
    "=".repeat(48),
    "",
    `Document No.  : ${meta.documentNumber}`,
    meta.orderNumber ? `Order Number  : ${meta.orderNumber}` : null,
    meta.product ? `Product       : ${meta.product}` : null,
    meta.seller ? `Supply Source : ${meta.seller}` : null,
    meta.warehouse ? `Warehouse Hub : ${meta.warehouse}` : null,
    "",
    ...(meta.extraLines ?? []),
    "",
    "This is a frontend demo document. No backend generated.",
    "© PetroTrade Customer Portal",
  ]
    .filter(Boolean)
    .join("\n");
}
