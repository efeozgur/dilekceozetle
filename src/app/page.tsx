"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SummaryForm } from "@/components/SummaryForm";
import { SummaryResult } from "@/components/SummaryResult";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UsageBar } from "@/components/UsageBar";
import { Scale, Shield, Zap, FileText, ArrowRight, Sparkles, Clock, Brain, LogIn, ClipboardPaste, FileCheck, Crown } from "lucide-react";
import type { SummaryStatsData } from "@/components/stats/SummaryStats";
import { motion } from "motion/react";

type ViewState = "form" | "result" | "error";

interface ResultData {
  summary: string;
  stats: SummaryStatsData;
}

export default function Home() {
  const { data: session } = useSession();
  const [view, setView] = useState<ViewState>("form");
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [totalSummaries, setTotalSummaries] = useState(0);
  const [subscription, setSubscription] = useState("free");
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

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

  useEffect(() => {
    if (session) {
      fetchUsage();
    }
  }, [session, fetchUsage]);

  const handleResult = (data: { summary: string; stats: SummaryStatsData }) => {
    setResultData(data);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      {/* Hero Section */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          Yapay Zeka Destekli
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
          Hukuki Dilekçe
          <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent"> Özeti</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          Dilekçenizin metnini yapıştırın, yapay zeka motorumuz
          kısa, yoğun ve nesnel bir özet çıkarsın.
        </p>
      </div>

      {/* Main Card */}
      <div className={`bg-white border rounded-3xl shadow-sm p-6 sm:p-8 mb-14 transition-all duration-500 ${
        subscription === "pro"
          ? "border-amber-200/60 shadow-amber-200/20"
          : "border-border shadow-border/50"
      }`}>
        {subscription === "pro" && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-amber-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              <Crown className="h-3 w-3" />
              PRO
            </div>
            <span className="text-xs text-amber-600/80">Sınırsız özetleme ve tüm özellikler aktif</span>
          </div>
        )}
        {!session ? (
          /* Giriş yapılmamışsa login prompt */
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-5">
              <LogIn className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Özetleme yapmak için giriş yapın</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Ücretsiz hesap oluşturarak 5 özet hakkınızı kullanın veya Pro plana yükselterek sınırsız özetleme yapın.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </a>
              <a
                href="/auth/register"
                className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-all duration-300"
              >
                Kayıt Ol
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Kullanım Göstergesi */}
            {!isAdmin && (
              <div className="mb-5">
                <UsageBar
                  used={totalSummaries}
                  total={5}
                  subscription={subscription}
                  compact={subscription !== "pro"}
                />
              </div>
            )}

            {view === "form" && (
              <SummaryForm
                onResult={handleResult}
                onError={handleError}
                onUpgradeRequired={() => setShowUpgradeModal(true)}
              />
            )}

            {view === "result" && resultData && (
              <SummaryResult
                text={resultData.summary}
                stats={resultData.stats}
                onReset={handleReset}
              />
            )}

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
          </>
        )}
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      {/* Nasıl Çalışır Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Kullanım
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Nasıl <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">Çalışır</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm mt-2">
            Üç basit adımda dilekçenizi özetleyin
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Timeline line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gradient-start to-gradient-end rounded-2xl mb-5 shadow-lg shadow-primary/25">
              <ClipboardPaste className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center">
                <span className="text-[11px] font-bold text-primary">1</span>
              </div>
            </div>
            <div className="hidden md:block absolute top-7 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
            <h3 className="font-semibold text-foreground mb-2">Metni Yapıştır</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Dilekçe metnini kutuya yapıştırın veya PDF/UDF dosyası yükleyin. 100.000 karaktere kadar destekliyoruz.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-5 shadow-lg shadow-violet-500/25">
              <Brain className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-violet-500 rounded-full flex items-center justify-center">
                <span className="text-[11px] font-bold text-violet-600">2</span>
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Yapay Zeka Analiz Etsin</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Gelişmiş yapay zeka motorumuz metni tarar, ana noktaları belirler ve nesnel bir özet çıkarır.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-5 shadow-lg shadow-emerald-500/25">
              <FileCheck className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-[11px] font-bold text-emerald-600">3</span>
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Özeti Al</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Kısa, yoğun ve nesnel özeti saniyeler içinde alın. İsterseniz PDF veya UDF olarak dışa aktarın.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="group relative bg-white border border-border rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 rounded-bl-[3rem] -z-0" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 text-sm">Hukuki Dil</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dilekçe kalıplarını analiz eder, resmi üslupla özet çıkarır
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative bg-white border border-border rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 rounded-bl-[3rem] -z-0" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 text-sm">Veri Gizliliği</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Şahıs isimleri ve kişisel bilgiler otomatik olarak temizlenir
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative bg-white border border-border rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-orange-500/10 rounded-bl-[3rem] -z-0" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 text-sm">Nesnel Özet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tarafsız, öz ve kanıya dayalı çıktı üretir
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="group relative bg-white border border-border rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-violet-200 transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/5 to-purple-500/10 rounded-bl-[3rem] -z-0" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 text-sm">Hızlı Sonuç</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Saniyeler içinde detaylı özet ve istatistik çıktısı
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4 text-primary" />
          <span>Ücretsiz başlayın, hemen kayıt olun</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
