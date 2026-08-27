'use client';

import React from 'react';
import { 
  Sparkles, 
  LogIn, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  FileSignature, 
  Clock, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

interface HomeHeroProps {
  onOpenLogin: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onOpenLogin }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      {/* Background aesthetic decorative gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-accent-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-xs">
            <Sparkles className="w-4 h-4 text-accent-500 animate-pulse" />
            <span className="text-xs font-bold text-charcoal-800">
              Ecosistema Integral de Educación Virtual
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal-900 tracking-tight leading-[1.15]">
            Gestión, Producción y Supervisión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600">Cursos Virtuales</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-charcoal-600 font-medium max-w-2xl mx-auto leading-relaxed">
            La plataforma centralizada para Decanaturas, Coordinaciones, Diseñadores Instruccionales, Docentes y Producción Multimedia del Centro de Educación Virtual (CCV).
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group scale-100 hover:scale-105 active:scale-95"
            >
              <LogIn className="w-4 h-4 text-accent-400 group-hover:translate-x-0.5 transition-transform" />
              <span>Acceder al Sistema</span>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#modulos"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-cream-50 text-charcoal-800 font-bold text-sm border border-stone-300/80 shadow-xs hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Conocer Módulos</span>
              <Layers className="w-4 h-4 text-charcoal-500" />
            </a>
          </div>
        </div>

        {/* Key Metrics / Highlights Bar */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="ccv-card p-5 text-center bg-white/95 backdrop-blur-sm border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto mb-2.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-charcoal-900">6 Niveles</div>
            <div className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mt-0.5">
              Seguridad RBAC
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">Control jerárquico</p>
          </div>

          <div className="ccv-card p-5 text-center bg-white/95 backdrop-blur-sm border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center mx-auto mb-2.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-charcoal-900">100% Digital</div>
            <div className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mt-0.5">
              Cursos & Proyectos
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">Gestión académica</p>
          </div>

          <div className="ccv-card p-5 text-center bg-white/95 backdrop-blur-sm border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
              <FileSignature className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-charcoal-900">Firma Digital</div>
            <div className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mt-0.5">
              Trazabilidad
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">Validación de entregables</p>
          </div>

          <div className="ccv-card p-5 text-center bg-white/95 backdrop-blur-sm border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-charcoal-900">Productividad</div>
            <div className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mt-0.5">
              Control de Horas
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">Liquidación & Tarifas</p>
          </div>
        </div>

      </div>
    </section>
  );
};
