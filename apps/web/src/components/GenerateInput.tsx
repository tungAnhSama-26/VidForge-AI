"use client";

import { Send, FileText, ImageIcon, Paperclip, Mic, Trash2 } from "lucide-react";

interface Attachment {
  type: string;
  data: string;
  mimeType: string;
  name: string;
}

interface GenerateInputProps {
  t: (key: string) => string;
  inputValue: string;
  setInputValue: (val: string) => void;
  handleSendMessage: () => void;
  isGeneratingScript: boolean;
  isGeneratingImages: boolean;
  isTyping: boolean;
  attachments: Attachment[];
  removeAttachment: (index: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  hasUserMessages: boolean;
  handleGenerateScript: () => void;
  handleGenerateImages: () => void;
}

export default function GenerateInput({
  t,
  inputValue,
  setInputValue,
  handleSendMessage,
  isGeneratingScript,
  isGeneratingImages,
  isTyping,
  attachments,
  removeAttachment,
  handleFileUpload,
  fileInputRef,
  isRecording,
  startRecording,
  stopRecording,
  hasUserMessages,
  handleGenerateScript,
  handleGenerateImages
}: GenerateInputProps) {
  return (
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
            placeholder={t("placeholder")}
            rows={1}
            style={{
              height: "auto",
            }}
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
                title={t("attachFile")}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? t("stopRecord") : t("startRecord")}
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
                    {t("writeScript")}
                  </button>
                  <button 
                    onClick={handleGenerateImages}
                    disabled={isGeneratingScript || isGeneratingImages || isTyping}
                    className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    {t("generateImages")}
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
            {t("disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}
