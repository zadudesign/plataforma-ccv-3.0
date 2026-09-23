'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  BookOpen, 
  User, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CalendarCheck2
} from 'lucide-react';
import { CursoVirtual, PlantillaTareaCurso } from '@/types';
import { 
  DURACIONES_PREDETERMINADAS, 
  calcularHitosCronograma, 
  toLocalDateString, 
  formatearFechaConDia 
} from '@/lib/courseScheduleUtils';

import { fetchPlantillaTareasCursoDB } from '@/lib/supabaseService';

interface ScheduleCourseModalProps {
  curso: CursoVirtual;
  plantillaTareas?: PlantillaTareaCurso[];
  modo?: 'inicializar' | 'reajustar';
  onClose: () => void;
  onConfirm: (fechaInicio: string, duracionDias: number) => Promise<void>;
}

export const ScheduleCourseModal: React.FC<ScheduleCourseModalProps> = ({
  curso,
  plantillaTareas,
  modo = 'inicializar',
  onClose,
  onConfirm
}) => {
  const [tareasMaestras, setTareasMaestras] = useState<PlantillaTareaCurso[]>(plantillaTareas || []);

  React.useEffect(() => {
    if (!plantillaTareas || plantillaTareas.length === 0) {
      fetchPlantillaTareasCursoDB().then(res => {
        if (res && res.length > 0) setTareasMaestras(res);
      }).catch(() => {});
    } else {
      setTareasMaestras(plantillaTareas);
    }
  }, [plantillaTareas]);

  const [fechaInicio, setFechaInicio] = useState<string>(() => {
    return curso.fecha_inicio || toLocalDateString(new Date());
  });

  const [duracionSeleccionada, setDuracionSeleccionada] = useState<number>(() => {
    return curso.duracion_dias || 60;
  });

  const [esDuracionPersonalizada, setEsDuracionPersonalizada] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cálculo en tiempo real de los hitos y fechas límite
  const proyeccion = useMemo(() => {
    return calcularHitosCronograma(
      fechaInicio,
      duracionSeleccionada,
      curso.numero_unidades || 1,
      tareasMaestras
    );
  }, [fechaInicio, duracionSeleccionada, curso.numero_unidades, tareasMaestras]);

  const handleSeleccionarPill = (dias: number) => {
    setEsDuracionPersonalizada(false);
    setDuracionSeleccionada(dias);
  };

  const handleCustomDuracionChange = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val > 0) {
      setDuracionSeleccionada(val);
    }
  };

  const handleGuardar = async () => {
    if (!fechaInicio) {
      setErrorMsg('Debes seleccionar una fecha de inicio para el curso.');
      return;
    }
    if (duracionSeleccionada < 10) {
      setErrorMsg('La duración del curso debe ser de al menos 10 días.');
      return;
    }

    setErrorMsg(null);
    setGuardando(true);
    try {
      await onConfirm(fechaInicio, duracionSeleccionada);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al procesar el cronograma.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="ccv-card w-full max-w-3xl bg-white max-h-[92vh] flex flex-col shadow-2xl border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-sky-400 flex items-center justify-center font-bold shadow-inner shrink-0 border border-white/10">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                {modo === 'inicializar' ? 'Asignación de Cronograma' : 'Reajuste de Cronograma'}
              </span>
              <h3 className="text-lg font-black text-white truncate mt-0.5">
                Acordar Calendario de Trabajo del Curso
              </h3>
              <p className="text-xs text-slate-300 truncate mt-0.5">
                {curso.nombre} <span className="font-mono text-sky-300">({curso.codigo})</span> • {curso.numero_unidades || 1} {curso.numero_unidades === 1 ? 'Unidad' : 'Unidades'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={guardando}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Inputs de Parámetros (Fecha inicio + Duración) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            {/* Fecha de Inicio */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
                Fecha de Inicio:
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={guardando}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
              <p className="text-[10px] text-slate-500 font-medium">
                Punto de partida para el cálculo de los plazos.
              </p>
            </div>

            {/* Selector de Duración Total */}
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Duración Total Acordada:
                </label>
                <span className="text-xs font-mono font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {duracionSeleccionada} días
                </span>
              </div>

              {/* Pills rápidas */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {DURACIONES_PREDETERMINADAS.map((dias) => {
                  const isSelected = !esDuracionPersonalizada && duracionSeleccionada === dias;
                  return (
                    <button
                      key={dias}
                      type="button"
                      onClick={() => handleSeleccionarPill(dias)}
                      disabled={guardando}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-2xs flex items-center gap-1 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-102'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{dias}d</span>
                      {dias === 60 && (
                        <span className={`text-[9px] px-1 py-0.1 rounded font-black ${
                          isSelected ? 'bg-sky-600 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Ideal
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Botón Personalizado */}
                <button
                  type="button"
                  onClick={() => setEsDuracionPersonalizada(true)}
                  disabled={guardando}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-2xs ${
                    esDuracionPersonalizada
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Otro
                </button>
              </div>

              {/* Input libre si es personalizado */}
              {esDuracionPersonalizada && (
                <div className="pt-1 flex items-center gap-2 animate-fadeIn">
                  <input
                    type="number"
                    min={10}
                    max={365}
                    value={duracionSeleccionada}
                    onChange={(e) => handleCustomDuracionChange(e.target.value)}
                    disabled={guardando}
                    placeholder="Ej. 50"
                    className="w-28 py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
                  />
                  <span className="text-xs text-slate-600 font-semibold">días calendario totales</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Resumen Ejecutivo de Fechas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">Inicio</span>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">{proyeccion.fechaInicio}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">Duración</span>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5">{proyeccion.duracionTotal} días</p>
            </div>
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 block">Cierre Estimado</span>
              <p className="text-xs font-extrabold text-emerald-900 mt-0.5 truncate">{proyeccion.fechaFinEstimada}</p>
            </div>
            <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200">
              <span className="text-[10px] uppercase font-black tracking-wider text-sky-700 block">Hitos Calculados</span>
              <p className="text-xs font-extrabold text-sky-900 mt-0.5">{proyeccion.hitos.length} etapas</p>
            </div>
          </div>

          {/* Section 3: Previsualización de Fases e Hitos (Timeline) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Previsualización de Hitos de Entrega por Fase
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full">
                Garantía: Días Hábiles (Lunes a Viernes)
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
              {proyeccion.hitos.map((hito, idx) => (
                <div 
                  key={hito.id} 
                  className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-xs shrink-0 border border-slate-200">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-sky-50 text-sky-800 border border-sky-200">
                          Fase {hito.fase}
                        </span>
                        {hito.unidad && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200">
                            Unidad {hito.unidad}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-500">
                          {hito.tareasCount} {hito.tareasCount === 1 ? 'tarea' : 'tareas'}
                        </span>
                      </div>
                      <h5 className="text-xs font-black text-slate-900 truncate mt-0.5">
                        {hito.nombreFase}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-medium block">Fecha Límite (Hito):</span>
                      <span className="text-xs font-mono font-black text-slate-900">
                        {hito.fechaVencimiento} <span className="font-sans font-bold text-sky-700">({hito.diaSemana})</span>
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Día Hábil
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner de Garantía */}
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 flex items-center gap-2.5 text-xs text-sky-900">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <p className="leading-relaxed text-[11px]">
                <strong>Regla de Negocio Aplicada:</strong> Las fechas de vencimiento de cada bloque se calculan dividiendo la duración de forma equitativa y se ajustan al <strong>viernes hábil</strong> si alguna fecha original coincide con fin de semana.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all shadow-2xs"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:scale-101"
          >
            {guardando ? (
              <span>Generando Cronograma...</span>
            ) : (
              <>
                <CalendarCheck2 className="w-4 h-4 text-sky-400" />
                <span>{modo === 'inicializar' ? 'Confirmar y Cargar Tareas' : 'Guardar y Reajustar Fechas'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
