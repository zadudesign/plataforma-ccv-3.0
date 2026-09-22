'use client';

import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
  Filter,
  Search,
  X,
  Users,
  Layers,
  BookOpen,
  FolderKanban,
  SlidersHorizontal
} from 'lucide-react';
import { TareaCCV, EstadoTarea } from '@/types';
import { isRoleMatch } from '@/lib/roleVisibilityUtils';

interface KanbanBoardProps {
  tareas: TareaCCV[];
  onSelectTask: (tarea: TareaCCV) => void;
  onUpdateStatus: (tareaId: string, nuevoEstado: EstadoTarea) => void;
  onOpenCreateTask: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tareas,
  onSelectTask,
  onUpdateStatus,
  onOpenCreateTask,
}) => {
  // Filtros interactivos del Kanban
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'Curso Virtual' | 'Proyecto'>('todos');
  const [busquedaLocal, setBusquedaLocal] = useState<string>('');

  const columnas: { 
    estado: EstadoTarea; 
    titulo: string; 
    colorHeader: string; 
    borderTop: string;
    cardBg: string;
    cardBorder: string;
    badgeBg: string;
  }[] = [
    { 
      estado: 'Pendiente', 
      titulo: 'Pendientes', 
      colorHeader: 'bg-rose-100 text-rose-900 border border-rose-300', 
      borderTop: 'border-t-4 border-rose-600',
      cardBg: 'bg-rose-50/40',
      cardBorder: 'border-rose-200 hover:border-rose-400 shadow-2xs',
      badgeBg: 'bg-rose-600 text-white'
    },
    { 
      estado: 'En Proceso', 
      titulo: 'En Proceso', 
      colorHeader: 'bg-sky-100 text-sky-900 border border-sky-300', 
      borderTop: 'border-t-4 border-sky-600',
      cardBg: 'bg-sky-50/40',
      cardBorder: 'border-sky-200 hover:border-sky-400 shadow-2xs',
      badgeBg: 'bg-sky-600 text-white'
    },
    { 
      estado: 'En Revisión', 
      titulo: 'En Revisión (Veeduría)', 
      colorHeader: 'bg-amber-100 text-amber-900 border border-amber-300', 
      borderTop: 'border-t-4 border-amber-500',
      cardBg: 'bg-amber-50/40',
      cardBorder: 'border-amber-200 hover:border-amber-400 shadow-2xs',
      badgeBg: 'bg-amber-500 text-white'
    },
    { 
      estado: 'Completada', 
      titulo: 'Completadas', 
      colorHeader: 'bg-emerald-100 text-emerald-900 border border-emerald-300', 
      borderTop: 'border-t-4 border-emerald-600',
      cardBg: 'bg-emerald-50/40',
      cardBorder: 'border-emerald-200 hover:border-emerald-400 shadow-2xs',
      badgeBg: 'bg-emerald-600 text-white'
    },
  ];

  // Extracción dinámica de roles presentes en las tareas activas
  const rolesInfo = useMemo(() => {
    const rolesMap = new Map<string, number>();
    tareas.forEach(t => {
      if (t.estado_bloqueo === 'BLOQUEADA') return;
      const rol1 = t.rol_destino?.trim();
      const rol2 = t.rol_destino_secundario?.trim();
      if (rol1) {
        rolesMap.set(rol1, (rolesMap.get(rol1) || 0) + 1);
      }
      if (rol2 && rol2 !== rol1) {
        rolesMap.set(rol2, (rolesMap.get(rol2) || 0) + 1);
      }
    });

    return Array.from(rolesMap.entries())
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre));
  }, [tareas]);

  // Filtrado de tareas según rol, tipo y búsqueda local
  const tareasFiltradas = useMemo(() => {
    return tareas.filter(t => {
      if (t.estado_bloqueo === 'BLOQUEADA') return false;

      // Filtro por Rol
      if (filtroRol !== 'todos') {
        const matchRol =
          isRoleMatch(t.rol_destino, filtroRol) ||
          isRoleMatch(t.rol_destino_secundario, filtroRol) ||
          t.rol_destino?.toLowerCase().trim() === filtroRol.toLowerCase().trim() ||
          t.rol_destino_secundario?.toLowerCase().trim() === filtroRol.toLowerCase().trim();
        if (!matchRol) return false;
      }

      // Filtro por Tipo de Tarea
      if (filtroTipo !== 'todos' && t.tipo_tarea !== filtroTipo) {
        return false;
      }

      // Filtro por Búsqueda local
      if (busquedaLocal.trim()) {
        const q = busquedaLocal.toLowerCase().trim();
        const matchTitulo = t.titulo.toLowerCase().includes(q);
        const matchResp =
          t.responsable_nombre?.toLowerCase().includes(q) ||
          t.responsable_secundario_nombre?.toLowerCase().includes(q);
        const matchEntidad =
          t.curso_nombre?.toLowerCase().includes(q) ||
          t.proyecto_nombre?.toLowerCase().includes(q);
        const matchRolDest =
          t.rol_destino?.toLowerCase().includes(q) ||
          t.rol_destino_secundario?.toLowerCase().includes(q);
        if (!matchTitulo && !matchResp && !matchEntidad && !matchRolDest) return false;
      }

      return true;
    });
  }, [tareas, filtroRol, filtroTipo, busquedaLocal]);

  const hayFiltrosActivos = filtroRol !== 'todos' || filtroTipo !== 'todos' || busquedaLocal.trim() !== '';

  const formatFechaDia = (fechaStr?: string) => {
    if (!fechaStr || fechaStr === 'Sin fecha') return 'Sin fecha';
    const [y, m, d] = fechaStr.split('-').map(Number);
    if (!y || !m || !d) return fechaStr;
    const date = new Date(y, m - 1, d);
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    const txt = date.toLocaleDateString('es-CO', opciones);
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  };

  // Función para ordenar tareas de la más próxima a vencer a la más lejana
  const ordenarTareasPorVencimiento = (lista: TareaCCV[]) => {
    return [...lista].sort((a, b) => {
      const fechaA = a.fecha_vencimiento?.trim() || '';
      const fechaB = b.fecha_vencimiento?.trim() || '';

      const sinFechaA = !fechaA || fechaA === 'Sin fecha';
      const sinFechaB = !fechaB || fechaB === 'Sin fecha';

      if (sinFechaA && !sinFechaB) return 1;
      if (!sinFechaA && sinFechaB) return -1;
      if (sinFechaA && sinFechaB) return 0;

      if (fechaA !== fechaB) {
        return fechaA.localeCompare(fechaB);
      }

      const horaA = (a.hora_vencimiento?.trim() || '18:00').padStart(5, '0');
      const horaB = (b.hora_vencimiento?.trim() || '18:00').padStart(5, '0');
      return horaA.localeCompare(horaB);
    });
  };

  const getRolBadgeColor = (rol?: string) => {
    if (!rol) return 'bg-slate-100 text-slate-700 border-slate-200';
    const r = rol.toLowerCase();
    if (r.includes('disen')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (r.includes('multi')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (r.includes('soporte')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (r.includes('producc')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (r.includes('docente')) return 'bg-violet-50 text-violet-700 border-violet-200';
    if (r.includes('evaluador') || r.includes('par')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (r.includes('coord')) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (r.includes('decano')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans">
      {/* Kanban Top Header */}
      <div className="ccv-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sage-600" />
            Tablero Kanban de Producción
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Tareas ordenadas cronológicamente de la más próxima a vencer a la última en vencer, agrupadas por día y por estados del flujo.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Mostrando: <strong className="text-slate-900">{tareasFiltradas.length}</strong> de {tareas.length} tareas
          </span>
          <button
            onClick={onOpenCreateTask}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* Modern Interactive Filter Bar by Role & Entity Type */}
      <div className="ccv-card p-4 space-y-3 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Section title & active filters indicator */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Filtrar por Rol Asignado
              </span>
              <p className="text-[11px] text-slate-500">
                Selecciona un rol para visualizar exclusivamente las tareas asignadas a esa especialidad
              </p>
            </div>
          </div>

          {/* Quick Search and Type Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input inside Kanban */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Buscar en Kanban..."
                value={busquedaLocal}
                onChange={(e) => setBusquedaLocal(e.target.value)}
                className="w-full py-1.5 pl-8 pr-7 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {busquedaLocal && (
                <button
                  onClick={() => setBusquedaLocal('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Type selector: Todos / Cursos / Proyectos */}
            <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  filtroTipo === 'todos'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroTipo('Curso Virtual')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                  filtroTipo === 'Curso Virtual'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3 h-3 text-sky-600" />
                <span>Cursos</span>
              </button>
              <button
                onClick={() => setFiltroTipo('Proyecto')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                  filtroTipo === 'Proyecto'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderKanban className="w-3 h-3 text-amber-600" />
                <span>Proyectos</span>
              </button>
            </div>

            {/* Reset filters button if active */}
            {hayFiltrosActivos && (
              <button
                onClick={() => {
                  setFiltroRol('todos');
                  setFiltroTipo('todos');
                  setBusquedaLocal('');
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all flex items-center gap-1"
                title="Limpiar todos los filtros aplicados"
              >
                <X className="w-3 h-3" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Role Pills List */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          {/* Option: Todos los roles */}
          <button
            onClick={() => setFiltroRol('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
              filtroRol === 'todos'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Todos los Roles</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              filtroRol === 'todos' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {tareas.filter(t => t.estado_bloqueo !== 'BLOQUEADA').length}
            </span>
          </button>

          {/* Dynamic role pills from active tasks */}
          {rolesInfo.map(({ nombre, count }) => {
            const isSelected = filtroRol.toLowerCase() === nombre.toLowerCase();
            return (
              <button
                key={nombre}
                onClick={() => setFiltroRol(isSelected ? 'todos' : nombre)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs scale-102'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columnas.map((col) => {
          const tareasCol = ordenarTareasPorVencimiento(
            tareasFiltradas.filter(t => t.estado === col.estado)
          );

          // Agrupación por día clasificada de la fecha más próxima a la más lejana
          const gruposPorFecha: Record<string, TareaCCV[]> = {};
          tareasCol.forEach(t => {
            const fecha = t.fecha_vencimiento?.trim() || 'Sin fecha';
            if (!gruposPorFecha[fecha]) gruposPorFecha[fecha] = [];
            gruposPorFecha[fecha].push(t);
          });

          // Ordenar las fechas de la más próxima a la más lejana (fechas sin asignar al final)
          const fechasOrdenadas = Object.keys(gruposPorFecha).sort((a, b) => {
            if (a === 'Sin fecha') return 1;
            if (b === 'Sin fecha') return -1;
            return a.localeCompare(b);
          });

          // Asegurar que las tareas dentro de cada día estén ordenadas por hora de la más temprana a la más tardía
          fechasOrdenadas.forEach(fecha => {
            gruposPorFecha[fecha] = ordenarTareasPorVencimiento(gruposPorFecha[fecha]);
          });

          return (
            <div key={col.estado} className={`ccv-card p-3.5 flex flex-col justify-between ${col.borderTop}`}>
              <div>
                {/* Column Header */}
                <div className={`p-2.5 rounded-xl flex items-center justify-between font-extrabold text-xs mb-3 ${col.colorHeader}`}>
                  <span>{col.titulo}</span>
                  <span className="w-5 h-5 rounded-full bg-white text-charcoal-900 text-[11px] flex items-center justify-center shadow-2xs font-black">
                    {tareasCol.length}
                  </span>
                </div>

                {/* Task Cards List Grouped by Day */}
                <div className="space-y-4">
                  {tareasCol.length === 0 ? (
                    <div className="p-5 text-center text-xs text-charcoal-400 border-2 border-dashed border-stone-200 rounded-xl bg-cream-50/40">
                      Sin tareas en esta etapa
                    </div>
                  ) : (
                    fechasOrdenadas.map((fecha) => {
                      const tareasDelGrupo = gruposPorFecha[fecha];
                      return (
                        <div key={fecha} className="space-y-2">
                          {/* Day Header Separator */}
                          <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-stone-200/80">
                            <span className="text-[10px] font-black uppercase tracking-wider text-charcoal-600 flex items-center gap-1 font-mono">
                              <CalendarIcon className="w-3 h-3 text-sage-600" />
                              {fecha}
                            </span>
                            <span className="text-[9.5px] font-bold text-charcoal-500">
                              {formatFechaDia(fecha)} • {tareasDelGrupo.length} {tareasDelGrupo.length === 1 ? 'tarea' : 'tareas'}
                            </span>
                          </div>

                          {/* Cards for this day */}
                          <div className="space-y-2">
                            {tareasDelGrupo.map((tarea) => (
                              <div
                                key={tarea.id}
                                className={`p-2.5 rounded-xl border transition-all group ${col.cardBg} ${col.cardBorder}`}
                              >
                                {/* Compact Header: Type, Role, Hour, Cost */}
                                <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                      tarea.tipo_tarea === 'Curso Virtual' 
                                        ? 'bg-white text-sage-800 border border-sage-300' 
                                        : 'bg-white text-amber-800 border border-amber-300'
                                    }`}>
                                      {tarea.tipo_tarea}
                                    </span>
                                    {tarea.rol_destino && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${getRolBadgeColor(tarea.rol_destino)}`}>
                                        {tarea.rol_destino}
                                      </span>
                                    )}
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-stone-100/90 text-charcoal-700 border border-stone-200">
                                      ⏰ {tarea.hora_vencimiento || '18:00'}
                                    </span>
                                  </div>
                                  {tarea.tipo_tarea === 'Proyecto' && tarea.tarifa_tarea !== undefined && (
                                    <span className="text-[10.5px] font-black text-sage-700 font-mono" title={tarea.tarifa_hora ? `$${tarea.tarifa_hora.toLocaleString('es-CO')} COP/h` : undefined}>
                                      ${tarea.tarifa_tarea.toLocaleString('es-CO')}
                                    </span>
                                  )}
                                </div>

                                {/* Title (Compact) */}
                                <h4 
                                  onClick={() => onSelectTask(tarea)}
                                  className="font-extrabold text-charcoal-900 text-xs hover:text-sage-700 transition-colors cursor-pointer line-clamp-2 leading-snug"
                                >
                                  {tarea.titulo}
                                </h4>

                                {/* Context association & External link */}
                                <div className="mt-1.5 pt-1.5 border-t border-stone-200/50 flex items-center justify-between gap-1 text-[10px] text-charcoal-600">
                                  <div className="truncate flex-1 font-medium">
                                    {tarea.curso_nombre && <span className="truncate block">📘 {tarea.curso_nombre}</span>}
                                    {tarea.proyecto_nombre && <span className="truncate block">📁 {tarea.proyecto_nombre}</span>}
                                  </div>
                                  {tarea.enlace_recurso && (
                                    <a
                                      href={tarea.enlace_recurso.startsWith('http') ? tarea.enlace_recurso : `https://${tarea.enlace_recurso}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-white hover:bg-sage-100 text-sage-800 border border-sage-300 font-bold text-[9px] transition-colors shrink-0"
                                      title={`Abrir recurso: ${tarea.enlace_recurso}`}
                                    >
                                      <LinkIcon className="w-2.5 h-2.5 text-sage-600" />
                                      <span>Link</span>
                                    </a>
                                  )}
                                </div>

                                {/* Compact Footer: Avatar + Name + Quick Move Arrows */}
                                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-stone-200/50">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    {tarea.responsable_secundario_nombre ? (
                                      <div className="flex items-center -space-x-1.5 shrink-0" title={`Responsables: ${tarea.responsable_nombre} y ${tarea.responsable_secundario_nombre}`}>
                                        <img
                                          src={tarea.responsable_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                          alt={tarea.responsable_nombre || 'Principal'}
                                          className="w-5 h-5 rounded-full object-cover border border-white shadow-2xs"
                                        />
                                        <img
                                          src={tarea.responsable_secundario_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                                          alt={tarea.responsable_secundario_nombre}
                                          className="w-5 h-5 rounded-full object-cover border border-white shadow-2xs ring-1 ring-blue-300"
                                        />
                                      </div>
                                    ) : (
                                      <img
                                        src={tarea.responsable_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                        alt={tarea.responsable_nombre}
                                        className="w-5 h-5 rounded-full object-cover border border-white shadow-2xs shrink-0"
                                      />
                                    )}
                                    <span className="text-[10px] text-charcoal-600 font-semibold truncate">
                                      {tarea.responsable_nombre || 'Sin asignar'}
                                    </span>
                                  </div>

                                  {/* Quick state shift buttons (Compact) */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    {col.estado !== 'Pendiente' && (
                                      <button
                                        onClick={() => {
                                          const prev: EstadoTarea = col.estado === 'Completada' ? 'En Revisión' : col.estado === 'En Revisión' ? 'En Proceso' : 'Pendiente';
                                          onUpdateStatus(tarea.id, prev);
                                        }}
                                        className="w-5 h-5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-charcoal-700 flex items-center justify-center text-[10px] shadow-2xs transition-colors"
                                        title="Mover a etapa anterior"
                                      >
                                        <ArrowLeft className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                    {col.estado !== 'Completada' && (
                                      <button
                                        onClick={() => {
                                          const next: EstadoTarea = col.estado === 'Pendiente' ? 'En Proceso' : col.estado === 'En Proceso' ? 'En Revisión' : 'Completada';
                                          onUpdateStatus(tarea.id, next);
                                        }}
                                        className="w-5 h-5 rounded-full bg-charcoal-900 hover:bg-sage-700 text-white flex items-center justify-center text-[10px] shadow-2xs transition-colors"
                                        title="Avanzar etapa"
                                      >
                                        <ArrowRight className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
