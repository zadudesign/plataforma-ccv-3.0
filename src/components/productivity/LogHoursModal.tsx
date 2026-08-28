'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, CheckCircle2, User, Users, UserCheck } from 'lucide-react';
import { TareaCCV, Usuario } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface LogHoursModalProps {
  tareas: TareaCCV[];
  usuarioActual: Usuario | null;
  initialTaskId?: string;
  initialIsSecondary?: boolean;
  onClose: () => void;
  onUpdateTaskHours: (tareaId: string, horasAñadir: number, esResponsableSecundario?: boolean, notas?: string) => void;
}

export const LogHoursModal: React.FC<LogHoursModalProps> = ({
  tareas,
  usuarioActual,
  initialTaskId,
  initialIsSecondary = false,
  onClose,
  onUpdateTaskHours,
}) => {
  const { roles, usuarios } = useAuth();
  const tareasProyecto = React.useMemo(() => tareas.filter(t => t.tipo_tarea === 'Proyecto'), [tareas]);
  const [tareaId, setTareaId] = useState<string>(initialTaskId || tareasProyecto[0]?.id || '');
  const [esSecundario, setEsSecundario] = useState<boolean>(initialIsSecondary);
  const [horas, setHoras] = useState<string>('2.5');
  const [notas, setNotas] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getNombreRol = (rolDestinoOrId?: string): string => {
    if (!rolDestinoOrId) return 'General';
    const rFound = roles.find(r => r.id === rolDestinoOrId || r.nombre.toLowerCase() === rolDestinoOrId.toLowerCase());
    if (rFound) return rFound.nombre;
    const uFound = usuarios.find(u => u.rol_id === rolDestinoOrId || u.rol_nombre?.toLowerCase() === rolDestinoOrId.toLowerCase());
    if (uFound?.rol_nombre) return uFound.rol_nombre;
    if (rolDestinoOrId.length > 20 && rolDestinoOrId.includes('-')) {
      return 'Especialidad / CCV';
    }
    return rolDestinoOrId;
  };

  const tareaSeleccionada = tareasProyecto.find(t => t.id === tareaId) || tareas.find(t => t.id === tareaId);

  // Auto-ajustar si el usuario actual coincide con el co-responsable
  useEffect(() => {
    if (tareaSeleccionada) {
      if (initialIsSecondary) {
        setEsSecundario(true);
      } else if (usuarioActual && tareaSeleccionada.responsable_secundario_id === usuarioActual.id) {
        setEsSecundario(true);
      } else if (usuarioActual && tareaSeleccionada.responsable_id === usuarioActual.id) {
        setEsSecundario(false);
      } else if (!tareaSeleccionada.responsable_secundario_nombre && !tareaSeleccionada.responsable_secundario_id) {
        setEsSecundario(false);
      }
    }
  }, [tareaId, tareaSeleccionada, usuarioActual, initialIsSecondary]);

  const tieneDosResponsables = Boolean(
    tareaSeleccionada && (tareaSeleccionada.responsable_secundario_nombre || tareaSeleccionada.responsable_secundario_id)
  );

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

    onUpdateTaskHours(tareaId, numHoras, tieneDosResponsables ? esSecundario : false, notas.trim() || undefined);
    onClose();
  };

  const horasActualesResp = tareaSeleccionada
    ? (esSecundario ? (tareaSeleccionada.tiempo_invertido_secundario || 0) : (tareaSeleccionada.tiempo_invertido || 0))
    : 0;

  const rolActivoImputacion = tareaSeleccionada
    ? (esSecundario ? getNombreRol(tareaSeleccionada.rol_destino_secundario || tareaSeleccionada.rol_destino) : getNombreRol(tareaSeleccionada.rol_destino))
    : 'General';

  const usuarioActivoNombre = tareaSeleccionada
    ? (esSecundario ? (tareaSeleccionada.responsable_secundario_nombre || 'Co-responsable') : (tareaSeleccionada.responsable_nombre || 'Responsable Principal'))
    : '';

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
            <h3 className="text-lg font-black text-charcoal-900">Imputar Tiempo Individual</h3>
            <p className="text-xs text-charcoal-500">Contabilización individual de horas por usuario y rol asignado</p>
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
              Seleccionar Tarea de Proyecto *
            </label>
            <select
              value={tareaId}
              onChange={e => {
                setTareaId(e.target.value);
                setEsSecundario(false);
              }}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              required
            >
              {tareasProyecto.length === 0 ? (
                <option value="">No hay tareas de proyecto disponibles</option>
              ) : (
                tareasProyecto.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.titulo} ({t.proyecto_nombre || 'Proyecto Especial'})
                    {t.responsable_secundario_nombre ? ' [2 Responsables]' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Selector de Responsable cuando la tarea tiene dos asignados */}
          {tareaSeleccionada && tieneDosResponsables && (
            <div className="space-y-2 p-3.5 bg-cream-50 rounded-2xl border border-stone-200">
              <label className="block text-xs font-extrabold text-charcoal-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sage-600" />
                <span>¿A qué responsable o rol deseas sumar este tiempo? *</span>
              </label>
              <p className="text-[11px] text-charcoal-500">
                Esta tarea tiene dos responsables. El tiempo se contabilizará de forma individual e independiente.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Opción 1: Responsable Principal */}
                <button
                  type="button"
                  onClick={() => setEsSecundario(false)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    !esSecundario
                      ? 'bg-sage-50/90 border-sage-500 shadow-xs ring-2 ring-sage-400/40 text-sage-950'
                      : 'bg-white border-stone-200 hover:border-stone-300 text-charcoal-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sage-200 text-sage-900">
                      Principal
                    </span>
                    {!esSecundario && <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />}
                  </div>
                  <div>
                    <p className="text-xs font-black truncate">{tareaSeleccionada.responsable_nombre || 'Principal'}</p>
                    <p className="text-[10px] text-charcoal-500 font-bold">Rol: {getNombreRol(tareaSeleccionada.rol_destino)}</p>
                  </div>
                  <div className="text-[10px] text-charcoal-600 font-semibold pt-1 border-t border-stone-100">
                    Acumulado: <strong>{tareaSeleccionada.tiempo_invertido || 0} hrs</strong>
                  </div>
                </button>

                {/* Opción 2: Co-responsable */}
                <button
                  type="button"
                  onClick={() => setEsSecundario(true)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    esSecundario
                      ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-2 ring-blue-400/40 text-blue-950'
                      : 'bg-white border-stone-200 hover:border-stone-300 text-charcoal-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                      Co-responsable
                    </span>
                    {esSecundario && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                  <div>
                    <p className="text-xs font-black truncate">{tareaSeleccionada.responsable_secundario_nombre || 'Co-responsable'}</p>
                    <p className="text-[10px] text-blue-700 font-bold">Rol: {getNombreRol(tareaSeleccionada.rol_destino_secundario || tareaSeleccionada.rol_destino)}</p>
                  </div>
                  <div className="text-[10px] text-charcoal-600 font-semibold pt-1 border-t border-stone-100">
                    Acumulado: <strong>{tareaSeleccionada.tiempo_invertido_secundario || 0} hrs</strong>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Información Actual del Responsable Seleccionado */}
          {tareaSeleccionada && (
            <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
              esSecundario && tieneDosResponsables 
                ? 'bg-blue-50/60 border-blue-200 text-charcoal-800' 
                : 'bg-sage-50/60 border-sage-200 text-charcoal-800'
            }`}>
              <div className="flex justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sage-600" />
                  Imputando a: <strong className={esSecundario && tieneDosResponsables ? 'text-blue-900' : 'text-sage-900'}>{usuarioActivoNombre}</strong>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-stone-200 font-black">
                  Rol: {rolActivoImputacion}
                </span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-stone-200/50">
                <span>Tiempo Invertido Actual: <strong>{horasActualesResp} hrs</strong></span>
              </div>
            </div>
          )}

          {/* Horas a Incrementar */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Horas a Añadir al Tiempo Invertido de {usuarioActivoNombre} *
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
              Estas horas se sumarán <strong className="text-charcoal-800">únicamente al tiempo individual</strong> de {usuarioActivoNombre} ({rolActivoImputacion}).
            </p>
          </div>

          {/* Detalle / Nota de Avance (Opcional) */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Detalle / Nota de avance (Opcional)
            </label>
            <input
              type="text"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ej. Diseño de interfaz, ajuste de audio, corrección de guión..."
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
            <p className="text-[10px] text-charcoal-400 mt-1">
              Esta nota se publicará automáticamente en la sección de <strong className="text-charcoal-600">Discusión & Comentarios</strong> de la tarea.
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
