"use client";

import { useState } from "react";
import { HelpCircle, MapPin, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { ONBOARDING_SUPPORT_CONTACT } from "@/constants/onboarding";
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

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Message sent", {
      description: "Our support team will get back to you shortly.",
    });
    resetForm();
    setOpen(false);
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
            Reach PetroTrade support by phone, email, or send us a message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <a
            href={ONBOARDING_SUPPORT_CONTACT.phoneHref}
            className="flex items-start gap-3 text-sm text-slate-700 transition-colors hover:text-slate-900"
          >
            <Phone
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
              aria-hidden="true"
            />
            <span>
              <span className="block font-medium text-slate-900">
                {ONBOARDING_SUPPORT_CONTACT.phone}
              </span>
              <span className="text-xs text-slate-500">
                {ONBOARDING_SUPPORT_CONTACT.hours}
              </span>
            </span>
          </a>

          <a
            href={ONBOARDING_SUPPORT_CONTACT.emailHref}
            className="flex items-start gap-3 text-sm text-slate-700 transition-colors hover:text-slate-900"
          >
            <Mail
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
              aria-hidden="true"
            />
            <span className="font-medium text-slate-900">
              {ONBOARDING_SUPPORT_CONTACT.email}
            </span>
          </a>

          <div className="flex items-start gap-3 text-sm text-slate-700">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
              aria-hidden="true"
            />
            <span>{ONBOARDING_SUPPORT_CONTACT.address}</span>
          </div>
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
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
              Send Message
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
