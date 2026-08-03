import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return (
    <ModulePage
      title={"Notifications"}
      description={
        "Purchase requests, seller approvals, orders, payments, and offers."
      }
    />
  );
}
