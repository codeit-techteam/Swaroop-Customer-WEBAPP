"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductGalleryImage } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductGalleryImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export function ProductGallery({
  images,
  activeIndex,
  onSelect,
  className,
}: ProductGalleryProps) {
  const [zoomed, setZoomed] = useState(false);
  const active = images[activeIndex] ?? images[0];

  if (!active) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-card sm:aspect-[5/4]"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={active.url}
              alt={active.alt}
              fill
              priority
              className={cn(
                "object-cover transition-transform duration-500",
                zoomed && "scale-110",
              )}
              sizes="(max-width: 1280px) 100vw, 30vw"
            />
          </motion.div>
        </AnimatePresence>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-slate-900/60 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-70">
          Hover to zoom
        </span>
      </div>

      <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
              activeIndex === index
                ? "border-brand"
                : "border-transparent opacity-80 hover:opacity-100",
            )}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image.url}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
