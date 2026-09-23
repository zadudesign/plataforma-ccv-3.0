'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  Edit, 
  Trash2, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X
} from 'lucide-react';
import { PlantillaTareaCurso, Usuario } from '@/types';
import { PlantillaTareaModal } from './PlantillaTareaModal';

interface PlantillaCursosTabProps {
  plantillaTareas: PlantillaTareaCurso[];
  usuarios: Usuario[];
  onCrearTarea: (tarea: Omit<PlantillaTareaCurso, 'id'>, dependenciasIds: string[]) => Promise<PlantillaTareaCurso | null>;
  onEditarTarea: (id: string, updates: Partial<PlantillaTareaCurso>, dependenciasIds?: string[]) => Promise<boolean>;
  onEliminarTarea: (id: string) => Promise<boolean>;
}

export const PlantillaCursosTab: React.FC<PlantillaCursosTabProps> = ({
  plantillaTareas,
  usuarios,
  onCrearTarea,
  onEditarTarea,
  onEliminarTarea
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroResponsable, setFiltroResponsable] = useState<string>('todos');
  const [filtroAlcance, setFiltroAlcance] = useState<'todos' | 'unidades' | 'transversal'>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [tareaEnEdicion, setTareaEnEdicion] = useState<PlantillaTareaCurso | null>(null);
  const [tareaAEliminar, setTareaAEliminar] = useState<PlantillaTareaCurso | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Filtrar usuarios pertenecientes al CMU o de áreas de diseño/producción
  const usuariosCMU = useMemo(() => {
    return usuarios.filter(u => {
      const rol = (u.rol_nombre || '').toLowerCase();
      const area = (u.area_nombre || '').toLowerCase();
      return (
        area.includes('cmu') || 
        rol.includes('cmu') || 
        rol.includes('diseño') || 
        rol.includes('multimedia') || 
        rol.includes('soporte') ||
        rol.includes('administrador')
      );
    });
  }, [usuarios]);

  // Mapa de tareas por id para mostrar códigos en las dependencias
  const tareasMap = useMemo(() => {
    const map: Record<string, PlantillaTareaCurso> = {};
    plantillaTareas.forEach(t => {
      map[t.id] = t;
    });
    return map;
  }, [plantillaTareas]);

  // Filtrado y ordenamiento
  const tareasFiltradas = useMemo(() => {
    return plantillaTareas
      .filter(t => {
        const matchesQuery = 
          t.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
          t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          (t.descripcion && t.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

        const matchesResp = 
          filtroResponsable === 'todos' || 
          t.tipo_responsable === filtroResponsable;

        const matchesAlcance = 
          filtroAlcance === 'todos' ||
          (filtroAlcance === 'unidades' && t.aplica_por_unidad) ||
          (filtroAlcance === 'transversal' && !t.aplica_por_unidad);

        return matchesQuery && matchesResp && matchesAlcance;
      })
      .sort((a, b) => a.orden - b.orden);
  }, [plantillaTareas, busqueda, filtroResponsable, filtroAlcance]);

  // Estadísticas
  const totalActivas = plantillaTareas.filter(t => t.activa).length;
  const totalPorUnidad = plantillaTareas.filter(t => t.aplica_por_unidad).length;
  const totalTransversales = plantillaTareas.filter(t => !t.aplica_por_unidad).length;
  const totalConDependencias = plantillaTareas.filter(t => t.dependencias && t.dependencias.length > 0).length;

  const totalMinutosTodas = useMemo(() => {
    return plantillaTareas.reduce((acc, t) => acc + (Number(t.tiempo_estimado) || 0), 0);
  }, [plantillaTareas]);

  const formatearDuracion = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas === 0) return `${mins}m`;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}m`;
  };

  const handleOpenNueva = () => {
    setTareaEnEdicion(null);
    setModalOpen(true);
  };

  const handleOpenEditar = (tarea: PlantillaTareaCurso) => {
    setTareaEnEdicion(tarea);
    setModalOpen(true);
  };

  const handleToggleActiva = async (tarea: PlantillaTareaCurso) => {
    await onEditarTarea(tarea.id, { activa: !tarea.activa });
  };

  const handleConfirmarEliminar = async () => {
    if (!tareaAEliminar) return;
    setEliminando(true);
    await onEliminarTarea(tareaAEliminar.id);
    setEliminando(false);
    setTareaAEliminar(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="p-6 bg-gradient-to-r from-cream-100 via-white to-sage-50 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sage-600 text-white shadow-2xs">
              Secuencia Automatizada
            </span>
            <span className="text-[10px] font-bold text-charcoal-500">
              Exclusivo para Cursos Virtuales
            </span>
          </div>
          <h2 className="text-xl font-black text-charcoal-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-sage-600" />
            Catálogo Maestro de Tareas Predeterminadas
          </h2>
          <p className="text-xs text-charcoal-500 mt-1 max-w-2xl font-medium">
            Define la secuencia lineal de las ~52 fases de producción curricular. Las dependencias 
            establecidas bloquearán o desbloquearán automáticamente las tareas operativas de cada curso.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNueva}
            className="px-5 py-2.5 bg-sage-700 hover:bg-sage-800 text-white rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nueva Tarea Base
          </button>
        </div>
      </div>

      {/* Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider">Total Base</span>
          <p className="text-2xl font-black text-charcoal-900">{plantillaTareas.length}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-purple-200/90 shadow-2xs space-y-1 bg-gradient-to-b from-purple-50/40 to-white">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <span>🔁 Por Unidad</span>
          </span>
          <p className="text-2xl font-black text-purple-800">{totalPorUnidad}</p>
          <span className="text-[10px] text-purple-600/80 font-bold block">
            Se multiplican por N
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">Transversales</span>
          <p className="text-2xl font-black text-stone-800">{totalTransversales}</p>
          <span className="text-[10px] text-stone-500 font-bold block">
            1x por curso
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            Duración Base
          </span>
          <p className="text-2xl font-black text-charcoal-900">
            {formatearDuracion(totalMinutosTodas)}
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Activas</span>
          <p className="text-2xl font-black text-emerald-600">{totalActivas}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Con Deps</span>
          <p className="text-2xl font-black text-sky-600">{totalConDependencias}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por código, título o descripción..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 font-medium text-charcoal-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={filtroAlcance}
            onChange={e => setFiltroAlcance(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white font-bold text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
          >
            <option value="todos">Todos los Ámbitos</option>
            <option value="unidades">🔁 Por Unidad (Multiplicables)</option>
            <option value="transversal">📌 Transversal (1x Curso)</option>
          </select>

          <select
            value={filtroResponsable}
            onChange={e => setFiltroResponsable(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white font-bold text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
          >
            <option value="todos">Todos los Responsables</option>
            <option value="DOCENTE">Docente del Curso</option>
            <option value="PAR_EVALUADOR">Par Evaluador</option>
            <option value="COORDINADOR">Coordinador de Programa</option>
            <option value="DECANO">Decano de Facultad</option>
            <option value="CMU_FIJO">Usuario Fijo CMU</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-charcoal-600 font-black uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Orden</th>
                <th className="py-3.5 px-3 w-20">Código</th>
                <th className="py-3.5 px-4">Título y Descripción</th>
                <th className="py-3.5 px-4">Ámbito</th>
                <th className="py-3.5 px-4">Asignación</th>
                <th className="py-3.5 px-3">Duración</th>
                <th className="py-3.5 px-4">Requiere Antes (Dependencias)</th>
                <th className="py-3.5 px-3 text-center">Activa</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-charcoal-800">
              {tareasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-charcoal-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="font-bold">No se encontraron tareas en la plantilla.</p>
                    <p className="text-[11px] text-stone-400 mt-1">Crea una nueva tarea base con el botón superior.</p>
                  </td>
                </tr>
              ) : (
                tareasFiltradas.map((tarea) => {
                  const tieneDeps = tarea.dependencias && tarea.dependencias.length > 0;
                  const depsList = (tarea.dependencias || []).map(depId => tareasMap[depId]).filter(Boolean);

                  return (
                    <tr 
                      key={tarea.id}
                      className={`hover:bg-cream-50/60 transition-colors ${!tarea.activa ? 'opacity-50 bg-stone-50/40' : ''}`}
                    >
                      {/* Orden */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-500">
                        #{tarea.orden}
                      </td>

                      {/* Código */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-md bg-stone-100 border border-stone-300 text-charcoal-900 shadow-2xs">
                          {tarea.codigo}
                        </span>
                      </td>

                      {/* Título & Descripción */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                            Fase {tarea.fase || 1}
                          </span>
                          {tarea.nombre_fase && (
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]" title={tarea.nombre_fase}>
                              • {tarea.nombre_fase}
                            </span>
                          )}
                        </div>
                        <p className="font-extrabold text-charcoal-900 text-[13px] leading-tight">
                          {tarea.titulo}
                        </p>
                        {tarea.descripcion && (
                          <p className="text-[11px] text-charcoal-500 font-normal line-clamp-1 mt-0.5">
                            {tarea.descripcion}
                          </p>
                        )}
                      </td>

                      {/* Ámbito / Sección */}
                      <td className="py-3.5 px-4">
                        {tarea.aplica_por_unidad ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit shadow-2xs">
                            🔁 Por Unidad (Nx)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1 w-fit">
                            📌 Transversal
                          </span>
                        )}
                      </td>

                      {/* Asignación */}
                      <td className="py-3.5 px-4">
                        {tarea.tipo_responsable === 'DOCENTE' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" /> Docente
                          </span>
                        )}
                        {tarea.tipo_responsable === 'PAR_EVALUADOR' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" /> Par Evaluador
                          </span>
                        )}
                        {tarea.tipo_responsable === 'COORDINADOR' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" /> Coordinador
                          </span>
                        )}
                        {tarea.tipo_responsable === 'DECANO' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" /> Decano
                          </span>
                        )}
                        {tarea.tipo_responsable === 'CMU_FIJO' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit" title={tarea.cmu_usuario_fijo_nombre || 'CMU'}>
                            <UserCheck className="w-3 h-3" /> 
                            {tarea.cmu_usuario_fijo_nombre ? `CMU: ${tarea.cmu_usuario_fijo_nombre.split(' ')[0]}` : 'CMU Fijo'}
                          </span>
                        )}
                      </td>

                      {/* Duración */}
                      <td className="py-3.5 px-3 font-semibold text-charcoal-600">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {tarea.tiempo_estimado ? `${tarea.tiempo_estimado}m` : '0m'}
                        </span>
                      </td>

                      {/* Dependencias */}
                      <td className="py-3.5 px-4">
                        {!tieneDeps ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 w-fit">
                            <Unlock className="w-3 h-3 text-emerald-600" /> Inicial (Disponible)
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-600 shrink-0 mr-0.5" />
                            {depsList.map(dep => (
                              <span
                                key={dep.id}
                                className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200"
                                title={dep.titulo}
                              >
                                {dep.codigo}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Switch Activa */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActiva(tarea)}
                          className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-all cursor-pointer ${
                            tarea.activa 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                              : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                          }`}
                          title={tarea.activa ? 'Desactivar tarea' : 'Activar tarea'}
                        >
                          {tarea.activa ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditar(tarea)}
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-sage-700 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Editar tarea de plantilla"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTareaAEliminar(tarea)}
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar tarea de plantilla"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {tareasFiltradas.length > 0 && (
              <tfoot className="bg-stone-50/90 border-t-2 border-stone-200">
                <tr className="font-extrabold text-charcoal-800">
                  <td colSpan={3} className="py-3 px-4 text-right text-[11px] uppercase tracking-wider text-charcoal-500">
                    Totalización según filtro ({tareasFiltradas.length} tareas):
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-3 font-black text-purple-700">
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      {formatearDuracion(tareasFiltradas.reduce((acc, t) => acc + (Number(t.tiempo_estimado) || 0), 0))}
                    </span>
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-[10px] text-charcoal-400 font-medium italic">
                    {tareasFiltradas.reduce((acc, t) => acc + (Number(t.tiempo_estimado) || 0), 0).toLocaleString('es-CO')} min acumulados
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal de Crear / Editar Tarea */}
      <PlantillaTareaModal
        isOpen={modalOpen}
        initialData={tareaEnEdicion}
        todasLasTareas={plantillaTareas}
        usuariosCMU={usuariosCMU}
        onSave={async (datos, dependenciasIds) => {
          if (tareaEnEdicion) {
            await onEditarTarea(tareaEnEdicion.id, datos, dependenciasIds);
          } else {
            await onCrearTarea(datos, dependenciasIds);
          }
        }}
        onClose={() => setModalOpen(false)}
      />

      {/* Modal Confirmación de Eliminación */}
      {tareaAEliminar && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-charcoal-900">
                ¿Eliminar tarea de plantilla?
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Se eliminará la tarea <strong>[{tareaAEliminar.codigo}] {tareaAEliminar.titulo}</strong> de la plantilla base y cualquier relación de dependencia existente.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTareaAEliminar(null)}
                disabled={eliminando}
                className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all cursor-pointer"
              >
                {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
