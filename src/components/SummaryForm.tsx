"use client";

import { useState } from "react";
import { Sparkles, Clipboard, FileText, Zap, Crown } from "lucide-react";
import type { SummaryStatsData } from "./stats/SummaryStats";
import type { SummaryLength } from "@/lib/prompts";
import { LoadingOverlay } from "./LoadingOverlay";
import { FileUpload } from "./FileUpload";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";

interface SummaryFormProps {
  onResult: (data: { summary: string; stats: SummaryStatsData; originalText: string }) => void;
  onError: (msg: string) => void;
  onUpgradeRequired?: () => void;
}

const LENGTH_OPTIONS: { value: SummaryLength; label: string; description: string; icon: string }[] = [
  { value: "short", label: "Kısa", description: "Maksimum sıkıştırma", icon: "⚡" },
  { value: "medium", label: "Orta", description: "Dengeli özet", icon: "📝" },
  { value: "long", label: "Uzun", description: "Detaylı özet", icon: "📄" },
];

export function SummaryForm({ onResult, onError, onUpgradeRequired }: SummaryFormProps) {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === "pro";
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
        if (res.status === 403 && onUpgradeRequired) {
          onUpgradeRequired();
        } else {
          onError(data.error || "Bir hata oluştu.");
        }
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
        originalText: text,
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
      {/* Textarea with modern styling */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <label htmlFor="petition-text" className="sr-only">
            Dilekçe metni
          </label>
          <textarea
            id="petition-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dilekçe metnini buraya yapıştırın veya aşağıdan dosya yükleyin..."
            className="w-full h-64 p-5 text-sm leading-relaxed border border-border rounded-2xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all duration-200"
            disabled={loading}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {charCount > 0 && (
              <span className="bg-white/90 backdrop-blur-sm border border-border text-[11px] text-muted-foreground px-2.5 py-1 rounded-lg shadow-sm">
                {charCount.toLocaleString("tr-TR")} karakter
              </span>
            )}
          </div>
        </div>
      </div>

      {/* File Upload */}
      <FileUpload
        onFileContent={(content) => setText(content)}
        label="veya dilekçe dosyası yükleyin"
      />

      {/* Length Selector - Modern Cards */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-foreground">Özet Uzunluğu</span>
          {!isPro && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Free: Sadece Orta
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {LENGTH_OPTIONS.map((opt) => {
            const isLocked = !isPro && opt.value !== "medium";
            const isSelected = length === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => !isLocked && setLength(opt.value)}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isLocked
                    ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "border-primary bg-gradient-to-br from-primary/5 to-violet-500/5 shadow-md shadow-primary/10"
                    : "border-border bg-white hover:border-primary/30 hover:shadow-sm cursor-pointer"
                }`}
              >
                {isSelected && !isLocked && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-4 h-4 text-primary/40" />
                  </div>
                )}
                <div className="text-lg mb-1">{opt.icon}</div>
                <div className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {opt.label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {opt.description}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handlePaste}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border px-4 py-2.5 rounded-xl hover:bg-muted hover:border-primary/20 transition-all duration-200 cursor-pointer"
        >
          <Clipboard className="h-4 w-4" />
          Yapıştır
        </button>

        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-8 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 group-hover:animate-bounce-subtle" />
          Özetle
          <Zap className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Helper text */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <FileText className="h-3.5 w-3.5" />
        <span>Metin ne kadar uzun olursa özet kalitesi o kadar artar</span>
      </div>
    </form>
  );
}
