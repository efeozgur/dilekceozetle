"use client";

import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CompressionDonutProps {
  original: number;
  summary: number;
}

export function CompressionDonut({ original, summary }: CompressionDonutProps) {
  const compressionRate = original > 0 ? Math.round(((original - summary) / original) * 100) : 0;
  const remaining = 100 - compressionRate;

  const data = [
    { name: "Sıkıştırıldı", value: compressionRate },
    { name: "Kalan", value: remaining },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
      className="bg-white border border-border rounded-2xl p-5 flex flex-col items-center"
    >
      <h4 className="text-sm font-semibold text-foreground mb-2">Sıkıştırma Oranı</h4>
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill="#10b981" />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="text-2xl font-bold text-foreground"
          >
            %{compressionRate}
          </motion.span>
          <span className="text-xs text-muted-foreground">azaldı</span>
        </div>
      </div>
    </motion.div>
  );
}
