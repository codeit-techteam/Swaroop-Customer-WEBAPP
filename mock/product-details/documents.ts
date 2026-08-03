import type { ComplianceDocument } from "@/types/product-details";

export const DEFAULT_COMPLIANCE_DOCUMENTS: ComplianceDocument[] = [
  {
    id: "doc-coa",
    type: "coa",
    title: "Certificate of Analysis (COA)",
    description: "Batch-level quality analysis report.",
    fileName: "COA-SPEC.pdf",
  },
  {
    id: "doc-msds",
    type: "msds",
    title: "Material Safety Data Sheet",
    description: "Handling, storage and safety guidelines.",
    fileName: "MSDS.pdf",
  },
  {
    id: "doc-iso",
    type: "iso",
    title: "ISO Certificate",
    description: "ISO 9001 quality management certification.",
    fileName: "ISO-9001.pdf",
  },
  {
    id: "doc-test",
    type: "test_certificate",
    title: "Test Certificate",
    description: "Third-party laboratory test certificate.",
    fileName: "Test-Certificate.pdf",
  },
  {
    id: "doc-quality",
    type: "quality_report",
    title: "Quality Report",
    description: "Plant quality assurance summary.",
    fileName: "Quality-Report.pdf",
  },
];
