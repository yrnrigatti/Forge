'use client'

import { Sidebar } from '@/components/layout/Sidebar';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Verificar se está em páginas de autenticação ou página inicial
  const isAuthPage = pathname.startsWith('/auth') || pathname === '/';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Se estiver em página de auth, renderizar apenas o conteúdo
  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {!isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 lg:hidden bg-[#FF6B35] text-white p-2 rounded-lg shadow-lg hover:bg-[#E55A2B] transition-colors"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Overlay - Apenas área clicável invisível à direita do menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed top-0 left-64 right-0 bottom-0 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}