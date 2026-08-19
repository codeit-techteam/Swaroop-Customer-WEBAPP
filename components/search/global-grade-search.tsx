"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradeSearchModal } from "./grade-search-modal";
import { cn } from "@/lib/utils";

interface GlobalGradeSearchProps {
  className?: string;
}

export function GlobalGradeSearch({ className }: GlobalGradeSearchProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function openSearch() {
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(true);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "hidden min-w-0 flex-1 items-center gap-2 md:flex lg:max-w-xl",
          className,
        )}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            placeholder="Search grades…"
            className="h-10 rounded-full border-slate-200 bg-slate-50/80 pl-9 text-sm shadow-sm"
            aria-label="Search products by grade"
          />
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 rounded-full bg-brand px-4 hover:bg-brand-700"
          onClick={openSearch}
        >
          <Search className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full md:hidden"
        onClick={openSearch}
        aria-label="Search grades"
      >
        <Search className="h-4 w-4" />
      </Button>

      <GradeSearchModal
        open={open}
        onOpenChange={setOpen}
        initialQuery={draft}
      />
    </>
  );
}
