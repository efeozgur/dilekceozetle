"use client";

import { Clock, FileText, Trash2, RefreshCcw, X, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface Summary {
  id: string;
  resultText: string;
  charCount: number;
  summaryCharCount: number | null;
  wordCount: number | null;
  summaryWordCount: number | null;
  sentenceCount: number | null;
  summarySentenceCount: number | null;
  readingTime: number | null;
  summaryReadingTime: number | null;
  tokenEstimate: number | null;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setSummaries(data.summaries);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch("/api/summaries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSummaries((prev) => prev.filter((s) => s.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gecmisim</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Daha once olusturdugunuz ozetler burada listelenir.
          </p>
        </div>
        <button
          onClick={fetchSummaries}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-xl hover:bg-muted transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {loading && summaries.length === 0 && (
        <div className="text-center py-20 bg-white border border-border rounded-3xl">
          <RefreshCcw className="h-8 text-muted-foreground/20 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground font-medium">Yukleniyor...</p>
        </div>
      )}

      {!loading && summaries.length === 0 && (
        <div className="text-center py-20 bg-white border border-border rounded-3xl">
          <FileText className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Henuz ozet olusturmadiniz.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Ilk ozetinizi olusturmak icin ana sayfaya donun.</p>
        </div>
      )}

      <div className="space-y-3">
        {summaries.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className="bg-white border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/10 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {item.charCount.toLocaleString("tr-TR")} karakter
                  </span>
                  {item.summaryCharCount && (
                    <span className="text-xs text-emerald-600 font-medium">
                      {item.summaryCharCount.toLocaleString("tr-TR")} karakter ozet
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                  {item.resultText}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                disabled={deleting === item.id}
                className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white border border-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-medium">
                  {formatDate(selected.createdAt)}
                </span>
                {selected.summaryCharCount && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selected.summaryCharCount.toLocaleString("tr-TR")} karakter
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {selected.resultText}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {selected.wordCount && selected.summaryWordCount && (
                  <span>{selected.summaryWordCount} / {selected.wordCount} kelime</span>
                )}
                {selected.readingTime && selected.summaryReadingTime && (
                  <span>{selected.summaryReadingTime} / {selected.readingTime} dk okuma</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selected.resultText)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-xl hover:bg-muted transition-all duration-200 cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Kopyalandı" : "Kopyala"}
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-all duration-200 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
