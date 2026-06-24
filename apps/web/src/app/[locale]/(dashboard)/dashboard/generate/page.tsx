import GenerateInteractive from "@/components/GenerateInteractive";

export default function GeneratePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto overflow-hidden">
      {/* Header can be hidden or made small to save vertical space for the chat */}
      <div className="px-8 pt-4 pb-2 shrink-0">
        <h1 className="text-xl font-bold text-white">Sáng tạo Kịch bản & Hình ảnh AI</h1>
      </div>
      
      <div className="flex-1 w-full overflow-hidden relative">
        <GenerateInteractive />
      </div>
    </div>
  );
}
