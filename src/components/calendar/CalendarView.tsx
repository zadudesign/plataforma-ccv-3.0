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
  CalendarDays,
  CalendarClock
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

  // Mapa de tareas por fecha para acceso O(1) con orden cronológico por hora de vencimiento
  const tareasPorFecha = useMemo(() => {
    const map: Record<string, TareaCCV[]> = {};
    tareas.forEach(tarea => {
      if (!tarea.fecha_vencimiento || tarea.estado_bloqueo === 'BLOQUEADA') return;
      const fecha = tarea.fecha_vencimiento.trim();
      if (!map[fecha]) {
        map[fecha] = [];
      }
      map[fecha].push(tarea);
    });

    // Ordenar tareas de cada día en orden cronológico por hora de vencimiento (08:00 -> 18:00)
    Object.keys(map).forEach(fecha => {
      map[fecha].sort((a, b) => (a.hora_vencimiento || '18:00').localeCompare(b.hora_vencimiento || '18:00'));
    });

    return map;
  }, [tareas]);

  // Tareas filtradas para la fecha seleccionada (orden cronológico por hora)
  const tareasDelDiaSeleccionado = useMemo(() => {
    let lista = tareasPorFecha[fechaSeleccionada] || [];
    if (filtroEstado !== 'todos') {
      lista = lista.filter(t => t.estado === filtroEstado);
    }
    return [...lista].sort((a, b) => (a.hora_vencimiento || '18:00').localeCompare(b.hora_vencimiento || '18:00'));
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

  // Próximas Tareas ordenadas cronológicamente (fechas más próximas primero y hora)
  const proximasTareas = useMemo(() => {
    return tareas
      .filter(t => {
        if (!t.fecha_vencimiento) return false;
        // Tareas con fecha vencimiento futura o de hoy, y que aún no estén completadas
        return t.fecha_vencimiento >= hoyStr && t.estado !== 'Completada';
      })
      .sort((a, b) => {
        const compFecha = (a.fecha_vencimiento || '').localeCompare(b.fecha_vencimiento || '');
        if (compFecha !== 0) return compFecha;
        return (a.hora_vencimiento || '18:00').localeCompare(b.hora_vencimiento || '18:00');
      })
      .slice(0, 6); // Top 6 próximas tareas
  }, [tareas, hoyStr]);

  const formatDiasRestantes = (fechaStr: string) => {
    if (fechaStr === hoyStr) return 'Vence hoy';
    const [y, m, d] = fechaStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const today = new Date(hoyYear, hoyMonth, hoyDay);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Mañana';
    if (diffDays > 1 && diffDays <= 7) return `En ${diffDays} días`;
    if (diffDays > 7) return `En ${Math.round(diffDays / 7)} sem`;
    return fechaStr;
  };

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
                Calendario de Entregas & Vencimientos
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

      {/* Grid Principal: Calendario a la izquierda (6 cols) + Paneles a la derecha (6 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Columna Calendario (6/12) - Celdas Ultra-Compactas */}
        <div className="xl:col-span-6 flex flex-col">
          <div className="ccv-card p-3 sm:p-3.5 shadow-card flex flex-col justify-between">
            {/* Encabezado Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-charcoal-500 uppercase tracking-wider pb-1.5 border-b border-stone-200">
              <div className="text-rose-600">Dom</div>
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div className="text-charcoal-700">Sáb</div>
            </div>

            {/* Cuadrícula de Días Ultra-Compacta */}
            <div className="grid grid-cols-7 gap-1 pt-1.5 flex-1">
              {/* Días del mes anterior (Relleno) */}
              {Array.from({ length: offsetInicial }).map((_, idx) => {
                const diaAnt = diasMesAnterior - offsetInicial + idx + 1;
                return (
                  <div
                    key={`prev-offset-${idx}`}
                    className="h-[30px] sm:h-[34px] p-0.5 sm:p-1 rounded-md bg-stone-50/40 border border-dashed border-stone-200/50 opacity-25 select-none flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-bold text-stone-400">{diaAnt}</span>
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
                    className={`h-[30px] sm:h-[34px] p-0.5 sm:p-1 rounded-md border flex flex-col justify-between transition-all cursor-pointer group relative ${
                      esSeleccionado
                        ? 'bg-primary-50/95 border-primary-600 ring-2 ring-primary-500 shadow-sm scale-[1.02] z-10'
                        : esHoy
                        ? 'bg-amber-50/50 border-amber-400 ring-1 ring-amber-400 hover:border-amber-500'
                        : 'bg-white border-stone-200/90 hover:border-primary-300 hover:bg-stone-50/60 hover:shadow-2xs'
                    }`}
                    title={`Día ${dia} - ${tareasDelDia.length} ${tareasDelDia.length === 1 ? 'entrega' : 'entregas'} (Clic para ver en el panel derecho)`}
                  >
                    {/* Top Row: Solo el Número de Día */}
                    <div className="flex items-center justify-between leading-none">
                      <span
                        className={`text-[10px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors ${
                          esSeleccionado
                            ? 'bg-primary-700 text-white shadow-2xs'
                            : esHoy
                            ? 'bg-amber-500 text-white font-black shadow-2xs'
                            : 'text-charcoal-800 group-hover:text-primary-700'
                        }`}
                      >
                        {dia}
                      </span>
                      {esHoy && (
                        <span className="text-[6.5px] font-black text-amber-800 uppercase tracking-tighter bg-amber-100 px-0.5 py-0.1 rounded leading-none border border-amber-200">
                          Hoy
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Puntos de Color + Contador Naranja con TAREAS */}
                    <div className="flex items-center justify-between gap-0.5 leading-none">
                      {tareasDelDia.length > 0 ? (
                        <>
                          {/* Puntos circulares de color según estado */}
                          <div className="flex items-center gap-0.5 overflow-hidden">
                            {tareasDelDia.slice(0, 2).map((t, idx) => {
                              const dotColor =
                                t.estado === 'Completada' ? 'bg-emerald-500' :
                                t.estado === 'En Revisión' ? 'bg-amber-500' :
                                t.estado === 'En Proceso' ? 'bg-blue-500' :
                                'bg-rose-500';

                              return (
                                <span
                                  key={idx}
                                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dotColor} shadow-2xs shrink-0 ring-1 ring-white`}
                                  title={`${t.titulo} (${t.estado})`}
                                />
                              );
                            })}
                            {tareasDelDia.length > 2 && (
                              <span className="text-[6.5px] font-black text-charcoal-500 leading-none">
                                +{tareasDelDia.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Contador Naranja Destacado con palabra TAREAS */}
                          <span
                            className={`text-[7.5px] sm:text-[8px] font-black px-0.5 sm:px-1 py-0.1 rounded leading-none flex items-center gap-0.5 border shadow-2xs ${
                              esSeleccionado
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                            title={`${tareasDelDia.length} ${tareasDelDia.length === 1 ? 'tarea' : 'tareas'}`}
                          >
                            <span className="font-extrabold">{tareasDelDia.length}</span>
                            <span className="text-[6.5px] font-black tracking-tighter uppercase opacity-90 hidden sm:inline">
                              TAR
                            </span>
                          </span>
                        </>
                      ) : (
                        <span className="h-1" />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Celdas del mes siguiente */}
              {Array.from({ length: totalCeldas - (offsetInicial + diasMes.length) }).map((_, idx) => {
                const diaSig = idx + 1;
                return (
                  <div
                    key={`next-offset-${idx}`}
                    className="h-[30px] sm:h-[34px] p-0.5 sm:p-1 rounded-md bg-stone-50/40 border border-dashed border-stone-200/50 opacity-25 select-none flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-bold text-stone-400">{diaSig}</span>
                  </div>
                );
              })}
            </div>

            {/* Leyenda de estados */}
            <div className="mt-2.5 pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-charcoal-600">Convenciones:</span>
                <span className="flex items-center gap-1 text-charcoal-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Completada
                </span>
                <span className="flex items-center gap-1 text-charcoal-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  En Revisión
                </span>
                <span className="flex items-center gap-1 text-charcoal-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  En Proceso
                </span>
                <span className="flex items-center gap-1 text-charcoal-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  Pendiente
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-charcoal-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Hoy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha (6/12) - Adaptada con scroll interno fluido */}
        <div className="xl:col-span-6 flex flex-col gap-3.5">
          {/* Panel Superior: Entregas del Día Seleccionado con scroll interno */}
          <div className="ccv-card p-3.5 sm:p-4 flex flex-col justify-between border-t-4 border-t-primary-600 shadow-card h-[240px] overflow-hidden">
            <div className="flex flex-col min-h-0 flex-1">
              {/* Header del Panel Lateral */}
              <div className="pb-1.5 border-b border-stone-200 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-primary-600" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-primary-700">
                      Entregas del Día
                    </span>
                    {esHoySeleccionado && (
                      <span className="bg-amber-500 text-white text-[8.5px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                        HOY
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] font-black px-2 py-0.2 rounded-full bg-primary-100 text-primary-900 border border-primary-200">
                    {tareasDelDiaSeleccionado.length} {tareasDelDiaSeleccionado.length === 1 ? 'tarea' : 'tareas'}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-charcoal-900 mt-0.5 truncate">
                  {textoFechaSeleccionada}
                </h3>
              </div>

              {/* Filtro rápido */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 shrink-0 text-xs">
                <Filter className="w-2.5 h-2.5 text-charcoal-400 shrink-0" />
                {[
                  { id: 'todos', label: 'Todas' },
                  { id: 'Pendiente', label: 'Pendientes' },
                  { id: 'En Proceso', label: 'En Proceso' },
                  { id: 'Completada', label: 'Completadas' },
                ].map(opc => (
                  <button
                    key={opc.id}
                    onClick={() => setFiltroEstado(opc.id)}
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold transition-all whitespace-nowrap ${
                      filtroEstado === opc.id
                        ? 'bg-charcoal-800 text-white shadow-2xs'
                        : 'bg-stone-100 text-charcoal-600 hover:bg-stone-200'
                    }`}
                  >
                    {opc.label}
                  </button>
                ))}
              </div>

              {/* Listado de Tareas con scroll interno */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-1.5 mt-1">
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
                        className="p-2 sm:p-2.5 rounded-lg border border-stone-200 bg-white hover:border-primary-400 hover:shadow-2xs transition-all cursor-pointer group space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded border ${badgeClass}`}>
                              {tarea.estado}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-charcoal-800 border border-stone-200 font-mono">
                              ⏰ {tarea.hora_vencimiento || '18:00'}
                            </span>
                          </div>
                          <span className="text-[9.5px] font-bold text-charcoal-400">
                            {tarea.tipo_tarea}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-charcoal-900 group-hover:text-primary-700 transition-colors line-clamp-1 leading-tight">
                          {tarea.titulo}
                        </h4>
                        <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-[9.5px] text-charcoal-600">
                          <span className="truncate max-w-[150px] text-charcoal-500 font-medium">
                            {tarea.curso_nombre || tarea.proyecto_nombre || 'General'}
                          </span>
                          <span className="text-primary-700 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                            Ver <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 px-2 text-center rounded-lg border border-dashed border-stone-200 bg-cream-50/50 space-y-1">
                    <Clock className="w-4 h-4 text-primary-600 mx-auto" />
                    <p className="text-xs font-bold text-charcoal-800">Sin entregas</p>
                    <p className="text-[9.5px] text-charcoal-500">No se registran vencimientos para la fecha seleccionada.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[9.5px] text-charcoal-500 shrink-0">
              <span>{tareasDelDiaSeleccionado.length} entregas registradas</span>
              <span className="text-primary-600 font-bold">PrismaLab</span>
            </div>
          </div>

          {/* Panel Inferior: Próximas Tareas con scroll interno */}
          <div className="ccv-card p-3.5 sm:p-4 flex flex-col justify-between border-t-4 border-t-accent-500 shadow-card h-[240px] overflow-hidden">
            <div className="flex flex-col min-h-0 flex-1">
              {/* Header */}
              <div className="pb-1.5 border-b border-stone-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-accent-600" />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-accent-700 block">
                      Próximas Tareas
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-charcoal-900 leading-tight">
                      Entregas en Calendario
                    </h3>
                  </div>
                </div>
                <span className="text-[9.5px] font-black px-2 py-0.2 rounded-full bg-accent-100 text-accent-900 border border-accent-200">
                  {proximasTareas.length} pendientes
                </span>
              </div>

              {/* Lista con scroll interno */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-1.5 mt-1.5">
                {proximasTareas.length > 0 ? (
                  proximasTareas.map((tarea) => {
                    const badgeClass =
                      tarea.estado === 'En Revisión' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      tarea.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-rose-100 text-rose-800 border-rose-300';
                    const tiempoRestante = formatDiasRestantes(tarea.fecha_vencimiento || '');
                    return (
                      <div
                        key={tarea.id}
                        onClick={() => onSelectTask(tarea)}
                        className="p-2 sm:p-2.5 rounded-lg border border-stone-200 bg-white hover:border-accent-400 hover:shadow-2xs transition-all cursor-pointer group space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded border ${badgeClass}`}>
                              {tarea.estado}
                            </span>
                            <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-charcoal-700 border border-stone-200 font-mono">
                              📅 {tarea.fecha_vencimiento} • ⏰ {tarea.hora_vencimiento || '18:00'}
                            </span>
                          </div>
                          <span className={`text-[9.5px] font-extrabold ${
                            tiempoRestante.includes('hoy') ? 'text-rose-600 animate-pulse font-black' :
                            tiempoRestante.includes('Mañana') ? 'text-amber-600 font-black' : 'text-charcoal-500'
                          }`}>
                            {tiempoRestante}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-charcoal-900 group-hover:text-accent-700 transition-colors line-clamp-1 leading-tight">
                          {tarea.titulo}
                        </h4>
                        <div className="flex items-center justify-between text-[9.5px] text-charcoal-500 pt-1 border-t border-stone-100">
                          <span className="truncate max-w-[150px] font-medium">{tarea.curso_nombre || tarea.proyecto_nombre || 'General'}</span>
                          <span className="text-accent-700 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                            Ver <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 px-2 text-center rounded-lg border border-dashed border-stone-200 bg-cream-50/50 space-y-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-charcoal-800">¡Al día!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[9.5px] text-charcoal-400 font-medium shrink-0">
              <span>Cronológico (Hora Desc.)</span>
              <span className="text-accent-700 font-bold">Producción</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
