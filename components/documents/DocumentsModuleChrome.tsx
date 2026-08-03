"use client";

import { useEffect } from "react";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { UploadSupportingDocumentDialog } from "./UploadSupportingDocumentDialog";
import { useDocumentsStore } from "@/store/documentsStore";

/** Shared shell pieces used across Documents routes */
export function DocumentsModuleChrome() {
  useEffect(() => {
    const finish = () => useDocumentsStore.getState().setHydrated(true);
    const unsub = useDocumentsStore.persist.onFinishHydration(finish);
    if (useDocumentsStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  return (
    <>
      <DocumentPreviewModal />
      <UploadSupportingDocumentDialog />
    </>
  );
}

export function DocumentsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-100" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}
