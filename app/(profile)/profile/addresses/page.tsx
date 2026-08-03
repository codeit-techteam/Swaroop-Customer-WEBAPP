import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Addresses",
};

export default function Page() {
  return (
    <ModulePage
      title={"Addresses"}
      description={"Business and shipping addresses."}
    />
  );
}
