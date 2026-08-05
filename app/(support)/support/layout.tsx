import type { ReactNode } from "react";
import { SupportModuleShell } from "@/components/support";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return <SupportModuleShell>{children}</SupportModuleShell>;
}
