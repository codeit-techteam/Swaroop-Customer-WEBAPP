/**
 * Shipment Tracking mock catalog — MVP status/stage-based logistics demos.
 * Single source of truth for list KPIs, filters, cards, and details.
 */

import {
  DEFAULT_SHIPMENT_FILTERS,
  MVP_SHIPMENT_TIMELINE,
  type DeliveryUpdate,
  type RouteStop,
  type ShipmentNotification,
  type ShipmentRecord,
  type ShipmentStatus,
  type ShipmentTimelineStage,
  type TimelineStageStatus,
  type TransportDocument,
} from "@/types/shipment-tracking";
import {
  shipmentProgressPercent,
  shipmentStatusTimelineIndex,
} from "@/lib/shipment-mvp";

export { DEFAULT_SHIPMENT_FILTERS };
export { computeShipmentSummary } from "@/lib/shipment-mvp";

const PRODUCTS = [
  { name: "Polypropylene Homopolymer", grade: "H030SG" },
  { name: "HDPE Blow Moulding", grade: "B5502" },
  { name: "LLDPE Film Grade", grade: "F20S" },
  { name: "PVC Suspension Resin", grade: "S1110" },
  { name: "PET Bottle Grade", grade: "M5018L" },
  { name: "LDPE Injection", grade: "R01RX" },
] as const;

const SELLERS = [
  "PetroTrade Supply Network",
  "West India Hub",
  "East India Hub",
  "North India Hub",
  "Coastal Hub",
  "Verified Supply Network",
] as const;

const DRIVERS = [
  {
    name: "Ramesh Patel",
    mobile: "+91 98765 43210",
    license: "GJ-2021-884421",
  },
  {
    name: "Mukesh Sharma",
    mobile: "+91 98234 55667",
    license: "RJ-2019-772103",
  },
  {
    name: "Amit Yadav",
    mobile: "+91 97654 88901",
    license: "MH-2020-551908",
  },
  {
    name: "Suresh Kumar",
    mobile: "+91 99112 33445",
    license: "HR-2018-441200",
  },
  {
    name: "Vikram Singh",
    mobile: "+91 98877 66554",
    license: "UP-2022-990331",
  },
] as const;

