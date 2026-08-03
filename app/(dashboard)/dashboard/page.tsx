import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "PetroTrade Customer Dashboard — market prices, purchase requests, credit, and recommended materials.",
};

export default function DashboardPage() {
  return <CustomerDashboard />;
}
