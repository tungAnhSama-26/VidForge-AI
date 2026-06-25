import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, systemConfigs } from "@vidforge/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const configs = await db.select().from(systemConfigs);
    
    // Convert array of {key, value} to an object
    const configObj = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(configObj);
  } catch (error) {
    console.error("Error fetching system configs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    // data is an object like { "grokApiKey": "xxx", "veo3WebhookUrl": "yyy" }
    const promises = Object.entries(data).map(async ([key, value]) => {
      if (value !== undefined && value !== null) {
        // Upsert
        const existing = await db.select().from(systemConfigs).where(eq(systemConfigs.key, key)).limit(1);
        if (existing.length > 0) {
          await db.update(systemConfigs).set({ value: String(value), updatedAt: new Date() }).where(eq(systemConfigs.key, key));
        } else {
          await db.insert(systemConfigs).values({ key, value: String(value) });
        }
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving system configs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
