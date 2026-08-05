import type { Metadata } from "next";
import { SupportSettingsPage } from "@/components/support";

export const metadata: Metadata = {
  title: "Support Settings",
};

export default function Page() {
  return <SupportSettingsPage />;
}
