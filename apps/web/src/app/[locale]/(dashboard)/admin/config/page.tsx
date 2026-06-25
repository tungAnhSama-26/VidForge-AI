import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { db, systemConfigs } from "@vidforge/db";
import AdminConfigInteractive from "@/components/AdminConfigInteractive";

export default async function AdminConfigPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  // Load all saved configs from DB
  let configObj: Record<string, string> = {};
  try {
    const configs = await db.select().from(systemConfigs);
    configObj = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (e) {
    console.error("Failed to load system configs:", e);
  }

  return <AdminConfigInteractive initialConfig={configObj} />;
}
