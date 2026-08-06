import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketplaceBrowse } from "@/components/marketplace";
import { ROUTES } from "@/constants";
import { getCategoryBySlug } from "@/mock/categories";
import { marketplaceMock } from "@/mock/marketplace";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return marketplaceMock.categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
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
  const category = getCategoryBySlug(slug);

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
