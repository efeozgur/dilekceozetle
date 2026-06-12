"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CompareForm } from "@/components/CompareForm";
import { CompareResult } from "@/components/CompareResult";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { GitCompareArrows, LogIn, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";

type ViewState = "form" | "result" | "error";

export default function ComparePage() {
  const { data: session } = useSession();
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
        >
          <GitCompareArrows className="h-4 w-4" />
          Dilekçe Karşılaştırma
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3"
        >
          İki Dilekçeyi{" "}
          <span className="text-gradient">Karşılaştırın</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          İki dilekçe metnini yapıştırın, yapay zeka aralarındaki farkları kategorize etsin.
        </motion.p>
      </div>

      {!session ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-3xl blur-xl opacity-50" />
          <div className="relative bg-white border border-border rounded-2xl p-10 sm:p-14 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gradient-start to-gradient-end rounded-2xl shadow-lg shadow-primary/20 mb-6">
              <LogIn className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              Karşılaştırma için giriş yapın
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              İki dilekçe arasındaki farkları görmek için giriş yapın veya ücretsiz hesap oluşturun.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/auth/login"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <LogIn className="h-4 w-4" />
                Giriş Yap
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/auth/register"
                className="inline-flex items-center gap-2 border-2 border-border text-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-muted hover:border-primary/20 transition-all duration-200"
              >
                Kayıt Ol
              </a>
            </div>

            {/* Features hint */}
            <div className="mt-10 pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4">Karşılaştırma özellikleri:</p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Talep farklılıkları
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Hukuki dayanak analizi
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Kategorize sonuçlar
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-2xl blur opacity-50" />
            <div className="relative bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-lg">
              {view === "form" && (
                <CompareForm onResult={handleResult} onError={handleError} />
              )}

              {view === "result" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CompareResult result={result} onReset={handleReset} />
                </motion.div>
              )}

              {view === "error" && (
                <div className="space-y-4">
                  <ErrorDisplay message={error} onDismiss={handleReset} />
                  <CompareForm onResult={handleResult} onError={handleError} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
