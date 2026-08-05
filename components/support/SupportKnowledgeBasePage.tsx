"use client";

import { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE_CATEGORY_LABELS } from "@/constants/support";
import type { KnowledgeCategoryId } from "@/types/support";
import { filterArticles, useSupportStore } from "@/store/supportStore";
import { SupportPageHeader } from "./SupportPageHeader";
import { SupportLoadingSkeleton } from "./SupportModuleShell";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<KnowledgeCategoryId | "all"> = [
  "all",
  "orders",
  "payments",
  "credit",
  "invoices",
  "logistics",
  "marketplace",
];

export function SupportKnowledgeBasePage() {
  const isHydrated = useSupportStore((s) => s.isHydrated);
  const articles = useSupportStore((s) => s.articles);
  const globalSearch = useSupportStore((s) => s.globalSearch);
  const knowledgePreviewId = useSupportStore((s) => s.knowledgePreviewId);
  const setKnowledgePreviewId = useSupportStore((s) => s.setKnowledgePreviewId);
  const [category, setCategory] = useState<KnowledgeCategoryId | "all">("all");

  if (!isHydrated) return <SupportLoadingSkeleton />;

  const filtered = filterArticles(articles, globalSearch, category);
  const popular = articles.filter((a) => a.popular);
  const preview = articles.find((a) => a.id === knowledgePreviewId);

  return (
    <div className="space-y-6">
      <SupportPageHeader
        title="Knowledge Base"
        subtitle="Search playbooks for orders, payments, credit, invoices, logistics and marketplace."
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-brand">Popular Topics</h2>
        <div className="flex flex-wrap gap-2">
          {popular.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setKnowledgePreviewId(a.id)}
              className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-sky-50 hover:text-brand hover:ring-sky-200"
            >
              {a.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              category === c
                ? "bg-brand text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand",
            )}
          >
            {c === "all" ? "All Categories" : KNOWLEDGE_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((article) => (
          <Card
            key={article.id}
            className="rounded-2xl border-slate-200/80 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-accent-blue">
                  <BookOpen className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {KNOWLEDGE_CATEGORY_LABELS[article.category]}
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-brand">
                {article.title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-slate-500">
                {article.shortDescription}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {article.readTime} read
                </span>
                <Button
                  variant="link"
                  className="h-auto gap-1 p-0 text-sm font-semibold text-accent-blue"
                  onClick={() => setKnowledgePreviewId(article.id)}
                >
                  Read More
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-slate-400">
          No articles match your filters.
        </p>
      ) : null}

      <Dialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setKnowledgePreviewId(null);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-lg">
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-brand">
                  {preview.title}
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs font-medium text-slate-400">
                {KNOWLEDGE_CATEGORY_LABELS[preview.category]} ·{" "}
                {preview.readTime} read
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                {preview.content}
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
