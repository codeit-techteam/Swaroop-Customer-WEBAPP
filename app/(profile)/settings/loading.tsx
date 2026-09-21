import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function SettingsLoading() {
  return (
    <PageContainer>
      <ProfilePageSkeleton />
    </PageContainer>
  );
}
