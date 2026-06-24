import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { db, auditLogs, users } from "@vidforge/db";
import { desc, eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import AdminLogsInteractive from "@/components/AdminLogsInteractive";

export default async function AdminLogsPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch real logs
  let logsData: any[] = [];
  try {
    logsData = await db
      .select({
        id: auditLogs.id,
        type: auditLogs.type,
        action: auditLogs.action,
        ip: auditLogs.ipAddress,
        target: auditLogs.target,
        createdAt: auditLogs.createdAt,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt));
  } catch (e) {
    console.error("Failed to query audit_logs on logs page:", e);
    logsData = []; // Tránh lỗi crash
  }

  // Map to format expected by interactive component
  const formattedLogs = logsData.map((l) => ({
    id: l.id,
    type: l.type,
    action: l.action,
    user: l.userEmail || "System",
    ip: l.ip || "Unknown",
    target: l.target,
    time: formatDistanceToNow(new Date(l.createdAt), { addSuffix: true, locale: vi }),
  }));

  return <AdminLogsInteractive initialLogs={formattedLogs} />;
}
