"use client";

import { useState } from "react";
import { FileText, Sparkles, Clipboard } from "lucide-react";
import type { SummaryStatsData } from "./stats/SummaryStats";
import type { SummaryLength } from "@/lib/prompts";
import { LoadingOverlay } from "./LoadingOverlay";

interface SummaryFormProps {
  onResult: (data: { summary: string; stats: SummaryStatsData }) => void;
  onError: (msg: string) => void;
}

const LENGTH_OPTIONS: { value: SummaryLength; label: string; description: string }[] = [
  { value: "short", label: "Kısa", description: "10→1 cümle" },
  { value: "medium", label: "Orta", description: "5-6→1 cümle" },
  { value: "long", label: "Uzun", description: "3-4→1 cümle" },
];

export function SummaryForm({ onResult, onError }: SummaryFormProps) {
  const [text, setText] = useState("");
  const [length, setLength] = useState<SummaryLength>("medium");
  const [loading, setLoading] = useState(false);
  const charCount = text.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, length }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.error || "Bir hata oluştu.");
        return;
      }

      onResult({
        summary: data.summary,
        stats: {
          charCount: data.charCount,
          summaryCharCount: data.summaryCharCount,
          wordCount: data.wordCount,
          summaryWordCount: data.summaryWordCount,
          sentenceCount: data.sentenceCount,
          summarySentenceCount: data.summarySentenceCount,
          readingTime: data.readingTime,
          summaryReadingTime: data.summaryReadingTime,
          tokenEstimate: data.tokenEstimate,
        },
      });
    } catch {
      onError("Sunucuyla bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setText(clipText);
    } catch {
      // Clipboard API not available
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <label htmlFor="petition-text" className="sr-only">
          Dilekçe metni
        </label>
        <textarea
          id="petition-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dilekçe metnini buraya yapıştırın..."
          className="w-full h-72 p-5 text-sm leading-relaxed border border-border rounded-2xl bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all duration-200"
          disabled={loading}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {charCount > 0 && (
            <span className="bg-white/80 backdrop-blur-sm border border-border text-xs text-muted-foreground px-2.5 py-1 rounded-lg">
              {charCount.toLocaleString("tr-TR")} karakter
            </span>
          )}
        </div>
      </div>

      {/* Length Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Özet Uzunluğu:</span>
        {LENGTH_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLength(opt.value)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
              length === opt.value
                ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-sm shadow-primary/25"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-xl hover:bg-muted transition-all duration-200 cursor-pointer"
          >
            <Clipboard className="h-3.5 w-3.5" />
            Yapıştır
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>Metin ne kadar uzun olursa özet o kadar iyi olur</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="flex items-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          Özetle
        </button>
      </div>
    </form>
  );
}
