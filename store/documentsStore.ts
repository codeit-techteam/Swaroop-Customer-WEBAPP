"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_DOCUMENTS_FILTERS,
  buildRecentlyGenerated,
} from "@/mock/documents-catalog";
import type {
  CertificateDocument,
  DocumentCategoryFilter,
  DocumentNotification,
  DocumentPreviewState,
  DocumentStatus,
  DocumentType,
  DocumentsDashboardSummary,
  DocumentsFiltersState,
  DownloadableDocument,
  GstInvoiceDocument,
  InvoiceDocument,
  ProformaInvoiceDocument,
  PurchaseOrderDocument,
  RecentlyGeneratedItem,
} from "@/types/documents";
import {
  fetchCustomerProformas,
  fetchCustomerPurchaseOrders,
  mapPoToDocument,
  mapProformaToDocument,
  mapProformaToInvoice,
} from "@/services/finance";

const STORAGE_KEY = "petrotrade.documents-catalog.v2";

export type { DocumentCategoryFilter };

export interface DocumentsStoreState {
  purchaseOrders: PurchaseOrderDocument[];
  invoices: InvoiceDocument[];
  proformas: ProformaInvoiceDocument[];
  gstInvoices: GstInvoiceDocument[];
  certificates: CertificateDocument[];
  downloads: DownloadableDocument[];
  notifications: DocumentNotification[];
  filters: DocumentsFiltersState;
  /** Legacy category filter for compatibility */
  categoryFilter: DocumentCategoryFilter;
  selectedDocumentId: string | null;
  preview: DocumentPreviewState | null;
  uploadOpen: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  loadError: string | null;

  fetchFromApi: () => Promise<void>;
  setHydrated: (v: boolean) => void;
  setFilters: (patch: Partial<DocumentsFiltersState>) => void;
  resetFilters: () => void;
  setCategoryFilter: (v: DocumentCategoryFilter) => void;
  setSelectedDocumentId: (id: string | null) => void;
  openPreview: (preview: Omit<DocumentPreviewState, "open">) => void;
  closePreview: () => void;
  setUploadOpen: (open: boolean) => void;
  markDownloaded: (kind: DocumentKind, id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  convertProformaToInvoice: (proformaId: string) => string | null;
  duplicatePurchaseOrder: (poId: string) => string | null;
  addSupportingUpload: (fileName: string, orderNumber: string) => void;
}

type DocumentKind =
  | "purchase_order"
  | "invoice"
  | "proforma"
  | "gst_invoice"
  | "certificate"
  | "download";

function nowIso() {
  return new Date().toISOString();
}

export function computeDocumentsSummary(
  state: Pick<
    DocumentsStoreState,
    | "purchaseOrders"
    | "invoices"
    | "certificates"
    | "downloads"
    | "proformas"
    | "gstInvoices"
  >,
): DocumentsDashboardSummary {
  return {
    totalDocuments:
      state.purchaseOrders.length +
      state.invoices.length +
      state.proformas.length +
      state.gstInvoices.length +
      state.certificates.length +
      state.downloads.length,
    purchaseOrders: state.purchaseOrders.length,
    invoices: state.invoices.length,
    certificates: state.certificates.length,
    downloads: state.downloads.length,
  };
}

function matchesSearch(haystacks: Array<string | null | undefined>, q: string) {
  return haystacks
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q));
}

function withinDate(iso: string, from: string, to: string) {
  const t = new Date(iso).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime() + 86_400_000) return false;
  return true;
}

function sortByDate<T>(
  items: T[],
  getDate: (item: T) => string,
  sortBy: DocumentsFiltersState["sortBy"],
) {
  const dir = sortBy === "oldest" ? 1 : -1;
  return [...items].sort(
    (a, b) =>
      (new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime()) * dir,
  );
}

export function filterPurchaseOrders(
  items: PurchaseOrderDocument[],
  filters: DocumentsFiltersState,
) {
  let list = [...items];
  const q = filters.search.trim().toLowerCase();
  if (q) {
    list = list.filter((p) =>
      matchesSearch(
        [p.poNumber, p.orderNumber, p.product, p.seller, p.warehouse, p.grade],
        q,
      ),
    );
  }
  if (filters.status !== "all") {
    list = list.filter((p) => p.status === filters.status);
  }
  if (filters.warehouse !== "all") {
    list = list.filter((p) => p.warehouse === filters.warehouse);
  }
  if (filters.seller !== "all") {
    list = list.filter((p) => p.seller === filters.seller);
  }
  list = list.filter((p) =>
    withinDate(p.poDate, filters.dateFrom, filters.dateTo),
  );
  return sortByDate(list, (p) => p.poDate, filters.sortBy);
}

