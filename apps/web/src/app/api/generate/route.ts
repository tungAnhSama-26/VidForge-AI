import { NextResponse } from 'next/server';
import { db, videos, tenantMembers, chatMessages } from '@vidforge/db';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

function isOverloadError(data: any): boolean {
  const msg = data?.error?.message || "";
  return (
    msg.toLowerCase().includes("high demand") ||
    msg.toLowerCase().includes("overloaded") ||
    msg.toLowerCase().includes("rate limit") ||
    msg.toLowerCase().includes("503") ||
    data?.error?.code === 503 ||
    data?.error?.status === "UNAVAILABLE"
  );
}

async function callEndpoint(endpoint: string, model: string, key: string, messages: any[]) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.7 })
  });
  return res.json();
}

async function generateWithOpenAI(apiKey: string, promptText: string, useSysInstruction: string = "") {
  const messages: any[] = [];
  if (useSysInstruction) {
    messages.push({ role: "system", content: useSysInstruction });
  }
  messages.push({ role: "user", content: promptText });

  const groqEndpoint = "https://api.groq.com/openai/v1/chat/completions";
  const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const geminiKey = process.env.GEMINI_API_KEY || apiKey;

  // Try Groq first
  let data = await callEndpoint(groqEndpoint, "llama-3.3-70b-versatile", apiKey, messages);

  // If Groq fails/overloaded, fallback to Gemini with exponential backoff
  if (data?.error) {
    console.warn("[generate] Groq failed:", data.error.message, "— trying Gemini...");
    const delays = [1000, 3000];
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, delays[attempt - 1]));
      }
      data = await callEndpoint(geminiEndpoint, "gemini-2.5-flash", geminiKey, messages);
      if (!isOverloadError(data)) break;
      console.warn(`[generate] Gemini overloaded (attempt ${attempt + 1}), retrying...`);
    }
  }

  if (Array.isArray(data) && data[0]?.error) {
    throw new Error(data[0].error.message || "API Error");
  }
  if (data?.error) {
    let msg = data.error.message || "API Error";
    if (msg.includes("Invalid API Key")) {
      msg = "API Key Groq không hợp lệ. Vui lòng kiểm tra lại file .env";
    }
    if (isOverloadError(data)) {
      msg = "AI đang quá tải, vui lòng thử lại sau vài giây.";
    }
    throw new Error(msg);
  }
  if (!data?.choices?.[0]) {
    console.error("Unexpected API Response:", JSON.stringify(data));
    throw new Error("Dữ liệu phản hồi từ AI không hợp lệ.");
  }
  return data.choices[0].message.content;
}


