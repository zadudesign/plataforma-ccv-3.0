'use client';

import React, { useState } from 'react';
import { X, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TareaCCV, Usuario } from '@/types';

interface LogHoursModalProps {
  tareas: TareaCCV[];
  usuarioActual: Usuario | null;
  onClose: () => void;
  onUpdateTaskHours: (tareaId: string, horasAñadir: number) => void;
}

export const LogHoursModal: React.FC<LogHoursModalProps> = ({
  tareas,
  usuarioActual,
  onClose,
  onUpdateTaskHours,
}) => {
  const [tareaId, setTareaId] = useState<string>(tareas[0]?.id || '');
  const [horas, setHoras] = useState<string>('2.5');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tareaSeleccionada = tareas.find(t => t.id === tareaId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numHoras = parseFloat(horas);
    if (isNaN(numHoras) || numHoras <= 0) {
      setErrorMsg('Por favor ingresa una cantidad válida de horas (mayor a 0).');
      return;
    }
    if (!tareaId) {
      setErrorMsg('Debes seleccionar una tarea para registrar horas.');
      return;
    }

    onUpdateTaskHours(tareaId, numHoras);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 flex items-center justify-center shadow-sm border border-sage-200">
            <Clock className="w-5 h-5 text-sage-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900">Imputar Tiempo a Tarea</h3>
            <p className="text-xs text-charcoal-500">Actualiza el tiempo invertido directamente en la tabla de Tareas</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-coral-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleccionar Tarea */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Seleccionar Tarea CCV *
            </label>
            <select
              value={tareaId}
              onChange={e => setTareaId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              required
            >
              {tareas.map(t => (
                <option key={t.id} value={t.id}>
                  {t.titulo} ({t.curso_nombre || t.proyecto_nombre || 'General'}) — Rol: {t.rol_destino || 'Sin Rol'}
                </option>
              ))}
            </select>
          </div>

          {/* Información Actual de la Tarea */}
          {tareaSeleccionada && (
            <div className="p-3 bg-sage-50/60 rounded-2xl border border-sage-200/80 text-xs space-y-1 text-charcoal-700">
              <div className="flex justify-between font-bold">
                <span>Rol Destino: <strong className="text-sage-800">{tareaSeleccionada.rol_destino || 'General'}</strong></span>
                <span>Estado: <strong className="text-sage-800">{tareaSeleccionada.estado}</strong></span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-sage-200/50">
                <span>Tiempo Invertido Actual: <strong>{tareaSeleccionada.tiempo_invertido || 0} hrs</strong></span>
                <span>Tiempo Estimado: <strong>{tareaSeleccionada.tiempo_estimado || 0} hrs</strong></span>
              </div>
            </div>
          )}

          {/* Horas a Incrementar */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Horas a Añadir al Tiempo Invertido *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={horas}
                onChange={e => setHoras(e.target.value)}
                placeholder="2.5"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-charcoal-400 font-bold">hrs</span>
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1">
              Estas horas se sumarán al acumulado de <strong className="text-charcoal-700">tiempo_invertido</strong> de la tarea.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-cream-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-sage-600 text-white text-xs font-extrabold hover:bg-sage-700 transition-all shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Actualizar Tiempo Invertido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
