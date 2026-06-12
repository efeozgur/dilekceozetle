"use client";

import { Copy, Check, RotateCcw, FileText, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { useState, useCallback } from "react";
import { SummaryStats, type SummaryStatsData } from "./stats/SummaryStats";
import { ExportMenu } from "./ExportMenu";
import { Toast } from "./Toast";

interface SummaryResultProps {
  text: string;
  stats: SummaryStatsData;
  onReset: () => void;
  originalText?: string;
  createdAt?: Date | string;
}

export function SummaryResult({
  text,
  stats,
  onReset,
  originalText = "",
  createdAt,
}: SummaryResultProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setShowToast(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [text]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
            <Check className="h-3 w-3" />
            Hazır
          </span>
          <h3 className="text-sm font-semibold text-foreground">Özet Sonucu</h3>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          {text.length.toLocaleString("tr-TR")} karakter
        </span>
      </div>

      {/* Summary Text - PROMINENT */}
      <div className="relative p-6 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 border-l-4 border-l-indigo-500 rounded-2xl shadow-sm">
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-medium text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">
            ÖZET
          </span>
        </div>
        <p className="text-base leading-relaxed text-foreground font-medium whitespace-pre-wrap">
          {text}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border px-5 py-2.5 rounded-xl hover:bg-muted transition-all duration-200 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              Kopyalandı
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Kopyala
            </>
          )}
        </button>

        {originalText && (
          <ExportMenu
            data={{
              originalText,
              resultText: text,
              charCount: stats.charCount,
              summaryCharCount: stats.summaryCharCount,
              wordCount: stats.wordCount,
              summaryWordCount: stats.summaryWordCount,
              sentenceCount: stats.sentenceCount,
              summarySentenceCount: stats.summarySentenceCount,
              readingTime: stats.readingTime,
              summaryReadingTime: stats.summaryReadingTime,
              createdAt: createdAt || new Date(),
            }}
          />
        )}

        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-sm shadow-primary/25 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Yeni Özet
        </button>
      </div>

      {/* Statistics - Collapsible */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {showStats ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <BarChart3 className="h-4 w-4" />
          İstatistikleri {showStats ? "Gizle" : "Göster"}
        </button>
        {showStats && (
          <div className="mt-4">
            <SummaryStats data={stats} />
          </div>
        )}
      </div>

      {/* Toast feedback */}
      {showToast && (
        <Toast
          message="Özet panoya kopyalandı!"
          type="success"
          onClose={() => setShowToast(false)}
          duration={2000}
        />
      )}
    </div>
  );
}
