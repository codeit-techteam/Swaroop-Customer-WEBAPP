import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Re-export for consumers that import cn from utils/cn */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
