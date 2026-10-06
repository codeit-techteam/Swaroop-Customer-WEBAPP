import type { Metadata } from "next";
import { GradeDetailPage } from "@/components/marketplace/grades/grade-detail-page";

interface GradeDetailRouteProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Grade Details | Marketplace",
  description: "Grade Master details and live blind offers for this grade.",
};

export default async function GradeDetailRoute({
  params,
}: GradeDetailRouteProps) {
  const { id } = await params;
  return <GradeDetailPage gradeId={id} />;
}
