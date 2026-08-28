'use client';

import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  DollarSign, 
  Calendar as CalendarIcon, 
  User, 
  CheckCircle2, 
  MessageSquare, 
  Send,
  Building2,
  FileText,
  BookOpen,
  FolderKanban,
  ChevronRight,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { TareaCCV, TareaComentario, Usuario, EstadoTarea } from '@/types';

interface TaskDetailModalProps {
  tarea: TareaCCV | null;
  usuarioActual: Usuario;
  comentarios: TareaComentario[];
  onClose: () => void;
  onUpdateStatus: (tareaId: string, nuevoEstado: EstadoTarea) => void;
  onAddComment: (tareaId: string, texto: string) => void;
  onAddHours?: (tareaId: string, horas: number, esResponsableSecundario?: boolean, notas?: string) => void;
  onOpenCursoOProyecto?: (entidadId: string, tipo: 'curso' | 'proyecto') => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  tarea,
  usuarioActual,
  comentarios,
  onClose,
  onUpdateStatus,
  onAddComment,
  onAddHours,
  onOpenCursoOProyecto,
}) => {
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [horasInput, setHorasInput] = useState<number | string>('1');
  const [notasHoras, setNotasHoras] = useState('');
  const [imputarParaSecundario, setImputarParaSecundario] = useState(false);
  const [mostrarExitoHoras, setMostrarExitoHoras] = useState(false);

  if (!tarea) return null;

  const comentariosTarea = comentarios.filter(c => c.tarea_id === tarea.id);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    onAddComment(tarea.id, nuevoComentario);
    setNuevoComentario('');
  };

  const handleSumarHoras = (e: React.FormEvent) => {
    e.preventDefault();
    const cant = typeof horasInput === 'number' ? horasInput : parseFloat(horasInput);
    if (!cant || isNaN(cant) || cant <= 0) return;
    if (onAddHours) {
      onAddHours(tarea.id, cant, imputarParaSecundario, notasHoras.trim() || undefined);
      setMostrarExitoHoras(true);
      setNotasHoras('');
      setTimeout(() => setMostrarExitoHoras(false), 3000);
    }
  };

  const handlePresetHoras = (horasPreset: number) => {
    if (onAddHours) {
      onAddHours(tarea.id, horasPreset, imputarParaSecundario, notasHoras.trim() || undefined);
      setMostrarExitoHoras(true);
      setNotasHoras('');
      setTimeout(() => setMostrarExitoHoras(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="ccv-card w-full max-w-3xl bg-white max-h-[90vh] overflow-y-auto flex flex-col justify-between shadow-floating border-stone-300">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-start bg-cream-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800">
                {tarea.tipo_tarea}
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-xs ${
                tarea.estado === 'Pendiente' ? 'bg-rose-600 text-white border-rose-700' :
                tarea.estado === 'En Proceso' ? 'bg-blue-600 text-white border-blue-700' :
                tarea.estado === 'En Revisión' ? 'bg-amber-500 text-white border-amber-600' :
                'bg-emerald-600 text-white border-emerald-700'
              }`}>
                {tarea.estado}
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-stone-100 text-charcoal-800 border border-stone-200 flex items-center gap-1 font-mono">
                📅 {tarea.fecha_vencimiento} • ⏰ {tarea.hora_vencimiento || '18:00'}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-charcoal-900">{tarea.titulo}</h3>
            <div className="text-xs text-charcoal-600 mt-1 flex items-center gap-2 flex-wrap">
              <span>Área: <strong className="font-extrabold text-charcoal-900">{tarea.area_nombre || 'CMU'}</strong></span>
              
              {tarea.curso_id && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenCursoOProyecto && tarea.curso_id) {
                      onOpenCursoOProyecto(tarea.curso_id, 'curso');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 hover:bg-sage-600 text-sage-900 hover:text-white border border-sage-300 font-extrabold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer group"
                  title="Ir a la ventana modal del Curso Virtual"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sage-700 group-hover:text-white transition-colors" />
                  <span>Ver Curso: {tarea.curso_nombre}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-sage-700 group-hover:text-white transition-colors" />
                </button>
              )}

              {tarea.proyecto_id && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenCursoOProyecto && tarea.proyecto_id) {
                      onOpenCursoOProyecto(tarea.proyecto_id, 'proyecto');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-600 text-amber-950 hover:text-white border border-amber-300 font-extrabold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer group"
                  title="Ir a la ventana modal del Proyecto Especial"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-amber-700 group-hover:text-white transition-colors" />
                  <span>Ver Proyecto: {tarea.proyecto_nombre}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-700 group-hover:text-white transition-colors" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-charcoal-600 hover:bg-cream-100 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-1">Descripción Didáctica</h4>
            <p className="text-sm text-charcoal-800 leading-relaxed bg-cream-50 p-4 rounded-2xl border border-stone-200/60">
              {tarea.descripcion}
            </p>
          </div>

          {/* Material & Recursos Adjuntos Externos */}
          {tarea.enlace_recurso && (
            <div className="p-4 rounded-2xl bg-sage-50/80 border border-sage-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sage-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-extrabold text-charcoal-900 text-xs flex items-center gap-2">
                    Material & Recursos Adjuntos
                    <span className="text-[10px] bg-white text-sage-800 border border-sage-300 px-2 py-0.5 rounded-full font-bold">Enlace Externo</span>
                  </h5>
                  <p className="text-[11px] text-charcoal-600 truncate font-mono mt-0.5 max-w-sm">
                    {tarea.enlace_recurso}
                  </p>
                </div>
              </div>
              <a
                href={tarea.enlace_recurso.startsWith('http') ? tarea.enlace_recurso : `https://${tarea.enlace_recurso}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-charcoal-900 hover:bg-sage-600 text-white text-xs font-extrabold rounded-full transition-all shadow-sm hover:shadow-md flex-shrink-0"
              >
                <span>Abrir Recurso</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Metrics Grid */}
          <div className={`grid grid-cols-1 ${tarea.tipo_tarea === 'Proyecto' ? (tarea.tarifa_tarea !== undefined ? 'sm:grid-cols-3' : 'sm:grid-cols-2') : 'sm:grid-cols-1'} gap-4`}>
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold">
                <User className="w-4 h-4 text-sage-600" /> {tarea.responsable_secundario_nombre ? 'Responsables Asignados' : 'Responsable'}
              </div>
              
              {/* Responsable Principal */}
              <div className="flex items-center gap-2.5">
                <img
                  src={tarea.responsable_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={tarea.responsable_nombre || 'Responsable'}
                  className="w-7 h-7 rounded-full object-cover border border-stone-200 shadow-2xs"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-charcoal-900 truncate">
                    {tarea.responsable_nombre || 'Sin Asignar'}
                  </p>
                  <p className="text-[10px] text-charcoal-500 font-medium">
                    Principal {tarea.rol_destino ? `• ${tarea.rol_destino}` : ''}
                  </p>
                </div>
              </div>

              {/* Segundo Responsable si existe */}
              {tarea.responsable_secundario_nombre && (
                <div className="flex items-center gap-2.5 pt-1.5 border-t border-stone-100">
                  <img
                    src={tarea.responsable_secundario_avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={tarea.responsable_secundario_nombre}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-charcoal-900 truncate">
                      {tarea.responsable_secundario_nombre}
                    </p>
                    <p className="text-[10px] text-blue-700 font-medium">
                      Co-responsable {tarea.rol_destino_secundario ? `• ${tarea.rol_destino_secundario}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Exclusivo para Proyectos: Tarjeta de Tiempo Invertido */}
            {tarea.tipo_tarea === 'Proyecto' && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold mb-0.5">
                  <Clock className="w-4 h-4 text-amber-600" /> Tiempo Invertido Acumulado
                </div>
                {tarea.responsable_secundario_nombre ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-charcoal-600 font-medium">Principal ({tarea.rol_destino || 'General'}):</span>
                      <strong className="text-charcoal-900">{tarea.tiempo_invertido || 0} hrs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700 font-medium">Co-resp ({tarea.rol_destino_secundario || 'General'}):</span>
                      <strong className="text-blue-900">{tarea.tiempo_invertido_secundario || 0} hrs</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-stone-100 text-[11px] font-bold text-charcoal-500">
                      <span>Total acumulado:</span>
                      <span className="text-charcoal-900 font-extrabold">{(tarea.tiempo_invertido || 0) + (tarea.tiempo_invertido_secundario || 0)} hrs</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-extrabold text-charcoal-900">
                    {tarea.tiempo_invertido || 0} hrs invertidas
                  </p>
                )}
              </div>
            )}

            {/* Exclusivo para Proyectos: Tarjeta de Costo Financiero */}
            {tarea.tipo_tarea === 'Proyecto' && tarea.tarifa_tarea !== undefined && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold mb-1">
                  <DollarSign className="w-4 h-4 text-sage-600" /> Costo Financiero (COP)
                </div>
                <p className="text-sm font-extrabold text-sage-700">${tarea.tarifa_tarea.toLocaleString('es-CO')} COP</p>
                {tarea.tarifa_hora && (
                  <p className="text-[10px] text-charcoal-500 font-medium mt-0.5">
                    {tarea.categoria_proyecto || 'Proyecto'}: ${tarea.tarifa_hora.toLocaleString('es-CO')} COP/h
                  </p>
                )}
              </div>
            )}
          </div>

          {/* EXCLUSIVO PROYECTOS: Sección Interactiva para Imputar / Sumar Horas de Trabajo */}
          {tarea.tipo_tarea === 'Proyecto' && onAddHours && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-charcoal-900 flex items-center gap-1.5">
                      <span>Imputar Tiempo de Trabajo</span>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.2 rounded-full font-black uppercase">
                        Proyecto
                      </span>
                    </h4>
                    <p className="text-[11px] text-charcoal-600">
                      Suma bloques de horas trabajadas durante el desarrollo de la tarea.
                    </p>
                  </div>
                </div>

                {mostrarExitoHoras && (
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full animate-bounce flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ¡Horas sumadas!
                  </span>
                )}
              </div>

              {/* Selector de responsable si hay co-responsable */}
              {tarea.responsable_secundario_nombre && (
                <div className="flex items-center gap-2 text-xs bg-white p-2 rounded-xl border border-amber-200">
                  <span className="text-charcoal-600 font-bold text-[11px]">Imputar a:</span>
                  <button
                    type="button"
                    onClick={() => setImputarParaSecundario(false)}
                    className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition-all ${
                      !imputarParaSecundario
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-stone-100 text-charcoal-700 hover:bg-stone-200'
                    }`}
                  >
                    Principal: {tarea.responsable_nombre}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImputarParaSecundario(true)}
                    className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition-all ${
                      imputarParaSecundario
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-stone-100 text-charcoal-700 hover:bg-stone-200'
                    }`}
                  >
                    Co-resp: {tarea.responsable_secundario_nombre}
                  </button>
                </div>
              )}

              {/* Botones de incremento rápido */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-charcoal-600">Suma rápida:</span>
                {[0.5, 1, 2, 4].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handlePresetHoras(h)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-black text-xs hover:bg-amber-600 hover:text-white transition-all shadow-2xs"
                  >
                    +{h} {h === 1 ? 'hora' : 'horas'}
                  </button>
                ))}
              </div>

              {/* Formulario de entrada personalizada y nota */}
              <form onSubmit={handleSumarHoras} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 border-t border-amber-200/60">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-black text-charcoal-700 uppercase mb-0.5">Horas a sumar</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={horasInput}
                    onChange={(e) => setHorasInput(e.target.value)}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs font-extrabold"
                    placeholder="Ej. 1.5"
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-[10px] font-black text-charcoal-700 uppercase mb-0.5">Detalle / Nota de avance (Opcional)</label>
                  <input
                    type="text"
                    value={notasHoras}
                    onChange={(e) => setNotasHoras(e.target.value)}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-charcoal-900 text-xs"
                    placeholder="Ej. Ajustes visuales, render 3D, correcciones..."
                  />
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all shadow-xs hover:shadow flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sumar Horas</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MENSAJE PARA TAREAS DE CURSO VIRTUAL */}
          {tarea.tipo_tarea === 'Curso Virtual' && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-charcoal-600 text-xs flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sage-600 shrink-0" />
              <span>
                <strong>Tarea de Curso Virtual:</strong> El seguimiento se realiza mediante el flujo de estados. No requiere imputación horaria.
              </span>
            </div>
          )}

          {/* Estado Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Cambiar Estado de la Tarea</h4>
              {tarea.tipo_tarea === 'Proyecto' && tarea.estado !== 'Completada' && (
                <span className="text-[10px] text-amber-800 font-medium">
                  Al marcar como <strong className="text-emerald-700">Completada</strong> se consolidarán {(tarea.tiempo_invertido || 0) + (tarea.tiempo_invertido_secundario || 0)} hrs invertidas.
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['Pendiente', 'En Proceso', 'En Revisión', 'Completada'] as EstadoTarea[]).map((est) => {
                const isActive = tarea.estado === est;
                const getActiveBtnStyle = (estado: EstadoTarea) => {
                  switch (estado) {
                    case 'Pendiente': return 'bg-rose-600 text-white ring-2 ring-rose-300';
                    case 'En Proceso': return 'bg-blue-600 text-white ring-2 ring-blue-300';
                    case 'En Revisión': return 'bg-amber-500 text-white ring-2 ring-amber-300';
                    case 'Completada': return 'bg-emerald-600 text-white ring-2 ring-emerald-300';
                  }
                };

                return (
                  <button
                    key={est}
                    onClick={() => onUpdateStatus(tarea.id, est)}
                    className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                      isActive
                        ? `${getActiveBtnStyle(est)} shadow-md scale-105`
                        : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-stone-200'
                    }`}
                  >
                    {est}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Comments Feed */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sage-600" /> Discusión & Comentarios ({comentariosTarea.length})
            </h4>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4">
              {comentariosTarea.map((com) => (
                <div key={com.id} className="p-3 bg-cream-50 rounded-xl border border-stone-200/60 flex items-start gap-3">
                  <img src={com.usuario_avatar} alt={com.usuario_nombre} className="w-8 h-8 rounded-full object-cover mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-charcoal-900 text-xs">{com.usuario_nombre}</span>
                      <span className="text-[10px] text-charcoal-400">{com.created_at}</span>
                    </div>
                    <p className="text-xs text-charcoal-700 mt-1 leading-relaxed">{com.comentario}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe un comentario o retroalimentación didáctica..."
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                className="flex-1 py-2.5 px-4 bg-white rounded-full text-xs border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-500 text-charcoal-900"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-sage-600 hover:bg-sage-700 text-white flex items-center justify-center transition-colors shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
