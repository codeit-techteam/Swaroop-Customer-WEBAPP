import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Order Notifications",
};

export default function Page() {
  return (
    <ModulePage
      title={"Order Notifications"}
      description={"Order status alerts."}
    />
  );
}
