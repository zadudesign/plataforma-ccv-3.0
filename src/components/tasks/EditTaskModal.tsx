'use client';

import React, { useState } from 'react';
import { 
  X, 
  Pencil, 
  Calendar, 
  DollarSign, 
  Clock, 
  Timer, 
  BookOpen, 
  FolderKanban, 
  Link as LinkIcon, 
  Users, 
  User, 
  UserCheck, 
  ShieldCheck, 
  Save, 
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { Area, CursoVirtual, ProyectoEspecial, Usuario, TareaCCV, TipoTarea, CategoriaTareaProyecto, EstadoTarea } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface EditTaskModalProps {
  isOpen: boolean;
  tarea: TareaCCV;
  areas: Area[];
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  usuarios: Usuario[];
  onClose: () => void;
  onSave: (tareaId: string, updates: Partial<TareaCCV>) => Promise<boolean>;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  tarea,
  areas,
  cursos,
  proyectos,
  usuarios,
  onClose,
  onSave,
}) => {
  const { tarifasProyecto, isAdmin } = useAuth();

  // Estados locales pre-cargados con la información de la tarea existente
  const [titulo, setTitulo] = useState(tarea.titulo || '');
  const [descripcion, setDescripcion] = useState(tarea.descripcion || '');
  const [enlaceRecurso, setEnlaceRecurso] = useState(tarea.enlace_recurso || '');
  const [tipoTarea, setTipoTarea] = useState<TipoTarea>(
    tarea.tipo_tarea === 'Proyecto' || (tarea.tipo_tarea as any) === 'Proyecto Especial' 
      ? 'Proyecto' 
      : 'Curso Virtual'
  );
  const [categoriaProyecto, setCategoriaProyecto] = useState<CategoriaTareaProyecto>(
    tarea.categoria_proyecto || 'Diseño'
  );
  const [cursoId, setCursoId] = useState(tarea.curso_id || cursos[0]?.id || '');
  const [proyectoId, setProyectoId] = useState(tarea.proyecto_id || proyectos[0]?.id || '');
  const [responsableId, setResponsableId] = useState(tarea.responsable_id || '');
  const [responsableSecundarioId, setResponsableSecundarioId] = useState(tarea.responsable_secundario_id || '');
  const [estado, setEstado] = useState<EstadoTarea>(tarea.estado || 'Pendiente');
  const [fechaVencimiento, setFechaVencimiento] = useState(tarea.fecha_vencimiento || '');
  const [horaVencimiento, setHoraVencimiento] = useState(tarea.hora_vencimiento || '18:00');
  const [fechaCompletada, setFechaCompletada] = useState(
    tarea.fecha_completada || new Date().toISOString().split('T')[0]
  );
  const [tiempoEstimado, setTiempoEstimado] = useState<number | string>(
    tarea.tiempo_estimado !== undefined && tarea.tiempo_estimado !== null ? tarea.tiempo_estimado : ''
  );
  const [numeroUnidad, setNumeroUnidad] = useState<number | string>(
    tarea.numero_unidad !== undefined && tarea.numero_unidad !== null ? tarea.numero_unidad : ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !isAdmin()) return null;

  // Resolución de datos vinculados
  const activeCursoId = cursoId || cursos[0]?.id;
  const activeProyectoId = proyectoId || proyectos[0]?.id;
  const activeResponsableId = responsableId;

  const resp = usuarios.find(u => u.id === activeResponsableId);
  const respArea = areas.find(a => a.nombre === resp?.area_nombre) || areas[0];

  const resp2 = responsableSecundarioId ? usuarios.find(u => u.id === responsableSecundarioId) : undefined;
  const resp2Area = resp2 ? areas.find(a => a.nombre === resp2.area_nombre) : undefined;

  const tarifaConfig = tarifasProyecto.find(t => t.categoria === categoriaProyecto);
  const tarifaHoraActual = tarea.tarifa_hora !== undefined && tarea.tarifa_hora !== null
    ? tarea.tarifa_hora 
    : (tarifaConfig ? tarifaConfig.tarifa_hora : 35000);

  const totalHorasInvertidas = (tarea.tiempo_invertido || 0) + (tarea.tiempo_invertido_secundario || 0);
  const costoTotalCalculado = tipoTarea === 'Proyecto' 
    ? (totalHorasInvertidas > 0 ? totalHorasInvertidas * tarifaHoraActual : tarifaHoraActual)
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMsg('El título del entregable es obligatorio.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const cursoObj = cursos.find(c => c.id === activeCursoId);
    const proyObj = proyectos.find(p => p.id === activeProyectoId);

    const updates: Partial<TareaCCV> = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo_tarea: tipoTarea,
      categoria_proyecto: tipoTarea === 'Proyecto' ? categoriaProyecto : undefined,
      area_id: respArea?.id || tarea.area_id || undefined,
      area_nombre: respArea?.nombre || resp?.area_nombre || tarea.area_nombre || undefined,
      curso_id: tipoTarea === 'Curso Virtual' ? (activeCursoId || undefined) : undefined,
      curso_nombre: tipoTarea === 'Curso Virtual' ? cursoObj?.nombre : undefined,
      proyecto_id: tipoTarea === 'Proyecto' ? (activeProyectoId || undefined) : undefined,
      proyecto_nombre: tipoTarea === 'Proyecto' ? proyObj?.nombre : undefined,
      responsable_id: activeResponsableId || undefined,
      responsable_nombre: resp?.nombre_completo || undefined,
      responsable_avatar: resp?.avatar_url,
      rol_destino: resp?.rol_nombre || (tipoTarea === 'Proyecto' ? categoriaProyecto : 'General'),
      responsable_secundario_id: responsableSecundarioId || undefined,
      responsable_secundario_nombre: resp2?.nombre_completo || undefined,
      responsable_secundario_avatar: resp2?.avatar_url,
      rol_destino_secundario: resp2?.rol_nombre || undefined,
      estado,
      fecha_vencimiento: fechaVencimiento,
      hora_vencimiento: horaVencimiento || '18:00',
      fecha_completada: estado === 'Completada' ? fechaCompletada : undefined,
      tiempo_estimado: tiempoEstimado !== '' ? Number(tiempoEstimado) : 0,
      numero_unidad: tipoTarea === 'Curso Virtual' && numeroUnidad !== '' ? Number(numeroUnidad) : undefined,
      tarifa_hora: tipoTarea === 'Proyecto' ? tarifaHoraActual : undefined,
      tarifa_tarea: tipoTarea === 'Proyecto' ? costoTotalCalculado : undefined,
      enlace_recurso: enlaceRecurso.trim() || undefined,
    };

    try {
      const ok = await onSave(tarea.id, updates);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('No fue posible guardar los cambios en la base de datos.');
      }
    } catch (err: any) {
      console.error('Error al editar tarea:', err);
      setErrorMsg(err?.message || 'Error al guardar los cambios de la tarea.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="ccv-card w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto shadow-floating border-stone-300 rounded-3xl">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-cream-50/60 sticky top-0 z-10 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-2xs">
              <Pencil className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-charcoal-900">
                  Editar Tarea
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-amber-700" /> Solo Administrador
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Modifica asignaciones, fechas, costos o detalles pedagógicos de este entregable.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-charcoal-600 hover:bg-cream-100 transition-colors shadow-xs cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Tipo de Tarea selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTipoTarea('Curso Virtual')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                tipoTarea === 'Curso Virtual'
                  ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-sm'
                  : 'bg-stone-50 text-charcoal-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" /> Tarea de Curso Virtual
            </button>

            <button
              type="button"
              onClick={() => setTipoTarea('Proyecto')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                tipoTarea === 'Proyecto'
                  ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-sm'
                  : 'bg-stone-50 text-charcoal-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-amber-400" /> Tarea de Proyecto Especial
            </button>
          </div>

          {/* Título */}
          <div>
            <label className="block font-bold text-charcoal-900 mb-1">Título del Entregable *</label>
            <input
              type="text"
              required
              placeholder="Ej. Diseño Instruccional del Módulo 1..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 font-semibold text-xs bg-white"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-bold text-charcoal-900 mb-1">Descripción / Instrucciones Didácticas</label>
            <textarea
              rows={3}
              placeholder="Detalles sobre los requerimientos, guías o especificaciones pedagógicas..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs bg-white"
            />
          </div>

          {/* Material & Enlace Externo */}
          <div>
            <label className="block font-bold text-charcoal-900 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-sage-600" />
              <span>Enlace a Material o Recurso Didáctico (Opcional)</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..., https://onedrive.live.com/..., o enlace web"
              value={enlaceRecurso}
              onChange={(e) => setEnlaceRecurso(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-mono bg-white"
            />
            <p className="text-[10px] text-charcoal-500 mt-1">
              Pega aquí el enlace a la carpeta compartida, documento de guion, Figma, OneDrive o Google Drive.
            </p>
          </div>

          {/* Asignación a Curso o Proyecto */}
          {tipoTarea === 'Curso Virtual' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-charcoal-900 mb-1">Curso Virtual Asociado</label>
                <select
                  value={cursoId}
                  onChange={(e) => setCursoId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-medium bg-white"
                >
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.codigo}) — {c.programa_nombre || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-900 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-stone-500" /> Número de Unidad
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej. 1"
                  value={numeroUnidad}
                  onChange={(e) => setNumeroUnidad(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-semibold bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-charcoal-900 mb-1">Proyecto Especial Asociado</label>
                <select
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-medium bg-white"
                >
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-900 mb-1">Especialidad / Categoría</label>
                <select
                  value={categoriaProyecto}
                  onChange={(e) => setCategoriaProyecto(e.target.value as CategoriaTareaProyecto)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-bold bg-amber-50/40"
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
                <Users className="w-4 h-4 text-sage-600" /> Responsables Asignados
              </label>
              <span className="text-[10px] text-charcoal-500 font-medium">
                Ambos usuarios podrán reportar avances
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Responsable Principal */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-charcoal-800 text-[11px] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sage-700" /> Responsable Principal
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
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-medium bg-white"
                >
                  <option value="">-- Sin Asignar --</option>
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
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-medium bg-white"
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

          {/* Estado y Cronograma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-charcoal-900 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Estado de la Tarea</span>
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoTarea)}
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-bold bg-white"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Completada">Completada</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-charcoal-900 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Fecha Vencimiento *</span>
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-semibold bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-900 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Hora Vencimiento</span>
              </label>
              <input
                type="time"
                value={horaVencimiento}
                onChange={(e) => setHoraVencimiento(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-bold bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-900 mb-1 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-sage-600" />
                <span>Tiempo Est. (Hrs)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                placeholder="Ej. 4.5"
                value={tiempoEstimado}
                onChange={(e) => setTiempoEstimado(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-semibold bg-white"
              />
            </div>
          </div>

          {/* Fecha completada condicional */}
          {estado === 'Completada' && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 block text-xs">Fecha de Finalización de la Tarea</span>
                  <span className="text-[10px] text-emerald-700">Esta fecha se registra en los reportes de cronograma y cumplimiento.</span>
                </div>
              </div>
              <input
                type="date"
                value={fechaCompletada}
                onChange={(e) => setFechaCompletada(e.target.value)}
                className="p-2 rounded-xl border border-emerald-300 bg-white font-bold text-emerald-950 text-xs"
              />
            </div>
          )}

          {/* Tarjeta de Costo para Proyectos */}
          {tipoTarea === 'Proyecto' && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-charcoal-900 text-xs">Finanzas del Proyecto ({categoriaProyecto})</h5>
                  <p className="text-[11px] text-charcoal-600">
                    Tarifa Oficial: <span className="font-bold text-amber-900">${tarifaHoraActual.toLocaleString('es-CO')} COP / hr</span> • Invertido: {totalHorasInvertidas}h
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-charcoal-500 block uppercase">Costo Consolidado</span>
                <span className="text-base font-black text-amber-800">
                  ${(costoTotalCalculado || 0).toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-stone-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full bg-stone-100 text-charcoal-700 font-bold hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
