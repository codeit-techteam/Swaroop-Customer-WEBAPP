import type { Metadata } from "next";
import { ReadyForDispatchPage } from "@/components/orders";

export const metadata: Metadata = {
  title: "Ready for Dispatch",
};

export default function Page() {
  return <ReadyForDispatchPage />;
}
