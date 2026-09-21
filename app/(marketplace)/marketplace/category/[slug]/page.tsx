import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketplaceBrowse } from "@/components/marketplace";
import { ROUTES } from "@/constants";
import { getParentCategoryBySlug } from "@/lib/catalog-mapper";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getParentCategoryBySlug(slug);
  return {
    title: category
      ? `${category.name} | Marketplace`
      : "Category | Marketplace",
    description: category?.description,
  };
}

export default async function MarketplaceCategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = getParentCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <MarketplaceBrowse
      initialCategorySlug={slug}
      pageTitle={category.name}
      breadcrumbs={[
        { label: "Marketplace", href: ROUTES.marketplace },
        { label: category.name },
      ]}
    />
  );
}
