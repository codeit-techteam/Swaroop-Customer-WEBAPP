import type { AuthUser } from "@/store/authStore";
import type { CompanyProfile } from "@/types/profile";

export interface MvpProfileView {
  fullName: string;
  designation: string;
  companyName: string;
  email: string;
  phone: string;
  gstVerified: boolean;
  memberSince: string;
  avatarUrl: string | null;
  companyInitials: string;
  userInitials: string;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PT";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function formatMemberSince(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function resolveMvpProfile(
  user: AuthUser | null,
  company: CompanyProfile,
): MvpProfileView {
  const fullName = user?.name?.trim() || "Swaroop";
  const companyName =
    company.legalName || company.tradeName || user?.companyName?.trim() || "";
  const designation =
    user?.designation?.trim() || user?.role?.trim() || "Procurement Manager";

  return {
    fullName,
    designation,
    companyName,
    email: user?.email?.trim() || company.email,
    phone: user?.phone?.trim() || company.phone,
    gstVerified: company.gstVerified,
    memberSince: company.customerSince,
    avatarUrl: user?.avatarUrl ?? null,
    companyInitials: company.logoInitials || getInitials(companyName),
    userInitials: getInitials(fullName),
  };
}
