import type { Metadata } from "next";
import { SupportTicketsPage } from "@/components/support";

export const metadata: Metadata = {
  title: "My Tickets",
};

export default function Page() {
  return <SupportTicketsPage />;
}
