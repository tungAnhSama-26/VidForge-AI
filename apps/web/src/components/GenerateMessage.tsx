"use client";

import { useState, useEffect } from "react";
import { Sparkles, FileText, Image as ImageIcon, Loader2, User, Download, ZoomIn } from "lucide-react";
import { motion } from "framer-motion";

export type Message = {
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

interface GenerateMessageProps {
  msg: Message;
  t: (key: string) => string;
  onDownloadScript: (script: string) => void;
  onPreviewImage: (img: string) => void;
  onDownloadImage: (img: string, index: number) => void;
}

export default function GenerateMessage({
  msg,
  t,
  onDownloadScript,
  onPreviewImage,
  onDownloadImage
}: GenerateMessageProps) {
  return (
    <div className={`flex gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                  {att.mimeType?.startsWith("image/") || (att.type && att.type.startsWith("image")) ? (
                    <img src={`data:${att.mimeType || 'image/jpeg'};base64,${att.data}`} alt="attachment" className="w-32 h-32 object-cover" />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-400" />
                      <span className="text-sm truncate max-w-[150px]" title={att.name}>{att.name || t("attachment")}</span>
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
                <h3 className="font-bold text-lg text-white">{t("detailedScript")}</h3>
              </div>
              <button onClick={() => onDownloadScript(msg.script!)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                <Download className="w-4 h-4" />
                {t("downloadWord")}
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
              <h3 className="font-bold text-lg text-white">{t("illustrations")}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {msg.images.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden relative group border border-white/10 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <DelayedImage src={img} alt={`Scene ${i + 1}`} delay={i * 2000} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" />
                  
                  {/* Overlay with buttons */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 pointer-events-none">
                    <p className="text-white text-sm font-medium">{t("scene")} {i + 1}</p>
                    <div className="flex gap-2 pointer-events-auto">
                      <button onClick={() => onPreviewImage(img)} title={t("zoomIn")} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDownloadImage(img, i)} title={t("downloadImage")} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
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
  );
}
