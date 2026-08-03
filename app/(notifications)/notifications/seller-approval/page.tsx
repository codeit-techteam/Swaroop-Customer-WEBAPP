import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Seller Approval Notifications",
};

export default function Page() {
  return (
    <ModulePage
      title={"Seller Approval Notifications"}
      description={"Alerts when sellers accept or reject requests."}
    />
  );
}
