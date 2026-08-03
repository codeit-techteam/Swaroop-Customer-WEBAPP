import type { ReactNode } from "react";
import { CustomerAppShell } from "@/components/layout/customer-app-shell";

export default function NotificationsGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CustomerAppShell>{children}</CustomerAppShell>;
}
