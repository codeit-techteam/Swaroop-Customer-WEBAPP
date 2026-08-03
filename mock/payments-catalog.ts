/**
 * Payments catalog mock — 30+ payments, 15+ invoices, 15+ receipts.
 * Seeded for enterprise petrochemical B2B procurement demos.
 */

import {
  CREDIT_15_SUMMARY,
  CREDIT_30_SUMMARY,
  PRODUCTS,
  SELLERS,
  WAREHOUSES,
} from "@/constants/payments";
import type {
  CreditSummary,
  InvoiceRecord,
  PaymentNotification,
  PaymentRecord,
  PaymentStatus,
  PaymentTimelineStep,
  PaymentTypeId,
  ReceiptRecord,
  TransferMethodId,
} from "@/types/payments";

const GRADES = ["H030SG", "F20S", "M5018L", "B5502", "S1110", "R01RX"] as const;

function iso(daysAgo: number, hour = 10): string {
  const d = new Date("2026-08-03T10:00:00+05:30");
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 30, 0, 0);
  return d.toISOString();
}

function dueIso(daysFromNow: number): string {
  const d = new Date("2026-08-03T10:00:00+05:30");
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

function money(base: number, qty: number) {
  const amount = Math.round(base * qty);
  const gst = Math.round(amount * 0.18);
  const freight = Math.round(qty * 850);
  const insurance = Math.round(amount * 0.005);
  const totalAmount = amount + gst + freight + insurance;
  return { amount, gst, freight, insurance, totalAmount };
}

function pad(n: number, len = 4) {
  return String(n).padStart(len, "0");
}

function advanceTimeline(
  status: PaymentStatus,
  createdAt: string,
  extras?: Partial<Record<string, string>>,
): PaymentTimelineStep[] {
  const steps: PaymentTimelineStep[] = [
    {
      id: "purchase_request",
      title: "Purchase Request Created",
      status: "completed",
      at: createdAt,
    },
    {
      id: "seller_approved",
      title: "Seller Approved",
      status: "completed",
      at: extras?.approvedAt ?? createdAt,
    },
    {
      id: "order_generated",
      title: "Order Generated",
      status: "completed",
      at: extras?.orderAt ?? createdAt,
    },
    {
      id: "advance_pending",
      title: "Advance Payment Pending",
      status: "upcoming",
    },
    {
      id: "payment_submitted",
      title: "Payment Submitted",
      status: "upcoming",
    },
    {
      id: "utr_uploaded",
      title: "UTR Uploaded",
      status: "upcoming",
    },
    {
      id: "finance_verification",
      title: "Finance Verification",
      status: "upcoming",
    },
    {
      id: "payment_approved",
      title: "Payment Approved",
      status: "upcoming",
    },
    {
      id: "order_processing",
      title: "Order Processing",
      status: "upcoming",
    },
  ];

  const mark = (
    ids: string[],
    statusValue: PaymentTimelineStep["status"],
    at?: string,
  ) => {
    for (const s of steps) {
      if (ids.includes(s.id)) {
        s.status = statusValue;
        if (at) s.at = at;
      }
    }
  };

  if (status === "pending" || status === "pending_payment") {
    mark(["advance_pending"], "current");
  } else if (
    status === "payment_submitted" ||
    status === "verification_pending" ||
    status === "processing"
  ) {
    mark(
      ["advance_pending", "payment_submitted", "utr_uploaded"],
      "completed",
      extras?.submittedAt,
    );
    mark(["finance_verification"], "current");
  } else if (status === "verified" || status === "paid") {
    mark(
      [
        "advance_pending",
        "payment_submitted",
        "utr_uploaded",
        "finance_verification",
        "payment_approved",
        "order_processing",
      ],
      "completed",
      extras?.verifiedAt,
    );
  } else if (status === "rejected" || status === "need_clarification") {
    mark(
      ["advance_pending", "payment_submitted", "utr_uploaded"],
      "completed",
      extras?.submittedAt,
    );
    mark(["finance_verification"], "failed", extras?.rejectedAt);
  } else if (status === "overdue") {
    mark(["advance_pending"], "current");
  } else if (status === "refunded") {
    mark(
      [
        "advance_pending",
        "payment_submitted",
        "utr_uploaded",
        "finance_verification",
        "payment_approved",
      ],
      "completed",
    );
  } else if (status === "cancelled" || status === "failed") {
    mark(["advance_pending"], "failed");
  }

  return steps;
}

function loadingTimeline(
  status: PaymentStatus,
  createdAt: string,
): PaymentTimelineStep[] {
  const base: PaymentTimelineStep[] = [
    {
      id: "order_generated",
      title: "Order Created",
      status: "completed",
      at: createdAt,
    },
    {
      id: "seller_approved",
      title: "Approved",
      status: "completed",
      at: createdAt,
    },
    { id: "loading_started", title: "Loading Started", status: "upcoming" },
    { id: "payment_required", title: "Payment Required", status: "upcoming" },
    { id: "payment_success", title: "Paid", status: "upcoming" },
  ];
  if (status === "pending" || status === "pending_payment") {
    base[2].status = "completed";
    base[3].status = "current";
  } else if (status === "paid" || status === "verified") {
    base.forEach((s) => {
      s.status = "completed";
    });
  } else if (status === "processing" || status === "verification_pending") {
    base[2].status = "completed";
    base[3].status = "completed";
    base[4].status = "current";
  }
  return base;
}

function deliveryTimeline(
  status: PaymentStatus,
  createdAt: string,
): PaymentTimelineStep[] {
  const base: PaymentTimelineStep[] = [
    {
      id: "order_generated",
      title: "Order Generated",
      status: "completed",
      at: createdAt,
    },
    { id: "shipment_arrived", title: "Shipment Arrived", status: "upcoming" },
    { id: "payment_required", title: "Payment Required", status: "upcoming" },
    { id: "payment_success", title: "Paid", status: "upcoming" },
  ];
  if (
    status === "pending" ||
    status === "pending_payment" ||
    status === "overdue"
  ) {
    base[1].status = "completed";
    base[2].status = "current";
  } else if (status === "paid" || status === "verified") {
    base.forEach((s) => {
      s.status = "completed";
    });
  }
  return base;
}

function creditTimeline(
  status: PaymentStatus,
  createdAt: string,
): PaymentTimelineStep[] {
  const base: PaymentTimelineStep[] = [
    {
      id: "order_generated",
      title: "Order Generated",
      status: "completed",
      at: createdAt,
    },
    {
      id: "invoice_generated",
      title: "Invoice Generated",
      status: "completed",
      at: createdAt,
    },
    { id: "payment_required", title: "Credit Outstanding", status: "upcoming" },
    { id: "payment_success", title: "Credit Settled", status: "upcoming" },
  ];
  if (status === "paid" || status === "verified") {
    base.forEach((s) => {
      s.status = "completed";
    });
  } else {
    base[2].status = "current";
  }
  return base;
}

type Seed = {
  n: number;
  type: PaymentTypeId;
  status: PaymentStatus;
  daysAgo: number;
  dueOffset: number;
  qty: number;
  price: number;
  utr?: string;
  method?: TransferMethodId;
  loadingPercent?: number;
  vehicle?: string;
  driver?: string;
  interest?: number;
  verified?: boolean;
  rejected?: boolean;
};

const SEEDS: Seed[] = [
  // Advance — 15 pending / verification, 5 verified
  {
    n: 1,
    type: "advance",
    status: "pending_payment",
    daysAgo: 2,
    dueOffset: 3,
    qty: 25,
    price: 98500,
  },
  {
    n: 2,
    type: "advance",
    status: "pending_payment",
    daysAgo: 1,
    dueOffset: 4,
    qty: 40,
    price: 102500,
  },
  {
    n: 3,
    type: "advance",
    status: "pending_payment",
    daysAgo: 3,
    dueOffset: 1,
    qty: 18,
    price: 87500,
  },
  {
    n: 4,
    type: "advance",
    status: "pending_payment",
    daysAgo: 4,
    dueOffset: 2,
    qty: 50,
    price: 112000,
  },
  {
    n: 5,
    type: "advance",
    status: "pending_payment",
    daysAgo: 0,
    dueOffset: 5,
    qty: 30,
    price: 96500,
  },
  {
    n: 6,
    type: "advance",
    status: "pending_payment",
    daysAgo: 5,
    dueOffset: 0,
    qty: 22,
    price: 88000,
  },
  {
    n: 7,
    type: "advance",
    status: "pending_payment",
    daysAgo: 2,
    dueOffset: 3,
    qty: 35,
    price: 105000,
  },
  {
    n: 8,
    type: "advance",
    status: "pending_payment",
    daysAgo: 6,
    dueOffset: -1,
    qty: 15,
    price: 92000,
  },
  {
    n: 9,
    type: "advance",
    status: "overdue",
    daysAgo: 10,
    dueOffset: -3,
    qty: 28,
    price: 99000,
  },
  {
    n: 10,
    type: "advance",
    status: "verification_pending",
    daysAgo: 1,
    dueOffset: 2,
    qty: 45,
    price: 108000,
    utr: "HDFC24080199871",
    method: "RTGS",
  },
  {
    n: 11,
    type: "advance",
    status: "verification_pending",
    daysAgo: 2,
    dueOffset: 1,
    qty: 20,
    price: 94500,
    utr: "ICIC24080188762",
    method: "NEFT",
  },
  {
    n: 12,
    type: "advance",
    status: "payment_submitted",
    daysAgo: 0,
    dueOffset: 4,
    qty: 32,
    price: 101000,
    utr: "SBI24080166512",
    method: "IMPS",
  },
  {
    n: 13,
    type: "advance",
    status: "need_clarification",
    daysAgo: 3,
    dueOffset: 1,
    qty: 26,
    price: 97000,
    utr: "YES24080123451",
    method: "UPI",
    rejected: true,
  },
  {
    n: 14,
    type: "advance",
    status: "rejected",
    daysAgo: 4,
    dueOffset: 0,
    qty: 12,
    price: 91000,
    utr: "AXIS24080111223",
    method: "NEFT",
    rejected: true,
  },
  {
    n: 15,
    type: "advance",
    status: "pending_payment",
    daysAgo: 1,
    dueOffset: 6,
    qty: 55,
    price: 115000,
  },
  {
    n: 16,
    type: "advance",
    status: "verified",
    daysAgo: 8,
    dueOffset: -5,
    qty: 40,
    price: 106250,
    utr: "HDFC24072544112",
    method: "RTGS",
    verified: true,
  },
  {
    n: 17,
    type: "advance",
    status: "verified",
    daysAgo: 12,
    dueOffset: -8,
    qty: 60,
    price: 98500,
    utr: "ICIC24072033991",
    method: "Corporate Banking",
    verified: true,
  },
  {
    n: 18,
    type: "advance",
    status: "paid",
    daysAgo: 15,
    dueOffset: -10,
    qty: 25,
    price: 102000,
    utr: "SBI24071522881",
    method: "NEFT",
    verified: true,
  },
  {
    n: 19,
    type: "advance",
    status: "verified",
    daysAgo: 18,
    dueOffset: -12,
    qty: 35,
    price: 110000,
    utr: "YES24071211770",
    method: "RTGS",
    verified: true,
  },
  {
    n: 20,
    type: "advance",
    status: "paid",
    daysAgo: 20,
    dueOffset: -14,
    qty: 48,
    price: 94500,
    utr: "HDFC24071000661",
    method: "IMPS",
    verified: true,
  },

  // On Loading
  {
    n: 21,
    type: "on_loading",
    status: "pending_payment",
    daysAgo: 3,
    dueOffset: 1,
    qty: 30,
    price: 98000,
    loadingPercent: 72,
    vehicle: "GJ-06-AB-4421",
    driver: "Ramesh Patel",
  },
  {
    n: 22,
    type: "on_loading",
    status: "pending_payment",
    daysAgo: 2,
    dueOffset: 2,
    qty: 42,
    price: 104500,
    loadingPercent: 45,
    vehicle: "MH-04-CD-8812",
    driver: "Suresh More",
  },
  {
    n: 23,
    type: "on_loading",
    status: "processing",
    daysAgo: 1,
    dueOffset: 1,
    qty: 20,
    price: 91500,
    loadingPercent: 90,
    vehicle: "GJ-16-EF-2201",
    driver: "Vikram Shah",
    utr: "ICIC24080255441",
    method: "NEFT",
  },
  {
    n: 24,
    type: "on_loading",
    status: "paid",
    daysAgo: 7,
    dueOffset: -4,
    qty: 38,
    price: 99500,
    loadingPercent: 100,
    vehicle: "TN-09-GH-3344",
    driver: "Karthik R",
    utr: "HDFC24072777882",
    method: "RTGS",
    verified: true,
  },
  {
    n: 25,
    type: "on_loading",
    status: "overdue",
    daysAgo: 9,
    dueOffset: -2,
    qty: 16,
    price: 87500,
    loadingPercent: 100,
    vehicle: "RJ-14-IJ-5566",
    driver: "Amit Singh",
  },

  // On Delivery
  {
    n: 26,
    type: "on_delivery",
    status: "pending_payment",
    daysAgo: 5,
    dueOffset: 0,
    qty: 28,
    price: 101500,
    vehicle: "GJ-01-KL-7788",
    driver: "Nilesh Desai",
  },
  {
    n: 27,
    type: "on_delivery",
    status: "pending_payment",
    daysAgo: 4,
    dueOffset: 1,
    qty: 33,
    price: 96500,
    vehicle: "MH-12-MN-9900",
    driver: "Prakash Jadhav",
  },
  {
    n: 28,
    type: "on_delivery",
    status: "overdue",
    daysAgo: 12,
    dueOffset: -3,
    qty: 22,
    price: 89000,
    vehicle: "UP-16-OP-1122",
    driver: "Ravi Kumar",
  },
  {
    n: 29,
    type: "on_delivery",
    status: "paid",
    daysAgo: 14,
    dueOffset: -7,
    qty: 45,
    price: 107000,
    vehicle: "WB-23-QR-3344",
    driver: "Subhash Das",
    utr: "SBI24072044556",
    method: "UPI",
    verified: true,
  },
  {
    n: 30,
    type: "on_delivery",
    status: "processing",
    daysAgo: 2,
    dueOffset: 0,
    qty: 19,
    price: 93000,
    vehicle: "GJ-05-ST-5566",
    driver: "Hardik Mehta",
    utr: "YES24080199800",
    method: "IMPS",
  },

  // Credit 15
  {
    n: 31,
    type: "credit_15",
    status: "pending",
    daysAgo: 8,
    dueOffset: 7,
    qty: 50,
    price: 98500,
    interest: 1.5,
  },
  {
    n: 32,
    type: "credit_15",
    status: "pending",
    daysAgo: 10,
    dueOffset: 5,
    qty: 35,
    price: 102000,
    interest: 1.5,
  },
  {
    n: 33,
    type: "credit_15",
    status: "overdue",
    daysAgo: 25,
    dueOffset: -2,
    qty: 28,
    price: 94000,
    interest: 1.5,
  },
  {
    n: 34,
    type: "credit_15",
    status: "paid",
    daysAgo: 30,
    dueOffset: -12,
    qty: 40,
    price: 110000,
    interest: 1.5,
    utr: "HDFC24070311223",
    method: "NEFT",
    verified: true,
  },
  {
    n: 35,
    type: "credit_15",
    status: "pending",
    daysAgo: 6,
    dueOffset: 9,
    qty: 22,
    price: 87500,
    interest: 1.5,
  },

  // Credit 30
  {
    n: 36,
    type: "credit_30",
    status: "pending",
    daysAgo: 12,
    dueOffset: 18,
    qty: 60,
    price: 106000,
    interest: 2.5,
  },
  {
    n: 37,
    type: "credit_30",
    status: "pending",
    daysAgo: 15,
    dueOffset: 15,
    qty: 45,
    price: 99000,
    interest: 2.5,
  },
  {
    n: 38,
    type: "credit_30",
    status: "overdue",
    daysAgo: 40,
    dueOffset: -5,
    qty: 30,
    price: 92500,
    interest: 2.5,
  },
  {
    n: 39,
    type: "credit_30",
    status: "paid",
    daysAgo: 45,
    dueOffset: -10,
    qty: 55,
    price: 114000,
    interest: 2.5,
    utr: "ICIC24062088776",
    method: "Corporate Banking",
    verified: true,
  },
  {
    n: 40,
    type: "credit_30",
    status: "pending",
    daysAgo: 5,
    dueOffset: 25,
    qty: 38,
    price: 101500,
    interest: 2.5,
  },

  // Extra diversity
  {
    n: 41,
    type: "advance",
    status: "refunded",
    daysAgo: 22,
    dueOffset: -18,
    qty: 10,
    price: 88000,
    utr: "HDFC24071233445",
    method: "NEFT",
    verified: true,
  },
  {
    n: 42,
    type: "advance",
    status: "cancelled",
    daysAgo: 9,
    dueOffset: -2,
    qty: 14,
    price: 91000,
  },
  {
    n: 43,
    type: "on_loading",
    status: "failed",
    daysAgo: 6,
    dueOffset: -1,
    qty: 24,
    price: 96000,
    loadingPercent: 60,
    vehicle: "GJ-07-UV-7788",
    driver: "Jignesh Parmar",
  },
];

function buildPayment(seed: Seed): PaymentRecord {
  const idx = seed.n - 1;
  const product = PRODUCTS[idx % PRODUCTS.length];
  const seller = SELLERS[idx % SELLERS.length];
  const warehouse = WAREHOUSES[idx % WAREHOUSES.length];
  const grade = GRADES[idx % GRADES.length];
  const createdAt = iso(seed.daysAgo, 9);
  const dueDate =
    seed.dueOffset >= 0
      ? dueIso(seed.dueOffset)
      : iso(Math.abs(seed.dueOffset), 18);
  const { amount, gst, freight, insurance, totalAmount } = money(
    seed.price,
    seed.qty,
  );

  const orderNumber = `PT-ORD-2026-${pad(seed.n + 100)}`;
  const poNumber = `PO-2026-${pad(seed.n + 200)}`;
  const paymentId = `PAY-2026-${pad(seed.n + 500)}`;
  const invoiceNumber = `INV-2026-${pad(seed.n + 300)}`;

  const isSettled =
    seed.status === "paid" ||
    seed.status === "verified" ||
    seed.status === "refunded" ||
    seed.verified === true;

  const amountPaid = isSettled
    ? totalAmount
    : seed.status === "verification_pending" ||
        seed.status === "payment_submitted" ||
        seed.status === "processing"
      ? totalAmount
      : 0;

  let timeline: PaymentTimelineStep[];
  if (seed.type === "advance") {
    timeline = advanceTimeline(seed.status, createdAt, {
      submittedAt: seed.utr ? iso(seed.daysAgo - 0.5, 14) : undefined,
      verifiedAt: seed.verified
        ? iso(Math.max(0, seed.daysAgo - 1), 16)
        : undefined,
      rejectedAt: seed.rejected
        ? iso(Math.max(0, seed.daysAgo - 1), 15)
        : undefined,
    });
  } else if (seed.type === "on_loading") {
    timeline = loadingTimeline(seed.status, createdAt);
  } else if (seed.type === "on_delivery") {
    timeline = deliveryTimeline(seed.status, createdAt);
  } else {
    timeline = creditTimeline(seed.status, createdAt);
  }

  const record: PaymentRecord = {
    id: paymentId,
    paymentId,
    orderNumber,
    poNumber,
    product,
    productGrade: grade,
    seller,
    warehouse,
    quantityMt: seed.qty,
    paymentType: seed.type,
    amount,
    gst,
    freight,
    insurance,
    totalAmount,
    advancePercent: seed.type === "advance" ? 100 : undefined,
    amountPaid,
    remainingBalance: Math.max(0, totalAmount - amountPaid),
    status: seed.status,
    paymentDate:
      isSettled || amountPaid > 0
        ? iso(Math.max(0, seed.daysAgo - 1), 14)
        : undefined,
    dueDate,
    transactionId:
      seed.utr || isSettled ? `TXN${pad(seed.n + 9000, 8)}` : undefined,
    invoiceNumber,
    paymentReference:
      seed.utr || isSettled ? `REF-${pad(seed.n + 700)}` : undefined,
    utrNumber: seed.utr,
    paymentMethod: seed.method,
    receiptNumber: isSettled ? `RCT-2026-${pad(seed.n + 400)}` : undefined,
    verifiedBy: seed.verified ? "Priya Sharma · Finance" : undefined,
    verifiedAt: seed.verified
      ? iso(Math.max(0, seed.daysAgo - 1), 16)
      : undefined,
    verificationNotes: seed.verified
      ? "UTR matched with bank statement. Amount verified."
      : seed.rejected
        ? "Verification failed — please resubmit proof."
        : undefined,
    interest: seed.interest
      ? Math.round(totalAmount * (seed.interest / 100))
      : undefined,
    loadingPercent: seed.loadingPercent,
    vehicleNumber: seed.vehicle,
    driverName: seed.driver,
    dispatchEta:
      seed.type === "on_loading" || seed.type === "on_delivery"
        ? dueIso(seed.dueOffset < 0 ? 1 : seed.dueOffset + 1)
        : undefined,
    deliveryDate:
      seed.type === "on_delivery"
        ? seed.status === "paid"
          ? iso(Math.max(0, seed.daysAgo - 2), 11)
          : dueIso(0)
        : undefined,
    shipmentStatus:
      seed.type === "on_delivery"
        ? seed.status === "paid"
          ? "Delivered"
          : seed.status === "overdue"
            ? "Delivered — Payment Overdue"
            : "Arrived at Destination"
        : seed.type === "on_loading"
          ? seed.loadingPercent === 100
            ? "Loading Complete"
            : "Loading in Progress"
          : undefined,
    createdAt,
    updatedAt: iso(Math.max(0, seed.daysAgo - 1), 16),
    timeline,
  };

  if (seed.utr) {
    record.proof = {
      transactionType: seed.method ?? "NEFT",
      utr: seed.utr,
      transactionDate: iso(Math.max(0, seed.daysAgo), 11).slice(0, 10),
      transactionTime: "14:35",
      paidAmount: totalAmount,
      remarks: "Corporate treasury transfer",
      screenshot: {
        fileName: `utr-${seed.utr}.png`,
        fileType: "image/png",
        fileSize: 245_000,
        uploadedAt: iso(Math.max(0, seed.daysAgo), 14),
      },
      submittedAt: iso(Math.max(0, seed.daysAgo), 14),
    };
  }

  if (seed.rejected) {
    record.rejection = {
      reason:
        seed.status === "need_clarification"
          ? "screenshot_blurry"
          : "utr_not_found",
      message:
        seed.status === "need_clarification"
          ? "The uploaded screenshot is blurry. Please upload a clearer bank advice."
          : "The UTR provided does not match our bank records. Please verify and resubmit.",
      rejectedAt: iso(Math.max(0, seed.daysAgo - 1), 15),
      rejectedBy: "Finance Ops",
    };
  }

  return record;
}

export const paymentsCatalogMock: PaymentRecord[] = SEEDS.map(buildPayment);

export const invoicesCatalogMock: InvoiceRecord[] = paymentsCatalogMock
  .filter((p) => p.invoiceNumber)
  .slice(0, 22)
  .map((p) => ({
    id: `INV-REC-${p.id}`,
    invoiceNumber: p.invoiceNumber!,
    orderNumber: p.orderNumber,
    poNumber: p.poNumber,
    paymentId: p.paymentId,
    product: p.product,
    seller: p.seller,
    warehouse: p.warehouse,
    amount: p.amount,
    gst: p.gst,
    freight: p.freight,
    insurance: p.insurance,
    totalAmount: p.totalAmount,
    issueDate: p.createdAt,
    status:
      p.status === "paid" || p.status === "verified"
        ? "paid"
        : p.status === "overdue"
          ? "overdue"
          : p.status === "cancelled"
            ? "cancelled"
            : "issued",
    paymentType: p.paymentType,
    advancePaymentStatus: p.paymentType === "advance" ? p.status : undefined,
    transactionId: p.transactionId,
    utrNumber: p.utrNumber,
    verificationDate: p.verifiedAt,
  }));

export const receiptsCatalogMock: ReceiptRecord[] = paymentsCatalogMock
  .filter((p) => p.receiptNumber && p.transactionId)
  .map((p) => ({
    id: `RCT-REC-${p.id}`,
    receiptNumber: p.receiptNumber!,
    paymentId: p.paymentId,
    orderNumber: p.orderNumber,
    poNumber: p.poNumber,
    invoiceNumber: p.invoiceNumber,
    transactionId: p.transactionId!,
    utrNumber: p.utrNumber,
    amount: p.amount,
    gst: p.gst,
    totalAmount: p.totalAmount,
    paymentMethod: p.paymentMethod ?? "NEFT",
    paymentType: p.paymentType,
    paymentDate: p.paymentDate ?? p.updatedAt,
    verificationDate: p.verifiedAt,
    status: "generated" as const,
    seller: p.seller,
    warehouse: p.warehouse,
  }));

export const paymentNotificationsMock: PaymentNotification[] = [
  {
    id: "pn-1",
    type: "advance_due",
    title: "Advance Payment Due",
    message: "Advance payment for PT-ORD-2026-0101 is due in 3 days.",
    paymentId: "PAY-2026-0501",
    orderNumber: "PT-ORD-2026-0101",
    createdAt: iso(0, 9),
    read: false,
  },
  {
    id: "pn-2",
    type: "credit_due_tomorrow",
    title: "Credit Due Tomorrow",
    message: "Credit 15 Days payment for PT-ORD-2026-0133 is due tomorrow.",
    paymentId: "PAY-2026-0533",
    orderNumber: "PT-ORD-2026-0133",
    createdAt: iso(0, 8),
    read: false,
  },
  {
    id: "pn-3",
    type: "payment_successful",
    title: "Payment Successful",
    message: "Advance payment PAY-2026-0516 has been verified successfully.",
    paymentId: "PAY-2026-0516",
    orderNumber: "PT-ORD-2026-0116",
    createdAt: iso(1, 16),
    read: true,
  },
  {
    id: "pn-4",
    type: "invoice_ready",
    title: "Invoice Ready",
    message: "Invoice INV-2026-0310 is ready for download.",
    paymentId: "PAY-2026-0510",
    orderNumber: "PT-ORD-2026-0110",
    createdAt: iso(1, 12),
    read: false,
  },
  {
    id: "pn-5",
    type: "receipt_generated",
    title: "Receipt Generated",
    message: "Receipt RCT-2026-0418 has been generated for your payment.",
    paymentId: "PAY-2026-0518",
    orderNumber: "PT-ORD-2026-0118",
    createdAt: iso(2, 17),
    read: true,
  },
  {
    id: "pn-6",
    type: "verification_pending",
    title: "Verification Pending",
    message: "Your UTR for PAY-2026-0510 is under finance verification.",
    paymentId: "PAY-2026-0510",
    orderNumber: "PT-ORD-2026-0110",
    createdAt: iso(0, 15),
    read: false,
  },
  {
    id: "pn-7",
    type: "payment_rejected",
    title: "Payment Rejected",
    message:
      "Payment proof for PAY-2026-0514 was rejected. Please upload again.",
    paymentId: "PAY-2026-0514",
    orderNumber: "PT-ORD-2026-0114",
    createdAt: iso(1, 15),
    read: false,
  },
  {
    id: "pn-8",
    type: "payment_verified",
    title: "Advance Payment Verified",
    message: "PAY-2026-0517 verified. Order moved to processing.",
    paymentId: "PAY-2026-0517",
    orderNumber: "PT-ORD-2026-0117",
    createdAt: iso(3, 16),
    read: true,
  },
];

export function computeCredit15Summary(
  payments: PaymentRecord[],
): CreditSummary {
  const credit = payments.filter((p) => p.paymentType === "credit_15");
  const outstanding = credit
    .filter(
      (p) => !["paid", "verified", "cancelled", "refunded"].includes(p.status),
    )
    .reduce((s, p) => s + p.remainingBalance, 0);
  const limit = CREDIT_15_SUMMARY.creditLimit;
  const used = outstanding;
  return {
    availableCredit: Math.max(0, limit - used),
    usedCredit: used,
    remainingCredit: Math.max(0, limit - used),
    creditLimit: limit,
    paymentDueDate: credit.find(
      (p) => p.status === "pending" || p.status === "overdue",
    )?.dueDate,
    countdownDays: 7,
    utilizationPercent: Math.round((used / limit) * 100),
    outstanding,
  };
}

export function computeCredit30Summary(
  payments: PaymentRecord[],
): CreditSummary {
  const credit = payments.filter((p) => p.paymentType === "credit_30");
  const outstanding = credit
    .filter(
      (p) => !["paid", "verified", "cancelled", "refunded"].includes(p.status),
    )
    .reduce((s, p) => s + p.remainingBalance, 0);
  const limit = CREDIT_30_SUMMARY.creditLimit;
  const used = outstanding;
  return {
    availableCredit: Math.max(0, limit - used),
    usedCredit: used,
    remainingCredit: Math.max(0, limit - used),
    creditLimit: limit,
    paymentDueDate: credit.find(
      (p) => p.status === "pending" || p.status === "overdue",
    )?.dueDate,
    countdownDays: 15,
    utilizationPercent: Math.round((used / limit) * 100),
    nextBillingCycle: dueIso(18),
    outstanding,
  };
}

export const DEFAULT_PAYMENTS_FILTERS = {
  search: "",
  status: "all" as const,
  paymentType: "all" as const,
  warehouse: "all" as const,
  seller: "all" as const,
  dateFrom: "",
  dateTo: "",
  sortBy: "dueDate" as const,
  sortDir: "asc" as const,
};
