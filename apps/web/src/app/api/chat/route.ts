import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, chatSessions, chatMessages, tenantMembers } from '@vidforge/db';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // For admin, we could potentially fetch all sessions, but let's stick to user's sessions
    const sessions = await db.query.chatSessions.findMany({
      where: eq(chatSessions.userId, userId),
      orderBy: [desc(chatSessions.createdAt)],
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.log("[API/CHAT] No session found, rejecting with 401");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Get user's first tenant
    const members = await db.select().from(tenantMembers).where(eq(tenantMembers.userId, userId)).limit(1);
    if (!members.length) {
      return NextResponse.json({ error: 'No tenant found for user' }, { status: 400 });
    }
    const tenantId = members[0].tenantId;

    const { messages, sessionId: providedSessionId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is not configured. Please set GROQ_API_KEY.' }, { status: 500 });
    }

    const sysInstruction = `Bạn là một trợ lý ảo chuyên tư vấn kịch bản video và hình ảnh chân thực cho VidForge AI. \nNhiệm vụ của bạn là:\n1. Hỏi và làm rõ ý tưởng của người dùng về kịch bản video (chỉ hỏi 1-2 câu ngắn gọn).\n2. Giữ câu trả lời ngắn gọn, thân thiện và mang tính gợi mở. Trả lời bằng tiếng Việt.\n3. Khi đã có đủ thông tin (đối tượng, bối cảnh, thông điệp), gợi ý người dùng nhấn nút "Bắt đầu Sáng tạo Kịch bản & Ảnh" ở dưới để hệ thống tạo kịch bản chi tiết.`;

    const actualMessages = messages.filter((m: any) => m.id !== 'init-1' && !m.content?.includes('Xin chào! Bạn có ý tưởng gì'));
    if (actualMessages.length === 0) {
      return NextResponse.json({ error: 'No user messages' }, { status: 400 });
    }

    let sessionId = providedSessionId;
    if (sessionId) {
      const existingSession = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, sessionId)
      });
      if (!existingSession) sessionId = undefined;
    }

    if (!sessionId) {
      const firstMsgContent = actualMessages[0].content || actualMessages[0].text || "";
      let title = "Đoạn chat mới"; // Mặc định như ChatGPT

      // Chỉ tạo title nếu tin nhắn đủ dài và mang ý nghĩa (không phải chỉ là Xin chào, Hi)
      if (firstMsgContent.length > 5) {
        try {
          const titleApiKey = process.env.GEMINI_API_KEY || apiKey;
          const titleRes = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${titleApiKey}` },
            body: JSON.stringify({
              model: "gemini-2.5-flash",
              messages: [
                { 
                  role: "system", 
                  content: "Bạn là hệ thống tự động đặt tên cho đoạn chat. Dựa vào tin nhắn của người dùng, hãy trích xuất CHỦ ĐỀ CHÍNH và viết thành một cụm danh từ cực kỳ ngắn gọn (từ 2 đến 5 từ). Ví dụ: 'Kịch bản quảng cáo', 'Video Cyberpunk', 'Hình ảnh thiên nhiên'. TUYỆT ĐỐI CHỈ TRẢ VỀ TIÊU ĐỀ, không có dấu ngoặc kép, không giải thích." 
                },
                { role: "user", content: firstMsgContent }
              ]
            })
          });
          const titleData = await titleRes.json();
          const generatedTitle = titleData.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '');
          if (generatedTitle && generatedTitle.split(' ').length <= 8) { // Đảm bảo không bị lỗi in ra câu dài
            title = generatedTitle;
          } else {
             title = firstMsgContent.substring(0, 30) + "...";
          }
        } catch (err) {
          console.error("Failed to generate title, using fallback:", err);
          title = firstMsgContent.substring(0, 30) + "...";
        }
      }

      const newSessions = await db.insert(chatSessions).values({
        tenantId,
        userId,
        title,
      }).returning();
      sessionId = newSessions[0].id;
    }

    const lastUserMessage = actualMessages[actualMessages.length - 1];
    const userMessageContent = lastUserMessage.content || lastUserMessage.text || "";
    
    if (lastUserMessage.role === 'user') {
      const insertData: any = {
        sessionId,
        role: 'user',
        content: userMessageContent,
      };
      
      if (lastUserMessage.attachments && lastUserMessage.attachments.length > 0) {
        insertData.attachments = lastUserMessage.attachments;
      }

      await db.insert(chatMessages).values(insertData);
    }

    let hasImages = false;
    const messagesForOpenAI: any[] = [{ role: "system", content: sysInstruction }];
    for (const msg of actualMessages) {
       const role = msg.role === 'ai' ? 'assistant' : 'user';
       const textMsg = msg.content || msg.text || "";
       
       if (role === 'assistant') {
         if (textMsg.trim()) {
           messagesForOpenAI.push({ role, content: textMsg });
         }
         continue;
       }

       const attachments = msg.attachments || [];
       let content: any[] = [];
       if (textMsg.trim()) content.push({ type: "text", text: textMsg });
       
       if (attachments.length > 0) {
         for (const att of attachments) {
           if (att.data && att.mimeType) {
             if (att.mimeType.startsWith("image/")) {
               hasImages = true;
               content.push({
                 type: "image_url",
                 image_url: { url: `data:${att.mimeType};base64,${att.data}` }
               });
             } else if (att.mimeType.startsWith("audio/") || att.mimeType.startsWith("video/")) {
                try {
                  const buffer = Buffer.from(att.data, 'base64');
                  const blob = new Blob([buffer], { type: att.mimeType });
                  const formData = new FormData();
                  const filename = att.name || (att.mimeType.includes("video") ? "video.mp4" : "audio.webm");
                  formData.append("file", blob, filename);
                  formData.append("model", "whisper-large-v3-turbo");
                 
                 const audioRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                   method: "POST",
                   headers: { "Authorization": `Bearer ${apiKey}` },
                   body: formData as any
                 });
                 const audioData = await audioRes.json();
                 if (audioData.text) {
                   content.push({ type: "text", text: `[Nội dung Audio người dùng nói]: ${audioData.text}` });
                 } else {
                   content.push({ type: "text", text: `[Tệp âm thanh: không có lời]` });
                 }
               } catch (e) {
                 console.error("Audio transcription error:", e);
                 content.push({ type: "text", text: `[Tệp âm thanh: lỗi xử lý]` });
               }
             } else if (att.mimeType.startsWith("text/")) {
                try {
                  const utf8Text = Buffer.from(att.data, 'base64').toString('utf-8');
                  content.push({ type: "text", text: `[Nội dung tệp ${att.name || ''}]:\n${utf8Text}` });
                } catch (e) {
                  content.push({ type: "text", text: `[Tệp đính kèm: ${att.name || att.type}]` });
                }
             } else {
               content.push({ type: "text", text: `[Tệp đính kèm: ${att.name || att.type}]` });
             }
           }
         }
       }
       
       if (content.length > 0) {
         if (content.length === 1 && content[0].type === "text") {
           messagesForOpenAI.push({ role, content: content[0].text });
         } else {
           messagesForOpenAI.push({ role, content });
         }
       }
    }

    let text = "";
    try {
      let currentModel = "llama-3.3-70b-versatile";
      let payloadMessages = messagesForOpenAI;
      let endpoint = "https://api.groq.com/openai/v1/chat/completions";
      let currentApiKey = apiKey;
      
      if (hasImages) {
        currentModel = "gemini-2.5-flash";
        endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        currentApiKey = process.env.GEMINI_API_KEY || apiKey;
      } else {
        // Groq text-only models require content to be a string
        payloadMessages = messagesForOpenAI.map(m => {
          if (Array.isArray(m.content)) {
            return { ...m, content: m.content.map((c: any) => c.text || "").join("\n") };
          }
          return m;
        });
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentApiKey}` },
        body: JSON.stringify({
          model: currentModel,
          messages: payloadMessages,
          max_tokens: 4096,
          temperature: 0.7
        })
      });
      const data = await res.json();
      
      if (Array.isArray(data) && data[0]?.error) {
        let msg = data[0].error.message || JSON.stringify(data[0].error);
        if (msg.includes("Invalid Auth key") || msg.includes("API key not valid")) {
          msg = "API Key Gemini không hợp lệ. Vui lòng lấy key tại aistudio.google.com và thêm vào file .env";
        }
        throw new Error(`Gemini API Error: ${msg}`);
      }
      if (data.error) {
        let msg = data.error.message || JSON.stringify(data.error);
        if (msg.includes("Invalid API Key")) {
           msg = "API Key Groq không hợp lệ. Vui lòng kiểm tra lại file .env";
        }
        throw new Error(`API Error: ${msg}`);
      }
      if (!data.choices || !data.choices[0]) {
        console.error("Unexpected API Response:", JSON.stringify(data));
        throw new Error("Unexpected API response format from AI Provider.");
      }
      
      text = data.choices[0].message.content;
    } catch (apiError: any) {
      console.error('API Error:', apiError);
      return NextResponse.json({ error: apiError.message }, { status: 500 });
    }

    await db.insert(chatMessages).values({
      sessionId,
      role: 'ai',
      content: text,
    });

    return NextResponse.json({ text, sessionId });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: error.message || 'Failed to chat with AI' }, { status: 500 });
  }
}
