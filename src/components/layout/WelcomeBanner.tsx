'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Usuario } from '@/types';

interface WelcomeBannerProps {
  usuarioActual?: Usuario | null;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ usuarioActual }) => {
  return (
    <div className="ccv-card p-6 md:p-7 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700/50 shadow-lg relative overflow-hidden mb-6">
      <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Left Text */}
      <div className="z-10 space-y-1.5 flex-1">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Centro de Educación Virtual CCV 3.0</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          ¡Hola, {usuarioActual?.nombre_completo || 'Usuario CCV'}!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Resumen en tiempo real del desarrollo académico, producción de contenidos virtuales y tareas colaborativas del equipo.
        </p>
      </div>

      {/* Right: Institutional Logo (White Version for Dark Background) */}
      <div className="hidden sm:flex items-center justify-center shrink-0 pr-2 z-10">
        <img 
          src="/logo-white.svg" 
          alt="Plataforma CCV" 
          className="h-16 md:h-20 w-auto max-w-[240px] md:max-w-[300px] object-contain opacity-95 drop-shadow-md transition-transform hover:scale-105 duration-200" 
        />
      </div>
    </div>
  );
};
