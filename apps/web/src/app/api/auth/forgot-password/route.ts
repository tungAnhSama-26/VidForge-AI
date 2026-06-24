import { NextResponse } from "next/server";
import { db, users, passwordResetTokens } from "@vidforge/db";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email là bắt buộc" }, { status: 400 });
    }

    // Tìm user theo email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Luôn trả về thành công dù email có tồn tại hay không (bảo mật)
    if (!user) {
      return NextResponse.json({
        message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."
      });
    }

    // Xóa các token cũ chưa dùng của user này
    await db.delete(passwordResetTokens).where(
      eq(passwordResetTokens.userId, user.id)
    );

    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    // Lưu token vào DB
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // === MOCK: Log ra console thay vì gửi email thật ===
    // Trong production, thay đoạn này bằng Resend/Nodemailer/SendGrid
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    console.log("\n==========================================");
    console.log("🔑 [MOCK EMAIL] Password Reset Request");
    console.log(`📧 To: ${email}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log(`⏰ Expires: ${expiresAt.toLocaleString("vi-VN")}`);
    console.log("==========================================\n");
    // === END MOCK ===

    return NextResponse.json({
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."
    });
  } catch (error) {
    console.error("Lỗi forgot-password:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
