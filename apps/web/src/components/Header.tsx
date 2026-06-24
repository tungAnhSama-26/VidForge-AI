import Image from 'next/image';
import { Link } from '@/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Layers, Info, Phone, Home, LogIn, Zap, Workflow, LayoutDashboard, User, LogOut } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import UserDropdown from './UserDropdown';

export default async function Header({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-black/60 border-b border-white/10 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 hover:scale-105 transition-transform duration-300">
        <Image src="/logo.jpg" alt="VidForge AI Logo" width={80} height={80} className="rounded-2xl object-cover shadow-lg shadow-purple-500/50" />
        <span className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">VidForge<span className="text-purple-400">.AI</span></span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-12 text-sm font-medium text-gray-300">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-2">
          <Home className="w-4 h-4" />
          {t('nav.home')}
        </Link>
        <Link href="/#features" className="hover:text-white transition-colors flex items-center gap-2">
          <Layers className="w-4 h-4" />
          {t('nav.features')}
        </Link>
        <Link href="/#how-it-works" className="hover:text-white transition-colors flex items-center gap-2">
          <Workflow className="w-4 h-4" />
          {t('nav.howItWorks')}
        </Link>
        <Link href="/about" className="hover:text-white transition-colors flex items-center gap-2">
          <Info className="w-4 h-4" />
          {t('nav.about')}
        </Link>
        <Link href="/#contact" className="hover:text-white transition-colors flex items-center gap-2">
          <Phone className="w-4 h-4" />
          {t('nav.contact')}
        </Link>
      </nav>
      
      <div className="flex items-center gap-4">
        <LanguageSwitcher locale={locale} />
        
        {session ? (
          <UserDropdown user={session.user} mode="header" />
        ) : (
          <>
            <Link href="/login" className="text-sm font-semibold hover:text-purple-400 transition-colors flex items-center gap-1.5 group">
              <LogIn className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t('nav.login')}
            </Link>
            <Link href="/register" className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:scale-105 hover:bg-purple-50 transition-all flex items-center gap-1.5 group shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              {t('nav.start')}
              <Zap className="w-4 h-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </Link>
          </>
        )}
        </div>
      </div>
    </header>
  );
}
