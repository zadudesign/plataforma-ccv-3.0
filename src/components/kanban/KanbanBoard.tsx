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
  Sparkles
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
  const columnas: { estado: EstadoTarea; titulo: string; colorHeader: string; borderTop: string }[] = [
    { estado: 'Pendiente', titulo: 'Pendientes', colorHeader: 'bg-stone-100 text-charcoal-800', borderTop: 'border-t-4 border-stone-400' },
    { estado: 'En Proceso', titulo: 'En Proceso', colorHeader: 'bg-blue-50 text-blue-800', borderTop: 'border-t-4 border-blue-500' },
    { estado: 'En Revisión', titulo: 'En Revisión Calidad', colorHeader: 'bg-purple-50 text-purple-800', borderTop: 'border-t-4 border-purple-500' },
    { estado: 'Completado', titulo: 'Completados', colorHeader: 'bg-sage-50 text-sage-800', borderTop: 'border-t-4 border-sage-600' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Kanban Top Header */}
      <div className="ccv-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sage-600" />
            Tablero Kanban de Producción CCV
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Supervisión interactiva del estado de guiones, edición multimedia y revisiones técnico-docentes.
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarea de Producción
        </button>
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
                  <span className="w-6 h-6 rounded-full bg-white text-charcoal-900 text-xs flex items-center justify-center shadow-sm">
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
                        className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-sage-400 hover:shadow-md transition-all group"
                      >
                        {/* Type & Tariff Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tarea.tipo_tarea === 'Curso Virtual' 
                              ? 'bg-sage-50 text-sage-700 border border-sage-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {tarea.tipo_tarea}
                          </span>
                          <span className="text-xs font-extrabold text-sage-700">
                            ${tarea.tarifa_tarea}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 
                          onClick={() => onSelectTask(tarea)}
                          className="font-extrabold text-charcoal-900 text-sm hover:text-sage-600 transition-colors cursor-pointer line-clamp-2"
                        >
                          {tarea.titulo}
                        </h4>

                        {/* Description snippet */}
                        <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed">
                          {tarea.descripcion}
                        </p>

                        {/* Association (Course or Project) */}
                        <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] font-semibold text-charcoal-600">
                          {tarea.curso_nombre && <span className="line-clamp-1">📘 {tarea.curso_nombre}</span>}
                          {tarea.proyecto_nombre && <span className="line-clamp-1">📁 {tarea.proyecto_nombre}</span>}
                        </div>

                        {/* Footer details & state transfer controls */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                          <div className="flex items-center gap-2">
                            <img
                              src={tarea.responsable_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={tarea.responsable_nombre}
                              className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
                              title={tarea.responsable_nombre}
                            />
                            <span className="text-[11px] text-charcoal-500 flex items-center gap-1 font-medium">
                              <CalendarIcon className="w-3 h-3" /> {tarea.fecha_vencimiento}
                            </span>
                          </div>

                          {/* Quick state change arrow buttons */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {col.estado !== 'Pendiente' && (
                              <button
                                onClick={() => {
                                  const prev = col.estado === 'Completado' ? 'En Revisión' : col.estado === 'En Revisión' ? 'En Proceso' : 'Pendiente';
                                  onUpdateStatus(tarea.id, prev);
                                }}
                                className="w-6 h-6 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-700 flex items-center justify-center text-xs"
                                title="Mover a etapa anterior"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {col.estado !== 'Completado' && (
                              <button
                                onClick={() => {
                                  const next = col.estado === 'Pendiente' ? 'En Proceso' : col.estado === 'En Proceso' ? 'En Revisión' : 'Completado';
                                  onUpdateStatus(tarea.id, next);
                                }}
                                className="w-6 h-6 rounded-full bg-sage-600 hover:bg-sage-700 text-white flex items-center justify-center text-xs shadow-sm"
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
