'use client';

import React from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { TareaCCV } from '@/types';

interface ConfirmDeleteTaskModalProps {
  isOpen: boolean;
  tarea: TareaCCV | null;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  isDeleting?: boolean;
}

export const ConfirmDeleteTaskModal: React.FC<ConfirmDeleteTaskModalProps> = ({
  isOpen,
  tarea,
  onConfirm,
  onClose,
  isDeleting = false
}) => {
  if (!isOpen || !tarea) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-2xs">
            <Trash2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              Solo Administrador
            </span>
            <h3 className="text-lg font-black text-charcoal-900 mt-1 leading-snug">
              ¿Eliminar esta tarea permanentemente?
            </h3>
          </div>
        </div>

        {/* Info Box: Tarea */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-charcoal-500 uppercase">
            <span>Tarea Identificada</span>
            {tarea.curso_nombre ? (
              <span className="text-purple-700 font-bold truncate max-w-[180px]">
                {tarea.curso_nombre}
              </span>
            ) : tarea.proyecto_nombre ? (
              <span className="text-amber-700 font-bold truncate max-w-[180px]">
                {tarea.proyecto_nombre}
              </span>
            ) : null}
          </div>
          <p className="font-extrabold text-charcoal-900 text-sm leading-snug">
            {tarea.titulo}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-charcoal-600 flex-wrap pt-1">
            {tarea.responsable_nombre && (
              <span>Responsable: <strong>{tarea.responsable_nombre}</strong></span>
            )}
            {tarea.estado && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-bold text-[10px]">
                Estado: {tarea.estado}
              </span>
            )}
            {tarea.numero_unidad && (
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px]">
                Unidad {tarea.numero_unidad}
              </span>
            )}
          </div>
        </div>

        {/* Warning Alert */}
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold leading-tight">
              Esta acción es irreversible:
            </p>
            <p className="text-[11px] leading-relaxed text-rose-800">
              Se eliminará por completo la tarea de la base de datos, incluyendo su historial de comentarios y registros de avance.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-charcoal-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar Tarea'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
