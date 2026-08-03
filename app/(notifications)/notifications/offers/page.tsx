import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Offer Notifications",
};

export default function Page() {
  return (
    <ModulePage
      title={"Offer Notifications"}
      description={"Marketplace offer alerts."}
    />
  );
}
