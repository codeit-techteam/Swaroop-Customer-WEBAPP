import type { Metadata } from "next";
import { GradeRequestDetail } from "@/components/grade-requests/grade-request-detail";

export const metadata: Metadata = {
  title: "Grade request | Marketplace",
};

export default async function GradeRequestRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GradeRequestDetail id={id} />;
}
