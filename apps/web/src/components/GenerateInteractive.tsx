"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, FileText, Image as ImageIcon, Send, Loader2, User, Download, X, ZoomIn, Paperclip, Mic, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  script?: string;
  images?: string[];
  attachments?: { type: string; data: string; mimeType: string; name: string }[];
};

const DelayedImage = ({ src, alt, className, delay }: { src: string, alt: string, className: string, delay: number }) => {
  const [actualSrc, setActualSrc] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setActualSrc(src);
    }, delay);
    return () => clearTimeout(timer);
  }, [src, delay]);

  if (!actualSrc) {
    return (
      <div className={`flex items-center justify-center bg-white/5 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  return <img src={actualSrc} alt={alt} className={className} />;
};


export default function GenerateInteractive({ sessionId: initialSessionId }: { sessionId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "ai",
      text: "Xin chào! Bạn có ý tưởng gì cho video hôm nay? Hãy chia sẻ và chúng ta cùng lên kịch bản nhé. Tôi sẽ giúp bạn hoàn thiện ý tưởng trước khi tạo ảnh.",
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
      setError("Không thể truy cập microphone.");
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
      const errorMessage = err instanceof Error ? err.message : (err as any)?.message || "Sự cố kết nối";
      let friendlyText = "Xin lỗi, tôi đang gặp chút sự cố kết nối. Bạn có thể thử lại hoặc nhấn 'Bắt đầu Sáng tạo' ngay nếu bạn muốn.";
      
      if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("high demand")) {
        friendlyText = "Hệ thống AI hiện đang quá tải. Bạn vui lòng đợi vài giây rồi thử chat lại nhé!";
      } else if (errorMessage.includes("API Key Gemini không hợp lệ") || errorMessage.includes("API Key Groq không hợp lệ")) {
        friendlyText = errorMessage;
      } else if (errorMessage.includes("API key not valid") || errorMessage.includes("GEMINI_API_KEY")) {
        friendlyText = `Lỗi API Key: Vui lòng cập nhật lại GEMINI_API_KEY hợp lệ trong cấu hình (.env).`;
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
        text: "Tôi đã tạo xong kịch bản cho bạn:",
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
        text: "Dưới đây là hình ảnh thực tế dựa trên ý tưởng của bạn:",
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
            <p>Đang tải cuộc trò chuyện...</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                
                {msg.role === "ai" && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%]`}>
                  {/* Text and Attachments Bubble */}
                  <div className={`p-4 rounded-3xl text-base leading-relaxed flex flex-col gap-3 ${
                    msg.role === "user" 
                      ? "bg-white/10 text-white rounded-br-sm" 
                      : "bg-transparent text-white"
                  }`}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.attachments.map((att, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden border border-white/20">
                            {att.mimeType.startsWith("image/") ? (
                              <img src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="w-32 h-32 object-cover" />
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-400" />
                                <span className="text-sm truncate max-w-[150px]" title={att.name}>{att.name || "Tệp đính kèm"}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.text && <div>{msg.text}</div>}
                  </div>

                  {/* Script Bubble */}
                  {msg.script && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-2 shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <h3 className="font-bold text-lg text-white">Kịch bản chi tiết</h3>
                        </div>
                        <button onClick={() => downloadScriptAsWord(msg.script!)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                          <Download className="w-4 h-4" />
                          Tải Word
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-gray-300 bg-transparent p-0 m-0 border-none text-base leading-loose">
                        {msg.script}
                      </pre>
                    </motion.div>
                  )}

                  {/* Images Grid */}
                  {msg.images && msg.images.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-2 shadow-xl"
                    >
                      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                        <ImageIcon className="w-5 h-5 text-pink-400" />
                        <h3 className="font-bold text-lg text-white">Hình ảnh minh họa</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {msg.images.map((img, i) => (
                          <div key={i} className="rounded-xl overflow-hidden relative group border border-white/10 aspect-video">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <DelayedImage src={img} alt={`Scene ${i + 1}`} delay={i * 2000} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" />
                            
                            {/* Overlay with buttons */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 pointer-events-none">
                              <p className="text-white text-sm font-medium">Cảnh {i + 1}</p>
                              <div className="flex gap-2 pointer-events-auto">
                                <button onClick={() => setPreviewImage(img)} title="Xem phóng to" className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
                                  <ZoomIn className="w-4 h-4" />
                                </button>
                                <button onClick={() => downloadImage(img, i)} title="Tải ảnh về máy" className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
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
                      {isGeneratingScript ? "Đang viết kịch bản..." : 
                     isGeneratingImages ? "Đang tạo hình ảnh..." : 
                     "AI đang suy nghĩ..."}
                    </span>
                </div>
              </div>
            )}
            {/* Removed empty div since we scroll the container */}
          </>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-20 pb-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Chat Input Container */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 flex flex-col shadow-2xl focus-within:ring-1 focus-within:ring-white/30 transition-all">
            {/* Attachments Preview Area */}
            {attachments.length > 0 && (
              <div className="flex gap-2 p-3 pb-0 overflow-x-auto">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative group shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/20 bg-black/50 flex items-center justify-center">
                    {att.type === 'image' ? (
                      <img src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="w-full h-full object-cover" />
                    ) : att.type === 'audio' ? (
                      <Mic className="w-6 h-6 text-blue-400" />
                    ) : (
                      <FileText className="w-6 h-6 text-gray-400" />
                    )}
                    <button 
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-0.5 right-0.5 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isGeneratingScript || isGeneratingImages || isTyping}
              className="w-full bg-transparent border-none resize-none min-h-[56px] max-h-[200px] py-4 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-0 text-base"
              placeholder="Nhập yêu cầu tại đây..."
              rows={1}
              style={{
                height: "auto",
              }}
              // Quick auto-resize trick
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,audio/*,image/*"
              multiple={false}
            />
            
            <div className="flex justify-between items-center px-2 pb-1">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  title="Đính kèm file hoặc ảnh"
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  title={isRecording ? "Dừng ghi âm" : "Ghi âm"}
                  className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                <div className="w-px h-6 bg-white/10 mx-1"></div>

                {hasUserMessages && (
                  <>
                    <button 
                      onClick={handleGenerateScript}
                      disabled={isGeneratingScript || isGeneratingImages || isTyping}
                      className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      Viết Kịch bản
                    </button>
                    <button 
                      onClick={handleGenerateImages}
                      disabled={isGeneratingScript || isGeneratingImages || isTyping}
                      className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ImageIcon className="w-4 h-4 text-pink-400" />
                      Tạo Hình ảnh
                    </button>
                  </>
                )}
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && attachments.length === 0) || isGeneratingScript || isGeneratingImages || isTyping}
                className="p-3 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:bg-white/20 disabled:text-white/50 transition-colors flex items-center justify-center shadow-lg"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-xs text-white/30">
              VidForge AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={previewImage} 
            alt="Phóng to" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing
          />
        </div>
      )}
    </div>
  );
}
