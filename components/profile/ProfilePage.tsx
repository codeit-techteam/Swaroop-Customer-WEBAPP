"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, LogOut, Pencil } from "lucide-react";
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatMemberSince, resolveMvpProfile } from "@/lib/profile-display";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const company = useProfileStore((s) => s.company);
  const isHydrated = useProfileStore((s) => s.isHydrated);
  const setHydrated = useProfileStore((s) => s.setHydrated);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useProfileStore.persist.onFinishHydration(finish);
    if (useProfileStore.persist.hasHydrated()) finish();
    return unsub;
  }, [setHydrated]);

  const profile = resolveMvpProfile(user, company);

  const handleLogout = () => {
    setLogoutOpen(false);
    logout();
    window.location.href = ROUTES.login;
  };

  if (!isHydrated) {
    return (
      <PageContainer>
        <ProfilePageSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="My Profile"
        description="View and update your basic account information."
      />

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-brand/5 via-white to-slate-50 pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
              ) : null}
              <AvatarFallback className="bg-brand text-xl font-semibold text-white">
                {profile.companyInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <div>
                <CardTitle className="text-xl text-slate-900">
                  {profile.fullName}
                </CardTitle>
                <p className="text-sm text-slate-500">{profile.designation}</p>
                <p className="text-sm font-medium text-slate-700">
                  {profile.companyName}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="info"
                  className="gap-1 rounded-md border border-sky-100 font-medium"
                >
                  <BadgeCheck className="h-3 w-3" />
                  Verified Enterprise
                </Badge>
                {profile.gstVerified ? (
                  <Badge
                    variant="success"
                    className="rounded-md border border-emerald-100 font-medium"
                  >
                    GST Verified ✓
                  </Badge>
                ) : (
                  <Badge
                    variant="warning"
                    className="rounded-md border border-amber-100 font-medium"
                  >
                    GST Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Profile Information
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Full Name" value={profile.fullName} />
              <InfoItem label="Designation" value={profile.designation} />
              <InfoItem label="Company Name" value={profile.companyName} />
              <InfoItem label="Email" value={profile.email} />
              <InfoItem label="Phone" value={profile.phone} />
              <InfoItem
                label="GST Status"
                value={profile.gstVerified ? "Verified" : "Pending"}
              />
            </dl>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Company Information
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Company Name" value={company.legalName} />
              <InfoItem label="Industry" value={company.industry} />
              <InfoItem label="Business Type" value={company.businessType} />
              <InfoItem
                label="Member Since"
                value={formatMemberSince(company.customerSince)}
              />
            </dl>
          </section>

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              className="h-11 rounded-xl bg-brand hover:bg-brand-700"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmationDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Logout?"
        description="You will need to sign in again to access your account."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleLogout}
      />
    </PageContainer>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
