"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ROUTES } from "@/constants";
import { getAccessToken } from "@/lib/auth-session";
import { createPriceAlert, type PriceAlertUnit } from "@/services/price-alerts";

interface PriceAlertTriggerProps {
  gradeId: string;
  productId?: string;
  spotPricePerMt?: number;
}

export function PriceAlertTrigger({
  gradeId,
  productId,
  spotPricePerMt,
}: PriceAlertTriggerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [unit, setUnit] = useState<PriceAlertUnit>("MT");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (spotPricePerMt && Number.isFinite(spotPricePerMt)) {
      setTargetPrice(String(Math.round(spotPricePerMt)));
    }
  }, [open, spotPricePerMt]);

  function openDialog() {
    if (!getAccessToken()) {
      const next = `${window.location.pathname}${window.location.search}`;
      toast.message("Sign in to set a price alert");
      router.push(`${ROUTES.login}?next=${encodeURIComponent(next)}`);
      return;
    }
    setOpen(true);
  }

  async function onSave() {
    const price = targetPrice.trim();
    if (!/^\d+(\.\d{1,4})?$/.test(price)) {
      toast.error("Enter a valid target price");
      return;
    }
    setSaving(true);
    try {
      const alert = await createPriceAlert({
        gradeId,
        productId,
        targetPrice: price,
        unit,
        direction: "BELOW",
        enabled,
      });
      setOpen(false);
      const evaluationNote = alert.evaluation?.supported
        ? undefined
        : "Alerts are saved. Notifications will start when the evaluation worker is live.";
      toast.success("Price alert saved", {
        description:
          evaluationNote ??
          alert.evaluation?.reason ??
          "You will be notified when the target is met.",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save price alert",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full rounded-xl border-dashed text-xs font-semibold"
        onClick={openDialog}
      >
        <Bell className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Set price alert
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set price alert</DialogTitle>
            <DialogDescription>
              Save a target price for this grade. Alerts are stored now;
              notifications start when the evaluation worker is live — we will
              not fake triggers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alert-price">Target price</Label>
              <Input
                id="alert-price"
                inputMode="decimal"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="rounded-xl"
                placeholder="e.g. 148000"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={unit}
                onValueChange={(v) => setUnit(v as PriceAlertUnit)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT">₹ / MT</SelectItem>
                  <SelectItem value="KG">₹ / kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Enable alert
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-brand hover:bg-brand-700"
              disabled={saving}
              onClick={() => void onSave()}
            >
              {saving ? "Saving…" : "Save alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
