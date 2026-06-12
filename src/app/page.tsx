"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SummaryForm } from "@/components/SummaryForm";
import { SummaryResult } from "@/components/SummaryResult";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UsageBar } from "@/components/UsageBar";
import {
  Sparkles,
  LogIn,
  Crown,
  FileText,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  Brain,
  Scale,
  GitCompare,
  Download,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
} from "lucide-react";
import type { SummaryStatsData } from "@/components/stats/SummaryStats";
import { motion, AnimatePresence } from "motion/react";

type ViewState = "form" | "result" | "error";

interface ResultData {
  summary: string;
  stats: SummaryStatsData;
  originalText: string;
}

interface RecentSummary {
  id: string;
  resultText: string;
  charCount: number;
  summaryCharCount: number | null;
  createdAt: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [view, setView] = useState<ViewState>("form");
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [totalSummaries, setTotalSummaries] = useState(0);
  const [subscription, setSubscription] = useState("free");
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isPro = subscription === "pro";

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setTotalSummaries(data.totalSummaries);
        setSubscription(data.subscription);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchRecentSummaries = useCallback(async () => {
    setIsLoadingRecent(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setRecentSummaries(data.summaries.slice(0, 3));
        setTotalSummaries(data.totalSummaries);
        setSubscription(data.subscription);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchUsage();
      fetchRecentSummaries();
    }
  }, [session, fetchUsage, fetchRecentSummaries]);

  const handleResult = (data: { summary: string; stats: SummaryStatsData }) => {
    setResultData({
      summary: data.summary,
      stats: data.stats,
      originalText: "",
    });
    setView("result");
    if (session) fetchUsage();
  };

  const handleError = (msg: string) => {
    setError(msg);
    setView("error");
  };

  const handleReset = () => {
    setResultData(null);
    setError("");
    setView("form");
  };

