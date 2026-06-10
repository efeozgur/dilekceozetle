"use client";

import { useState } from "react";
import { GitCompareArrows, Clipboard } from "lucide-react";

interface CompareFormProps {
  onResult: (result: string) => void;
  onError: (msg: string) => void;
}

export function CompareForm({ onResult, onError }: CompareFormProps) {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text1.trim() || !text2.trim() || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text1, text2 }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.error || "Bir hata oluştu.");
        return;
      }

      onResult(data.result);
    } catch {
      onError("Sunucuyla bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste1 = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setText1(clipText);
    } catch {}
  };

  const handlePaste2 = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setText2(clipText);
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Text 1 */}
        <div className="relative">
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">
            Birinci Dilekçe
          </label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Birinci dilekçe metnini buraya yapıştırın..."
            className="w-full h-64 p-4 text-sm leading-relaxed border border-border rounded-2xl bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all duration-200"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {text1.length > 0 && (
              <span className="bg-white/80 backdrop-blur-sm border border-border text-xs text-muted-foreground px-2 py-1 rounded-lg">
                {text1.length.toLocaleString("tr-TR")}
              </span>
            )}
            <button
              type="button"
              onClick={handlePaste1}
              className="bg-white/80 backdrop-blur-sm border border-border p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Text 2 */}
        <div className="relative">
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">
            İkinci Dilekçe
          </label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="İkinci dilekçe metnini buraya yapıştırın..."
            className="w-full h-64 p-4 text-sm leading-relaxed border border-border rounded-2xl bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all duration-200"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {text2.length > 0 && (
              <span className="bg-white/80 backdrop-blur-sm border border-border text-xs text-muted-foreground px-2 py-1 rounded-lg">
                {text2.length.toLocaleString("tr-TR")}
              </span>
            )}
            <button
              type="button"
              onClick={handlePaste2}
              className="bg-white/80 backdrop-blur-sm border border-border p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <GitCompareArrows className="h-3.5 w-3.5" />
          <span>İki dilekçeyi yan yana karşılaştırın</span>
        </div>

        <button
          type="submit"
          disabled={!text1.trim() || !text2.trim() || loading}
          className="flex items-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 cursor-pointer"
        >
          <GitCompareArrows className="h-4 w-4" />
          {loading ? "Karşılaştırılıyor..." : "Karşılaştır"}
        </button>
      </div>
    </form>
  );
}
