import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { db, users, tenantMembers, videos } from "@vidforge/db";
import AdminUsersInteractive from "@/components/AdminUsersInteractive";
import { desc, sql, eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default async function AdminUsersPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch real users from DB
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      updatedAt: users.updatedAt,
      createdAt: users.createdAt,
      projectsCount: sql<number>`count(${videos.id})`
    })
    .from(users)
    .leftJoin(videos, eq(users.id, videos.createdBy))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  // Map to format expected by interactive component
  const initialUsers = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatarUrl,
    role: "user", // Ideally we'd fetch actual role from tenantMembers or global role, defaulting to user for UI display if not specified
    status: "active", // Default status
    lastLogin: formatDistanceToNow(new Date(u.updatedAt), { addSuffix: true, locale: vi }),
    projects: Number(u.projectsCount) || 0, // Should be fetched from videos/chatSessions count if needed
  }));

  // Find admins to mark them properly
  initialUsers.forEach(u => {
    if (u.email?.toLowerCase().trim() === process.env.ADMIN_EMAIL?.toLowerCase().trim()) {
      u.role = "admin";
    }
  });

  return <AdminUsersInteractive initialUsers={initialUsers} />;
}
