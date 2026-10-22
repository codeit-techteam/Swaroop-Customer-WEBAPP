"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deletePriceAlert,
  listPriceAlerts,
  updatePriceAlert,
  type PriceAlert,
} from "@/services/price-alerts";

export function PriceAlertsSection() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setAlerts(await listPriceAlerts());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load price alerts",
      );
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onToggle(alert: PriceAlert) {
    try {
      const updated = await updatePriceAlert(alert.id, {
        enabled: !alert.enabled,
      });
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? updated : a)));
      toast.success(updated.enabled ? "Alert enabled" : "Alert paused");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update alert",
      );
    }
  }

  async function onSaveEdit(id: string) {
    if (!/^\d+(\.\d{1,4})?$/.test(editPrice.trim())) {
      toast.error("Enter a valid target price");
      return;
    }
    try {
      const updated = await updatePriceAlert(id, {
        targetPrice: editPrice.trim(),
      });
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditingId(null);
      toast.success("Alert updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update alert",
      );
    }
  }

  async function onDelete(id: string) {
    try {
      await deletePriceAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Alert deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete alert",
      );
    }
  }

  const evaluationUnsupported = alerts.some((a) => !a.evaluation?.supported);

  return (
    <section className="space-y-3 border-t border-slate-100 pt-6">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-brand" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Price alerts
        </h2>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">
        Alerts are saved on your account. Notifications will start when the
        evaluation worker is live — we do not simulate triggers.
      </p>
      {evaluationUnsupported ? (
        <p className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs text-amber-800">
          Evaluation is not configured yet (
          <span className="font-medium">evaluation.supported: false</span>).
          Your targets remain stored.
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading alerts…</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-slate-500">
          No price alerts yet. Set one from a product page.
        </p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {alert.grade?.name ?? alert.gradeId}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Notify when price goes{" "}
                    {String(alert.direction).toLowerCase()}{" "}
                    {editingId === alert.id ? (
                      <Input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="mt-1 h-8 w-36 rounded-lg"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">
                        ₹{alert.targetPrice} / {alert.unit}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {alert.enabled ? "Enabled" : "Paused"}
                    {!alert.evaluation?.supported
                      ? " · evaluation not live"
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {editingId === alert.id ? (
                    <Button
                      size="sm"
                      className="h-8 rounded-lg"
                      onClick={() => void onSaveEdit(alert.id)}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg p-0"
                      title="Edit"
                      onClick={() => {
                        setEditingId(alert.id);
                        setEditPrice(alert.targetPrice);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg text-xs"
                    onClick={() => void onToggle(alert)}
                  >
                    {alert.enabled ? "Pause" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg p-0 text-red-600"
                    title="Delete"
                    onClick={() => void onDelete(alert.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
