"use client";

import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { ComplianceDocument } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface ComplianceAccordionProps {
  documents: ComplianceDocument[];
  className?: string;
}

export function ComplianceAccordion({
  documents,
  className,
}: ComplianceAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn(
        "rounded-2xl border border-slate-200 bg-white px-4 shadow-card",
        className,
      )}
    >
      <AccordionItem value="compliance" className="border-0">
        <AccordionTrigger className="text-sm font-semibold text-slate-900 hover:no-underline">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Compliance & Documents
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2">
            {documents.map((document) => (
              <li
                key={document.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {document.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {document.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-lg text-xs"
                  onClick={() =>
                    toast.success(`Download started: ${document.fileName}`, {
                      description: "Mock download — no backend attached.",
                    })
                  }
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
