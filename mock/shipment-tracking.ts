/**
 * Shipment Tracking mock catalog — 20 enterprise logistics shipments.
 * Seeded for desktop B2B petrochemical procurement demos.
 */

import {
  DEFAULT_SHIPMENT_FILTERS,
  type DeliveryUpdate,
  type LiveProgressStep,
  type RouteStop,
  type ShipmentDashboardSummary,
  type ShipmentNotification,
  type ShipmentRecord,
  type ShipmentStatus,
  type ShipmentTimelineStage,
  type TimelineStageStatus,
  type TransportDocument,
} from "@/types/shipment-tracking";

export { DEFAULT_SHIPMENT_FILTERS };

const PRODUCTS = [
  { name: "Polypropylene Homopolymer", grade: "H030SG" },
  { name: "HDPE Blow Moulding", grade: "B5502" },
  { name: "LLDPE Film Grade", grade: "F20S" },
  { name: "PVC Suspension Resin", grade: "S1110" },
  { name: "PET Bottle Grade", grade: "M5018L" },
  { name: "LDPE Injection", grade: "R01RX" },
] as const;

const SELLERS = [
  "Reliance Polymers",
  "IOCL Petrochemicals",
  "Haldia Petrochem",
  "GAIL Polymers",
  "Nayara Energy",
] as const;

