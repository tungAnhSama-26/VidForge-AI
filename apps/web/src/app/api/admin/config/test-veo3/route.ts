import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ success: false, message: "URL là bắt buộc" }, { status: 400 });
    }

    // Ping the URL
    // We send a simple GET or POST request. 
    // Since it's a webhook URL, we will send a simple GET request for testing connectivity
    // or maybe a POST with a ping payload. Let's send a simple GET for now to see if it resolves.
    
    // We'll add an abort controller to timeout the request in 5 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "GET", // Or HEAD
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // It doesn't need to be 200, any response means we reached the server.
    // 405 Method Not Allowed is also a valid response from a webhook endpoint that only expects POST.
    if (response.ok || response.status === 405 || response.status === 404 || response.status === 401 || response.status === 403) {
      return NextResponse.json({ 
        success: true, 
        message: `Kết nối thành công (HTTP ${response.status})` 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `Kết nối thất bại (HTTP ${response.status})` 
      });
    }

  } catch (error: any) {
    console.error("VEO 3 Test Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Không thể kết nối: ${error.message}` 
    }, { status: 500 });
  }
}
