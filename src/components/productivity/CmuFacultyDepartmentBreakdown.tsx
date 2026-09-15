'use client';

import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Building2, 
  Layers, 
  Clock, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  X,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { MetricasRemisionEntidad, TipoRemision } from '@/lib/remisionUtils';

interface CmuFacultyDepartmentBreakdownProps {
  metricasEntidades: MetricasRemisionEntidad[];
  entidadSeleccionada: string | null;
  onSelectEntidad: (nombre: string | null) => void;
  ambitoTexto: string;
}

export const CmuFacultyDepartmentBreakdown: React.FC<CmuFacultyDepartmentBreakdownProps> = ({
  metricasEntidades,
  entidadSeleccionada,
  onSelectEntidad,
  ambitoTexto,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoRemision>('todos');

  // Filtrado de entidades según tipo
  const entidadesFiltradas = useMemo(() => {
    if (filtroTipo === 'todos') return metricasEntidades;
    return metricasEntidades.filter(e => e.tipo === filtroTipo);
  }, [metricasEntidades, filtroTipo]);

  // Conteos y métricas de cabecera
  const totalFacultades = metricasEntidades.filter(e => e.tipo === 'Facultad').length;
  const totalDepartamentos = metricasEntidades.filter(e => e.tipo === 'Departamento').length;
  const totalHorasGlobales = metricasEntidades.reduce((acc, e) => acc + e.horasEstimadas, 0);
  const totalTareasGlobales = metricasEntidades.reduce((acc, e) => acc + e.totalTareas, 0);

  const entidadTop = metricasEntidades.length > 0 ? metricasEntidades[0] : null;

  return (
    <div className="ccv-card p-5 bg-white border border-stone-200 shadow-xs space-y-4">
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <BarChart2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-charcoal-900">
                Demanda por Facultad y Departamento Remitente
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {ambitoTexto}
              </span>
            </div>
            <p className="text-xs text-charcoal-500">
              Distribución de las tareas y horas de los roles CMU según la entidad solicitante
            </p>
          </div>
        </div>

        {/* Filtros por tipo de entidad */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filtroTipo === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({metricasEntidades.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('Facultad')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filtroTipo === 'Facultad' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Facultades ({totalFacultades})</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('Departamento')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filtroTipo === 'Departamento' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Departamentos ({totalDepartamentos})</span>
          </button>
        </div>
      </div>

      {/* Mini KPIs de Impacto Institucional */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-cream-50/70 rounded-2xl border border-stone-200">
          <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block">
            Facultades Atendidas
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black text-emerald-800">{totalFacultades}</span>
            <span className="text-[11px] text-charcoal-500 font-semibold">unidades académicas</span>
          </div>
        </div>

        <div className="p-3 bg-cream-50/70 rounded-2xl border border-stone-200">
          <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block">
            Departamentos / Áreas
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black text-sky-800">{totalDepartamentos}</span>
            <span className="text-[11px] text-charcoal-500 font-semibold">dependencias activas</span>
          </div>
        </div>

        <div className="p-3 bg-cream-50/70 rounded-2xl border border-stone-200">
          <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block">
            Volumen Total Asignado
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black text-charcoal-900">{totalHorasGlobales}h</span>
            <span className="text-[11px] text-charcoal-500 font-semibold">({totalTareasGlobales} tareas)</span>
          </div>
        </div>

        <div className="p-3 bg-cream-50/70 rounded-2xl border border-stone-200">
          <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block">
            Mayor Demanda de Horas
          </span>
          <div className="truncate mt-0.5">
            <span className="text-xs font-black text-charcoal-900 truncate block" title={entidadTop?.nombre || 'Ninguna'}>
              {entidadTop?.nombre || 'Sin asignaciones'}
            </span>
            <span className="text-[10px] text-amber-700 font-extrabold">
              {entidadTop ? `${entidadTop.horasEstimadas}h (${entidadTop.porcentajeHoras}% del total)` : '0h'}
            </span>
          </div>
        </div>
      </div>

      {/* Indicador de Filtro Activo si el usuario seleccionó una entidad */}
      {entidadSeleccionada && (
        <div className="p-2.5 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Filtrando la vista por: <strong className="text-amber-300">{entidadSeleccionada}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectEntidad(null)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            Quitar Filtro
          </button>
        </div>
      )}

      {/* Grilla de Entidades Remitentes */}
      {entidadesFiltradas.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
          <p className="text-xs font-semibold text-charcoal-600">
            No hay tareas registradas para el tipo de entidad seleccionado en este periodo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {entidadesFiltradas.map(entidad => {
            const esSeleccionada = entidadSeleccionada === entidad.nombre;
            const esFacultad = entidad.tipo === 'Facultad';
            const Icono = esFacultad ? GraduationCap : Building2;

            const cardTheme = esFacultad
              ? esSeleccionada
                ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/50'
                : 'border-emerald-100 hover:border-emerald-300 bg-white hover:bg-emerald-50/20'
              : esSeleccionada
              ? 'border-sky-500 ring-2 ring-sky-500/30 bg-sky-50/50'
              : 'border-sky-100 hover:border-sky-300 bg-white hover:bg-sky-50/20';

            const badgeTheme = esFacultad
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-sky-100 text-sky-800 border-sky-200';

            const barColor = esFacultad ? 'bg-emerald-500' : 'bg-sky-500';

            return (
              <div
                key={`${entidad.tipo}_${entidad.nombre}`}
                onClick={() => onSelectEntidad(esSeleccionada ? null : entidad.nombre)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-sm space-y-2.5 ${cardTheme}`}
              >
                {/* Cabecera de la Entidad */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      esFacultad ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      <Icono className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-charcoal-900 truncate" title={entidad.nombre}>
                        {entidad.nombre}
                      </h4>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md border ${badgeTheme}`}>
                        {entidad.tipo}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-charcoal-900 block">
                      {entidad.horasEstimadas}h
                    </span>
                    <span className="text-[10px] text-charcoal-500 font-semibold">
                      {entidad.totalTareas} {entidad.totalTareas === 1 ? 'tarea' : 'tareas'}
                    </span>
                  </div>
                </div>

                {/* Barra de proporción sobre el total */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-charcoal-500 font-semibold">
                    <span>Peso en CMU</span>
                    <strong className="text-charcoal-800">{entidad.porcentajeHoras}%</strong>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(entidad.porcentajeHoras, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Chips de Roles del CMU involucrados */}
                <div className="pt-1 flex items-center justify-between gap-1 flex-wrap text-[10px]">
                  <div className="flex items-center gap-1 flex-wrap">
                    {entidad.rolesInvolucrados.map(rol => (
                      <span
                        key={rol}
                        className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold border border-stone-200"
                      >
                        {rol}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-600 font-extrabold flex items-center gap-0.5 ml-auto">
                    {esSeleccionada ? 'Quitar filtro' : 'Filtrar'}
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
