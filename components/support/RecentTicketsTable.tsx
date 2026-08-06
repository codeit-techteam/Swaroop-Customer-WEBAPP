"use client";

import { Eye, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getMvpStatus,
  MVP_STATUS_CLASS,
  TICKET_CATEGORY_LABELS,
} from "@/constants/support";
import { useSupportStore } from "@/store/supportStore";
import { formatRelativeTime } from "./support-format";
import { cn } from "@/lib/utils";

export function RecentTicketsTable() {
  const tickets = useSupportStore((s) => s.tickets);
  const setSelectedTicketId = useSupportStore((s) => s.setSelectedTicketId);

  const recent = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        My Recent Tickets
      </h2>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No tickets yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Raise a ticket above if you need help from our team.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="font-semibold">Ticket ID</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((ticket) => {
                  const mvpStatus = getMvpStatus(ticket.status);
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium text-brand">
                        {ticket.ticketId}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {TICKET_CATEGORY_LABELS[ticket.category]}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-700">
                        {ticket.subject}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-500">
                        {formatRelativeTime(ticket.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                            MVP_STATUS_CLASS[mvpStatus],
                          )}
                        >
                          {mvpStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-brand hover:bg-sky-50 hover:text-brand"
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  );
}
