'use client';

import React, { useState } from 'react';
import { ShieldCheck, LogIn, Menu, X, Layers, Kanban, Clock, Shield } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[96px] sm:min-h-[104px] py-3 flex items-center justify-between">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <img 
            src="/logo.svg" 
            alt="Plataforma CCV" 
            className="h-16 sm:h-20 w-auto object-contain cursor-pointer hover:scale-102 transition-transform duration-200 drop-shadow-2xs" 
          />
          <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-extrabold text-[11px] border border-sky-200 shadow-2xs">
            v3.0
          </span>
        </div>

        {/* Center: Navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 px-3.5 py-2 rounded-full border border-slate-200 shadow-2xs">
          <button
            onClick={() => scrollToSection('modulos')}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-full hover:bg-white transition-all"
          >
            Módulos
          </button>
          <button
            onClick={() => scrollToSection('flujo')}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-full hover:bg-white transition-all"
          >
            Flujo Operativo
          </button>
          <button
            onClick={() => scrollToSection('productividad')}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-full hover:bg-white transition-all"
          >
            Productividad & Tarifas
          </button>
          <button
            onClick={() => scrollToSection('seguridad')}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 rounded-full hover:bg-white transition-all"
          >
            Seguridad RBAC
          </button>
        </nav>

        {/* Right: Actions (Acceder) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            id="btn-home-acceder"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 scale-100 hover:scale-105 active:scale-95"
          >
            <LogIn className="w-4 h-4 text-sky-400" />
            <span>Acceder</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-4 space-y-2 animate-fadeIn shadow-lg">
          <button
            onClick={() => scrollToSection('modulos')}
            className="w-full text-left px-4 py-2 text-xs font-bold text-charcoal-700 hover:bg-cream-50 rounded-xl flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-primary-600" /> Módulos y Entidades
          </button>
          <button
            onClick={() => scrollToSection('flujo')}
            className="w-full text-left px-4 py-2 text-xs font-bold text-charcoal-700 hover:bg-cream-50 rounded-xl flex items-center gap-2"
          >
            <Kanban className="w-4 h-4 text-primary-600" /> Flujo Operativo & Kanban
          </button>
          <button
            onClick={() => scrollToSection('productividad')}
            className="w-full text-left px-4 py-2 text-xs font-bold text-charcoal-700 hover:bg-cream-50 rounded-xl flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-primary-600" /> Productividad & Tarifas
          </button>
          <button
            onClick={() => scrollToSection('seguridad')}
            className="w-full text-left px-4 py-2 text-xs font-bold text-charcoal-700 hover:bg-cream-50 rounded-xl flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-primary-600" /> Seguridad RBAC
          </button>
        </div>
      )}
    </header>
  );
};

