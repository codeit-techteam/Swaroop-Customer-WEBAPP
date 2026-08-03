import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Profile",
};

export default function Page() {
  return (
    <ModulePage
      title={"Profile"}
      description={"Company profile, GST, PAN, addresses, and settings."}
    />
  );
}
