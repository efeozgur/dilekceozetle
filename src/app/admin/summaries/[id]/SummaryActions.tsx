"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSummary } from "../actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Trash2 } from "lucide-react";

interface SummaryActionsProps {
  summaryId: string;
}

export function SummaryActions({ summaryId }: SummaryActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSummary(summaryId);
      if (result.ok) {
        router.push("/admin/summaries");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={pending}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Sil
      </button>

      {showConfirm && (
        <ConfirmDialog
          title="Özeti Sil"
          message="Bu özeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
