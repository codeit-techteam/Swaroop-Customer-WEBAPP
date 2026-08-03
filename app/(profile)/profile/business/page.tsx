import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Business Details",
};

export default function Page() {
  return (
    <ModulePage
      title={"Business Details"}
      description={"Business profile information."}
    />
  );
}
