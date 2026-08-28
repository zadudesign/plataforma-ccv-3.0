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
      cardBg: 'bg-rose-50/70',
      cardBorder: 'border-rose-200 hover:border-rose-400 shadow-xs',
      badgeBg: 'bg-rose-600 text-white'
    },
    { 
      estado: 'En Proceso', 
      titulo: 'En Proceso', 
      colorHeader: 'bg-blue-100 text-blue-900 border border-blue-300', 
      borderTop: 'border-t-4 border-blue-600',
      cardBg: 'bg-blue-50/70',
      cardBorder: 'border-blue-200 hover:border-blue-400 shadow-xs',
      badgeBg: 'bg-blue-600 text-white'
    },
    { 
      estado: 'En Revisión', 
      titulo: 'En Revisión', 
      colorHeader: 'bg-amber-100 text-amber-900 border border-amber-300', 
      borderTop: 'border-t-4 border-amber-500',
      cardBg: 'bg-amber-50/70',
      cardBorder: 'border-amber-200 hover:border-amber-400 shadow-xs',
      badgeBg: 'bg-amber-600 text-white'
    },
    { 
      estado: 'Completada', 
      titulo: 'Completadas', 
      colorHeader: 'bg-emerald-100 text-emerald-900 border border-emerald-300', 
      borderTop: 'border-t-4 border-emerald-600',
      cardBg: 'bg-emerald-50/70',
      cardBorder: 'border-emerald-200 hover:border-emerald-400 shadow-xs',
      badgeBg: 'bg-emerald-600 text-white'
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Kanban Top Header */}
      <div className="ccv-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sage-600" />
            Tablero Kanban de Producción CCV
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Supervisión interactiva del estado de tareas en las etapas: <strong className="text-rose-700">Pendiente</strong> (Rojo), <strong className="text-blue-700">En Proceso</strong> (Azul), <strong className="text-amber-700">En Revisión</strong> (Amarillo) y <strong className="text-emerald-700">Completada</strong> (Verde).
          </p>
        </div>
      </div>

      {/* 4 Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columnas.map((col) => {
          const tareasCol = tareas.filter(t => t.estado === col.estado);

          return (
            <div key={col.estado} className={`ccv-card p-4 flex flex-col justify-between ${col.borderTop}`}>
              <div>
                {/* Column Header */}
                <div className={`p-3 rounded-xl flex items-center justify-between font-extrabold text-sm mb-4 ${col.colorHeader}`}>
                  <span>{col.titulo}</span>
                  <span className="w-6 h-6 rounded-full bg-white text-charcoal-900 text-xs flex items-center justify-center shadow-sm font-black">
                    {tareasCol.length}
                  </span>
                </div>

                {/* Task Cards List */}
                <div className="space-y-3.5">
                  {tareasCol.length === 0 ? (
                    <div className="p-6 text-center text-xs text-charcoal-500 border-2 border-dashed border-stone-200 rounded-2xl">
                      Sin tareas en esta etapa
                    </div>
                  ) : (
                    tareasCol.map((tarea) => (
                      <div
                        key={tarea.id}
                        className={`p-4 rounded-2xl border transition-all group ${col.cardBg} ${col.cardBorder}`}
                      >
                        {/* Type & Tariff Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              tarea.tipo_tarea === 'Curso Virtual' 
                                ? 'bg-white text-sage-800 border border-sage-300' 
                                : 'bg-white text-amber-800 border border-amber-300'
                            }`}>
                              {tarea.tipo_tarea}
                            </span>
                            {tarea.categoria_proyecto && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-300">
                                {tarea.categoria_proyecto}
                              </span>
                            )}
                          </div>
                          {tarea.tipo_tarea === 'Proyecto' && tarea.tarifa_tarea !== undefined && (
                            <span className="text-xs font-extrabold text-sage-700" title={tarea.tarifa_hora ? `$${tarea.tarifa_hora.toLocaleString('es-CO')} COP/h` : undefined}>
                              ${tarea.tarifa_tarea.toLocaleString('es-CO')} COP
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 
                          onClick={() => onSelectTask(tarea)}
                          className="font-extrabold text-charcoal-900 text-sm hover:text-sage-700 transition-colors cursor-pointer line-clamp-2"
                        >
                          {tarea.titulo}
                        </h4>

                        {/* Description snippet */}
                        <p className="text-xs text-charcoal-600 mt-1 line-clamp-2 leading-relaxed">
                          {tarea.descripcion}
                        </p>

                        {/* Association (Course or Project) & External Resource Link */}
                        <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2 text-[11px] font-semibold text-charcoal-700">
                          <div className="truncate flex-1">
                            {tarea.curso_nombre && <span className="truncate block">📘 {tarea.curso_nombre}</span>}
                            {tarea.proyecto_nombre && <span className="truncate block">📁 {tarea.proyecto_nombre}</span>}
                          </div>
                          {tarea.enlace_recurso && (
                            <a
                              href={tarea.enlace_recurso.startsWith('http') ? tarea.enlace_recurso : `https://${tarea.enlace_recurso}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white hover:bg-sage-100 text-sage-800 hover:text-sage-950 border border-sage-300 font-extrabold text-[10px] transition-colors shadow-2xs flex-shrink-0"
                              title={`Abrir recurso externo: ${tarea.enlace_recurso}`}
                            >
                              <LinkIcon className="w-2.5 h-2.5 text-sage-600" />
                              <span>Recurso</span>
                              <ExternalLink className="w-2.5 h-2.5 text-charcoal-400" />
                            </a>
                          )}
                        </div>

                        {/* Footer details & state transfer controls */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-200/60">
                          <div className="flex items-center gap-2">
                            {tarea.responsable_secundario_nombre ? (
                              <div className="flex items-center -space-x-2" title={`Responsables: ${tarea.responsable_nombre} y ${tarea.responsable_secundario_nombre}`}>
                                <img
                                  src={tarea.responsable_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                  alt={tarea.responsable_nombre || 'Responsable 1'}
                                  className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"
                                  title={`Principal: ${tarea.responsable_nombre || 'Sin Asignar'}`}
                                />
                                <img
                                  src={tarea.responsable_secundario_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                                  alt={tarea.responsable_secundario_nombre}
                                  className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-blue-300"
                                  title={`Co-responsable: ${tarea.responsable_secundario_nombre}`}
                                />
                              </div>
                            ) : (
                              <img
                                src={tarea.responsable_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={tarea.responsable_nombre}
                                className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
                                title={tarea.responsable_nombre || 'Responsable'}
                              />
                            )}
                            <span className="text-[11px] text-charcoal-600 flex items-center gap-1 font-medium">
                              <CalendarIcon className="w-3 h-3" /> {tarea.fecha_vencimiento}
                            </span>
                          </div>

                          {/* Quick state change arrow buttons */}
                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            {col.estado !== 'Pendiente' && (
                              <button
                                onClick={() => {
                                  const prev: EstadoTarea = col.estado === 'Completada' ? 'En Revisión' : col.estado === 'En Revisión' ? 'En Proceso' : 'Pendiente';
                                  onUpdateStatus(tarea.id, prev);
                                }}
                                className="w-6 h-6 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-charcoal-700 flex items-center justify-center text-xs shadow-xs"
                                title="Mover a etapa anterior"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {col.estado !== 'Completada' && (
                              <button
                                onClick={() => {
                                  const next: EstadoTarea = col.estado === 'Pendiente' ? 'En Proceso' : col.estado === 'En Proceso' ? 'En Revisión' : 'Completada';
                                  onUpdateStatus(tarea.id, next);
                                }}
                                className="w-6 h-6 rounded-full bg-charcoal-900 hover:bg-sage-700 text-white flex items-center justify-center text-xs shadow-sm"
                                title="Avanzar etapa"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
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
