import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile";

export const metadata: Metadata = {
  title: "My Profile",
};

export default function Page() {
  return <ProfilePage />;
}
