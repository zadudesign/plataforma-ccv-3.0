'use client';

import React from 'react';
import { GraduationCap, Building2 } from 'lucide-react';
import { InfoRemision } from '@/lib/remisionUtils';

interface CmuRemisionBadgeProps {
  remision: InfoRemision;
  size?: 'xs' | 'sm' | 'md';
  showSubtext?: boolean;
  className?: string;
  onClick?: () => void;
}

export const CmuRemisionBadge: React.FC<CmuRemisionBadgeProps> = ({
  remision,
  size = 'sm',
  showSubtext = false,
  className = '',
  onClick,
}) => {
  const esFacultad = remision.tipo === 'Facultad';
  const Icono = esFacultad ? GraduationCap : Building2;

  // Clases según tamaño
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-2',
  }[size];

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size];

  // Estilos temáticos según tipo
  const badgeTheme = esFacultad
    ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100/90 hover:border-emerald-300'
    : 'bg-sky-50/90 text-sky-800 border-sky-200/90 hover:bg-sky-100/90 hover:border-sky-300';

  const typePillTheme = esFacultad
    ? 'bg-emerald-200/60 text-emerald-900'
    : 'bg-sky-200/60 text-sky-900';

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div
        onClick={onClick}
        className={`inline-flex items-center rounded-xl font-bold border transition-all shadow-2xs ${sizeClasses} ${badgeTheme} ${
          onClick ? 'cursor-pointer active:scale-95' : ''
        }`}
        title={`Tarea remitida a ${remision.tipo}: ${remision.nombre}`}
      >
        <span className="shrink-0">
          <Icono className={`${iconSizeClasses} stroke-[2.2]`} />
        </span>

        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${typePillTheme} shrink-0`}>
          {remision.tipo}
        </span>

        <span className="truncate max-w-[260px] font-extrabold tracking-tight">
          {remision.nombre}
        </span>
      </div>

      {showSubtext && remision.subtexto && (
        <span className="text-[10px] text-charcoal-500 font-medium pl-1 mt-0.5 truncate max-w-[280px]">
          {remision.subtexto}
        </span>
      )}
    </div>
  );
};
