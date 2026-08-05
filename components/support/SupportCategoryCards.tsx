"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUPPORT_ROUTES } from "@/constants/support";
import { useSupportStore } from "@/store/supportStore";
import { SUPPORT_CATEGORY_META } from "./SupportStatusWidgets";

export function SupportCategoryCards() {
  const router = useRouter();
  const setRaiseTicketOpen = useSupportStore((s) => s.setRaiseTicketOpen);

  function handleAction(
    action: (typeof SUPPORT_CATEGORY_META)[number]["action"],
  ) {
    if (action === "raise") {
      setRaiseTicketOpen(true);
      return;
    }
    if (action === "knowledge") {
      router.push(SUPPORT_ROUTES.knowledgeBase);
      return;
    }
    router.push(SUPPORT_ROUTES.tickets);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SUPPORT_CATEGORY_META.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className="group rounded-2xl border-slate-200/80 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-accent-blue transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-brand">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {card.description}
                </p>
              </div>
              <Button
                variant="link"
                className="mt-auto h-auto justify-start gap-1.5 p-0 text-sm font-semibold text-accent-blue"
                onClick={() => handleAction(card.action)}
              >
                {card.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
