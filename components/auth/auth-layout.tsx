"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  /** Left branding panel content */
  side: ReactNode;
  /** Background image for the left panel */
  backgroundImage?: string;
  /** Full-bleed split (login) vs centered card shell (otp) */
  variant?: "split" | "centered";
  className?: string;
  sideClassName?: string;
  contentClassName?: string;
}

export function AuthLayout({
  children,
  side,
  backgroundImage = "/assets/images/auth-industrial-day.jpg",
  variant = "split",
  className,
  sideClassName,
  contentClassName,
}: AuthLayoutProps) {
  if (variant === "centered") {
    return (
      <div
        className={cn(
          "flex h-dvh items-center justify-center overflow-hidden bg-[#F3F5F8] p-4 sm:p-6 lg:p-8",
          className,
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex max-h-full w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-panel"
        >
          <aside
            className={cn(
              "relative hidden w-[42%] shrink-0 flex-col overflow-hidden lg:flex",
              sideClassName,
            )}
          >
            <Image
              src={backgroundImage}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="42vw"
            />
            <div className="absolute inset-0 bg-brand/90" />
            <div className="relative z-10 flex h-full flex-col p-8 text-white xl:p-10">
              {side}
            </div>
          </aside>
          <div
            className={cn(
              "flex flex-1 flex-col justify-center overflow-y-auto px-6 py-8 sm:px-10 lg:px-12",
              contentClassName,
            )}
          >
            {children}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-dvh overflow-hidden", className)}>
      <aside
        className={cn(
          "relative hidden h-full shrink-0 overflow-hidden lg:block lg:w-[55%] xl:w-[58%]",
          sideClassName,
        )}
      >
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="58vw"
        />
        <div className="via-brand/88 absolute inset-0 bg-gradient-to-br from-brand/95 to-brand/80" />
        <div className="relative z-10 flex h-full flex-col p-8 xl:p-12">
          {side}
        </div>
      </aside>
      <main
        className={cn(
          "relative flex h-full w-full flex-1 flex-col items-center justify-center overflow-y-auto bg-white px-5 py-6 sm:px-8",
          contentClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