  const scrollToForm = () => {
    document.getElementById("summary-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-grid-pattern">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-morph" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl animate-morph" style={{ animationDelay: "4s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Yapay Zeka Destekli Hukuki Özetleme</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight"
            >
              Hukuki Dilekçeleri{" "}
              <span className="text-gradient">Saniyeler İçinde</span>{" "}
              Özetleyin
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Uzun ve karmaşık dilekçeleri yapay zeka ile analiz edin, kısa ve nesnel özetler alın.
              Zaman kazanın, odaklanın.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              {!session ? (
                <>
                  <a
                    href="/auth/register"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-8 py-4 rounded-xl text-base font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <LogIn className="h-5 w-5" />
                    Ücretsiz Başla
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <button
                    onClick={scrollToHowItWorks}
                    className="inline-flex items-center gap-2 bg-white border border-border text-foreground px-8 py-4 rounded-xl text-base font-semibold hover:bg-muted hover:border-primary/20 transition-all duration-300"
                  >
                    Nasıl Çalışır?
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={scrollToForm}
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-8 py-4 rounded-xl text-base font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Sparkles className="h-5 w-5" />
                    Özetlemeye Başla
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  {subscription === "pro" && (
                    <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 px-4 py-2 rounded-full text-sm font-medium text-primary">
                      <Crown className="h-4 w-4" />
                      Pro Üye - Sınırsız Kullanım
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>5 Ücretsiz Özet</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Kredi Kartı Gerektirmez</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Anında Başlayın</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual - Mockup */}
          {!session && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-16 max-w-4xl mx-auto"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
                
                {/* Mockup card */}
                <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
                  {/* Top bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="flex items-center gap-2 bg-white px-4 py-1 rounded-lg border border-border text-xs text-muted-foreground">
                        <Scale className="h-3 w-3 text-primary" />
                        dilekceozetle.app
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left - Input */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <FileText className="h-4 w-4 text-primary" />
                          Dilekçe Metni
                        </div>
                        <div className="bg-muted/30 border border-border rounded-xl p-4 h-40 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="h-2 bg-muted rounded-full w-full" />
                            <div className="h-2 bg-muted rounded-full w-5/6" />
                            <div className="h-2 bg-muted rounded-full w-4/6" />
                            <div className="h-2 bg-muted rounded-full w-full" />
                            <div className="h-2 bg-muted rounded-full w-3/6" />
                          </div>
                          <div className="text-[10px] text-muted-foreground">2,450 karakter</div>
                        </div>
                      </div>
                      
                      {/* Right - Output */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Sparkles className="h-4 w-4 text-primary" />
                          AI Özeti
                        </div>
                        <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/10 rounded-xl p-4 h-40 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="h-2 bg-primary/20 rounded-full w-full" />
                            <div className="h-2 bg-primary/20 rounded-full w-4/5" />
                            <div className="h-2 bg-primary/20 rounded-full w-3/5" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">ÖZET</span>
                            <span className="text-[10px] text-muted-foreground">320 karakter</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Form Section (for logged in users) */}
      {session && (
        <section id="summary-form" className="py-12 lg:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Dilekçenizi Özetleyin
              </h2>
              <p className="text-muted-foreground">
                Metni yapıştırın veya dosya yükleyin, AI gerisini halletsin.
              </p>
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

            <div className="bg-white rounded-2xl shadow-lg border border-border p-5 sm:p-8">
              {view === "form" && (
                <SummaryForm
                  onResult={handleResult}
                  onError={handleError}
                  onUpgradeRequired={() => setShowUpgradeModal(true)}
                />
              )}

              <AnimatePresence mode="wait">
                {view === "result" && resultData && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <SummaryForm
                      onResult={handleResult}
                      onError={handleError}
                      onUpgradeRequired={() => setShowUpgradeModal(true)}
                    />
                    <div className="border-t border-border pt-6">
                      <SummaryResult
                        text={resultData.summary}
                        stats={resultData.stats}
                        onReset={handleReset}
                        originalText={resultData.originalText}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {view === "error" && (
                <div className="space-y-4">
                  <ErrorDisplay message={error} onDismiss={handleReset} />
                  <SummaryForm
                    onResult={handleResult}
                    onError={handleError}
                    onUpgradeRequired={() => setShowUpgradeModal(true)}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pro Quick Access Panel */}
      {session && isPro && (
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl shadow-lg shadow-primary/20">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Pro Panel</h2>
                <p className="text-sm text-muted-foreground">Hızlı erişim ve istatistikler</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalSummaries}</p>
                    <p className="text-xs text-muted-foreground">Toplam Özet</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/10 rounded-xl">
                    <Zap className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Sınırsız</p>
                    <p className="text-xs text-muted-foreground">Kullanım Hakkı</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-violet-500/10 rounded-xl">
                    <BarChart3 className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground">Uzunluk Seçeneği</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-amber-500/10 rounded-xl">
                    <Download className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">PDF/UDF</p>
                    <p className="text-xs text-muted-foreground">Dışa Aktarma</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Summaries */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Son Özetler</h3>
                </div>
                <a
                  href="/dashboard"
                  className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                >
                  Tümünü Gör
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>

              {isLoadingRecent ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-start gap-3">
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentSummaries.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentSummaries.map((summary) => (
                    <a
                      key={summary.id}
                      href="/dashboard"
                      className="flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(summary.createdAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">•</span>
                          <span className="text-[10px] text-muted-foreground">
                            {summary.charCount.toLocaleString("tr-TR")} kr
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 line-clamp-2 group-hover:text-foreground transition-colors">
                          {summary.resultText}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Henüz özet oluşturmadınız</p>
                  <button
                    onClick={scrollToForm}
                    className="mt-4 text-sm text-primary font-medium hover:underline"
                  >
                    İlk özetinizi oluşturun →
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <button
                onClick={scrollToForm}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
              >
                <Sparkles className="h-5 w-5 group-hover:animate-bounce-subtle" />
                <span className="font-medium text-sm">Yeni Özet Oluştur</span>
              </button>
              <a
                href="/compare"
                className="flex items-center gap-3 p-4 bg-white border border-border rounded-2xl hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
              >
                <GitCompare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-sm text-foreground">Dilekçe Karşılaştır</span>
              </a>
              <a
                href="/account"
                className="flex items-center gap-3 p-4 bg-white border border-border rounded-2xl hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
              >
                <Crown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-sm text-foreground">Hesap Ayarları</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section - Only for non-Pro users */}
      {!isPro && (
        <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Basit ve Hızlı
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Nasıl <span className="text-gradient">Çalışır?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Üç basit adımda dilekçelerinizi özetleyin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white border border-border rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl shadow-lg shadow-primary/20">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">01</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Metni Yapıştırın
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dilekçe metnini yapıştırın veya PDF/UDF dosyası yükleyin. 100.000 karaktere kadar destekliyoruz.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white border border-border rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">02</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  AI Analiz Etsin
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gelişmiş yapay zeka motorumuz metni tarar, ana noktaları belirler ve nesnel bir özet çıkarır.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white border border-border rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">03</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Özetinizi Alın
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Kısa, yoğun ve nesnel özeti saniyeler içinde alın. PDF veya UDF olarak dışa aktarın.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* Features Section - Only for non-Pro users */}
      {!isPro && (
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Güçlü Özellikler
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              İhtiyacınız Olan <span className="text-gradient">Her Şey</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hukuk profesyonelleri için özel olarak tasarlanmış özellikler
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Scale,
                title: "Hukuki Dil Anlama",
                description: "Dilekçe kalıplarını ve hukuki terminolojiyi anlayan özel AI modeli",
                gradient: "from-blue-500 to-indigo-600",
                shadow: "shadow-blue-500/20",
              },
              {
                icon: Brain,
                title: "Nesnel Özet",
                description: "Tarafsız, öz ve kanıya dayalı çıktılar. Duygusal dil temizlenir",
                gradient: "from-violet-500 to-purple-600",
                shadow: "shadow-violet-500/20",
              },
              {
                icon: FileText,
                title: "PDF/UDF Desteği",
                description: "Dosya yükleme ve dışa aktarma. PDF ve UDF formatları desteklenir",
                gradient: "from-emerald-500 to-teal-600",
                shadow: "shadow-emerald-500/20",
              },
              {
                icon: GitCompare,
                title: "Dilekçe Karşılaştırma",
                description: "İki dilekçe arasındaki farkları otomatik tespit edin",
                gradient: "from-amber-500 to-orange-600",
                shadow: "shadow-amber-500/20",
              },
              {
                icon: Shield,
                title: "Veri Gizliliği",
                description: "Kişisel bilgiler otomatik temizlenir. Verileriniz güvende",
                gradient: "from-rose-500 to-pink-600",
                shadow: "shadow-rose-500/20",
              },
              {
                icon: Clock,
                title: "Anında Sonuç",
                description: "Saniyeler içinde detaylı özet ve istatistik çıktısı",
                gradient: "from-cyan-500 to-blue-600",
                shadow: "shadow-cyan-500/20",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-white border border-border rounded-2xl p-6 h-full hover:shadow-xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl mb-5 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Stats Section - Only for non-Pro users */}
      {!isPro && (
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FileText, value: "10,000+", label: "Dilekçe Özetlendi", color: "text-primary" },
              { icon: Users, value: "500+", label: "Aktif Kullanıcı", color: "text-violet-500" },
              { icon: TrendingUp, value: "%85", label: "Ort. Sıkıştırma", color: "text-emerald-500" },
              { icon: Clock, value: "<5sn", label: "Ort. İşlem Süresi", color: "text-amber-500" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-muted rounded-2xl mb-4">
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      {!session && (
        <section className="py-20 lg:py-28 bg-gradient-to-br from-gradient-start via-primary to-gradient-end relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Hemen Başlayın
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                5 ücretsiz özet hakkınız sizi bekliyor. Kredi kartı gerektirmez, anında başlayın.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/auth/register"
                  className="group inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-base font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  Ücretsiz Kayıt Ol
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="/auth/login"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <LogIn className="h-5 w-5" />
                  Giriş Yap
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}
