'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { TareaCCV, Usuario, EstadoTarea } from '@/types';
import { useTaskTimer } from '@/context/TimerContext';

interface TaskTimeTrackerProps {
  tarea: TareaCCV;
  usuarioActual: Usuario | null;
  onAddHours: (tareaId: string, horas: number, esResponsableSecundario?: boolean, notas?: string) => Promise<void> | void;
  onUpdateStatus?: (tareaId: string, nuevoEstado: EstadoTarea) => void;
}

export const TaskTimeTracker: React.FC<TaskTimeTrackerProps> = ({
  tarea,
  usuarioActual,
  onAddHours,
  onUpdateStatus,
}) => {
  const { 
    activeTimer, 
    formattedTime, 
    startTimer, 
    stopTimer, 
    isTimerForTask 
  } = useTaskTimer();

  const isCurrentTaskRunning = isTimerForTask(tarea.id);
  const isAnotherTaskRunning = Boolean(activeTimer && !isCurrentTaskRunning);

  // Determinar automáticamente si el usuario actual es el responsable secundario
  const esUsuarioSecundario = Boolean(
    tarea.responsable_secundario_id && 
    usuarioActual && 
    tarea.responsable_secundario_id === usuarioActual.id
  );

  const [imputarParaSecundario, setImputarParaSecundario] = useState<boolean>(esUsuarioSecundario);
  const [mostrarManualForm, setMostrarManualForm] = useState<boolean>(false);
  const [horasInput, setHorasInput] = useState<string>('1');
  const [notasHoras, setNotasHoras] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Manejador para Iniciar el Cronómetro
  const handleStart = () => {
    // Si hay otra tarea corriendo, se detiene y suma primero
    if (isAnotherTaskRunning && activeTimer) {
      stopTimer(onAddHours);
    }

    startTimer(
      tarea, 
      imputarParaSecundario, 
      usuarioActual, 
      onUpdateStatus
    );

    setFeedbackSuccess('¡Cronómetro iniciado! Tarea en proceso.');
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };

  // Manejador para Detener el Cronómetro y Sumar Horas
  const handleStop = async () => {
    setIsSaving(true);
    try {
      const res = await stopTimer(onAddHours);
      if (res) {
        setFeedbackSuccess(`¡Tiempo guardado! +${res.horas} hrs registradas.`);
        setTimeout(() => setFeedbackSuccess(null), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Manejador para añadir horas manuales
  const handleSumarManual = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(horasInput);
    if (isNaN(val) || val <= 0) return;

    setIsSaving(true);
    try {
      await onAddHours(tarea.id, val, imputarParaSecundario, notasHoras.trim() || undefined);
      setFeedbackSuccess(`¡+${val} hrs sumadas con éxito!`);
      setHorasInput('1');
      setNotasHoras('');
      setMostrarManualForm(false);
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePresetManual = async (horasPreset: number) => {
    setIsSaving(true);
    try {
      await onAddHours(tarea.id, horasPreset, imputarParaSecundario, `Suma rápida de ${horasPreset} horas`);
      setFeedbackSuccess(`¡+${horasPreset} hrs sumadas con éxito!`);
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const totalHorasTarea = (tarea.tiempo_invertido || 0) + (tarea.tiempo_invertido_secundario || 0);

  return (
    <div className="rounded-2xl bg-[#171717] border border-stone-800 text-white p-4 shadow-md space-y-3.5 transition-all">
      {/* Cabecera del Panel */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Tiempo registrado
          </span>
          <span className="text-xs text-stone-500 font-medium">
            Total acumulado: <strong className="text-stone-200 font-mono">{totalHorasTarea.toFixed(2)} hrs</strong>
          </span>
        </div>

        {feedbackSuccess && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {feedbackSuccess}
          </span>
        )}
      </div>

      {/* Selector de Asignación de Horas si existen dos responsables */}
      {tarea.responsable_secundario_nombre && (
        <div className="flex items-center gap-2 text-xs bg-stone-900/90 p-2 rounded-xl border border-stone-800">
          <span className="text-stone-400 font-bold text-[10px] uppercase tracking-wide">Imputar a:</span>
          <button
            type="button"
            disabled={isCurrentTaskRunning}
            onClick={() => setImputarParaSecundario(false)}
            className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all ${
              !imputarParaSecundario
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            Principal: {tarea.responsable_nombre?.split(' ')[0] || 'Principal'}
          </button>
          <button
            type="button"
            disabled={isCurrentTaskRunning}
            onClick={() => setImputarParaSecundario(true)}
            className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all ${
              imputarParaSecundario
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            Co-resp: {tarea.responsable_secundario_nombre?.split(' ')[0] || 'Co-resp'}
          </button>
        </div>
      )}

      {/* Fila Principal: Cronómetro en Vivo (Estética exacta a la imagen de referencia) */}
      <div className="space-y-2.5 pt-1">
        {isCurrentTaskRunning ? (
          /* Estado ACTIVO: Botón rojo Stop con contador en vivo */
          <div className="flex items-center justify-between p-2.5 bg-stone-900 rounded-xl border border-red-900/40">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleStop}
                disabled={isSaving}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-all ring-4 ring-red-950/60 cursor-pointer"
                title="Detener cronómetro y sumar tiempo a la tarea"
              >
                <Square className="w-3 h-3 fill-white text-white" />
              </button>

              <div>
                <div className="text-xl font-black font-mono tracking-wider text-white flex items-center gap-2">
                  <span>{formattedTime}</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <span className="text-[10px] text-red-300/80 font-medium block">
                  Grabando tiempo en vivo...
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStop}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold border border-red-800/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isSaving ? 'Guardando...' : 'Parar y Registrar'}</span>
            </button>
          </div>
        ) : (
          /* Estado INACTIVO: Botón Play para iniciar cronómetro */
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
              title="Iniciar cronómetro de trabajo"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
            </button>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={handleStart}
                className="text-xs font-bold text-stone-200 hover:text-white transition-colors text-left cursor-pointer"
              >
                Iniciar cronómetro
              </button>
              <span className="text-[10px] text-stone-500 font-medium">
                Pasa la tarea a &quot;En Proceso&quot; y contabiliza tu tiempo
              </span>
            </div>
          </div>
        )}

        {/* Fila Secundaria: "Añadir hora" manual (según imagen de referencia) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setMostrarManualForm(!mostrarManualForm)}
            className="flex items-center gap-2.5 text-stone-300 hover:text-white transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-stone-800 group-hover:bg-stone-700 flex items-center justify-center text-stone-300 group-hover:text-white transition-all">
              {mostrarManualForm ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </div>
            <span className="text-xs font-semibold">Añadir hora</span>
            {mostrarManualForm ? (
              <ChevronUp className="w-3 h-3 text-stone-500" />
            ) : (
              <ChevronDown className="w-3 h-3 text-stone-500" />
            )}
          </button>
        </div>
      </div>

      {/* Alerta si hay otra tarea con cronómetro activo */}
      {isAnotherTaskRunning && (
        <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span>Tienes un cronómetro activo en: <strong>{activeTimer?.tareaTitulo}</strong>.</span>
            <span className="block text-amber-300/80 mt-0.5">
              Al iniciar aquí, se guardará el tiempo acumulado de la tarea anterior.
            </span>
          </div>
        </div>
      )}

      {/* Formulario Desplegable para Imputación Manual de Horas */}
      {mostrarManualForm && (
        <div className="pt-3 border-t border-stone-800 space-y-3 animate-fadeIn">
          {/* Botones de incremento rápido */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Suma rápida:</span>
            {[0.5, 1, 2, 4].map(h => (
              <button
                key={h}
                type="button"
                disabled={isSaving}
                onClick={() => handlePresetManual(h)}
                className="px-2 py-0.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 font-bold text-[11px] hover:bg-amber-600 hover:text-white hover:border-amber-500 transition-all cursor-pointer"
              >
                +{h}h
              </button>
            ))}
          </div>

          <form onSubmit={handleSumarManual} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-semibold text-stone-400 uppercase mb-1">
                Horas
              </label>
              <input
                type="number"
                step="0.25"
                min="0.1"
                max="24"
                value={horasInput}
                onChange={(e) => setHorasInput(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-700 bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none text-white text-xs font-bold"
                required
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-[10px] font-semibold text-stone-400 uppercase mb-1">
                Detalle / Nota de avance (Opcional)
              </label>
              <input
                type="text"
                value={notasHoras}
                onChange={(e) => setNotasHoras(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-700 bg-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none text-white text-xs"
                placeholder="Ej. Ajustes visuales, render, correcciones..."
              />
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Sumando...' : 'Sumar'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
