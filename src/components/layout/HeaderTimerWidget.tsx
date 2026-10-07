'use client';

import React, { useState } from 'react';
import { Square, Play, Pause, Clock, ArrowUpRight } from 'lucide-react';
import { useTaskTimer } from '@/context/TimerContext';

interface HeaderTimerWidgetProps {
  onSelectTaskById?: (tareaId: string) => void;
  onAddHours: (tareaId: string, horas: number, esResponsableSecundario?: boolean, notas?: string) => Promise<void> | void;
}

export const HeaderTimerWidget: React.FC<HeaderTimerWidgetProps> = ({
  onSelectTaskById,
  onAddHours,
}) => {
  const { activeTimer, isPaused, formattedTime, togglePauseTimer, stopTimer } = useTaskTimer();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!activeTimer) return null;

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePauseTimer();
  };

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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border text-white shadow-md hover:bg-stone-850 transition-all cursor-pointer group ${
        isPaused ? 'border-amber-700/60' : 'border-red-900/60'
      }`}
      title={`Cronómetro en: "${activeTimer.tareaTitulo}" (${isPaused ? 'En Pausa' : 'Activo'}). Haz clic para ver la tarea.`}
    >
      {/* Indicador de estado (ámbar si está en pausa, rojo pulsante si está grabando) */}
      <div className="relative flex items-center justify-center">
        {isPaused ? (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" title="En pausa" />
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          </>
        )}
      </div>

      {/* Nombre de la tarea recortado */}
      <div className="flex items-center gap-1.5 max-w-[130px] sm:max-w-[170px]">
        <span className="text-[11px] font-bold text-stone-200 truncate group-hover:text-white transition-colors">
          {activeTimer.tareaTitulo}
        </span>
        <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:text-white shrink-0 transition-colors" />
      </div>

      {/* Contador digital en vivo */}
      <div className={`flex items-center gap-1 font-mono font-black text-xs px-2 py-0.5 rounded-md border ${
        isPaused
          ? 'bg-amber-950/60 text-amber-200 border-amber-800/50'
          : 'bg-stone-800/80 text-white border-stone-700/60'
      }`}>
        <Clock className={`w-3 h-3 ${isPaused ? 'text-amber-400' : 'text-red-400'}`} />
        <span>{formattedTime}</span>
      </div>

      {/* Botón rápido de Pausa / Reanudar */}
      <button
        type="button"
        onClick={handleTogglePause}
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer ${
          isPaused
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-amber-600 hover:bg-amber-500 text-white'
        }`}
        title={isPaused ? "Reanudar cronómetro" : "Pausar cronómetro"}
      >
        {isPaused ? (
          <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
        ) : (
          <Pause className="w-2.5 h-2.5 fill-white text-white" />
        )}
      </button>

      {/* Botón rápido de Stop */}
      <button
        type="button"
        onClick={handleStop}
        disabled={isSaving}
        className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
        title="Detener cronómetro y sumar tiempo acumulado a la tarea"
      >
        <Square className="w-2.5 h-2.5 fill-white text-white" />
      </button>
    </div>
  );
};
