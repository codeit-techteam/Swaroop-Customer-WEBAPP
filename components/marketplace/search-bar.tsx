"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchSuggestions } from "@/components/search/search-suggestions";
import { ROUTES } from "@/constants";
import { materialsFromCatalog } from "@/lib/material-taxonomy";
import {
  flattenSearchSuggestions,
  getGradeSearchSuggestions,
  type GradeSearchSuggestionItem,
} from "@/lib/grade-search";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { cn } from "@/lib/utils";

interface MarketplaceSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarketplaceSearchBar({
  value,
  onChange,
  placeholder = "Search Grade, CAS No., or Application...",
  className,
}: MarketplaceSearchBarProps) {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimer = useRef<number>(0);
  const products = useMarketplaceStore((s) => s.products);

  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const taxonomy = useMemo(() => materialsFromCatalog(products), [products]);
  const suggestions = useMemo(
    () => getGradeSearchSuggestions(products, taxonomy, value),
    [products, taxonomy, value],
  );
  const items = useMemo(
    () => flattenSearchSuggestions(suggestions, listId),
    [suggestions, listId],
  );

  const query = value.trim();
  const showSuggestions = focused && query.length > 0 && !dismissed;
  const activeItem = items[activeIndex] ?? null;

  useEffect(() => {
    setActiveIndex(0);
  }, [value]);

  useEffect(() => {
    return () => window.clearTimeout(blurTimer.current);
  }, []);

  useEffect(() => {
    if (!showSuggestions || !activeItem) return;
    document
      .getElementById(activeItem.id)
      ?.scrollIntoView({ block: "nearest" });
  }, [showSuggestions, activeItem]);

  useEffect(() => {
    if (!showSuggestions) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setDismissed(true);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showSuggestions]);

  function selectItem(item: GradeSearchSuggestionItem) {
    if (item.type === "material") {
      onChange(item.material.code);
      setDismissed(true);
      return;
    }
    if (item.type === "product") {
      setDismissed(true);
      router.push(`${ROUTES.marketplaceProduct}/${item.product.id}`);
      return;
    }
    setDismissed(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(true);
      return;
    }

    if (!showSuggestions || items.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
      return;
    }

    if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      selectItem(activeItem);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative flex-1", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setDismissed(false);
        }}
        onFocus={() => {
          window.clearTimeout(blurTimer.current);
          setFocused(true);
          setDismissed(false);
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setFocused(false), 150);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm shadow-sm"
        role="combobox"
        aria-label="Search marketplace products"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? listId : undefined}
        aria-activedescendant={
          showSuggestions && activeItem ? activeItem.id : undefined
        }
        autoComplete="off"
      />
      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50">
          <SearchSuggestions
            suggestions={suggestions}
            items={items}
            activeId={activeItem?.id ?? null}
            listId={listId}
            onHover={(id) => {
              const index = items.findIndex((item) => item.id === id);
              if (index >= 0) setActiveIndex(index);
            }}
            onSelect={selectItem}
          />
        </div>
      ) : null}
    </div>
  );
}
