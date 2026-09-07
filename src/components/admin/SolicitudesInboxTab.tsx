'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Building2,
  User,
  Phone,
  Calendar,
  Link2,
  ExternalLink,
  Plus,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  FileText,
  Briefcase,
  BookOpen,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { 
  SolicitudTareaCCV, 
  EstadoSolicitudTarea, 
  PrioridadSolicitud, 
  Usuario, 
  CursoVirtual, 
  ProyectoEspecial, 
  Area, 
  TareaCCV, 
  TipoTarea, 
  CategoriaTareaProyecto 
} from '@/types';
import { useAuth } from '@/context/AuthContext';

interface SolicitudesInboxTabProps {
  solicitudes: SolicitudTareaCCV[];
  usuarios: Usuario[];
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  areas: Area[];
  onSelectTask?: (tarea: TareaCCV) => void;
}

export const SolicitudesInboxTab: React.FC<SolicitudesInboxTabProps> = ({
  solicitudes,
  usuarios,
  cursos,
  proyectos,
  areas
}) => {
  const { 
    actualizarEstadoSolicitud, 
    aprobarYConvertirSolicitud, 
    solicitudesLoading, 
    cargarSolicitudesTareas 
  } = useAuth();

  // Estados de filtros y búsqueda
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroOrigen, setFiltroOrigen] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modales de Gestión
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudTareaCCV | null>(null);
  const [modoAccion, setModoAccion] = useState<'ver' | 'aprobar' | 'rechazar' | null>(null);

  // Estados para formulario de conversión (Aprobar)
  const [tipoTarea, setTipoTarea] = useState<TipoTarea>('Curso Virtual');
  const [cursoId, setCursoId] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [rolDestino, setRolDestino] = useState('Diseño');
  const [categoriaProyecto, setCategoriaProyecto] = useState<CategoriaTareaProyecto>('Diseño');
  const [areaId, setAreaId] = useState('');
  const [tiempoEstimado, setTiempoEstimado] = useState(2);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [horaVencimiento, setHoraVencimiento] = useState('');
  
  // Estado para rechazo
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Métricas
  const total = solicitudes.length;
  const pendientes = solicitudes.filter(s => s.estado === 'Pendiente').length;
  const aprobadas = solicitudes.filter(s => s.estado === 'Aprobada').length;
  const rechazadas = solicitudes.filter(s => s.estado === 'Rechazada').length;

  // Filtrado dinámico
  const solicitudesFiltradas = solicitudes.filter(s => {
    // Filtro por estado
    if (filtroEstado !== 'todos' && s.estado !== filtroEstado) return false;
    
    // Filtro por tipo de origen
    if (filtroOrigen !== 'todos' && s.tipo_origen !== filtroOrigen) return false;

    // Búsqueda por texto
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const matchTitulo = s.titulo.toLowerCase().includes(q);
      const matchSolicitante = s.solicitante_nombre.toLowerCase().includes(q);
      const matchOrigen = s.origen_nombre.toLowerCase().includes(q);
      const matchContacto = s.solicitante_contacto.toLowerCase().includes(q);
      const matchDesc = s.descripcion.toLowerCase().includes(q);
      if (!matchTitulo && !matchSolicitante && !matchOrigen && !matchContacto && !matchDesc) {
        return false;
      }
    }

    return true;
  });

  // Abrir modal de aprobación con datos pre-cargados
  const handleOpenAprobar = (s: SolicitudTareaCCV) => {
    setSolicitudSeleccionada(s);
    setModoAccion('aprobar');
    setFechaVencimiento(s.fecha_estimada_entrega || '');
    setHoraVencimiento(s.hora_estimada || '');
    
    if (cursos.length > 0) {
      setTipoTarea('Curso Virtual');
      setCursoId(cursos[0].id);
    } else if (proyectos.length > 0) {
      setTipoTarea('Proyecto');
      setProyectoId(proyectos[0].id);
    }
    if (usuarios.length > 0) {
      setResponsableId(usuarios[0].id);
    }
    if (areas.length > 0) {
      setAreaId(areas[0].id);
    }
    setFeedbackMsg(null);
  };

  // Abrir modal de rechazo
  const handleOpenRechazar = (s: SolicitudTareaCCV) => {
    setSolicitudSeleccionada(s);
    setModoAccion('rechazar');
    setMotivoRechazo('');
    setFeedbackMsg(null);
  };

  // Abrir vista detallada
  const handleVerDetalle = (s: SolicitudTareaCCV) => {
    setSolicitudSeleccionada(s);
    setModoAccion('ver');
    setFeedbackMsg(null);
  };

  // Ejecutar rechazo
  const handleConfirmRechazar = async () => {
    if (!solicitudSeleccionada) return;
    setIsProcessing(true);
    setFeedbackMsg(null);

    const ok = await actualizarEstadoSolicitud(
      solicitudSeleccionada.id,
      'Rechazada',
      motivoRechazo.trim() || 'No viable o fuera del alcance del CCV'
    );

    setIsProcessing(false);

    if (ok) {
      setFeedbackMsg({ tipo: 'success', texto: 'Solicitud marcada como rechazada.' });
      setTimeout(() => {
        setModoAccion(null);
        setSolicitudSeleccionada(null);
      }, 1000);
    } else {
      setFeedbackMsg({ tipo: 'error', texto: 'No se pudo actualizar el estado.' });
    }
  };

  // Ejecutar Aprobación y Conversión en Tarea
  const handleConfirmAprobar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitudSeleccionada) return;

    setIsProcessing(true);
    setFeedbackMsg(null);

    const targetCurso = tipoTarea === 'Curso Virtual' ? cursos.find(c => c.id === cursoId) : undefined;
    const targetProy = (tipoTarea === 'Proyecto' || (tipoTarea as string) === 'Proyecto Especial') ? proyectos.find(p => p.id === proyectoId) : undefined;
    const targetResp = usuarios.find(u => u.id === responsableId);
    const targetArea = areas.find(a => a.id === areaId);

    const nuevaTareaPayload: Omit<TareaCCV, 'id'> = {
      titulo: solicitudSeleccionada.titulo,
      descripcion: `${solicitudSeleccionada.descripcion}\n\n📌 Solicitado por: ${solicitudSeleccionada.solicitante_nombre} (${solicitudSeleccionada.solicitante_contacto}) - ${solicitudSeleccionada.origen_nombre}`,
      tipo_tarea: tipoTarea,
      curso_id: tipoTarea === 'Curso Virtual' ? (targetCurso?.id || null as any) : undefined,
      curso_nombre: tipoTarea === 'Curso Virtual' ? (targetCurso?.nombre || undefined) : undefined,
      proyecto_id: (tipoTarea === 'Proyecto' || (tipoTarea as string) === 'Proyecto Especial') ? (targetProy?.id || null as any) : undefined,
      proyecto_nombre: (tipoTarea === 'Proyecto' || (tipoTarea as string) === 'Proyecto Especial') ? (targetProy?.nombre || undefined) : undefined,
      area_id: targetArea?.id || undefined,
      area_nombre: targetArea?.nombre || undefined,
      responsable_id: targetResp?.id || undefined,
      responsable_nombre: targetResp?.nombre_completo || undefined,
      responsable_avatar: targetResp?.avatar_url || undefined,
      rol_destino: rolDestino || 'Diseño',
      categoria_proyecto: categoriaProyecto,
      orden_tarea: 0,
      estado: 'Pendiente',
      fecha_vencimiento: fechaVencimiento || solicitudSeleccionada.fecha_estimada_entrega,
      hora_vencimiento: horaVencimiento || solicitudSeleccionada.hora_estimada || undefined,
      tiempo_invertido: 0,
      tarifa_hora: 0,
      tarifa_tarea: 0,
      enlace_recurso: solicitudSeleccionada.enlace_recurso || undefined
    };

    const res = await aprobarYConvertirSolicitud(solicitudSeleccionada.id, nuevaTareaPayload);
    setIsProcessing(false);

    if (res.success) {
      setFeedbackMsg({ tipo: 'success', texto: '¡Solicitud aprobada y convertida en tarea formal con éxito!' });
      setTimeout(() => {
        setModoAccion(null);
        setSolicitudSeleccionada(null);
      }, 1200);
    } else {
      setFeedbackMsg({ tipo: 'error', texto: res.error || 'No se pudo crear la tarea formal.' });
    }
  };

  // Helper para enlace de WhatsApp
  const getWhatsAppLink = (contacto: string, nombre: string, titulo: string) => {
    const cleaned = contacto.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hola ${nombre}, te saludamos desde el Centro de Educación Virtual (CCV) con respecto a tu solicitud "${titulo}".`);
    return `https://wa.me/${cleaned}?text=${text}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header & Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-charcoal-500 uppercase tracking-wider">Total</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-charcoal-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 mt-2">{total}</div>
          <p className="text-[11px] text-charcoal-400 mt-0.5">Requerimientos radicados</p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-amber-200/80 shadow-2xs bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Pendientes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{pendientes}</div>
          <p className="text-[11px] text-amber-700/80 mt-0.5">Por evaluar y asignar</p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-emerald-200/80 shadow-2xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Aprobadas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">{aprobadas}</div>
          <p className="text-[11px] text-emerald-700/80 mt-0.5">Convertidas en tareas</p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-rose-200/80 shadow-2xs bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">Rechazadas</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-900 mt-2">{rechazadas}</div>
          <p className="text-[11px] text-rose-700/80 mt-0.5">Descartadas con motivo</p>
        </div>
      </div>

      {/* 2. Barra de Filtros y Búsqueda */}
      <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, solicitante, facultad/área o contacto..."
            className="w-full pl-9 pr-4 py-2 bg-cream-50/60 border border-stone-200 rounded-2xl text-xs font-semibold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 bg-cream-50/60 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
          >
            <option value="todos">Todos los Estados ({total})</option>
            <option value="Pendiente">Pendientes ({pendientes})</option>
            <option value="Aprobada">Aprobadas ({aprobadas})</option>
            <option value="Rechazada">Rechazadas ({rechazadas})</option>
          </select>

          {/* Filtro Origen */}
          <select
            value={filtroOrigen}
            onChange={(e) => setFiltroOrigen(e.target.value)}
            className="px-3 py-2 bg-cream-50/60 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
          >
            <option value="todos">Todo Origen</option>
            <option value="Facultad">🏢 Facultades</option>
            <option value="Departamento/Área">📂 Departamentos/Áreas</option>
          </select>

          {/* Botón Recargar */}
          <button
            onClick={() => cargarSolicitudesTareas()}
            disabled={solicitudesLoading}
            title="Recargar bandeja"
            className="p-2 bg-cream-50 hover:bg-cream-100 text-charcoal-600 rounded-2xl border border-stone-200 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${solicitudesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* 3. Listado de Solicitudes */}
      {solicitudesFiltradas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cream-100 text-charcoal-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-charcoal-800">
            No se encontraron solicitudes con los filtros seleccionados
          </h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            {busqueda || filtroEstado !== 'todos' || filtroOrigen !== 'todos'
              ? 'Prueba restableciendo los filtros o el término de búsqueda.'
              : 'Las solicitudes que los usuarios radiquen desde el formulario público del Home aparecerán aquí.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {solicitudesFiltradas.map((s) => {
            const isPendiente = s.estado === 'Pendiente';
            const isAprobada = s.estado === 'Aprobada';
            const isRechazada = s.estado === 'Rechazada';

            return (
              <div
                key={s.id}
                className="p-5 bg-white rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header de la tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge Estado */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                        isPendiente
                          ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse'
                          : isAprobada
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      {s.estado}
                    </span>

                    {/* Badge Origen */}
                    <span className="px-2.5 py-1 rounded-full bg-cream-100 text-charcoal-700 font-bold text-[11px] border border-stone-200 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-primary-600" />
                      {s.origen_nombre} ({s.tipo_origen})
                    </span>

                    {/* Badge Prioridad */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.prioridad === 'Urgente'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300 font-black'
                          : s.prioridad === 'Alta'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-charcoal-700'
                      }`}
                    >
                      {s.prioridad === 'Urgente' ? '🔥 Urgente' : `Prioridad ${s.prioridad}`}
                    </span>
                  </div>

                  {/* Fecha de Radicación */}
                  <span className="text-[11px] text-charcoal-400 font-medium">
                    Radicado: {s.created_at ? new Date(s.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                  </span>
                </div>

                {/* Contenido Principal */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-charcoal-900 tracking-tight">
                    {s.titulo}
                  </h3>
                  <p className="text-xs text-charcoal-600 leading-relaxed line-clamp-2">
                    {s.descripcion}
                  </p>
                </div>

                {/* Datos de Contacto y Fecha Deseada */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-cream-50/70 rounded-2xl border border-stone-200/80 text-xs">
                  {/* Solicitante */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-white text-primary-700 flex items-center justify-center border border-stone-200 shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-charcoal-400 block">Solicitante</span>
                      <span className="font-bold text-charcoal-800 truncate block">{s.solicitante_nombre}</span>
                    </div>
                  </div>

                  {/* Contacto & WhatsApp */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-xl bg-white text-emerald-700 flex items-center justify-center border border-stone-200 shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] font-bold text-charcoal-400 block">Contacto</span>
                        <span className="font-bold text-charcoal-800 truncate block">{s.solicitante_contacto}</span>
                      </div>
                    </div>

                    {/* Botón WhatsApp directo */}
                    <a
                      href={getWhatsAppLink(s.solicitante_contacto, s.solicitante_nombre, s.titulo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                      title="Contactar por WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Chat</span>
                    </a>
                  </div>

                  {/* Fecha Estimada */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-white text-indigo-700 flex items-center justify-center border border-stone-200 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-charcoal-400 block">Entrega deseada</span>
                      <span className="font-bold text-charcoal-800 block">
                        {s.fecha_estimada_entrega} {s.hora_estimada ? `(${s.hora_estimada})` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Motivo de rechazo si aplica */}
                {s.motivo_rechazo && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Motivo de Rechazo:</span>
                      <span>{s.motivo_rechazo}</span>
                    </div>
                  </div>
                )}

                {/* Enlace a recurso si existe */}
                {s.enlace_recurso && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-charcoal-500 font-bold">Material de apoyo:</span>
                    <a
                      href={s.enlace_recurso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-700 hover:text-primary-800 font-extrabold flex items-center gap-1 hover:underline"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span className="truncate max-w-xs">{s.enlace_recurso}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Barra de Acciones */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => handleVerDetalle(s)}
                    className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-charcoal-700 hover:bg-cream-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-charcoal-500" />
                    <span>Ver Detalle Completo</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isPendiente && (
                      <>
                        <button
                          onClick={() => handleOpenRechazar(s)}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>

                        <button
                          onClick={() => handleOpenAprobar(s)}
                          className="px-4 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-accent-400" />
                          <span>Aprobar & Crear Tarea</span>
                        </button>
                      </>
                    )}

                    {isAprobada && s.tarea_creada_id && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tarea Creada y Activa
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: APROBAR Y CONVERTIR EN TAREA FORMAL                         */}
      {/* ------------------------------------------------------------------ */}
      {modoAccion === 'aprobar' && solicitudSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={() => !isProcessing && setModoAccion(null)} />
          
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-auto animate-in zoom-in-95">
            
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-primary-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Aprobar y Asignar Tarea CCV</h3>
                  <p className="text-[11px] text-white/80">Convierte esta solicitud en una tarea formal</p>
                </div>
              </div>
              <button onClick={() => !isProcessing && setModoAccion(null)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAprobar} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {feedbackMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${feedbackMsg.tipo === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {feedbackMsg.texto}
                </div>
              )}

              {/* Título de la tarea */}
              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  disabled
                  value={solicitudSeleccionada.titulo}
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 cursor-not-allowed"
                />
              </div>

              {/* Tipo de Tarea */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Tipo de Tarea</label>
                  <select
                    value={tipoTarea}
                    onChange={(e) => setTipoTarea(e.target.value as TipoTarea)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Curso Virtual">Curso Virtual</option>
                    <option value="Proyecto">Proyecto Especial</option>
                  </select>
                </div>

                {/* Curso o Proyecto Asociado */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                    {tipoTarea === 'Curso Virtual' ? 'Asociar a Curso' : 'Asociar a Proyecto'}
                  </label>
                  {tipoTarea === 'Curso Virtual' ? (
                    <select
                      value={cursoId}
                      onChange={(e) => setCursoId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {cursos.map(c => (
                        <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={proyectoId}
                      onChange={(e) => setProyectoId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {proyectos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Responsable & Rol Destino */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Responsable Asignado</label>
                  <select
                    value={responsableId}
                    onChange={(e) => setResponsableId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Sin Asignar --</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre_completo} ({u.rol_nombre || 'Colaborador'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Especialidad / Rol Destino</label>
                  <select
                    value={rolDestino}
                    onChange={(e) => {
                      setRolDestino(e.target.value);
                      setCategoriaProyecto(e.target.value as CategoriaTareaProyecto);
                    }}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Diseño">Diseño Instruccional</option>
                    <option value="Multimedia">Producción Multimedia</option>
                    <option value="Soporte">Soporte Técnico</option>
                    <option value="Transmisión">Transmisión / Eventos</option>
                  </select>
                </div>
              </div>

              {/* Fechas de Entrega */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Hora Vencimiento</label>
                  <input
                    type="time"
                    value={horaVencimiento}
                    onChange={(e) => setHoraVencimiento(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setModoAccion(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-700 font-bold text-xs hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  {isProcessing ? (
                    <span>Procesando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar y Crear Tarea</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: RECHAZAR SOLICITUD                                          */}
      {/* ------------------------------------------------------------------ */}
      {modoAccion === 'rechazar' && solicitudSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={() => !isProcessing && setModoAccion(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-auto animate-in zoom-in-95">
            <div className="px-6 py-4 bg-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-rose-200" />
                <h3 className="text-base font-black tracking-tight">Rechazar Solicitud</h3>
              </div>
              <button onClick={() => !isProcessing && setModoAccion(null)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-charcoal-600">
                Indica el motivo por el cual se rechaza este requerimiento (quedará registrado en el historial):
              </p>

              <textarea
                rows={3}
                required
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej. La solicitud debe radicarse con al menos 15 días de anticipación según la política institucional..."
                className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-medium text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setModoAccion(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-charcoal-700 font-bold text-xs hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmRechazar}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  {isProcessing ? 'Guardando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: VER DETALLE COMPLETO                                        */}
      {/* ------------------------------------------------------------------ */}
      {modoAccion === 'ver' && solicitudSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={() => setModoAccion(null)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-auto animate-in zoom-in-95">
            <div className="px-6 py-4 bg-charcoal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-accent-400" />
                <h3 className="text-base font-black tracking-tight">Detalle de la Solicitud</h3>
              </div>
              <button onClick={() => setModoAccion(null)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Título</span>
                <span className="font-black text-charcoal-900 text-sm block">{solicitudSeleccionada.titulo}</span>
              </div>

              <div>
                <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Descripción</span>
                <p className="text-charcoal-700 leading-relaxed mt-1 bg-cream-50 p-3 rounded-xl border border-stone-200">
                  {solicitudSeleccionada.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Origen</span>
                  <span className="font-bold text-charcoal-800">{solicitudSeleccionada.origen_nombre}</span>
                </div>
                <div>
                  <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Prioridad</span>
                  <span className="font-bold text-charcoal-800">{solicitudSeleccionada.prioridad}</span>
                </div>
                <div>
                  <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Solicitante</span>
                  <span className="font-bold text-charcoal-800">{solicitudSeleccionada.solicitante_nombre}</span>
                </div>
                <div>
                  <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Contacto</span>
                  <span className="font-bold text-charcoal-800">{solicitudSeleccionada.solicitante_contacto}</span>
                </div>
                <div>
                  <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Fecha Estimada</span>
                  <span className="font-bold text-charcoal-800">{solicitudSeleccionada.fecha_estimada_entrega}</span>
                </div>
                <div>
                  <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Hora</span>
                  <span className="font-bold text-charcoal-800">{solicitudSeleccionada.hora_estimada || 'No especificada'}</span>
                </div>
              </div>

              {solicitudSeleccionada.enlace_recurso && (
                <div>
                  <span className="font-bold text-charcoal-400 block text-[10px] uppercase">Enlace a Material</span>
                  <a
                    href={solicitudSeleccionada.enlace_recurso}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-700 font-extrabold hover:underline flex items-center gap-1 mt-0.5 truncate"
                  >
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{solicitudSeleccionada.enlace_recurso}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModoAccion(null)}
                  className="px-5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-900 text-white font-bold text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