export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, type = "both", sessionId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    let script = "";
    let images: string[] = [];
    let duration = Math.floor(Math.random() * 30) + 15; // 15-45 seconds
    
    // Generate Script if type is 'script' or 'both'
    if (type === 'script' || type === 'both') {
      if (apiKey) {
        try {
          const generationPrompt = `
Dựa vào lịch sử cuộc trò chuyện ý tưởng dưới đây, hãy tạo ra một kịch bản phân cảnh chi tiết (storyboard script) cho một video ngắn.
Yêu cầu kịch bản:
- Gồm 3-5 cảnh (SCENE).
- Mỗi cảnh cần ghi rõ: Bối cảnh, Góc máy/Hiệu ứng, Hành động, và Voice-over (nếu có).
- Kịch bản phải chuyên nghiệp, sáng tạo, hấp dẫn.
- Trình bày rõ ràng dễ đọc.

Lịch sử trò chuyện:
${prompt}
          `;
          
          script = await generateWithOpenAI(apiKey, generationPrompt);
        } catch (e: any) {
          console.error("Failed to generate script:", e);
          script = `[SCENE 1: Mở đầu]\nBối cảnh: Không gian mở... (Lỗi tạo kịch bản tự động)`;
        }
      } else {
        // Fallback if no API key
        script = `
[SCENE 1: Mở đầu]
Bối cảnh: Không gian mở, tràn ngập ánh sáng tự nhiên.
Góc máy: Cận cảnh (Close-up) chuyển dần sang Toàn cảnh (Wide shot).
Hành động: ${prompt.substring(0, 100)}...
Voice-over: "Mọi ý tưởng tuyệt vời đều bắt đầu từ một khoảnh khắc..."

[SCENE 2: Phát triển]
Bối cảnh: Nhịp điệu dồn dập, các chi tiết được làm nổi bật.
Hiệu ứng: Slow-motion (Quay chậm) kết hợp ánh sáng điện ảnh (Cinematic lighting).
Voice-over: "Với sức mạnh của công nghệ AI, giới hạn duy nhất chính là trí tưởng tượng của bạn."
        `.trim();
      }

      if (session?.user?.id) {
        // Get user's first tenant
        const member = await db.query.tenantMembers.findFirst({
          where: eq(tenantMembers.userId, session.user.id)
        });

        if (member) {
          // Save to DB so dashboard stats update
          await db.insert(videos).values({
            title: `Kịch bản: ${prompt.substring(0, 20)}...`,
            prompt: prompt,
            duration: duration,
            status: "completed",
            tenantId: member.tenantId,
            createdBy: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    if (type === 'image' || type === 'both') {
      let prompt1 = `${prompt.substring(0, 200)}, cinematic, masterpiece, highly detailed, photorealistic`;
      let prompt2 = `${prompt.substring(0, 200)}, hyperrealistic, 8k resolution, dramatic lighting`;

      if (apiKey) {
        try {
          const imagePromptGen = `
Đọc kịch bản/ý tưởng sau và TÓM TẮT THẬT NGẮN GỌN (dưới 20 từ) nhân vật và hành động chính bằng TIẾNG ANH. 
Sau đó tạo 2 prompt cho Midjourney dựa trên tóm tắt đó.
Yêu cầu:
- Prompt 1: [Tóm tắt tiếng Anh], cinematic, masterpiece, highly detailed, photorealistic
- Prompt 2: [Tóm tắt tiếng Anh], hyperrealistic, 8k resolution, dramatic lighting, photography
TUYỆT ĐỐI CHỈ IN RA đúng 2 prompt, cách nhau bởi dấu "|". Không giải thích, không thêm dấu nháy.
Ví dụ: A black cat playing with a dog, cinematic, masterpiece | A black cat playing with a dog, hyperrealistic, photography

Ý tưởng:
${prompt.substring(0, 2000)}
          `;
          
          const responseText = await generateWithOpenAI(apiKey, imagePromptGen);
          const parts = responseText.split('|').map((p: string) => p.trim());
          if (parts.length >= 2) {
            prompt1 = parts[0];
            prompt2 = parts[1];
          }
        } catch (e) {
          console.error("Error generating English image prompts:", e);
        }
      }

      // Sanitize to remove newlines or weird characters
      const sanitize = (text: string) => text.replace(/\n/g, ' ').replace(/[^\w\s\.,-]/g, '').trim();
      
      const cleanPrompt1 = sanitize(prompt1);
      const cleanPrompt2 = sanitize(prompt2);
      
      const falKey = process.env.FAL_KEY;
      if (falKey) {
        try {
          const generateFalImage = async (p: string) => {
            const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
              method: "POST",
              headers: {
                "Authorization": `Key ${falKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                prompt: p,
                image_size: "landscape_4_3",
                num_inference_steps: 4,
                num_images: 1,
                enable_safety_checker: true
              })
            });
            const data = await res.json();
            return data.images[0].url;
          };
          
          const results = await Promise.allSettled([
            generateFalImage(cleanPrompt1),
            generateFalImage(cleanPrompt2)
          ]);
          
          images = results.map((result, i) => {
            if (result.status === 'fulfilled') return result.value;
            // Fallback for individual failures
            return `https://image.pollinations.ai/prompt/${encodeURIComponent(i === 0 ? cleanPrompt1 : cleanPrompt2)}?width=800&height=450&nologo=true&seed=${Date.now()}`;
          });
        } catch (e) {
          console.error("Failed to generate with Fal.ai:", e);
          // Full Fallback
          const timestamp = Date.now();
          images = [
            `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt1)}?width=800&height=450&nologo=true&seed=${timestamp}1`,
            `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt2)}?width=800&height=450&nologo=true&seed=${timestamp}2`
          ];
        }
      } else {
        const timestamp = Date.now();
        images = [
          `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt1)}?width=800&height=450&nologo=true&seed=${Math.floor(Math.random() * 1000)}&t=${timestamp}1`,
          `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt2)}?width=800&height=450&nologo=true&seed=${Math.floor(Math.random() * 1000)}&t=${timestamp}2`
        ];
      }
    }

    if (sessionId) {
      let aiText = type === 'script' ? "Tôi đã tạo xong kịch bản cho bạn:" : "Dưới đây là hình ảnh thực tế dựa trên ý tưởng của bạn:";
      
      const insertData: any = {
        sessionId,
        role: 'ai',
        content: aiText,
      };

      if (script) {
        insertData.script = script;
      }

      if (images && images.length > 0) {
        insertData.images = images;
      }

      await db.insert(chatMessages).values(insertData);
    }

    return NextResponse.json({
      success: true,
      script,
      images,
      videoDetails: { duration }
    });

  } catch (error) {
    console.error('Error generating AI video spec:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate AI video spec' }, { status: 500 });
  }
}
