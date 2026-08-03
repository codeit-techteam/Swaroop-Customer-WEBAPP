import { jsPDF } from "jspdf";
import type { OnboardingState } from "@/types/onboarding";
import {
  CONSTITUTION_OPTIONS,
  INDUSTRY_SECTOR_OPTIONS,
} from "@/constants/onboarding";

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? (value || "—");
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

  y = addSection(
    doc,
    "1. Company Information",
    [
      `Legal Name: ${state.companyInfo.legalName || "—"}`,
      `Constitution: ${labelFor(CONSTITUTION_OPTIONS, state.companyInfo.constitutionType)}`,
      `Industry Sector: ${labelFor(INDUSTRY_SECTOR_OPTIONS, state.companyInfo.industrySector)}`,
      `Registration Number: ${state.companyInfo.registrationNumber || "—"}`,
      `Date of Incorporation: ${state.companyInfo.dateOfIncorporation || "—"}`,
    ],
    y,
  );

  y = addSection(
    doc,
    "2. GST Details",
    [
      `GSTIN: ${state.gstInfo.gstin || "—"}`,
      `Verified: ${state.gstInfo.isVerified ? "Yes" : "No"}`,
      `Registered Entity: ${state.gstInfo.verification?.companyName || "—"}`,
      `Entity Status: ${state.gstInfo.verification?.entityStatus || "—"}`,
      `Registered On: ${state.gstInfo.verification?.registeredOn || "—"}`,
      `PAN (Extracted): ${state.gstInfo.verification?.pan || "—"}`,
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
      : state.shippingAddresses.flatMap((addr, i) => [
          `Terminal ${i + 1}: ${addr.terminalName}`,
          `  Address: ${addr.fullAddress}`,
          `  Contact: ${addr.contactPerson} | ${addr.mobileNumber}`,
        ]);

  y = addSection(doc, "4. Shipping Addresses", shippingLines, y);

  y = addSection(
    doc,
    "5. Credit Request",
    [
      `Audited Financials: ${state.creditDocuments.auditedFinancials?.fileName || "—"}`,
      `Bank Statements: ${state.creditDocuments.bankStatements?.fileName || "—"}`,
      `ITR: ${state.creditDocuments.itr?.fileName || "—"}`,
      `Requested Credit Limit: ${state.creditLimit ? `₹ ${state.creditLimit}` : "Not specified"}`,
    ],
    y,
  );

  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "This document is a frontend-generated summary for review purposes only.",
    20,
    y + 4,
  );

  doc.save("PetroTrade_Onboarding_Submission.pdf");
}
