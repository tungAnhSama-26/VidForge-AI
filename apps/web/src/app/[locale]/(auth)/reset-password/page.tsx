import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center relative font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-green-600/20 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full animate-float" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full animate-fade-in-up">
        {/* Suspense cần thiết vì ResetPasswordForm dùng useSearchParams() */}
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <span className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
