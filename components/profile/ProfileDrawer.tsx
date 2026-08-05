"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  BadgeCheck,
  CreditCard,
  FileText,
  Headphones,
  LogOut,
  Package,
  Truck,
  User,
} from "lucide-react";
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatMemberSince, resolveMvpProfile } from "@/lib/profile-display";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_ACTIONS: {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    id: "view-profile",
    label: "View Profile",
    href: ROUTES.profile,
    icon: User,
  },
  {
    id: "orders",
    label: "My Orders",
    href: ROUTES.orders,
    icon: Package,
  },
  {
    id: "documents",
    label: "My Documents",
    href: ROUTES.documents,
    icon: FileText,
  },
  {
    id: "payments",
    label: "Payments",
    href: ROUTES.payments,
    icon: CreditCard,
  },
  {
    id: "shipment",
    label: "Shipment Tracking",
    href: ROUTES.shipmentTracking,
    icon: Truck,
  },
  {
    id: "support",
    label: "Support",
    href: ROUTES.support,
    icon: Headphones,
  },
];

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const company = useProfileStore((s) => s.company);
  const setHydrated = useProfileStore((s) => s.setHydrated);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useProfileStore.persist.onFinishHydration(finish);
    if (useProfileStore.persist.hasHydrated()) finish();
    return unsub;
  }, [setHydrated]);

  const profile = resolveMvpProfile(user, company);

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const handleLogout = () => {
    setLogoutOpen(false);
    onOpenChange(false);
    logout();
    window.location.href = ROUTES.login;
  };

  const body = (
    <ProfileDrawerBody
      profile={profile}
      onNavigate={navigate}
      onLogout={() => setLogoutOpen(true)}
    />
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[92vh] gap-0 p-0">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Account</DrawerTitle>
              <DrawerDescription>Profile and quick actions</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto pb-6">{body}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side="right"
            className="w-[min(100vw,400px)] gap-0 overflow-y-auto p-0 sm:max-w-[400px]"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Account</SheetTitle>
              <SheetDescription>Profile and quick actions</SheetDescription>
            </SheetHeader>
            {body}
          </SheetContent>
        </Sheet>
      )}

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
    </>
  );
}

function ProfileDrawerBody({
  profile,
  onNavigate,
  onLogout,
}: {
  profile: ReturnType<typeof resolveMvpProfile>;
  onNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-100 bg-gradient-to-br from-brand/5 via-white to-slate-50 px-5 pb-5 pt-6">
        <div className="flex items-start gap-3.5">
          <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
            ) : null}
            <AvatarFallback className="bg-brand text-base font-semibold text-white">
              {profile.companyInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div>
              <p className="truncate text-base font-semibold text-slate-900">
                {profile.fullName}
              </p>
              <p className="truncate text-sm text-slate-500">
                {profile.designation}
              </p>
              <p className="truncate text-sm font-medium text-slate-700">
                {profile.companyName}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="info"
                className="gap-1 rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 font-medium"
              >
                <BadgeCheck className="h-3 w-3" />
                Verified Enterprise
              </Badge>
              {profile.gstVerified ? (
                <Badge
                  variant="success"
                  className="rounded-md border border-emerald-100 px-2 py-0.5 font-medium"
                >
                  GST Verified ✓
                </Badge>
              ) : (
                <Badge
                  variant="warning"
                  className="rounded-md border border-amber-100 px-2 py-0.5 font-medium"
                >
                  GST Pending
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-b border-slate-100 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Profile Summary
        </p>
        <dl className="space-y-2.5 text-sm">
          <SummaryRow label="Email" value={profile.email} />
          <SummaryRow label="Mobile" value={profile.phone} />
          <SummaryRow
            label="GST Status"
            value={profile.gstVerified ? "Verified" : "Pending"}
          />
          <SummaryRow
            label="Member Since"
            value={formatMemberSince(profile.memberSince)}
          />
        </dl>
      </div>

      <div className="px-3 py-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Quick Actions
        </p>
        <nav className="flex flex-col gap-0.5" aria-label="Profile shortcuts">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.href)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700",
                  "transition-colors hover:bg-slate-50 hover:text-brand",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Icon className="h-4 w-4" />
                </span>
                {action.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-100 px-5 py-4">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-start gap-3 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="truncate text-right font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}
