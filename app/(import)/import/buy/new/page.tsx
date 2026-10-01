import type { Metadata } from "next";
import { ImportCreatePage } from "@/components/import";

export const metadata: Metadata = { title: "New import buy request" };

export default function Page() {
  return <ImportCreatePage />;
}
