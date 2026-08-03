import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Purchase Request Notifications",
};

export default function Page() {
  return (
    <ModulePage
      title={"Purchase Request Notifications"}
      description={"Alerts related to purchase requests."}
    />
  );
}
