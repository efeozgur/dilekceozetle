"use client";

import { Clock, FileText, Trash2, RefreshCcw, X, Copy, Check, AlertTriangle, PartyPopper, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ExportMenu } from "@/components/ExportMenu";
import { UsageBar } from "@/components/UsageBar";

interface Summary {
  id: string;
  originalText: string;
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

const BANNER_DISMISS_KEY = "dilekceozet_payment_banner_dismissed";

export default function DashboardPage() {
  const { data: session, update } = useSession();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [totalSummaries, setTotalSummaries] = useState(0);
  const [subscription, setSubscription] = useState("free");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPendingBanner, setShowPendingBanner] = useState(false);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setSummaries(data.summaries);
        setTotalSummaries(data.totalSummaries ?? data.summaries.length);
        setSubscription(data.subscription ?? "free");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Pro aktif toast ve pending banner kontrolü
  useEffect(() => {
    if (!session?.user) return;

    // recentPro: başarılı Pro aktif olunca toast göster
    if (session.user.recentPro && !showSuccess) {
      setShowSuccess(true);
      // 8 saniye sonra otomatik kapat
      const t = setTimeout(() => setShowSuccess(false), 8000);
      // session'daki recentPro'yı temizle (sayfa yenilenince tekrar göstermesin)
      update({}).catch(() => {});
      return () => clearTimeout(t);
    }

    // pendingPayment + hala free: uyarı banner'ı
    if (
      session.user.pendingPayment === true &&
      session.user.subscription !== "pro" &&
      !sessionStorage.getItem(BANNER_DISMISS_KEY)
    ) {
      setShowPendingBanner(true);
    }
  }, [session, showSuccess, update]);

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

  const dismissPendingBanner = () => {
    setShowPendingBanner(false);
    sessionStorage.setItem(BANNER_DISMISS_KEY, Date.now().toString());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Pro Aktif Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-lg p-4 pr-3 max-w-sm">
            <div className="shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <PartyPopper className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-900">Pro üyeliğiniz aktif edildi!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Sınırsız özetleme, karşılaştırma ve diğer Pro özelliklerinin keyfini çıkarın.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pending Payment Uyarı Banner */}
      {showPendingBanner && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-900">Ödemeniz henüz eşleşmedi</p>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              IBAN'a gönderdiğiniz tutar doğrulandıktan sonra Pro üyeliğiniz otomatik olarak
              aktif edilecek. Bu işlem genellikle birkaç saat içinde tamamlanır. Sorun yaşıyorsanız
              <a
                href="mailto:destek@ozgurapp.com"
                className="font-semibold underline ml-1 inline-flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                destek@ozgurapp.com
              </a>
              {" "}adresine yazın.
            </p>
          </div>
          <button
            onClick={dismissPendingBanner}
            className="p-1 text-red-700 hover:bg-red-100 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Uyarıyı kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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

      {/* Kullanım Göstergesi */}
      {subscription === "free" && (
        <div className="mb-6">
          <UsageBar
            used={totalSummaries}
            total={5}
            subscription={subscription}
            compact
          />
        </div>
      )}

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
                <ExportMenu
                  data={{
                    originalText: selected.originalText || "",
                    resultText: selected.resultText,
                    charCount: selected.charCount,
                    summaryCharCount: selected.summaryCharCount,
                    wordCount: selected.wordCount,
                    summaryWordCount: selected.summaryWordCount,
                    sentenceCount: selected.sentenceCount,
                    summarySentenceCount: selected.summarySentenceCount,
                    readingTime: selected.readingTime,
                    summaryReadingTime: selected.summaryReadingTime,
                    createdAt: selected.createdAt,
                  }}
                  compact
                />
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
