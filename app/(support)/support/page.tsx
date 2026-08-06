import type { Metadata } from "next";
import { HelpCenterPage } from "@/components/support";

export const metadata: Metadata = {
  title: "Help & Support",
};

export default function Page() {
  return <HelpCenterPage />;
}
