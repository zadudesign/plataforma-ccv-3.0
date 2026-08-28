'use client';

import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, Clock, Layers, BookOpen, FolderKanban, Link as LinkIcon, ExternalLink, Users, User, UserCheck } from 'lucide-react';
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
  const [responsableSecundarioId, setResponsableSecundarioId] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [horaVencimiento, setHoraVencimiento] = useState('18:00');

  const activeCursoId = cursoId || cursos[0]?.id;
  const activeProyectoId = proyectoId || proyectos[0]?.id;
  const activeResponsableId = responsableId || usuarios[0]?.id;

  const resp = usuarios.find(u => u.id === activeResponsableId);
  const respArea = areas.find(a => a.nombre === resp?.area_nombre) || areas[0];

  const resp2 = responsableSecundarioId ? usuarios.find(u => u.id === responsableSecundarioId) : undefined;
  const resp2Area = resp2 ? areas.find(a => a.nombre === resp2.area_nombre) : undefined;

  const tarifaConfig = tarifasProyecto.find(t => t.categoria === categoriaProyecto);
  const tarifaHoraActual = tarifaConfig ? tarifaConfig.tarifa_hora : 35000;
  const costoTotalCalculado = tipoTarea === 'Proyecto' ? tarifaHoraActual : undefined;

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
      responsable_secundario_id: responsableSecundarioId || undefined,
      responsable_secundario_nombre: resp2?.nombre_completo || undefined,
      responsable_secundario_avatar: resp2?.avatar_url,
      rol_destino_secundario: resp2?.rol_nombre || undefined,
      orden_tarea: 1,
      estado: 'Pendiente',
      fecha_vencimiento: fechaVencimiento,
      hora_vencimiento: horaVencimiento || '18:00',
      tiempo_invertido: 0,
      tiempo_invertido_secundario: responsableSecundarioId ? 0 : undefined,
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
            <p className="text-xs text-charcoal-500 mt-0.5">Asignación de entregables pedagógicos y proyectos CCV con vinculación de responsables.</p>
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
              <FolderKanban className="w-4 h-4" /> Tarea de Proyecto Especial
            </button>
          </div>

          {/* Título */}
          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Título del Entregable *</label>
            <input
              type="text"
              required
              placeholder="Ej. Diseño Instruccional del Módulo 1..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 font-semibold text-xs"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-bold text-charcoal-800 mb-1">Descripción / Instrucciones Didácticas</label>
            <textarea
              rows={2}
              placeholder="Detalles sobre los requerimientos, guías o especificaciones pedagógicas..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs"
            />
          </div>

          {/* Material & Enlace Externo */}
          <div>
            <label className="block font-bold text-charcoal-800 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-sage-600" />
              <span>Enlace a Material o Recurso Didáctico (Opcional)</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..., https://onedrive.live.com/..., o enlace web"
              value={enlaceRecurso}
              onChange={(e) => setEnlaceRecurso(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-mono"
            />
            <p className="text-[10px] text-charcoal-500 mt-1">
              Pega aquí el enlace a la carpeta compartida, documento de guion, Figma, OneDrive o Google Drive.
            </p>
          </div>

          {/* Asignación a Curso o Proyecto */}
          {tipoTarea === 'Curso Virtual' ? (
            <div>
              <label className="block font-bold text-charcoal-800 mb-1">Curso Virtual Asociado</label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-medium"
              >
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.codigo}) — {c.programa_nombre || 'General'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-charcoal-800 mb-1">Proyecto Especial Asociado</label>
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

          {/* Asignación Dual de Responsables */}
          <div className="p-4 bg-cream-50/80 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-charcoal-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sage-600" /> Responsables Asignados a la Tarea
              </label>
              <span className="text-[10px] text-charcoal-500 font-medium">
                Ambos roles podrán completar y comentar la tarea
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Responsable Principal */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-charcoal-800 text-[11px] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sage-700" /> Responsable Principal *
                  </label>
                  {respArea && (
                    <span className="text-[9px] font-extrabold text-sage-800 bg-sage-50 border border-sage-200 px-1.5 py-0.2 rounded-full">
                      {respArea.nombre}
                    </span>
                  )}
                </div>
                <select
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-medium bg-white"
                >
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo} — {u.rol_nombre || 'Usuario'} ({u.area_nombre || 'CMU'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Segundo Responsable */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-charcoal-800 text-[11px] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Segundo Responsable (Opcional)
                  </label>
                  {resp2Area && (
                    <span className="text-[9px] font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-full">
                      {resp2Area.nombre}
                    </span>
                  )}
                </div>
                <select
                  value={responsableSecundarioId}
                  onChange={(e) => setResponsableSecundarioId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-medium bg-white"
                >
                  <option value="">-- Sin Segundo Responsable (Solo 1 Asignado) --</option>
                  {usuarios.filter(u => u.id !== activeResponsableId).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo} — {u.rol_nombre || 'Usuario'} ({u.area_nombre || 'CMU'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fecha y Hora de Vencimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-charcoal-800 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sage-600" />
                <span>Fecha Vencimiento *</span>
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sage-600" />
                <span>Hora de Vencimiento *</span>
              </label>
              <input
                type="time"
                value={horaVencimiento}
                onChange={(e) => setHoraVencimiento(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-sage-500 focus:outline-none text-charcoal-900 text-xs font-bold"
                required
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
                  <h5 className="font-extrabold text-charcoal-900 text-xs">Tarifa de Proyecto ({categoriaProyecto})</h5>
                  <p className="text-[11px] text-charcoal-600">
                    Tarifa Oficial: <span className="font-bold text-sage-800">${tarifaHoraActual.toLocaleString('es-CO')} COP / 1 hr</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-charcoal-500 block uppercase">Tarifa por Hora</span>
                <span className="text-base font-black text-sage-700">${tarifaHoraActual.toLocaleString('es-CO')} COP/h</span>
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
