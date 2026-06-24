import { setRequestLocale } from 'next-intl/server';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center relative font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-pink-600/10 blur-[150px] rounded-full animate-float" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full animate-fade-in-up">
        <LoginForm />
      </div>
    </div>
  );
}
