"use client";

import { usePathname, useRouter } from '@/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'vi' : 'en';
    
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale, scroll: false });
    });
  };

  return (
    <button 
      onClick={toggleLocale} 
      disabled={isPending}
      className="relative flex items-center w-16 h-8 rounded-full bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-1 group hover:border-purple-500/50 transition-colors"
    >
      <div className={`absolute top-1 bottom-1 w-[26px] bg-purple-500 rounded-full transition-transform duration-300 z-0 shadow-lg shadow-purple-500/50 ${locale === 'en' ? 'translate-x-0' : 'translate-x-[26px]'}`}></div>
      <div className="relative z-10 flex justify-between w-full text-[10px] font-black px-1.5 select-none">
        <span className={`transition-colors duration-300 ${locale === 'en' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>EN</span>
        <span className={`transition-colors duration-300 ${locale === 'vi' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>VI</span>
      </div>
    </button>
  );
}
