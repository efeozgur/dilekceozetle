import { prisma } from "@/lib/prisma";

interface SystemSettings {
  pro_price: string;
  enterprise_price: string;
  free_monthly_limit: string;
  iban_owner: string;
  iban_number: string;
  site_name: string;
}

const defaults: SystemSettings = {
  pro_price: "299",
  enterprise_price: "799",
  free_monthly_limit: "3",
  iban_owner: "Özgür App",
  iban_number: "TR00 0000 0000 0000 0000 0000 00",
  site_name: "Dilekçe Özeti",
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const rows = await prisma.systemSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...defaults, ...map };
  } catch {
    return defaults;
  }
}
