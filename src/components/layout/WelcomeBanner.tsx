'use client';

import React from 'react';
import { Sparkles, Shield, Building2 } from 'lucide-react';
import { Usuario } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface WelcomeBannerProps {
  usuarioActual?: Usuario | null;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ usuarioActual: propsUsuario }) => {
  const { usuarioActual: contextUsuario, roles, areas } = useAuth();
  const usuarioActual = propsUsuario || contextUsuario;

  const rolObj = roles.find(r => r.id === usuarioActual?.rol_id);
  const areaObj = areas.find(a => a.id === usuarioActual?.area_id || a.id === rolObj?.area_id);

  const rolNombre = usuarioActual?.rol_nombre || rolObj?.nombre || 'Docente';
  const areaNombre = usuarioActual?.area_nombre || rolObj?.area_nombre || areaObj?.nombre || 'Área General';

  return (
    <div className="ccv-card p-6 md:p-7 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700/50 shadow-lg relative overflow-hidden mb-6">
      <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Left Text */}
      <div className="z-10 space-y-2 flex-1">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Work Management Platform</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          ¡Hola, {usuarioActual?.nombre_completo || 'Usuario'}!
        </h2>

        {/* Rol y Área Asignada */}
        <div className="flex flex-wrap items-center gap-2.5 pt-0.5 pb-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs font-medium shadow-xs backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Rol: <strong className="text-white font-bold">{rolNombre}</strong></span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-medium shadow-xs backdrop-blur-sm">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Área: <strong className="text-white font-bold">{areaNombre}</strong></span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Resumen en tiempo real del desarrollo académico, producción de contenidos virtuales y tareas colaborativas del equipo.
        </p>
      </div>

      {/* Right: Institutional Logo (White Version for Dark Background) */}
      <div className="hidden sm:flex items-center justify-center shrink-0 pr-2 z-10">
        <img 
          src="/logo-white.svg" 
          alt="PrismaLab" 
          className="h-16 md:h-20 w-auto max-w-[240px] md:max-w-[300px] object-contain opacity-95 drop-shadow-md transition-transform hover:scale-105 duration-200" 
        />
      </div>
    </div>
  );
};

