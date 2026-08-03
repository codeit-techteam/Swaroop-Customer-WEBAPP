export type Id = string;

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface SelectOption<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Visual tone for sidebar notification / status badges */
export type NavBadgeVariant =
  | "default"
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface NavItem {
  /** Stable id used for expand/collapse persistence */
  id: string;
  title: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  /** Mock / live count shown as a badge */
  badge?: number;
  badgeVariant?: NavBadgeVariant;
  /** When true, item is an action (e.g. Logout) rather than a route */
  action?: "logout";
  children?: NavItem[];
}
