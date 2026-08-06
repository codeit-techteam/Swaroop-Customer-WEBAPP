import { jsPDF } from "jspdf";
import type { MarketPrice } from "@/types/dashboard";
import { formatInrPerMt, formatPercentChange } from "@/lib/format";

interface MarketReportInput {
  prices: MarketPrice[];
  updatedAt: string;
}

function trendLabel(trend: MarketPrice["trend"]): string {
  if (trend === "up") return "Up";
  if (trend === "down") return "Down";
  return "Flat";
}

export function generateMarketReportPdf({
  prices,
  updatedAt,
}: MarketReportInput): void {
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
  doc.text("Indian Petrochemical Market Report", 20, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${now}`, 20, 40);
  doc.text(`Reference prices last updated at ${updatedAt}`, 20, 46);
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 50, 190, 50);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Executive Summary", 20, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const summary = doc.splitTextToSize(
    "Enterprise-grade procurement insights for global trading partners. " +
      "Prices below reflect indicative INR/MT reference levels across key polymer and petrochemical grades in the Indian market.",
    170,
  );
  doc.text(summary, 20, 70);

  let y = 88;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Grade", 20, y);
  doc.text("Price (INR/MT)", 80, y);
  doc.text("Change", 140, y);
  doc.text("Trend", 168, y);
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  for (const price of prices) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(price.label, 20, y);
    doc.text(formatInrPerMt(price.priceInr), 80, y);
    doc.text(formatPercentChange(price.changePercent), 140, y);
    doc.text(trendLabel(price.trend), 168, y);
    y += 10;
  }

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Disclaimer", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const disclaimer = doc.splitTextToSize(
    "This report is for informational purposes only. Prices are indicative and subject to change based on grade, quantity, delivery terms, and market conditions. " +
      "Contact your account manager for firm quotations.",
    170,
  );
  doc.text(disclaimer, 20, y);

  doc.save("PetroTrade_Market_Report.pdf");
}