export function filterInvoices(
  items: InvoiceDocument[],
  filters: DocumentsFiltersState,
) {
  let list = [...items];
  const q = filters.search.trim().toLowerCase();
  if (q) {
    list = list.filter((i) =>
      matchesSearch(
        [
          i.invoiceNumber,
          i.orderNumber,
          i.poNumber,
          i.product,
          i.seller,
          i.warehouse,
        ],
        q,
      ),
    );
  }
  if (filters.status !== "all") {
    list = list.filter((i) => i.status === filters.status);
  }
  if (filters.warehouse !== "all") {
    list = list.filter((i) => i.warehouse === filters.warehouse);
  }
  if (filters.seller !== "all") {
    list = list.filter((i) => i.seller === filters.seller);
  }
  list = list.filter((i) =>
    withinDate(i.invoiceDate, filters.dateFrom, filters.dateTo),
  );
  return sortByDate(list, (i) => i.invoiceDate, filters.sortBy);
}

export function filterProformas(
  items: ProformaInvoiceDocument[],
  filters: DocumentsFiltersState,
) {
  let list = [...items];
  const q = filters.search.trim().toLowerCase();
  if (q) {
    list = list.filter((p) =>
      matchesSearch(
        [p.proformaNumber, p.orderNumber, p.product, p.seller, p.warehouse],
        q,
      ),
    );
  }
  if (filters.warehouse !== "all") {
    list = list.filter((p) => p.warehouse === filters.warehouse);
  }
  if (filters.seller !== "all") {
    list = list.filter((p) => p.seller === filters.seller);
  }
  list = list.filter((p) =>
    withinDate(p.createdDate, filters.dateFrom, filters.dateTo),
  );
  return sortByDate(list, (p) => p.createdDate, filters.sortBy);
}

export function filterGstInvoices(
  items: GstInvoiceDocument[],
  filters: DocumentsFiltersState,
) {
  let list = [...items];
  const q = filters.search.trim().toLowerCase();
  if (q) {
    list = list.filter((g) =>
      matchesSearch(
        [
          g.invoiceNumber,
          g.gstNumber,
          g.orderNumber,
          g.poNumber,
          g.product,
          g.seller,
          g.warehouse,
        ],
        q,
      ),
    );
  }
  if (filters.status !== "all") {
    list = list.filter((g) => g.status === filters.status);
  }
  if (filters.warehouse !== "all") {
    list = list.filter((g) => g.warehouse === filters.warehouse);
  }
  if (filters.seller !== "all") {
    list = list.filter((g) => g.seller === filters.seller);
  }
  list = list.filter((g) =>
    withinDate(g.invoiceDate, filters.dateFrom, filters.dateTo),
  );
  return sortByDate(list, (g) => g.invoiceDate, filters.sortBy);
}

export function filterCertificates(
  items: CertificateDocument[],
  filters: DocumentsFiltersState,
) {
  let list = [...items];
  const q = filters.search.trim().toLowerCase();
  if (q) {
    list = list.filter((c) =>
      matchesSearch(
        [
          c.name,
          c.certificateNumber,
          c.product,
          c.orderNumber,
          c.issuedBy,
          c.seller,
          c.warehouse,
        ],
        q,
      ),
    );
  }
  if (filters.status !== "all") {
    list = list.filter((c) => c.status === filters.status);
  }
  if (filters.warehouse !== "all") {
    list = list.filter((c) => c.warehouse === filters.warehouse);
  }
  if (filters.seller !== "all") {
    list = list.filter((c) => c.seller === filters.seller);
  }
  list = list.filter((c) =>
    withinDate(c.issueDate, filters.dateFrom, filters.dateTo),
  );
  return sortByDate(list, (c) => c.issueDate, filters.sortBy);
}

