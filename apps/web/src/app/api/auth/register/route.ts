import { NextResponse } from "next/server";
import { db, users, tenants, tenantMembers } from "@vidforge/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email đã được sử dụng" }, { status: 400 });
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

    // Create tenant and tenant member
    const newTenants = await db.insert(tenants).values({
      name: `${name}'s Workspace`,
      slug: `workspace-${dbUser.id.substring(0, 8)}`,
    }).returning();
    
    await db.insert(tenantMembers).values({
      tenantId: newTenants[0].id,
      userId: dbUser.id,
      role: "owner"
    });

    return NextResponse.json({ message: "Đăng ký thành công", userId: dbUser.id }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra khi đăng ký" }, { status: 500 });
  }
}
