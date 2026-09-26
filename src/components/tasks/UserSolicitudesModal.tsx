'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Building2,
  Calendar,
  Link2,
  ExternalLink,
  Plus,
  RotateCcw,
  Sparkles,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SolicitudTareaCCV, EstadoSolicitudTarea } from '@/types';

interface UserSolicitudesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTaskRequest?: () => void;
}

export const UserSolicitudesModal: React.FC<UserSolicitudesModalProps> = ({
  isOpen,
  onClose,
  onOpenTaskRequest,
}) => {
  const { usuarioActual, solicitudesTareas, solicitudesLoading, cargarSolicitudesTareas } = useAuth();

  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoSolicitudTarea>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtrar solicitudes exclusivas del usuario actual
  const misSolicitudes = useMemo(() => {
    if (!usuarioActual) return [];
    const userId = usuarioActual.id;
    const userEmail = usuarioActual.email ? usuarioActual.email.trim().toLowerCase() : '';

    return (solicitudesTareas || [])
      .filter(s => {
        const matchId = s.solicitante_id && s.solicitante_id === userId;
        const matchEmail = s.solicitante_email && userEmail && s.solicitante_email.trim().toLowerCase() === userEmail;
        return matchId || matchEmail;
      })
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  }, [solicitudesTareas, usuarioActual]);

  // Conteos por estado
  const total = misSolicitudes.length;
  const pendientes = misSolicitudes.filter(s => s.estado === 'Pendiente').length;
  const aprobadas = misSolicitudes.filter(s => s.estado === 'Aprobada').length;
  const rechazadas = misSolicitudes.filter(s => s.estado === 'Rechazada').length;

  // Filtrado activo
  const solicitudesFiltradas = useMemo(() => {
    return misSolicitudes.filter(s => {
      // Filtro de estado
      if (filtroEstado !== 'todos' && s.estado !== filtroEstado) {
        return false;
      }
      // Filtro de búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const matchTitulo = s.titulo.toLowerCase().includes(q);
        const matchDesc = s.descripcion.toLowerCase().includes(q);
        const matchOrigen = (s.origen_nombre || '').toLowerCase().includes(q);
        const matchMotivo = (s.motivo_rechazo || '').toLowerCase().includes(q);
        return matchTitulo || matchDesc || matchOrigen || matchMotivo;
      }
      return true;
    });
  }, [misSolicitudes, filtroEstado, busqueda]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await cargarSolicitudesTareas();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNuevaSolicitudClick = () => {
    onClose();
    if (onOpenTaskRequest) {
      onOpenTaskRequest();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-scaleUp">
        
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shadow-inner">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Bandeja de Mis Solicitudes
                </h2>
                {pendientes > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                    {pendientes} en revisión
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Consulta el estado de tus requerimientos radicados y las respuestas del Administrador.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || solicitudesLoading}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Actualizar bandeja"
            >
              <RotateCcw className={`w-4 h-4 ${isRefreshing || solicitudesLoading ? 'animate-spin' : ''}`} />
            </button>

            {onOpenTaskRequest && (
              <button
                onClick={handleNuevaSolicitudClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Nueva Solicitud</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Filtros por estado y Buscador */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Tabs de Estado */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filtroEstado === 'todos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Todas ({total})
            </button>
            <button
              onClick={() => setFiltroEstado('Pendiente')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filtroEstado === 'Pendiente'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({pendientes})</span>
            </button>
            <button
              onClick={() => setFiltroEstado('Aprobada')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filtroEstado === 'Aprobada'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprobadas ({aprobadas})</span>
            </button>
            <button
              onClick={() => setFiltroEstado('Rechazada')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filtroEstado === 'Rechazada'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rechazadas ({rechazadas})</span>
            </button>
          </div>

          {/* Buscador */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar solicitud..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Listado con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {solicitudesLoading && misSolicitudes.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <div className="inline-block w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-bold">Cargando tus solicitudes...</p>
            </div>
          ) : solicitudesFiltradas.length === 0 ? (
            <div className="py-16 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-800">
                {busqueda ? 'No se encontraron solicitudes con esa búsqueda' : 'No tienes solicitudes en esta sección'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {busqueda
                  ? 'Intenta con otro término o limpia el buscador para ver todas tus solicitudes.'
                  : 'Cuando radiques requerimientos para el equipo de producción CCV, aparecerán registrados aquí.'}
              </p>
              {onOpenTaskRequest && (
                <div className="pt-2">
                  <button
                    onClick={handleNuevaSolicitudClick}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3] text-sky-400" />
                    <span>Radicar Primera Solicitud</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            solicitudesFiltradas.map((s) => {
              const isPendiente = s.estado === 'Pendiente';
              const isAprobada = s.estado === 'Aprobada';
              const isRechazada = s.estado === 'Rechazada';

              return (
                <div
                  key={s.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs hover:shadow-md ${
                    isPendiente
                      ? 'border-amber-200/90 hover:border-amber-300'
                      : isAprobada
                      ? 'border-emerald-200/90 hover:border-emerald-300'
                      : 'border-rose-200/90 hover:border-rose-300'
                  }`}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge de Estado */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                          isPendiente
                            ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse'
                            : isAprobada
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        {isPendiente && <Clock className="w-3.5 h-3.5" />}
                        {isAprobada && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isRechazada && <XCircle className="w-3.5 h-3.5" />}
                        <span>{s.estado}</span>
                      </span>

                      {/* Badge de Prioridad */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          s.prioridad === 'Urgente'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : s.prioridad === 'Alta'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.prioridad === 'Urgente' ? '🔥 Urgente' : `Prioridad ${s.prioridad}`}
                      </span>

                      {/* Origen Institucional */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{s.origen_nombre}</span>
                      </span>
                    </div>

                    {/* Fecha de Radicación */}
                    <span className="text-[11px] font-medium text-slate-400">
                      Radicado: {s.created_at ? new Date(s.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                    </span>
                  </div>

                  {/* Cuerpo: Título y Descripción */}
                  <div className="py-3 space-y-1.5">
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {s.titulo}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {s.descripcion}
                    </p>
                  </div>

                  {/* Metadatos: Fecha de Entrega y Material de Apoyo */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        Entrega esperada: <strong className="text-slate-800">{s.fecha_estimada_entrega}</strong> {s.hora_estimada ? `(${s.hora_estimada})` : ''}
                      </span>
                    </div>

                    {s.enlace_recurso && (
                      <a
                        href={s.enlace_recurso}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold hover:underline"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Ver material adjunto</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* ========================================================= */}
                  {/* SECCIÓN: RETROALIMENTACIÓN / RESPUESTA DEL ADMINISTRADOR */}
                  {/* ========================================================= */}
                  {isRechazada && (
                    <div className="mt-3.5 p-3.5 bg-rose-50/90 border border-rose-200 rounded-2xl text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 font-black text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Mensaje del Administrador / Motivo de Rechazo:</span>
                      </div>
                      <p className="text-rose-950 whitespace-pre-wrap pl-6 text-xs leading-relaxed font-medium">
                        {s.motivo_rechazo || 'La solicitud no pudo ser aprobada en esta oportunidad. Puedes comunicarte con el equipo CCV para más información o ajustes.'}
                      </p>
                      {(s.revisado_por_nombre || s.fecha_revision) && (
                        <div className="text-[11px] text-rose-700/80 pl-6 pt-1 flex items-center gap-2">
                          {s.revisado_por_nombre && (
                            <span>Revisado por: <strong className="text-rose-900">{s.revisado_por_nombre}</strong></span>
                          )}
                          {s.fecha_revision && (
                            <span>• {new Date(s.fecha_revision).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {isAprobada && (
                    <div className="mt-3.5 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 font-black text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>¡Solicitud Aprobada e Integrada al Plan de Trabajo!</span>
                      </div>
                      <p className="text-emerald-950 pl-6 text-xs leading-relaxed font-medium">
                        Tu requerimiento fue aprobado con éxito y se ha generado una tarea operativa para el equipo de producción del CCV.
                      </p>
                      {(s.revisado_por_nombre || s.fecha_revision) && (
                        <div className="text-[11px] text-emerald-700/80 pl-6 pt-1 flex items-center gap-2">
                          {s.revisado_por_nombre && (
                            <span>Aprobado por: <strong className="text-emerald-900">{s.revisado_por_nombre}</strong></span>
                          )}
                          {s.fecha_revision && (
                            <span>• {new Date(s.fecha_revision).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {isPendiente && (
                    <div className="mt-3.5 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-800 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                      <span className="font-medium">
                        En fila de espera: Tu requerimiento está pendiente de ser evaluado por el equipo de coordinación y administración CCV.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Total de requerimientos personales: <strong>{total}</strong>
          </p>
          <div className="flex items-center gap-2">
            {onOpenTaskRequest && (
              <button
                onClick={handleNuevaSolicitudClick}
                className="sm:hidden px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
              >
                + Nueva Solicitud
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
