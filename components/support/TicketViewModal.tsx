"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  getMvpStatus,
  MVP_STATUS_CLASS,
  TICKET_CATEGORY_LABELS,
} from "@/constants/support";
import { useSupportStore } from "@/store/supportStore";
import { formatSupportDateTime } from "./support-format";
import { cn } from "@/lib/utils";

export function TicketViewModal() {
  const selectedTicketId = useSupportStore((s) => s.selectedTicketId);
  const tickets = useSupportStore((s) => s.tickets);
  const setSelectedTicketId = useSupportStore((s) => s.setSelectedTicketId);

  const ticket = tickets.find((t) => t.id === selectedTicketId) ?? null;
  const open = !!ticket;

  const supportReply = ticket?.conversation.find(
    (m) => m.sender === "executive",
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setSelectedTicketId(null);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        {ticket ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-brand">
                  {ticket.ticketId}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                    MVP_STATUS_CLASS[getMvpStatus(ticket.status)],
                  )}
                >
                  {getMvpStatus(ticket.status)}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Category
                  </p>
                  <p className="mt-0.5 font-medium text-slate-800">
                    {TICKET_CATEGORY_LABELS[ticket.category]}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Subject
                  </p>
                  <p className="mt-0.5 font-medium text-slate-800">
                    {ticket.subject}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Description
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {ticket.description}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Support Reply
                </p>
                {supportReply ? (
                  <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <p className="mb-1 text-xs font-semibold text-slate-500">
                      {supportReply.senderName}
                    </p>
                    <p className="leading-relaxed">{supportReply.body}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">
                    No reply yet. Our team will respond shortly.
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Timeline
                </p>
                <ol className="relative space-y-3 border-l border-slate-200 pl-4">
                  {ticket.timeline.map((ev) => (
                    <li key={ev.id} className="relative">
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand ring-4 ring-white" />
                      <p className="text-sm font-medium text-slate-800">
                        {ev.label}
                      </p>
                      <p className="text-xs text-slate-500">{ev.description}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {formatSupportDateTime(ev.at)}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedTicketId(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