function iso(daysAgo: number, hour = 10, minute = 30): string {
  const d = new Date("2026-08-05T10:00:00+05:30");
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function etaIso(daysFromNow: number, hour = 16): string {
  const d = new Date("2026-08-05T10:00:00+05:30");
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

function dateParts(isoStr: string | null): {
  date: string | null;
  time: string | null;
} {
  if (!isoStr) return { date: null, time: null };
  const d = new Date(isoStr);
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function stageStatus(index: number, currentIndex: number): TimelineStageStatus {
  if (index < currentIndex) return "completed";
  if (index === currentIndex) return "current";
  return "pending";
}

/** Build the 6-stage MVP timeline from shipment status. */
export function buildMvpTimeline(
  status: ShipmentStatus,
  createdAt: string,
  dispatchDate: string | null,
): ShipmentTimelineStage[] {
  const currentIndex = shipmentStatusTimelineIndex(status);
  const base = new Date(createdAt);

  const offsetsHours = [0, 12, 28, 40, 60, 72];

  return MVP_SHIPMENT_TIMELINE.map((def, index) => {
    const st = stageStatus(index, currentIndex);
    let at: string | null = null;

    if (st !== "pending") {
      if (def.id === "dispatched" && dispatchDate) {
        at = dispatchDate;
      } else {
        const d = new Date(base);
        d.setHours(d.getHours() + offsetsHours[index]);
        at = d.toISOString();
      }
    }

    const parts = dateParts(at);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      date: parts.date,
      time: parts.time,
      timestamp: at,
      status: st,
      icon: def.icon,
    };
  });
}

function buildRoute(cities: string[], currentIndex: number): RouteStop[] {
  return cities.map((city, index) => ({
    city,
    status: stageStatus(index, currentIndex),
    arrivedAt:
      index <= currentIndex
        ? iso(Math.max(0, cities.length - index), 11 + index)
        : null,
  }));
}

function buildDocuments(
  orderNumber: string,
  status: ShipmentStatus,
): TransportDocument[] {
  const advanced = status !== "ready_for_dispatch";
  const delivered = status === "delivered";
  const types: Array<{
    type: TransportDocument["type"];
    title: string;
    ready: boolean;
  }> = [
    { type: "invoice", title: "Tax Invoice", ready: true },
    { type: "eway_bill", title: "E-Way Bill", ready: advanced },
    { type: "delivery_challan", title: "Delivery Challan", ready: advanced },
    { type: "lr_copy", title: "LR Copy", ready: advanced },
    { type: "packing_list", title: "Packing List", ready: true },
    {
      type: "transport_receipt",
      title: "Transport Receipt",
      ready: delivered || status === "out_for_delivery",
    },
  ];

  return types.map((t, i) => ({
    id: `${orderNumber}-DOC-${i + 1}`,
    type: t.type,
    title: t.title,
    fileName: `${orderNumber}_${t.type}.pdf`,
    status: !t.ready ? "pending" : i % 3 === 0 ? "downloaded" : "generated",
    generatedAt: t.ready ? iso(2, 9, 15) : null,
    sizeKb: 120 + i * 37,
  }));
}

function buildUpdates(
  shipmentId: string,
  orderNumber: string,
  driver: string,
  status: ShipmentStatus,
  warehouse: string,
): DeliveryUpdate[] {
  const base: DeliveryUpdate[] = [
    {
      id: `${shipmentId}-u1`,
      shipmentId,
      orderNumber,
      message: `Shipment staged at ${warehouse} warehouse`,
      date: "03/08/2026",
      time: "10:20",
      type: "info",
      driver,
      location: warehouse,
    },
  ];

  if (status !== "ready_for_dispatch") {
    base.push({
      id: `${shipmentId}-u2`,
      shipmentId,
      orderNumber,
      message: "Shipment dispatched from warehouse",
      date: "04/08/2026",
      time: "14:15",
      type: "info",
      driver,
      location: warehouse,
    });
  }

  if (
    status === "in_transit" ||
    status === "out_for_delivery" ||
    status === "delivered"
  ) {
    base.push({
      id: `${shipmentId}-u3`,
      shipmentId,
      orderNumber,
      message: "Shipment moved to In Transit",
      date: "05/08/2026",
      time: "08:40",
      type: "checkpoint",
      driver,
    });
  }

  if (status === "out_for_delivery" || status === "delivered") {
    base.push({
      id: `${shipmentId}-u4`,
      shipmentId,
      orderNumber,
      message: "Shipment is now Out for Delivery",
      date: "05/08/2026",
      time: "11:00",
      type: "checkpoint",
      driver,
    });
  }

  if (status === "delivered") {
    base.push({
      id: `${shipmentId}-u5`,
      shipmentId,
      orderNumber,
      message: "Delivered successfully with POD confirmation",
      date: "05/08/2026",
      time: "15:30",
      type: "delivered",
      driver,
    });
  }

  return base;
}

type Seed = {
  id: string;
  orderNumber: string;
  poNumber: string;
  invoiceNumber: string;
  productIdx: number;
  sellerIdx: number;
  warehouse: string;
  destination: string;
  destinationState: string;
  paymentType: string;
  qty: number;
  rate: number;
  vehicleNumber: string;
  vehicleType: string;
  capacity: number;
  transporter: string;
  driverIdx: number;
  status: ShipmentStatus;
  routeCities: string[];
  routeIndex: number;
  remainingKm: number;
  remainingHours: number;
  currentCity: string;
  dispatchDaysAgo: number | null;
  etaDays: number;
  createdDaysAgo: number;
};

function toRecord(seed: Seed): ShipmentRecord {
  const product = PRODUCTS[seed.productIdx % PRODUCTS.length];
  const seller = SELLERS[seed.sellerIdx % SELLERS.length];
  const driver = DRIVERS[seed.driverIdx % DRIVERS.length];
  const amount = Math.round(seed.qty * seed.rate);
  const grandTotal = Math.round(amount * 1.18 + seed.qty * 850);
  const createdAt = iso(seed.createdDaysAgo, 8, 0);
  const dispatchDate =
    seed.dispatchDaysAgo === null ? null : iso(seed.dispatchDaysAgo, 14, 15);
  const expectedDeliveryDate = etaIso(seed.etaDays, 16);
  const progress = shipmentProgressPercent(seed.status);

  return {
    id: seed.id,
    orderNumber: seed.orderNumber,
    poNumber: seed.poNumber,
    invoiceNumber: seed.invoiceNumber,
    product: product.name,
    grade: product.grade,
    quantityMt: seed.qty,
    unit: "MT",
    seller,
    warehouse: seed.warehouse,
    destination: seed.destination,
    destinationState: seed.destinationState,
    paymentType: seed.paymentType,
    grandTotal,
    vehicleNumber: seed.vehicleNumber,
    vehicleType: seed.vehicleType,
    truckCapacityMt: seed.capacity,
    transportCompany: seed.transporter,
    driverName: driver.name,
    driverMobile: driver.mobile,
    driverLicense: driver.license,
    dispatchDate,
    expectedDeliveryDate,
    eta: expectedDeliveryDate,
    remainingDistanceKm: seed.remainingKm,
    currentStatus: seed.status,
    currentCity: seed.currentCity,
    progress,
    weatherStatus: "—",
    trafficIndicator: "clear",
    remainingHours: seed.remainingHours,
    route: buildRoute(seed.routeCities, seed.routeIndex),
    liveProgress: [],
    timeline: buildMvpTimeline(seed.status, createdAt, dispatchDate),
    documents: buildDocuments(seed.orderNumber, seed.status),
    updates: buildUpdates(
      seed.id,
      seed.orderNumber,
      driver.name,
      seed.status,
      seed.warehouse,
    ),
    createdAt,
    updatedAt: iso(0, 9, 45),
  };
}

/**
 * 20 shipments overlapping PT-ORD-88204..88218 so Track from Orders opens
 * matching details. Statuses are MVP-only (no delayed / live GPS).
 */
const SEEDS: Seed[] = [
  {
    id: "PT-ORD-88204",
    orderNumber: "PT-ORD-88204",
    poNumber: "PO-2026-8204",
    invoiceNumber: "INV-2026-8204",
    productIdx: 0,
    sellerIdx: 0,
    warehouse: "Jamnagar",
    destination: "Mumbai",
    destinationState: "Maharashtra",
    paymentType: "Advance Payment",
    qty: 25,
    rate: 98500,
    vehicleNumber: "GJ-01-AB-4582",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "ABC Logistics",
    driverIdx: 0,
    status: "in_transit",
    routeCities: ["Jamnagar", "Ahmedabad", "Vadodara", "Surat", "Mumbai"],
    routeIndex: 2,
    remainingKm: 420,
    remainingHours: 14,
    currentCity: "Vadodara",
    dispatchDaysAgo: 1,
    etaDays: 2,
    createdDaysAgo: 2,
  },
  {
    id: "PT-ORD-88205",
    orderNumber: "PT-ORD-88205",
    poNumber: "PO-2026-8205",
    invoiceNumber: "INV-2026-8205",
    productIdx: 1,
    sellerIdx: 1,
    warehouse: "Hazira",
    destination: "Mumbai",
    destinationState: "Maharashtra",
    paymentType: "On Loading",
    qty: 18,
    rate: 102000,
    vehicleNumber: "MH12CD7854",
    vehicleType: "Container 20 FT",
    capacity: 20,
    transporter: "VRL Logistics",
    driverIdx: 2,
    status: "ready_for_dispatch",
    routeCities: ["Hazira", "Vadodara", "Surat", "Vapi", "Mumbai"],
    routeIndex: 0,
    remainingKm: 280,
    remainingHours: 10,
    currentCity: "Hazira",
    dispatchDaysAgo: null,
    etaDays: 1,
    createdDaysAgo: 1,
  },
  {
    id: "PT-ORD-88206",
    orderNumber: "PT-ORD-88206",
    poNumber: "PO-2026-8206",
    invoiceNumber: "INV-2026-8206",
    productIdx: 2,
    sellerIdx: 2,
    warehouse: "Dahej",
    destination: "Hyderabad",
    destinationState: "Telangana",
    paymentType: "Advance Payment",
    qty: 30,
    rate: 94500,
    vehicleNumber: "RJ14EF2345",
    vehicleType: "Trailer 40 FT",
    capacity: 32,
    transporter: "Mahindra Logistics",
    driverIdx: 1,
    status: "in_transit",
    routeCities: ["Dahej", "Vadodara", "Indore", "Nagpur", "Hyderabad"],
    routeIndex: 2,
    remainingKm: 620,
    remainingHours: 18,
    currentCity: "Indore",
    dispatchDaysAgo: 2,
    etaDays: 1,
    createdDaysAgo: 4,
  },
  {
    id: "PT-ORD-88207",
    orderNumber: "PT-ORD-88207",
    poNumber: "PO-2026-8207",
    invoiceNumber: "INV-2026-8207",
    productIdx: 3,
    sellerIdx: 3,
    warehouse: "Mundra",
    destination: "Bangalore",
    destinationState: "Karnataka",
    paymentType: "Credit 15 Days",
    qty: 22,
    rate: 87500,
    vehicleNumber: "GJ05XY9821",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "Blue Dart B2B",
    driverIdx: 0,
    status: "in_transit",
    routeCities: ["Mundra", "Ahmedabad", "Pune", "Hubli", "Bangalore"],
    routeIndex: 3,
    remainingKm: 410,
    remainingHours: 14,
    currentCity: "Hubli",
    dispatchDaysAgo: 3,
    etaDays: 1,
    createdDaysAgo: 5,
  },
  {
    id: "PT-ORD-88208",
    orderNumber: "PT-ORD-88208",
    poNumber: "PO-2026-8208",
    invoiceNumber: "INV-2026-8208",
    productIdx: 4,
    sellerIdx: 4,
    warehouse: "Panipat",
    destination: "Delhi",
    destinationState: "Delhi",
    paymentType: "On Delivery",
    qty: 12,
    rate: 110000,
    vehicleNumber: "HR55MN3344",
    vehicleType: "Container 20 FT",
    capacity: 18,
    transporter: "Delhivery Enterprise",
    driverIdx: 3,
    status: "delivered",
    routeCities: ["Panipat", "Sonipat", "Delhi"],
    routeIndex: 2,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Delhi",
    dispatchDaysAgo: 4,
    etaDays: 0,
    createdDaysAgo: 6,
  },
  {
    id: "PT-ORD-88209",
    orderNumber: "PT-ORD-88209",
    poNumber: "PO-2026-8209",
    invoiceNumber: "INV-2026-8209",
    productIdx: 5,
    sellerIdx: 0,
    warehouse: "Paradip",
    destination: "Kolkata",
    destinationState: "West Bengal",
    paymentType: "Advance Payment",
    qty: 28,
    rate: 92000,
    vehicleNumber: "WB20QR1122",
    vehicleType: "Trailer 40 FT",
    capacity: 34,
    transporter: "TCI",
    driverIdx: 4,
    status: "delivered",
    routeCities: ["Paradip", "Cuttack", "Bhubaneswar", "Kharagpur", "Kolkata"],
    routeIndex: 4,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Kolkata",
    dispatchDaysAgo: 5,
    etaDays: -1,
    createdDaysAgo: 7,
  },
  {
    id: "PT-ORD-88210",
    orderNumber: "PT-ORD-88210",
    poNumber: "PO-2026-8210",
    invoiceNumber: "INV-2026-8210",
    productIdx: 0,
    sellerIdx: 1,
    warehouse: "Jamnagar",
    destination: "Chennai",
    destinationState: "Tamil Nadu",
    paymentType: "Credit 30 Days",
    qty: 35,
    rate: 99000,
    vehicleNumber: "TN09PK6678",
    vehicleType: "Trailer 40 FT",
    capacity: 36,
    transporter: "VRL Logistics",
    driverIdx: 2,
    status: "delivered",
    routeCities: ["Jamnagar", "Mumbai", "Pune", "Bengaluru", "Chennai"],
    routeIndex: 4,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Chennai",
    dispatchDaysAgo: 6,
    etaDays: -2,
    createdDaysAgo: 8,
  },
  {
    id: "PT-ORD-88214",
    orderNumber: "PT-ORD-88214",
    poNumber: "PO-2026-8214",
    invoiceNumber: "INV-2026-8214",
    productIdx: 1,
    sellerIdx: 2,
    warehouse: "Hazira",
    destination: "Delhi",
    destinationState: "Delhi",
    paymentType: "Advance Payment",
    qty: 20,
    rate: 101500,
    vehicleNumber: "GJ01AB4567",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "Mahindra Logistics",
    driverIdx: 0,
    status: "ready_for_dispatch",
    routeCities: ["Hazira", "Ahmedabad", "Udaipur", "Jaipur", "Delhi"],
    routeIndex: 0,
    remainingKm: 1120,
    remainingHours: 34,
    currentCity: "Hazira",
    dispatchDaysAgo: null,
    etaDays: 2,
    createdDaysAgo: 1,
  },
  {
    id: "PT-ORD-88215",
    orderNumber: "PT-ORD-88215",
    poNumber: "PO-2026-8215",
    invoiceNumber: "INV-2026-8215",
    productIdx: 2,
    sellerIdx: 3,
    warehouse: "Dahej",
    destination: "Mumbai",
    destinationState: "Maharashtra",
    paymentType: "On Loading",
    qty: 16,
    rate: 96000,
    vehicleNumber: "MH12CD7854",
    vehicleType: "Container 20 FT",
    capacity: 20,
    transporter: "Blue Dart B2B",
    driverIdx: 2,
    status: "out_for_delivery",
    routeCities: ["Dahej", "Surat", "Vapi", "Thane", "Mumbai"],
    routeIndex: 3,
    remainingKm: 48,
    remainingHours: 3,
    currentCity: "Thane",
    dispatchDaysAgo: 1,
    etaDays: 0,
    createdDaysAgo: 3,
  },
  {
    id: "PT-ORD-88216",
    orderNumber: "PT-ORD-88216",
    poNumber: "PO-2026-8216",
    invoiceNumber: "INV-2026-8216",
    productIdx: 3,
    sellerIdx: 4,
    warehouse: "Mundra",
    destination: "Hyderabad",
    destinationState: "Telangana",
    paymentType: "Advance Payment",
    qty: 24,
    rate: 88500,
    vehicleNumber: "RJ14EF2345",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "Delhivery Enterprise",
    driverIdx: 1,
    status: "delivered",
    routeCities: ["Mundra", "Ahmedabad", "Indore", "Nagpur", "Hyderabad"],
    routeIndex: 4,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Hyderabad",
    dispatchDaysAgo: 5,
    etaDays: -1,
    createdDaysAgo: 7,
  },
  {
    id: "PT-ORD-88218",
    orderNumber: "PT-ORD-88218",
    poNumber: "PO-2026-8218",
    invoiceNumber: "INV-2026-8218",
    productIdx: 4,
    sellerIdx: 0,
    warehouse: "Panipat",
    destination: "Bangalore",
    destinationState: "Karnataka",
    paymentType: "Credit 15 Days",
    qty: 15,
    rate: 112000,
    vehicleNumber: "KA03ST8890",
    vehicleType: "Container 20 FT",
    capacity: 18,
    transporter: "TCI",
    driverIdx: 3,
    status: "delivered",
    routeCities: ["Panipat", "Delhi", "Nagpur", "Hyderabad", "Bangalore"],
    routeIndex: 4,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Bangalore",
    dispatchDaysAgo: 7,
    etaDays: -3,
    createdDaysAgo: 9,
  },
  {
    id: "PT-SHP-90001",
    orderNumber: "PT-ORD-90001",
    poNumber: "PO-2026-9001",
    invoiceNumber: "INV-2026-9001",
    productIdx: 0,
    sellerIdx: 1,
    warehouse: "Jamnagar",
    destination: "Delhi",
    destinationState: "Delhi",
    paymentType: "Advance Payment",
    qty: 40,
    rate: 97800,
    vehicleNumber: "MH12CD7854",
    vehicleType: "Trailer 40 FT",
    capacity: 40,
    transporter: "TCI",
    driverIdx: 2,
    status: "dispatched",
    routeCities: ["Jamnagar", "Ahmedabad", "Udaipur", "Jaipur", "Delhi"],
    routeIndex: 1,
    remainingKm: 980,
    remainingHours: 28,
    currentCity: "Ahmedabad",
    dispatchDaysAgo: 0,
    etaDays: 2,
    createdDaysAgo: 3,
  },
  {
    id: "PT-SHP-90002",
    orderNumber: "PT-ORD-90002",
    poNumber: "PO-2026-9002",
    invoiceNumber: "INV-2026-9002",
    productIdx: 1,
    sellerIdx: 2,
    warehouse: "Hazira",
    destination: "Hyderabad",
    destinationState: "Telangana",
    paymentType: "Advance Payment",
    qty: 26,
    rate: 99500,
    vehicleNumber: "GJ05XY9821",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "VRL Logistics",
    driverIdx: 1,
    status: "in_transit",
    routeCities: ["Hazira", "Surat", "Nagpur", "Hyderabad"],
    routeIndex: 2,
    remainingKm: 540,
    remainingHours: 16,
    currentCity: "Nagpur",
    dispatchDaysAgo: 2,
    etaDays: 1,
    createdDaysAgo: 4,
  },
  {
    id: "PT-SHP-90003",
    orderNumber: "PT-ORD-90003",
    poNumber: "PO-2026-9003",
    invoiceNumber: "INV-2026-9003",
    productIdx: 2,
    sellerIdx: 3,
    warehouse: "Dahej",
    destination: "Chennai",
    destinationState: "Tamil Nadu",
    paymentType: "On Loading",
    qty: 22,
    rate: 93000,
    vehicleNumber: "TN09PK6678",
    vehicleType: "Trailer 40 FT",
    capacity: 34,
    transporter: "Mahindra Logistics",
    driverIdx: 4,
    status: "in_transit",
    routeCities: ["Dahej", "Mumbai", "Pune", "Bengaluru", "Chennai"],
    routeIndex: 2,
    remainingKm: 780,
    remainingHours: 22,
    currentCity: "Pune",
    dispatchDaysAgo: 2,
    etaDays: 2,
    createdDaysAgo: 4,
  },
  {
    id: "PT-SHP-90004",
    orderNumber: "PT-ORD-90004",
    poNumber: "PO-2026-9004",
    invoiceNumber: "INV-2026-9004",
    productIdx: 3,
    sellerIdx: 0,
    warehouse: "Mundra",
    destination: "Delhi",
    destinationState: "Delhi",
    paymentType: "Advance Payment",
    qty: 30,
    rate: 88000,
    vehicleNumber: "RJ14EF2345",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "TCI",
    driverIdx: 0,
    status: "ready_for_dispatch",
    routeCities: ["Mundra", "Ahmedabad", "Jaipur", "Delhi"],
    routeIndex: 0,
    remainingKm: 1050,
    remainingHours: 32,
    currentCity: "Mundra",
    dispatchDaysAgo: null,
    etaDays: 3,
    createdDaysAgo: 1,
  },
  {
    id: "PT-SHP-90005",
    orderNumber: "PT-ORD-90005",
    poNumber: "PO-2026-9005",
    invoiceNumber: "INV-2026-9005",
    productIdx: 4,
    sellerIdx: 1,
    warehouse: "Panipat",
    destination: "Mumbai",
    destinationState: "Maharashtra",
    paymentType: "Credit 15 Days",
    qty: 14,
    rate: 108000,
    vehicleNumber: "HR55MN3344",
    vehicleType: "Container 20 FT",
    capacity: 18,
    transporter: "Blue Dart B2B",
    driverIdx: 3,
    status: "dispatched",
    routeCities: ["Panipat", "Delhi", "Jaipur", "Ahmedabad", "Mumbai"],
    routeIndex: 1,
    remainingKm: 1200,
    remainingHours: 36,
    currentCity: "Delhi",
    dispatchDaysAgo: 0,
    etaDays: 3,
    createdDaysAgo: 2,
  },
  {
    id: "PT-SHP-90006",
    orderNumber: "PT-ORD-90006",
    poNumber: "PO-2026-9006",
    invoiceNumber: "INV-2026-9006",
    productIdx: 5,
    sellerIdx: 2,
    warehouse: "Paradip",
    destination: "Bangalore",
    destinationState: "Karnataka",
    paymentType: "Advance Payment",
    qty: 20,
    rate: 91000,
    vehicleNumber: "KA03ST8890",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "Delhivery Enterprise",
    driverIdx: 4,
    status: "in_transit",
    routeCities: ["Paradip", "Visakhapatnam", "Hyderabad", "Bangalore"],
    routeIndex: 2,
    remainingKm: 650,
    remainingHours: 20,
    currentCity: "Hyderabad",
    dispatchDaysAgo: 2,
    etaDays: 1,
    createdDaysAgo: 4,
  },
  {
    id: "PT-SHP-90007",
    orderNumber: "PT-ORD-90007",
    poNumber: "PO-2026-9007",
    invoiceNumber: "INV-2026-9007",
    productIdx: 0,
    sellerIdx: 3,
    warehouse: "Jamnagar",
    destination: "Kolkata",
    destinationState: "West Bengal",
    paymentType: "On Delivery",
    qty: 32,
    rate: 97000,
    vehicleNumber: "WB20QR1122",
    vehicleType: "Trailer 40 FT",
    capacity: 36,
    transporter: "TCI",
    driverIdx: 1,
    status: "out_for_delivery",
    routeCities: ["Jamnagar", "Nagpur", "Raipur", "Kolkata"],
    routeIndex: 3,
    remainingKm: 35,
    remainingHours: 2,
    currentCity: "Kolkata",
    dispatchDaysAgo: 3,
    etaDays: 0,
    createdDaysAgo: 5,
  },
  {
    id: "PT-SHP-90008",
    orderNumber: "PT-ORD-90008",
    poNumber: "PO-2026-9008",
    invoiceNumber: "INV-2026-9008",
    productIdx: 1,
    sellerIdx: 4,
    warehouse: "Hazira",
    destination: "Chennai",
    destinationState: "Tamil Nadu",
    paymentType: "Advance Payment",
    qty: 19,
    rate: 100500,
    vehicleNumber: "GJ01AB4567",
    vehicleType: "Container 20 FT",
    capacity: 20,
    transporter: "VRL Logistics",
    driverIdx: 2,
    status: "in_transit",
    routeCities: ["Hazira", "Mumbai", "Pune", "Bengaluru", "Chennai"],
    routeIndex: 2,
    remainingKm: 700,
    remainingHours: 20,
    currentCity: "Pune",
    dispatchDaysAgo: 1,
    etaDays: 2,
    createdDaysAgo: 3,
  },
  {
    id: "PT-SHP-90009",
    orderNumber: "PT-ORD-90009",
    poNumber: "PO-2026-9009",
    invoiceNumber: "INV-2026-9009",
    productIdx: 2,
    sellerIdx: 0,
    warehouse: "Dahej",
    destination: "Delhi",
    destinationState: "Delhi",
    paymentType: "Advance Payment",
    qty: 28,
    rate: 94000,
    vehicleNumber: "RJ14EF2345",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "Mahindra Logistics",
    driverIdx: 0,
    status: "in_transit",
    routeCities: ["Dahej", "Ahmedabad", "Jaipur", "Delhi"],
    routeIndex: 2,
    remainingKm: 480,
    remainingHours: 14,
    currentCity: "Jaipur",
    dispatchDaysAgo: 1,
    etaDays: 1,
    createdDaysAgo: 3,
  },
];

export const shipmentsCatalogMock: ShipmentRecord[] = SEEDS.map(toRecord);

/** Operational status alerts only — no GPS / delay predictions. */
export const shipmentNotificationsMock: ShipmentNotification[] = [
  {
    id: "sn-1",
    shipmentId: "PT-ORD-88205",
    orderNumber: "PT-ORD-88205",
    type: "vehicle_assigned",
    title: "Vehicle Assigned",
    message: "MH12CD7854 assigned to PT-ORD-88205",
    at: iso(0, 8, 15),
    read: false,
  },
  {
    id: "sn-2",
    shipmentId: "PT-SHP-90001",
    orderNumber: "PT-ORD-90001",
    type: "shipment_dispatched",
    title: "Shipment Dispatched",
    message: "PT-ORD-90001 dispatched from Jamnagar Warehouse",
    at: iso(0, 14, 15),
    read: false,
  },
  {
    id: "sn-3",
    shipmentId: "PT-ORD-88204",
    orderNumber: "PT-ORD-88204",
    type: "in_transit",
    title: "Shipment In Transit",
    message: "PT-ORD-88204 moved to In Transit",
    at: iso(0, 8, 40),
    read: false,
  },
  {
    id: "sn-4",
    shipmentId: "PT-SHP-90007",
    orderNumber: "PT-ORD-90007",
    type: "out_for_delivery",
    title: "Out for Delivery",
    message: "PT-ORD-90007 is now Out for Delivery",
    at: iso(0, 11, 0),
    read: false,
  },
  {
    id: "sn-5",
    shipmentId: "PT-ORD-88208",
    orderNumber: "PT-ORD-88208",
    type: "delivered",
    title: "Delivered",
    message: "PT-ORD-88208 successfully delivered",
    at: iso(1, 15, 30),
    read: true,
  },
  {
    id: "sn-6",
    shipmentId: "PT-ORD-88215",
    orderNumber: "PT-ORD-88215",
    type: "out_for_delivery",
    title: "Out for Delivery",
    message: "PT-ORD-88215 is now Out for Delivery",
    at: iso(0, 10, 20),
    read: false,
  },
  {
    id: "sn-7",
    shipmentId: "PT-ORD-88209",
    orderNumber: "PT-ORD-88209",
    type: "delivered",
    title: "Delivered",
    message: "PT-ORD-88209 successfully delivered",
    at: iso(2, 12, 0),
    read: true,
  },
  {
    id: "sn-8",
    shipmentId: "PT-ORD-88206",
    orderNumber: "PT-ORD-88206",
    type: "in_transit",
    title: "Shipment In Transit",
    message: "PT-ORD-88206 moved to In Transit",
    at: iso(1, 9, 10),
    read: true,
  },
];
