import type { Metadata } from "next";
import { ReceiptsPage } from "@/components/payments";

export const metadata: Metadata = {
  title: "Receipts",
};

export default function Page() {
  return <ReceiptsPage />;
}
