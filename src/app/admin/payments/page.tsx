import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminPaymentRow } from "./AdminPaymentRow";
import { ShieldCheck, Clock, History } from "lucide-react";
import Link from "next/link";

function formatDateTR(d: Date): string {
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPaymentsPage() {
  if (!(await isAdmin())) {
    redirect("/dashboard?error=forbidden");
  }

  const pendingRequests = await prisma.paymentRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  const history = await prisma.paymentRequest.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    orderBy: { reviewedAt: "desc" },
    take: 30,
    include: {
      user: { select: { email: true } },
    },
  });

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Ödeme taleplerini yönet
            </p>
          </div>
        </div>

        {/* Pending Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-amber-600" />
            <h2 className="text-lg font-semibold text-foreground">
              Bekleyen Ödemeler ({pendingRequests.length})
            </h2>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                Bekleyen ödeme talebi yok.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Kullanıcı
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Tutar
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        IBAN Son 4
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Tarih
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Not
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        İşlem
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((req) => (
                      <AdminPaymentRow
                        key={req.id}
                        request={{
                          id: req.id,
                          user: {
                            email: req.user.email,
                            name: req.user.name,
                          },
                          amountTry: req.amountTry,
                          ibanLast4: req.ibanLast4,
                          note: req.note,
                          createdAt: req.createdAt.toISOString(),
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Geçmiş ({history.length})
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-12 text-center">
              <p className="text-muted-foreground font-medium">
                Henüz işlenmiş talep yok.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Kullanıcı
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Tutar
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Durum
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Tarih
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Red Nedeni
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((req) => (
                      <tr key={req.id} className="border-b border-border">
                        <td className="py-3 px-4 text-sm text-foreground">
                          {req.user.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {req.amountTry} TL
                        </td>
                        <td className="py-3 px-4">
                          {req.status === "APPROVED" ? (
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              Onaylandı
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-full">
                              Reddedildi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {req.reviewedAt
                            ? formatDateTR(req.reviewedAt)
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs">
                          {req.rejectReason || <em>—</em>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Dashboard'a dön
          </Link>
        </div>
      </div>
    </div>
  );
}
