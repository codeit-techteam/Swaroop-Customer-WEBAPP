"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapPreviewProps {
  city?: string;
  className?: string;
}

/** Static placeholder map — no external map API */
export function MapPreview({ city = "Mumbai", className }: MapPreviewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200 bg-slate-200",
        className,
      )}
      role="img"
      aria-label={`Office location preview map for ${city}`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(135deg, #cbd5e1 0%, #94a3b8 40%, #64748b 70%, #475569 100%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 24px,
              rgba(255,255,255,0.08) 24px,
              rgba(255,255,255,0.08) 25px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 24px,
              rgba(255,255,255,0.08) 24px,
              rgba(255,255,255,0.08) 25px
            )
          `,
        }}
      />
      {/* Fake roads */}
      <div className="absolute left-[10%] top-[30%] h-1 w-[80%] rotate-[-8deg] bg-slate-400/60" />
      <div className="absolute left-[20%] top-[10%] h-[80%] w-1 rotate-[12deg] bg-slate-400/50" />
      <div className="absolute bottom-[25%] left-[5%] h-1 w-[70%] rotate-[4deg] bg-amber-200/40" />

      {/* Pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <MapPin
          className="h-10 w-10 fill-red-500 text-red-600 drop-shadow-md"
          aria-hidden="true"
        />
      </div>

      <div className="absolute bottom-3 right-3 rounded bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm">
        Office Location Preview
      </div>
    </div>
  );
}
