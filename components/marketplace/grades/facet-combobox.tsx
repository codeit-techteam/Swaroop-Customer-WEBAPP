"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FacetComboboxOption {
  value: string;
  label: string;
  count?: number;
}

interface FacetComboboxProps {
  id?: string;
  value: string | null;
  options: FacetComboboxOption[];
  onChange: (value: string | null) => void;
  placeholder: string;
  allLabel: string;
  searchPlaceholder?: string;
  /** When provided, filtering happens server-side via this callback. */
  onSearchChange?: (search: string) => void;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  disabled?: boolean;
  className?: string;
}

const MAX_VISIBLE = 200;

export function FacetCombobox({
  id,
  value,
  options,
  onChange,
  placeholder,
  allLabel,
  searchPlaceholder = "Search…",
  onSearchChange,
  onOpenChange,
  loading,
  error,
  onRetry,
  disabled,
  className,
}: FacetComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const matches = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (onSearchChange || !needle) return options;
    return options.filter((o) => o.label.toLowerCase().includes(needle));
  }, [options, search, onSearchChange]);
  const visible = matches.slice(0, MAX_VISIBLE);
  const hiddenCount = matches.length - visible.length;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
    if (!next && search) {
      setSearch("");
      onSearchChange?.("");
    }
  }

  function select(next: string | null) {
    onChange(next);
    handleOpenChange(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-xl border-slate-200 bg-white px-3 font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{value ?? placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[260px] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={(next) => {
              setSearch(next);
              onSearchChange?.(next);
            }}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
              </div>
            ) : null}
            {error && !loading ? (
              <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-red-600">
                <span>Unable to load options.</span>
                {onRetry ? (
                  <button
                    type="button"
                    className="font-medium underline"
                    onClick={onRetry}
                  >
                    Retry
                  </button>
                ) : null}
              </div>
            ) : (
              <CommandEmpty>No matches.</CommandEmpty>
            )}
            <CommandItem
              value="__all"
              onSelect={() => select(null)}
              className="text-muted-foreground"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value ? "opacity-0" : "opacity-100",
                )}
              />
              {allLabel}
            </CommandItem>
            {visible.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => select(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    option.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{option.label}</span>
                {option.count != null ? (
                  <span className="ml-auto pl-2 text-xs tabular-nums text-muted-foreground">
                    {option.count.toLocaleString("en-IN")}
                  </span>
                ) : null}
              </CommandItem>
            ))}
            {hiddenCount > 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                {hiddenCount.toLocaleString("en-IN")} more — refine your search.
              </p>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
