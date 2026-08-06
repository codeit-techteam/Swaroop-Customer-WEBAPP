"use client";

import {
  Award,
  Download,
  FileSpreadsheet,
  FileText,
  Files,
  Search,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import type { DocumentsDashboardSummary } from "@/types/documents";
import type { LucideIcon } from "lucide-react";

interface SummaryCardsProps {
  summary: DocumentsDashboardSummary;
  className?: string;
}

export function DocumentSummaryCards({
  summary,
  className,
}: SummaryCardsProps) {
  const items: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
    tone?: string;
  }> = [
    {
      label: "Total Documents",
      value: String(summary.totalDocuments),
      icon: Files,
      tone: "text-brand",
    },
    {
      label: "Purchase Orders",
      value: String(summary.purchaseOrders),
      icon: FileSpreadsheet,
      tone: "text-sky-600",
    },
    {
      label: "Invoices",
      value: String(summary.invoices),
      icon: FileText,
      tone: "text-indigo-600",
    },
    {
      label: "Certificates",
      value: String(summary.certificates),
      icon: Award,
      tone: "text-emerald-600",
    },
    {
      label: "Downloads",
      value: String(summary.downloads),
      icon: Download,
      tone: "text-amber-600",
    },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-5", className)}>
      {items.map((item) => (
        <Card key={item.label} className="border-slate-200 shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-xl bg-brand/5 p-2.5 text-brand">
              <item.icon className={cn("h-5 w-5", item.tone)} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {item.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface QuickActionsProps {
  onDownloadAll: () => void;
  onUpload: () => void;
}

export function DocumentQuickActions({
  onDownloadAll,
  onUpload,
}: QuickActionsProps) {
  const router = useRouter();
  return (
    <Card className="border-slate-200 shadow-card">
      <CardContent className="flex flex-wrap gap-2 p-4">
        <p className="mb-1 w-full text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quick Actions
        </p>
        <Button
          className="rounded-xl bg-brand hover:bg-brand-700"
          onClick={() => router.push(ROUTES.documents)}
        >
          <Search className="h-4 w-4" />
          Search Documents
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={onDownloadAll}
        >
          <Download className="h-4 w-4" />
          Download All
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={onUpload}>
          <Upload className="h-4 w-4" />
          Upload Supporting Document
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push(ROUTES.documentsInvoices)}
        >
          <FileText className="h-4 w-4" />
          View Invoices
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push(ROUTES.documentsCertificates)}
        >
          <Award className="h-4 w-4" />
          Certificates
        </Button>
      </CardContent>
    </Card>
  );
}
