"use client";

import { useState } from "react";
import { GitCompareArrows, Clipboard } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { LoadingOverlay } from "./LoadingOverlay";

interface CompareFormProps {
  onResult: (result: string) => void;
  onError: (msg: string) => void;
}

const MAX_CHARS = 100000;

export function CompareForm({ onResult, onError }: CompareFormProps) {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text1.trim() || !text2.trim() || loading) return;

    if (text1.length > MAX_CHARS || text2.length > MAX_CHARS) {
      onError(`Her bir metin en fazla ${MAX_CHARS.toLocaleString("tr-TR")} karakter olabilir.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text1, text2 }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          onError("Karşılaştırma yapmak için giriş yapmalısınız.");
        } else {
          onError(data.error || "Bir hata oluştu.");
        }
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

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="hidden md:flex absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl shadow-md shadow-primary/20 text-white text-xs font-bold ring-4 ring-white">
            VS
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block">
            Birinci Dilekçe
          </label>
          <div className="relative">
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="Birinci dilekçe metnini yapıştırın..."
              className="w-full h-52 p-3.5 text-sm leading-relaxed border border-border rounded-xl bg-muted/20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all duration-200"
              disabled={loading}
            />
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
              {text1.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  text1.length > MAX_CHARS
                    ? "text-red-600 bg-red-50 border-red-200"
                    : "text-muted-foreground bg-white/90 border-border"
                }`}>
                  {text1.length.toLocaleString("tr-TR")}
                </span>
              )}
              <button
                type="button"
                onClick={handlePaste1}
                className="bg-white/90 border border-border p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                <Clipboard className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
          <FileUpload
            onFileContent={(content) => setText1(content)}
            label="veya dosya yükleyin"
          />
        </div>

        <div className="space-y-1.5 relative">
          <div className="flex md:hidden items-center justify-center my-1">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gradient-start to-gradient-end rounded-lg shadow-sm text-white text-[10px] font-bold">
              VS
            </div>
          </div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block">
            İkinci Dilekçe
          </label>
          <div className="relative">
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="İkinci dilekçe metnini yapıştırın..."
              className="w-full h-52 p-3.5 text-sm leading-relaxed border border-border rounded-xl bg-muted/20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all duration-200"
              disabled={loading}
            />
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
              {text2.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  text2.length > MAX_CHARS
                    ? "text-red-600 bg-red-50 border-red-200"
                    : "text-muted-foreground bg-white/90 border-border"
                }`}>
                  {text2.length.toLocaleString("tr-TR")}
                </span>
              )}
              <button
                type="button"
                onClick={handlePaste2}
                className="bg-white/90 border border-border p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                <Clipboard className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
          <FileUpload
            onFileContent={(content) => setText2(content)}
            label="veya dosya yükleyin"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={!text1.trim() || !text2.trim() || loading || text1.length > MAX_CHARS || text2.length > MAX_CHARS}
          className="flex items-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
        >
          <GitCompareArrows className="h-4 w-4" />
          {loading ? "Karşılaştırılıyor..." : "Karşılaştır"}
        </button>
      </div>
    </form>
  );
}
