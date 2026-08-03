import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Page() {
  return (
    <ModulePage
      title={"Settings"}
      description={"Account and notification preferences."}
    />
  );
}
