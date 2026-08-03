import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function Page() {
  return (
    <ModulePage
      title={"Checkout"}
      description={"Confirm purchase request details."}
    />
  );
}
