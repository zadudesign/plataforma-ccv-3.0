'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Usuario } from '@/types';

interface WelcomeBannerProps {
  usuarioActual: Usuario;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ usuarioActual }) => {
  return (
    <div className="ccv-card p-6 bg-gradient-to-r from-sage-800 via-sage-700 to-charcoal-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-none shadow-lg relative overflow-hidden mb-6">
      <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="z-10 space-y-1">
        <div className="flex items-center gap-2 text-sage-200 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Centro de Educación Virtual CCV 3.0</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          ¡Hola, {usuarioActual.nombre_completo}!
        </h2>
        <p className="text-xs text-sage-100/80 max-w-2xl leading-relaxed">
          Resumen en tiempo real del desarrollo académico, producción de contenidos virtuales y tareas colaborativas del equipo.
        </p>
      </div>
    </div>
  );
};
