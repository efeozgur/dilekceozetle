"use client";

import { Clock, FileText, Trash2, RefreshCcw, X, Copy, Check, AlertTriangle, Mail, FileCheck, Loader2, Crown } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ExportMenu } from "@/components/ExportMenu";
import { UsageBar } from "@/components/UsageBar";
import ProActivatedOverlay from "@/components/ProActivatedOverlay";
import { motion } from "motion/react";

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
const PRO_OVERLAY_SHOWN_KEY = "dilekceozet_pro_overlay_shown";

// Skeleton card component
function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        </div>
        <div className="h-8 w-8 bg-muted rounded-xl shrink-0" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [totalSummaries, setTotalSummaries] = useState(0);
  const [subscription, setSubscription] = useState("free");
  const [loading, setLoading] = useState(true);
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPendingBanner, setShowPendingBanner] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

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

  const handleOverlayComplete = useCallback(() => {
    setShowSuccess(false);
    sessionStorage.setItem(PRO_OVERLAY_SHOWN_KEY, "1");
  }, []);

  // Pro aktif overlay ve pending banner kontrolü
  useEffect(() => {
    if (!session?.user) return;

    if (
      session.user.recentPro &&
      !showSuccess &&
      !sessionStorage.getItem(PRO_OVERLAY_SHOWN_KEY)
    ) {
      setShowSuccess(true);
    }

    if (
      session.user.pendingPayment === true &&
      session.user.subscription !== "pro" &&
      !sessionStorage.getItem(BANNER_DISMISS_KEY)
    ) {
      setShowPendingBanner(true);
    }
  }, [session, showSuccess]);

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

  // Status color based on char count ratio
  const getStatusColor = (item: Summary) => {
    if (!item.summaryCharCount) return "border-l-gray-300";
    const ratio = item.summaryCharCount / item.charCount;
    if (ratio < 0.3) return "border-l-emerald-400";
    if (ratio < 0.5) return "border-l-amber-400";
    return "border-l-blue-400";
  };

  const getStatusLabel = (item: Summary) => {
    if (!item.summaryCharCount) return "İşleniyor";
    const ratio = item.summaryCharCount / item.charCount;
    if (ratio < 0.3) return "Yoğun";
    if (ratio < 0.5) return "Normal";
    return "Detaylı";
  };

  const getStatusBadgeColor = (item: Summary) => {
    if (!item.summaryCharCount) return "bg-gray-100 text-gray-600 border-gray-200";
    const ratio = item.summaryCharCount / item.charCount;
    if (ratio < 0.3) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (ratio < 0.5) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Pro Aktif Overlay */}
      <ProActivatedOverlay show={showSuccess} onComplete={handleOverlayComplete} />

      {/* Pending Payment Uyarı Banner */}
      {showPendingBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-900">Ödemeniz henüz eşleşmedi</p>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              IBAN&apos;a gönderdiğiniz tutar doğrulandıktan sonra Pro üyeliğiniz otomatik olarak
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
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Geçmişim</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Daha önce oluşturduğunuz özetler burada listelenir.
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
      {!isAdmin && (
        <div className="mb-6">
          <UsageBar
            used={totalSummaries}
            total={5}
            subscription={subscription}
            compact={subscription !== "pro"}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && summaries.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && summaries.length === 0 && (
        <div className="text-center py-20 bg-white border border-border rounded-3xl">
          <FileText className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Henüz özet oluşturmadınız.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">İlk özetinizi oluşturmak için ana sayfaya dönün.</p>
        </div>
      )}

      {/* Summary list */}
      <div className="space-y-3">
        {summaries.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => { setSelected(item); setShowOriginal(false); }}
            className={`bg-white border rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 ${
              subscription === "pro"
                ? "border-amber-200/40 hover:border-amber-300/60 hover:shadow-amber-200/20"
                : "border-border hover:border-primary/20"
            } ${getStatusColor(item)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {item.charCount.toLocaleString("tr-TR")} karakter
                  </span>
                  {item.summaryCharCount && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeColor(item)}`}>
                      <FileCheck className="h-3 w-3 inline mr-0.5" />
                      {item.summaryCharCount.toLocaleString("tr-TR")} karakter
                    </span>
                  )}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeColor(item)}`}>
                    {getStatusLabel(item)}
                  </span>
                  {subscription === "pro" && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                      <Crown className="h-2.5 w-2.5" />
                      PRO
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
                className="p-2 text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {deleting === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
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

            {/* Modal Body - Tabs for original/result */}
            <div className="border-b border-border px-6 pt-4 flex gap-0">
              <button
                onClick={() => setShowOriginal(false)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                  !showOriginal
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCheck className="h-4 w-4 inline mr-1.5" />
                Özet
              </button>
              {selected.originalText && (
                <button
                  onClick={() => setShowOriginal(true)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                    showOriginal
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-1.5" />
                  Orijinal Metin
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {showOriginal && selected.originalText ? (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Orijinal Metin
                  </p>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {selected.originalText}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Özet
                  </p>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {selected.resultText}
                  </p>
                </div>
              )}
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
          </motion.div>
        </div>
      )}
    </div>
  );
}
