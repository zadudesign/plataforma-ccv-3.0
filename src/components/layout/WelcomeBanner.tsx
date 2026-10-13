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

        <div className="flex items-center gap-3.5 sm:gap-4 pt-1">
          {/* Avatar del usuario con borde y status */}
          <div className="relative shrink-0">
            <img 
              src={usuarioActual?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt={usuarioActual?.nombre_completo || 'Usuario'} 
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-sky-400/40 shadow-md border border-white/10" 
            />
            <span 
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-xs" 
              title="Sesión activa"
            />
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              ¡Hola, {usuarioActual?.nombre_completo || 'Usuario'}!
            </h2>
            <p className="text-xs text-sky-200/80 font-medium">
              Bienvenido a tu panel de gestión
            </p>
          </div>
        </div>

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

