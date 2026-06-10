"use client";

import { motion } from "motion/react";
import { FileText, Sparkles } from "lucide-react";

export function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <div className="space-y-6">
        {/* Fake textarea with pulse */}
        <div className="relative w-full h-72 border border-border rounded-2xl bg-muted/20 overflow-hidden">
          {/* Animated shimmer lines */}
          <div className="p-5 space-y-3">
            {[100, 92, 78, 85, 60, 95, 70, 88, 45, 82, 68, 90, 55, 75].map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.15, scaleX: 0.3 }}
                animate={{
                  opacity: [0.15, 0.35, 0.15],
                  scaleX: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
                className="h-2.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full origin-left"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>

          {/* Center icon + text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center shadow-xl shadow-primary/30 mb-4"
            >
              <Sparkles className="h-7 w-7 text-white" />
            </motion.div>
            <p className="text-sm font-semibold text-foreground">Dilekçe analiz ediliyor...</p>
            <p className="text-xs text-muted-foreground mt-1">Yapay zeka metni inceliyor</p>
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Özetleniyor
            </span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              lütfen bekleyin
            </motion.span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-gradient-start to-gradient-end rounded-full"
            />
          </div>
        </div>

        {/* Floating dots */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {["Dil analizi", "Sıkıştırma", "Nesnellik"].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.8, duration: 0.5 }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-gradient-start to-gradient-end"
              />
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
