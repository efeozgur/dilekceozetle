"use client";

import { motion } from "motion/react";
import { AnimatedCounter } from "./AnimatedCounter";
import { Clock, Zap } from "lucide-react";

interface ReadingTimeProps {
  originalMinutes: number;
  summaryMinutes: number;
}

export function ReadingTime({ originalMinutes, summaryMinutes }: ReadingTimeProps) {
  const timeSaved = originalMinutes - summaryMinutes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-white border border-border rounded-2xl p-5"
    >
      <h4 className="text-sm font-semibold text-foreground mb-4">Okuma Süresi</h4>
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Orijinal</span>
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedCounter value={originalMinutes} className="text-3xl font-bold text-foreground" />
            <span className="text-sm text-muted-foreground">dk</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-full"
          >
            <Zap className="h-5 w-5 text-emerald-500" />
          </motion.div>
          <span className="text-xs text-emerald-600 font-semibold mt-1">
            {timeSaved > 0 ? `${timeSaved} dk kazanıldı` : ""}
          </span>
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center gap-2 mb-2 justify-end">
            <span className="text-xs text-muted-foreground">Özet</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1 justify-end">
            <AnimatedCounter value={summaryMinutes} className="text-3xl font-bold text-emerald-600" />
            <span className="text-sm text-muted-foreground">dk</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