export function filterDownloads(
  items: DownloadableDocument[],
  filters: DocumentsFiltersState,
) {
  let list = [...items];
  const q = filters.search.trim().toLowerCase();
  if (q) {
    list = list.filter((d) =>
      matchesSearch(
        [
          d.fileName,
          d.documentNumber,
          d.orderNumber,
          d.product,
          d.seller,
          d.warehouse,
          d.category,
        ],
        q,
      ),
    );
  }
  if (filters.documentType !== "all") {
    list = list.filter((d) => d.category === filters.documentType);
  }
  if (filters.status !== "all") {
    list = list.filter((d) => d.status === filters.status);
  }
  if (filters.warehouse !== "all") {
    list = list.filter((d) => d.warehouse === filters.warehouse);
  }
  if (filters.seller !== "all") {
    list = list.filter((d) => d.seller === filters.seller);
  }
  list = list.filter((d) =>
    withinDate(d.date, filters.dateFrom, filters.dateTo),
  );
  return sortByDate(list, (d) => d.date, filters.sortBy);
}

export function getFacetOptions(state: {
  purchaseOrders: PurchaseOrderDocument[];
  invoices: InvoiceDocument[];
}) {
  const sellers = new Set<string>();
  const warehouses = new Set<string>();
  [...state.purchaseOrders, ...state.invoices].forEach((item) => {
    sellers.add(item.seller);
    warehouses.add(item.warehouse);
  });
  return {
    sellers: Array.from(sellers).sort(),
    warehouses: Array.from(warehouses).sort(),
  };
}

export function getRecentItems(
  state: DocumentsStoreState,
): RecentlyGeneratedItem[] {
  return buildRecentlyGenerated(
    state.purchaseOrders,
    state.invoices,
    state.certificates,
    state.gstInvoices,
  );
}

