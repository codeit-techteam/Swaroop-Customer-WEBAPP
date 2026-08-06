"use client";

import { MessageCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSupportStore } from "@/store/supportStore";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    id: "chat",
    icon: MessageCircle,
    title: "Chat Support",
    detail: "Talk to our team",
    action: "Start Chat",
    modal: "chat" as const,
  },
  {
    id: "ticket",
    icon: Ticket,
    title: "Raise Support Ticket",
    detail: "Submit a request",
    action: "Raise Ticket",
    modal: "ticket" as const,
  },
] as const;

export function SupportContactCards() {
  const setRaiseTicketOpen = useSupportStore((s) => s.setRaiseTicketOpen);
  const setChatModalOpen = useSupportStore((s) => s.setChatModalOpen);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className="overflow-hidden border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                    card.id === "chat" && "bg-emerald-50 text-emerald-600",
                    card.id === "ticket" && "bg-amber-50 text-amber-600",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {card.detail}
                  </p>
                </div>
              </div>
              <Button
                className="w-full rounded-xl bg-brand hover:bg-brand/90"
                onClick={() => {
                  if (card.modal === "chat") setChatModalOpen(true);
                  if (card.modal === "ticket") setRaiseTicketOpen(true);
                }}
              >
                {card.action}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
