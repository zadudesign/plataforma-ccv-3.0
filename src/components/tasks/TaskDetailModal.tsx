'use client';

import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  DollarSign, 
  Calendar as CalendarIcon, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare, 
  Send,
  Building2,
  FileText
} from 'lucide-react';
import { TareaCCV, TareaComentario, Usuario, EstadoTarea } from '@/types';

interface TaskDetailModalProps {
  tarea: TareaCCV | null;
  usuarioActual: Usuario;
  comentarios: TareaComentario[];
  onClose: () => void;
  onUpdateStatus: (tareaId: string, nuevoEstado: EstadoTarea) => void;
  onAddComment: (tareaId: string, texto: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  tarea,
  usuarioActual,
  comentarios,
  onClose,
  onUpdateStatus,
  onAddComment,
}) => {
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [firmaVerificada, setFirmaVerificada] = useState(true);

  if (!tarea) return null;

  const comentariosTarea = comentarios.filter(c => c.tarea_id === tarea.id);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    onAddComment(tarea.id, nuevoComentario);
    setNuevoComentario('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="ccv-card w-full max-w-3xl bg-white max-h-[90vh] overflow-y-auto flex flex-col justify-between shadow-floating border-stone-300">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-start bg-cream-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800">
                {tarea.tipo_tarea}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                tarea.estado === 'Completado' ? 'badge-green' : 'badge-red'
              }`}>
                {tarea.estado}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-charcoal-900">{tarea.titulo}</h3>
            <p className="text-xs text-charcoal-500 mt-1">
              Área: <span className="font-semibold text-charcoal-800">{tarea.area_nombre || 'CMU'}</span> • 
              {tarea.curso_nombre ? ` Curso: ${tarea.curso_nombre}` : ` Proyecto: ${tarea.proyecto_nombre}`}
            </p>
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

          {/* Metrics Grid */}
          <div className={`grid grid-cols-1 ${tarea.tipo_tarea === 'Proyecto' && tarea.tarifa_tarea !== undefined ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold mb-1">
                <User className="w-4 h-4 text-sage-600" /> Responsable
              </div>
              <p className="text-sm font-extrabold text-charcoal-900">{tarea.responsable_nombre}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold mb-1">
                <Clock className="w-4 h-4 text-amber-600" /> Registro de Tiempos
              </div>
              <p className="text-sm font-extrabold text-charcoal-900">
                {tarea.tiempo_invertido}h / {tarea.tiempo_estimado}h est.
              </p>
            </div>

            {tarea.tipo_tarea === 'Proyecto' && tarea.tarifa_tarea !== undefined && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 text-charcoal-500 text-xs font-semibold mb-1">
                  <DollarSign className="w-4 h-4 text-sage-600" /> Costo Financiero (COP)
                </div>
                <p className="text-sm font-extrabold text-sage-700">${tarea.tarifa_tarea.toLocaleString('es-CO')} COP</p>
                {tarea.tarifa_hora && (
                  <p className="text-[10px] text-charcoal-500 font-medium mt-0.5">
                    {tarea.categoria_proyecto || 'Proyecto'}: ${tarea.tarifa_hora.toLocaleString('es-CO')} COP/h × {tarea.tiempo_estimado}h
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Digital Signature & Deliverable Validation Section */}
          <div className="p-4 bg-sage-50/60 rounded-2xl border border-sage-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sage-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-extrabold text-charcoal-900 text-sm">Firma Digital & Validez Institucional</h5>
                <p className="text-xs text-charcoal-600">Entregables firmados criptográficamente por el docente y el CCV.</p>
              </div>
            </div>

            <button
              onClick={() => setFirmaVerificada(!firmaVerificada)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                firmaVerificada ? 'bg-sage-600 text-white' : 'bg-white border border-stone-300 text-charcoal-700'
              }`}
            >
              {firmaVerificada ? 'Firma Aprobada ✓' : 'Firmar Entregable'}
            </button>
          </div>

          {/* Estado Selector */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-2">Cambiar Estado de la Tarea</h4>
            <div className="flex flex-wrap gap-2">
              {(['Pendiente', 'En Proceso', 'En Revisión', 'Completado'] as EstadoTarea[]).map((est) => (
                <button
                  key={est}
                  onClick={() => onUpdateStatus(tarea.id, est)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    tarea.estado === est
                      ? 'bg-charcoal-900 text-white shadow-md scale-105'
                      : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                  }`}
                >
                  {est}
                </button>
              ))}
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
