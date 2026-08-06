"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { PurchaseRequestSummary } from "@/types/dashboard";
import { ROUTES } from "@/constants";
import { formatQuantityMt } from "@/lib/format";
import {
  getPurchaseRequestStatusLabel,
  PURCHASE_REQUEST_STATUS_TONE,
} from "@/lib/purchase-request-status";
import { SectionTitle } from "@/components/dashboard/section-title";
import { ProcurementRowActionsMenu } from "@/components/dashboard/procurement-row-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusBadgeClass } from "@/utils/statusColor";
import { cn } from "@/lib/utils";

interface ProcurementTableProps {
  rows: PurchaseRequestSummary[];
  className?: string;
}

const columnHelper = createColumnHelper<PurchaseRequestSummary>();

const toneVariantMap = {
  default: "secondary",
  success: "success",
  warning: "warning",
  danger: "destructive",
  info: "info",
  neutral: "outline",
} as const;

export function ProcurementTable({ rows, className }: ProcurementTableProps) {
  const columns = [
    columnHelper.accessor("displayId", {
      header: "Request ID",
      cell: (info) => (
        <span className="font-semibold text-slate-800">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("material", {
      header: "Material",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <p className="font-medium text-slate-800">{row.material}</p>
            <p className="text-xs text-slate-400">{row.materialDetail}</p>
          </div>
        );
      },
    }),
    columnHelper.accessor("quantityMt", {
      header: "Quantity",
      cell: (info) => (
        <span className="tabular-nums text-slate-700">
          {formatQuantityMt(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Current Status",
      cell: (info) => {
        const status = info.getValue();
        const tone = PURCHASE_REQUEST_STATUS_TONE[status];
        return (
          <Badge
            variant={toneVariantMap[tone]}
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium",
              statusBadgeClass(status),
            )}
          >
            {getPurchaseRequestStatusLabel(status)}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ProcurementRowActionsMenu item={row.original} />,
    }),
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className={cn("border-slate-200/80", className)}>
      <CardHeader className="pb-3">
        <SectionTitle
          title="Active Purchase Requests"
          actionLabel="View All"
          actionHref={ROUTES.orders}
        />
      </CardHeader>
      <CardContent className="px-0 pb-2 sm:px-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-slate-100">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
