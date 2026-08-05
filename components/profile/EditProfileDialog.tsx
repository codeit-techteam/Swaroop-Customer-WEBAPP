"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getInitials } from "@/lib/profile-display";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  fullName: string;
  phone: string;
  designation: string;
  companyName: string;
  email: string;
  avatarUrl: string | null;
}

export function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const company = useProfileStore((s) => s.company);
  const updateCompany = useProfileStore((s) => s.updateCompany);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    designation: "",
    companyName: "",
    email: "",
    avatarUrl: null,
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      fullName: user?.name ?? "",
      phone: user?.phone ?? company.phone,
      designation: user?.designation ?? user?.role ?? "Procurement Manager",
      companyName: user?.companyName ?? company.legalName,
      email: user?.email ?? company.email,
      avatarUrl: user?.avatarUrl ?? null,
    });
  }, [open, user, company]);

  const initials = getInitials(form.fullName || "PT");

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        avatarUrl: typeof reader.result === "string" ? reader.result : null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const fullName = form.fullName.trim();
    if (!fullName) {
      toast.error("Full name is required");
      return;
    }

    updateUser({
      name: fullName,
      phone: form.phone.trim(),
      designation: form.designation.trim() || "Procurement Manager",
      role: form.designation.trim() || "Procurement Manager",
      companyName: form.companyName.trim() || company.legalName,
      avatarUrl: form.avatarUrl,
    });

    updateCompany({
      legalName: form.companyName.trim() || company.legalName,
      phone: form.phone.trim() || company.phone,
    });

    toast.success("Profile updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your basic account details. Changes are saved on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Change profile picture"
            >
              <Avatar className="h-20 w-20 border-2 border-slate-200">
                {form.avatarUrl ? (
                  <AvatarImage src={form.avatarUrl} alt={form.fullName} />
                ) : null}
                <AvatarFallback className="bg-brand text-lg font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/45 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-slate-500">Tap to change photo</p>
          </div>

          <div className="space-y-3">
            <Field
              id="edit-full-name"
              label="Full Name"
              value={form.fullName}
              onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
            />
            <Field
              id="edit-phone"
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
            />
            <Field
              id="edit-designation"
              label="Designation"
              value={form.designation}
              onChange={(v) => setForm((p) => ({ ...p, designation: v }))}
            />
            <Field
              id="edit-company"
              label="Company Name"
              value={form.companyName}
              onChange={(v) => setForm((p) => ({ ...p, companyName: v }))}
            />
            <Field
              id="edit-email"
              label="Email"
              value={form.email}
              disabled
              onChange={() => undefined}
            />
          </div>
        </div>

        <DialogFooter className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-brand hover:bg-brand-700"
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-700">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border-slate-200"
      />
    </div>
  );
}
