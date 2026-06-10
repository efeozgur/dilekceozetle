"use client";

import { useState } from "react";
import { CompareForm } from "@/components/CompareForm";
import { CompareResult } from "@/components/CompareResult";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { GitCompareArrows, ArrowRight, Sparkles } from "lucide-react";

type ViewState = "form" | "result" | "error";

export default function ComparePage() {
  const [view, setView] = useState<ViewState>("form");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleResult = (data: string) => {
    setResult(data);
    setView("result");
  };

  const handleError = (msg: string) => {
    setError(msg);
    setView("error");
  };

  const handleReset = () => {
    setResult("");
    setError("");
    setView("form");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      {/* Hero Section */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase">
          <GitCompareArrows className="h-3.5 w-3.5" />
          Dilekçe Karşılaştırma
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
          İki Dilekçeyi
          <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent"> Karşılaştırın</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          İki farklı dilekçe metnini yapıştırın, yapay zeka motorumuz
          arasındaki farkları tespit etsin ve madde madde sunsun.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-border rounded-3xl shadow-sm shadow-border/50 p-6 sm:p-8 mb-14">
        {view === "form" && (
          <CompareForm onResult={handleResult} onError={handleError} />
        )}

        {view === "result" && result && (
          <CompareResult result={result} onReset={handleReset} />
        )}

        {view === "error" && (
          <div className="space-y-4">
            <ErrorDisplay message={error} onDismiss={handleReset} />
            <CompareForm onResult={handleResult} onError={handleError} />
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="group relative bg-white border border-border rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-violet-500/10 rounded-bl-[3rem] -z-0" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
              <GitCompareArrows className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 text-sm">Fark Tespiti</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              İki metin arasındaki talepler, iddialar ve olay örgüsü farkları tespit edilir
            </p>
          </div>
        </div>

        <div className="group relative bg-white border border-border rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 rounded-bl-[3rem] -z-0" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 text-sm">Kategorize Analiz</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Farklar kategorilere ayrılır: Talepler, İddialar, Olay Örgüsü, Hukuki Dayanak
            </p>
          </div>
        </div>

        <div className="group relative bg-white border border-border rounded-2xl p-6 overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-orange-500/10 rounded-bl-[3rem] -z-0" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/20">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 text-sm">Önem Sıralaması</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Farklar kritikten düşüğe doğru sıralanır, en önemli değişiklikler öne çıkar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
