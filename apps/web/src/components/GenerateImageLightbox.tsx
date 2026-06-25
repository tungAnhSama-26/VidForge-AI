"use client";

import { X } from "lucide-react";

interface GenerateImageLightboxProps {
  t: (key: string) => string;
  previewImage: string;
  setPreviewImage: (val: string | null) => void;
}

export default function GenerateImageLightbox({
  t,
  previewImage,
  setPreviewImage
}: GenerateImageLightboxProps) {
  if (!previewImage) return null;

  return (
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
        alt={t("zoom")} 
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
        onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing
      />
    </div>
  );
}
