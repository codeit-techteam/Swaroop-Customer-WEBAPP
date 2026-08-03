import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "GST",
};

export default function Page() {
  return <ModulePage title={"GST"} description={"GST registration details."} />;
}
