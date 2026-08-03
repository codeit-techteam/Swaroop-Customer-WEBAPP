"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthIllustrationProps {
  children: ReactNode;
  backgroundImage?: string;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

/**
 * Full-bleed industrial illustration panel with brand overlay.
 */
export function AuthIllustration({
  children,
  backgroundImage = "/assets/images/auth-industrial-night.jpg",
  className,
  overlayClassName,
  contentClassName,
}: AuthIllustrationProps) {
  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative flex h-full min-h-[280px] flex-col overflow-hidden",
        className,
      )}
    >
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 55vw"
      />
      <div
        className={cn(
          "via-brand/88 absolute inset-0 bg-gradient-to-br from-brand/95 to-brand/80",
          overlayClassName,
        )}
      />
      <div
        className={cn(
          "relative z-10 flex h-full flex-col p-8 text-white lg:p-10",
          contentClassName,
        )}
      >
        {children}
      </div>
    </motion.aside>
  );
}
