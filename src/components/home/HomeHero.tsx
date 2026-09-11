'use client';

import React from 'react';
import { 
  Sparkles, 
  LogIn, 
  ArrowRight, 
  Layers, 
  Wrench, 
  Sliders, 
  CheckCircle2, 
  ChevronDown 
} from 'lucide-react';

interface HomeHeroProps {
  onOpenLogin: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onOpenLogin }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 scroll-mt-28">
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
              Ecosistema de Gestión, Veeduría y Producción
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
            PrismaLab es el entorno digital diseñado para transformar la complejidad de los proyectos académicos, institucionales y multimedia en flujos de trabajo transparentes, predecibles y medibles. A través de una estructura multidimensional, centraliza la asignación de tareas, el seguimiento de tiempos y la supervisión de entregas, garantizando que cada fase avance con orden y puntualidad.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenLogin}
              id="btn-hero-ingresar"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group scale-100 hover:scale-102 active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('estadisticas')}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300/80 shadow-2xs hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Explorar Estadísticas & Áreas</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Bloque Conceptual Destacado: PRISMA & LAB (2 Tarjetas en Grid) */}
        <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta A - PRISMA (Claridad y Multidimensión) */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <Layers className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs">
                Claridad y Multidimensión
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-sky-700 transition-colors">
              PRISMA
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
              Evoca el fenómeno óptico donde un haz de luz unificado se descompone en un espectro estructurado de colores. Representa cómo una solicitud institucional compleja entra a la plataforma y se distribuye de manera ordenada en sus múltiples dimensiones operativas: pedagogía, diseño instruccional, producción audiovisual, control de calidad y finanzas.
            </p>

            {/* Dimension Tags */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              {['Pedagogía', 'Diseño Instruccional', 'Producción Audiovisual', 'Control de Calidad', 'Finanzas'].map((dim, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200/60">
                  {dim}
                </span>
              ))}
            </div>
          </div>

          {/* Tarjeta B - LAB (Taller y Ejecución Técnica) */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <Wrench className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
                Taller y Ejecución Técnica
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">
              LAB
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
              Aporta la identidad de un laboratorio de co-creación y trabajo técnico. Transmite la idea de un espacio estructurado donde los equipos producen entregables con rigor metodológico, miden sus tiempos de trabajo y ejecutan cronogramas con precisión.
            </p>

            {/* Dimension Tags */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              {['Rigor Metodológico', 'Control de Horas', 'Cronogramas Ágiles', 'Co-creación', 'Estandarización'].map((dim, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200/60">
                  {dim}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
