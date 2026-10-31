import type { Metadata } from "next";
import { GradeRequestsList } from "@/components/grade-requests/grade-requests-list";

export const metadata: Metadata = {
  title: "My grade requests | Marketplace",
  description: "Track the new grades you have requested.",
};

export default function GradeRequestsPage() {
  return <GradeRequestsList />;
}
