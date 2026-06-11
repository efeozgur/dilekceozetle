import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
import { SearchUsers } from "./SearchUsers";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; subscription?: string; page?: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard?error=forbidden");

  const params = await searchParams;
  const search = params.search || "";
  const subscription = params.subscription || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const perPage = 20;

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { name: { contains: search } },
    ];
  }
  if (subscription && ["free", "pro"].includes(subscription)) {
    where.subscription = subscription;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        _count: { select: { summaries: true, paymentRequests: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <MobileAdminNav />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Kullanıcılar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} kullanıcı bulundu
        </p>
      </div>

      <SearchUsers
        initialSearch={search}
        initialSubscription={subscription}
      />

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Kullanıcı
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Abonelik
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Durum
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Özet
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Kayıt Tarihi
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{user.email}</p>
                      {user.name && (
                        <p className="text-xs text-muted-foreground">{user.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={user.subscription === "pro" ? "Pro" : "Free"}
                      variant={user.subscription === "pro" ? "info" : "default"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {user.bannedAt ? (
                      <StatusBadge label="Yasaklı" variant="danger" />
                    ) : (
                      <StatusBadge label="Aktif" variant="success" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user._count.summaries}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-primary hover:text-primary-dark font-medium text-xs"
                    >
                      Görüntüle
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Kullanıcı bulunamadı
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
                  href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ""}${subscription ? `&subscription=${subscription}` : ""}`}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Önceki
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ""}${subscription ? `&subscription=${subscription}` : ""}`}
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
