import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Support",
};

export default function Page() {
  return (
    <ModulePage
      title={"Support"}
      description={"Help center and customer support."}
    />
  );
}
