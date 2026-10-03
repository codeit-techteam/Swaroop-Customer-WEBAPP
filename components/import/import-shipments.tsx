"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Search,
  Ship,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useImportShipments } from "@/hooks/use-import";
import { IMPORT_OWN_PARTY, IMPORT_ROUTES } from "@/lib/import/config";
import {
  formatDate,
  formatDateTime,
  formatQty,
  importLabel,
  parseImportError,
} from "@/lib/import/format";
import { SHIPMENT_STATUSES, shipmentTimeline } from "@/lib/import/shipment";
import { cn } from "@/lib/utils";
import type { ImportShipment, ImportShipmentStatus } from "@/types/import";
import {
  EmptyList,
  ErrorPanel,
  ImportPage,
  ImportStatusBadge,
  KeyValueGrid,
  ListSkeleton,
  Pager,
} from "./import-ui";

const ETA_MISSING = "ETA not available yet";

const route = (s: ImportShipment) =>
  s.originLocation || s.destinationLocation
    ? `${s.originLocation ?? "—"} → ${s.destinationLocation ?? "—"}`
    : null;

// Deal detail section ----------------------------------------------------------

export function ImportShipmentTracking({
  shipments,
  dealConfirmedAt,
}: {
  shipments: ImportShipment[];
  dealConfirmedAt: string | null;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Shipment tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {shipments.length ? (
          shipments.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              dealConfirmedAt={dealConfirmedAt}
            />
          ))
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
            <Ship className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              The seller has not booked a shipment yet. Tracking appears here
              once it is booked.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ShipmentCard({
  shipment: s,
  dealConfirmedAt,
}: {
  shipment: ImportShipment;
  dealConfirmedAt: string | null;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const cancelled = s.status === "CANCELLED";

  return (
    <div className="space-y-4 rounded-2xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{s.referenceNumber}</p>
          <p className="text-xs text-muted-foreground">
            {importLabel(s.mode)} · {formatQty(s.quantity, s.quantityUnit)} ·
            Updated {formatDateTime(s.updatedAt)}
          </p>
        </div>
        <ImportStatusBadge status={s.status} />
      </div>

      {s.status === "EXCEPTION" ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">This shipment has an exception</p>
            <p className="mt-0.5 whitespace-pre-line">
              {s.exceptionReason ??
                "The seller reported a problem with this shipment."}
            </p>
          </div>
        </div>
      ) : null}
      {cancelled ? (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This shipment was cancelled
            {s.cancelledAt ? ` on ${formatDateTime(s.cancelledAt)}` : ""}. Its
            quantity no longer counts towards the deal.
          </p>
        </div>
      ) : null}

      <ShipmentTimeline
        shipment={s}
        dealConfirmedAt={dealConfirmedAt}
        muted={cancelled}
      />

      <KeyValueGrid
        items={[
          { label: "Quantity", value: formatQty(s.quantity, s.quantityUnit) },
          { label: "Mode", value: importLabel(s.mode) },
          { label: "Carrier", value: s.carrierName },
          { label: "Tracking no. (B/L / AWB / LR)", value: s.trackingNumber },
          {
            label: "Vessel / voyage",
            value: [s.vesselName, s.voyageNumber].filter(Boolean).join(" · "),
          },
          {
            label: "Containers",
            value: s.containerNumbers.length
              ? s.containerNumbers.join(", ")
              : null,
          },
          { label: "Route", value: route(s), wide: true },
          { label: "ETD", value: s.etd ? formatDate(s.etd) : null },
          { label: "ETA", value: s.eta ? formatDate(s.eta) : ETA_MISSING },
          ...(s.deliveredAt
            ? [{ label: "Delivered", value: formatDateTime(s.deliveredAt) }]
            : []),
          ...(s.remarks
            ? [{ label: "Remarks", value: s.remarks, wide: true }]
            : []),
        ]}
      />

      {s.events.length ? (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2"
            aria-expanded={historyOpen}
            onClick={() => setHistoryOpen((o) => !o)}
          >
            <ChevronDown
              className={cn(
                "transition-transform",
                historyOpen && "rotate-180",
              )}
            />
            {historyOpen ? "Hide" : "Show"} event history ({s.events.length})
          </Button>
          {historyOpen ? (
            <ol className="relative mt-2 space-y-4 border-l border-slate-200 pl-5">
              {[...s.events].reverse().map((e) => (
                <li key={e.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white",
                      e.previousStatus === null && e.id !== s.events[0]?.id
                        ? "bg-slate-400"
                        : e.status === "EXCEPTION"
                          ? "bg-red-500"
                          : e.status === "DELIVERED"
                            ? "bg-emerald-500"
                            : "bg-primary",
                    )}
                  />
                  <p className="text-sm font-semibold">
                    {e.previousStatus === null && e.id !== s.events[0]?.id
                      ? "Update"
                      : importLabel(e.status)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(e.occurredAt)}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                  {e.description ? (
                    <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                      {e.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ShipmentTimeline({
  shipment,
  dealConfirmedAt,
  muted,
}: {
  shipment: ImportShipment;
  dealConfirmedAt: string | null;
  muted: boolean;
}) {
  const steps = shipmentTimeline(shipment, dealConfirmedAt);
  return (
    <ol
      aria-label="Shipment progress"
      className={cn(
        "grid gap-3 sm:grid-cols-4 lg:grid-cols-7",
        muted && "opacity-60",
      )}
    >
      {steps.map((step) => (
        <li key={step.key} className="flex gap-2 lg:flex-col">
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
              step.state === "done"
                ? "bg-emerald-100 text-emerald-700"
                : step.state === "current"
                  ? shipment.status === "EXCEPTION"
                    ? "bg-red-100 text-red-700"
                    : "bg-primary text-primary-foreground"
                  : "bg-slate-100 text-slate-400",
            )}
          >
            {step.state === "done" ? (
              <Check className="h-3.5 w-3.5" />
            ) : step.state === "current" && shipment.status === "EXCEPTION" ? (
              "!"
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "text-xs font-medium",
                step.state === "upcoming"
                  ? "text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {step.label}
            </p>
            {step.at && step.state !== "upcoming" ? (
              <p className="text-[11px] text-muted-foreground">
                {formatDate(step.at)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Shipments list -----------------------------------------------------------------

export function ImportShipmentsPage({
  initialStatus,
}: {
  initialStatus?: string;
}) {
  const [status, setStatus] = useState<ImportShipmentStatus | undefined>(
    SHIPMENT_STATUSES.includes(initialStatus as ImportShipmentStatus)
      ? (initialStatus as ImportShipmentStatus)
      : undefined,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim(), 300);
  const as = IMPORT_OWN_PARTY === "BUYER" ? "buyer" : "seller";
  const list = useImportShipments({
    status,
    search: debounced || undefined,
    as,
    page,
    limit: 20,
  });

  return (
    <ImportPage
      title="Shipments"
      description="Tracking for your confirmed import deals. Shipment details are updated by the seller."
      breadcrumbs={[{ label: "Shipments" }]}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reference, deal, tracking no. or carrier"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status ?? "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? undefined : (v as ImportShipmentStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {SHIPMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {importLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {list.isLoading ? (
        <ListSkeleton />
      ) : list.isError ? (
        <ErrorPanel
          message={parseImportError(list.error).message}
          onRetry={() => void list.refetch()}
        />
      ) : !list.data?.items.length ? (
        <EmptyList
          icon={Ship}
          title={
            debounced || status
              ? "Nothing matches these filters"
              : "No shipments yet"
          }
          description={
            debounced || status
              ? "Try another status or clear the search."
              : "Shipments appear here once a seller books one against your confirmed deal."
          }
        />
      ) : (
        <div className="space-y-3">
          {list.data.items.map((s) => (
            <Link
              key={s.id}
              href={IMPORT_ROUTES.dealDetail(s.deal.id)}
              className="block rounded-2xl border bg-card px-4 py-3.5 shadow-card transition-colors hover:border-primary/40 hover:bg-slate-50/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {s.referenceNumber} · Deal {s.deal.referenceNumber}
                  </p>
                  <p className="truncate text-[15px] font-semibold">
                    {s.deal.product ?? "—"}
                  </p>
                </div>
                <ImportStatusBadge status={s.status} />
              </div>
              <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                <span>
                  <span className="text-muted-foreground">Qty </span>
                  {formatQty(s.quantity, s.quantityUnit)} ·{" "}
                  {importLabel(s.mode)}
                </span>
                <span className="flex min-w-0 items-center gap-1 truncate">
                  <span className="text-muted-foreground">Route </span>
                  {s.originLocation ?? "—"}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  {s.destinationLocation ?? "—"}
                </span>
                <span className="truncate">
                  <span className="text-muted-foreground">Tracking </span>
                  {s.trackingNumber ?? "—"}
                </span>
                <span>
                  <span className="text-muted-foreground">ETA </span>
                  {s.eta ? formatDate(s.eta) : ETA_MISSING}
                </span>
              </div>
            </Link>
          ))}
          <Pager
            page={list.data.meta.page}
            totalPages={list.data.meta.totalPages}
            total={list.data.meta.total}
            onPage={setPage}
          />
        </div>
      )}
    </ImportPage>
  );
}
