"use client";

import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CharCompareChartProps {
  original: number;
  summary: number;
}

export function CharCompareChart({ original, summary }: CharCompareChartProps) {
  const data = [
    { name: "Orijinal", value: original, fill: "#6366f1" },
    { name: "Özet", value: summary, fill: "#10b981" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white border border-border rounded-2xl p-5"
    >
      <h4 className="text-sm font-semibold text-foreground mb-4">Karakter Karşılaştırması</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
          <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString("tr-TR")} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString("tr-TR"), "Karakter"]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
