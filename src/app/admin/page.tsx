"use client";

import { StatsCard } from "@/components/admin/StatsCard";
import { AdminChart } from "@/components/admin/AdminChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
import {
  Users,
  Crown,
  FileText,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AdminStats {
  stats: {
    totalUsers: number;
    proUsers: number;
    totalSummaries: number;
    pendingPayments: number;
    usersGrowth: number;
    summariesGrowth: number;
  };
  recent: {
    users: { id: string; email: string; name: string | null; subscription: string; createdAt: string }[];
    payments: { id: string; amount: number; status: string; email: string; createdAt: string }[];
  };
  charts: {
    dailySummaries: { date: string; count: number }[];
    dailyUsers: { date: string; count: number }[];
    monthlyRevenue: { month: string; revenue: number }[];
    totalTokens: number;
  };
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
}

function formatMonth(m: string) {
  const [year, month] = m.split("-");
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <MobileAdminNav />
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-6 h-28" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-6 h-72" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-muted-foreground">Veriler yüklenemedi.</div>;

  const { stats, recent, charts } = data;

  return (
    <div className="space-y-6">
      <MobileAdminNav />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Genel bakış ve istatistikler
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers}
          icon={Users}
          change={stats.usersGrowth}
          changeType={stats.usersGrowth >= 0 ? "positive" : "negative"}
        />
        <StatsCard
          title="Aktif Pro Üye"
          value={stats.proUsers}
          icon={Crown}
        />
        <StatsCard
          title="Toplam Özet"
          value={stats.totalSummaries}
          icon={FileText}
          change={stats.summariesGrowth}
          changeType={stats.summariesGrowth >= 0 ? "positive" : "negative"}
        />
        <StatsCard
          title="Bekleyen Ödeme"
          value={stats.pendingPayments}
          icon={Clock}
          subtitle={stats.pendingPayments > 0 ? "Onay bekliyor" : "Temsiz"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChart
          data={charts.dailySummaries.map((d) => ({ ...d, label: formatDate(d.date) }))}
          type="bar"
          dataKey="count"
          xKey="label"
          label="Son 7 Gün Özet Sayısı"
        />
        <AdminChart
          data={charts.dailyUsers.map((d) => ({ ...d, label: formatDate(d.date) }))}
          type="line"
          dataKey="count"
          xKey="label"
          color="#10b981"
          label="Son 7 Gün Yeni Kullanıcı"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChart
          data={charts.monthlyRevenue.map((d) => ({ ...d, label: formatMonth(d.month) }))}
          type="bar"
          dataKey="revenue"
          xKey="label"
          color="#f59e0b"
          label="Aylık Gelir (₺)"
        />
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Son Aktivite</h3>
          <div className="space-y-3">
            {recent.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[200px]">{p.email}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">₺{p.amount}</span>
                  <StatusBadge
                    label={p.status === "APPROVED" ? "Onaylandı" : p.status === "REJECTED" ? "Reddedildi" : "Bekliyor"}
                    variant={p.status === "APPROVED" ? "success" : p.status === "REJECTED" ? "danger" : "warning"}
                  />
                </div>
              </div>
            ))}
            {recent.payments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Henüz ödeme yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
