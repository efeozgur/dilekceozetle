"use client";

import { Copy, Check, RotateCcw } from "lucide-react";
import { useState } from "react";

interface CompareResultProps {
  result: string;
  onReset: () => void;
}

export function CompareResult({ result, onReset }: CompareResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200">
            <Check className="h-3 w-3" />
            Hazır
          </span>
          <h3 className="text-sm font-semibold text-foreground">Karşılaştırma Sonucu</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {result.length.toLocaleString("tr-TR")} karakter
        </span>
      </div>

      {/* Result Text - PROMINENT */}
      <div className="relative p-6 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 border-l-4 border-l-indigo-500 rounded-2xl shadow-sm">
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-medium text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">
            KARŞILAŞTIRMA
          </span>
        </div>
        <div className="text-base leading-relaxed text-foreground font-medium whitespace-pre-wrap">
          {result.split("\n").map((line, i) => {
            if (line.startsWith("- [")) {
              const match = line.match(/^- \[(.+?)\]\s*(.+?):\s*(.*)$/);
              if (match) {
                return (
                  <div key={i} className="mb-3 pl-4 border-l-2 border-indigo-200">
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1">
                      {match[1]}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{match[2]}</p>
                    <p className="text-sm text-muted-foreground">{match[3]}</p>
                  </div>
                );
              }
            }
            if (line.startsWith("İki metin") || line.startsWith("Karşılaştırma")) {
              return (
                <p key={i} className="mt-4 pt-4 border-t border-indigo-100 text-sm font-medium text-indigo-700">
                  {line}
                </p>
              );
            }
            return line ? (
              <p key={i} className="mb-2">{line}</p>
            ) : (
              <br key={i} />
            );
          })}
        </div>
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
          Yeni Karşılaştırma
        </button>
      </div>
    </div>
  );
}
