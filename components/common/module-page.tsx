import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

interface ModulePageProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

/**
 * Lightweight route shell for sidebar destinations.
 * Screens will be filled in module phases — navigation only for now.
 */
export function ModulePage({
  title,
  description = "This screen is ready for module UI. Navigation and routing are wired.",
  breadcrumbs,
}: ModulePageProps) {
  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Module content coming soon
      </div>
    </PageContainer>
  );
}
