import type { Metadata } from "next";
import { GradeDetailPage } from "@/components/marketplace/grades/grade-detail-page";
import { marketplaceGradePath } from "@/constants";
import { fetchPublicGradeTitle } from "@/lib/catalogue-metadata";
import { pageMetadata } from "@/lib/seo";

interface GradeDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GradeDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const gradeName = await fetchPublicGradeTitle(id);
  return pageMetadata({
    title: gradeName ?? "Grade",
    description: gradeName
      ? `${gradeName} on the PolyStoreX grade directory, with live blind offers.`
      : "Grade Master details and live blind offers for this industrial material grade on PolyStoreX.",
    path: marketplaceGradePath(id),
  });
}

export default async function GradeDetailRoute({
  params,
}: GradeDetailRouteProps) {
  const { id } = await params;
  return <GradeDetailPage gradeId={id} />;
}
