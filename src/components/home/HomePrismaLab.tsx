'use client';

import React from 'react';
import { Layers, Wrench, Sparkles } from 'lucide-react';

export const HomePrismaLab: React.FC = () => {
  return (
    <section id="prisma-lab" className="py-16 md:py-20 bg-white relative border-t border-slate-200/80 scroll-mt-24">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-64 bg-gradient-to-r from-sky-50 via-slate-100/50 to-indigo-50 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200 shadow-2xs">
            <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
              Identidad & Modelo Operativo
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            El Concepto PrismaLab
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            La sinergia perfecta entre la descomposición multidimensional del trabajo y el rigor técnico de producción.
          </p>
        </div>

        {/* Bloque Conceptual Destacado: PRISMA & LAB (2 Tarjetas en Grid) */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Tarjeta A - PRISMA (Claridad y Multidimensión) */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="p-3.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs">
                  Claridad y Multidimensión
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-sky-700 transition-colors">
                PRISMA
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Evoca el fenómeno óptico donde un haz de luz unificado se descompone en un espectro estructurado de colores. Representa cómo una solicitud institucional compleja entra a la plataforma y se distribuye de manera ordenada en sus múltiples dimensiones operativas: pedagogía, diseño instruccional, producción audiovisual, control de calidad y finanzas.
              </p>
            </div>

            {/* Dimension Tags */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              {['Pedagogía', 'Diseño Instruccional', 'Producción Audiovisual', 'Control de Calidad', 'Finanzas'].map((dim, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200/60">
                  {dim}
                </span>
              ))}
            </div>
          </div>

          {/* Tarjeta B - LAB (Taller y Ejecución Técnica) */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  <Wrench className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
                  Taller y Ejecución Técnica
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">
                LAB
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Aporta la identidad de un laboratorio de co-creación y trabajo técnico. Transmite la idea de un espacio estructurado donde los equipos producen entregables con rigor metodológico, miden sus tiempos de trabajo y ejecutan cronogramas con precisión.
              </p>
            </div>

            {/* Dimension Tags */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              {['Rigor Metodológico', 'Control de Horas', 'Cronogramas Ágiles', 'Co-creación', 'Estandarización'].map((dim, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200/60">
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
