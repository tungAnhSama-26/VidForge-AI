"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import GenerateMessage, { Message } from "./GenerateMessage";
import GenerateInput from "./GenerateInput";
import GenerateImageLightbox from "./GenerateImageLightbox";

export default function GenerateInteractive({ sessionId: initialSessionId }: { sessionId?: string }) {
  const t = useTranslations("Generate");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "ai",
      text: t("greeting"),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [isInitialLoading, setIsInitialLoading] = useState(!!initialSessionId);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<{ type: string; data: string; mimeType: string; name: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isGeneratingScript, isGeneratingImages]);

  useEffect(() => {
    if (initialSessionId) {
      setIsInitialLoading(true);
      fetch(`/api/chat/${initialSessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              text: m.content,
              script: m.script,
              images: m.images,
              attachments: m.attachments,
            })));
          }
        })
        .catch(console.error)
        .finally(() => setIsInitialLoading(false));
    }
  }, [initialSessionId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      // Extract just the base64 part
      const base64Data = base64String.split(',')[1];
      
      const isImage = file.type.startsWith('image/');
      setAttachments(prev => [...prev, {
        type: isImage ? 'image' : 'file',
        data: base64Data,
        mimeType: file.type,
        name: file.name
      }]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          const base64Data = base64String.split(',')[1];
          setAttachments(prev => [...prev, {
            type: 'audio',
            data: base64Data,
            mimeType: 'audio/webm',
            name: `Audio record - ${new Date().toLocaleTimeString()}`
          }]);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setError(t("micError"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const userMessage = inputValue.trim();
    const currentAttachments = [...attachments]; // Capture current attachments
    
    setInputValue("");
    setAttachments([]); // Clear attachments immediately for UI responsiveness
    
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", text: userMessage, attachments: currentAttachments.length > 0 ? currentAttachments : undefined };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);
    setError("");

    setTimeout(scrollToBottom, 100);
    
    try {
      const payload: any = { messages: [...messages, newUserMsg].map(m => ({ role: m.role, content: m.text, attachments: m.attachments })) };
      if (sessionId) {
        payload.sessionId = sessionId;
      }
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch chat response");
      }

      const newAiMsg: Message = { id: Date.now().toString(), role: "ai", text: data.text };
      setMessages(prev => [...prev, newAiMsg]);
      
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        window.history.replaceState({}, '', window.location.pathname + '?action=chat&sessionId=' + data.sessionId);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : (err as any)?.message || t("connectionError");
      let friendlyText = t("connectionErrorMsg");
      
      if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("high demand")) {
        friendlyText = t("aiOverload");
      } else if (errorMessage.includes("API Key Gemini không hợp lệ") || errorMessage.includes("API Key Groq không hợp lệ")) {
        friendlyText = errorMessage;
      } else if (errorMessage.includes("API key not valid") || errorMessage.includes("GEMINI_API_KEY")) {
        friendlyText = t("apiKeyError");
      } else if (errorMessage) {
        friendlyText = `Lỗi: ${errorMessage}`;
      }

      const fallbackMsg: Message = { 
        id: Date.now().toString(), 
        role: "ai", 
        text: friendlyText
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateScript = async () => {
    // Include both user and AI messages to provide full context, especially useful when AI described an image
    const fullContext = messages
      .filter(m => m.text)
      .map(m => `${m.role === "user" ? "Người dùng" : "AI"}: ${m.text}`)
      .join("\n");
    if (!fullContext) return;
    
    setIsGeneratingScript(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullContext, type: "script", sessionId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi tạo kịch bản");
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        text: t("scriptDone"),
        script: data.script
      }]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Có lỗi xảy ra");
      }
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateImages = async () => {
    // Try to find the latest script to use as prompt
    const scripts = messages.filter(m => m.script).map(m => m.script);
    const latestScript = scripts.length > 0 ? scripts[scripts.length - 1] : "";
    
    const fullContext = messages
      .filter(m => m.text)
      .map(m => `${m.role === "user" ? "Người dùng" : "AI"}: ${m.text}`)
      .join("\n");
      
    const promptToUse = latestScript || fullContext;
    if (!promptToUse) return;
    
    setIsGeneratingImages(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse, type: "image", sessionId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi tạo ảnh");
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        text: t("imagesDone"),
        images: data.images
      }]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Có lỗi xảy ra");
      }
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const hasUserMessages = messages.some(m => m.role === "user");

  const downloadScriptAsWord = (scriptText: string) => {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Kịch bản</title></head><body>${scriptText.replace(/\n/g, '<br>')}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kich-ban-vidforge-${Date.now()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `vidforge-scene-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Failed to download image', err);
      // Fallback
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `vidforge-scene-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative bg-transparent">
      
      <div className="flex items-center justify-center p-4">
        {error && <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>}
      </div>

      {/* Chat History Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-48 px-4 md:px-8 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isInitialLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>{t("loadingChat")}</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <GenerateMessage 
                key={msg.id} 
                msg={msg} 
                t={t} 
                onDownloadScript={downloadScriptAsWord}
                onDownloadImage={downloadImage}
                onPreviewImage={setPreviewImage}
              />
            ))}
            
            {/* Loading States */}
            {(isTyping || isGeneratingScript || isGeneratingImages) && (
              <div className="flex gap-4 w-full justify-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="bg-transparent p-4 flex gap-2 items-center text-white/50">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium text-white/70">
                    {isGeneratingScript ? t("writingScript") : 
                   isGeneratingImages ? t("generatingImages") : 
                   t("aiThinking")}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Input Area */}
      <GenerateInput 
        t={t}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        isGeneratingScript={isGeneratingScript}
        isGeneratingImages={isGeneratingImages}
        isTyping={isTyping}
        attachments={attachments}
        removeAttachment={removeAttachment}
        handleFileUpload={handleFileUpload}
        fileInputRef={fileInputRef}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        hasUserMessages={hasUserMessages}
        handleGenerateScript={handleGenerateScript}
        handleGenerateImages={handleGenerateImages}
      />

      {/* Image Lightbox Modal */}
      <GenerateImageLightbox 
        t={t}
        previewImage={previewImage || ""}
        setPreviewImage={setPreviewImage}
      />
    </div>
  );
}
