'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  FolderKanban, 
  ChevronRight, 
  ChevronDown, 
  User, 
  CheckCircle2, 
  Clock, 
  Plus,
  Filter,
  Layers,
  Sparkles,
  Palette,
  DollarSign,
  Timer
} from 'lucide-react';
import { Facultad, Programa, CursoVirtual, ProyectoEspecial, TareaCCV, Area } from '@/types';
import { getFacultyTheme } from '@/lib/facultyThemes';
import { DynamicLucideIcon } from '@/components/common/DynamicLucideIcon';
import { FacultyIdentityModal } from '@/components/academic/FacultyIdentityModal';
import { useAuth } from '@/context/AuthContext';

interface AcademicTreeProps {
  facultades: Facultad[];
  programas: Programa[];
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  areas?: Area[];
  tareas: TareaCCV[];
  busqueda: string;
  onSelectCurso: (curso: CursoVirtual) => void;
  onOpenProgreso?: (entidad: CursoVirtual | ProyectoEspecial, tipo: 'curso' | 'proyecto') => void;
}

export const AcademicTree: React.FC<AcademicTreeProps> = ({
  facultades,
  programas,
  cursos,
  proyectos,
  areas = [],
  tareas,
  busqueda,
  onSelectCurso,
  onOpenProgreso,
}) => {
  const { actualizarIdentidadFacultad, actualizarIdentidadArea } = useAuth();
  const [proyectosAbiertos, setProyectosAbiertos] = useState(true);
  const [areasProyectosAbiertas, setAreasProyectosAbiertas] = useState<Record<string, boolean>>({});
  const [facultadesAbiertas, setFacultadesAbiertas] = useState<Record<string, boolean>>({});

  // Estado para los modales de personalización de identidad
  const [facultadParaIdentidad, setFacultadParaIdentidad] = useState<Facultad | null>(null);
  const [departamentoParaIdentidad, setDepartamentoParaIdentidad] = useState<Area | null>(null);

  const toggleFacultad = (id: string) => {
    setFacultadesAbiertas(prev => ({ 
      ...prev, 
      [id]: prev[id] === false ? true : false 
    }));
  };

  const toggleAreaProyecto = (areaId: string) => {
    setAreasProyectosAbiertas(prev => ({ 
      ...prev, 
      [areaId]: prev[areaId] === false ? true : false 
    }));
  };

  const expandirTodo = () => {
    setProyectosAbiertos(true);
    const newAreas: Record<string, boolean> = {};
    proyectosPorDepartamento.forEach(d => {
      newAreas[d.departamentoId] = true;
    });
    setAreasProyectosAbiertas(newAreas);

    const newFacs: Record<string, boolean> = {};
    facultades.forEach(f => {
      newFacs[f.id] = true;
    });
    setFacultadesAbiertas(newFacs);
  };

  const colapsarTodo = () => {
    setProyectosAbiertos(false);
    const newAreas: Record<string, boolean> = {};
    proyectosPorDepartamento.forEach(d => {
      newAreas[d.departamentoId] = false;
    });
    setAreasProyectosAbiertas(newAreas);

    const newFacs: Record<string, boolean> = {};
    facultades.forEach(f => {
      newFacs[f.id] = false;
    });
    setFacultadesAbiertas(newFacs);
  };

  const handleGuardarIdentidad = async (facultadId: string, color: string, icono: string) => {
    await actualizarIdentidadFacultad(facultadId, color, icono);
  };

  const getEstadoBadge = (estado: CursoVirtual['estado'] | ProyectoEspecial['estado']) => {
    switch (estado) {
      case 'En Diseño':
      case 'Planificación':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> {estado}</span>;
      case 'En Producción':
      case 'En Proceso':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> {estado}</span>;
      case 'En Revisión':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> En Revisión</span>;
      case 'Aprobado CCV':
      case 'Completado':
        return <span className="badge-green flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {estado}</span>;
      case 'Publicado LMS':
        return <span className="bg-sage-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Publicado LMS</span>;
      case 'Pausado':
        return <span className="bg-stone-100 text-charcoal-600 border border-stone-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">Pausado</span>;
      default:
        return null;
    }
  };

  // Agrupar proyectos por Departamento (Subáreas del área DEPARTAMENTO)
  const proyectosPorDepartamento = React.useMemo(() => {
    const mapa: Record<string, { departamentoNombre: string; areaObj?: Area; proyectos: ProyectoEspecial[] }> = {};

    proyectos.forEach(proy => {
      const areaObj = areas.find(a => a.id === proy.area_id);
      const areaKey = proy.area_id || 'sin-departamento';
      const departamentoNombre = areaObj 
        ? areaObj.nombre 
        : (proy.area_id ? `Departamento (${proy.area_id})` : 'General / Sin Departamento Asignado');

      if (!mapa[areaKey]) {
        mapa[areaKey] = {
          departamentoNombre,
          areaObj,
          proyectos: []
        };
      }
      mapa[areaKey].proyectos.push(proy);
    });

    return Object.entries(mapa).map(([departamentoId, data]) => ({
      departamentoId,
      departamentoNombre: data.departamentoNombre,
      areaObj: data.areaObj,
      proyectos: data.proyectos
    }));
  }, [proyectos, areas]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="ccv-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-sage-600" />
            Estructura Académica e Institucional CCV
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Organización jerárquica de Facultades, Programas y Proyectos clasificados por sus Departamentos asignados.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            type="button"
            onClick={expandirTodo}
            className="px-3.5 py-2 rounded-xl border border-sage-200 bg-sage-50 hover:bg-sage-100 text-sage-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            title="Desplegar todas las facultades y departamentos"
          >
            Expandir todo
          </button>
          <button
            type="button"
            onClick={colapsarTodo}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-charcoal-600 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5"
            title="Plegar todas las secciones"
          >
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Proyectos Section Accordion (Clasificados por Departamento) */}
      <div className="ccv-card overflow-hidden">
        {/* Proyectos Accordion Header */}
        <div 
          onClick={() => setProyectosAbiertos(!proyectosAbiertos)}
          className="p-5 flex items-center justify-between cursor-pointer bg-amber-50/40 hover:bg-amber-50/80 transition-colors border-b border-stone-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-2xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-charcoal-900">Proyectos por Departamento</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  Clasificación Institucional
                </span>
              </div>
              <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                Iniciativas estratégicas y proyectos especiales distribuidos por el Departamento al que están asignados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              {proyectosPorDepartamento.length} {proyectosPorDepartamento.length === 1 ? 'Departamento' : 'Departamentos'} • {proyectos.length} Proyectos
            </span>
            {proyectosAbiertos ? <ChevronDown className="w-5 h-5 text-charcoal-500" /> : <ChevronRight className="w-5 h-5 text-charcoal-500" />}
          </div>
        </div>

        {/* Proyectos Content grouped by Department */}
        {proyectosAbiertos && (
          <div className="p-6 bg-stone-50/30 space-y-6">
            {proyectosPorDepartamento.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-200">
                <FolderKanban className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-charcoal-600">No hay proyectos registrados en el sistema.</p>
              </div>
            ) : (
              proyectosPorDepartamento.map(grupo => {
                const isAreaOpen = areasProyectosAbiertas[grupo.departamentoId] !== false; // Abierto por defecto
                const deptColor = grupo.areaObj?.color || 'amber';
                const deptIcono = grupo.areaObj?.icono || 'FolderKanban';
                const theme = getFacultyTheme(deptColor);

                return (
                  <div key={grupo.departamentoId} className={`bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden border-l-4 ${theme.borderLeft}`}>
                    {/* Header del Departamento de Proyectos */}
                    <div 
                      className={`p-4 bg-gradient-to-r ${theme.bgLight} via-white to-white flex items-center justify-between border-b border-stone-100 transition-colors`}
                    >
                      <div 
                        onClick={() => toggleAreaProyecto(grupo.departamentoId)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <div className={`w-8 h-8 rounded-lg ${theme.bgPrimary} text-white flex items-center justify-center font-bold shadow-2xs shrink-0`}>
                          <DynamicLucideIcon name={deptIcono} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-charcoal-900 text-sm flex items-center gap-2 truncate">
                            Departamento: {grupo.departamentoNombre}
                          </h4>
                          <span className="text-[11px] text-charcoal-500">
                            {grupo.proyectos.length} {grupo.proyectos.length === 1 ? 'Proyecto asignado' : 'Proyectos asignados'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {grupo.areaObj && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDepartamentoParaIdentidad(grupo.areaObj || null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-charcoal-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                            title="Personalizar color e icono de este departamento"
                          >
                            <Palette className="w-3.5 h-3.5 text-sage-600" />
                            <span className="hidden sm:inline">Identidad</span>
                          </button>
                        )}

                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                          {grupo.proyectos.length} Proyectos
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAreaProyecto(grupo.departamentoId)}
                          className="p-1 hover:bg-stone-100 rounded-lg text-charcoal-500"
                        >
                          {isAreaOpen ? <ChevronDown className="w-4 h-4 text-charcoal-500" /> : <ChevronRight className="w-4 h-4 text-charcoal-500" />}
                        </button>
                      </div>
                    </div>

                    {/* Grilla de Proyectos del Departamento */}
                    {isAreaOpen && (
                      <div className="p-4 bg-stone-50/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {grupo.proyectos.map((proy) => {
                            const tareasProy = tareas.filter(t => t.proyecto_id === proy.id);
                            const completadasProy = tareasProy.filter(t => t.estado === 'Completada').length;
                            const pctProy = tareasProy.length > 0 ? Math.round((completadasProy / tareasProy.length) * 100) : 0;
                            
                            // Cálculos Financieros y de Tiempo para el Proyecto
                            const horasEstimadasProy = tareasProy.reduce((sum, t) => sum + (t.tiempo_estimado || 0), 0);
                            const horasInvertidasProy = tareasProy.reduce((sum, t) => sum + (t.tiempo_invertido || 0), 0);
                            const costoTotalProy = tareasProy.reduce((sum, t) => {
                              const tarifa = t.tarifa_tarea !== undefined 
                                ? t.tarifa_tarea 
                                : (t.tarifa_hora ? t.tarifa_hora * (t.tiempo_estimado || 0) : 0);
                              return sum + tarifa;
                            }, 0);

                            return (
                              <div
                                key={proy.id}
                                onClick={() => onOpenProgreso && onOpenProgreso(proy, 'proyecto')}
                                className={`p-4 bg-white rounded-2xl border border-stone-200 ${theme.hoverBorder} hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3.5 group`}
                              >
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center font-bold shadow-2xs shrink-0 border ${theme.badgeBorder}`}>
                                        <DynamicLucideIcon name={deptIcono} className="w-4 h-4" />
                                      </div>
                                      <span className={`text-[10px] font-mono font-black border px-2.5 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                        PROYECTO CCV
                                      </span>
                                    </div>
                                    {getEstadoBadge(proy.estado)}
                                  </div>
                                  <h5 className={`font-extrabold text-charcoal-900 text-sm group-hover:${theme.textPrimary} transition-colors line-clamp-2 leading-snug`}>
                                    {proy.nombre}
                                  </h5>
                                  {proy.descripcion && (
                                    <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
                                      {proy.descripcion}
                                    </p>
                                  )}
                                </div>

                                {/* Bloque de Resumen Financiero y Tiempos */}
                                <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-xl border ${theme.bgLight} ${theme.borderLight}`}>
                                  {/* Tiempo Total */}
                                  <div className="space-y-0.5">
                                    <span className={`text-[10px] font-extrabold uppercase flex items-center gap-1 ${theme.textDark}`}>
                                      <Clock className={`w-3 h-3 ${theme.textPrimary}`} />
                                      Tiempo
                                    </span>
                                    <p className="text-xs font-black text-charcoal-900">
                                      {horasInvertidasProy}h <span className="text-[10px] font-medium text-charcoal-500">/ {horasEstimadasProy}h</span>
                                    </p>
                                  </div>

                                  {/* Costo Total */}
                                  <div className="space-y-0.5 text-right">
                                    <span className={`text-[10px] font-extrabold uppercase flex items-center justify-end gap-1 ${theme.textDark}`}>
                                      <DollarSign className="w-3 h-3 text-emerald-600" />
                                      Costo Total
                                    </span>
                                    <p className="text-xs font-black text-emerald-800">
                                      ${costoTotalProy.toLocaleString('es-CO')} <span className="text-[9px] font-bold text-emerald-600">COP</span>
                                    </p>
                                  </div>
                                </div>

                                {/* Mini Progress Bar */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-charcoal-500 uppercase">Avance Tareas</span>
                                    <span className={theme.textPrimary}>{pctProy}%</span>
                                  </div>
                                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${theme.progressFill}`} style={{ width: `${pctProy}%` }} />
                                  </div>
                                </div>

                                <div className={`pt-2 border-t border-stone-100 text-xs text-charcoal-500 flex justify-between items-center font-semibold ${theme.textDark} text-[11px]`}>
                                  <span>{completadasProy}/{tareasProy.length} Tareas</span>
                                  <span className={`text-[10px] bg-stone-100 px-2 py-0.5 rounded-lg text-charcoal-600 group-hover:${theme.badgeBg} group-hover:${theme.badgeText} transition-colors`}>
                                    Ver desglose financiero →
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Faculties Accordion Tree */}
      <div className="space-y-4">
        {facultades.length === 0 ? (
          <div className="ccv-card p-10 text-center space-y-3 bg-white">
            <div className="w-12 h-12 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center mx-auto shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-charcoal-900">Sin Facultades o Cursos Asignados</h3>
            <p className="text-xs text-charcoal-500 max-w-md mx-auto leading-relaxed">
              No posees facultades, programas o cursos asignados bajo tu nivel jerárquico actual en el sistema.
            </p>
          </div>
        ) : (
          facultades.map((facultad) => {
            const progsFacultad = programas.filter(p => p.facultad_id === facultad.id);
            const isOpen = facultadesAbiertas[facultad.id] !== false;
            const theme = getFacultyTheme(facultad.color);
            const iconoFacultad = facultad.icono || 'Building2';

            return (
              <div key={facultad.id} className={`ccv-card overflow-hidden shadow-sm border ${theme.borderLight} border-l-[6px] ${theme.borderLeft}`}>
                {/* Faculty Accordion Header */}
                <div 
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-white ${theme.bgLightHover} transition-colors border-b ${theme.borderLight}`}
                >
                  <div 
                    onClick={() => toggleFacultad(facultad.id)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className={`w-11 h-11 rounded-2xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center font-bold shadow-2xs shrink-0`}>
                      <DynamicLucideIcon name={iconoFacultad} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-charcoal-900">{facultad.nombre}</h3>
                      </div>
                      <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-charcoal-400" /> Decano: <span className="font-semibold text-charcoal-700">{facultad.decano_nombre || 'No asignado'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Botón Personalizar Identidad de la Facultad */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFacultadParaIdentidad(facultad);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} hover:scale-102`}
                      title="Personalizar color e ícono de esta facultad"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Identidad Visual</span>
                    </button>

                    <span className="text-xs font-semibold text-charcoal-600 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                      {progsFacultad.length} Programas
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleFacultad(facultad.id)}
                      className="p-1 text-charcoal-400 hover:text-charcoal-700 transition-colors"
                    >
                      {isOpen ? <ChevronDown className="w-5 h-5 text-charcoal-500" /> : <ChevronRight className="w-5 h-5 text-charcoal-500" />}
                    </button>
                  </div>
                </div>

                {/* Programs and Courses Accordion Body */}
                {isOpen && (
                  <div className="p-5 space-y-5 bg-stone-50/30">
                    {progsFacultad.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl border border-dashed border-stone-200 bg-white">
                        <p className="text-xs font-semibold text-charcoal-500">
                          Esta facultad aún no tiene programas académicos registrados.
                        </p>
                      </div>
                    ) : (
                      progsFacultad.map((prog) => {
                        const cursosProg = cursos.filter(c => c.programa_id === prog.id);
                        return (
                          <div 
                            key={prog.id} 
                            className={`p-5 bg-white rounded-2xl border ${theme.borderLight} shadow-2xs space-y-4 border-l-4 ${theme.borderLeft}`}
                          >
                            {/* Program Header Banner */}
                            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${theme.borderLight}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center shadow-xs shrink-0`}>
                                  <DynamicLucideIcon name={iconoFacultad} fallbackName="GraduationCap" className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText}`}>
                                      PROGRAMA HEREDADO
                                    </span>
                                  </div>
                                  <h4 className="font-black text-charcoal-900 text-base leading-tight mt-0.5">
                                    {prog.nombre}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                <span className={`text-xs font-bold ${theme.textPrimary} bg-white px-3 py-1 rounded-full border ${theme.borderLight} shadow-2xs flex items-center gap-1.5`}>
                                  <User className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
                                  Coord: <strong className="text-charcoal-900">{prog.coordinador_nombre || 'Sin Asignar'}</strong>
                                </span>
                                <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                  {cursosProg.length} Cursos
                                </span>
                              </div>
                            </div>

                            {/* Courses Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                              {cursosProg.length === 0 ? (
                                <div className="col-span-full p-4 text-center rounded-xl border border-dashed border-stone-200 text-xs text-charcoal-400">
                                  Sin cursos virtuales asignados a este programa
                                </div>
                              ) : (
                                cursosProg.map((curso) => {
                                  const tareasCurso = tareas.filter(t => t.curso_id === curso.id);
                                  const completadasCurso = tareasCurso.filter(t => t.estado === 'Completada').length;
                                  const pctCurso = tareasCurso.length > 0 ? Math.round((completadasCurso / tareasCurso.length) * 100) : 0;

                                  return (
                                    <div
                                      key={curso.id}
                                      onClick={() => onOpenProgreso ? onOpenProgreso(curso, 'curso') : onSelectCurso(curso)}
                                      className={`p-4 bg-white rounded-2xl border border-stone-200 ${theme.hoverBorder} hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group`}
                                    >
                                      <div>
                                        <div className="flex justify-between items-start mb-2">
                                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                            {curso.codigo}
                                          </span>
                                          {getEstadoBadge(curso.estado)}
                                        </div>
                                        <h5 className={`font-extrabold text-charcoal-900 text-sm line-clamp-2 group-hover:${theme.textPrimary} transition-colors`}>{curso.nombre}</h5>
                                      </div>

                                      {/* Mini Progress Bar */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                          <span className="text-charcoal-500 uppercase">Avance</span>
                                          <span className={theme.textPrimary}>{pctCurso}%</span>
                                        </div>
                                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full transition-all duration-500 ${theme.progressFill}`} style={{ width: `${pctCurso}%` }} />
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t border-stone-100 text-xs text-charcoal-500 space-y-1">
                                        <p className="truncate"><span className="font-semibold text-charcoal-700">Docente:</span> {curso.docente_nombre}</p>
                                        <div className={`flex justify-between items-center pt-1 font-semibold text-[11px] ${theme.textPrimary}`}>
                                          <span>Periodo: {curso.periodo}</span>
                                          <span>{completadasCurso}/{tareasCurso.length} Tareas</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Personalización de Identidad Visual para Facultades */}
      <FacultyIdentityModal
        isOpen={!!facultadParaIdentidad}
        onClose={() => setFacultadParaIdentidad(null)}
        facultad={facultadParaIdentidad}
        tipo="facultad"
        onSave={handleGuardarIdentidad}
      />

      {/* Modal de Personalización de Identidad Visual para Departamentos */}
      <FacultyIdentityModal
        isOpen={!!departamentoParaIdentidad}
        onClose={() => setDepartamentoParaIdentidad(null)}
        area={departamentoParaIdentidad}
        tipo="departamento"
        onSave={async (areaId, color, icono) => {
          await actualizarIdentidadArea(areaId, color, icono);
        }}
      />
    </div>
  );
};
