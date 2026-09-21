'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface HomeHeroProps {
  onOpenLogin?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = () => {
  return (
    <section id="inicio" className="relative overflow-hidden pt-12 pb-10 md:pt-20 md:pb-16 scroll-mt-28">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-sky-100/60 via-slate-200/40 to-violet-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
            <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-800 tracking-wide">
              Ecosistema Integral de Gestión de Flujos de Trabajo y Operaciones
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Proyectos complejos, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-sky-800 to-sky-600">
              resultados claros
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            El centro de mando digital que estructura la producción multimedia y académica. PrismaLab sincroniza equipos, automatiza el seguimiento de plazos y ofrece visibilidad total en cada entrega institucional.
          </p>
        </div>

      </div>
    </section>
  );
};


