"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide the navigation on admin or specific pages if needed.
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-transparent md:bg-gradient-to-b md:from-[#0F1722]/80 md:to-transparent md:backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link href="/">
          <img 
            src="/FotosEvideos/logo/55C232D4-8B60-45C4-82BC-4B25960F8B60%20Copy.JPG" 
            alt="Mais Trilha Logo" 
            className="h-20 w-20 rounded-full aspect-square object-cover object-center shadow-[0_0_15px_rgba(241,123,55,0.4)] border-4 border-[#F17B37]/30 transition-transform hover:scale-105 cursor-pointer" 
          />
        </Link>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-bold transition-colors hover:text-[#F17B37] ${pathname === '/' ? 'text-[#F17B37]' : 'text-gray-300'}`}
          >
            Início
          </Link>
          <Link 
            href="/sobre" 
            className={`text-sm font-bold transition-colors hover:text-[#F17B37] ${pathname === '/sobre' ? 'text-[#F17B37]' : 'text-gray-300'}`}
          >
            Sobre Nós
          </Link>
          <Link 
            href="/contato" 
            className={`text-sm font-bold transition-colors hover:text-[#F17B37] ${pathname === '/contato' ? 'text-[#F17B37]' : 'text-gray-300'}`}
          >
            Fale Conosco
          </Link>
        </div>

        <button
          onClick={() => router.push('/agenda')}
          className="bg-[#F17B37] hover:bg-[#e06925] text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(241,123,55,0.3)]"
        >
          Ver Agenda Completa
        </button>
      </div>
    </nav>
  );
}
