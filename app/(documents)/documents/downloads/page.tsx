import type { Metadata } from "next";
import { DownloadsPage } from "@/components/documents";

export const metadata: Metadata = {
  title: "Downloads",
};

export default function Page() {
  return <DownloadsPage />;
}
