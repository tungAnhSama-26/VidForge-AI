import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { db, videos, users } from "@vidforge/db";
import { desc, eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import AdminContentInteractive from "@/components/AdminContentInteractive";

export default async function AdminContentPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch real videos
  const allVideos = await db
    .select({
      id: videos.id,
      title: videos.title,
      status: videos.status,
      createdAt: videos.createdAt,
      userEmail: users.email,
    })
    .from(videos)
    .leftJoin(users, eq(videos.createdBy, users.id))
    .orderBy(desc(videos.createdAt));

  // Map to format expected by interactive component
  const initialItems = allVideos.map((v) => ({
    id: v.id,
    title: v.title || "Không có tiêu đề",
    user: v.userEmail || "Người dùng ẩn danh",
    status: v.status,
    images: 0, // Could be fetched if we store images per video
    createdAt: formatDistanceToNow(new Date(v.createdAt), { addSuffix: true, locale: vi }),
    views: 0,
  }));

  return <AdminContentInteractive initialItems={initialItems} />;
}
