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
  const visibleThumbs = images.slice(0, 4);
  const moreCount = Math.max(0, images.length - 4);

  if (!active) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-card"
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
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {visibleThumbs.map((image, index) => {
          const isLastVisible = index === 3 && moreCount > 0;
          return (
            <button
              key={image.id}
              type="button"
              onClick={() =>
                onSelect(isLastVisible ? Math.min(3, images.length - 1) : index)
              }
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 transition-all",
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
                sizes="120px"
              />
              {isLastVisible ? (
                <span className="absolute inset-0 flex items-center justify-center bg-slate-900/55 text-sm font-semibold text-white">
                  +{moreCount} More
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {images.length > 4 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.slice(4).map((image, index) => {
            const absoluteIndex = index + 4;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelect(absoluteIndex)}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2",
                  activeIndex === absoluteIndex
                    ? "border-brand"
                    : "border-transparent",
                )}
                aria-label={`View image ${absoluteIndex + 1}`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
