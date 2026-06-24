import { auth } from "@/auth";
import { Sparkles, FileText, ImageIcon, Clock, ArrowRight, Zap, Plus, MoreHorizontal, Trophy } from "lucide-react";
import Link from "next/link";
import { db, videos } from "@vidforge/db";
import { desc, sql, gte, and, eq } from "drizzle-orm";
import { subDays, startOfDay, format } from "date-fns";
import DashboardInteractive from "@/components/DashboardInteractive";

export default async function UserDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const range = typeof resolvedSearchParams?.range === "string" ? resolvedSearchParams.range : "30d";

  const userId = session?.user?.id;
  if (!userId) {
    return <div>Unauthorized</div>;
  }

  try {
    // Calculate start date based on range
    let startDate = new Date(0); // Epoch (all time)
    if (range === "7d") startDate = startOfDay(subDays(new Date(), 7));
    else if (range === "30d") startDate = startOfDay(subDays(new Date(), 30));
    else if (range === "90d") startDate = startOfDay(subDays(new Date(), 90));

    // Build condition
    const dateCondition = range !== "all" 
      ? and(gte(videos.createdAt, startDate), eq(videos.createdBy, userId))
      : eq(videos.createdBy, userId);

    // 1. Total Videos in range
    const [totalVideosObj] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videos)
      .where(dateCondition);
    const totalVideos = totalVideosObj?.count || 0;

    // 2. Total Duration in range
    const [totalDurationObj] = await db
      .select({ sum: sql<number>`sum(duration)` })
      .from(videos)
      .where(dateCondition);
    const totalDuration = totalDurationObj?.sum || 0;

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

    // 5. Chart Data (Group by Day in range)
    // We use Postgres date_trunc
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
    const chartData = chartDataRaw.map(d => ({
      date: d.date,
      count: Number(d.count)
    }));

    return (
      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Header (Static) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 p-8 shadow-2xl mb-8">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              Chào mừng trở lại, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">{session?.user?.name?.split(' ')[0] || "bạn"}!</span> 👋
            </h1>
            <p className="text-white/60 text-lg max-w-xl">
              Khám phá hiệu suất sáng tạo của bạn qua các thống kê chi tiết dưới đây.
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <Link href="/dashboard/generate" className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <Plus className="w-5 h-5" />
              Tạo Kịch bản mới
            </Link>
          </div>
        </div>

        <DashboardInteractive 
          totalVideos={totalVideos.toString()}
          totalDuration={totalDuration.toString()}
          topPromptsCount={topPrompts.length.toString()}
          recentProjectsCount={recentProjectsList.length.toString()}
          recentProjectsList={recentProjectsList}
          topPrompts={topPrompts}
          chartData={chartData}
          currentRange={range}
        />
      </div>
    );
  } catch (error: any) {
    console.error("Dashboard render error:", error);
    return (
      <div className="p-8 max-w-7xl mx-auto text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Lỗi tải dữ liệu Dashboard</h1>
        <p className="bg-red-900/20 text-red-300 p-4 rounded-xl border border-red-500/30 whitespace-pre-wrap">
          {error?.message || "Unknown error occurred"}
          {"\n\nStack:\n"}
          {error?.stack}
        </p>
      </div>
    );
  }
}

