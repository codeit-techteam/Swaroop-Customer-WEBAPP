import { jsPDF } from "jspdf";
import type { OnboardingState } from "@/types/onboarding";
import { INDUSTRY_SECTOR_OPTIONS } from "@/constants/onboarding";

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function formatCreditLimit(value: string): string {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  if (!amount) return "Not specified";
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function addSection(
  doc: jsPDF,
  title: string,
  lines: string[],
  startY: number,
): number {
  let y = startY;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  for (const line of lines) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    const wrapped = doc.splitTextToSize(line, 170);
    doc.text(wrapped, 20, y);
    y += wrapped.length * 5 + 2;
  }

  return y + 6;
}

export function generateOnboardingPdf(state: OnboardingState): void {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(11, 46, 89);
  doc.text("PetroTrade Portal", 20, 22);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Customer Onboarding Submission Summary", 20, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${now}`, 20, 40);
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 44, 190, 44);

  let y = 54;

  const companyLines = [
    `Legal Name: ${state.companyInfo.legalName || "—"}`,
    ...(state.companyInfo.industrySector
      ? [
          `Industry Sector: ${labelFor(INDUSTRY_SECTOR_OPTIONS, state.companyInfo.industrySector)}`,
        ]
      : []),
    ...(state.companyInfo.registrationNumber
      ? [`Registration Number: ${state.companyInfo.registrationNumber}`]
      : []),
  ];

  y = addSection(doc, "1. Company Information", companyLines, y);

  y = addSection(
    doc,
    "2. GST Details",
    [
      `GSTIN: ${state.gstInfo.gstin || "—"}`,
      `Verified: ${state.gstInfo.isVerified ? "Yes" : "No"}`,
      `Registered Entity: ${state.gstInfo.verification?.companyName || "—"}`,
      `Entity Status: ${state.gstInfo.verification?.entityStatus || "—"}`,
      `Registered On: ${state.gstInfo.verification?.registeredOn || "—"}`,
      `Certificate: ${state.gstInfo.certificateFileName || "—"}`,
    ],
    y,
  );

  const ba = state.businessAddress;
  y = addSection(
    doc,
    "3. Business Address",
    [
      `Address Line 1: ${ba.addressLine1 || "—"}`,
      `Address Line 2: ${ba.addressLine2 || "—"}`,
      `Pincode: ${ba.pincode || "—"}`,
      `City: ${ba.city || "—"}`,
      `State: ${ba.state || "—"}`,
      `Country: ${ba.country || "—"}`,
    ],
    y,
  );

  const shippingLines =
    state.shippingAddresses.length === 0
      ? ["No shipping addresses added."]
      : state.shippingAddresses.map(
          (addr, i) => `Address ${i + 1}: ${addr.fullAddress}`,
        );

  y = addSection(doc, "4. Shipping Addresses", shippingLines, y);

  addSection(
    doc,
    "5. Credit Request",
    [
      `Bank Statements: ${state.creditDocuments.bankStatements?.fileName || "—"}`,
      `ITR: ${state.creditDocuments.itr?.fileName || "—"}`,
      `Requested Credit Limit: ${formatCreditLimit(state.creditLimit)}`,
    ],
    y,
  );

  doc.save("PetroTrade_Onboarding_Submission.pdf");
}
