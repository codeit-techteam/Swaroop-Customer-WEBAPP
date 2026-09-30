import type { Metadata } from "next";
import { CustomerKycPage } from "@/components/kyc/CustomerKycPage";

export const metadata: Metadata = {
  title: "Business KYC",
};

export default function Page() {
  return <CustomerKycPage />;
}
