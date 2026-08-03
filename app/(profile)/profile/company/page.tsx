import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Company Profile",
};

export default function Page() {
  return (
    <ModulePage
      title={"Company Profile"}
      description={"Legal company information."}
    />
  );
}
