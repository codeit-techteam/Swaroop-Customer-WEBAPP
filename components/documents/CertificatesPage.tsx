"use client";

import { useMemo } from "react";
import { Download, Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { CERTIFICATE_KIND_LABELS } from "@/constants/documents";
import { formatDateDdMmYyyy } from "@/lib/format";
import {
  buildGenericDocumentContent,
  printDocumentHtml,
  simulatePdfDownload,
} from "@/lib/document-actions";
import {
  filterCertificates,
  getFacetOptions,
  useDocumentsStore,
} from "@/store/documentsStore";
import type { CertificateDocument } from "@/types/documents";
import { DocumentFiltersBar } from "./DocumentFiltersBar";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import {
  DocumentsLoadingSkeleton,
  DocumentsModuleChrome,
} from "./DocumentsModuleChrome";

export function CertificatesPage() {
  const isHydrated = useDocumentsStore((s) => s.isHydrated);
  const certificates = useDocumentsStore((s) => s.certificates);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const invoices = useDocumentsStore((s) => s.invoices);
  const filters = useDocumentsStore((s) => s.filters);
  const setFilters = useDocumentsStore((s) => s.setFilters);
  const resetFilters = useDocumentsStore((s) => s.resetFilters);
  const markDownloaded = useDocumentsStore((s) => s.markDownloaded);
  const openPreview = useDocumentsStore((s) => s.openPreview);

  const facets = useMemo(
    () => getFacetOptions({ purchaseOrders, invoices }),
    [purchaseOrders, invoices],
  );
  const rows = useMemo(
    () => filterCertificates(certificates, filters),
    [certificates, filters],
  );

  const kinds = useMemo(() => {
    const map = new Map<string, number>();
    certificates.forEach((c) => {
      map.set(c.kind, (map.get(c.kind) ?? 0) + 1);
    });
    return Array.from(map.entries());
  }, [certificates]);

  const contentFor = (c: CertificateDocument) =>
    buildGenericDocumentContent({
      title: c.name,
      documentNumber: c.certificateNumber,
      orderNumber: c.orderNumber,
      seller: c.seller,
      warehouse: c.warehouse,
      product: `${c.product} (${c.grade})`,
      extraLines: [
        `Type          : ${CERTIFICATE_KIND_LABELS[c.kind]}`,
        `Issued By     : ${c.issuedBy}`,
        `Issue Date    : ${c.issueDate}`,
        `Expiry Date   : ${c.expiryDate}`,
        `Remarks       : ${c.remarks ?? "—"}`,
      ],
    });

  if (!isHydrated) {
    return (
      <PageContainer>
        <DocumentsLoadingSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DocumentsModuleChrome />
      <PageHeader
        title="Certificates"
        description="Enterprise quality, inspection, origin, and lab certificates linked to delivered batches."
        breadcrumbs={[
          { label: "Documents", href: ROUTES.documents },
          { label: "Certificates" },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kinds.map(([kind, count]) => (
          <Card key={kind} className="border-slate-200 shadow-card">
            <CardContent className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {CERTIFICATE_KIND_LABELS[kind as CertificateDocument["kind"]]}
              </p>
              <p className="mt-1 text-lg font-semibold text-brand">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DocumentFiltersBar
        filters={filters}
        warehouses={facets.warehouses}
        sellers={facets.sellers}
        onChange={setFilters}
        onReset={resetFilters}
        hideType
        searchPlaceholder="Search certificate, product, issuer, order…"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <Card
            key={c.id}
            className="border-slate-200 shadow-card transition hover:border-brand/30"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="mt-1 font-mono text-xs text-brand">
                    {c.certificateNumber}
                  </p>
                </div>
                <DocumentStatusBadge status={c.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Product" value={`${c.product} (${c.grade})`} />
                <Field label="Issued By" value={c.issuedBy} />
                <Field
                  label="Issue Date"
                  value={formatDateDdMmYyyy(c.issueDate)}
                />
                <Field
                  label="Expiry Date"
                  value={formatDateDdMmYyyy(c.expiryDate)}
                />
              </div>
              <p className="text-xs text-slate-500">
                {c.orderNumber} · {c.seller} · {c.warehouse}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    openPreview({
                      title: c.name,
                      categoryLabel: "Certificate",
                      fileName: `${c.certificateNumber}.pdf`,
                      documentNumber: c.certificateNumber,
                      orderNumber: c.orderNumber,
                      content: contentFor(c),
                      relatedId: c.id,
                    })
                  }
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    simulatePdfDownload(
                      `${c.certificateNumber}.pdf`,
                      contentFor(c),
                    );
                    markDownloaded("certificate", c.id);
                    toast.success("Certificate download started");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    printDocumentHtml(c.certificateNumber, contentFor(c))
                  }
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-slate-900">{value}</p>
    </div>
  );
}
