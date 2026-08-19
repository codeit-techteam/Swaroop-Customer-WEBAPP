"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductSpecRow } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface TechnicalSpecificationAccordionProps {
  specs: ProductSpecRow[];
  className?: string;
}

export function TechnicalSpecificationAccordion({
  specs,
  className,
}: TechnicalSpecificationAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn(
        "rounded-2xl border border-slate-200 bg-white px-4 shadow-card",
        className,
      )}
    >
      <AccordionItem value="specs" className="border-0">
        <AccordionTrigger className="text-sm font-semibold text-slate-900 hover:no-underline">
          Technical Specifications
        </AccordionTrigger>
        <AccordionContent>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <tbody>
                {specs.map((spec, index) => (
                  <tr
                    key={spec.id}
                    className={cn(
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/80",
                    )}
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-600">
                      <div>{spec.label}</div>
                      {spec.standard ? (
                        <div className="text-[10px] font-normal text-slate-400">
                          {spec.standard}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-900">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
