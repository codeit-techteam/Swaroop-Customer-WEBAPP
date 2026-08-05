"use client";

import { useMemo, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALLOWED_ATTACHMENT_ACCEPT,
  SUPPORT_SLA_COPY,
  TICKET_CATEGORY_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
} from "@/constants/support";
import { useSupportStore } from "@/store/supportStore";
import type { TicketCategory, TicketPriority } from "@/types/support";
import { cn } from "@/lib/utils";

const ACCEPTED_EXT = ["pdf", "png", "jpg", "jpeg", "doc", "docx"];

export function RaiseTicketDialog() {
  const open = useSupportStore((s) => s.raiseTicketOpen);
  const successOpen = useSupportStore((s) => s.raiseTicketSuccessOpen);
  const lastCreatedTicketId = useSupportStore((s) => s.lastCreatedTicketId);
  const setRaiseTicketOpen = useSupportStore((s) => s.setRaiseTicketOpen);
  const setRaiseTicketSuccessOpen = useSupportStore(
    (s) => s.setRaiseTicketSuccessOpen,
  );
  const createTicket = useSupportStore((s) => s.createTicket);
  const setSelectedTicketId = useSupportStore((s) => s.setSelectedTicketId);
  const tickets = useSupportStore((s) => s.tickets);

  const [category, setCategory] = useState<TicketCategory | "">("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setCategory("");
    setPriority("medium");
    setSubject("");
    setDescription("");
    setAttachmentName(undefined);
    setErrors({});
    setSubmitting(false);
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!category) next.category = "Select a category";
    if (!subject.trim() || subject.trim().length < 8) {
      next.subject = "Subject must be at least 8 characters";
    }
    if (!description.trim() || description.trim().length < 20) {
      next.description = "Description must be at least 20 characters";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleFile(file?: File | null) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED_EXT.includes(ext)) {
      toast.error("Unsupported file type", {
        description: "Use PDF, PNG, JPEG, DOC or DOCX.",
      });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File too large", { description: "Max size is 8 MB." });
      return;
    }
    setAttachmentName(file.name);
  }

  async function handleSubmit() {
    if (!validate() || !category) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 450));
    createTicket({
      category,
      priority,
      subject,
      description,
      attachmentName,
    });
    resetForm();
    toast.success("Ticket submitted");
  }

  const createdTicket = useMemo(
    () => tickets.find((t) => t.ticketId === lastCreatedTicketId),
    [tickets, lastCreatedTicketId],
  );

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setRaiseTicketOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-brand">Raise New Ticket</DialogTitle>
            <DialogDescription>{SUPPORT_SLA_COPY}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as TicketCategory)}
                >
                  <SelectTrigger
                    className={cn(errors.category && "border-red-400")}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category ? (
                  <p className="text-xs text-red-600">{errors.category}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as TicketPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                className={cn(errors.subject && "border-red-400")}
              />
              {errors.subject ? (
                <p className="text-xs text-red-600">{errors.subject}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-desc">Description</Label>
              <Textarea
                id="ticket-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include order numbers, UTRs, warehouse, and expected resolution."
                rows={5}
                className={cn(errors.description && "border-red-400")}
              />
              {errors.description ? (
                <p className="text-xs text-red-600">{errors.description}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Attachment (optional)</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-brand/40 hover:bg-sky-50/50">
                <Paperclip className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  {attachmentName ?? "Upload PDF, PNG, JPEG, DOC"}
                </span>
                <span className="text-xs text-slate-400">Max 8 MB</span>
                <input
                  type="file"
                  className="hidden"
                  accept={ALLOWED_ATTACHMENT_ACCEPT}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
              {attachmentName ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
                  onClick={() => setAttachmentName(undefined)}
                >
                  <X className="h-3 w-3" />
                  Remove file
                </button>
              ) : null}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRaiseTicketOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-brand hover:bg-brand/90"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting…" : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={successOpen}
        onOpenChange={(v) => setRaiseTicketSuccessOpen(v)}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand">Ticket Created</DialogTitle>
            <DialogDescription>
              Your request{" "}
              <span className="font-semibold text-brand">
                {lastCreatedTicketId}
              </span>{" "}
              is in the Enterprise queue. We typically respond within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRaiseTicketSuccessOpen(false)}
            >
              Close
            </Button>
            <Button
              className="bg-brand hover:bg-brand/90"
              onClick={() => {
                setRaiseTicketSuccessOpen(false);
                if (createdTicket) setSelectedTicketId(createdTicket.id);
              }}
            >
              View Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
