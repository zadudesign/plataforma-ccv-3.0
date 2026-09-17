'use client';

import React, { useState } from 'react';
import { Square, Clock, ArrowUpRight } from 'lucide-react';
import { useTaskTimer } from '@/context/TimerContext';

interface HeaderTimerWidgetProps {
  onSelectTaskById?: (tareaId: string) => void;
  onAddHours: (tareaId: string, horas: number, esResponsableSecundario?: boolean, notas?: string) => Promise<void> | void;
}

export const HeaderTimerWidget: React.FC<HeaderTimerWidgetProps> = ({
  onSelectTaskById,
  onAddHours,
}) => {
  const { activeTimer, formattedTime, stopTimer } = useTaskTimer();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!activeTimer) return null;

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      await stopTimer(onAddHours);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenTask = () => {
    if (onSelectTaskById && activeTimer.tareaId) {
      onSelectTaskById(activeTimer.tareaId);
    }
  };

  return (
    <div 
      onClick={handleOpenTask}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-stone-900 border border-red-900/60 text-white shadow-md hover:bg-stone-850 transition-all cursor-pointer group"
      title={`Cronómetro activo en: "${activeTimer.tareaTitulo}". Haz clic para ver la tarea o detener.`}
    >
      {/* Indicador rojo pulsante de grabación en vivo */}
      <div className="relative flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute" />
        <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
      </div>

      {/* Nombre de la tarea recortado */}
      <div className="flex items-center gap-1.5 max-w-[160px] sm:max-w-[200px]">
        <span className="text-[11px] font-bold text-stone-200 truncate group-hover:text-white transition-colors">
          {activeTimer.tareaTitulo}
        </span>
        <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:text-white shrink-0 transition-colors" />
      </div>

      {/* Contador digital en vivo */}
      <div className="flex items-center gap-1 font-mono font-black text-xs text-white bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-700/60">
        <Clock className="w-3 h-3 text-red-400" />
        <span>{formattedTime}</span>
      </div>

      {/* Botón de Stop rápido */}
      <button
        type="button"
        onClick={handleStop}
        disabled={isSaving}
        className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
        title="Detener cronómetro y sumar tiempo acumulado"
      >
        <Square className="w-2.5 h-2.5 fill-white text-white" />
      </button>
    </div>
  );
};
