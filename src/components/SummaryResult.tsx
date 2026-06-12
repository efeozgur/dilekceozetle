"use client";

import { Copy, Check, RotateCcw, FileText, ChevronDown, ChevronUp, BarChart3, Download, Sparkles } from "lucide-react";
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

  const compressionRatio = stats.charCount > 0 
    ? Math.round((1 - stats.summaryCharCount / stats.charCount) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
            <Check className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Özet Hazır</h3>
            <p className="text-xs text-muted-foreground">
              %{compressionRatio} sıkıştırma oranı
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
          <FileText className="h-3.5 w-3.5" />
          {text.length.toLocaleString("tr-TR")} karakter
        </div>
      </div>

      {/* Summary Text - Premium Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 rounded-2xl blur opacity-50" />
        <div className="relative p-6 bg-gradient-to-br from-white via-primary/[0.02] to-violet-500/[0.02] border border-primary/10 rounded-2xl">
          {/* Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <Sparkles className="h-3 w-3" />
              ÖZET
            </span>
          </div>
          
          {/* Text */}
          <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap pr-20">
            {text}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
            copied
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "text-foreground border border-border hover:bg-muted hover:border-primary/20"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
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
          className="group flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-gradient-start to-gradient-end text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 group-hover:rotate-[-180deg] transition-transform duration-300" />
          Yeni Özet
        </button>
      </div>

      {/* Statistics - Collapsible */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          <div className={`p-1.5 rounded-lg transition-all ${showStats ? "bg-primary/10" : "bg-muted group-hover:bg-muted"}`}>
            {showStats ? (
              <ChevronUp className="h-4 w-4 text-primary" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
          <BarChart3 className={`h-4 w-4 ${showStats ? "text-primary" : ""}`} />
          <span>Detaylı İstatistikler</span>
        </button>
        {showStats && (
          <div className="mt-4 animate-fade-in-up">
            <SummaryStats data={stats} />
          </div>
        )}
      </div>

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
