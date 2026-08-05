"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORT_ROUTES } from "@/constants/support";
import { filterFaqs, useSupportStore } from "@/store/supportStore";
import { EmptyState } from "@/components/common/empty-state";
import { HelpCircle } from "lucide-react";

export function FaqSection({ limit }: { limit?: number }) {
  const faqs = useSupportStore((s) => s.faqs);
  const globalSearch = useSupportStore((s) => s.globalSearch);
  const filtered = filterFaqs(faqs, globalSearch);
  const visible =
    typeof limit === "number" ? filtered.slice(0, limit) : filtered;

  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-brand">
          Frequently Asked Questions
        </CardTitle>
        <Link
          href={SUPPORT_ROUTES.documentation}
          className="text-xs font-semibold text-accent-blue hover:underline"
        >
          View All Documentation
        </Link>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <EmptyState
            className="border-0 py-10 shadow-none"
            icon={<HelpCircle className="h-5 w-5" />}
            title="No FAQs match your search"
            description="Try a different keyword or browse Documentation."
          />
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {visible.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-slate-100"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-slate-800 hover:text-brand hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-500">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
