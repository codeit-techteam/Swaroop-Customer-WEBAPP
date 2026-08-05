import type { Metadata } from "next";
import { SupportOverviewPage } from "@/components/support";

export const metadata: Metadata = {
  title: "Support Center",
};

export default function Page() {
  return <SupportOverviewPage />;
}