export const useDocumentsStore = create<DocumentsStoreState>()(
  persist(
    (set, get) => ({
      purchaseOrders: [],
      invoices: [],
      proformas: [],
      gstInvoices: [],
      certificates: [],
      downloads: [],
      notifications: [],
      filters: { ...DEFAULT_DOCUMENTS_FILTERS },
      categoryFilter: "all",
      selectedDocumentId: null,
      preview: null,
      uploadOpen: false,
      isHydrated: false,
      isLoading: false,
      loadError: null,

      fetchFromApi: async () => {
        set({ isLoading: true, loadError: null });
        try {
          const [pos, proformas] = await Promise.all([
            fetchCustomerPurchaseOrders(),
            fetchCustomerProformas(),
          ]);
          set({
            purchaseOrders: pos.map(mapPoToDocument),
            invoices: proformas.map(mapProformaToInvoice),
            proformas: proformas.map(mapProformaToDocument),
            gstInvoices: [],
            certificates: [],
            downloads: [],
            notifications: [],
            isLoading: false,
            isHydrated: true,
            loadError: null,
          });
        } catch (error) {
          set({
            purchaseOrders: [],
            invoices: [],
            proformas: [],
            gstInvoices: [],
            certificates: [],
            downloads: [],
            notifications: [],
            isLoading: false,
            isHydrated: true,
            loadError: error instanceof Error ? error.message : "Unable to load documents.",
          });
        }
      },

      setHydrated: (v) => set({ isHydrated: v }),

      setFilters: (patch) =>
        set((s) => ({ filters: { ...s.filters, ...patch } })),

      resetFilters: () => set({ filters: { ...DEFAULT_DOCUMENTS_FILTERS } }),

      setCategoryFilter: (v) => set({ categoryFilter: v }),

      setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),

      openPreview: (preview) => set({ preview: { ...preview, open: true } }),

      closePreview: () => set({ preview: null }),

      setUploadOpen: (open) => set({ uploadOpen: open }),

      markDownloaded: (kind, id) => {
        const stamp = nowIso();
        set((s) => {
          if (kind === "purchase_order") {
            return {
              purchaseOrders: s.purchaseOrders.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      status: "downloaded" as DocumentStatus,
                      downloadedAt: stamp,
                    }
                  : p,
              ),
            };
          }
          if (kind === "invoice") {
            return {
              invoices: s.invoices.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      status: "downloaded" as DocumentStatus,
                      downloadedAt: stamp,
                    }
                  : p,
              ),
            };
          }
          if (kind === "proforma") {
            return {
              proformas: s.proformas.map((p) =>
                p.id === id
                  ? { ...p, docStatus: "downloaded" as DocumentStatus }
                  : p,
              ),
            };
          }
          if (kind === "gst_invoice") {
            return {
              gstInvoices: s.gstInvoices.map((p) =>
                p.id === id
                  ? { ...p, status: "downloaded" as DocumentStatus }
                  : p,
              ),
            };
          }
          if (kind === "certificate") {
            return {
              certificates: s.certificates.map((p) =>
                p.id === id
                  ? { ...p, status: "downloaded" as DocumentStatus }
                  : p,
              ),
            };
          }
          return {
            downloads: s.downloads.map((p) =>
              p.id === id
                ? { ...p, status: "downloaded" as DocumentStatus }
                : p,
            ),
          };
        });
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      convertProformaToInvoice: (proformaId) => {
        const proforma = get().proformas.find((p) => p.id === proformaId);
        if (!proforma || proforma.status === "converted") return null;

        const invId = `inv-from-${proformaId}`;
        const invoiceNumber = `INV-2026-C${String(Date.now()).slice(-4)}`;
        const invoice: InvoiceDocument = {
          id: invId,
          invoiceNumber,
          orderNumber: proforma.orderNumber,
          poNumber: proforma.poNumber ?? "—",
          invoiceDate: nowIso(),
          amount: proforma.pricing.taxableValue,
          gst:
            proforma.pricing.cgst +
            proforma.pricing.sgst +
            proforma.pricing.igst,
          totalAmount: proforma.pricing.grandTotal,
          paymentStatus: "unpaid",
          invoiceStatus: "generated",
          status: "generated",
          product: proforma.product,
          grade: proforma.grade,
          seller: proforma.seller,
          warehouse: proforma.warehouse,
          company: {
            name: "PetroTrade Technologies Pvt Ltd",
            gstin: "27AABCP4821Q1ZV",
            address: "12th Floor, One BKC, Bandra Kurla Complex",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400051",
            contactPerson: "Accounts Desk",
            phone: "+91 22 6987 4500",
            email: "invoices@petrotrade.in",
          },
          buyer: proforma.buyer,
          sellerInfo: proforma.sellerInfo,
          lineItems: proforma.lineItems,
          pricing: proforma.pricing,
          paymentInfo: {
            method: proforma.paymentTerms,
            dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
            paidDate: null,
            utr: null,
            transactionId: null,
          },
          timeline: [
            {
              id: "tl-convert",
              label: "Invoice Generated",
              description: `Converted from ${proforma.proformaNumber}`,
              at: nowIso(),
              status: "completed",
            },
          ],
          downloadedAt: null,
        };

        set((s) => ({
          invoices: [invoice, ...s.invoices],
          proformas: s.proformas.map((p) =>
            p.id === proformaId
              ? {
                  ...p,
                  status: "converted" as const,
                  convertedInvoiceId: invId,
                  docStatus: "verified" as DocumentStatus,
                }
              : p,
          ),
          notifications: [
            {
              id: `dn-convert-${Date.now()}`,
              type: "invoice_generated",
              title: "Invoice Generated",
              message: `${invoiceNumber} created from ${proforma.proformaNumber}.`,
              createdAt: nowIso(),
              read: false,
              href: `/documents/invoices/${invId}`,
              relatedId: invId,
            },
            ...s.notifications,
          ],
        }));

        return invId;
      },

      duplicatePurchaseOrder: (poId) => {
        const source = get().purchaseOrders.find((p) => p.id === poId);
        if (!source) return null;
        const id = `po-dup-${Date.now()}`;
        const poNumber = `PO-2026-D${String(Date.now()).slice(-4)}`;
        const clone: PurchaseOrderDocument = {
          ...source,
          id,
          poNumber,
          poDate: nowIso(),
          status: "generated",
          downloadedAt: null,
          approval: {
            ...source.approval,
            approvedAt: "",
            remarks: `Duplicated from ${source.poNumber}`,
          },
        };
        set((s) => ({
          purchaseOrders: [clone, ...s.purchaseOrders],
        }));
        return id;
      },

      addSupportingUpload: (fileName, orderNumber) => {
        const id = `dl-upload-${Date.now()}`;
        const relatedPo = get().purchaseOrders.find(
          (p) => p.orderNumber === orderNumber,
        );
        const file: DownloadableDocument = {
          id,
          fileName,
          category: "payment_proof",
          sizeBytes: 256_000,
          date: nowIso(),
          orderNumber,
          documentNumber: `UP-${String(Date.now()).slice(-6)}`,
          seller: relatedPo?.seller ?? "—",
          warehouse: relatedPo?.warehouse ?? "—",
          product: relatedPo?.product ?? "—",
          status: "generated",
          relatedId: null,
          mimeType: "application/pdf",
        };
        set((s) => ({
          downloads: [file, ...s.downloads],
          uploadOpen: false,
          notifications: [
            {
              id: `dn-upload-${Date.now()}`,
              type: "download_completed",
              title: "Supporting Document Uploaded",
              message: `${fileName} attached to ${orderNumber}.`,
              createdAt: nowIso(),
              read: false,
              href: "/documents",
              relatedId: id,
            },
            ...s.notifications,
          ],
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ filters: s.filters }),
      onRehydrateStorage: () => (state) => {
        void state?.fetchFromApi();
      },
    },
  ),
);

