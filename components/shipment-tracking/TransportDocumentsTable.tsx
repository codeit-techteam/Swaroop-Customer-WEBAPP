"use client";

import { Download, Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadTransportDocument,
  printTransportDocument,
} from "@/lib/shipment-documents";
import { formatDateDdMmYyyy } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  ShipmentRecord,
  TransportDocument,
} from "@/types/shipment-tracking";

interface TransportDocumentsTableProps {
  shipment: ShipmentRecord;
  onDownloaded?: (documentId: string) => void;
  className?: string;
}

const STATUS_STYLE = {
  generated: "border-sky-200 bg-sky-50 text-sky-800",
  downloaded: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "border-slate-200 bg-slate-50 text-slate-600",
} as const;

export function TransportDocumentsTable({
  shipment,
  onDownloaded,
  className,
}: TransportDocumentsTableProps) {
  const handleDownload = (doc: TransportDocument) => {
    if (doc.status === "pending") {
      toast.error("Document not generated yet");
      return;
    }
    downloadTransportDocument(shipment, doc);
    onDownloaded?.(doc.id);
    toast.success(`${doc.title} downloaded`);
  };

  const handlePreview = (doc: TransportDocument) => {
    if (doc.status === "pending") {
      toast.error("Document not generated yet");
      return;
    }
    printTransportDocument(shipment, doc);
    toast.message(`Previewing ${doc.title}`);
  };

  const handlePrint = (doc: TransportDocument) => {
    if (doc.status === "pending") {
      toast.error("Document not generated yet");
      return;
    }
    printTransportDocument(shipment, doc);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead>Document</TableHead>
            <TableHead>File</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Generated</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipment.documents.map((doc) => (
            <TableRow key={doc.id} className="hover:bg-slate-50/60">
              <TableCell className="font-medium text-slate-900">
                {doc.title}
              </TableCell>
              <TableCell className="font-mono text-xs text-slate-500">
                {doc.fileName}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("capitalize", STATUS_STYLE[doc.status])}
                >
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {doc.generatedAt ? formatDateDdMmYyyy(doc.generatedAt) : "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {doc.sizeKb} KB
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-lg"
                    disabled={doc.status === "pending"}
                    onClick={() => handlePreview(doc)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-lg"
                    disabled={doc.status === "pending"}
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-lg"
                    disabled={doc.status === "pending"}
                    onClick={() => handlePrint(doc)}
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
