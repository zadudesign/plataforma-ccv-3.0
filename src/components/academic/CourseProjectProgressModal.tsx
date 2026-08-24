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
  Timer,
  ArrowLeft,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { CursoVirtual, ProyectoEspecial, TareaCCV, EstadoTarea, TareaComentario } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getFacultyTheme } from '@/lib/facultyThemes';
import { DynamicLucideIcon } from '@/components/common/DynamicLucideIcon';

interface CourseProjectProgressModalProps {
  entidad: CursoVirtual | ProyectoEspecial;
  tipo: 'curso' | 'proyecto';
  tareas: TareaCCV[];
  comentarios?: TareaComentario[];
  onClose: () => void;
  onSelectTask?: (tarea: TareaCCV) => void;
  onUpdateStatus?: (tareaId: string, nuevoEstado: EstadoTarea) => void;
}

export const CourseProjectProgressModal: React.FC<CourseProjectProgressModalProps> = ({
  entidad,
  tipo,
  tareas,
  comentarios = [],
  onClose,
  onSelectTask,
  onUpdateStatus,
}) => {
  const { areas, facultades, programas } = useAuth();
  const [pestanaModal, setPestanaModal] = useState<'resumen' | 'detalle_tarea'>('resumen');
  const [tareaSeleccionadaLocal, setTareaSeleccionadaLocal] = useState<TareaCCV | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendientes' | 'completadas'>('todas');

  const esCurso = tipo === 'curso';
  const curso = esCurso ? (entidad as CursoVirtual) : null;
  const proyecto = !esCurso ? (entidad as ProyectoEspecial) : null;

  // Obtener departamento o facultad para la herencia visual de Identidad (Logo e Ícono)
  const areaProyecto = !esCurso 
    ? areas.find(a => a.id === proyecto?.area_id || a.nombre.toLowerCase() === (proyecto?.area_id || '').toLowerCase()) 
    : null;
  const programaCurso = esCurso ? programas.find(p => p.id === curso?.programa_id) : null;
  const facultadCurso = esCurso ? facultades.find(f => f.id === programaCurso?.facultad_id) : null;

  const themeColor = !esCurso ? (areaProyecto?.color || 'amber') : (facultadCurso?.color || 'emerald');
  const themeIcono = !esCurso ? (areaProyecto?.icono || 'FolderKanban') : (facultadCurso?.icono || 'BookOpen');
  const theme = getFacultyTheme(themeColor);

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

  // Cálculos Financieros Exclusivos para Proyectos
  const costoTotalProyecto = tareasEntidad.reduce((sum, t) => {
    const tarifa = t.tarifa_tarea !== undefined 
      ? t.tarifa_tarea 
      : (t.tarifa_hora ? t.tarifa_hora * (t.tiempo_estimado || 0) : 0);
    return sum + tarifa;
  }, 0);

  const costoEjecutadoProyecto = tareasEntidad.reduce((sum, t) => {
    const tarifaHora = t.tarifa_hora || 0;
    return sum + (tarifaHora * (t.tiempo_invertido || 0));
  }, 0);

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

  const handleVerDetalleTarea = (t: TareaCCV) => {
    setTareaSeleccionadaLocal(t);
    setPestanaModal('detalle_tarea');
    if (onSelectTask) {
      // Optional callback for parent state if needed
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

  // Comentarios de la tarea seleccionada en vista detalle
  const comentariosTarea = tareaSeleccionadaLocal 
    ? comentarios.filter(c => c.tarea_id === tareaSeleccionadaLocal.id) 
    : [];

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Modal Top Banner */}
        <div className={`p-6 bg-gradient-to-r ${theme.bgLight} via-white to-stone-50/50 border-b ${theme.borderLight} relative shrink-0`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center font-bold shadow-md shrink-0 border ${theme.badgeBorder}`}>
              <DynamicLucideIcon name={themeIcono} className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                  {esCurso ? `Curso Virtual • ${curso?.codigo}` : `PROYECTO CCV • ${areaProyecto?.nombre || 'Departamento'}`}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-charcoal-700">
                  {entidad.estado}
                </span>

                {/* Badge Financiero Destacado para Proyectos */}
                {!esCurso && (
                  <>
                    <span className="text-xs font-black px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Presupuesto: ${costoTotalProyecto.toLocaleString('es-CO')} COP
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-charcoal-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {horasInvertidas}h / {horasEstimadas}h est.
                    </span>
                  </>
                )}
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
                  <>
                    {areaProyecto && <span><strong className="text-charcoal-700">Departamento:</strong> {areaProyecto.nombre}</span>}
                    <span>{proyecto?.descripcion || 'Iniciativa institucional y proyecto especial CCV'}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Modal Header Tabs Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-200/60">
            <button
              onClick={() => setPestanaModal('resumen')}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                pestanaModal === 'resumen'
                  ? `${theme.bgPrimary} text-white shadow-sm`
                  : 'bg-white border border-stone-200 text-charcoal-600 hover:bg-cream-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Resumen y Avance ({porcentaje}%)
            </button>

            {tareaSeleccionadaLocal && (
              <button
                onClick={() => setPestanaModal('detalle_tarea')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  pestanaModal === 'detalle_tarea'
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-charcoal-600 hover:bg-cream-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Tarea: <span className="truncate max-w-[200px]">{tareaSeleccionadaLocal.titulo}</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {pestanaModal === 'resumen' ? (
            <div className="space-y-6">
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
                  {!esCurso ? (
                    <>
                      {/* KPI Proyecto 1: Presupuesto Financiero Total */}
                      <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
                        <div className="flex justify-between items-center text-emerald-800">
                          <span className="text-[11px] font-black uppercase tracking-wider">Presupuesto Total</span>
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-xl font-black text-emerald-950 mt-1">
                          ${costoTotalProyecto.toLocaleString('es-CO')} <span className="text-xs font-bold text-emerald-700">COP</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">Tarifas estimadas CCV</span>
                      </div>

                      {/* KPI Proyecto 2: Costo Ejecutado */}
                      <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between">
                        <div className="flex justify-between items-center text-blue-800">
                          <span className="text-[11px] font-black uppercase tracking-wider">Costo Ejecutado</span>
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xl font-black text-blue-950 mt-1">
                          ${costoEjecutadoProyecto.toLocaleString('es-CO')} <span className="text-xs font-bold text-blue-700">COP</span>
                        </span>
                        <span className="text-[10px] text-blue-700 font-medium">Según {horasInvertidas}h invertidas</span>
                      </div>

                      {/* KPI Proyecto 3: Horas Estimadas vs Reales */}
                      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                        <div className="flex justify-between items-center text-amber-800">
                          <span className="text-[11px] font-black uppercase tracking-wider">Tiempo Invertido</span>
                          <Timer className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl font-black text-amber-950">{horasInvertidas}h</span>
                          <span className="text-xs font-semibold text-amber-700">/ {horasEstimadas}h est.</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-medium">Inversión de horas</span>
                      </div>

                      {/* KPI Proyecto 4: Tareas del Proyecto */}
                      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                        <div className="flex justify-between items-center text-charcoal-600">
                          <span className="text-[11px] font-black uppercase tracking-wider">Tareas Totales</span>
                          <CheckSquare className="w-4 h-4 text-sage-600" />
                        </div>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl font-black text-charcoal-900">{completadas}</span>
                          <span className="text-xs font-semibold text-charcoal-500">/ {totalTareas} completadas</span>
                        </div>
                        <span className="text-[10px] text-charcoal-400 font-medium">Flujo de trabajo CCV</span>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
                      const costoTarea = t.tarifa_tarea !== undefined 
                        ? t.tarifa_tarea 
                        : (t.tarifa_hora ? t.tarifa_hora * (t.tiempo_estimado || 0) : undefined);

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
                                  onClick={() => handleVerDetalleTarea(t)}
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
                                {t.tiempo_estimado > 0 && <span>• {t.tiempo_invertido || 0}h / {t.tiempo_estimado}h est.</span>}
                                {costoTarea !== undefined && costoTarea > 0 && (
                                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                                    ${costoTarea.toLocaleString('es-CO')} COP
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-xs ${getBadgeStyle(t.estado)}`}>
                              {t.estado}
                            </span>

                            <button
                              onClick={() => handleVerDetalleTarea(t)}
                              className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white border border-stone-200 text-charcoal-700 hover:bg-stone-100 flex items-center gap-1 shadow-2xs"
                              title="Ver información detallada de esta tarea"
                            >
                              <span>Ver Información</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
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
          ) : (
            /* DETALLE DE TAREA SELECCIONADA PESTAÑA INTEGRADA */
            tareaSeleccionadaLocal && (
              <div className="space-y-5 animate-fadeIn">

                {/* Header Information */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800">
                      {tareaSeleccionadaLocal.tipo_tarea}
                    </span>
                    {tareaSeleccionadaLocal.categoria_proyecto && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-stone-300 text-charcoal-800">
                        {tareaSeleccionadaLocal.categoria_proyecto}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-charcoal-900">
                    {tareaSeleccionadaLocal.titulo}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Área: <span className="font-semibold text-charcoal-800">{tareaSeleccionadaLocal.area_nombre || 'CMU'}</span> • 
                    {tareaSeleccionadaLocal.curso_nombre ? ` Curso: ${tareaSeleccionadaLocal.curso_nombre}` : ` Proyecto: ${tareaSeleccionadaLocal.proyecto_nombre}`}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-1">Descripción Didáctica</h4>
                  <p className="text-sm text-charcoal-800 leading-relaxed bg-cream-50 p-4 rounded-2xl border border-stone-200/60">
                    {tareaSeleccionadaLocal.descripcion}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className={`grid grid-cols-1 ${tareaSeleccionadaLocal.tipo_tarea === 'Proyecto' && tareaSeleccionadaLocal.tarifa_tarea !== undefined ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                  <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold mb-1">
                      <User className="w-4 h-4 text-sage-600" /> Responsable Asignado
                    </div>
                    <p className="text-sm font-extrabold text-charcoal-900">{tareaSeleccionadaLocal.responsable_nombre}</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold mb-1">
                      <Clock className="w-4 h-4 text-amber-600" /> Registro de Tiempos
                    </div>
                    <p className="text-sm font-extrabold text-charcoal-900">
                      {tareaSeleccionadaLocal.tiempo_invertido}h / {tareaSeleccionadaLocal.tiempo_estimado}h est.
                    </p>
                  </div>

                  {tareaSeleccionadaLocal.tipo_tarea === 'Proyecto' && tareaSeleccionadaLocal.tarifa_tarea !== undefined && (
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold mb-1">
                        <DollarSign className="w-4 h-4 text-sage-600" /> Costo Financiero (COP)
                      </div>
                      <p className="text-sm font-extrabold text-sage-700">${tareaSeleccionadaLocal.tarifa_tarea.toLocaleString('es-CO')} COP</p>
                    </div>
                  )}
                </div>

                {/* Estado Selector */}
                <div>
                  <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-2">Cambiar Estado de la Tarea</h4>
                  <div className="flex flex-wrap gap-2">
                    {(['Pendiente', 'En Proceso', 'En Revisión', 'Completada'] as EstadoTarea[]).map((est) => {
                      const isActive = tareaSeleccionadaLocal.estado === est;
                      const getActiveBtnStyle = (estado: EstadoTarea) => {
                        switch (estado) {
                          case 'Pendiente': return 'bg-rose-600 text-white ring-2 ring-rose-300';
                          case 'En Proceso': return 'bg-blue-600 text-white ring-2 ring-blue-300';
                          case 'En Revisión': return 'bg-amber-500 text-white ring-2 ring-amber-300';
                          case 'Completada': return 'bg-emerald-600 text-white ring-2 ring-emerald-300';
                        }
                      };

                      return (
                        <button
                          key={est}
                          onClick={() => {
                            if (onUpdateStatus) {
                              onUpdateStatus(tareaSeleccionadaLocal.id, est);
                              setTareaSeleccionadaLocal({ ...tareaSeleccionadaLocal, estado: est });
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                            isActive
                              ? `${getActiveBtnStyle(est)} shadow-md scale-105`
                              : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-stone-200'
                          }`}
                        >
                          {est}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Comments Feed */}
                <div>
                  <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-sage-600" /> Discusión & Observaciones ({comentariosTarea.length})
                  </h4>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4">
                    {comentariosTarea.length === 0 ? (
                      <p className="text-xs text-charcoal-500 italic p-3 bg-stone-50 rounded-xl">Sin observaciones en esta tarea.</p>
                    ) : (
                      comentariosTarea.map((com) => (
                        <div key={com.id} className="p-3 bg-cream-50 rounded-xl border border-stone-200/60 flex items-start gap-3">
                          <img src={com.usuario_avatar} alt={com.usuario_nombre} className="w-8 h-8 rounded-full object-cover mt-0.5" />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-charcoal-900 text-xs">{com.usuario_nombre}</span>
                              <span className="text-[10px] text-charcoal-400">{com.created_at}</span>
                            </div>
                            <p className="text-xs text-charcoal-700 mt-1 leading-relaxed">{com.comentario}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
