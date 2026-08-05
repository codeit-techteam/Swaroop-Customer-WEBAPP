/**
 * Frontend-only dummy document downloads for shipment transport docs.
 * Blind marketplace: PetroTrade Logistics branding only.
 */

import type {
  ShipmentRecord,
  TransportDocument,
} from "@/types/shipment-tracking";

function triggerDownload(
  filename: string,
  content: string,
  mime = "text/plain",
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildDocumentContent(
  shipment: ShipmentRecord,
  doc: TransportDocument,
): string {
  return [
    "PETROTRADE LOGISTICS — TRANSPORT DOCUMENT",
    "=========================================",
    "",
    `Document Type : ${doc.title}`,
    `File Name     : ${doc.fileName}`,
    `Status        : ${doc.status}`,
    `Generated     : ${doc.generatedAt ?? "Pending"}`,
    "",
    `Order Number  : ${shipment.orderNumber}`,
    `PO Number     : ${shipment.poNumber}`,
    `Invoice       : ${shipment.invoiceNumber}`,
    `Product       : ${shipment.product} (${shipment.grade})`,
    `Quantity      : ${shipment.quantityMt} MT`,
    `Dispatch Hub  : ${shipment.warehouse}`,
    `Destination   : ${shipment.destination}, ${shipment.destinationState}`,
    `Vehicle       : ${shipment.vehicleNumber}`,
    `Driver        : ${shipment.driverName}`,
    `Logistics     : PetroTrade Logistics`,
    "",
    "This is a frontend demo document. No backend generated.",
    "© PetroTrade Customer Portal",
  ].join("\n");
}

export function downloadTransportDocument(
  shipment: ShipmentRecord,
  doc: TransportDocument,
) {
  if (doc.status === "pending") return;
  triggerDownload(
    doc.fileName.replace(/\.pdf$/i, ".txt"),
    buildDocumentContent(shipment, doc),
  );
}

export function downloadShipmentDocumentsZip(shipment: ShipmentRecord) {
  const ready = shipment.documents.filter((d) => d.status !== "pending");
  if (!ready.length) {
    triggerDownload(
      `${shipment.orderNumber}_documents.txt`,
      `No generated documents yet for ${shipment.orderNumber}.`,
    );
    return;
  }

  const bundle = ready
    .map((doc) => buildDocumentContent(shipment, doc))
    .join("\n\n" + "=".repeat(48) + "\n\n");

  triggerDownload(`${shipment.orderNumber}_transport_documents.txt`, bundle);
}

export function printTransportDocument(
  shipment: ShipmentRecord,
  doc: TransportDocument,
) {
  const content = buildDocumentContent(shipment, doc);
  const win = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=720,height=900",
  );
  if (!win) return;
  win.document.write(`
    <html>
      <head><title>${doc.title} · ${shipment.orderNumber}</title>
      <style>
        body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 32px; white-space: pre-wrap; color: #0f172a; }
        h1 { font-family: system-ui, sans-serif; font-size: 18px; }
      </style>
      </head>
      <body>
        <h1>${doc.title}</h1>
        <pre>${content.replace(/</g, "&lt;")}</pre>
        <script>window.onload = () => { window.print(); }</script>
      </body>
    </html>
  `);
  win.document.close();
}
