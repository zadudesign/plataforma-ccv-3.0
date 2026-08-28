'use client';

import React from 'react';
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
  ExternalLink
} from 'lucide-react';
import { TareaCCV, EstadoTarea } from '@/types';

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
      cardBg: 'bg-rose-50/60',
      cardBorder: 'border-rose-200 hover:border-rose-400 shadow-2xs',
      badgeBg: 'bg-rose-600 text-white'
    },
    { 
      estado: 'En Proceso', 
      titulo: 'En Proceso', 
      colorHeader: 'bg-blue-100 text-blue-900 border border-blue-300', 
      borderTop: 'border-t-4 border-blue-600',
      cardBg: 'bg-blue-50/60',
      cardBorder: 'border-blue-200 hover:border-blue-400 shadow-2xs',
      badgeBg: 'bg-blue-600 text-white'
    },
    { 
      estado: 'En Revisión', 
      titulo: 'En Revisión', 
      colorHeader: 'bg-amber-100 text-amber-900 border border-amber-300', 
      borderTop: 'border-t-4 border-amber-500',
      cardBg: 'bg-amber-50/60',
      cardBorder: 'border-amber-200 hover:border-amber-400 shadow-2xs',
      badgeBg: 'bg-amber-600 text-white'
    },
    { 
      estado: 'Completada', 
      titulo: 'Completadas', 
      colorHeader: 'bg-emerald-100 text-emerald-900 border border-emerald-300', 
      borderTop: 'border-t-4 border-emerald-600',
      cardBg: 'bg-emerald-50/60',
      cardBorder: 'border-emerald-200 hover:border-emerald-400 shadow-2xs',
      badgeBg: 'bg-emerald-600 text-white'
    },
  ];

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

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Kanban Top Header */}
      <div className="ccv-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sage-600" />
            Tablero Kanban de Producción CCV
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Tareas agrupadas por día (de la más próxima a la más lejana) y organizadas por etapas: <strong className="text-rose-700">Pendiente</strong>, <strong className="text-blue-700">En Proceso</strong>, <strong className="text-amber-700">En Revisión</strong> y <strong className="text-emerald-700">Completada</strong>.
          </p>
        </div>
      </div>

      {/* 4 Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columnas.map((col) => {
          const tareasCol = tareas.filter(t => t.estado === col.estado);

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

          // Ordenar tareas dentro de cada día de la más próxima a la más lejana por hora
          fechasOrdenadas.forEach(fecha => {
            gruposPorFecha[fecha].sort((a, b) => (a.hora_vencimiento || '18:00').localeCompare(b.hora_vencimiento || '18:00'));
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
                                {/* Compact Header: Type, Hour, Cost */}
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                      tarea.tipo_tarea === 'Curso Virtual' 
                                        ? 'bg-white text-sage-800 border border-sage-300' 
                                        : 'bg-white text-amber-800 border border-amber-300'
                                    }`}>
                                      {tarea.tipo_tarea}
                                    </span>
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
