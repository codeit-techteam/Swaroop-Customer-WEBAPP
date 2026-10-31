"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Mail, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  fetchLegalLinks,
  openContactSupport,
  submitSupportEnquiry,
  type LegalLinks,
} from "@/lib/legal-links";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface HelpCardProps {
  variant?: "card" | "button" | "support";
  className?: string;
}

export function HelpCard({ variant = "card", className }: HelpCardProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [links, setLinks] = useState<LegalLinks | null>(null);

  useEffect(() => {
    if (!open || links) return;
    void fetchLegalLinks().then(setLinks);
  }, [open, links]);

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (name.trim().length < 2) {
      toast.error("Please enter your name");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (message.trim().length < 20) {
      toast.error("Please describe the issue in at least 20 characters");
      return;
    }
    setSending(true);
    try {
      const { referenceNumber } = await submitSupportEnquiry({
        name,
        email,
        message: `[Onboarding help] ${message}`,
        pagePath:
          typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      toast.success("Message sent", {
        description: referenceNumber
          ? `Reference ${referenceNumber}. Our support team will get back to you.`
          : "Our support team will get back to you.",
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not send your message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  const triggerButton =
    variant === "button" ? (
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
          className,
        )}
        aria-label="Need help with onboarding"
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        Need Help?
      </button>
    ) : variant === "support" ? (
      <button
        type="button"
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-left transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
          className,
        )}
        aria-label="Need help with onboarding"
      >
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Need Help?</p>
            <p className="text-xs text-slate-500">Live Trading Support</p>
          </div>
        </div>
      </button>
    ) : (
      <button
        type="button"
        className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
      >
        Need Help?
      </button>
    );

  const dialog = (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Need Help?</DialogTitle>
          <DialogDescription>
            Reach PolyStoreX support or send us a message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {links?.supportEmail ? (
            <a
              href={`mailto:${links.supportEmail}`}
              className="flex items-start gap-3 text-sm text-slate-700 transition-colors hover:text-slate-900"
            >
              <Mail
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                aria-hidden="true"
              />
              <span className="font-medium text-slate-900">
                {links.supportEmail}
              </span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => void openContactSupport({ topic: "BUY_MATERIALS" })}
            className="flex items-start gap-3 text-left text-sm text-slate-700 transition-colors hover:text-slate-900"
          >
            <ExternalLink
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
              aria-hidden="true"
            />
            <span className="font-medium text-slate-900">
              Open the support page
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-help-name">Your name</Label>
            <Input
              id="onboarding-help-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-help-email">Email</Label>
            <Input
              id="onboarding-help-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-help-message">How can we help?</Label>
            <Textarea
              id="onboarding-help-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue you're facing during onboarding…"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {sending ? "Sending…" : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
          className,
        )}
      >
        <p className="mb-3 text-sm text-slate-600">
          Having trouble with verification?
        </p>
        {dialog}
      </div>
    );
  }

  return dialog;
}
