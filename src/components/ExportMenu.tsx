"use client";

import { useState } from "react";
import { Download, FileText, File, ChevronDown, Loader2 } from "lucide-react";
import { exportSummaryAsPDF, exportSummaryAsUDF } from "@/lib/export";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SummaryData {
  originalText: string;
  resultText: string;
  charCount: number;
  summaryCharCount: number | null;
  wordCount: number | null;
  summaryWordCount: number | null;
  sentenceCount: number | null;
  summarySentenceCount: number | null;
  readingTime: number | null;
  summaryReadingTime: number | null;
  createdAt: Date | string;
}

interface ExportMenuProps {
  data: SummaryData;
  compact?: boolean;
}

export function ExportMenu({ data, compact = false }: ExportMenuProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"pdf" | "udf" | null>(null);

  const isPro = session?.user?.subscription === "pro";

  async function handleExport(type: "pdf" | "udf") {
    setLoading(type);
    try {
      if (type === "pdf") {
        await exportSummaryAsPDF(data);
      } else {
        await exportSummaryAsUDF(data);
      }
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setLoading(null);
      setOpen(false);
    }
  }

  if (!isPro) {
    return (
      <Link
        href="/upgrade"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark border border-primary/20 px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-all"
      >
        <Download className="h-3.5 w-3.5" />
        Dışa Aktar (Pro)
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
          open
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "text-muted-foreground hover:text-foreground border-border hover:bg-muted"
        }`}
      >
        <Download className="h-3.5 w-3.5" />
        {compact ? "" : "Dışa Aktar"}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-amber-200/60 rounded-xl shadow-lg shadow-amber-200/20 py-1 min-w-[160px]">
            <div className="px-3 py-1.5 border-b border-amber-100 mb-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Dışa Aktar</span>
            </div>
            <button
              onClick={() => handleExport("pdf")}
              disabled={!!loading}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-amber-50/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 text-red-500" />
              )}
              PDF İndir
            </button>
            <button
              onClick={() => handleExport("udf")}
              disabled={!!loading}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-amber-50/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading === "udf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <File className="h-4 w-4 text-blue-500" />
              )}
              UDF İndir
            </button>
          </div>
        </>
      )}
    </div>
  );
}
