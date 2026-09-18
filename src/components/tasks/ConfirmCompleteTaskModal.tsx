'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, X, Lock, Unlock, ArrowRight } from 'lucide-react';
import { TareaCCV } from '@/types';

interface ConfirmCompleteTaskModalProps {
  isOpen: boolean;
  tarea: TareaCCV | null;
  tareasDependientes?: TareaCCV[];
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmCompleteTaskModal: React.FC<ConfirmCompleteTaskModalProps> = ({
  isOpen,
  tarea,
  tareasDependientes = [],
  onConfirm,
  onClose,
  isLoading = false
}) => {
  if (!isOpen || !tarea) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              Confirmación de Finalización
            </span>
            <h3 className="text-lg font-black text-charcoal-900 mt-1 leading-snug">
              ¿Completar esta tarea del curso?
            </h3>
          </div>
        </div>

        {/* Info Box: Tarea */}
        <div className="p-4 bg-cream-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-charcoal-500 uppercase text-[10px]">Tarea Seleccionada</span>
            {tarea.curso_nombre && (
              <span className="font-semibold text-sky-700 truncate max-w-[200px]">
                {tarea.curso_nombre}
              </span>
            )}
          </div>
          <p className="font-extrabold text-charcoal-900 text-sm">
            {tarea.titulo}
          </p>
          {tarea.responsable_nombre && (
            <p className="text-charcoal-600 font-medium">
              Responsable: <strong className="text-charcoal-800">{tarea.responsable_nombre}</strong>
            </p>
          )}
        </div>

        {/* Warning / Desbloqueo en Cascada */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold leading-tight">
              Efecto en la secuencia del curso:
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Al marcar esta tarea como completada, el motor evaluará las dependencias y 
              <strong> desbloqueará automáticamente las siguientes tareas</strong> de la ruta de producción.
            </p>
          </div>
        </div>

        {/* Lista de posibles tareas desbloqueadas si se proporcionan */}
        {tareasDependientes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-charcoal-600 flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5 text-sky-600" /> 
              Tareas vinculadas que podrían habilitarse:
            </span>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {tareasDependientes.map(dep => (
                <div key={dep.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between">
                  <span className="font-medium text-slate-800 truncate pr-2">• {dep.titulo}</span>
                  <span className="text-[10px] font-bold text-sky-700 shrink-0 flex items-center gap-0.5">
                    Habilitar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>Guardando...</>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Sí, Confirmar y Completar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
