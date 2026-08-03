import type { ReactNode } from "react";
import { CustomerAppShell } from "@/components/layout/customer-app-shell";

export default function DocumentsGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CustomerAppShell>{children}</CustomerAppShell>;
}
