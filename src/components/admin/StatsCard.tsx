"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  subtitle,
}: StatsCardProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-semibold",
                  changeType === "positive" && "text-emerald-600",
                  changeType === "negative" && "text-red-600",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {changeType === "positive" && "+"}
                {change}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                son 30 gün
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gradient-start/10 to-gradient-end/10 rounded-xl">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
