"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocumentsStore } from "@/store/documentsStore";

export function UploadSupportingDocumentDialog() {
  const open = useDocumentsStore((s) => s.uploadOpen);
  const setUploadOpen = useDocumentsStore((s) => s.setUploadOpen);
  const purchaseOrders = useDocumentsStore((s) => s.purchaseOrders);
  const addSupportingUpload = useDocumentsStore((s) => s.addSupportingUpload);

  const orders = useMemo(
    () => Array.from(new Set(purchaseOrders.map((p) => p.orderNumber))).sort(),
    [purchaseOrders],
  );

  const [orderNumber, setOrderNumber] = useState(orders[0] ?? "");
  const [fileName, setFileName] = useState("");

  const handleSubmit = () => {
    const name = fileName.trim() || "supporting-document.pdf";
    const order = orderNumber || orders[0];
    if (!order) {
      toast.error("No order available");
      return;
    }
    addSupportingUpload(name.endsWith(".pdf") ? name : `${name}.pdf`, order);
    toast.success("Supporting document uploaded");
    setFileName("");
  };

  return (
    <Dialog open={open} onOpenChange={setUploadOpen}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Upload Supporting Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Linked Order</Label>
            <Select
              value={orderNumber || orders[0]}
              onValueChange={setOrderNumber}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select order" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>File Name</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. bank-guarantee.pdf"
              className="rounded-xl"
            />
            <p className="text-xs text-slate-500">
              Frontend demo upload — file is registered in Downloads without a
              real network transfer.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setUploadOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-brand hover:bg-brand-700"
            onClick={handleSubmit}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
