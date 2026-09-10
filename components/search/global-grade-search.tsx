"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradeSearchModal } from "./grade-search-modal";
import { SearchSuggestions } from "./search-suggestions";
import { ROUTES } from "@/constants";
import { materialsTaxonomy } from "@/mock/materials-taxonomy";
import {
  flattenSearchSuggestions,
  getGradeSearchSuggestions,
  type GradeSearchSuggestionItem,
} from "@/lib/grade-search";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { cn } from "@/lib/utils";

interface GlobalGradeSearchProps {
  className?: string;
}

export function GlobalGradeSearch({ className }: GlobalGradeSearchProps) {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<number>(0);

  const products = useMarketplaceStore((s) => s.products);
  const setSearch = useMarketplaceStore((s) => s.setSearch);
  const setOriginFilter = useMarketplaceStore((s) => s.setOriginFilter);

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(
    () => getGradeSearchSuggestions(products, materialsTaxonomy, draft),
    [products, draft],
  );
  const items = useMemo(
    () => flattenSearchSuggestions(suggestions, listId),
    [suggestions, listId],
  );

  const query = draft.trim();
  const showSuggestions = focused && query.length > 0 && !dismissed;
  const activeItem = items[activeIndex] ?? null;

  useEffect(() => {
    setActiveIndex(0);
  }, [draft]);

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

  const goToMarketplace = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      setSearch(trimmed);
      setOriginFilter("all");
      setDismissed(true);
      setFocused(false);
      inputRef.current?.blur();
      const params = new URLSearchParams();
      if (trimmed) params.set("search", trimmed);
      const qs = params.toString();
      router.push(qs ? `${ROUTES.marketplace}?${qs}` : ROUTES.marketplace);
    },
    [router, setOriginFilter, setSearch],
  );

  const selectItem = useCallback(
    (item: GradeSearchSuggestionItem) => {
      if (item.type === "material") {
        setDraft(item.material.code);
        goToMarketplace(item.material.code);
        return;
      }
      if (item.type === "product") {
        setDraft(item.product.gradeCode ?? item.product.name);
        setDismissed(true);
        setFocused(false);
        inputRef.current?.blur();
        router.push(`${ROUTES.marketplaceProduct}/${item.product.id}`);
        return;
      }
      goToMarketplace(draft);
    },
    [draft, goToMarketplace, router],
  );

  function openModal() {
    setDismissed(true);
    setModalOpen(true);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (showSuggestions && activeItem) {
      selectItem(activeItem);
      return;
    }
    if (query) {
      goToMarketplace(query);
      return;
    }
    openModal();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(true);
      return;
    }

    if (!showSuggestions || items.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        if (query) goToMarketplace(query);
        else openModal();
      }
      return;
    }

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

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeItem) selectItem(activeItem);
    }
  }

  return (
    <>
      <form
        ref={containerRef}
        onSubmit={handleSubmit}
        className={cn(
          "relative hidden min-w-0 flex-1 items-center gap-2 md:flex lg:max-w-xl",
          className,
        )}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setDismissed(false);
            }}
            onFocus={() => {
              window.clearTimeout(blurTimer.current);
              setFocused(true);
              setDismissed(false);
            }}
            onBlur={() => {
              blurTimer.current = window.setTimeout(
                () => setFocused(false),
                150,
              );
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search grades, materials, CAS…"
            className="h-10 rounded-full border-slate-200 bg-slate-50/80 pl-9 text-sm shadow-sm"
            role="combobox"
            aria-label="Search products by grade"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? listId : undefined}
            aria-activedescendant={
              showSuggestions && activeItem ? activeItem.id : undefined
            }
            autoComplete="off"
          />
        </div>
        <Button
          type="submit"
          className="h-10 shrink-0 rounded-full bg-brand px-4 hover:bg-brand-700"
        >
          <Search className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Search</span>
        </Button>

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
      </form>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full md:hidden"
        onClick={openModal}
        aria-label="Search grades"
      >
        <Search className="h-4 w-4" />
      </Button>

      <GradeSearchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialQuery={draft}
      />
    </>
  );
}
