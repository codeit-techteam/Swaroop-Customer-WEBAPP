"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  MVP_TICKET_CATEGORY_OPTIONS,
} from "@/constants/support";
import { useSupportStore } from "@/store/supportStore";
import type { TicketCategory } from "@/types/support";
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

  const [category, setCategory] = useState<TicketCategory | "">("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setCategory("");
    setSubject("");
    setDescription("");
    setAttachmentName(undefined);
    setErrors({});
    setSubmitting(false);
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!category) next.category = "Select a category";
    if (!subject.trim()) next.subject = "Subject is required";
    if (!description.trim()) next.description = "Description is required";
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
    try {
      await createTicket({
        category,
        subject,
        description,
        attachmentName,
      });
      resetForm();
    } catch (error) {
      setSubmitting(false);
      toast.error("Could not create ticket", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    }
  }

  const displayTicketId = useMemo(
    () => lastCreatedTicketId ?? "SUP-2026-00123",
    [lastCreatedTicketId],
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
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-brand">
              Raise Support Ticket
            </DialogTitle>
            <p className="text-sm text-slate-500">
              Tell us about your issue and we&apos;ll get back to you.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label>Support Category</Label>
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
                  {MVP_TICKET_CATEGORY_OPTIONS.map((o) => (
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
              <Label htmlFor="ticket-subject">Subject</Label>
              <Textarea
                id="ticket-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                rows={2}
                className={cn(
                  "resize-none rounded-xl",
                  errors.subject && "border-red-400",
                )}
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
                placeholder="Provide details — order numbers, payment references, etc."
                rows={4}
                className={cn(
                  "resize-none rounded-xl",
                  errors.description && "border-red-400",
                )}
              />
              {errors.description ? (
                <p className="text-xs text-red-600">{errors.description}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Attachment (optional)</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition-colors hover:border-brand/40 hover:bg-sky-50/50">
                <Paperclip className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  {attachmentName ?? "Upload PDF, PNG, JPEG, DOC"}
                </span>
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
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-brand">
              Your support request has been submitted.
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2 text-center">
            <p className="text-sm text-slate-500">Ticket ID</p>
            <p className="text-xl font-bold text-brand">{displayTicketId}</p>
            <p className="text-sm text-slate-600">
              Our support team will contact you shortly.
            </p>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-brand hover:bg-brand/90"
              onClick={() => setRaiseTicketSuccessOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
