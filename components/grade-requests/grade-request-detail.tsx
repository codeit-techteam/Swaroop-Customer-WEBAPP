"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { MarketplaceEmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES, marketplaceGradePath } from "@/constants";
import {
  GradeRequestError,
  cancelGradeRequest,
  fetchGradeRequest,
  getGradeRequestDocumentUrl,
  respondToGradeRequest,
  type GradeRequest,
} from "@/services/grade-requests";
import { GradeRequestStatusBadge } from "./status-badge";

export function GradeRequestDetail({ id }: { id: string }) {
  const [request, setRequest] = useState<GradeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<GradeRequestError | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRequest(await fetchGradeRequest(id));
      setError(null);
    } catch (e) {
      setError(
        e instanceof GradeRequestError
          ? e
          : new GradeRequestError("Unable to load this request."),
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(fn: () => Promise<GradeRequest>) {
    setBusy(true);
    setActionError(null);
    try {
      setRequest(await fn());
      setReply("");
      setConfirmCancel(false);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function openDocument(documentId: string) {
    try {
      const url = await getGradeRequestDocumentUrl(id, documentId);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else setActionError("This file cannot be opened right now.");
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Unable to open the file.",
      );
    }
  }

  if (loading) {
    return (
      <PageContainer className="max-w-3xl space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </PageContainer>
    );
  }

  if (error || !request) {
    return (
      <PageContainer className="max-w-3xl">
        <MarketplaceEmptyState
          title={
            error?.status === 404
              ? "Request not found"
              : "Unable to load this request"
          }
          description={error?.message ?? "Something went wrong."}
          action={
            error?.status === 404 ? (
              <Button
                asChild
                className="rounded-xl bg-brand hover:bg-brand-700"
              >
                <Link href="/marketplace/grade-requests">
                  My grade requests
                </Link>
              </Button>
            ) : (
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => void load()}
              >
                Retry
              </Button>
            )
          }
        />
      </PageContainer>
    );
  }

  const r = request;
  const rows: Array<[string, string | null]> = [
    ["Material", r.materialCategory],
    ["Manufacturer", r.manufacturer],
    ["Grade group", r.gradeGroup],
    ["Application", r.application],
    ["Quantity", `${r.quantity} ${r.unit}`],
    [
      "Delivery",
      [r.deliveryLocation, r.deliveryPincode].filter(Boolean).join(" – "),
    ],
    ["Required by", r.requiredByDate],
    ["Packaging", r.preferredPackaging],
    ["Contact", `${r.contactName} · ${r.contactPhone}`],
  ];

  return (
    <PageContainer className="max-w-3xl space-y-5">
      <PageHeader
        title={r.gradeName}
        description={r.referenceNumber}
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "Grade requests", href: "/marketplace/grade-requests" },
          { label: r.referenceNumber },
        ]}
        actions={
          <GradeRequestStatusBadge status={r.status} label={r.statusLabel} />
        }
      />

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
        <p className="text-sm text-slate-600">{r.statusDescription}</p>
        {r.adminMessage ? (
          <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Message from PolyStoreX
            </span>
            {r.adminMessage}
          </p>
        ) : null}
        {r.closureReason &&
        (r.status === "REJECTED" || r.status === "CLOSED") ? (
          <p className="mt-3 text-sm text-slate-700">
            Reason: {r.closureReason}
          </p>
        ) : null}
        {r.resolvedGrade ? (
          <Button
            asChild
            className="mt-4 rounded-xl bg-brand hover:bg-brand-700"
          >
            <Link href={marketplaceGradePath(r.resolvedGrade.id)}>
              View grade {r.resolvedGrade.name}
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        ) : null}
      </div>

      {r.awaitingCustomerResponse ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <h2 className="text-sm font-semibold text-orange-900">
            Your response is needed
          </h2>
          <Textarea
            aria-label="Your response"
            className="mt-3 bg-white"
            rows={4}
            maxLength={2000}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type the information we asked for"
          />
          <Button
            className="mt-3 rounded-xl bg-brand hover:bg-brand-700"
            disabled={busy || reply.trim().length < 2}
            onClick={() =>
              void act(() => respondToGradeRequest(r.id, reply.trim()))
            }
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send response
          </Button>
        </div>
      ) : null}

      {actionError ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {actionError}
        </p>
      ) : null}

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Request details
        </h2>
        <dl className="divide-y divide-slate-100 text-sm">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 py-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="col-span-2 font-medium text-slate-800">{v}</dd>
              </div>
            ))}
        </dl>
        {r.technicalSpecs ? (
          <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            {r.technicalSpecs}
          </p>
        ) : null}
      </section>

      {r.documents.length ? (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Attachments
          </h2>
          <ul className="space-y-1">
            {r.documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate">{d.fileName}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void openDocument(d.id)}
                >
                  Open
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Progress
        </h2>
        <ol className="space-y-4">
          {[...r.timeline].reverse().map((e) => (
            <li key={e.id} className="relative border-l border-slate-200 pl-4">
              <span className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-brand" />
              <p className="text-sm font-medium text-slate-900">
                {e.toStatusLabel ?? e.type.replaceAll("_", " ").toLowerCase()}
              </p>
              {e.message ? (
                <p className="whitespace-pre-wrap text-sm text-slate-600">
                  {e.message}
                </p>
              ) : null}
              <p className="mt-0.5 text-xs text-slate-400">
                {e.actor === "YOU" ? "You" : "PolyStoreX"} ·{" "}
                {new Date(e.createdAt).toLocaleString("en-IN")}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {r.isOpen ? (
        <div className="text-center">
          {confirmCancel ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm">
              <span>Cancel this request?</span>
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={() => void act(() => cancelGradeRequest(r.id))}
              >
                Yes, cancel
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmCancel(false)}
              >
                Keep
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="text-red-600"
              onClick={() => setConfirmCancel(true)}
            >
              Cancel request
            </Button>
          )}
        </div>
      ) : null}
    </PageContainer>
  );
}
