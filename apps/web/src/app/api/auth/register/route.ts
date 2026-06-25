import { NextResponse } from "next/server";
import { db, users, tenants, tenantMembers } from "@vidforge/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    console.log("[Register API] Request:", { name, email, passwordLen: password?.length });

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUsers = await db.insert(users).values({
      name,
      email,
      passwordHash,
    }).returning();
    const dbUser = newUsers[0];

    // Create tenant and member record
    const newTenants = await db.insert(tenants).values({
      name: `${name}'s Workspace`,
      slug: `workspace-${dbUser.id.substring(0, 8)}`,
    }).returning();

    await db.insert(tenantMembers).values({
      tenantId: newTenants[0].id,
      userId: dbUser.id,
      role: "owner",
    });

    console.log("[Register API] ✅ Thành công:", email);
    return NextResponse.json({ message: "Đăng ký thành công", userId: dbUser.id }, { status: 201 });

  } catch (error: any) {
    const errMsg = error?.message || String(error);
    const errCode = error?.code || "";
    console.error("[Register API] ❌ Lỗi:", { message: errMsg, code: errCode });

    let userMessage = "Có lỗi xảy ra khi đăng ký";
    if (errCode === "23505") {
      userMessage = "Email này đã được sử dụng.";
    } else if (errMsg.includes("ECONNREFUSED") || errMsg.includes("connect")) {
      userMessage = "Không thể kết nối database. Kiểm tra PostgreSQL đang chạy.";
    }

    return NextResponse.json(
      { message: userMessage, detail: process.env.NODE_ENV === "development" ? errMsg : undefined },
      { status: 500 }
    );
  }
}
