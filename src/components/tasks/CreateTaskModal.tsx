'use client';

import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, Clock, Layers, BookOpen, FolderKanban, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Area, CursoVirtual, ProyectoEspecial, Usuario, TareaCCV, TipoTarea, CategoriaTareaProyecto } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CreateTaskModalProps {
  areas: Area[];
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  usuarios: Usuario[];
  onClose: () => void;
  onCreateTask: (nuevaTarea: Omit<TareaCCV, 'id'>) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  areas,
  cursos,
  proyectos,
  usuarios,
  onClose,
  onCreateTask,
}) => {
  const { tarifasProyecto } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enlaceRecurso, setEnlaceRecurso] = useState('');
  const [tipoTarea, setTipoTarea] = useState<TipoTarea>('Curso Virtual');
  const [categoriaProyecto, setCategoriaProyecto] = useState<CategoriaTareaProyecto>('Diseño');
  const [cursoId, setCursoId] = useState(cursos[0]?.id || '');
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id || '');
  const [responsableId, setResponsableId] = useState(usuarios[0]?.id || '');
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [tiempoEstimado, setTiempoEstimado] = useState(1);

  const activeCursoId = cursoId || cursos[0]?.id;
  const activeProyectoId = proyectoId || proyectos[0]?.id;
  const activeResponsableId = responsableId || usuarios[0]?.id;

  const resp = usuarios.find(u => u.id === activeResponsableId);
  const respArea = areas.find(a => a.nombre === resp?.area_nombre) || areas[0];

  const tarifaConfig = tarifasProyecto.find(t => t.categoria === categoriaProyecto);
  const tarifaHoraActual = tarifaConfig ? tarifaConfig.tarifa_hora : 35000;
  const costoTotalCalculado = tipoTarea === 'Proyecto' ? Number(tiempoEstimado) * tarifaHoraActual : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const cursoObj = cursos.find(c => c.id === activeCursoId);
    const proyObj = proyectos.find(p => p.id === activeProyectoId);

    onCreateTask({
      titulo,
      descripcion,
      tipo_tarea: tipoTarea,
      categoria_proyecto: tipoTarea === 'Proyecto' ? categoriaProyecto : undefined,
      area_id: respArea?.id || undefined,
      area_nombre: respArea?.nombre || resp?.area_nombre || undefined,
      curso_id: tipoTarea === 'Curso Virtual' ? activeCursoId : undefined,
      curso_nombre: tipoTarea === 'Curso Virtual' ? cursoObj?.nombre : undefined,
      proyecto_id: tipoTarea === 'Proyecto' ? activeProyectoId : undefined,
      proyecto_nombre: tipoTarea === 'Proyecto' ? proyObj?.nombre : undefined,
      responsable_id: activeResponsableId || undefined,
      responsable_nombre: resp?.nombre_completo || undefined,
      responsable_avatar: resp?.avatar_url,
      rol_destino: resp?.rol_nombre || (tipoTarea === 'Proyecto' ? categoriaProyecto : 'General'),
      orden_tarea: 1,
      estado: 'Pendiente',
      fecha_vencimiento: fechaVencimiento,
      tiempo_estimado: Number(tiempoEstimado),
      tiempo_invertido: 0,
      tarifa_hora: tipoTarea === 'Proyecto' ? tarifaHoraActual : undefined,
      tarifa_tarea: costoTotalCalculado,
      enlace_recurso: enlaceRecurso.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="ccv-card w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto shadow-floating border-stone-300">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-cream-50/60">
          <div>
            <h3 className="text-xl font-extrabold text-charcoal-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sage-600" /> Nueva Tarea de Producción CCV
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">Asignación de entregables pedagógicos y proyectos CCV con vinculación automática de área.</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-charcoal-600 hover:bg-cream-100 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Tipo de Tarea selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTipoTarea('Curso Virtual')}
              className={`p-3 rounded-2xl border flex items-center gap-2 font-bold transition-all ${
                tipoTarea === 'Curso Virtual'
                  ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
                  : 'bg-cream-50 text-charcoal-700 border-stone-200 hover:bg-cream-100'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Tarea de Curso Virtual
            </button>

            <button
              type="button"
              onClick={() => setTipoTarea('Proyecto')}
              className={`p-3 rounded-2xl border flex items-center gap-2 font-bold transition-all ${
                tipoTarea === 'Proyecto'
                  ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
                  : 'bg-cream-50 text-charcoal-700 border-stone-200 hover:bg-cream-100'
              }`}
            >
              <FolderKanban className="w-4 h-4" /> Proyecto
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Título de la Tarea</label>
            <input
              type="text"
              required
              placeholder="Ej: Elaboración de Guión Audiovisual Módulo 1..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Descripción / Indicaciones</label>
            <textarea
              rows={3}
              placeholder="Detalla los requisitos didácticos o especificaciones multimedia..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs"
            ></textarea>
          </div>

          {/* Enlace a Recursos o Material Pertinente */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-charcoal-800 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-sage-600" /> Enlace a Recursos o Material Adjunto (Opcional)
              </label>
              <span className="text-[10px] text-charcoal-400 font-medium">Google Drive, OneDrive, Figma, etc.</span>
            </div>
            <div className="relative">
              <input
                type="url"
                placeholder="https://drive.google.com/... o enlace web externo"
                value={enlaceRecurso}
                onChange={(e) => setEnlaceRecurso(e.target.value)}
                className="w-full p-3 pl-9 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-mono"
              />
              <ExternalLink className="w-4 h-4 text-charcoal-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Cascading Association: Curso vs Proyecto */}
          {tipoTarea === 'Curso Virtual' ? (
            <div>
              <label className="block font-bold text-charcoal-800 mb-1">Curso Virtual Asignado</label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs"
              >
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-charcoal-800 mb-1">Proyecto Asignado</label>
                <select
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-medium"
                >
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">Tipo de Tarea / Especialidad</label>
                <select
                  value={categoriaProyecto}
                  onChange={(e) => setCategoriaProyecto(e.target.value as CategoriaTareaProyecto)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-bold bg-sage-50/50"
                >
                  {tarifasProyecto.map(t => (
                    <option key={t.categoria} value={t.categoria}>
                      {t.categoria} (${t.tarifa_hora.toLocaleString('es-CO')} COP / 1 hr)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Responsable Asignado */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-charcoal-800">Responsable Asignado</label>
              {respArea && (
                <span className="text-[10px] font-extrabold text-sage-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
                  Área: {respArea.nombre} (Nivel {respArea.nivel})
                </span>
              )}
            </div>
            <select
              value={responsableId}
              onChange={(e) => setResponsableId(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-medium"
            >
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo} — {u.rol_nombre || 'Usuario'} ({u.area_nombre || 'CMU'})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-charcoal-800 mb-1">Fecha Vencimiento</label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-800 mb-1">Horas Estimadas</label>
              <input
                type="number"
                min="1"
                value={tiempoEstimado}
                onChange={(e) => setTiempoEstimado(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-bold"
              />
            </div>
          </div>

          {/* Calculated Cost Card for Projects */}
          {tipoTarea === 'Proyecto' && (
            <div className="p-4 bg-sage-50/70 rounded-2xl border border-sage-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sage-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-charcoal-900 text-xs">Costo Estimado de Proyecto ({categoriaProyecto})</h5>
                  <p className="text-[11px] text-charcoal-600">
                    Tarifa Oficial: <span className="font-bold text-sage-800">${tarifaHoraActual.toLocaleString('es-CO')} COP / 1 hr</span> × {tiempoEstimado} {tiempoEstimado === 1 ? 'hora' : 'horas'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-charcoal-500 block uppercase">Total Tarea (COP)</span>
                <span className="text-base font-black text-sage-700">${costoTotalCalculado?.toLocaleString('es-CO')} COP</span>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-cream-100 text-charcoal-700 font-bold hover:bg-cream-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-sage-600 text-white font-bold hover:bg-sage-700 shadow-md"
            >
              Crear Tarea CCV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
