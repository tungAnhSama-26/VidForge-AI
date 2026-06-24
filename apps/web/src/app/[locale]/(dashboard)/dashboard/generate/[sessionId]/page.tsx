import GenerateInteractive from "@/components/GenerateInteractive";

export const metadata = {
  title: 'Chat Session',
  description: 'Chat session with AI',
};

export default async function SessionPage(props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  return (
    <div className="flex-1 h-full p-4 md:p-6 lg:p-8 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }} />
      
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Sáng tạo Nội dung
          </h1>
          <p className="text-white/60 mt-2 text-sm">
            Tương tác với AI để lên ý tưởng kịch bản và tạo hình ảnh chân thực.
          </p>
        </div>

        <GenerateInteractive sessionId={params.sessionId} />
      </div>
    </div>
  );
}
