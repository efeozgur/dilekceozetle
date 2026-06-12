"use client";

import { useState } from "react";
import { FileText, Sparkles, Clipboard, Crown } from "lucide-react";
import type { SummaryStatsData } from "./stats/SummaryStats";
import type { SummaryLength } from "@/lib/prompts";
import { LoadingOverlay } from "./LoadingOverlay";
import { FileUpload } from "./FileUpload";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";

interface SummaryFormProps {
  onResult: (data: { summary: string; stats: SummaryStatsData }) => void;
  onError: (msg: string) => void;
  onUpgradeRequired?: () => void;
}

const LENGTH_OPTIONS: { value: SummaryLength; label: string; description: string }[] = [
  { value: "short", label: "Kısa", description: "10→1 cümle" },
  { value: "medium", label: "Orta", description: "5-6→1 cümle" },
  { value: "long", label: "Uzun", description: "3-4→1 cümle" },
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
          placeholder="Dilekçe metnini buraya yapıştırın veya aşağıdan dosya yükleyin. Ne kadar uzun metin girerseniz özet o kadar başarılı olur..."
          className={`w-full h-72 p-5 text-sm leading-relaxed border rounded-2xl bg-muted/30 resize-none focus:outline-none focus:ring-2 placeholder:text-muted-foreground/40 transition-all duration-200 ${
            isPro
              ? "border-amber-200/60 focus:ring-amber-200/30 focus:border-amber-300/50"
              : "border-border focus:ring-primary/20 focus:border-primary/40"
          }`}
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

      {/* File Upload */}
      <FileUpload
        onFileContent={(content) => setText(content)}
        label="veya dilekçe dosyası yükleyin"
      />

      {/* Length Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Özet Uzunluğu:</span>
        {LENGTH_OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => setLength(opt.value)}
            whileTap={{ scale: 0.95 }}
            className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
              length === opt.value
                ? isPro
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25"
                  : "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-sm shadow-primary/25"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {length === opt.value && (
              <motion.div
                layoutId="lengthIndicator"
                className={`absolute inset-0 rounded-xl ${
                  isPro
                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                    : "bg-gradient-to-r from-gradient-start to-gradient-end"
                }`}
                style={{ zIndex: -1 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </motion.button>
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
          className={`flex items-center gap-2 text-white px-7 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 cursor-pointer ${
            isPro
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/25"
              : "bg-gradient-to-r from-gradient-start to-gradient-end hover:shadow-lg hover:shadow-primary/25"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Özetle
        </button>
      </div>
    </form>
  );
}
