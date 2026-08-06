"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ban,
  Copy,
  Download,
  Eye,
  FileText,
  Headset,
  MoreHorizontal,
  Package,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES, purchaseRequestsFiltered } from "@/constants";
import type { PurchaseRequestSummary } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProcurementRowActionsMenuProps {
  item: PurchaseRequestSummary;
}

function purchaseRequestHref(item: PurchaseRequestSummary): string {
  switch (item.status) {
    case "pending_seller_approval":
      return purchaseRequestsFiltered("pending");
    case "approved":
      return purchaseRequestsFiltered("approved");
    case "cancelled":
      return purchaseRequestsFiltered("rejected");
    default:
      return purchaseRequestsFiltered("active");
  }
}

function viewHref(item: PurchaseRequestSummary): string {
  if (item.status === "in_transit") return ROUTES.shipmentTracking;
  if (item.orderId) return ROUTES.orders;
  return purchaseRequestHref(item);
}

export function ProcurementRowActionsMenu({
  item,
}: ProcurementRowActionsMenuProps) {
  const router = useRouter();
  const canWithdraw = item.status === "pending_seller_approval";
  const hasOrder = Boolean(item.orderId);
  const isInTransit = item.status === "in_transit";

  function copyRequestId() {
    void navigator.clipboard.writeText(item.displayId.replace("#", ""));
    toast.success(`${item.displayId} copied`);
  }

  function withdrawRequest() {
    toast.success(`${item.displayId} withdrawal submitted`);
  }

  function downloadDocuments() {
    toast.success(`Downloading documents for ${item.displayId}`);
    router.push(ROUTES.documents);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-500 hover:text-brand"
        aria-label={`View ${item.displayId}`}
      >
        <Link href={viewHref(item)}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-brand data-[state=open]:bg-brand data-[state=open]:text-white"
            aria-label={`More actions for ${item.displayId}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link href={purchaseRequestHref(item)}>
              <Eye className="h-4 w-4" />
              View Purchase Request
            </Link>
          </DropdownMenuItem>

          {hasOrder ? (
            <DropdownMenuItem asChild>
              <Link href={ROUTES.orders}>
                <Package className="h-4 w-4" />
                View Order
              </Link>
            </DropdownMenuItem>
          ) : null}

          {isInTransit ? (
            <DropdownMenuItem asChild>
              <Link href={ROUTES.shipmentTracking}>
                <Truck className="h-4 w-4" />
                Track Shipment
              </Link>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem onClick={downloadDocuments}>
            <Download className="h-4 w-4" />
            Download Documents
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={ROUTES.documents}>
              <FileText className="h-4 w-4" />
              View PO / Invoice
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={copyRequestId}>
            <Copy className="h-4 w-4" />
            Copy Request ID
          </DropdownMenuItem>

          {canWithdraw ? (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={withdrawRequest}
            >
              <Ban className="h-4 w-4" />
              Withdraw Request
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={ROUTES.support}>
              <Headset className="h-4 w-4" />
              Contact Support
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
