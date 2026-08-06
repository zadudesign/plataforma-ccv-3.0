'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  FolderKanban, 
  User, 
  Calendar, 
  TrendingUp, 
  CheckSquare, 
  Layers,
  ChevronRight,
  Sparkles,
  Timer
} from 'lucide-react';
import { CursoVirtual, ProyectoEspecial, TareaCCV, EstadoTarea } from '@/types';

interface CourseProjectProgressModalProps {
  entidad: CursoVirtual | ProyectoEspecial;
  tipo: 'curso' | 'proyecto';
  tareas: TareaCCV[];
  onClose: () => void;
  onSelectTask?: (tarea: TareaCCV) => void;
  onUpdateStatus?: (tareaId: string, nuevoEstado: EstadoTarea) => void;
}

export const CourseProjectProgressModal: React.FC<CourseProjectProgressModalProps> = ({
  entidad,
  tipo,
  tareas,
  onClose,
  onSelectTask,
  onUpdateStatus,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendientes' | 'completadas'>('todas');

  const esCurso = tipo === 'curso';
  const curso = esCurso ? (entidad as CursoVirtual) : null;
  const proyecto = !esCurso ? (entidad as ProyectoEspecial) : null;

  // Filtrar tareas pertenecientes a este curso o proyecto
  const tareasEntidad = tareas.filter(t => 
    esCurso ? t.curso_id === entidad.id : t.proyecto_id === entidad.id
  );

  const totalTareas = tareasEntidad.length;
  const completadas = tareasEntidad.filter(t => t.estado === 'Completada').length;
  const enProceso = tareasEntidad.filter(t => t.estado === 'En Proceso' || t.estado === 'En Revisión').length;
  const pendientes = tareasEntidad.filter(t => t.estado === 'Pendiente').length;

  const porcentaje = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;

  const horasEstimadas = tareasEntidad.reduce((sum, t) => sum + (t.tiempo_estimado || 0), 0);
  const horasInvertidas = tareasEntidad.reduce((sum, t) => sum + (t.tiempo_invertido || 0), 0);

  // Filtrar según pestaña seleccionada
  const tareasMostrar = tareasEntidad.filter(t => {
    if (filtroEstado === 'completadas') return t.estado === 'Completada';
    if (filtroEstado === 'pendientes') return t.estado !== 'Completada';
    return true;
  });

  const getGaugeColor = (pct: number) => {
    if (pct >= 80) return '#16A34A'; // Verde
    if (pct >= 50) return '#CA8A04'; // Ámbar
    if (pct >= 25) return '#2563EB'; // Azul
    return '#E11D48'; // Rosa/Rojo
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Modal Top Banner */}
        <div className="p-6 bg-gradient-to-r from-cream-100 via-white to-sage-50 border-b border-stone-200/80 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className={`w-12 h-12 rounded-2xl ${esCurso ? 'bg-sage-600 text-white' : 'bg-amber-600 text-white'} flex items-center justify-center font-bold shadow-md shrink-0`}>
              {esCurso ? <BookOpen className="w-6 h-6" /> : <FolderKanban className="w-6 h-6" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 tracking-wider">
                  {esCurso ? `Curso Virtual • ${curso?.codigo}` : `Proyecto Especial CCV`}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-charcoal-700">
                  {entidad.estado}
                </span>
              </div>
              <h2 className="text-xl font-black text-charcoal-900 leading-tight">
                {entidad.nombre}
              </h2>
              <p className="text-xs text-charcoal-500 flex items-center gap-3 flex-wrap pt-0.5">
                {esCurso && (
                  <>
                    <span><strong className="text-charcoal-700">Programa:</strong> {curso?.programa_nombre}</span>
                    <span><strong className="text-charcoal-700">Docente:</strong> {curso?.docente_nombre || 'Sin asignar'}</span>
                    <span><strong className="text-charcoal-700">Periodo:</strong> {curso?.periodo}</span>
                  </>
                )}
                {!esCurso && (
                  <span>{proyecto?.descripcion || 'Sin descripción adicional'}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Progress Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Donut Gauge Box */}
            <div className="p-5 bg-cream-50/80 rounded-3xl border border-stone-200 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-[11px] font-extrabold uppercase text-charcoal-500 tracking-wider flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-sage-600" />
                Avance General
              </span>
              
              <div className="relative flex flex-col items-center justify-center my-1">
                <svg className="w-40 h-24 overflow-visible" viewBox="0 0 160 85">
                  <path
                    d="M 20 75 A 60 60 0 0 1 140 75"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth={14}
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 75 A 60 60 0 0 1 140 75"
                    fill="none"
                    stroke={getGaugeColor(porcentaje)}
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeDasharray={Math.PI * 60}
                    strokeDashoffset={(Math.PI * 60) * (1 - porcentaje / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                  <text
                    x="80"
                    y="70"
                    textAnchor="middle"
                    className="text-3xl font-black fill-charcoal-900 font-sans tracking-tight"
                  >
                    {porcentaje}%
                  </text>
                </svg>
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full rounded-full transition-all duration-700" 
                  style={{ width: `${porcentaje}%`, backgroundColor: getGaugeColor(porcentaje) }}
                />
              </div>
              <span className="text-[11px] text-charcoal-500 mt-2 font-medium">
                {completadas} de {totalTareas} tareas completadas
              </span>
            </div>

            {/* KPI Cards (4 grid) */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-center text-charcoal-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Tareas Totales</span>
                  <CheckSquare className="w-4 h-4 text-sage-600" />
                </div>
                <span className="text-2xl font-black text-charcoal-900 mt-2">{totalTareas}</span>
                <span className="text-[10px] text-charcoal-400 font-medium">Registradas en CCV</span>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-center text-emerald-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Completadas</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-2xl font-black text-emerald-900 mt-2">{completadas}</span>
                <span className="text-[10px] text-emerald-700 font-medium">100% Finalizadas</span>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-center text-amber-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider">En Proceso / Revisión</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-2xl font-black text-amber-900 mt-2">{enProceso}</span>
                <span className="text-[10px] text-amber-700 font-medium">En desarrollo activo</span>
              </div>

              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-center text-purple-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Horas Estimadas vs Reales</span>
                  <Timer className="w-4 h-4 text-purple-600" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-black text-purple-950">{horasInvertidas}h</span>
                  <span className="text-xs font-semibold text-purple-700">/ {horasEstimadas}h est.</span>
                </div>
                <span className="text-[10px] text-purple-700 font-medium">Inversión de tiempo</span>
              </div>
            </div>
          </div>

          {/* Task Breakdown Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
              <h3 className="text-base font-extrabold text-charcoal-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sage-600" />
                Desglose Puntual de Tareas ({tareasEntidad.length})
              </h3>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-cream-100 rounded-full border border-stone-200 text-xs font-bold shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setFiltroEstado('todas')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    filtroEstado === 'todas' ? 'bg-white text-charcoal-900 shadow-xs' : 'text-charcoal-500 hover:text-charcoal-900'
                  }`}
                >
                  Todas ({totalTareas})
                </button>
                <button
                  onClick={() => setFiltroEstado('pendientes')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    filtroEstado === 'pendientes' ? 'bg-white text-charcoal-900 shadow-xs' : 'text-charcoal-500 hover:text-charcoal-900'
                  }`}
                >
                  Pendientes ({enProceso + pendientes})
                </button>
                <button
                  onClick={() => setFiltroEstado('completadas')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    filtroEstado === 'completadas' ? 'bg-white text-charcoal-900 shadow-xs' : 'text-charcoal-500 hover:text-charcoal-900'
                  }`}
                >
                  Completadas ({completadas})
                </button>
              </div>
            </div>

            {/* Task Items List */}
            {tareasMostrar.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {tareasMostrar.map((t) => {
                  const isDone = t.estado === 'Completada';
                  
                  const getCardStyle = (estado: EstadoTarea) => {
                    switch (estado) {
                      case 'Pendiente':
                        return 'bg-rose-50/70 border-rose-200 hover:border-rose-400';
                      case 'En Proceso':
                        return 'bg-blue-50/70 border-blue-200 hover:border-blue-400';
                      case 'En Revisión':
                        return 'bg-amber-50/70 border-amber-200 hover:border-amber-400';
                      case 'Completada':
                        return 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400';
                      default:
                        return 'bg-white border-stone-200';
                    }
                  };

                  const getBadgeStyle = (estado: EstadoTarea) => {
                    switch (estado) {
                      case 'Pendiente':
                        return 'bg-rose-600 text-white border-rose-700';
                      case 'En Proceso':
                        return 'bg-blue-600 text-white border-blue-700';
                      case 'En Revisión':
                        return 'bg-amber-500 text-white border-amber-600';
                      case 'Completada':
                        return 'bg-emerald-600 text-white border-emerald-700';
                      default:
                        return 'bg-stone-600 text-white';
                    }
                  };

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${getCardStyle(t.estado)}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => onUpdateStatus && onUpdateStatus(t.id, isDone ? 'En Proceso' : 'Completada')}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                            isDone 
                              ? 'bg-emerald-600 text-white' 
                              : 'border-2 border-stone-400 hover:border-emerald-600 bg-white text-transparent'
                          }`}
                          title={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-md uppercase bg-white border border-stone-200 text-charcoal-800">
                              {t.categoria_proyecto || t.tipo_tarea}
                            </span>
                            <h4 
                              onClick={() => onSelectTask && onSelectTask(t)}
                              className={`font-bold text-xs cursor-pointer hover:underline truncate ${
                                isDone ? 'line-through text-stone-500' : 'text-charcoal-900'
                              }`}
                            >
                              {t.titulo}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-charcoal-600 mt-1 flex-wrap">
                            <span>Responsable: <strong className="text-charcoal-900 font-bold">{t.responsable_nombre || 'Sin Asignar'}</strong></span>
                            <span>• Vence: {t.fecha_vencimiento}</span>
                            {t.tiempo_estimado > 0 && <span>• Est: {t.tiempo_estimado}h</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-xs ${getBadgeStyle(t.estado)}`}>
                          {t.estado}
                        </span>

                        {onSelectTask && (
                          <button
                            onClick={() => onSelectTask(t)}
                            className="p-1 rounded-full text-charcoal-500 hover:text-charcoal-900 hover:bg-white/80"
                            title="Ver detalles completos de la tarea"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-cream-50/60 border border-stone-200/80 rounded-2xl text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-charcoal-400 mx-auto" />
                <p className="text-xs font-bold text-charcoal-700">No se encontraron tareas con este filtro.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-charcoal-900 hover:bg-sage-700 text-white text-xs font-bold rounded-full transition-all shadow"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
