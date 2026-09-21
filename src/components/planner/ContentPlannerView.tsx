'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays, 
  Calendar as CalendarIcon, 
  Table as TableIcon, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Trash2,
  SlidersHorizontal,
  FileText,
  CalendarCheck
} from 'lucide-react';
import { 
  PublicacionParrilla, 
  CursoVirtual, 
  ProyectoEspecial, 
  Usuario, 
  CanalPublicacion, 
  EstadoPublicacion, 
  FormatoPublicacion 
} from '@/types';
import { 
  fetchPublicacionesParrillaDB, 
  createPublicacionParrillaDB, 
  updatePublicacionParrillaDB, 
  deletePublicacionParrillaDB 
} from '@/lib/supabaseService';
import { ContentCalendarGrid } from './ContentCalendarGrid';
import { ContentTableView } from './ContentTableView';
import { ContentModal } from './ContentModal';

interface ContentPlannerViewProps {
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  usuarios: Usuario[];
  usuarioActual: Usuario | null;
  onSelectTask?: (tareaId: string) => void;
}

export const ContentPlannerView: React.FC<ContentPlannerViewProps> = ({
  cursos,
  proyectos,
  usuarios,
  usuarioActual,
  onSelectTask
}) => {
  // Estado de publicaciones
  const [publicaciones, setPublicaciones] = useState<PublicacionParrilla[]>([]);
  const [loading, setLoading] = useState(true);

  // Modo de vista: 'calendar' o 'table'
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  // Mes en visualización
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCanal, setFiltroCanal] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroResponsable, setFiltroResponsable] = useState<string>('todos');
  const [filtroEntidad, setFiltroEntidad] = useState<string>('todos');
  const [soloAtrasados, setSoloAtrasados] = useState(false);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [publicacionEditando, setPublicacionEditando] = useState<PublicacionParrilla | null>(null);
  const [fechaPreseleccionada, setFechaPreseleccionada] = useState<string | undefined>(undefined);
  const [publicacionAEliminar, setPublicacionAEliminar] = useState<PublicacionParrilla | null>(null);

  // Formato mes actual 'YYYY-MM'
  const mesActualStr = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentDate]);

  // Cargar publicaciones de la base de datos
  const cargarPublicaciones = async () => {
    setLoading(true);
    try {
      const data = await fetchPublicacionesParrillaDB();
      setPublicaciones(data);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  // Navegación de mes
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Helper para verificar retrasos
  const isDelayed = (pub: PublicacionParrilla) => {
    if (['Publicado', 'Programado', 'Aprobado'].includes(pub.estado)) return false;
    if (!pub.fecha_publicacion) return false;
    return new Date(pub.fecha_publicacion).getTime() < Date.now();
  };

  // Filtrado de publicaciones
  const publicacionesFiltradas = useMemo(() => {
    return publicaciones.filter(p => {
      // Búsqueda por texto
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideTitulo = p.titulo.toLowerCase().includes(query);
        const coincideDesc = p.descripcion?.toLowerCase().includes(query);
        const coincideResp = p.responsable_nombre?.toLowerCase().includes(query);
        const coincideEntidad = p.proyecto_nombre?.toLowerCase().includes(query) || p.curso_nombre?.toLowerCase().includes(query);
        if (!coincideTitulo && !coincideDesc && !coincideResp && !coincideEntidad) {
          return false;
        }
      }

      // Filtro de canal
      if (filtroCanal !== 'todos' && p.canal !== filtroCanal) {
        return false;
      }

      // Filtro de estado
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) {
        return false;
      }

      // Filtro de responsable
      if (filtroResponsable !== 'todos' && p.responsable_id !== filtroResponsable) {
        return false;
      }

      // Filtro de entidad académica
      if (filtroEntidad !== 'todos') {
        if (filtroEntidad === 'solo_cursos' && !p.curso_id) return false;
        if (filtroEntidad === 'solo_proyectos' && !p.proyecto_id) return false;
        if (filtroEntidad.startsWith('curso:') && p.curso_id !== filtroEntidad.replace('curso:', '')) return false;
        if (filtroEntidad.startsWith('proyecto:') && p.proyecto_id !== filtroEntidad.replace('proyecto:', '')) return false;
      }

      // Filtro de retraso
      if (soloAtrasados && !isDelayed(p)) {
        return false;
      }

      return true;
    });
  }, [publicaciones, busqueda, filtroCanal, filtroEstado, filtroResponsable, filtroEntidad, soloAtrasados]);

  // Publicaciones del mes seleccionado
  const publicacionesDelMes = useMemo(() => {
    return publicacionesFiltradas.filter(p => {
      if (p.mes_planeado) return p.mes_planeado === mesActualStr;
      if (p.fecha_publicacion) return p.fecha_publicacion.startsWith(mesActualStr);
      return false;
    });
  }, [publicacionesFiltradas, mesActualStr]);

  // Cálculo de KPIs
  const metricas = useMemo(() => {
    const totalMes = publicacionesDelMes.length;
    const enProduccion = publicacionesDelMes.filter(p => ['Borrador', 'En Diseño', 'En Revisión'].includes(p.estado)).length;
    const listosYPublicados = publicacionesDelMes.filter(p => ['Aprobado', 'Programado', 'Publicado'].includes(p.estado)).length;
    const retrasadas = publicacionesDelMes.filter(p => isDelayed(p)).length;
    const totalRetrasadasGlobal = publicaciones.filter(p => isDelayed(p)).length;

    return {
      totalMes,
      enProduccion,
      listosYPublicados,
      retrasadas,
      totalRetrasadasGlobal
    };
  }, [publicacionesDelMes, publicaciones]);

  // Manejo de Creación / Edición
  const handleOpenCreate = () => {
    setPublicacionEditando(null);
    setFechaPreseleccionada(undefined);
    setIsModalOpen(true);
  };

  const handleOpenCreateForDate = (dateStr: string) => {
    setPublicacionEditando(null);
    setFechaPreseleccionada(dateStr);
    setIsModalOpen(true);
  };

  const handleEdit = (pub: PublicacionParrilla) => {
    setPublicacionEditando(pub);
    setFechaPreseleccionada(undefined);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<PublicacionParrilla, 'id'>, vincularConTareaCCV: boolean) => {
    try {
      if (publicacionEditando) {
        // Actualizar
        const res = await updatePublicacionParrillaDB(publicacionEditando.id, data);
        if (res.success && res.data) {
          setPublicaciones(prev => prev.map(p => p.id === publicacionEditando.id ? { ...p, ...res.data } : p));
        } else {
          // Fallback optimistic
          setPublicaciones(prev => prev.map(p => p.id === publicacionEditando.id ? { ...p, ...data } as PublicacionParrilla : p));
        }
      } else {
        // Crear
        const res = await createPublicacionParrillaDB(data, vincularConTareaCCV);
        if (res.success && res.data) {
          setPublicaciones(prev => [res.data!, ...prev]);
        } else {
          // Fallback optimistic
          const nuevoItem: PublicacionParrilla = {
            id: `pub-${Date.now()}`,
            ...data
          };
          setPublicaciones(prev => [nuevoItem, ...prev]);
        }
      }
      setIsModalOpen(false);
      setPublicacionEditando(null);
    } catch (err) {
      console.error('Error al guardar publicación:', err);
    }
  };

  // Cambio rápido de estado desde la tabla
  const handleQuickStatusChange = async (pubId: string, nuevoEstado: EstadoPublicacion) => {
    setPublicaciones(prev => prev.map(p => p.id === pubId ? { ...p, estado: nuevoEstado } : p));
    await updatePublicacionParrillaDB(pubId, { estado: nuevoEstado });
  };

  // Eliminación
  const handleConfirmDelete = (pub: PublicacionParrilla) => {
    setPublicacionAEliminar(pub);
  };

  const executeDelete = async () => {
    if (!publicacionAEliminar) return;
    const id = publicacionAEliminar.id;
    setPublicaciones(prev => prev.filter(p => p.id !== id));
    setPublicacionAEliminar(null);
    await deletePublicacionParrillaDB(id);
  };

  const nombreMes = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(currentDate);

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10 w-full">
      {/* Header Superior con Identidad y Acciones Principales */}
      <div className="ccv-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-sky-600 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-sky-600" />
              Parrilla de Publicaciones y Calendario Editorial
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              CMU Contenidos
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Planifica, programa y monitorea la producción de contenidos multicanal sincronizados con proyectos y cursos.
          </p>
        </div>

        {/* Acciones del Header */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={cargarPublicaciones}
            disabled={loading}
            title="Recargar datos desde Supabase"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* Toggle Vista Calendario / Tabla */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-full border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-sky-400" />
              <span>Calendario</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4 text-sky-400" />
              <span>Tabla Editorial</span>
            </button>
          </div>

          {/* Botón Nueva Publicación */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Publicación</span>
          </button>
        </div>
      </div>

      {/* Barra de KPIs / Métricas del Mes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        {/* Card 1: Total Planificadas */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{metricas.totalMes}</div>
            <div className="text-[11px] font-medium text-slate-500">Planificadas ({mesActualStr})</div>
          </div>
        </div>

        {/* Card 2: En Producción */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-700">{metricas.enProduccion}</div>
            <div className="text-[11px] font-medium text-slate-500">En Diseño / Revisión</div>
          </div>
        </div>

        {/* Card 3: Listos / Publicados */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-700">{metricas.listosYPublicados}</div>
            <div className="text-[11px] font-medium text-slate-500">Aprobados / Publicados</div>
          </div>
        </div>

        {/* Card 4: Alerta Retrasados */}
        <button
          onClick={() => setSoloAtrasados(prev => !prev)}
          className={`rounded-xl p-3.5 border text-left transition-all flex items-center gap-3 shadow-2xs ${
            soloAtrasados
              ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400'
              : metricas.retrasadas > 0
                ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 text-rose-900'
                : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            soloAtrasados 
              ? 'bg-white/20 text-white' 
              : metricas.retrasadas > 0 
                ? 'bg-rose-100 text-rose-600 animate-pulse' 
                : 'bg-slate-100 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className={`text-xl font-black ${soloAtrasados ? 'text-white' : metricas.retrasadas > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {metricas.retrasadas}
            </div>
            <div className={`text-[11px] font-medium truncate ${soloAtrasados ? 'text-rose-100' : 'text-slate-500'}`}>
              {soloAtrasados ? 'Filtrando: Solo Atrasadas' : 'Contenidos Atrasados'}
            </div>
          </div>
        </button>
      </div>

      {/* Barra de Filtros y Navegación de Mes */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 mb-5 shadow-2xs space-y-3">
        {/* Fila 1: Selector de Mes y Búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Navegador de Mes */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 font-bold text-xs text-slate-800 capitalize min-w-[140px] text-center">
              {nombreMes}
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 px-2 py-1 hover:bg-sky-50 rounded-md transition-colors"
            >
              Hoy
            </button>
          </div>

          {/* Buscador general */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, responsable, copy..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 placeholder-slate-400"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Selectores de Filtro en Cascada */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Canal */}
          <select
            value={filtroCanal}
            onChange={(e) => setFiltroCanal(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-sky-500"
          >
            <option value="todos">Todos los Canales</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
            <option value="Facebook">Facebook</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Portal Web">Portal Web</option>
            <option value="LMS Canvas">LMS Canvas</option>
            <option value="Boletín / Email">Boletín / Email</option>
          </select>

          {/* Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-sky-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="Borrador">Borrador</option>
            <option value="En Diseño">En Diseño</option>
            <option value="En Revisión">En Revisión</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Programado">Programado</option>
            <option value="Publicado">Publicado</option>
          </select>

          {/* Responsable */}
          <select
            value={filtroResponsable}
            onChange={(e) => setFiltroResponsable(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-sky-500"
          >
            <option value="todos">Todos los Responsables</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombre_completo} ({u.rol_nombre || 'CMU'})
              </option>
            ))}
          </select>

          {/* Entidad (Curso o Proyecto) */}
          <select
            value={filtroEntidad}
            onChange={(e) => setFiltroEntidad(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-sky-500 max-w-[200px] truncate"
          >
            <option value="todos">Todas las Entidades</option>
            <optgroup label="Tipo">
              <option value="solo_cursos">Solo Cursos Virtuales</option>
              <option value="solo_proyectos">Solo Proyectos Especiales</option>
            </optgroup>
            <optgroup label="Proyectos">
              {proyectos.map(p => (
                <option key={p.id} value={`proyecto:${p.id}`}>{p.nombre}</option>
              ))}
            </optgroup>
            <optgroup label="Cursos">
              {cursos.map(c => (
                <option key={c.id} value={`curso:${c.id}`}>{c.nombre}</option>
              ))}
            </optgroup>
          </select>

          {/* Botón Reset Filtros si hay alguno activo */}
          {(filtroCanal !== 'todos' || filtroEstado !== 'todos' || filtroResponsable !== 'todos' || filtroEntidad !== 'todos' || soloAtrasados || busqueda) && (
            <button
              onClick={() => {
                setFiltroCanal('todos');
                setFiltroEstado('todos');
                setFiltroResponsable('todos');
                setFiltroEntidad('todos');
                setSoloAtrasados(false);
                setBusqueda('');
              }}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 hover:bg-rose-50 rounded-md transition-colors ml-auto"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Contenido Principal: Calendario o Tabla */}
      {viewMode === 'calendar' ? (
        <ContentCalendarGrid
          mesSeleccionado={mesActualStr}
          publicaciones={publicacionesFiltradas}
          onSelectPost={handleEdit}
          onAddOnDate={handleOpenCreateForDate}
        />
      ) : (
        <ContentTableView
          publicaciones={publicacionesFiltradas}
          onSelectPost={handleEdit}
          onDeletePost={(id) => {
            const pub = publicaciones.find(p => p.id === id);
            if (pub) handleConfirmDelete(pub);
          }}
          filtroEstadoRapido={filtroEstado}
          setFiltroEstadoRapido={setFiltroEstado}
        />
      )}

      {/* Modal de Creación / Edición */}
      {isModalOpen && (
        <ContentModal
          publicacionAEditar={publicacionEditando}
          fechaPreseleccionada={fechaPreseleccionada}
          onClose={() => {
            setIsModalOpen(false);
            setPublicacionEditando(null);
          }}
          onSave={handleSave}
          cursos={cursos}
          proyectos={proyectos}
          usuarios={usuarios}
          usuarioActual={usuarioActual}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {publicacionAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              ¿Eliminar esta publicación?
            </h3>
            <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">
              Se eliminará <strong className="text-slate-800">"{publicacionAEliminar.titulo}"</strong> de la parrilla editorial. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPublicacionAEliminar(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
