import type { Metadata } from "next";
import { ReorderOrdersPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "Reorder",
};

export default function Page() {
  return <ReorderOrdersPage />;
}
