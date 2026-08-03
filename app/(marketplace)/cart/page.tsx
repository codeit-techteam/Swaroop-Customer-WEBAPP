import type { Metadata } from "next";
import { ModulePage } from "@/components/common/module-page";

export const metadata: Metadata = {
  title: "Cart",
};

export default function Page() {
  return (
    <ModulePage
      title={"Cart"}
      description={"Review items before creating a purchase request."}
    />
  );
}
