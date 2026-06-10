"use client";

import { motion } from "motion/react";
import { AnimatedCounter } from "./AnimatedCounter";
import { Type, AlignLeft } from "lucide-react";

interface WordStatsProps {
  originalWords: number;
  summaryWords: number;
  originalSentences: number;
  summarySentences: number;
}

export function WordStats({ originalWords, summaryWords, originalSentences, summarySentences }: WordStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white border border-border rounded-2xl p-5"
    >
      <h4 className="text-sm font-semibold text-foreground mb-4">Metin Analizi</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="flex items-center justify-center w-9 h-9 bg-indigo-50 rounded-lg shrink-0">
            <Type className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Kelime</p>
            <div className="flex items-baseline gap-1.5">
              <AnimatedCounter value={originalWords} className="text-lg font-bold text-foreground" />
              <span className="text-xs text-muted-foreground">→</span>
              <AnimatedCounter value={summaryWords} className="text-lg font-bold text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="flex items-center justify-center w-9 h-9 bg-amber-50 rounded-lg shrink-0">
            <AlignLeft className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cümle</p>
            <div className="flex items-baseline gap-1.5">
              <AnimatedCounter value={originalSentences} className="text-lg font-bold text-foreground" />
              <span className="text-xs text-muted-foreground">→</span>
              <AnimatedCounter value={summarySentences} className="text-lg font-bold text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
