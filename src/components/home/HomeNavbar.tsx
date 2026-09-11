'use client';

import React, { useState } from 'react';
import { LogIn, Menu, X, Sparkles, Activity, Layers, BookmarkCheck } from 'lucide-react';

interface HomeNavbarProps {
  onOpenLogin: () => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = ({ onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[84px] sm:min-h-[92px] py-2 flex items-center justify-between">
        
        {/* Left: Brand / Isotipo + Logotipo Oficial de la Plataforma CCV & PrismaLab */}
        <div 
          onClick={() => scrollToSection('inicio')} 
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          {/* Isotipo oficial CCV */}
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white border border-slate-200/90 p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:border-sky-300 transition-all duration-200">
            <img 
              src="/isotipo.svg" 
              alt="Isotipo Plataforma CCV" 
              className="w-full h-full object-contain drop-shadow-xs" 
            />
          </div>
          
          {/* Logotipo institucional CCV */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Logo Plataforma CCV" 
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-2xs group-hover:opacity-95 transition-opacity" 
            />

            {/* Separador y Badge PrismaLab v3.0 */}
            <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3 py-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-slate-900 leading-none">
                  Prisma<span className="text-sky-600">Lab</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-extrabold text-[9px] border border-sky-200 tracking-wider">
                  v3.0
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Centro de Educación Virtual
              </span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 px-4 py-1.5 rounded-full border border-slate-200 shadow-2xs">
          <button
            onClick={() => scrollToSection('inicio')}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-full hover:bg-white transition-all"
          >
            Inicio
          </button>
          <button
            onClick={() => scrollToSection('estadisticas')}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-full hover:bg-white transition-all"
          >
            Estadísticas
          </button>
          <button
            onClick={() => scrollToSection('areas')}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-full hover:bg-white transition-all"
          >
            Áreas
          </button>
          <button
            onClick={() => scrollToSection('pilares')}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-full hover:bg-white transition-all"
          >
            Pilares
          </button>
        </nav>

        {/* Right: Actions (CTA Ingresar a la Plataforma) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            id="btn-navbar-ingresar"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200 scale-100 hover:scale-102 active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Ingresar a la Plataforma</span>
            <span className="sm:hidden">Ingresar</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Menú"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 animate-fadeIn shadow-lg">
          <button
            onClick={() => scrollToSection('inicio')}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-sky-600" /> Inicio & Quiénes Somos
          </button>
          <button
            onClick={() => scrollToSection('estadisticas')}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5"
          >
            <Activity className="w-4 h-4 text-sky-600" /> Estadísticas en Tiempo Real
          </button>
          <button
            onClick={() => scrollToSection('areas')}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5"
          >
            <Layers className="w-4 h-4 text-sky-600" /> Áreas Operativas
          </button>
          <button
            onClick={() => scrollToSection('pilares')}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5"
          >
            <BookmarkCheck className="w-4 h-4 text-sky-600" /> Pilares Fundamentales
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-3 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Ingresar a la Plataforma</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
