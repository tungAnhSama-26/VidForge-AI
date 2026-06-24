import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Users, FileText, Activity, AlertCircle, Zap, Clock, Trophy, Settings } from "lucide-react";
import { db, videos, users, auditLogs, chatSessions } from "@vidforge/db";
import { desc, sql, gte, eq, and } from "drizzle-orm";
import { subDays, startOfDay, eachDayOfInterval, format } from "date-fns";
import AdminDashboardInteractive from "@/components/AdminDashboardInteractive";
import Link from "next/link";
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const locale = await getLocale();

  const resolvedSearchParams = await searchParams;
  const range = typeof resolvedSearchParams?.range === "string" ? resolvedSearchParams.range : "30d";

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  try {
    // Calculate start date based on range
    let startDate = new Date(0); // Epoch (all time)
    if (range === "7d") startDate = startOfDay(subDays(new Date(), 7));
    else if (range === "30d") startDate = startOfDay(subDays(new Date(), 30));
    else if (range === "90d") startDate = startOfDay(subDays(new Date(), 90));

    const endDate = new Date();
    const dateRange = range !== "all" 
      ? eachDayOfInterval({ start: startDate, end: endDate }).map(d => format(d, 'yyyy-MM-dd'))
      : [];

    // Build condition
    const dateCondition = range !== "all" ? gte(videos.createdAt, startDate) : undefined;
    const userDateCondition = range !== "all" ? gte(users.createdAt, startDate) : undefined;

    // 1. Total Users
    const [totalUsersObj] = await db.select({ count: sql<number>`count(*)` }).from(users).where(userDateCondition);
    const totalUsers = totalUsersObj?.count || 0;

    // 2. Total Videos in range
    const [totalVideosObj] = await db.select({ count: sql<number>`count(*)` }).from(videos).where(dateCondition);
    const totalVideos = totalVideosObj?.count || 0;

    // 3. Top Prompts in range
    const topPrompts = await db
      .select({
        prompt: videos.prompt,
        count: sql<number>`count(*)`
      })
      .from(videos)
      .where(dateCondition)
      .groupBy(videos.prompt)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    // 4. Recent videos in range
    const recentProjectsList = await db
      .select()
      .from(videos)
      .where(dateCondition)
      .orderBy(desc(videos.createdAt))
      .limit(4);

    // 5. Chart Data (Group by Day)
    const chartDataRaw = await db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${videos.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`
      })
      .from(videos)
      .where(dateCondition)
      .groupBy(sql`date_trunc('day', ${videos.createdAt})`)
      .orderBy(sql`date_trunc('day', ${videos.createdAt})`);

    // Transform for Recharts
    const chartData = range !== "all" ? dateRange.map(date => {
      const found = chartDataRaw.find(d => d.date === date);
      return {
        date,
        count: found ? Number(found.count) : 0
      };
    }) : chartDataRaw.map(d => ({
      date: d.date,
      count: Number(d.count)
    }));

    // 6. System Errors
    const errorLogCondition = range !== "all" ? gte(auditLogs.createdAt, startDate) : undefined;
    let totalErrors = 0;
    try {
      const [totalErrorsObj] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(and(eq(auditLogs.type, 'error'), errorLogCondition));
      totalErrors = totalErrorsObj?.count || 0;
    } catch (e) {
      console.error("Failed to query audit_logs on dashboard:", e);
      totalErrors = 0; // Tránh lỗi crash trang nếu chưa push schema
    }

    // 7. Total Chat Sessions
    const chatCondition = range !== "all" ? gte(chatSessions.createdAt, startDate) : undefined;
    const [totalChatsObj] = await db.select({ count: sql<number>`count(*)` }).from(chatSessions).where(chatCondition);
    const totalChats = totalChatsObj?.count || 0;

    // 8. Chat Traffic Data (Group by Day)
    const chatTrafficRaw = await db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${chatSessions.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`
      })
      .from(chatSessions)
      .where(chatCondition)
      .groupBy(sql`date_trunc('day', ${chatSessions.createdAt})`)
      .orderBy(sql`date_trunc('day', ${chatSessions.createdAt})`);
      
    const chatTrafficData = range !== "all" ? dateRange.map(date => {
      const found = chatTrafficRaw.find(d => d.date === date);
      return {
        name: new Date(date).toLocaleDateString('vi-VN', { weekday: 'short' }), // 'Mon', 'Tue'
        requests: found ? Number(found.count) : 0
      };
    }) : chatTrafficRaw.map(d => ({
      name: new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short' }), // 'Mon', 'Tue'
      requests: Number(d.count)
    }));

    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/60">Tổng quan hệ thống và chỉ số hiệu suất</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/config" className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <AdminDashboardInteractive 
          totalUsers={totalUsers.toString()}
          totalVideos={totalVideos.toString()}
          totalChats={totalChats.toString()}
          totalErrors={totalErrors.toString()}
          recentProjectsList={recentProjectsList}
          topPrompts={topPrompts}
          chartData={chartData}
          chatTrafficData={chatTrafficData}
          currentRange={range}
        />
      </div>
    );
  } catch (error: any) {
    console.error("Admin Dashboard render error:", error);
    return (
      <div className="p-8 max-w-7xl mx-auto text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Lỗi tải dữ liệu Admin</h1>
        <p className="bg-red-900/20 text-red-300 p-4 rounded-xl border border-red-500/30 whitespace-pre-wrap">
          {error?.message || "Unknown error occurred"}
          {"\n\nStack:\n"}
          {error?.stack}
        </p>
      </div>
    );
  }
}
