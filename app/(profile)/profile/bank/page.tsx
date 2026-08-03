import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Bank Details",
};

export default function Page() {
  return (
    <ModulePage
      title={"Bank Details"}
      description={"Bank account details for settlements."}
    />
  );
}
