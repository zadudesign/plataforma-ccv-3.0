'use client';

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  Filter, 
  Plus, 
  User, 
  CheckCircle2, 
  BarChart3, 
  Search,
  Award,
  Layers,
  ArrowUpRight,
  Target,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TareaCCV, Usuario } from '@/types';
import { LogHoursModal } from './LogHoursModal';

interface ProductivityDashboardProps {
  tareas: TareaCCV[];
  usuarios: Usuario[];
  usuarioActual: Usuario | null;
  onUpdateTaskHours: (tareaId: string, horasAñadir: number) => void;
  onSelectTask?: (tarea: TareaCCV) => void;
}

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({
  tareas,
  usuarios,
  usuarioActual,
  onUpdateTaskHours,
  onSelectTask,
}) => {
  // Pestaña Activa: 'horas' (Panel de Esfuerzo) vs 'entregas' (Dumbbell Plot Control de Entregas)
  const [pestanaActiva, setPestanaActiva] = useState<'horas' | 'entregas'>('horas');

  // Filtros Generales
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);

  // Filtros específicos para el Dumbbell Plot de Entregas
  const [filtroRangoEntregas, setFiltroRangoEntregas] = useState<'este_mes' | 'trimestre' | 'historico'>('este_mes');
  const [filtroPuntualidad, setFiltroPuntualidad] = useState<'todas' | 'a_tiempo' | 'con_retraso' | 'pendientes_atrasadas'>('todas');

  const hoyFechaStr = '2026-08-07'; // Fecha del sistema

  // Extraer roles de destino únicos disponibles en las tareas
  const rolesDestinoDisponibles = useMemo(() => {
    const rolesSet = new Set<string>(['Diseño', 'Multimedia', 'Soporte', 'Docente', 'Par Evaluador']);
    tareas.forEach(t => {
      if (t.rol_destino) rolesSet.add(t.rol_destino);
    });
    return Array.from(rolesSet);
  }, [tareas]);

  // Filtrado de tareas general
  const tareasFiltradas = useMemo(() => {
    return tareas.filter(t => {
      // Filtro por Rol Destino
      if (filtroRol !== 'todos' && t.rol_destino !== filtroRol) {
        return false;
      }
      
      // Filtro por Responsable / Usuario
      if (filtroUsuario !== 'todos' && t.responsable_id !== filtroUsuario) {
        return false;
      }

      // Filtro por Estado de Tarea
      if (filtroEstado !== 'todos' && t.estado !== filtroEstado) {
        return false;
      }

      // Búsqueda de texto
      if (busqueda.trim() !== '') {
        const term = busqueda.toLowerCase();
        const coincideTitulo = t.titulo.toLowerCase().includes(term);
        const coincideCurso = t.curso_nombre?.toLowerCase().includes(term);
        const coincideProyecto = t.proyecto_nombre?.toLowerCase().includes(term);
        const coincideResp = t.responsable_nombre?.toLowerCase().includes(term);
        if (!coincideTitulo && !coincideCurso && !coincideProyecto && !coincideResp) return false;
      }

      return true;
    });
  }, [tareas, filtroRol, filtroUsuario, filtroEstado, busqueda]);

  // Métricas de la Pestaña 1 (Horas)
  const totalHorasInvertidas = useMemo(() => {
    return tareasFiltradas.reduce((acc, t) => acc + (t.tiempo_invertido || 0), 0);
  }, [tareasFiltradas]);

  const totalHorasEstimadas = useMemo(() => {
    return tareasFiltradas.reduce((acc, t) => acc + (t.tiempo_estimado || 0), 0);
  }, [tareasFiltradas]);

  const porcentajeEficiencia = totalHorasEstimadas > 0 
    ? Math.round((totalHorasInvertidas / totalHorasEstimadas) * 100) 
    : 100;

  // Agrupamiento por fecha para el gráfico de Horas
  const datosGraficoDiario = useMemo(() => {
    const mapaFechas: Record<string, { fecha: string; totalHoras: number; conteoTareas: number }> = {};

    tareasFiltradas.forEach(t => {
      const fechaClave = t.fecha_completada || t.fecha_vencimiento || (t.created_at ? t.created_at.split('T')[0] : '2026-08-07');
      const horas = t.tiempo_invertido || 0;

      if (!mapaFechas[fechaClave]) {
        mapaFechas[fechaClave] = {
          fecha: fechaClave,
          totalHoras: 0,
          conteoTareas: 0
        };
      }
      mapaFechas[fechaClave].totalHoras += horas;
      mapaFechas[fechaClave].conteoTareas += 1;
    });

    const ordenado = Object.values(mapaFechas).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const maxHoras = Math.max(...ordenado.map(d => d.totalHoras), 1);

    return { datos: ordenado, maxHoras };
  }, [tareasFiltradas]);

  // Desglose de Horas por Rol Destino
  const desglosePorRol = useMemo(() => {
    const mapa: Record<string, { rol: string; totalInvertido: number; totalEstimado: number; conteoTareas: number }> = {};
    
    tareasFiltradas.forEach(t => {
      const rolKey = t.rol_destino || 'General';
      if (!mapa[rolKey]) {
        mapa[rolKey] = { rol: rolKey, totalInvertido: 0, totalEstimado: 0, conteoTareas: 0 };
      }
      mapa[rolKey].totalInvertido += (t.tiempo_invertido || 0);
      mapa[rolKey].totalEstimado += (t.tiempo_estimado || 0);
      mapa[rolKey].conteoTareas += 1;
    });

    return Object.values(mapa).sort((a, b) => b.totalInvertido - a.totalInvertido);
  }, [tareasFiltradas]);

  const rolMasActivo = desglosePorRol[0]?.rol || 'N/A';

  // =========================================================================
  // LÓGICA DEL DUMBBELL PLOT (PESTAÑA 2: CONTROL DE ENTREGAS Y PUNTUALIDAD)
  // =========================================================================

  const tareasDumbbell = useMemo(() => {
    return tareasFiltradas.map(t => {
      const fechaVenc = t.fecha_vencimiento || '2026-08-01';
      const esCompletada = t.estado === 'Completada' && !!t.fecha_completada;
      const fechaReal = esCompletada ? t.fecha_completada! : hoyFechaStr;

      // Calcular diferencia en días (fechaReal - fechaVenc)
      const dVenc = new Date(fechaVenc + 'T00:00:00');
      const dReal = new Date(fechaReal + 'T00:00:00');
      const diffTiempo = dReal.getTime() - dVenc.getTime();
      const diffDias = Math.round(diffTiempo / (1000 * 3600 * 24));

      // Determinar Estado de Puntualidad
      let tipoPuntualidad: 'a_tiempo' | 'con_retraso' | 'pendiente_atrasada' | 'pendiente_en_plazo';
      
      if (esCompletada) {
        if (diffDias <= 0) {
          tipoPuntualidad = 'a_tiempo';
        } else {
          tipoPuntualidad = 'con_retraso';
        }
      } else {
        if (diffDias > 0) {
          tipoPuntualidad = 'pendiente_atrasada';
        } else {
          tipoPuntualidad = 'pendiente_en_plazo';
        }
      }

      return {
        ...t,
        fechaVenc,
        fechaReal,
        esCompletada,
        diffDias,
        tipoPuntualidad
      };
    }).filter(item => {
      // Filtrar por Rango de Tiempo si aplica
      if (filtroRangoEntregas === 'este_mes') {
        return item.fechaVenc.startsWith('2026-08') || item.fechaReal.startsWith('2026-08');
      }
      if (filtroRangoEntregas === 'trimestre') {
        return item.fechaVenc >= '2026-06-01' || item.fechaReal >= '2026-06-01';
      }
      // 'historico' incluye todas
      return true;
    }).filter(item => {
      // Filtrar por estado de puntualidad
      if (filtroPuntualidad === 'a_tiempo') return item.tipoPuntualidad === 'a_tiempo';
      if (filtroPuntualidad === 'con_retraso') return item.tipoPuntualidad === 'con_retraso';
      if (filtroPuntualidad === 'pendientes_atrasadas') return item.tipoPuntualidad === 'pendiente_atrasada';
      return true;
    });
  }, [tareasFiltradas, filtroRangoEntregas, filtroPuntualidad]);

  // Métricas del Dumbbell Plot
  const metricasEntregas = useMemo(() => {
    const total = tareasDumbbell.length;
    const aTiempo = tareasDumbbell.filter(t => t.tipoPuntualidad === 'a_tiempo').length;
    const conRetraso = tareasDumbbell.filter(t => t.tipoPuntualidad === 'con_retraso').length;
    const pendientesAtrasadas = tareasDumbbell.filter(t => t.tipoPuntualidad === 'pendiente_atrasada').length;
    const porcentajePuntualidad = total > 0 ? Math.round((aTiempo / total) * 100) : 0;

    // Promedio de días de retraso en tareas atrasadas
    const tareasAtrasadas = tareasDumbbell.filter(t => t.diffDias > 0);
    const sumaDiasRetraso = tareasAtrasadas.reduce((acc, t) => acc + t.diffDias, 0);
    const promedioRetrasoDias = tareasAtrasadas.length > 0 ? (sumaDiasRetraso / tareasAtrasadas.length).toFixed(1) : '0';

    return {
      total,
      aTiempo,
      conRetraso,
      pendientesAtrasadas,
      porcentajePuntualidad,
      promedioRetrasoDias
    };
  }, [tareasDumbbell]);

  // Ranking de Demoras por Rol Destino (para responder a qué área/rol tiene más retrasos)
  const rankingDemorasPorRol = useMemo(() => {
    const mapa: Record<string, { rol: string; total: number; retrasadas: number; sumaDiasRetraso: number }> = {};

    tareasDumbbell.forEach(t => {
      const r = t.rol_destino || 'General';
      if (!mapa[r]) {
        mapa[r] = { rol: r, total: 0, retrasadas: 0, sumaDiasRetraso: 0 };
      }
      mapa[r].total += 1;
      if (t.diffDias > 0) {
        mapa[r].retrasadas += 1;
        mapa[r].sumaDiasRetraso += t.diffDias;
      }
    });

    return Object.values(mapa).map(item => ({
      ...item,
      pctRetraso: item.total > 0 ? Math.round((item.retrasadas / item.total) * 100) : 0,
      promedioDias: item.retrasadas > 0 ? (item.sumaDiasRetraso / item.retrasadas).toFixed(1) : '0'
    })).sort((a, b) => b.pctRetraso - a.pctRetraso);
  }, [tareasDumbbell]);

  // Rango global de fechas para la escala del Dumbbell Plot
  const escalaFechas = useMemo(() => {
    if (tareasDumbbell.length === 0) return { fechaMin: '2026-07-15', fechaMax: '2026-08-20', minTimestamp: 0, maxTimestamp: 1, rangoTotal: 1 };
    
    let minTime = Infinity;
    let maxTime = -Infinity;

    tareasDumbbell.forEach(t => {
      const t1 = new Date(t.fechaVenc + 'T00:00:00').getTime();
      const t2 = new Date(t.fechaReal + 'T00:00:00').getTime();
      if (t1 < minTime) minTime = t1;
      if (t2 < minTime) minTime = t2;
      if (t1 > maxTime) maxTime = t1;
      if (t2 > maxTime) maxTime = t2;
    });

    // Agregar margen de 2 días a los lados
    minTime -= 2 * 24 * 3600 * 1000;
    maxTime += 3 * 24 * 3600 * 1000;

    return {
      fechaMin: new Date(minTime).toISOString().split('T')[0],
      fechaMax: new Date(maxTime).toISOString().split('T')[0],
      minTimestamp: minTime,
      maxTimestamp: maxTime,
      rangoTotal: Math.max(maxTime - minTime, 1)
    };
  }, [tareasDumbbell]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header Banner principal con Selección de Pestañas estilo Admin RBAC */}
      <div className="ccv-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-sage-600">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-sage-600" />
              Panel de Productividad y Control de Entregas
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
              Métricas CCV
            </span>
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            Análisis consolidado del tiempo invertido y auditoría de puntualidad de entregas mediante Dumbbell Plot.
          </p>
        </div>

        {/* Tab Selection con el estilo idéntico a Administración RBAC */}
        <div className="flex items-center gap-1.5 p-1.5 bg-cream-100 rounded-full border border-stone-200 text-xs font-bold flex-wrap shrink-0">
          <button
            onClick={() => setPestanaActiva('horas')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
              pestanaActiva === 'horas' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Horas e Imputación
          </button>

          <button
            onClick={() => setPestanaActiva('entregas')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
              pestanaActiva === 'entregas' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Target className="w-4 h-4" />
            Control de Entregas (Dumbbell)
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PESTAÑA 1: HORAS E IMPUTACIÓN DE ESFUERZO                             */}
      {/* ===================================================================== */}
      {pestanaActiva === 'horas' && (
        <div className="space-y-6">
          {/* Control Bar & Filters */}
          <div className="ccv-card p-4 bg-white space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center justify-between lg:justify-start gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700">
                  <Filter className="w-4 h-4 text-sage-600" />
                  <span>Filtros de Horas:</span>
                </div>

                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Imputar Tiempo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <select
                    value={filtroRol}
                    onChange={e => setFiltroRol(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="todos">Todos los Roles Destino</option>
                    {rolesDestinoDisponibles.map(r => (
                      <option key={r} value={r}>Rol: {r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filtroUsuario}
                    onChange={e => setFiltroUsuario(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="todos">Todos los Responsables</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre_completo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="Completada">Completadas</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Pendiente">Pendientes</option>
                  </select>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar tarea o curso..."
                    className="w-full pl-8 pr-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                  <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="ccv-card p-5 bg-gradient-to-br from-sage-900 to-charcoal-900 text-white space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-sage-200 uppercase tracking-wider">Tiempo Invertido Total</span>
                <div className="w-8 h-8 rounded-xl bg-sage-500/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-sage-300" />
                </div>
              </div>
              <div className="text-3xl font-black">{totalHorasInvertidas.toFixed(1)} <span className="text-sm font-normal text-sage-300">hrs</span></div>
              <p className="text-[11px] text-sage-200/80 flex items-center gap-1 pt-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-sage-400" /> Acumulado de tareas filtradas
              </p>
            </div>

            <div className="ccv-card p-5 bg-white space-y-2 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Tiempo Estimado</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-charcoal-900">{totalHorasEstimadas.toFixed(1)} <span className="text-sm font-semibold text-charcoal-500">hrs</span></div>
              <p className="text-[11px] text-charcoal-500">Proyección planificada de carga</p>
            </div>

            <div className="ccv-card p-5 bg-white space-y-2 border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Eficiencia Ejecución</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-charcoal-900">{porcentajeEficiencia}%</div>
              <p className="text-[11px] text-charcoal-500">Invertido respecto al tiempo estimado</p>
            </div>

            <div className="ccv-card p-5 bg-white space-y-2 border-l-4 border-l-purple-500">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Rol con Más Carga</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-charcoal-900 truncate">{rolMasActivo}</div>
              <p className="text-[11px] text-charcoal-500">Mayor acumulado de tiempo invertido</p>
            </div>
          </div>

          {/* Gráfico de Productividad */}
          <div className="ccv-card p-6 bg-white space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sage-600" />
                  Distribución de Horas Invertidas por Fecha
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Consolidado de tiempo invertido (`tiempo_invertido`) extraído directamente de la tabla `tareas`.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sage-800 bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
                  {tareasFiltradas.length} Tareas en Vista
                </span>
              </div>
            </div>

            {datosGraficoDiario.datos.length === 0 ? (
              <div className="p-12 text-center bg-cream-50/50 rounded-2xl border border-dashed border-stone-200">
                <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-charcoal-600">No se encontraron tareas con tiempo invertido en los filtros aplicados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2 border-b border-stone-200">
                  {datosGraficoDiario.datos.map((item) => {
                    const pctAltura = Math.round((item.totalHoras / datosGraficoDiario.maxHoras) * 100);
                    const fechaFormateada = new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    });

                    return (
                      <div key={item.fecha} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-charcoal-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-20">
                          <div>{fechaFormateada}</div>
                          <div className="text-sage-400 font-extrabold">{item.totalHoras.toFixed(1)} hrs ({item.conteoTareas} tareas)</div>
                        </div>

                        <span className="text-[11px] font-extrabold text-sage-700 mb-1">
                          {item.totalHoras.toFixed(1)}h
                        </span>

                        <div className="w-full max-w-[48px] bg-stone-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                          <div 
                            className="bg-gradient-to-t from-sage-700 via-sage-500 to-amber-400 w-full rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                            style={{ height: `${Math.max(pctAltura, 8)}%` }}
                          />
                        </div>

                        <span className="text-[10px] font-bold text-charcoal-500 mt-2 truncate w-full text-center capitalize">
                          {fechaFormateada}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-3">
                    Consolidado de Horas por Rol Destino:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {desglosePorRol.map(item => {
                      const pct = totalHorasInvertidas > 0 ? Math.round((item.totalInvertido / totalHorasInvertidas) * 100) : 0;
                      return (
                        <div key={item.rol} className="p-3 bg-cream-50 rounded-2xl border border-stone-200 space-y-1">
                          <span className="text-[11px] font-bold text-charcoal-600 truncate block">{item.rol}</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-base font-black text-charcoal-900">{item.totalInvertido.toFixed(1)}h</span>
                            <span className="text-[10px] font-bold text-sage-700">{pct}%</span>
                          </div>
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-sage-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-charcoal-500 block pt-0.5">{item.conteoTareas} tareas asignadas</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabla Directa de Tareas e Imputación */}
          <div className="ccv-card overflow-hidden bg-white">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900">Control Directo de Tareas e Imputación de Tiempo</h3>
                <p className="text-xs text-charcoal-500">Visualiza y actualiza las horas invertidas directamente en el registro de cada tarea.</p>
              </div>
              <span className="text-xs font-bold text-charcoal-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                {tareasFiltradas.length} Tareas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-black uppercase text-charcoal-600 tracking-wider">
                    <th className="p-4">Tarea / Contexto</th>
                    <th className="p-4">Rol Destino</th>
                    <th className="p-4">Responsable</th>
                    <th className="p-4">Progreso Horas</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs font-medium text-charcoal-800">
                  {tareasFiltradas.map((tarea) => {
                    const inv = tarea.tiempo_invertido || 0;
                    const est = tarea.tiempo_estimado || 1;
                    const pctHoras = Math.min(Math.round((inv / est) * 100), 100);

                    return (
                      <tr key={tarea.id} className="hover:bg-cream-50/50 transition-colors">
                        <td className="p-4">
                          <div 
                            onClick={() => onSelectTask && onSelectTask(tarea)}
                            className="font-bold text-charcoal-900 hover:text-sage-700 cursor-pointer max-w-xs truncate"
                          >
                            {tarea.titulo}
                          </div>
                          <div className="text-[11px] text-charcoal-500 truncate">
                            {tarea.curso_nombre || tarea.proyecto_nombre || 'General CCV'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-sage-100 text-sage-800 border border-sage-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            {tarea.rol_destino || 'General'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-sage-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {tarea.responsable_nombre?.charAt(0) || 'U'}
                            </div>
                            <span className="truncate">{tarea.responsable_nombre || 'Sin asignar'}</span>
                          </div>
                        </td>
                        <td className="p-4 w-48">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-amber-800">{inv}h invertidas</span>
                              <span className="text-charcoal-500">de {est}h</span>
                            </div>
                            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${pctHoras}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            tarea.estado === 'Completada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            tarea.estado === 'En Proceso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            tarea.estado === 'En Revisión' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-stone-100 text-charcoal-600 border-stone-200'
                          }`}>
                            {tarea.estado}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setIsLogModalOpen(true)}
                            className="px-3 py-1.5 bg-sage-50 text-sage-700 border border-sage-200 rounded-xl hover:bg-sage-600 hover:text-white font-bold text-[11px] transition-all"
                          >
                            + Imputar Horas
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 2: CONTROL DE ENTREGAS CON DUMBBELL PLOT (GRÁFICO DE MANCUERNAS)*/}
      {/* ===================================================================== */}
      {pestanaActiva === 'entregas' && (
        <div className="space-y-6">
          {/* Barra de Filtros Específicos para Entregas */}
          <div className="ccv-card p-4 bg-white space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700">
                <Filter className="w-4 h-4 text-sage-600" />
                <span>Filtros de Control de Entregas:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Filtro Rango de Tiempo (Por defecto Este Mes, con opción Histórica para ver todas) */}
                <div>
                  <label className="block text-[10px] font-bold text-charcoal-500 uppercase mb-0.5">Periodo Temporal</label>
                  <select
                    value={filtroRangoEntregas}
                    onChange={e => setFiltroRangoEntregas(e.target.value as any)}
                    className="w-full px-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="este_mes">Este Mes (Agosto 2026) — Por defecto</option>
                    <option value="trimestre">Último Trimestre</option>
                    <option value="historico">Todas las Tareas (Histórico Completo para análisis de demoras)</option>
                  </select>
                </div>

                {/* Filtro Estado de Puntualidad */}
                <div>
                  <label className="block text-[10px] font-bold text-charcoal-500 uppercase mb-0.5">Estado de Puntualidad</label>
                  <select
                    value={filtroPuntualidad}
                    onChange={e => setFiltroPuntualidad(e.target.value as any)}
                    className="w-full px-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="todas">Todas las Entregas y Pendientes</option>
                    <option value="a_tiempo">🟢 Entregadas a Tiempo / Anticipadas</option>
                    <option value="con_retraso">🔴 Entregadas con Retraso</option>
                    <option value="pendientes_atrasadas">🟠 Pendientes Vencidas (Con Retraso Acumulado)</option>
                  </select>
                </div>

                {/* Filtro por Rol Destino */}
                <div>
                  <label className="block text-[10px] font-bold text-charcoal-500 uppercase mb-0.5">Rol Destino</label>
                  <select
                    value={filtroRol}
                    onChange={e => setFiltroRol(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="todos">Todos los Roles Destino</option>
                    {rolesDestinoDisponibles.map(r => (
                      <option key={r} value={r}>Rol: {r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas KPI de Entregas y Puntualidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Porcentaje de Puntualidad */}
            <div className="ccv-card p-5 bg-gradient-to-br from-emerald-900 to-charcoal-900 text-white space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Puntualidad Global</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                </div>
              </div>
              <div className="text-3xl font-black">{metricasEntregas.porcentajePuntualidad}%</div>
              <p className="text-[11px] text-emerald-200/80">Entregadas a tiempo o sin retraso</p>
            </div>

            {/* Card 2: Entregas A Tiempo */}
            <div className="ccv-card p-5 bg-white space-y-2 border-l-4 border-l-emerald-500">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Entregas a Tiempo</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-700">{metricasEntregas.aTiempo}</div>
              <p className="text-[11px] text-charcoal-500">Cumplieron con la fecha límite</p>
            </div>

            {/* Card 3: Entregas con Retraso */}
            <div className="ccv-card p-5 bg-white space-y-2 border-l-4 border-l-coral-500">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Entregadas con Retraso</span>
                <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-coral-700">{metricasEntregas.conRetraso}</div>
              <p className="text-[11px] text-charcoal-500">Promedio retraso: <strong>{metricasEntregas.promedioRetrasoDias} días</strong></p>
            </div>

            {/* Card 4: Pendientes Atrasadas */}
            <div className="ccv-card p-5 bg-white space-y-2 border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Pendientes Vencidas</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-800">{metricasEntregas.pendientesAtrasadas}</div>
              <p className="text-[11px] text-charcoal-500">En proceso con fecha límite superada</p>
            </div>
          </div>

          {/* Gráfico de Mancuernas (Dumbbell Plot) Principal */}
          <div className="ccv-card p-6 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-sage-600" />
                  Dumbbell Plot (Comparativa Fecha Vencimiento vs Fecha Real/Completada)
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Cada mancuerna compara el punto de **Vencimiento Planificado (Punto Azul)** con la **Entrega Real (Punto Verde/Rojo)** para evaluar la puntualidad.
                </p>
              </div>

              {/* Leyenda explicativa del Dumbbell */}
              <div className="flex items-center gap-3 text-[11px] font-bold shrink-0 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-700"></div>
                  <span>Vencimiento Planificado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></div>
                  <span>A Tiempo</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-coral-500 border border-coral-600"></div>
                  <span>Con Retraso</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600"></div>
                  <span>Pendiente Atrasada</span>
                </div>
              </div>
            </div>

            {tareasDumbbell.length === 0 ? (
              <div className="p-12 text-center bg-cream-50/50 rounded-2xl border border-dashed border-stone-200">
                <Target className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-charcoal-600">No hay tareas que coincidan con los filtros de entregas seleccionados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lista de Filas del Dumbbell Plot */}
                <div className="space-y-4 pt-2">
                  {tareasDumbbell.map((tarea) => {
                    const tVenc = new Date(tarea.fechaVenc + 'T00:00:00').getTime();
                    const tReal = new Date(tarea.fechaReal + 'T00:00:00').getTime();

                    // Calcular posiciones porcentuales relativas en la escala de tiempo
                    const posVencPct = Math.min(Math.max(Math.round(((tVenc - escalaFechas.minTimestamp) / escalaFechas.rangoTotal) * 100), 2), 98);
                    const posRealPct = Math.min(Math.max(Math.round(((tReal - escalaFechas.minTimestamp) / escalaFechas.rangoTotal) * 100), 2), 98);

                    const posMin = Math.min(posVencPct, posRealPct);
                    const posMax = Math.max(posVencPct, posRealPct);
                    const anchoBarraPct = Math.max(posMax - posMin, 2);

                    // Estilo según estado de puntualidad
                    const esCompletada = tarea.esCompletada;
                    const esATiempo = tarea.tipoPuntualidad === 'a_tiempo';
                    const esRetraso = tarea.tipoPuntualidad === 'con_retraso';
                    const esPendienteAtrasada = tarea.tipoPuntualidad === 'pendiente_atrasada';

                    const colorLinea = esATiempo ? 'bg-emerald-500' : esRetraso ? 'bg-coral-500' : 'bg-amber-500';
                    const colorPuntoReal = esATiempo ? 'bg-emerald-500 border-emerald-600' : esRetraso ? 'bg-coral-500 border-coral-600' : 'bg-amber-500 border-amber-600';

                    return (
                      <div key={tarea.id} className="p-4 bg-cream-50/60 rounded-2xl border border-stone-200 hover:border-sage-400 hover:bg-white transition-all space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-charcoal-900 text-xs sm:text-sm">{tarea.titulo}</h4>
                              <span className="bg-sage-100 text-sage-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-sage-200">
                                {tarea.rol_destino || 'General'}
                              </span>
                            </div>
                            <p className="text-[11px] text-charcoal-500">
                              {tarea.curso_nombre || tarea.proyecto_nombre || 'General CCV'} • Responsable: <strong className="text-charcoal-700">{tarea.responsable_nombre || 'Sin Asignar'}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Badges de Resultado de Puntualidad */}
                            {esATiempo && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {tarea.diffDias === 0 ? 'Entregado a Tiempo' : `Entregado ${Math.abs(tarea.diffDias)} días antes`}
                              </span>
                            )}
                            {esRetraso && (
                              <span className="bg-coral-50 text-coral-700 border border-coral-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Entregado con {tarea.diffDias} {tarea.diffDias === 1 ? 'día' : 'días'} de retraso
                              </span>
                            )}
                            {esPendienteAtrasada && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Pendiente ({tarea.diffDias} días de atraso)
                              </span>
                            )}
                            {!esCompletada && !esPendienteAtrasada && (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
                                En Plazo (Vence {tarea.fechaVenc})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Barra del Dumbbell Plot Horizontal */}
                        <div className="relative pt-6 pb-4 px-3">
                          {/* Línea base de tiempo */}
                          <div className="w-full bg-stone-200 h-1.5 rounded-full relative">
                            {/* Mancuerna / Conexión entre Vencimiento y Fecha Real */}
                            <div 
                              className={`absolute top-0 h-1.5 ${colorLinea} rounded-full transition-all duration-300 shadow-xs`}
                              style={{ left: `${posMin}%`, width: `${anchoBarraPct}%` }}
                            />

                            {/* Punto A: Fecha de Vencimiento Planificada */}
                            <div 
                              className="absolute -top-2 w-5.5 h-5.5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center -ml-2.5 z-10 cursor-pointer group/dot"
                              style={{ left: `${posVencPct}%` }}
                            >
                              <div className="opacity-0 group-hover/dot:opacity-100 transition-opacity absolute -top-8 bg-blue-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap">
                                Vencimiento: {tarea.fechaVenc}
                              </div>
                            </div>

                            {/* Punto B: Fecha Real de Entrega / Fecha Actual */}
                            <div 
                              className={`absolute -top-2 w-5.5 h-5.5 rounded-full ${colorPuntoReal} border-2 border-white shadow-md flex items-center justify-center -ml-2.5 z-10 cursor-pointer group/dot`}
                              style={{ left: `${posRealPct}%` }}
                            >
                              <div className="opacity-0 group-hover/dot:opacity-100 transition-opacity absolute -top-8 bg-charcoal-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap">
                                {tarea.esCompletada ? `Completada: ${tarea.fechaReal}` : `Estado Hoy: ${tarea.fechaReal}`}
                              </div>
                            </div>
                          </div>

                          {/* Leyendas de fechas debajo de la mancuerna */}
                          <div className="flex justify-between text-[10px] font-semibold text-charcoal-500 pt-2">
                            <span>Vencimiento: <strong className="text-blue-900 font-mono">{tarea.fechaVenc}</strong></span>
                            <span>{tarea.esCompletada ? 'Entrega Real:' : 'Estado a la Fecha:'} <strong className="text-charcoal-900 font-mono">{tarea.fechaReal}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Ranking de Demoras por Rol / Área (Para visualizar qué áreas se demoran más) */}
          <div className="ccv-card p-6 bg-white space-y-4 border-l-4 border-l-coral-500">
            <div>
              <h3 className="text-base font-black text-charcoal-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-coral-600" />
                Análisis de Demoras por Rol Destino
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Ranking de roles y áreas del equipo ordenados por su porcentaje de entregas con retraso.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rankingDemorasPorRol.map((item) => (
                <div key={item.rol} className="p-4 bg-cream-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-charcoal-900 text-xs">{item.rol}</h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.pctRetraso > 30 ? 'bg-coral-100 text-coral-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.pctRetraso}% Retraso
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-charcoal-600">
                    <div className="flex justify-between text-[11px]">
                      <span>Tareas Atrasadas:</span>
                      <strong className="text-coral-700">{item.retrasadas} de {item.total}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Promedio de Desfase:</span>
                      <strong className="text-charcoal-900">{item.promedioDias} días</strong>
                    </div>
                  </div>

                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-coral-500 h-full rounded-full" style={{ width: `${item.pctRetraso}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal para añadir horas a tarea */}
      {isLogModalOpen && (
        <LogHoursModal
          tareas={tareasFiltradas}
          usuarioActual={usuarioActual}
          onClose={() => setIsLogModalOpen(false)}
          onUpdateTaskHours={onUpdateTaskHours}
        />
      )}
    </div>
  );
};
