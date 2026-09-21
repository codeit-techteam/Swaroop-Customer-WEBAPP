import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function ProfileLoading() {
  return (
    <PageContainer>
      <ProfilePageSkeleton />
    </PageContainer>
  );
}
