'use client';

import React, { useState } from 'react';
import { LogIn, Menu, X, Sparkles, Activity, Layers, BookmarkCheck, ArrowRight } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand / Logotipo PrismaLab */}
        <div 
          onClick={() => scrollToSection('inicio')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Logo icon representation / SVG */}
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <span className="font-black text-xl tracking-tighter text-sky-400">P</span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Prisma<span className="text-sky-600">Lab</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-extrabold text-[10px] border border-sky-200 tracking-wider">
                v3.0
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1 hidden sm:block">
              Ecosistema CCV
            </span>
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
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2 animate-fadeIn shadow-lg">
          <button
            onClick={() => scrollToSection('inicio')}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-sky-600" /> Inicio
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
