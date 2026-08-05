import type { Metadata } from "next";
import { SupportKnowledgeBasePage } from "@/components/support";

export const metadata: Metadata = {
  title: "Knowledge Base",
};

export default function Page() {
  return <SupportKnowledgeBasePage />;
}
