import { ROUTES } from "@/constants";
import type { ShipmentStatus } from "@/types/shipment-tracking";

export const SHIPMENT_WAREHOUSES = [
  "Jamnagar",
  "Hazira",
  "Dahej",
  "Mundra",
  "Panipat",
  "Paradip",
] as const;

export const SHIPMENT_DESTINATIONS = [
  { city: "Delhi", state: "Delhi" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Bangalore", state: "Karnataka" },
] as const;

export const SHIPMENT_VEHICLES = [
  "GJ01AB4567",
  "MH12CD7854",
  "RJ14EF2345",
  "GJ05XY9821",
  "HR55MN3344",
  "TN09PK6678",
  "WB20QR1122",
  "KA03ST8890",
] as const;

export const SHIPMENT_TRANSPORTERS = [
  "TCI",
  "VRL Logistics",
  "Mahindra Logistics",
  "Blue Dart B2B",
  "Delhivery Enterprise",
] as const;

export const SHIPMENT_DRIVERS = [
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
  { name: "Amit Yadav", mobile: "+91 97654 88901", license: "MH-2020-551908" },
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

export const SHIPMENT_STATUS_CHIP: Record<
  ShipmentStatus,
  { label: string; className: string }
> = {
  ready_for_dispatch: {
    label: "Ready",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  vehicle_assigned: {
    label: "Assigned",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  dispatched: {
    label: "Dispatched",
    className: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  in_transit: {
    label: "Transit",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    className: "border-violet-200 bg-violet-50 text-violet-800",
  },
  delivered: {
    label: "Delivered",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  delayed: {
    label: "Delayed",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export function shipmentDetailPath(id: string): string {
  return `${ROUTES.shipmentTracking}/${id}`;
}
