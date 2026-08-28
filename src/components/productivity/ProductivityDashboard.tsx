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
import { useAuth } from '@/context/AuthContext';
import { LogHoursModal } from './LogHoursModal';

interface ProductivityDashboardProps {
  tareas: TareaCCV[];
  usuarios: Usuario[];
  usuarioActual: Usuario | null;
  onUpdateTaskHours: (tareaId: string, horasAñadir: number, esResponsableSecundario?: boolean, notas?: string) => void;
  onSelectTask?: (tarea: TareaCCV) => void;
}

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({
  tareas,
  usuarios,
  usuarioActual,
  onUpdateTaskHours,
  onSelectTask,
}) => {
  const { roles } = useAuth();

  // Helper para resolver el nombre legible del rol a partir de su ID o nombre directo
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

  // Pestaña Activa: 'horas' (Panel de Esfuerzo) vs 'entregas' (Dumbbell Plot Control de Entregas)
  const [pestanaActiva, setPestanaActiva] = useState<'horas' | 'entregas'>('horas');

  // Filtros Generales
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [modalInitialTaskId, setModalInitialTaskId] = useState<string | undefined>(undefined);
  const [modalInitialIsSecondary, setModalInitialIsSecondary] = useState<boolean>(false);

  const handleOpenImputarModal = (tareaId?: string, isSecondary: boolean = false) => {
    setModalInitialTaskId(tareaId);
    setModalInitialIsSecondary(isSecondary);
    setIsLogModalOpen(true);
  };

  // Filtros específicos para el Dumbbell Plot de Entregas
  const [filtroRangoEntregas, setFiltroRangoEntregas] = useState<'este_mes' | 'trimestre' | 'historico'>('este_mes');
  const [filtroPuntualidad, setFiltroPuntualidad] = useState<'todas' | 'a_tiempo' | 'con_retraso' | 'pendientes_atrasadas'>('todas');

  // Clasificación del Gráfico de Horas: 'dias' (días del mes), 'semanas', 'meses'
  const [tipoAgrupacionHoras, setTipoAgrupacionHoras] = useState<'dias' | 'semanas' | 'meses'>('dias');
  const [mesSeleccionadoHoras, setMesSeleccionadoHoras] = useState<string>('2026-08');

  const hoyFechaStr = '2026-08-07'; // Fecha del sistema

  // Meses disponibles con tareas registradas
  const mesesDisponibles = useMemo(() => {
    const setMeses = new Set<string>(['2026-08', '2026-07', '2026-09']);
    tareas.forEach(t => {
      const f = t.fecha_completada || t.fecha_vencimiento || (t.created_at ? t.created_at.split('T')[0] : null);
      if (f && f.length >= 7) {
        setMeses.add(f.substring(0, 7));
      }
    });
    return Array.from(setMeses).sort((a, b) => b.localeCompare(a));
  }, [tareas]);

  const getNombreMes = (mesStr: string) => {
    const [y, m] = mesStr.split('-').map(Number);
    if (!y || !m) return mesStr;
    const date = new Date(y, m - 1, 1);
    const nombre = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  };

  // Extraer roles de destino únicos disponibles en las tareas (incluyendo roles secundarios)
  const rolesDestinoDisponibles = useMemo(() => {
    const rolesSet = new Set<string>(['Diseño', 'Multimedia', 'Soporte', 'Docente', 'Par Evaluador']);
    tareas.forEach(t => {
      if (t.rol_destino) rolesSet.add(getNombreRol(t.rol_destino));
      if (t.rol_destino_secundario) rolesSet.add(getNombreRol(t.rol_destino_secundario));
    });
    return Array.from(rolesSet);
  }, [tareas, roles, usuarios]);

  // Filtrado de tareas general
  const tareasFiltradas = useMemo(() => {
    return tareas.filter(t => {
      // Filtro por Rol Destino: incluye tareas donde el rol principal O el rol secundario coincidan
      if (filtroRol !== 'todos') {
        const rolP = getNombreRol(t.rol_destino);
        const rolS = (t.responsable_secundario_id || t.responsable_secundario_nombre)
          ? getNombreRol(t.rol_destino_secundario || t.rol_destino)
          : null;

        const coincideP = rolP === filtroRol || t.rol_destino === filtroRol;
        const coincideS = rolS ? (rolS === filtroRol || (t.rol_destino_secundario && t.rol_destino_secundario === filtroRol)) : false;

        if (!coincideP && !coincideS) {
          return false;
        }
      }
      
      // Filtro por Responsable / Usuario
      if (filtroUsuario !== 'todos' && t.responsable_id !== filtroUsuario && t.responsable_secundario_id !== filtroUsuario) {
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
        const coincideResp = t.responsable_nombre?.toLowerCase().includes(term) || t.responsable_secundario_nombre?.toLowerCase().includes(term);
        if (!coincideTitulo && !coincideCurso && !coincideProyecto && !coincideResp) return false;
      }

      return true;
    });
  }, [tareas, filtroRol, filtroUsuario, filtroEstado, busqueda]);

  // Helper para computar las horas invertidas individualizadas según los filtros activos
  const getHorasDeTarea = (t: TareaCCV): number => {
    // Si se filtra por un usuario específico
    if (filtroUsuario !== 'todos') {
      let inv = 0;
      if (t.responsable_id === filtroUsuario) {
        inv += t.tiempo_invertido || 0;
      }
      if (t.responsable_secundario_id === filtroUsuario) {
        inv += t.tiempo_invertido_secundario || 0;
      }
      return inv;
    }

    // Si se filtra por un rol específico
    if (filtroRol !== 'todos') {
      let inv = 0;
      const coincidePrincipal = getNombreRol(t.rol_destino) === filtroRol || t.rol_destino === filtroRol;
      const coincideSecundario = (t.responsable_secundario_id || t.responsable_secundario_nombre) && 
        (getNombreRol(t.rol_destino_secundario || t.rol_destino) === filtroRol || (t.rol_destino_secundario && t.rol_destino_secundario === filtroRol));
      
      if (coincidePrincipal) {
        inv += t.tiempo_invertido || 0;
      }
      if (coincideSecundario) {
        inv += t.tiempo_invertido_secundario || 0;
      }
      return inv;
    }

    // Sin filtro específico (todos): contabilizar ambos responsables por separado y sumarlos al total global
    return (t.tiempo_invertido || 0) + (t.tiempo_invertido_secundario || 0);
  };

  // Métricas de la Pestaña 1 (Horas)
  const totalHorasInvertidas = useMemo(() => {
    return tareasFiltradas.reduce((acc, t) => acc + getHorasDeTarea(t), 0);
  }, [tareasFiltradas, filtroUsuario, filtroRol]);

  const tareasConHorasRegistradas = useMemo(() => {
    return tareasFiltradas.filter(t => (t.tiempo_invertido || 0) + (t.tiempo_invertido_secundario || 0) > 0).length;
  }, [tareasFiltradas]);

  const promedioHorasPorTarea = useMemo(() => {
    return tareasFiltradas.length > 0 ? (totalHorasInvertidas / tareasFiltradas.length).toFixed(1) : '0';
  }, [tareasFiltradas, totalHorasInvertidas]);

  // Agrupamiento dinámico para el gráfico de Horas: por Días del mes, Semanas o Meses
  const datosGraficoHoras = useMemo(() => {
    if (tipoAgrupacionHoras === 'dias') {
      // 1. DÍAS DEL MES SELECCIONADO (Todos los días del mes: 1 al 28/30/31)
      const [y, m] = (mesSeleccionadoHoras || '2026-08').split('-').map(Number);
      const numDias = new Date(y, m, 0).getDate(); // Total de días del mes

      const diasMap: Record<string, { clave: string; etiquetaCorta: string; etiquetaCompleta: string; totalHoras: number; conteoTareas: number; esFinDeSemana: boolean }> = {};
      
      for (let d = 1; d <= numDias; d++) {
        const diaStr = String(d).padStart(2, '0');
        const fechaFull = `${mesSeleccionadoHoras}-${diaStr}`;
        const dateObj = new Date(`${fechaFull}T00:00:00`);
        const diaSemanaNum = dateObj.getDay();
        const nombreDiaCorto = dateObj.toLocaleDateString('es-CO', { weekday: 'short' });
        const nombreMesCorto = dateObj.toLocaleDateString('es-CO', { month: 'short' });
        
        diasMap[fechaFull] = {
          clave: fechaFull,
          etiquetaCorta: `${d}`,
          etiquetaCompleta: `${nombreDiaCorto} ${d} ${nombreMesCorto}`,
          totalHoras: 0,
          conteoTareas: 0,
          esFinDeSemana: diaSemanaNum === 0 || diaSemanaNum === 6
        };
      }

      tareasFiltradas.forEach(t => {
        const fechaClave = t.fecha_completada || t.fecha_vencimiento || (t.created_at ? t.created_at.split('T')[0] : '2026-08-07');
        if (fechaClave && diasMap[fechaClave]) {
          const horas = getHorasDeTarea(t);
          diasMap[fechaClave].totalHoras += horas;
          diasMap[fechaClave].conteoTareas += 1;
        }
      });

      const lista = Object.values(diasMap);
      const maxHoras = Math.max(...lista.map(d => d.totalHoras), 1);
      const totalPeriodo = lista.reduce((acc, d) => acc + d.totalHoras, 0);

      return {
        tipo: 'dias' as const,
        datos: lista,
        maxHoras,
        totalPeriodo,
        tituloPeriodo: getNombreMes(mesSeleccionadoHoras)
      };
    }

    if (tipoAgrupacionHoras === 'semanas') {
      // 2. SEMANAS DEL MES SELECCIONADO
      const [y, m] = (mesSeleccionadoHoras || '2026-08').split('-').map(Number);
      const numDias = new Date(y, m, 0).getDate();
      const nombreMesCorto = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'short' });

      const semanas = [
        { semNum: 1, diaIni: 1, diaFin: 7, label: `Sem 1 (1 - 7 ${nombreMesCorto})`, totalHoras: 0, conteoTareas: 0 },
        { semNum: 2, diaIni: 8, diaFin: 14, label: `Sem 2 (8 - 14 ${nombreMesCorto})`, totalHoras: 0, conteoTareas: 0 },
        { semNum: 3, diaIni: 15, diaFin: 21, label: `Sem 3 (15 - 21 ${nombreMesCorto})`, totalHoras: 0, conteoTareas: 0 },
        { semNum: 4, diaIni: 22, diaFin: 28, label: `Sem 4 (22 - 28 ${nombreMesCorto})`, totalHoras: 0, conteoTareas: 0 },
        { semNum: 5, diaIni: 29, diaFin: numDias, label: `Sem 5 (29 - ${numDias} ${nombreMesCorto})`, totalHoras: 0, conteoTareas: 0 }
      ];

      tareasFiltradas.forEach(t => {
        const fechaClave = t.fecha_completada || t.fecha_vencimiento || (t.created_at ? t.created_at.split('T')[0] : '2026-08-07');
        if (fechaClave && fechaClave.startsWith(mesSeleccionadoHoras)) {
          const dia = parseInt(fechaClave.split('-')[2], 10);
          const horas = getHorasDeTarea(t);
          const targetSem = semanas.find(s => dia >= s.diaIni && dia <= s.diaFin);
          if (targetSem) {
            targetSem.totalHoras += horas;
            targetSem.conteoTareas += 1;
          }
        }
      });

      const lista = semanas.map(s => ({
        clave: `sem-${s.semNum}`,
        etiquetaCorta: `Sem ${s.semNum}`,
        etiquetaCompleta: s.label,
        totalHoras: s.totalHoras,
        conteoTareas: s.conteoTareas,
        esFinDeSemana: false
      }));

      const maxHoras = Math.max(...lista.map(d => d.totalHoras), 1);
      const totalPeriodo = lista.reduce((acc, d) => acc + d.totalHoras, 0);

      return {
        tipo: 'semanas' as const,
        datos: lista,
        maxHoras,
        totalPeriodo,
        tituloPeriodo: `${getNombreMes(mesSeleccionadoHoras)} (Por Semanas)`
      };
    }

    // 3. CONSOLIDADO POR MESES
    const mesesMap: Record<string, { clave: string; etiquetaCorta: string; etiquetaCompleta: string; totalHoras: number; conteoTareas: number; esFinDeSemana: boolean }> = {};
    
    [...mesesDisponibles].sort((a, b) => a.localeCompare(b)).forEach(mesStr => {
      const [y, m] = mesStr.split('-').map(Number);
      const nombreMesCorto = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'short' });
      const nombreMesLargo = getNombreMes(mesStr);
      mesesMap[mesStr] = {
        clave: mesStr,
        etiquetaCorta: `${nombreMesCorto} '${String(y).substring(2)}`,
        etiquetaCompleta: nombreMesLargo,
        totalHoras: 0,
        conteoTareas: 0,
        esFinDeSemana: false
      };
    });

    tareasFiltradas.forEach(t => {
      const fechaClave = t.fecha_completada || t.fecha_vencimiento || (t.created_at ? t.created_at.split('T')[0] : '2026-08-07');
      if (fechaClave && fechaClave.length >= 7) {
        const mesKey = fechaClave.substring(0, 7);
        if (mesesMap[mesKey]) {
          const horas = getHorasDeTarea(t);
          mesesMap[mesKey].totalHoras += horas;
          mesesMap[mesKey].conteoTareas += 1;
        }
      }
    });

    const lista = Object.values(mesesMap);
    const maxHoras = Math.max(...lista.map(d => d.totalHoras), 1);
    const totalPeriodo = lista.reduce((acc, d) => acc + d.totalHoras, 0);

    return {
      tipo: 'meses' as const,
      datos: lista,
      maxHoras,
      totalPeriodo,
      tituloPeriodo: 'Consolidado Anual por Meses'
    };
  }, [tareasFiltradas, tipoAgrupacionHoras, mesSeleccionadoHoras, mesesDisponibles, filtroUsuario, filtroRol]);

  // Desglose de Horas por Rol Destino con contabilización individual de tiempo_invertido por rol asignado
  const desglosePorRol = useMemo(() => {
    const mapa: Record<string, { rol: string; totalInvertido: number; conteoTareas: number }> = {};
    
    const acumularRol = (rol: string, inv: number) => {
      if (!mapa[rol]) {
        mapa[rol] = { rol, totalInvertido: 0, conteoTareas: 0 };
      }
      mapa[rol].totalInvertido += inv;
      mapa[rol].conteoTareas += 1;
    };

    tareasFiltradas.forEach(t => {
      if (filtroUsuario !== 'todos') {
        if (t.responsable_id === filtroUsuario) {
          acumularRol(getNombreRol(t.rol_destino), t.tiempo_invertido || 0);
        }
        if (t.responsable_secundario_id === filtroUsuario) {
          const rolSec = getNombreRol(t.rol_destino_secundario || t.rol_destino);
          acumularRol(rolSec, t.tiempo_invertido_secundario || 0);
        }
      } else {
        // Rol Principal
        const rolPrincipal = getNombreRol(t.rol_destino);
        acumularRol(rolPrincipal, t.tiempo_invertido || 0);

        // Rol Secundario (si existe responsable secundario o rol secundario)
        if (t.responsable_secundario_nombre || t.responsable_secundario_id) {
          const rolSecundario = getNombreRol(t.rol_destino_secundario || t.rol_destino);
          acumularRol(rolSecundario, t.tiempo_invertido_secundario || 0);
        }
      }
    });

    return Object.values(mapa).sort((a, b) => b.totalInvertido - a.totalInvertido);
  }, [tareasFiltradas, filtroUsuario, roles, usuarios]);

  const rolMasActivo = desglosePorRol[0]?.rol || 'Sin Asignar';

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
      const r = getNombreRol(t.rol_destino);
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
  }, [tareasDumbbell, roles, usuarios]);

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
                <ArrowUpRight className="w-3.5 h-3.5 text-sage-400" /> Total horas registradas en tareas filtradas
              </p>
            </div>

            <div className="ccv-card p-5 bg-white space-y-2 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Promedio por Tarea</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-charcoal-900">{promedioHorasPorTarea} <span className="text-sm font-semibold text-charcoal-500">hrs/tarea</span></div>
              <p className="text-[11px] text-charcoal-500">Intensidad media de esfuerzo por entregable</p>
            </div>

            <div className="ccv-card p-5 bg-white space-y-2 border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Tareas con Imputación</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-charcoal-900">{tareasConHorasRegistradas} <span className="text-sm font-semibold text-charcoal-500">/ {tareasFiltradas.length}</span></div>
              <p className="text-[11px] text-charcoal-500">Tareas con avance de horas cargado</p>
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

          {/* Gráfico de Productividad: Distribución de Horas */}
          <div className="ccv-card p-6 bg-white space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Distribución de Horas Invertidas por Fecha
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Visualización interactiva: <strong className="text-charcoal-800">{datosGraficoHoras.tituloPeriodo}</strong> • Total: <strong className="text-emerald-700">{datosGraficoHoras.totalPeriodo.toFixed(1)} hrs</strong> registradas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Selector de Mes (visible en vista por Días o por Semanas) */}
                {(tipoAgrupacionHoras === 'dias' || tipoAgrupacionHoras === 'semanas') && (
                  <div className="flex items-center gap-1.5 bg-cream-50 px-2.5 py-1 rounded-xl border border-stone-200">
                    <Calendar className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                    <select
                      value={mesSeleccionadoHoras}
                      onChange={(e) => setMesSeleccionadoHoras(e.target.value)}
                      className="bg-transparent text-xs font-bold text-charcoal-800 focus:outline-none cursor-pointer"
                      title="Seleccionar mes para visualizar"
                    >
                      {mesesDisponibles.map(m => (
                        <option key={m} value={m}>
                          {getNombreMes(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Control de Clasificación: Por Días, Por Semanas, Por Meses */}
                <div className="bg-cream-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setTipoAgrupacionHoras('dias')}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      tipoAgrupacionHoras === 'dias'
                        ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                        : 'text-charcoal-600 hover:text-charcoal-900 font-semibold hover:bg-white/60'
                    }`}
                  >
                    Días del Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoAgrupacionHoras('semanas')}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      tipoAgrupacionHoras === 'semanas'
                        ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                        : 'text-charcoal-600 hover:text-charcoal-900 font-semibold hover:bg-white/60'
                    }`}
                  >
                    Por Semanas
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoAgrupacionHoras('meses')}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      tipoAgrupacionHoras === 'meses'
                        ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                        : 'text-charcoal-600 hover:text-charcoal-900 font-semibold hover:bg-white/60'
                    }`}
                  >
                    Por Mes
                  </button>
                </div>
              </div>
            </div>

            {datosGraficoHoras.datos.length === 0 ? (
              <div className="p-12 text-center bg-cream-50/50 rounded-2xl border border-dashed border-stone-200">
                <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-charcoal-600">No se encontraron tareas con tiempo invertido en el período seleccionado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Contenedor del Gráfico con soporte responsivo y scroll horizontal si hay 31 días en móvil */}
                <div className="overflow-x-auto pb-2 scrollbar-thin">
                  <div className={`h-64 flex items-end justify-between gap-1 sm:gap-2 pt-8 px-1 border-b border-stone-200 ${
                    tipoAgrupacionHoras === 'dias' ? 'min-w-[680px] sm:min-w-full' : 'w-full'
                  }`}>
                    {datosGraficoHoras.datos.map((item) => {
                      const tieneHoras = item.totalHoras > 0;
                      const pctAltura = tieneHoras ? Math.round((item.totalHoras / datosGraficoHoras.maxHoras) * 100) : 0;

                      return (
                        <div key={item.clave} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[16px]">
                          {/* Tooltip interactivo flotante */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-charcoal-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-30">
                            <div>{item.etiquetaCompleta}</div>
                            <div className="text-emerald-400 font-extrabold">
                              {item.totalHoras.toFixed(1)} hrs ({item.conteoTareas} {item.conteoTareas === 1 ? 'tarea' : 'tareas'})
                            </div>
                          </div>

                          {/* Badge de Horas sobre la barra */}
                          <div className="h-5 flex items-center justify-center mb-1">
                            {tieneHoras ? (
                              <span className="text-[10px] sm:text-[11px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200 shadow-2xs">
                                {item.totalHoras.toFixed(1)}h
                              </span>
                            ) : (
                              <span className="text-[9px] text-stone-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                0h
                              </span>
                            )}
                          </div>

                          {/* Barra de altura proporcional */}
                          <div className={`w-full ${
                            tipoAgrupacionHoras === 'dias' ? 'max-w-[28px]' : tipoAgrupacionHoras === 'semanas' ? 'max-w-[72px]' : 'max-w-[64px]'
                          } bg-stone-100/80 rounded-t-xl border-x border-t ${
                            tieneHoras ? 'border-emerald-300/80' : 'border-stone-200/50'
                          } p-0.5 overflow-hidden flex flex-col justify-end h-full`}>
                            {tieneHoras ? (
                              <div 
                                className="bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 w-full rounded-t-lg transition-all duration-500 group-hover:from-emerald-700 group-hover:via-emerald-600 group-hover:to-teal-300 group-hover:shadow-md shadow-2xs"
                                style={{ height: `${Math.max(pctAltura, 8)}%` }}
                              />
                            ) : (
                              <div 
                                className="bg-stone-200/60 w-full rounded-t-sm"
                                style={{ height: '4%' }}
                              />
                            )}
                          </div>

                          {/* Etiqueta inferior del eje X */}
                          <div className="mt-2 text-center w-full">
                            <span className={`text-[10px] font-bold block truncate transition-colors ${
                              tieneHoras 
                                ? 'text-charcoal-900 group-hover:text-emerald-700 font-black' 
                                : item.esFinDeSemana 
                                ? 'text-charcoal-400' 
                                : 'text-charcoal-500'
                            }`}>
                              {item.etiquetaCorta}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-3">
                    Consolidado de Horas por Rol Destino:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {desglosePorRol.map(item => {
                      const pct = totalHorasInvertidas > 0 ? Math.round((item.totalInvertido / totalHorasInvertidas) * 100) : 0;
                      return (
                        <div key={item.rol} className="p-3 bg-cream-50 rounded-2xl border border-stone-200 space-y-1 hover:border-emerald-300 transition-colors">
                          <span className="text-[11px] font-bold text-charcoal-600 truncate block">{item.rol}</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-base font-black text-charcoal-900">{item.totalInvertido.toFixed(1)}h</span>
                            <span className="text-[10px] font-bold text-emerald-700">{pct}%</span>
                          </div>
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
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
                    <th className="p-4">Tiempo Invertido</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs font-medium text-charcoal-800">
                  {tareasFiltradas.map((tarea) => {
                    const inv = tarea.tiempo_invertido || 0;

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
                          {tarea.responsable_secundario_nombre && (
                            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                              2 Responsables Asignados
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {tarea.responsable_secundario_nombre ? (
                            <div className="flex flex-col gap-1.5">
                              <span className="bg-sage-100 text-sage-900 border border-sage-200 px-2 py-0.5 rounded-lg text-[10px] font-extrabold inline-block">
                                P: {getNombreRol(tarea.rol_destino)}
                              </span>
                              <span className="bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-lg text-[10px] font-extrabold inline-block">
                                Co: {getNombreRol(tarea.rol_destino_secundario || tarea.rol_destino)}
                              </span>
                            </div>
                          ) : (
                            <span className="bg-sage-100 text-sage-800 border border-sage-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                              {getNombreRol(tarea.rol_destino)}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {tarea.responsable_secundario_nombre ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-sage-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-2xs">
                                  {tarea.responsable_nombre?.charAt(0) || 'U'}
                                </div>
                                <span className="truncate font-bold text-[11px] text-charcoal-900">{tarea.responsable_nombre || 'Principal'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-700">
                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-2xs">
                                  {tarea.responsable_secundario_nombre.charAt(0)}
                                </div>
                                <span className="truncate font-bold text-[11px] text-blue-950">{tarea.responsable_secundario_nombre}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-sage-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {tarea.responsable_nombre?.charAt(0) || 'U'}
                              </div>
                              <span className="truncate font-semibold">{tarea.responsable_nombre || 'Sin asignar'}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 w-56">
                          {tarea.responsable_secundario_nombre ? (
                            <div className="space-y-1.5 p-2 bg-stone-50 rounded-xl border border-stone-200/80">
                              {/* Fila 1: Principal */}
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-sage-900 font-bold truncate max-w-[100px]">{tarea.responsable_nombre?.split(' ')[0] || 'Principal'}:</span>
                                <span className="font-extrabold text-sage-900 bg-sage-100/80 px-2 py-0.5 rounded-md border border-sage-200">
                                  {tarea.tiempo_invertido || 0} hrs
                                </span>
                              </div>

                              {/* Fila 2: Co-responsable */}
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-blue-900 font-bold truncate max-w-[100px]">{tarea.responsable_secundario_nombre.split(' ')[0]}:</span>
                                <span className="font-extrabold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                                  {tarea.tiempo_invertido_secundario || 0} hrs
                                </span>
                              </div>

                              {/* Total combinado */}
                              <div className="text-[10px] text-charcoal-500 font-bold text-right pt-1 border-t border-stone-200/60">
                                Total: <strong className="text-charcoal-900">{(tarea.tiempo_invertido || 0) + (tarea.tiempo_invertido_secundario || 0)} hrs</strong>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-charcoal-900 bg-sage-50 border border-sage-200 px-3 py-1 rounded-xl">
                                {inv} hrs
                              </span>
                              <span className="text-[10px] text-charcoal-500 font-semibold">acumuladas</span>
                            </div>
                          )}
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
                          {tarea.responsable_secundario_nombre ? (
                            <div className="flex flex-col gap-1.5 items-end">
                              <button
                                onClick={() => handleOpenImputarModal(tarea.id, false)}
                                className="px-2.5 py-1 bg-sage-50 text-sage-800 border border-sage-200 rounded-lg hover:bg-sage-600 hover:text-white font-bold text-[10px] transition-all whitespace-nowrap shadow-2xs"
                                title={`Imputar horas a ${tarea.responsable_nombre}`}
                              >
                                + Horas Principal
                              </button>
                              <button
                                onClick={() => handleOpenImputarModal(tarea.id, true)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white font-bold text-[10px] transition-all whitespace-nowrap shadow-2xs"
                                title={`Imputar horas a ${tarea.responsable_secundario_nombre}`}
                              >
                                + Horas Co-resp.
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenImputarModal(tarea.id, false)}
                              className="px-3 py-1.5 bg-sage-50 text-sage-700 border border-sage-200 rounded-xl hover:bg-sage-600 hover:text-white font-bold text-[11px] transition-all"
                            >
                              + Imputar Horas
                            </button>
                          )}
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
                              {tarea.curso_nombre || tarea.proyecto_nombre || 'General CCV'} • Responsable{tarea.responsable_secundario_nombre ? 's' : ''}: <strong className="text-charcoal-700">{tarea.responsable_nombre || 'Sin Asignar'}</strong>
                              {tarea.responsable_secundario_nombre && (
                                <span className="text-blue-700 font-bold"> & {tarea.responsable_secundario_nombre}</span>
                              )}
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
          initialTaskId={modalInitialTaskId}
          initialIsSecondary={modalInitialIsSecondary}
          onClose={() => {
            setIsLogModalOpen(false);
            setModalInitialTaskId(undefined);
            setModalInitialIsSecondary(false);
          }}
          onUpdateTaskHours={onUpdateTaskHours}
        />
      )}
    </div>
  );
};
