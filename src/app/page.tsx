"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SummaryForm } from "@/components/SummaryForm";
import { SummaryResult } from "@/components/SummaryResult";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UsageBar } from "@/components/UsageBar";
import { Scale, Shield, Zap, FileText, ArrowRight, Sparkles, Clock, Brain } from "lucide-react";
import type { SummaryStatsData } from "@/components/stats/SummaryStats";

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
      <div className="bg-white border border-border rounded-3xl shadow-sm shadow-border/50 p-6 sm:p-8 mb-14">
        {/* Kullanım Göstergesi */}
        {session && subscription === "free" && (
          <div className="mb-5">
            <UsageBar
              used={totalSummaries}
              total={5}
              subscription={subscription}
              compact
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
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

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
