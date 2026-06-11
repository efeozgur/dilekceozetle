import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
import { SearchSummaries } from "./SearchSummaries";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminSummariesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard?error=forbidden");

  const params = await searchParams;
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const perPage = 20;

  const where: Prisma.SummaryWhereInput = {};
  if (search) {
    where.OR = [
      { originalText: { contains: search } },
      { user: { email: { contains: search } } },
    ];
  }

  const [summaries, total] = await Promise.all([
    prisma.summary.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.summary.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <MobileAdminNav />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Özetler</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} özet bulundu
        </p>
      </div>

      <SearchSummaries initialSearch={search} />

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Kullanıcı
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Orijinal Metin
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Karakter
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Token
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Tarih
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaries.map((summary) => (
                <tr key={summary.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${summary.user.id}`}
                      className="text-primary hover:text-primary-dark text-xs font-medium"
                    >
                      {summary.user.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                      {summary.originalText.slice(0, 100)}...
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {summary.charCount}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {summary.tokenEstimate || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(summary.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/summaries/${summary.id}`}
                      className="text-primary hover:text-primary-dark font-medium text-xs"
                    >
                      Görüntüle
                    </Link>
                  </td>
                </tr>
              ))}
              {summaries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Özet bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Sayfa {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/summaries?page=${page - 1}${search ? `&search=${search}` : ""}`}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Önceki
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/summaries?page=${page + 1}${search ? `&search=${search}` : ""}`}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Sonraki
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
