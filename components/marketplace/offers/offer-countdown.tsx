"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface OfferCountdownProps {
  expiresAt: string;
  className?: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(expiresAt: string): TimeLeft {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, expired: false };
}

export function OfferCountdown({
  expiresAt,
  className,
  compact = false,
}: OfferCountdownProps) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(expiresAt));

  useEffect(() => {
    setTime(calcTimeLeft(expiresAt));
    const id = window.setInterval(() => {
      setTime(calcTimeLeft(expiresAt));
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  if (time.expired) {
    return (
      <span className={cn("text-sm font-semibold text-rose-600", className)}>
        Offer expired
      </span>
    );
  }

  if (compact) {
    return (
      <span
        className={cn(
          "font-mono text-xs font-semibold tabular-nums text-amber-700",
          className,
        )}
      >
        {String(time.days).padStart(2, "0")}d{" "}
        {String(time.hours).padStart(2, "0")}h{" "}
        {String(time.minutes).padStart(2, "0")}m
      </span>
    );
  }

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {units.map((unit) => (
        <div
          key={unit.label}
          className="min-w-[56px] rounded-xl border border-white/20 bg-white/15 px-2 py-1.5 text-center backdrop-blur-sm"
        >
          <p className="font-mono text-lg font-bold tabular-nums text-white">
            {String(unit.value).padStart(2, "0")}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function OfferCountdownBlocks({
  expiresAt,
  className,
}: {
  expiresAt: string;
  className?: string;
}) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(expiresAt));

  useEffect(() => {
    const id = window.setInterval(() => setTime(calcTimeLeft(expiresAt)), 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
  ];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {units.map((unit) => (
        <div
          key={unit.label}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-card"
        >
          <p className="font-mono text-2xl font-bold tabular-nums text-brand">
            {String(unit.value).padStart(2, "0")}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  );
}
