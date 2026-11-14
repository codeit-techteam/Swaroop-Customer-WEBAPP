import type { Metadata } from "next";
import { GradeDetailPage } from "@/components/marketplace/grades/grade-detail-page";
import { marketplaceGradePath } from "@/constants";
import { pageMetadata } from "@/lib/seo";

interface GradeDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GradeDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: "Grade Details",
    description:
      "Grade Master details and live blind offers for this industrial material grade on PolyStoreX.",
    path: marketplaceGradePath(id),
  });
}

export default async function GradeDetailRoute({
  params,
}: GradeDetailRouteProps) {
  const { id } = await params;
  return <GradeDetailPage gradeId={id} />;
}
