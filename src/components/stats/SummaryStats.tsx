"use client";

import { motion } from "motion/react";
import { CharCompareChart } from "./CharCompareChart";
import { CompressionDonut } from "./CompressionDonut";
import { WordStats } from "./WordStats";
import { ReadingTime } from "./ReadingTime";
import { BarChart3 } from "lucide-react";

export interface SummaryStatsData {
  charCount: number;
  summaryCharCount: number;
  wordCount: number;
  summaryWordCount: number;
  sentenceCount: number;
  summarySentenceCount: number;
  readingTime: number;
  summaryReadingTime: number;
  tokenEstimate: number;
}

interface SummaryStatsProps {
  data: SummaryStatsData;
}

export function SummaryStats({ data }: SummaryStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <BarChart3 className="h-4 w-4 text-primary" />
        İstatistikler
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CharCompareChart original={data.charCount} summary={data.summaryCharCount} />
        <CompressionDonut original={data.charCount} summary={data.summaryCharCount} />
        <WordStats
          originalWords={data.wordCount}
          summaryWords={data.summaryWordCount}
          originalSentences={data.sentenceCount}
          summarySentences={data.summarySentenceCount}
        />
        <ReadingTime
          originalMinutes={data.readingTime}
          summaryMinutes={data.summaryReadingTime}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-4 text-xs text-muted-foreground py-2"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          Orijinal: {data.tokenEstimate.toLocaleString("tr-TR")} token
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Özet: ~{Math.ceil(data.summaryCharCount / 4).toLocaleString("tr-TR")} token
        </span>
      </motion.div>
    </motion.div>
  );
}
