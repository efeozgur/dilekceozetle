"use client";

import { Copy, Check, RotateCcw, FileText } from "lucide-react";
import { useState } from "react";
import { SummaryStats, type SummaryStatsData } from "./stats/SummaryStats";

interface SummaryResultProps {
  text: string;
  stats: SummaryStatsData;
  onReset: () => void;
}

export function SummaryResult({ text, stats, onReset }: SummaryResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
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

      {/* Summary Text */}
      <div className="p-6 bg-muted/30 border border-border rounded-2xl text-sm leading-relaxed text-foreground">
        {text}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
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

        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-sm shadow-primary/25 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Yeni Özet
        </button>
      </div>

      {/* Statistics */}
      <div className="border-t border-border pt-8">
        <SummaryStats data={stats} />
      </div>
    </div>
  );
}
