"use client";

import { Filter, Plus, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import {
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_LABELS,
} from "@/constants/support";
import type { TicketPriority, TicketStatus } from "@/types/support";
import { filterTickets, useSupportStore } from "@/store/supportStore";
import { SupportPageHeader } from "./SupportPageHeader";
import { SupportLoadingSkeleton } from "./SupportModuleShell";
import { TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";
import { formatSupportDate, formatSupportDateTime } from "./support-format";

export function SupportTicketsPage() {
  const isHydrated = useSupportStore((s) => s.isHydrated);
  const tickets = useSupportStore((s) => s.tickets);
  const filters = useSupportStore((s) => s.filters);
  const globalSearch = useSupportStore((s) => s.globalSearch);
  const setFilters = useSupportStore((s) => s.setFilters);
  const resetFilters = useSupportStore((s) => s.resetFilters);
  const setSelectedTicketId = useSupportStore((s) => s.setSelectedTicketId);
  const setRaiseTicketOpen = useSupportStore((s) => s.setRaiseTicketOpen);

  if (!isHydrated) return <SupportLoadingSkeleton />;

  const filtered = filterTickets(tickets, filters, globalSearch);

  return (
    <div className="space-y-6">
      <SupportPageHeader
        title="My Tickets"
        subtitle="Track open cases, respond to waiting requests, and review resolved history."
        hideSearch
      />

      <Card className="rounded-2xl border-slate-200/80 shadow-card">
        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative sm:col-span-2 xl:col-span-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  placeholder="Search tickets…"
                  className="h-10 rounded-xl pl-9"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(v) =>
                  setFilters({ status: v as TicketStatus | "all" })
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {TICKET_STATUS_LABELS[s]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select
                value={filters.priority}
                onValueChange={(v) =>
                  setFilters({ priority: v as TicketPriority | "all" })
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {TICKET_PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ dateFrom: e.target.value })}
                  className="h-10 rounded-xl"
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ dateTo: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                onClick={resetFilters}
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                className="h-10 rounded-xl bg-brand hover:bg-brand/90"
                onClick={() => setRaiseTicketOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Raise Ticket
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Ticket className="h-5 w-5" />}
              title="No tickets found"
              description="Adjust filters or raise a new support ticket."
              action={
                <Button
                  className="rounded-xl bg-brand hover:bg-brand/90"
                  onClick={() => setRaiseTicketOpen(true)}
                >
                  Raise New Ticket
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedTicketId(t.id)}
                    >
                      <TableCell className="font-semibold text-brand">
                        {t.ticketId}
                      </TableCell>
                      <TableCell>{t.categoryLabel}</TableCell>
                      <TableCell>
                        <TicketPriorityBadge priority={t.priority} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-600">
                        {formatSupportDate(t.createdAt)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {t.assignedTo}
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-500">
                        {formatSupportDateTime(t.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-accent-blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicketId(t.id);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
