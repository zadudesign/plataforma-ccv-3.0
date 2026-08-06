'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, ShieldCheck } from 'lucide-react';
import { TareaCCV } from '@/types';

interface CalendarViewProps {
  tareas: TareaCCV[];
  onSelectTask: (tarea: TareaCCV) => void;
  onOpenCreateTask: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tareas,
  onSelectTask,
  onOpenCreateTask,
}) => {
  const [mesActual, setMesActual] = useState('Julio 2026');

  // Days of July 2026 calendar matrix (July 2026 starts on Wednesday, column 3 when week starts on Sunday)
  const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);
  const offsetInicial = 3; // Sunday-start offset for Wednesday July 1st

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Calendar Header */}
      <div className="ccv-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-sage-600" />
            Calendario de Entregas & Vencimientos CCV
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Programación temporal de revisiones de calidad, entregas de multimedia y cierres de módulos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-cream-100 px-4 py-2 rounded-full border border-stone-200">
            <button className="text-charcoal-600 hover:text-charcoal-900 p-1"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-extrabold text-charcoal-900 px-2">{mesActual}</span>
            <button className="text-charcoal-600 hover:text-charcoal-900 p-1"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="ccv-card p-6">
        {/* Days of week header (Starting on Sunday) */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-charcoal-500 uppercase tracking-wider pb-3 border-b border-stone-200">
          <div className="text-coral-600">Dom</div>
          <div>Lun</div>
          <div>Mar</div>
          <div>Mié</div>
          <div>Jue</div>
          <div>Vie</div>
          <div>Sáb</div>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 mt-3">
          {/* Empty offset cells */}
          {Array.from({ length: offsetInicial }).map((_, idx) => (
            <div key={`offset-${idx}`} className="h-28 bg-cream-50/40 rounded-2xl border border-stone-100 opacity-40"></div>
          ))}

          {/* Day Cells */}
          {diasMes.map((dia) => {
            const fechaStr = `2026-07-${dia < 10 ? '0' + dia : dia}`;
            const tareasDelDia = tareas.filter(t => t.fecha_vencimiento === fechaStr);
            const esHoy = dia === 21; // Current system date 21 July 2026

            return (
              <div
                key={dia}
                className={`h-28 p-2 rounded-2xl border flex flex-col justify-between transition-all ${
                  esHoy 
                    ? 'bg-sage-50/60 border-sage-500 shadow-sm ring-1 ring-sage-500' 
                    : 'bg-white border-stone-200 hover:border-sage-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    esHoy ? 'bg-sage-600 text-white' : 'text-charcoal-800'
                  }`}>
                    {dia}
                  </span>
                  {tareasDelDia.length > 0 && (
                    <span className="text-[10px] font-bold text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded-full">
                      {tareasDelDia.length}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="space-y-1 overflow-y-auto max-h-16">
                  {tareasDelDia.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`p-1.5 rounded-lg text-[10px] font-bold truncate cursor-pointer transition-transform hover:scale-102 ${
                        t.estado === 'Completada' 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : t.estado === 'En Revisión' 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : t.estado === 'En Proceso'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                      }`}
                      title={`${t.titulo} (${t.estado})`}
                    >
                      {t.titulo}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
