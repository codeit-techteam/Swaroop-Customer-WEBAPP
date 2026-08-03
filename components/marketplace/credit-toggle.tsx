"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CreditToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CreditToggle({ checked, onChange }: CreditToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
      <div className="space-y-0.5">
        <Label
          htmlFor="credit-eligible-toggle"
          className="cursor-pointer text-sm font-semibold text-slate-900"
        >
          Credit Eligible
        </Label>
        <p className="text-xs text-slate-500">30-90 Day Terms</p>
      </div>
      <Switch
        id="credit-eligible-toggle"
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}
