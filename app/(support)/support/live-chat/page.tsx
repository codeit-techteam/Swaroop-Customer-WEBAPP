import type { Metadata } from "next";
import { SupportLiveChatPage } from "@/components/support";

export const metadata: Metadata = {
  title: "Live Chat",
};

export default function Page() {
  return <SupportLiveChatPage />;
}
