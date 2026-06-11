import { isAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { getSettings } from "./actions";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard?error=forbidden");

  const settings = await getSettings();

  const grouped = settings.reduce(
    (acc, setting) => {
      if (!acc[setting.category]) acc[setting.category] = [];
      acc[setting.category].push(setting);
      return acc;
    },
    {} as Record<string, typeof settings>
  );

  return (
    <div className="space-y-6">
      <MobileAdminNav />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Sistem Ayarları</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Uygulama ayarlarını yönetin
        </p>
      </div>

      <SettingsForm settings={grouped} />
    </div>
  );
}
