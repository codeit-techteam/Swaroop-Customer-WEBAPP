import type { Metadata } from "next";
import { ImportMarketPage } from "@/components/import";

export const metadata: Metadata = { title: "Import sell offers" };

export default function Page() {
  return <ImportMarketPage />;
}
