import type { MarketplaceWarehouse } from "@/types/marketplace";

/** Warehouse / origin locations from Customer App market products. */
export const warehousesMock: MarketplaceWarehouse[] = [
  {
    id: "wh-all",
    name: "All Regions",
    region: "All",
    location: "All Regions",
  },
  {
    id: "wh-jamnagar",
    name: "Jamnagar",
    region: "Gujarat",
    location: "Jamnagar, GJ",
  },
  {
    id: "wh-hazira",
    name: "Hazira",
    region: "Gujarat",
    location: "Hazira, GJ",
  },
  {
    id: "wh-dahej",
    name: "Dahej",
    region: "Gujarat",
    location: "Dahej, GJ",
  },
  {
    id: "wh-mundra",
    name: "Mundra",
    region: "Gujarat",
    location: "Mundra, GJ",
  },
  {
    id: "wh-bathinda",
    name: "Bathinda",
    region: "Punjab",
    location: "Bathinda, PB",
  },
  {
    id: "wh-panipat",
    name: "Panipat",
    region: "Haryana",
    location: "Panipat, HR",
  },
];

export const getWarehouseById = (
  id: string,
): MarketplaceWarehouse | undefined =>
  warehousesMock.find((warehouse) => warehouse.id === id);

export const getWarehouseByLocation = (
  location: string,
): MarketplaceWarehouse | undefined =>
  warehousesMock.find(
    (warehouse) =>
      warehouse.location.toLowerCase() === location.toLowerCase() ||
      location.toLowerCase().includes(warehouse.name.toLowerCase()),
  );
