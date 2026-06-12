"use client";

import { FileText, Trash2, RefreshCcw, X, Copy, Check, AlertTriangle, Mail, FileCheck, Loader2, Crown, Search, Calendar, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { ExportMenu } from "@/components/ExportMenu";
import { UsageBar } from "@/components/UsageBar";
import ProActivatedOverlay from "@/components/ProActivatedOverlay";
import { motion, AnimatePresence } from "motion/react";

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

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

const BANNER_DISMISS_KEY = "dilekceozet_payment_banner_dismissed";
const PRO_OVERLAY_SHOWN_KEY = "dilekceozet_pro_overlay_shown";

function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 bg-muted rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
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
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSummaries = useCallback(async () => {
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
  }, []);

  const handleOverlayComplete = useCallback(() => {
    setShowSuccess(false);
    sessionStorage.setItem(PRO_OVERLAY_SHOWN_KEY, "1");
  }, []);

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
  }, [fetchSummaries]);

  const handleDelete = useCallback(async (id: string) => {
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
  }, [selected]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const dismissPendingBanner = () => {
    setShowPendingBanner(false);
    sessionStorage.setItem(BANNER_DISMISS_KEY, Date.now().toString());
  };

  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return summaries;
    const q = searchQuery.toLowerCase();
    return summaries.filter(
      (s) =>
        s.resultText.toLowerCase().includes(q) ||
        s.originalText.toLowerCase().includes(q)
    );
  }, [summaries, searchQuery]);

  const getStatusLabel = (item: Summary) => {
    if (!item.summaryCharCount) return "İşleniyor";
    const ratio = item.summaryCharCount / item.charCount;
    if (ratio < 0.3) return "Yoğun";
    if (ratio < 0.5) return "Normal";
    return "Detaylı";
  };

  const getStatusBadgeColor = (item: Summary) => {
    if (!item.summaryCharCount) return "bg-gray-50 text-gray-600 border-gray-200";
    const ratio = item.summaryCharCount / item.charCount;
    if (ratio < 0.3) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (ratio < 0.5) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const isPro = subscription === "pro";

  // Stats calculation
  const totalChars = summaries.reduce((acc, s) => acc + s.charCount, 0);
  const avgCompression = summaries.length > 0
    ? Math.round(summaries.reduce((acc, s) => {
        if (!s.summaryCharCount) return acc;
        return acc + (1 - s.summaryCharCount / s.charCount) * 100;
      }, 0) / summaries.length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <ProActivatedOverlay show={showSuccess} onComplete={handleOverlayComplete} />

      {showPendingBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Ödemeniz henüz eşleşmedi</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              IBAN&apos;a gönderdiğiniz tutar doğrulandıktan sonra Pro üyeliğiniz aktif edilecek.
              <a
                href="mailto:destek@ozgurapp.com"
                className="font-semibold underline ml-1 inline-flex items-center gap-0.5"
              >
                <Mail className="h-3 w-3" />
                destek@ozgurapp.com
              </a>
            </p>
          </div>
          <button
            onClick={dismissPendingBanner}
            className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Geçmişim</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Oluşturduğunuz özetler burada listelenir.
          </p>
        </div>
        <button
          onClick={fetchSummaries}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-xl hover:bg-muted hover:border-primary/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white border border-border rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summaries.length}</p>
              <p className="text-xs text-muted-foreground">Toplam Özet</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-border rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-violet-500/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgCompression}%</p>
              <p className="text-xs text-muted-foreground">Ort. Sıkıştırma</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-border rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/10 rounded-xl">
              <Zap className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{(totalChars / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">Karakter</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`border rounded-2xl p-4 hover:shadow-lg transition-all duration-300 ${
            isPro 
              ? "bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20" 
              : "bg-white border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
              isPro ? "bg-primary/20" : "bg-amber-500/10"
            }`}>
              {isPro ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : (
                <Calendar className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {isPro ? "Pro Üye" : "Free Plan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPro ? "Sınırsız" : `${totalSummaries}/5`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {!isAdmin && !isPro && (
        <div className="mb-6">
          <UsageBar
            used={totalSummaries}
            total={5}
            subscription={subscription}
            compact
          />
        </div>
      )}

      {/* Search */}
      {summaries.length > 0 && (
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Özetlerde ara..."
            className="w-full pl-11 pr-4 py-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground/40 transition-all hover:border-primary/20"
          />
        </div>
      )}

      {/* Loading */}
      {loading && summaries.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && summaries.length === 0 && (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-4">
            <FileText className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-base font-medium text-foreground mb-2">Henüz özet oluşturmadınız</p>
          <p className="text-sm text-muted-foreground">İlk özetinizi oluşturmak için ana sayfaya dönün.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <FileText className="h-4 w-4" />
            Özet Oluştur
          </a>
        </div>
      )}

      {/* No search results */}
      {!loading && summaries.length > 0 && filteredSummaries.length === 0 && (
        <div className="text-center py-12 bg-white border border-border rounded-2xl">
          <p className="text-sm text-muted-foreground">Arama sonucu bulunamadı.</p>
        </div>
      )}

      {/* Summary List */}
      <div className="space-y-3">
        {filteredSummaries.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => { setSelected(item); setShowOriginal(false); }}
            className="group bg-white border border-border rounded-2xl p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isPro 
                  ? "bg-gradient-to-br from-primary/10 to-violet-500/10" 
                  : "bg-muted"
              } group-hover:scale-110`}>
                <FileCheck className={`h-5 w-5 ${isPro ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatShortDate(item.createdAt)}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.charCount.toLocaleString("tr-TR")} kr
                  </span>
                  {item.summaryCharCount && (
                    <>
                      <span className="text-[10px] text-muted-foreground/60">•</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeColor(item)}`}>
                        {getStatusLabel(item)}
                      </span>
                    </>
                  )}
                  {isPro && (
                    <span className="text-[9px] font-bold text-primary bg-primary/5 border border-primary/15 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                      <Crown className="h-2.5 w-2.5" />
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 group-hover:text-foreground transition-colors">
                  {item.resultText}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                disabled={deleting === item.id}
                className="p-2 text-muted-foreground/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 cursor-pointer disabled:opacity-50 opacity-0 group-hover:opacity-100"
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
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDate(selected.createdAt)}
                  </span>
                  {selected.summaryCharCount && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      {selected.summaryCharCount.toLocaleString("tr-TR")} kr
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

              {/* Tabs */}
              <div className="border-b border-border px-6 pt-3 flex gap-1">
                <button
                  onClick={() => setShowOriginal(false)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all cursor-pointer ${
                    !showOriginal
                      ? "bg-primary/5 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileCheck className="h-4 w-4 inline mr-1.5" />
                  Özet
                </button>
                {selected.originalText && (
                  <button
                    onClick={() => setShowOriginal(true)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all cursor-pointer ${
                      showOriginal
                        ? "bg-primary/5 text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FileText className="h-4 w-4 inline mr-1.5" />
                    Orijinal
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {showOriginal && selected.originalText ? (
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {selected.originalText}
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {selected.resultText}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {selected.wordCount && selected.summaryWordCount && (
                    <span>{selected.summaryWordCount} / {selected.wordCount} kelime</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(selected.resultText)}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-lg hover:bg-white transition-all cursor-pointer"
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
                    className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Sil
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
