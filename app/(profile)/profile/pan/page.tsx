import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "PAN",
};

export default function Page() {
  return <ModulePage title={"PAN"} description={"PAN card details."} />;
}
