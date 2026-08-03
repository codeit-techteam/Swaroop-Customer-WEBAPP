import type { ReactNode } from "react";
import { CustomerAppShell } from "@/components/layout/customer-app-shell";

export default function PurchaseRequestsGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CustomerAppShell>{children}</CustomerAppShell>;
}
