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

  // --- START FAKE DATA OVERRIDE ---
  const fakeLogs = Array.from({ length: 50 }).map((_, i) => {
    const types = ["info", "info", "info", "success", "success", "warning", "error", "security"];
    const actions = [
      "Đăng nhập thành công",
      "Tạo kịch bản mới",
      "Cập nhật API Key",
      "Đăng nhập thất bại (Sai mật khẩu)",
      "Đổi mật khẩu tài khoản",
      "Xuất dữ liệu người dùng",
      "Xóa dự án video",
      "Sao lưu hệ thống thành công",
      "Vượt quá giới hạn Rate Limit",
      "Phát hiện đăng nhập từ IP lạ",
      "Tạo video từ prompt",
      "Nâng cấp gói Premium"
    ];
    
    const usersList = ["admin@vidforge.ai", "user1@gmail.com", "creator@yahoo.com", "system", "hacker@anonymous.com", "guest_2938@mail.com"];
    const ips = ["192.168.1.1", "10.0.0.5", "172.16.0.4", "113.190.23.45", "14.232.11.22", "118.69.112.50"];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = usersList[Math.floor(Math.random() * usersList.length)];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    
    const d = new Date();
    d.setMinutes(d.getMinutes() - i * 45); // Spread over past days
    
    return {
      id: `log-${i}`,
      type,
      action,
      user,
      ip,
      target: i % 3 === 0 ? "VideoService" : i % 4 === 0 ? "AuthService" : "System",
      time: formatDistanceToNow(d, { addSuffix: true, locale: vi }),
    };
  });
  
  const displayLogs = fakeLogs; // Override completely for UI testing
  // --- END FAKE DATA OVERRIDE ---

  return <AdminLogsInteractive initialLogs={displayLogs} />;
}