export type GlobalSearchResult = {
  id: string;
  type: DocumentType;
  title: string;
  documentNumber: string;
  orderNumber: string;
  seller: string;
  warehouse: string;
  product: string;
  date: string;
  status: DocumentStatus;
  href: string;
};

export function globalDocumentSearch(
  state: DocumentsStoreState,
  filters: DocumentsFiltersState,
): GlobalSearchResult[] {
  const results: GlobalSearchResult[] = [];

  if (
    filters.documentType === "all" ||
    filters.documentType === "purchase_order"
  ) {
    filterPurchaseOrders(state.purchaseOrders, filters).forEach((p) => {
      results.push({
        id: p.id,
        type: "purchase_order",
        title: "Purchase Order",
        documentNumber: p.poNumber,
        orderNumber: p.orderNumber,
        seller: p.seller,
        warehouse: p.warehouse,
        product: p.product,
        date: p.poDate,
        status: p.status,
        href: `/documents/purchase-orders/${p.id}`,
      });
    });
  }

  if (filters.documentType === "all" || filters.documentType === "invoice") {
    filterInvoices(state.invoices, filters).forEach((i) => {
      results.push({
        id: i.id,
        type: "invoice",
        title: "Invoice",
        documentNumber: i.invoiceNumber,
        orderNumber: i.orderNumber,
        seller: i.seller,
        warehouse: i.warehouse,
        product: i.product,
        date: i.invoiceDate,
        status: i.status,
        href: `/documents/invoices/${i.id}`,
      });
    });
  }

  if (filters.documentType === "all" || filters.documentType === "proforma") {
    filterProformas(state.proformas, filters).forEach((p) => {
      results.push({
        id: p.id,
        type: "proforma",
        title: "Proforma Invoice",
        documentNumber: p.proformaNumber,
        orderNumber: p.orderNumber,
        seller: p.seller,
        warehouse: p.warehouse,
        product: p.product,
        date: p.createdDate,
        status: p.docStatus,
        href: "/documents/proforma-invoice",
      });
    });
  }

  if (
    filters.documentType === "all" ||
    filters.documentType === "gst_invoice"
  ) {
    filterGstInvoices(state.gstInvoices, filters).forEach((g) => {
      results.push({
        id: g.id,
        type: "gst_invoice",
        title: "GST Invoice",
        documentNumber: g.invoiceNumber,
        orderNumber: g.orderNumber,
        seller: g.seller,
        warehouse: g.warehouse,
        product: g.product,
        date: g.invoiceDate,
        status: g.status,
        href: "/documents/gst-invoices",
      });
    });
  }

  if (
    filters.documentType === "all" ||
    filters.documentType === "certificate"
  ) {
    filterCertificates(state.certificates, filters).forEach((c) => {
      results.push({
        id: c.id,
        type: "certificate",
        title: c.name,
        documentNumber: c.certificateNumber,
        orderNumber: c.orderNumber,
        seller: c.seller,
        warehouse: c.warehouse,
        product: c.product,
        date: c.issueDate,
        status: c.status,
        href: "/documents/certificates",
      });
    });
  }

  return sortByDate(results, (r) => r.date, filters.sortBy);
}

export const initialDocumentsState = {
  selectedDocumentId: null as string | null,
  categoryFilter: "all" as DocumentCategoryFilter,
  isLoading: false,
};
