'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Clock3, 
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  CalendarDays
} from 'lucide-react';
import { TareaCCV, EstadoTarea } from '@/types';

interface CalendarViewProps {
  tareas: TareaCCV[];
  onSelectTask: (tarea: TareaCCV) => void;
  onOpenCreateTask?: () => void;
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const formatYYYYMMDD = (year: number, monthIndex: number, day: number): string => {
  const y = year.toString();
  const m = (monthIndex + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  tareas,
  onSelectTask,
}) => {
  // Fecha actual del sistema
  const hoyObj = useMemo(() => new Date(), []);
  const hoyYear = hoyObj.getFullYear();
  const hoyMonth = hoyObj.getMonth();
  const hoyDay = hoyObj.getDate();
  const hoyStr = formatYYYYMMDD(hoyYear, hoyMonth, hoyDay);

  // Estados de navegación del calendario (por defecto posicionado en la fecha de hoy)
  const [currentYear, setCurrentYear] = useState<number>(hoyYear);
  const [currentMonth, setCurrentMonth] = useState<number>(hoyMonth);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(hoyStr);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Navegación de meses
  const irAlMesAnterior = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const irAlMesSiguiente = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const irAHoy = () => {
    setCurrentYear(hoyYear);
    setCurrentMonth(hoyMonth);
    setFechaSeleccionada(hoyStr);
  };

  // Cálculo de la matriz del mes
  const { diasMes, offsetInicial, diasMesAnterior, totalCeldas } = useMemo(() => {
    // Primer día del mes
    const primerDia = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = primerDia.getDay(); // 0 = Domingo, 1 = Lunes...

    // Total días del mes actual
    const diasEnMesActual = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Días del mes anterior para relleno
    const diasEnMesAnterior = new Date(currentYear, currentMonth, 0).getDate();

    const listaDias = Array.from({ length: diasEnMesActual }, (_, i) => i + 1);

    // Total de celdas necesarias (múltiplo de 7: 28, 35 o 42)
    const celdasRequeridas = Math.ceil((startingDayOfWeek + diasEnMesActual) / 7) * 7;

    return {
      diasMes: listaDias,
      offsetInicial: startingDayOfWeek,
      diasMesAnterior: diasEnMesAnterior,
      totalCeldas: celdasRequeridas
    };
  }, [currentYear, currentMonth]);

  // Mapa de tareas por fecha para acceso O(1)
  const tareasPorFecha = useMemo(() => {
    const map: Record<string, TareaCCV[]> = {};
    tareas.forEach(tarea => {
      if (!tarea.fecha_vencimiento) return;
      const fecha = tarea.fecha_vencimiento.trim();
      if (!map[fecha]) {
        map[fecha] = [];
      }
      map[fecha].push(tarea);
    });
    return map;
  }, [tareas]);

  // Tareas filtradas para la fecha seleccionada
  const tareasDelDiaSeleccionado = useMemo(() => {
    const lista = tareasPorFecha[fechaSeleccionada] || [];
    if (filtroEstado === 'todos') return lista;
    return lista.filter(t => t.estado === filtroEstado);
  }, [tareasPorFecha, fechaSeleccionada, filtroEstado]);

  // Formato amigable en español de la fecha seleccionada
  const textoFechaSeleccionada = useMemo(() => {
    const [y, m, d] = fechaSeleccionada.split('-').map(Number);
    if (!y || !m || !d) return fechaSeleccionada;
    const date = new Date(y, m - 1, d);
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const texto = date.toLocaleDateString('es-CO', opciones);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }, [fechaSeleccionada]);

  // Indicador de si la fecha seleccionada es el día de hoy
  const esHoySeleccionado = fechaSeleccionada === hoyStr;

  // Estadísticas del mes en curso
  const statsMes = useMemo(() => {
    const tareasMesActual = tareas.filter(t => {
      if (!t.fecha_vencimiento) return false;
      const [y, m] = t.fecha_vencimiento.split('-').map(Number);
      return y === currentYear && m === currentMonth + 1;
    });

    const total = tareasMesActual.length;
    const completadas = tareasMesActual.filter(t => t.estado === 'Completada').length;
    const pendientes = tareasMesActual.filter(t => t.estado === 'Pendiente').length;
    const enRevision = tareasMesActual.filter(t => t.estado === 'En Revisión').length;
    const enProceso = tareasMesActual.filter(t => t.estado === 'En Proceso').length;

    return { total, completadas, pendientes, enRevision, enProceso };
  }, [tareas, currentYear, currentMonth]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header del Calendario y Controles de Navegación */}
      <div className="ccv-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-white via-primary-50/20 to-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-100 text-primary-700">
              <CalendarIcon className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
                Calendario de Entregas & Vencimientos CCV
              </h2>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Seguimiento temporal de entregas, revisiones técnicas y cierres de módulos académicos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botón Ir a Hoy */}
          <button
            onClick={irAHoy}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
              currentYear === hoyYear && currentMonth === hoyMonth && fechaSeleccionada === hoyStr
                ? 'bg-primary-600 text-white border-primary-700 hover:bg-primary-700'
                : 'bg-white text-charcoal-700 border-stone-200 hover:bg-stone-50 hover:text-charcoal-900'
            }`}
            title="Ir a la fecha de hoy"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>Hoy ({hoyDay} de {NOMBRES_MESES[hoyMonth].slice(0, 3)})</span>
          </button>

          {/* Navegador Mes / Año */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-stone-200 shadow-2xs">
            <button
              onClick={irAlMesAnterior}
              className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-stone-100 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold text-charcoal-900 px-3 min-w-[140px] text-center">
              {NOMBRES_MESES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={irAlMesSiguiente}
              className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-stone-100 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Resumen de Métricas del Mes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="ccv-card p-3.5 flex items-center justify-between border-l-4 border-l-primary-600">
          <div>
            <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Total en {NOMBRES_MESES[currentMonth]}</p>
            <p className="text-xl font-extrabold text-charcoal-900 mt-0.5">{statsMes.total} tareas</p>
          </div>
          <span className="p-2 rounded-xl bg-primary-50 text-primary-700">
            <Layers className="w-5 h-5" />
          </span>
        </div>

        <div className="ccv-card p-3.5 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Completadas</p>
            <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{statsMes.completadas}</p>
          </div>
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>

        <div className="ccv-card p-3.5 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">En Proceso / Revisión</p>
            <p className="text-xl font-extrabold text-blue-700 mt-0.5">{statsMes.enProceso + statsMes.enRevision}</p>
          </div>
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Clock3 className="w-5 h-5" />
          </span>
        </div>

        <div className="ccv-card p-3.5 flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Pendientes</p>
            <p className="text-xl font-extrabold text-rose-700 mt-0.5">{statsMes.pendientes}</p>
          </div>
          <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Grid Principal: Calendario a la izquierda + Panel de Día a la derecha */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Columna Calendario (8/12) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="ccv-card p-6 shadow-card">
            {/* Encabezado Días de la semana */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-charcoal-500 uppercase tracking-wider pb-3 border-b border-stone-200">
              <div className="text-rose-600">Dom</div>
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div className="text-charcoal-700">Sáb</div>
            </div>

            {/* Matriz de Días */}
            <div className="grid grid-cols-7 gap-2 mt-3.5">
              {/* Celdas del mes anterior (relleno visual atenuado) */}
              {Array.from({ length: offsetInicial }).map((_, idx) => {
                const diaAnt = diasMesAnterior - offsetInicial + idx + 1;
                return (
                  <div
                    key={`prev-offset-${idx}`}
                    className="min-h-[105px] p-2 rounded-2xl bg-stone-50/60 border border-dashed border-stone-200/70 opacity-40 select-none flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-stone-400">{diaAnt}</span>
                  </div>
                );
              })}

              {/* Celdas del mes actual */}
              {diasMes.map((dia) => {
                const fechaStr = formatYYYYMMDD(currentYear, currentMonth, dia);
                const tareasDelDia = tareasPorFecha[fechaStr] || [];
                const esHoy = (currentYear === hoyYear && currentMonth === hoyMonth && dia === hoyDay);
                const esSeleccionado = (fechaStr === fechaSeleccionada);

                return (
                  <div
                    key={`dia-${dia}`}
                    onClick={() => setFechaSeleccionada(fechaStr)}
                    className={`min-h-[105px] p-2 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer group relative ${
                      esSeleccionado
                        ? 'bg-primary-50/80 border-primary-600 ring-2 ring-primary-500 shadow-md scale-[1.01] z-10'
                        : esHoy
                        ? 'bg-accent-50/40 border-accent-500 shadow-sm ring-1 ring-accent-400 hover:border-accent-600'
                        : 'bg-white border-stone-200/90 hover:border-primary-300 hover:bg-stone-50/50 hover:shadow-xs'
                    }`}
                  >
                    {/* Header de la celda de día */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-full transition-colors ${
                            esSeleccionado
                              ? 'bg-primary-700 text-white shadow-2xs'
                              : esHoy
                              ? 'bg-accent-500 text-white shadow-2xs font-black'
                              : 'text-charcoal-800 group-hover:text-primary-700'
                          }`}
                        >
                          {dia}
                        </span>
                        {esHoy && (
                          <span className="text-[9px] font-black text-accent-700 uppercase tracking-tighter bg-accent-100 px-1 py-0.2 rounded">
                            Hoy
                          </span>
                        )}
                      </div>

                      {tareasDelDia.length > 0 && (
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            esSeleccionado
                              ? 'bg-primary-600 text-white'
                              : 'bg-primary-100 text-primary-800'
                          }`}
                        >
                          {tareasDelDia.length}
                        </span>
                      )}
                    </div>

                    {/* Pastillas de tareas */}
                    <div className="space-y-1 my-1 overflow-y-auto max-h-16 scrollbar-thin">
                      {tareasDelDia.map((t) => {
                        const bgBadge = 
                          t.estado === 'Completada' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                          t.estado === 'En Revisión' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                          t.estado === 'En Proceso' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                          'bg-rose-600 hover:bg-rose-700 text-white';

                        return (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFechaSeleccionada(fechaStr);
                              onSelectTask(t);
                            }}
                            className={`p-1 rounded-md text-[9.5px] font-bold leading-tight truncate cursor-pointer transition-transform hover:scale-102 shadow-2xs ${bgBadge}`}
                            title={`${t.titulo} (${t.estado}) - Clic para ver detalle`}
                          >
                            {t.titulo}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer sutil con total */}
                    <div className="text-[9px] text-charcoal-400 flex justify-end">
                      {tareasDelDia.length > 0 ? (
                        <span className="text-charcoal-500 font-medium">
                          {tareasDelDia.length === 1 ? '1 entrega' : `${tareasDelDia.length} entregas`}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {/* Celdas del mes siguiente para completar la cuadrícula */}
              {Array.from({ length: totalCeldas - (offsetInicial + diasMes.length) }).map((_, idx) => {
                const diaSig = idx + 1;
                return (
                  <div
                    key={`next-offset-${idx}`}
                    className="min-h-[105px] p-2 rounded-2xl bg-stone-50/60 border border-dashed border-stone-200/70 opacity-40 select-none flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-stone-400">{diaSig}</span>
                  </div>
                );
              })}
            </div>

            {/* Leyenda de estados */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-bold text-charcoal-600">Convenciones:</span>
                <span className="flex items-center gap-1.5 text-charcoal-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Completada
                </span>
                <span className="flex items-center gap-1.5 text-charcoal-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  En Revisión
                </span>
                <span className="flex items-center gap-1.5 text-charcoal-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  En Proceso
                </span>
                <span className="flex items-center gap-1.5 text-charcoal-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  Pendiente
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-charcoal-500">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
                <span>Día actual sombreado en dorado / Hoy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Panel de Tareas & Entregas del Día Seleccionado (4/12) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="ccv-card p-6 h-full flex flex-col justify-between border-t-4 border-t-primary-600 shadow-card">
            <div className="space-y-4">
              {/* Header del Panel Lateral */}
              <div className="pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-primary-700">
                    Entregas del Día
                  </span>
                  {esHoySeleccionado && (
                    <span className="bg-accent-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                      HOY
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-charcoal-900 mt-1">
                  {textoFechaSeleccionada}
                </h3>
              </div>

              {/* Filtro rápido por estado dentro del día */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                {[
                  { id: 'todos', label: 'Todas' },
                  { id: 'Pendiente', label: 'Pendientes' },
                  { id: 'En Proceso', label: 'En Proceso' },
                  { id: 'Completada', label: 'Completadas' },
                ].map(opc => (
                  <button
                    key={opc.id}
                    onClick={() => setFiltroEstado(opc.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                      filtroEstado === opc.id
                        ? 'bg-charcoal-800 text-white shadow-2xs'
                        : 'bg-stone-100 text-charcoal-600 hover:bg-stone-200'
                    }`}
                  >
                    {opc.label}
                  </button>
                ))}
              </div>

              {/* Listado de Tareas del Día */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {tareasDelDiaSeleccionado.length > 0 ? (
                  tareasDelDiaSeleccionado.map((tarea) => {
                    const badgeClass =
                      tarea.estado === 'Completada' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      tarea.estado === 'En Revisión' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      tarea.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-rose-100 text-rose-800 border-rose-300';

                    return (
                      <div
                        key={tarea.id}
                        onClick={() => onSelectTask(tarea)}
                        className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeClass}`}>
                            {tarea.estado}
                          </span>
                          <span className="text-[11px] font-bold text-charcoal-400">
                            {tarea.tipo_tarea}
                          </span>
                        </div>

                        <h4 className="text-xs font-extrabold text-charcoal-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">
                          {tarea.titulo}
                        </h4>

                        <div className="text-[11px] text-charcoal-500 truncate">
                          {tarea.curso_nombre || tarea.proyecto_nombre || 'Asignación General CCV'}
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-charcoal-600">
                          <div className="flex items-center gap-1.5">
                            {tarea.responsable_avatar ? (
                              <img
                                src={tarea.responsable_avatar}
                                alt={tarea.responsable_nombre || ''}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-[10px] font-bold">
                                {(tarea.responsable_nombre || 'U').charAt(0)}
                              </div>
                            )}
                            <span className="text-[11px] font-bold text-charcoal-700 truncate max-w-[130px]">
                              {tarea.responsable_nombre || 'Sin asignar'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-extrabold text-primary-700 group-hover:translate-x-0.5 transition-transform">
                            <span>Gestionar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-stone-200 bg-cream-50/50 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 mx-auto flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-charcoal-800">
                        No hay entregas programadas
                      </p>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">
                        No se registran vencimientos para este día con los filtros seleccionados.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Informativo */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-charcoal-500">
              <span>{tareasDelDiaSeleccionado.length} entregas listadas</span>
              <span className="text-primary-600 font-bold">CCV 3.0 Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
