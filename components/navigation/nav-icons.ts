import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Store,
  Mail,
  Package,
  Wallet,
  Truck,
  FileText,
  Bell,
  User,
  LogOut,
  ShoppingCart,
  LifeBuoy,
  Settings,
  HelpCircle,
} from "lucide-react";

const NAV_ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Store,
  Mail,
  Package,
  Wallet,
  Truck,
  FileText,
  Bell,
  User,
  LogOut,
  ShoppingCart,
  LifeBuoy,
  Settings,
  HelpCircle,
};

export function getNavIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  return NAV_ICON_MAP[name] ?? null;
}
