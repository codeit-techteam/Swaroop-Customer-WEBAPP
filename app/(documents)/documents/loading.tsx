import { DocumentsLoadingSkeleton } from "@/components/documents/DocumentsModuleChrome";
import { PageContainer } from "@/components/layout/page-container";

export default function DocumentsLoading() {
  return (
    <PageContainer>
      <DocumentsLoadingSkeleton />
    </PageContainer>
  );
}
