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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-charcoal-900 text-white flex items-center justify-center shadow-md border border-primary-500/30">
            <ShieldCheck className="w-6 h-6 text-accent-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-charcoal-900 tracking-tight">
                Plataforma CCV
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent-50 text-accent-600 font-extrabold text-[10px] border border-accent-200">
                v3.0
              </span>
            </div>
            <p className="text-[11px] text-charcoal-500 font-medium hidden sm:block">
              Centro de Educación Virtual
            </p>
          </div>
        </div>

        {/* Center: Navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-cream-50/80 px-3 py-1.5 rounded-full border border-stone-200/60 shadow-2xs">
          <button
            onClick={() => scrollToSection('modulos')}
            className="px-3.5 py-1.5 text-xs font-bold text-charcoal-700 hover:text-primary-700 rounded-full hover:bg-white transition-all"
          >
            Módulos
          </button>
          <button
            onClick={() => scrollToSection('flujo')}
            className="px-3.5 py-1.5 text-xs font-bold text-charcoal-700 hover:text-primary-700 rounded-full hover:bg-white transition-all"
          >
            Flujo Operativo
          </button>
          <button
            onClick={() => scrollToSection('productividad')}
            className="px-3.5 py-1.5 text-xs font-bold text-charcoal-700 hover:text-primary-700 rounded-full hover:bg-white transition-all"
          >
            Productividad & Tarifas
          </button>
          <button
            onClick={() => scrollToSection('seguridad')}
            className="px-3.5 py-1.5 text-xs font-bold text-charcoal-700 hover:text-primary-700 rounded-full hover:bg-white transition-all"
          >
            Seguridad RBAC
          </button>
        </nav>

        {/* Right: Acceder Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            id="btn-home-acceder"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 scale-100 hover:scale-105 active:scale-95"
          >
            <LogIn className="w-4 h-4 text-accent-400" />
            <span>Acceder</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-charcoal-600 hover:bg-cream-100 transition-colors"
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
