"use client";

import { CalendarClock, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSupportStore } from "@/store/supportStore";
import { cn } from "@/lib/utils";

interface AccountManagerCardProps {
  compact?: boolean;
  className?: string;
}

export function AccountManagerCard({
  compact,
  className,
}: AccountManagerCardProps) {
  const manager = useSupportStore((s) => s.accountManager);
  const scheduleMeeting = useSupportStore((s) => s.scheduleMeeting);

  function handleCall() {
    toast.success(`Calling ${manager.name}`, {
      description: manager.phone,
    });
    window.open(`tel:${manager.phone.replace(/\s/g, "")}`, "_self");
  }

  function handleEmail() {
    toast.message("Opening email composer", {
      description: manager.email,
    });
    window.open(
      `mailto:${manager.email}?subject=PetroTrade%20Enterprise%20Support`,
      "_blank",
    );
  }

  function handleSchedule() {
    scheduleMeeting();
    toast.success("Meeting request sent", {
      description: `${manager.name} will confirm a slot on your calendar.`,
    });
  }

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-slate-200/80 shadow-card",
        className,
      )}
    >
      <div className="bg-brand px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Your Account Manager
            </p>
            <h3 className="mt-1 text-lg font-semibold">{manager.name}</h3>
            <p className="text-sm text-white/80">{manager.designation}</p>
          </div>
          {manager.online ? (
            <Badge className="gap-1.5 rounded-full border-0 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Online
            </Badge>
          ) : (
            <Badge className="rounded-full border-0 bg-white/10 text-white/80">
              Offline
            </Badge>
          )}
        </div>
      </div>
      <CardContent className={cn("space-y-4 p-5", compact && "p-4")}>
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 rounded-2xl ring-2 ring-sky-100">
            <AvatarFallback className="rounded-2xl bg-sky-50 text-base font-semibold text-brand">
              {manager.photoInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-0.5 text-sm">
            <p className="font-medium text-slate-700">{manager.department}</p>
            <p className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {manager.location}
            </p>
            <p className="flex items-center gap-1.5 text-slate-500">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              {manager.responseSla}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl bg-slate-50 px-3.5 py-3 text-sm">
          <p className="flex items-center gap-2 text-slate-700">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            {manager.phone}
          </p>
          <p className="flex items-center gap-2 text-slate-700">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            {manager.email}
          </p>
          <p className="text-xs text-slate-500">{manager.availability}</p>
        </div>

        <div className="grid gap-2">
          <Button
            className="h-10 rounded-xl bg-brand hover:bg-brand/90"
            onClick={handleCall}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call / Direct Line
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-slate-200"
            onClick={handleEmail}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button
            variant="secondary"
            className="h-10 rounded-xl"
            onClick={handleSchedule}
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