function iso(daysAgo: number, hour = 10, minute = 30): string {
  const d = new Date("2026-08-03T10:00:00+05:30");
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function etaIso(daysFromNow: number, hour = 16): string {
  const d = new Date("2026-08-03T10:00:00+05:30");
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

function buildTimeline(
  currentIndex: number,
  baseDaysAgo: number,
): ShipmentTimelineStage[] {
  const defs: Array<{
    id: string;
    title: string;
    description: string;
    icon: ShipmentTimelineStage["icon"];
    offsetHours: number;
  }> = [
    {
      id: "order_confirmed",
      title: "Order Confirmed",
      description: "Purchase order confirmed by seller and procurement desk.",
      icon: "check",
      offsetHours: 0,
    },
    {
      id: "payment_verified",
      title: "Payment Verified",
      description: "Advance / settlement verified against invoice.",
      icon: "credit",
      offsetHours: 6,
    },
    {
      id: "packing_completed",
      title: "Packing Completed",
      description: "Material packed, sealed, and QC cleared at warehouse.",
      icon: "box",
      offsetHours: 18,
    },
    {
      id: "vehicle_assigned",
      title: "Vehicle Assigned",
      description: "Transporter vehicle and driver allocated for dispatch.",
      icon: "truck",
      offsetHours: 24,
    },
    {
      id: "loaded",
      title: "Loaded",
      description: "Truck loaded with sealed containers and weighbridge done.",
      icon: "load",
      offsetHours: 30,
    },
    {
      id: "dispatched",
      title: "Dispatched",
      description: "Shipment left warehouse gate with e-way bill active.",
      icon: "dispatch",
      offsetHours: 32,
    },
    {
      id: "checkpoint",
      title: "Reached Checkpoint",
      description: "Vehicle crossed designated state corridor checkpoint.",
      icon: "map",
      offsetHours: 48,
    },
    {
      id: "in_transit",
      title: "In Transit",
      description: "En route on national highway logistics corridor.",
      icon: "transit",
      offsetHours: 60,
    },
    {
      id: "near_destination",
      title: "Near Destination",
      description: "Vehicle approaching destination metro hub.",
      icon: "pin",
      offsetHours: 78,
    },
    {
      id: "delivered",
      title: "Delivered",
      description: "Material delivered and POD captured at buyer site.",
      icon: "delivered",
      offsetHours: 90,
    },
  ];

  return defs.map((def, index) => {
    const status = stageStatus(index, currentIndex);
    const at =
      status === "pending"
        ? null
        : (() => {
            const d = new Date(iso(baseDaysAgo, 8, 0));
            d.setHours(d.getHours() + def.offsetHours);
            return d.toISOString();
          })();
    const parts = dateParts(at);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      date: parts.date,
      time: parts.time,
      status,
      icon: def.icon,
    };
  });
}

function buildLiveProgress(currentIndex: number): LiveProgressStep[] {
  const labels = [
    "Warehouse",
    "Vehicle Assigned",
    "Loading Complete",
    "Left Warehouse",
    "Reached State Border",
    "Reached City",
    "Near Delivery",
    "Delivered",
  ];
  return labels.map((label, index) => ({
    id: `live-${index}`,
    label,
    status: stageStatus(index, currentIndex),
  }));
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
  const advanced =
    status !== "ready_for_dispatch" && status !== "vehicle_assigned";
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
): DeliveryUpdate[] {
  const base: DeliveryUpdate[] = [
    {
      id: `${shipmentId}-u1`,
      shipmentId,
      orderNumber,
      message: "Shipment left warehouse",
      date: "01/08/2026",
      time: "14:20",
      type: "info",
      driver,
      location: "Warehouse Gate",
    },
    {
      id: `${shipmentId}-u2`,
      shipmentId,
      orderNumber,
      message: "Reached Gujarat Border",
      date: "01/08/2026",
      time: "18:45",
      type: "checkpoint",
      driver,
      location: "Gujarat Border",
    },
    {
      id: `${shipmentId}-u3`,
      shipmentId,
      orderNumber,
      message: "Reached Rajasthan",
      date: "02/08/2026",
      time: "09:10",
      type: "checkpoint",
      driver,
      location: "Rajasthan Corridor",
    },
  ];

  if (status === "delayed") {
    base.push(
      {
        id: `${shipmentId}-u4`,
        shipmentId,
        orderNumber,
        message: "Vehicle delayed due to highway congestion",
        date: "02/08/2026",
        time: "16:30",
        type: "delay",
        driver,
        location: "NH-48",
      },
      {
        id: `${shipmentId}-u5`,
        shipmentId,
        orderNumber,
        message: "Delivery rescheduled by 8 hours",
        date: "02/08/2026",
        time: "17:05",
        type: "reschedule",
        driver,
      },
    );
  }

  if (status === "out_for_delivery" || status === "delivered") {
    base.push({
      id: `${shipmentId}-u6`,
      shipmentId,
      orderNumber,
      message: "Reached Delhi NCR hub",
      date: "03/08/2026",
      time: "07:40",
      type: "checkpoint",
      driver,
      location: "Delhi NCR",
    });
  }

  if (status === "delivered") {
    base.push({
      id: `${shipmentId}-u7`,
      shipmentId,
      orderNumber,
      message: "Delivered successfully with POD confirmation",
      date: "03/08/2026",
      time: "11:15",
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
  timelineIndex: number;
  liveIndex: number;
  routeCities: string[];
  routeIndex: number;
  remainingKm: number;
  remainingHours: number;
  currentCity: string;
  weather: string;
  traffic: "clear" | "moderate" | "heavy";
  dispatchDaysAgo: number | null;
  etaDays: number;
  createdDaysAgo: number;
};

function toRecord(seed: Seed): ShipmentRecord {
  const product = PRODUCTS[seed.productIdx % PRODUCTS.length];
  const seller = SELLERS[seed.sellerIdx % SELLERS.length];
  const drivers = [
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
  ];
  const driver = drivers[seed.driverIdx % drivers.length];
  const amount = Math.round(seed.qty * seed.rate);
  const grandTotal = Math.round(amount * 1.18 + seed.qty * 850);
  const progress = Math.round((seed.timelineIndex / 9) * 100);

  return {
    id: seed.id,
    orderNumber: seed.orderNumber,
    poNumber: seed.poNumber,
    invoiceNumber: seed.invoiceNumber,
    product: product.name,
    grade: product.grade,
    quantityMt: seed.qty,
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
    gpsEnabled: true,
    dispatchDate:
      seed.dispatchDaysAgo === null ? null : iso(seed.dispatchDaysAgo, 14, 20),
    eta: etaIso(seed.etaDays, 16),
    remainingDistanceKm: seed.remainingKm,
    currentStatus: seed.status,
    currentCity: seed.currentCity,
    progress,
    weatherStatus: seed.weather,
    trafficIndicator: seed.traffic,
    remainingHours: seed.remainingHours,
    route: buildRoute(seed.routeCities, seed.routeIndex),
    liveProgress: buildLiveProgress(seed.liveIndex),
    timeline: buildTimeline(seed.timelineIndex, seed.createdDaysAgo),
    documents: buildDocuments(seed.orderNumber, seed.status),
    updates: buildUpdates(seed.id, seed.orderNumber, driver.name, seed.status),
    createdAt: iso(seed.createdDaysAgo, 8, 0),
    updatedAt: iso(0, 9, 45),
  };
}

/**
 * 20 shipments — overlaps PT-ORD-88204..88218 ready/transit/delivered IDs
 * so Track Shipment from Orders opens matching details.
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
    destination: "Delhi",
    destinationState: "Delhi",
    paymentType: "Advance Payment",
    qty: 25,
    rate: 98500,
    vehicleNumber: "GJ01AB4567",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "TCI",
    driverIdx: 0,
    status: "ready_for_dispatch",
    timelineIndex: 2,
    liveIndex: 0,
    routeCities: ["Jamnagar", "Ahmedabad", "Udaipur", "Jaipur", "Delhi"],
    routeIndex: 0,
    remainingKm: 1180,
    remainingHours: 36,
    currentCity: "Jamnagar",
    weather: "Clear · 34°C",
    traffic: "clear",
    dispatchDaysAgo: null,
    etaDays: 2,
    createdDaysAgo: 4,
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
    status: "vehicle_assigned",
    timelineIndex: 3,
    liveIndex: 1,
    routeCities: ["Hazira", "Vadodara", "Surat", "Vapi", "Mumbai"],
    routeIndex: 0,
    remainingKm: 280,
    remainingHours: 10,
    currentCity: "Hazira",
    weather: "Humid · 31°C",
    traffic: "moderate",
    dispatchDaysAgo: null,
    etaDays: 1,
    createdDaysAgo: 3,
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
    timelineIndex: 7,
    liveIndex: 4,
    routeCities: ["Dahej", "Vadodara", "Indore", "Nagpur", "Hyderabad"],
    routeIndex: 2,
    remainingKm: 620,
    remainingHours: 18,
    currentCity: "Indore",
    weather: "Partly cloudy · 29°C",
    traffic: "clear",
    dispatchDaysAgo: 2,
    etaDays: 1,
    createdDaysAgo: 6,
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
    timelineIndex: 7,
    liveIndex: 5,
    routeCities: ["Mundra", "Ahmedabad", "Pune", "Hubli", "Bangalore"],
    routeIndex: 3,
    remainingKm: 410,
    remainingHours: 14,
    currentCity: "Hubli",
    weather: "Light rain · 26°C",
    traffic: "moderate",
    dispatchDaysAgo: 3,
    etaDays: 1,
    createdDaysAgo: 7,
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
    timelineIndex: 9,
    liveIndex: 7,
    routeCities: ["Panipat", "Sonipat", "Delhi"],
    routeIndex: 2,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Delhi",
    weather: "Clear · 33°C",
    traffic: "clear",
    dispatchDaysAgo: 4,
    etaDays: 0,
    createdDaysAgo: 8,
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
    timelineIndex: 9,
    liveIndex: 7,
    routeCities: ["Paradip", "Cuttack", "Bhubaneswar", "Kharagpur", "Kolkata"],
    routeIndex: 4,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Kolkata",
    weather: "Humid · 30°C",
    traffic: "clear",
    dispatchDaysAgo: 5,
    etaDays: -1,
    createdDaysAgo: 9,
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
    timelineIndex: 9,
    liveIndex: 7,
    routeCities: ["Jamnagar", "Mumbai", "Pune", "Bengaluru", "Chennai"],
    routeIndex: 4,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Chennai",
    weather: "Coastal · 32°C",
    traffic: "clear",
    dispatchDaysAgo: 6,
    etaDays: -2,
    createdDaysAgo: 10,
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
    timelineIndex: 2,
    liveIndex: 0,
    routeCities: ["Hazira", "Ahmedabad", "Udaipur", "Jaipur", "Delhi"],
    routeIndex: 0,
    remainingKm: 1120,
    remainingHours: 34,
    currentCity: "Hazira",
    weather: "Clear · 33°C",
    traffic: "clear",
    dispatchDaysAgo: null,
    etaDays: 2,
    createdDaysAgo: 3,
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
    timelineIndex: 8,
    liveIndex: 6,
    routeCities: ["Dahej", "Surat", "Vapi", "Thane", "Mumbai"],
    routeIndex: 3,
    remainingKm: 48,
    remainingHours: 3,
    currentCity: "Thane",
    weather: "Overcast · 28°C",
    traffic: "heavy",
    dispatchDaysAgo: 1,
    etaDays: 0,
    createdDaysAgo: 4,
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
    timelineIndex: 9,
    liveIndex: 7,
    routeCities: ["Mundra", "Ahmedabad", "Indore", "Nagpur", "Hyderabad"],
    routeIndex: 4,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Hyderabad",
    weather: "Clear · 31°C",
    traffic: "clear",
    dispatchDaysAgo: 5,
    etaDays: -1,
    createdDaysAgo: 9,
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
    timelineIndex: 9,
    liveIndex: 7,
    routeCities: ["Panipat", "Delhi", "Nagpur", "Hyderabad", "Bangalore"],
    routeIndex: 4,
    remainingKm: 0,
    remainingHours: 0,
    currentCity: "Bangalore",
    weather: "Pleasant · 24°C",
    traffic: "clear",
    dispatchDaysAgo: 7,
    etaDays: -3,
    createdDaysAgo: 11,
  },
  // Additional shipments to reach 20
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
    vehicleNumber: "GJ01AB4567",
    vehicleType: "Trailer 40 FT",
    capacity: 40,
    transporter: "TCI",
    driverIdx: 0,
    status: "dispatched",
    timelineIndex: 5,
    liveIndex: 3,
    routeCities: ["Jamnagar", "Ahmedabad", "Udaipur", "Jaipur", "Delhi"],
    routeIndex: 1,
    remainingKm: 980,
    remainingHours: 28,
    currentCity: "Ahmedabad",
    weather: "Hot · 36°C",
    traffic: "moderate",
    dispatchDaysAgo: 0,
    etaDays: 2,
    createdDaysAgo: 5,
  },
  {
    id: "PT-SHP-90002",
    orderNumber: "PT-ORD-90002",
    poNumber: "PO-2026-9002",
    invoiceNumber: "INV-2026-9002",
    productIdx: 1,
    sellerIdx: 2,
    warehouse: "Hazira",
    destination: "Kolkata",
    destinationState: "West Bengal",
    paymentType: "On Delivery",
    qty: 26,
    rate: 100500,
    vehicleNumber: "MH12CD7854",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "VRL Logistics",
    driverIdx: 2,
    status: "delayed",
    timelineIndex: 6,
    liveIndex: 4,
    routeCities: ["Hazira", "Indore", "Nagpur", "Raipur", "Kolkata"],
    routeIndex: 2,
    remainingKm: 740,
    remainingHours: 30,
    currentCity: "Nagpur",
    weather: "Storm watch · 27°C",
    traffic: "heavy",
    dispatchDaysAgo: 3,
    etaDays: 2,
    createdDaysAgo: 7,
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
    paymentType: "Advance Payment",
    qty: 19,
    rate: 95500,
    vehicleNumber: "RJ14EF2345",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "Mahindra Logistics",
    driverIdx: 1,
    status: "in_transit",
    timelineIndex: 7,
    liveIndex: 5,
    routeCities: ["Dahej", "Mumbai", "Pune", "Bengaluru", "Chennai"],
    routeIndex: 3,
    remainingKm: 350,
    remainingHours: 12,
    currentCity: "Bengaluru",
    weather: "Clear · 27°C",
    traffic: "clear",
    dispatchDaysAgo: 2,
    etaDays: 1,
    createdDaysAgo: 5,
  },
  {
    id: "PT-SHP-90004",
    orderNumber: "PT-ORD-90004",
    poNumber: "PO-2026-9004",
    invoiceNumber: "INV-2026-9004",
    productIdx: 3,
    sellerIdx: 4,
    warehouse: "Mundra",
    destination: "Mumbai",
    destinationState: "Maharashtra",
    paymentType: "On Loading",
    qty: 14,
    rate: 89000,
    vehicleNumber: "GJ05XY9821",
    vehicleType: "Container 20 FT",
    capacity: 18,
    transporter: "Blue Dart B2B",
    driverIdx: 0,
    status: "vehicle_assigned",
    timelineIndex: 3,
    liveIndex: 1,
    routeCities: ["Mundra", "Rajkot", "Surat", "Vapi", "Mumbai"],
    routeIndex: 0,
    remainingKm: 540,
    remainingHours: 16,
    currentCity: "Mundra",
    weather: "Windy · 34°C",
    traffic: "clear",
    dispatchDaysAgo: null,
    etaDays: 1,
    createdDaysAgo: 2,
  },
  {
    id: "PT-SHP-90005",
    orderNumber: "PT-ORD-90005",
    poNumber: "PO-2026-9005",
    invoiceNumber: "INV-2026-9005",
    productIdx: 4,
    sellerIdx: 0,
    warehouse: "Panipat",
    destination: "Hyderabad",
    destinationState: "Telangana",
    paymentType: "Credit 15 Days",
    qty: 21,
    rate: 108000,
    vehicleNumber: "HR55MN3344",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "Delhivery Enterprise",
    driverIdx: 3,
    status: "dispatched",
    timelineIndex: 5,
    liveIndex: 3,
    routeCities: ["Panipat", "Delhi", "Agra", "Nagpur", "Hyderabad"],
    routeIndex: 1,
    remainingKm: 1450,
    remainingHours: 40,
    currentCity: "Delhi",
    weather: "Hazy · 35°C",
    traffic: "moderate",
    dispatchDaysAgo: 0,
    etaDays: 3,
    createdDaysAgo: 4,
  },
  {
    id: "PT-SHP-90006",
    orderNumber: "PT-ORD-90006",
    poNumber: "PO-2026-9006",
    invoiceNumber: "INV-2026-9006",
    productIdx: 5,
    sellerIdx: 1,
    warehouse: "Paradip",
    destination: "Bangalore",
    destinationState: "Karnataka",
    paymentType: "Advance Payment",
    qty: 32,
    rate: 91500,
    vehicleNumber: "KA03ST8890",
    vehicleType: "Trailer 40 FT",
    capacity: 36,
    transporter: "TCI",
    driverIdx: 4,
    status: "delayed",
    timelineIndex: 6,
    liveIndex: 4,
    routeCities: [
      "Paradip",
      "Visakhapatnam",
      "Vijayawada",
      "Tirupati",
      "Bangalore",
    ],
    routeIndex: 2,
    remainingKm: 680,
    remainingHours: 26,
    currentCity: "Vijayawada",
    weather: "Heavy rain · 25°C",
    traffic: "heavy",
    dispatchDaysAgo: 4,
    etaDays: 2,
    createdDaysAgo: 8,
  },
  {
    id: "PT-SHP-90007",
    orderNumber: "PT-ORD-90007",
    poNumber: "PO-2026-9007",
    invoiceNumber: "INV-2026-9007",
    productIdx: 0,
    sellerIdx: 2,
    warehouse: "Jamnagar",
    destination: "Kolkata",
    destinationState: "West Bengal",
    paymentType: "On Delivery",
    qty: 27,
    rate: 98200,
    vehicleNumber: "GJ01AB4567",
    vehicleType: "Trailer 40 FT",
    capacity: 32,
    transporter: "VRL Logistics",
    driverIdx: 0,
    status: "out_for_delivery",
    timelineIndex: 8,
    liveIndex: 6,
    routeCities: ["Jamnagar", "Ahmedabad", "Indore", "Raipur", "Kolkata"],
    routeIndex: 4,
    remainingKm: 35,
    remainingHours: 2,
    currentCity: "Kolkata",
    weather: "Humid · 29°C",
    traffic: "moderate",
    dispatchDaysAgo: 3,
    etaDays: 0,
    createdDaysAgo: 6,
  },
  {
    id: "PT-SHP-90008",
    orderNumber: "PT-ORD-90008",
    poNumber: "PO-2026-9008",
    invoiceNumber: "INV-2026-9008",
    productIdx: 1,
    sellerIdx: 3,
    warehouse: "Hazira",
    destination: "Chennai",
    destinationState: "Tamil Nadu",
    paymentType: "Advance Payment",
    qty: 23,
    rate: 103000,
    vehicleNumber: "TN09PK6678",
    vehicleType: "Trailer 32 FT",
    capacity: 28,
    transporter: "Mahindra Logistics",
    driverIdx: 2,
    status: "in_transit",
    timelineIndex: 7,
    liveIndex: 4,
    routeCities: ["Hazira", "Mumbai", "Pune", "Bengaluru", "Chennai"],
    routeIndex: 2,
    remainingKm: 890,
    remainingHours: 24,
    currentCity: "Pune",
    weather: "Clear · 30°C",
    traffic: "clear",
    dispatchDaysAgo: 1,
    etaDays: 2,
    createdDaysAgo: 4,
  },
  {
    id: "PT-SHP-90009",
    orderNumber: "PT-ORD-90009",
    poNumber: "PO-2026-9009",
    invoiceNumber: "INV-2026-9009",
    productIdx: 2,
    sellerIdx: 4,
    warehouse: "Dahej",
    destination: "Delhi",
    destinationState: "Delhi",
    paymentType: "Credit 30 Days",
    qty: 29,
    rate: 94800,
    vehicleNumber: "RJ14EF2345",
    vehicleType: "Trailer 40 FT",
    capacity: 34,
    transporter: "Blue Dart B2B",
    driverIdx: 1,
    status: "ready_for_dispatch",
    timelineIndex: 2,
    liveIndex: 0,
    routeCities: ["Dahej", "Ahmedabad", "Udaipur", "Jaipur", "Delhi"],
    routeIndex: 0,
    remainingKm: 1050,
    remainingHours: 32,
    currentCity: "Dahej",
    weather: "Clear · 34°C",
    traffic: "clear",
    dispatchDaysAgo: null,
    etaDays: 2,
    createdDaysAgo: 2,
  },
];

export const shipmentsCatalogMock: ShipmentRecord[] = SEEDS.map(toRecord);

export const shipmentNotificationsMock: ShipmentNotification[] = [
  {
    id: "sn-1",
    shipmentId: "PT-ORD-88205",
    type: "vehicle_assigned",
    title: "Vehicle Assigned",
    message: "MH12CD7854 assigned to PT-ORD-88205 · Driver Amit Yadav",
    at: iso(0, 8, 15),
    read: false,
  },
  {
    id: "sn-2",
    shipmentId: "PT-SHP-90001",
    type: "shipment_started",
    title: "Shipment Started",
    message: "PT-ORD-90001 dispatched from Jamnagar via TCI",
    at: iso(0, 9, 5),
    read: false,
  },
  {
    id: "sn-3",
    shipmentId: "PT-ORD-88206",
    type: "reached_checkpoint",
    title: "Reached Checkpoint",
    message: "PT-ORD-88206 crossed Indore corridor checkpoint",
    at: iso(0, 7, 40),
    read: false,
  },
  {
    id: "sn-4",
    shipmentId: "PT-ORD-88215",
    type: "delivery_tomorrow",
    title: "Delivery Tomorrow",
    message: "PT-ORD-88215 expected at Mumbai buyer site within 3 hours",
    at: iso(0, 6, 20),
    read: true,
  },
  {
    id: "sn-5",
    shipmentId: "PT-ORD-88208",
    type: "delivered",
    title: "Delivered Successfully",
    message: "PT-ORD-88208 delivered in Delhi · POD verified",
    at: iso(1, 11, 15),
    read: true,
  },
  {
    id: "sn-6",
    shipmentId: "PT-SHP-90002",
    type: "reached_checkpoint",
    title: "Delay Alert",
    message: "PT-ORD-90002 delayed near Nagpur due to congestion",
    at: iso(0, 10, 0),
    read: false,
  },
  {
    id: "sn-7",
    shipmentId: "PT-SHP-90007",
    type: "delivery_tomorrow",
    title: "Out For Delivery",
    message: "PT-ORD-90007 is out for delivery in Kolkata",
    at: iso(0, 8, 50),
    read: false,
  },
  {
    id: "sn-8",
    shipmentId: "PT-ORD-88209",
    type: "delivered",
    title: "Delivered Successfully",
    message: "PT-ORD-88209 delivered in Kolkata · POD captured",
    at: iso(2, 12, 0),
    read: true,
  },
];

export function computeShipmentSummary(
  shipments: ShipmentRecord[],
): ShipmentDashboardSummary {
  const today = "2026-08-03";
  const weekStart = new Date("2026-07-28T00:00:00+05:30").getTime();

  return {
    activeShipments: shipments.filter((s) => s.currentStatus !== "delivered")
      .length,
    inTransit: shipments.filter((s) =>
      ["in_transit", "out_for_delivery", "dispatched"].includes(
        s.currentStatus,
      ),
    ).length,
    expectedToday: shipments.filter(
      (s) => s.currentStatus !== "delivered" && s.eta.slice(0, 10) === today,
    ).length,
    deliveredThisWeek: shipments.filter(
      (s) =>
        s.currentStatus === "delivered" &&
        new Date(s.updatedAt).getTime() >= weekStart,
    ).length,
    delayedShipments: shipments.filter((s) => s.currentStatus === "delayed")
      .length,
  };
}
