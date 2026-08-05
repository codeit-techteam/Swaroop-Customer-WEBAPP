"use client";

import { useRef } from "react";
import { Check, Paperclip, Send, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ALLOWED_ATTACHMENT_ACCEPT } from "@/constants/support";
import { useSupportStore } from "@/store/supportStore";
import { TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";
import { formatChatTime, formatSupportDateTime } from "./support-format";
import { cn } from "@/lib/utils";

export function TicketDetailsDrawer() {
  const selectedTicketId = useSupportStore((s) => s.selectedTicketId);
  const tickets = useSupportStore((s) => s.tickets);
  const setSelectedTicketId = useSupportStore((s) => s.setSelectedTicketId);
  const replyDraft = useSupportStore((s) => s.replyDraft);
  const setReplyDraft = useSupportStore((s) => s.setReplyDraft);
  const replyToTicket = useSupportStore((s) => s.replyToTicket);
  const addTicketAttachment = useSupportStore((s) => s.addTicketAttachment);
  const closeTicket = useSupportStore((s) => s.closeTicket);
  const fileRef = useRef<HTMLInputElement>(null);

  const ticket = tickets.find((t) => t.id === selectedTicketId) ?? null;
  const open = !!ticket;

  function handleUpload(file?: File | null) {
    if (!ticket || !file) return;
    addTicketAttachment(ticket.id, file.name);
    toast.success("Attachment uploaded", { description: file.name });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setSelectedTicketId(null);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        {ticket ? (
          <>
            <SheetHeader className="space-y-3 border-b border-slate-100 px-5 py-4 text-left">
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <SheetTitle className="text-lg text-brand">
                  {ticket.ticketId}
                </SheetTitle>
                <TicketPriorityBadge priority={ticket.priority} />
                <TicketStatusBadge status={ticket.status} />
              </div>
              <SheetDescription className="text-sm font-medium text-slate-700">
                {ticket.subject}
              </SheetDescription>
              <p className="text-xs text-slate-400">
                {ticket.categoryLabel} · Assigned to {ticket.assignedTo} ·
                Updated {formatSupportDateTime(ticket.updatedAt)}
              </p>
            </SheetHeader>

            <ScrollArea className="flex-1 px-5 py-4">
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Timeline
                </h4>
                <ol className="relative space-y-4 border-l border-slate-200 pl-4">
                  {ticket.timeline.map((ev) => (
                    <li key={ev.id} className="relative">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-white" />
                      <p className="text-sm font-semibold text-slate-800">
                        {ev.label}
                      </p>
                      <p className="text-xs text-slate-500">{ev.description}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {ev.actor} · {formatSupportDateTime(ev.at)}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              <Separator className="my-5" />

              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Conversation
                </h4>
                <div className="space-y-2.5">
                  {ticket.conversation.length === 0 ? (
                    <p className="text-sm text-slate-400">No messages yet.</p>
                  ) : (
                    ticket.conversation.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm",
                          m.sender === "customer"
                            ? "ml-auto bg-brand text-white"
                            : "bg-slate-100 text-slate-700",
                        )}
                      >
                        <p className="mb-1 text-[11px] font-semibold opacity-80">
                          {m.senderName}
                        </p>
                        <p className="leading-relaxed">{m.body}</p>
                        {m.attachmentName ? (
                          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] opacity-90">
                            <Paperclip className="h-3 w-3" />
                            {m.attachmentName}
                          </p>
                        ) : null}
                        <p className="mt-1 text-right text-[10px] opacity-70">
                          {formatChatTime(m.at)}
                          {m.read ? (
                            <Check className="ml-1 inline h-3 w-3" />
                          ) : null}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <Separator className="my-5" />

              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Attachments
                </h4>
                {ticket.attachments.length === 0 ? (
                  <p className="text-sm text-slate-400">No attachments.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {ticket.attachments.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm"
                      >
                        <span className="truncate font-medium text-slate-700">
                          {a.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {a.sizeLabel}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {ticket.internalNotes.length > 0 ? (
                <>
                  <Separator className="my-5" />
                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Internal Notes (Dummy)
                    </h4>
                    <ul className="space-y-1.5 rounded-xl bg-amber-50/70 p-3 text-xs text-amber-900">
                      {ticket.internalNotes.map((note, i) => (
                        <li key={i}>• {note}</li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : null}

              <div className="h-4" />
            </ScrollArea>

            <div className="space-y-3 border-t border-slate-100 bg-white px-5 py-4">
              <Textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="resize-none rounded-xl"
                disabled={ticket.status === "closed"}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  className="bg-brand hover:bg-brand/90"
                  disabled={ticket.status === "closed" || !replyDraft.trim()}
                  onClick={() => replyToTicket(ticket.id, replyDraft)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  disabled={ticket.status === "closed"}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Attachment
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept={ALLOWED_ATTACHMENT_ACCEPT}
                  onChange={(e) => {
                    handleUpload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                {ticket.status !== "closed" ? (
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      closeTicket(ticket.id);
                      toast.success(`${ticket.ticketId} closed`);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Close Ticket
                  </Button>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
