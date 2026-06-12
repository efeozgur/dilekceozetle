"use client";

import { useState } from "react";
import { GitCompareArrows, Clipboard } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { LoadingOverlay } from "./LoadingOverlay";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VS Badge - visible on md+ */}
        <div className="hidden md:flex absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl shadow-lg shadow-primary/30 text-white text-sm font-bold tracking-wide ring-4 ring-white">
            VS
          </div>
        </div>

        {/* Text 1 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">
            Birinci Dilekçe
          </label>
          <div className="relative">
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="Birinci dilekçe metnini buraya yapıştırın..."
              className="w-full h-56 p-4 text-sm leading-relaxed border border-border rounded-2xl bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all duration-200"
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
          <FileUpload
            onFileContent={(content) => setText1(content)}
            label="veya dosya yükleyin"
          />
        </div>

        {/* Text 2 */}
        <div className="space-y-2 relative">
          {/* VS Badge - mobile */}
          <div className="flex md:hidden items-center justify-center my-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl shadow-md shadow-primary/20 text-white text-xs font-bold tracking-wide">
              VS
            </div>
          </div>
          <label className="text-xs font-semibold text-muted-foreground block">
            İkinci Dilekçe
          </label>
          <div className="relative">
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="İkinci dilekçe metnini buraya yapıştırın..."
              className="w-full h-56 p-4 text-sm leading-relaxed border border-border rounded-2xl bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all duration-200"
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
          <FileUpload
            onFileContent={(content) => setText2(content)}
            label="veya dosya yükleyin"
          />
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
