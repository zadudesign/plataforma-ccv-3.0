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
  Timer,
  Trash2,
  FolderOpen,
  ExternalLink
} from 'lucide-react';
import { Facultad, Programa, CursoVirtual, ProyectoEspecial, TareaCCV, Area } from '@/types';
import { getFacultyTheme } from '@/lib/facultyThemes';
import { DynamicLucideIcon } from '@/components/common/DynamicLucideIcon';
import { FacultyIdentityModal } from '@/components/academic/FacultyIdentityModal';
import { useAuth } from '@/context/AuthContext';
import { calcularProgresoCurso, calcularProgresoProyecto, redondearHoras } from '@/lib/progressUtils';

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
  const { actualizarIdentidadFacultad, actualizarIdentidadArea, isAdmin, eliminarCurso, eliminarPrograma } = useAuth();
  const [proyectosAbiertos, setProyectosAbiertos] = useState(true);
  const [areasProyectosAbiertas, setAreasProyectosAbiertas] = useState<Record<string, boolean>>({});
  const [subareasProyectosAbiertas, setSubareasProyectosAbiertas] = useState<Record<string, boolean>>({});
  const [facultadesAbiertas, setFacultadesAbiertas] = useState<Record<string, boolean>>({});

  // Estado para los modales de personalización de identidad
  const [facultadParaIdentidad, setFacultadParaIdentidad] = useState<Facultad | null>(null);
  const [departamentoParaIdentidad, setDepartamentoParaIdentidad] = useState<Area | null>(null);

  const toggleFacultad = (id: string) => {
    setFacultadesAbiertas(prev => {
      const actual = prev[id] !== undefined ? prev[id] : true;
      return { 
        ...prev, 
        [id]: !actual 
      };
    });
  };

  const toggleAreaProyecto = (areaId: string) => {
    setAreasProyectosAbiertas(prev => {
      const actual = prev[areaId] !== undefined ? prev[areaId] : true;
      return { 
        ...prev, 
        [areaId]: !actual 
      };
    });
  };

  const toggleSubareaProyecto = (subareaId: string) => {
    setSubareasProyectosAbiertas(prev => {
      const actual = prev[subareaId] !== undefined ? prev[subareaId] : true;
      return { 
        ...prev, 
        [subareaId]: !actual 
      };
    });
  };

  // Agrupar proyectos organizados por Áreas y Sub-áreas en orden alfabético
  const proyectosPorAreasYSubareas = React.useMemo(() => {
    // 1. Identificar todas las áreas padre / principales
    const isChild = (a: Area) => {
      if (!a.parent_id && !a.area_padre_nombre) return false;
      return areas.some(parent => 
        parent.id !== a.id && (
          parent.id === a.parent_id || 
          parent.nombre.toLowerCase() === a.parent_id?.toLowerCase() ||
          parent.nombre.toLowerCase() === a.area_padre_nombre?.toLowerCase()
        )
      );
    };

    const areasPadre = areas.filter(a => !isChild(a));

    // Mapa para cada área padre
    const mapaAreas: Record<string, {
      areaObj?: Area;
      areaNombre: string;
      proyectosDirectos: ProyectoEspecial[];
      mapaSubareas: Record<string, { subareaObj: Area; subareaNombre: string; proyectos: ProyectoEspecial[] }>;
    }> = {};

    // Inicializar áreas padre
    areasPadre.forEach(ap => {
      mapaAreas[ap.id] = {
        areaObj: ap,
        areaNombre: ap.nombre,
        proyectosDirectos: [],
        mapaSubareas: {}
      };
    });

    // Contenedor para proyectos sin área asignada
    const orphanKey = 'sin-area';
    mapaAreas[orphanKey] = {
      areaNombre: 'General / Sin Departamento Asignado',
      proyectosDirectos: [],
      mapaSubareas: {}
    };

    // 2. Distribuir cada proyecto en su Área Directa o en su Sub-área
    proyectos.forEach(proy => {
      const proyArea = areas.find(a => 
        a.id === proy.area_id || 
        a.nombre.toLowerCase() === proy.area_id?.toLowerCase()
      );

      if (!proyArea) {
        mapaAreas[orphanKey].proyectosDirectos.push(proy);
        return;
      }

      // Comprobar si proyArea es una sub-área
      const parentArea = areasPadre.find(p => 
        p.id === proyArea.parent_id || 
        p.nombre.toLowerCase() === proyArea.parent_id?.toLowerCase() ||
        p.nombre.toLowerCase() === proyArea.area_padre_nombre?.toLowerCase()
      );

      if (parentArea) {
        // Pertenece a una sub-área bajo parentArea
        if (!mapaAreas[parentArea.id]) {
          mapaAreas[parentArea.id] = {
            areaObj: parentArea,
            areaNombre: parentArea.nombre,
            proyectosDirectos: [],
            mapaSubareas: {}
          };
        }
        if (!mapaAreas[parentArea.id].mapaSubareas[proyArea.id]) {
          mapaAreas[parentArea.id].mapaSubareas[proyArea.id] = {
            subareaObj: proyArea,
            subareaNombre: proyArea.nombre,
            proyectos: []
          };
        }
        mapaAreas[parentArea.id].mapaSubareas[proyArea.id].proyectos.push(proy);
      } else {
        // Es un área principal o independiente
        if (!mapaAreas[proyArea.id]) {
          mapaAreas[proyArea.id] = {
            areaObj: proyArea,
            areaNombre: proyArea.nombre,
            proyectosDirectos: [],
            mapaSubareas: {}
          };
        }
        mapaAreas[proyArea.id].proyectosDirectos.push(proy);
      }
    });

    // Helper para cálculo financiero y de horas
    const calcCostoYHoras = (listaProyectos: ProyectoEspecial[]) => {
      let costo = 0;
      let horas = 0;
      listaProyectos.forEach(proy => {
        const tareasProy = tareas.filter(t => t.proyecto_id === proy.id);
        const costoProy = tareasProy.reduce((sum, t) => {
          const tarifa = t.tarifa_tarea !== undefined 
            ? t.tarifa_tarea 
            : (t.tarifa_hora ? t.tarifa_hora * (t.tiempo_invertido || 1) : 0);
          return sum + tarifa;
        }, 0);
        const horasProy = tareasProy.reduce((sum, t) => sum + (t.tiempo_invertido || 0) + (t.tiempo_invertido_secundario || 0), 0);
        costo += costoProy;
        horas += horasProy;
      });
      return { costo, horas: redondearHoras(horas) };
    };

    // 3. Transformar y ordenar alfabéticamente
    const resultado = Object.entries(mapaAreas)
      .map(([areaId, data]) => {
        // Proyectos directos ordenados alfabéticamente
        const proyectosDirectos = [...data.proyectosDirectos].sort((a, b) => 
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
        const { costo: costoDirecto, horas: horasDirectas } = calcCostoYHoras(proyectosDirectos);

        // Sub-áreas con proyectos ordenados alfabéticamente
        const subareas = Object.entries(data.mapaSubareas)
          .map(([subId, subData]) => {
            const proyectosSub = [...subData.proyectos].sort((a, b) => 
              a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
            );
            const { costo: costoSub, horas: horasSub } = calcCostoYHoras(proyectosSub);
            return {
              subareaId: subId,
              subareaNombre: subData.subareaNombre,
              subareaObj: subData.subareaObj,
              proyectos: proyectosSub,
              costoTotalSubarea: costoSub,
              horasTotalesSubarea: horasSub,
            };
          })
          .filter(sub => sub.proyectos.length > 0)
          .sort((a, b) => a.subareaNombre.localeCompare(b.subareaNombre, 'es', { sensitivity: 'base' }));

        const costoSubareas = subareas.reduce((acc, s) => acc + s.costoTotalSubarea, 0);
        const horasSubareas = redondearHoras(subareas.reduce((acc, s) => acc + s.horasTotalesSubarea, 0));
        const totalProyectos = proyectosDirectos.length + subareas.reduce((acc, s) => acc + s.proyectos.length, 0);

        return {
          areaId,
          areaNombre: data.areaNombre,
          areaObj: data.areaObj,
          proyectosDirectos,
          subareas,
          costoTotalArea: costoDirecto + costoSubareas,
          horasTotalesArea: redondearHoras(horasDirectas + horasSubareas),
          totalProyectos,
        };
      })
      .filter(item => item.totalProyectos > 0)
      .sort((a, b) => {
        if (a.areaId === 'sin-area') return 1;
        if (b.areaId === 'sin-area') return -1;
        return a.areaNombre.localeCompare(b.areaNombre, 'es', { sensitivity: 'base' });
      });

    return resultado;
  }, [proyectos, areas, tareas]);

  const costoTotalGlobalProyectos = React.useMemo(() => {
    return proyectosPorAreasYSubareas.reduce((acc, d) => acc + d.costoTotalArea, 0);
  }, [proyectosPorAreasYSubareas]);

  const expandirTodo = () => {
    setProyectosAbiertos(true);
    const newAreas: Record<string, boolean> = {};
    const newSubareas: Record<string, boolean> = {};
    proyectosPorAreasYSubareas.forEach(d => {
      newAreas[d.areaId] = true;
      d.subareas.forEach(s => {
        newSubareas[s.subareaId] = true;
      });
    });
    setAreasProyectosAbiertas(newAreas);
    setSubareasProyectosAbiertas(newSubareas);

    const newFacs: Record<string, boolean> = {};
    facultades.forEach(f => {
      newFacs[f.id] = true;
    });
    setFacultadesAbiertas(newFacs);
  };

  const colapsarTodo = () => {
    setProyectosAbiertos(false);
    const newAreas: Record<string, boolean> = {};
    const newSubareas: Record<string, boolean> = {};
    proyectosPorAreasYSubareas.forEach(d => {
      newAreas[d.areaId] = false;
      d.subareas.forEach(s => {
        newSubareas[s.subareaId] = false;
      });
    });
    setAreasProyectosAbiertas(newAreas);
    setSubareasProyectosAbiertas(newSubareas);

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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="ccv-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-sage-600" />
            Estructura Académica e Institucional
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

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              {proyectosPorAreasYSubareas.length} {proyectosPorAreasYSubareas.length === 1 ? 'Área' : 'Áreas'} • {proyectos.length} Proyectos
            </span>
            <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              Total Proyectos: ${costoTotalGlobalProyectos.toLocaleString('es-CO')} COP
            </span>
            {proyectosAbiertos ? <ChevronDown className="w-5 h-5 text-charcoal-500" /> : <ChevronRight className="w-5 h-5 text-charcoal-500" />}
          </div>
        </div>

        {/* Proyectos Content grouped by Area & Sub-area in alphabetical order */}
        {proyectosAbiertos && (
          <div className="p-6 bg-stone-50/30 space-y-6">
            {proyectosPorAreasYSubareas.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-200">
                <FolderKanban className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-charcoal-600">No hay proyectos registrados en el sistema.</p>
              </div>
            ) : (
              proyectosPorAreasYSubareas.map(grupo => {
                const isAreaOpen = areasProyectosAbiertas[grupo.areaId] !== undefined 
                  ? areasProyectosAbiertas[grupo.areaId] 
                  : true; // Expandido por defecto
                const deptColor = grupo.areaObj?.color || 'amber';
                const deptIcono = grupo.areaObj?.icono || 'FolderKanban';
                const theme = getFacultyTheme(deptColor);

                // Función auxiliar para renderizar cada tarjeta de proyecto
                const renderProyectoCard = (proy: ProyectoEspecial, cardTheme: ReturnType<typeof getFacultyTheme>, iconName: string) => {
                  const tareasProy = tareas.filter(t => t.proyecto_id === proy.id);
                  const completadasProy = tareasProy.filter(t => t.estado === 'Completada').length;
                  const pctProy = calcularProgresoProyecto(proy, tareas);
                  
                  // Cálculos Financieros y de Tiempo para el Proyecto
                  const horasInvertidasProy = redondearHoras(tareasProy.reduce((sum, t) => sum + (t.tiempo_invertido || 0) + (t.tiempo_invertido_secundario || 0), 0));
                  const costoTotalProy = tareasProy.reduce((sum, t) => {
                    const tarifa = t.tarifa_tarea !== undefined 
                      ? t.tarifa_tarea 
                      : (t.tarifa_hora ? t.tarifa_hora * (t.tiempo_invertido || 1) : 0);
                    return sum + tarifa;
                  }, 0);

                  return (
                    <div
                      key={proy.id}
                      onClick={() => onOpenProgreso && onOpenProgreso(proy, 'proyecto')}
                      className={`p-4 bg-white rounded-2xl border border-stone-200 ${cardTheme.hoverBorder} hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3.5 group`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-xl ${cardTheme.iconBg} ${cardTheme.iconText} flex items-center justify-center font-bold shadow-2xs shrink-0 border ${cardTheme.badgeBorder}`}>
                              <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-mono font-black border px-2.5 py-0.5 rounded-md ${cardTheme.badgeBg} ${cardTheme.badgeText} ${cardTheme.badgeBorder}`}>
                              PROYECTO
                            </span>
                          </div>
                          {getEstadoBadge(proy.estado)}
                        </div>
                        <h5 className={`font-extrabold text-charcoal-900 text-sm group-hover:${cardTheme.textPrimary} transition-colors line-clamp-2 leading-snug`}>
                          {proy.nombre}
                        </h5>
                        {proy.descripcion && (
                          <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
                            {proy.descripcion}
                          </p>
                        )}
                        {proy.link_onedrive && (
                          <div className="pt-0.5">
                            <a
                              href={proy.link_onedrive}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100 hover:text-blue-900 px-2.5 py-1 rounded-xl border border-blue-200 transition-all shadow-2xs group/link"
                              title="Abrir carpeta de recursos en OneDrive"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-blue-600 group-hover/link:scale-110 transition-transform" />
                              <span>OneDrive Recursos</span>
                              <ExternalLink className="w-3 h-3 text-blue-400 group-hover/link:text-blue-600" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Bloque de Resumen Financiero y Tiempos */}
                      <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-xl border ${cardTheme.bgLight} ${cardTheme.borderLight}`}>
                        {/* Tiempo Total */}
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold uppercase flex items-center gap-1 ${cardTheme.textDark}`}>
                            <Clock className={`w-3 h-3 ${cardTheme.textPrimary}`} />
                            Tiempo
                          </span>
                          <p className="text-xs font-black text-charcoal-900">
                            {horasInvertidasProy} hrs
                          </p>
                        </div>

                        {/* Costo Total */}
                        <div className="space-y-0.5 text-right">
                          <span className={`text-[10px] font-extrabold uppercase flex items-center justify-end gap-1 ${cardTheme.textDark}`}>
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
                          <span className={cardTheme.textPrimary}>{pctProy}%</span>
                        </div>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${cardTheme.progressFill}`} style={{ width: `${pctProy}%` }} />
                        </div>
                      </div>

                      <div className={`pt-2 border-t border-stone-100 text-xs text-charcoal-500 flex justify-between items-center font-semibold ${cardTheme.textDark} text-[11px]`}>
                        <span>{completadasProy}/{tareasProy.length} Tareas</span>
                        <span className={`text-[10px] bg-stone-100 px-2 py-0.5 rounded-lg text-charcoal-600 group-hover:${cardTheme.badgeBg} group-hover:${cardTheme.badgeText} transition-colors`}>
                          Ver desglose financiero →
                        </span>
                      </div>
                    </div>
                  );
                };

                return (
                  <div key={grupo.areaId} className={`bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden border-l-4 ${theme.borderLeft}`}>
                    {/* Header del Área Principal */}
                    <div 
                      className={`p-4 bg-gradient-to-r ${theme.bgLight} via-white to-white flex items-center justify-between border-b border-stone-100 transition-colors`}
                    >
                      <div 
                        onClick={() => toggleAreaProyecto(grupo.areaId)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <div className={`w-8 h-8 rounded-lg ${theme.bgPrimary} text-white flex items-center justify-center font-bold shadow-2xs shrink-0`}>
                          <DynamicLucideIcon name={deptIcono} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-charcoal-900 text-sm flex items-center gap-2 truncate">
                            {grupo.areaObj ? `Área: ${grupo.areaNombre}` : grupo.areaNombre}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span className="text-[11px] text-charcoal-500">
                              {grupo.totalProyectos} {grupo.totalProyectos === 1 ? 'Proyecto total' : 'Proyectos totales'}
                              {grupo.subareas.length > 0 && ` (${grupo.subareas.length} ${grupo.subareas.length === 1 ? 'sub-área' : 'sub-áreas'})`} • {grupo.horasTotalesArea} hrs invertidas
                            </span>
                            {grupo.areaObj?.jefe_nombre && (
                              <span className="text-[10.5px] font-bold text-amber-900 bg-amber-50 px-2 py-0.2 rounded-md border border-amber-200 shadow-2xs flex items-center gap-1">
                                <User className="w-3 h-3 text-amber-700" /> Jefe: {grupo.areaObj.jefe_nombre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                        {/* KPI Costo Total del Área */}
                        <div className="flex items-center gap-1.5 bg-white/90 border border-emerald-300/80 text-emerald-950 px-3 py-1 rounded-xl shadow-2xs">
                          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider">Costo Área</span>
                            <span className="text-xs font-black text-emerald-950 leading-tight">
                              ${grupo.costoTotalArea.toLocaleString('es-CO')} <span className="text-[10px] text-emerald-700 font-bold">COP</span>
                            </span>
                          </div>
                        </div>

                        {isAdmin() && grupo.areaObj && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDepartamentoParaIdentidad(grupo.areaObj || null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-charcoal-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                            title="Personalizar color e icono de este departamento (Solo Administrador)"
                          >
                            <Palette className="w-3.5 h-3.5 text-sage-600" />
                            <span className="hidden sm:inline">Identidad</span>
                          </button>
                        )}

                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                          {grupo.totalProyectos} {grupo.totalProyectos === 1 ? 'Proyecto' : 'Proyectos'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAreaProyecto(grupo.areaId)}
                          className="p-1 hover:bg-stone-100 rounded-lg text-charcoal-500"
                        >
                          {isAreaOpen ? <ChevronDown className="w-4 h-4 text-charcoal-500" /> : <ChevronRight className="w-4 h-4 text-charcoal-500" />}
                        </button>
                      </div>
                    </div>

                    {/* Contenido del Área: Proyectos directos y Sub-áreas */}
                    {isAreaOpen && (
                      <div className="p-4 bg-stone-50/40 space-y-4">
                        {/* 1. Proyectos asignados directamente al Área Principal */}
                        {grupo.proyectosDirectos.length > 0 && (
                          <div className="space-y-2.5">
                            {grupo.subareas.length > 0 && (
                              <div className="flex items-center gap-2 px-1">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                                  Proyectos Directos del Área ({grupo.proyectosDirectos.length})
                                </span>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {grupo.proyectosDirectos.map((proy) => renderProyectoCard(proy, theme, deptIcono))}
                            </div>
                          </div>
                        )}

                        {/* 2. Sub-áreas pertenecientes a esta Área Principal */}
                        {grupo.subareas.length > 0 && (
                          <div className="space-y-3.5">
                            {grupo.proyectosDirectos.length > 0 && (
                              <div className="flex items-center gap-2 pt-2 px-1 border-t border-stone-200/80">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900 bg-purple-100/80 px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">
                                  Sub-áreas Asignadas ({grupo.subareas.length})
                                </span>
                              </div>
                            )}

                            {grupo.subareas.map((sub) => {
                              const isSubOpen = subareasProyectosAbiertas[sub.subareaId] !== undefined
                                ? subareasProyectosAbiertas[sub.subareaId]
                                : true; // Expandido por defecto
                              const subColor = sub.subareaObj?.color || 'purple';
                              const subIcono = sub.subareaObj?.icono || 'Layers';
                              const subTheme = getFacultyTheme(subColor);

                              return (
                                <div 
                                  key={sub.subareaId} 
                                  className={`bg-white rounded-xl border border-stone-200/90 shadow-2xs overflow-hidden border-l-4 ${subTheme.borderLeft}`}
                                >
                                  {/* Header de la Sub-área */}
                                  <div 
                                    className={`p-3.5 bg-gradient-to-r ${subTheme.bgLight} via-white to-white flex items-center justify-between border-b border-stone-100 transition-colors cursor-pointer`}
                                    onClick={() => toggleSubareaProyecto(sub.subareaId)}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <div className={`w-7 h-7 rounded-lg ${subTheme.bgPrimary} text-white flex items-center justify-center font-bold shadow-2xs shrink-0`}>
                                        <DynamicLucideIcon name={subIcono} className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="font-extrabold text-charcoal-900 text-xs flex items-center gap-1.5 truncate">
                                          Sub-área: {sub.subareaNombre}
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                            Sub-área
                                          </span>
                                        </h5>
                                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                          <span className="text-[10.5px] text-charcoal-500">
                                            {sub.proyectos.length} {sub.proyectos.length === 1 ? 'Proyecto' : 'Proyectos'} • {sub.horasTotalesSubarea} hrs invertidas
                                          </span>
                                          {sub.subareaObj?.jefe_nombre && (
                                            <span className="text-[9.5px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200 flex items-center gap-1">
                                              <User className="w-2.5 h-2.5 text-amber-700" /> Resp: {sub.subareaObj.jefe_nombre}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <div className="flex items-center gap-1 bg-white/95 border border-emerald-300/80 text-emerald-950 px-2 py-0.5 rounded-lg text-xs font-bold shadow-2xs">
                                        <DollarSign className="w-3 h-3 text-emerald-600" />
                                        <span>${sub.costoTotalSubarea.toLocaleString('es-CO')} COP</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSubareaProyecto(sub.subareaId);
                                        }}
                                        className="p-1 hover:bg-stone-100 rounded-lg text-charcoal-500"
                                      >
                                        {isSubOpen ? <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" /> : <ChevronRight className="w-3.5 h-3.5 text-charcoal-500" />}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Grilla de Proyectos de la Sub-área */}
                                  {isSubOpen && (
                                    <div className="p-3.5 bg-stone-50/20">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {sub.proyectos.map((proy) => renderProyectoCard(proy, subTheme, subIcono))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
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
            const isOpen = facultadesAbiertas[facultad.id] !== undefined 
              ? facultadesAbiertas[facultad.id] 
              : true; // Expandido por defecto
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
                    {/* Botón Personalizar Identidad de la Facultad (Solo Administrador) */}
                    {isAdmin() && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFacultadParaIdentidad(facultad);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} hover:scale-102`}
                        title="Personalizar color e ícono de esta facultad (Solo Administrador)"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Identidad Visual</span>
                      </button>
                    )}

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
                                {isAdmin() && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`¿Estás seguro de eliminar el programa "${prog.nombre}"? Esta acción también eliminará sus cursos asociados.`)) {
                                        eliminarPrograma(prog.id);
                                      }
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-stone-200 hover:border-rose-200 shadow-2xs"
                                    title={`Eliminar Programa ${prog.nombre}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
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
                                  const pctCurso = calcularProgresoCurso(curso, tareas);

                                  return (
                                    <div
                                      key={curso.id}
                                      onClick={() => onOpenProgreso ? onOpenProgreso(curso, 'curso') : onSelectCurso(curso)}
                                      className={`p-4 bg-white rounded-2xl border border-stone-200 ${theme.hoverBorder} hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group`}
                                    >
                                      <div>
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                            {curso.codigo}
                                          </span>
                                          <div className="flex items-center gap-1.5">
                                            {getEstadoBadge(curso.estado)}
                                            {isAdmin() && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (window.confirm(`¿Estás seguro de eliminar el curso "${curso.nombre}" (${curso.codigo})?`)) {
                                                    eliminarCurso(curso.id);
                                                  }
                                                }}
                                                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                                title={`Eliminar Curso ${curso.nombre}`}
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>
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
