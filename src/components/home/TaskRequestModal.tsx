'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Layers,
  FilePlus,
  Mail
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PrioridadSolicitud } from '@/types';

interface TaskRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskRequestModal: React.FC<TaskRequestModalProps> = ({ isOpen, onClose }) => {
  const { usuarioActual, roles, areas, enviarSolicitudTarea } = useAuth();

  // Estados del Formulario de Especificaciones de la Tarea
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEstimada, setFechaEstimada] = useState('');
  const [horaEstimada, setHoraEstimada] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadSolicitud>('Normal');

  // Estados de feedback y proceso
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [radicadoExitoso, setRadicadoExitoso] = useState<string | null>(null);

  // Fecha mínima: Hoy (YYYY-MM-DD)
  const hoyStr = new Date().toISOString().split('T')[0];

  // Resolver Rol y Área institucional del usuario autenticado
  const usuarioRol = roles.find(r => r.id === usuarioActual?.rol_id);
  const rolNombre = usuarioActual?.rol_nombre || usuarioRol?.nombre || 'Docente / Usuario';

  const usuarioArea = areas.find(a => 
    a.nombre.toLowerCase() === (usuarioActual?.area_nombre || '').toLowerCase() || 
    (usuarioRol?.area_id && a.id === usuarioRol.area_id)
  );
  const areaNombre = usuarioArea?.nombre || usuarioActual?.area_nombre || 'Centro de Educación Virtual CCV';
  
  const getNivelJerarquia = () => {
    if (!usuarioArea) return 'Área Institucional';
    switch (usuarioArea.nivel) {
      case 6: return 'Nivel 6 • Dirección / Admin';
      case 5: return 'Nivel 5 • Unidad CCV';
      case 4: return 'Nivel 4 • Departamento';
      case 3: return 'Nivel 3 • Facultad';
      case 2: return 'Nivel 2 • Programa';
      case 1: return 'Nivel 1 • Curso';
      default: return `Nivel ${usuarioArea.nivel} • Institucional`;
    }
  };
  const jerarquiaTexto = getNivelJerarquia();

  // Manejo de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Inicializar fecha estimada sugerida al abrir modal
  useEffect(() => {
    if (isOpen && !fechaEstimada) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 5);
      setFechaEstimada(defaultDate.toISOString().split('T')[0]);
    }
  }, [isOpen, fechaEstimada]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setHoraEstimada('');
    setPrioridad('Normal');
    setErrorMsg(null);
    setRadicadoExitoso(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!usuarioActual) {
      setErrorMsg('Debes tener una sesión activa para radicar una solicitud.');
      return;
    }
    if (!titulo.trim()) {
      setErrorMsg('Por favor ingresa el título del requerimiento o tarea.');
      return;
    }
    if (!descripcion.trim()) {
      setErrorMsg('Por favor describe en detalle el requerimiento o los entregables esperados.');
      return;
    }
    if (!fechaEstimada) {
      setErrorMsg('Por favor indica la fecha estimada de entrega deseada.');
      return;
    }

    setLoading(true);

    try {
      const tipoOrigen: 'Facultad' | 'Departamento/Área' = usuarioArea?.nivel === 3 ? 'Facultad' : 'Departamento/Área';
      const origenId = usuarioArea?.id || null;

      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo_origen: tipoOrigen,
        origen_id: origenId,
        origen_nombre: areaNombre,
        fecha_estimada_entrega: fechaEstimada,
        hora_estimada: horaEstimada.trim() || null,
        solicitante_id: usuarioActual.id,
        solicitante_nombre: usuarioActual.nombre_completo.trim(),
        solicitante_email: usuarioActual.email || null,
        solicitante_rol: rolNombre,
        solicitante_contacto: usuarioActual.telefono || usuarioActual.email || 'Plataforma CCV',
        enlace_recurso: null,
        prioridad,
        estado: 'Pendiente' as const
      };

      const result = await enviarSolicitudTarea(payload);

      if (result.success && result.data) {
        const radicadoCode = `RAD-CCV-${result.data.id.slice(0, 8).toUpperCase()}`;
        setRadicadoExitoso(radicadoCode);
      } else {
        setErrorMsg(result.error || 'Ocurrió un error al registrar la solicitud en la base de datos.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error de conexión al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header con gradiente institucional */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sky-400 shadow-inner">
                <FilePlus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Solicitud de Tarea CCV</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-extrabold text-[10px] border border-sky-400/30">
                    Institucional
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  Radica tu requerimiento al Centro de Educación Virtual
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!loading) onClose();
              }}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto space-y-5">
          
          {radicadoExitoso ? (
            /* Vista de Éxito y Radicado Generado */
            <div className="py-6 px-4 text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  ¡Solicitud Radicada con Éxito!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Tu requerimiento ha sido registrado en la base de datos de la plataforma para la revisión y asignación del Administrador del CCV.
                </p>
              </div>

              {/* Tarjeta con detalles del radicado */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">Número de Radicado:</span>
                  <span className="font-mono font-black text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                    {radicadoExitoso}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Solicitante:</span>
                  <span className="font-bold text-slate-800">{usuarioActual?.nombre_completo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Rol:</span>
                  <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {rolNombre}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Área / Jerarquía:</span>
                  <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {areaNombre} ({jerarquiaTexto})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Fecha Deseada:</span>
                  <span className="font-bold text-slate-800">
                    {fechaEstimada} {horaEstimada ? `(${horaEstimada})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Prioridad:</span>
                  <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {prioridad}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Radicar otra solicitud
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Entendido y Cerrar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Formulario Simplificado y Directo */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Alerta de Error si ocurre */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Tarjeta de Identidad del Solicitante Autenticado (Lectura directa de la sesión) */}
              {usuarioActual && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      Datos del Solicitante (Sesión Activa)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Autenticado
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs border border-slate-700 overflow-hidden">
                      {usuarioActual.avatar_url ? (
                        <img 
                          src={usuarioActual.avatar_url} 
                          alt={usuarioActual.nombre_completo} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        usuarioActual.nombre_completo.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {usuarioActual.nombre_completo}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 font-medium">
                        <span className="text-sky-700 font-bold">{rolNombre}</span>
                        <span>•</span>
                        <span>{areaNombre}</span>
                        <span>•</span>
                        <span className="text-slate-400">{usuarioActual.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Especificaciones de la Tarea */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  Especificaciones del Requerimiento
                </h4>

                {/* Título de la tarea */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Título de la Tarea / Requerimiento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Grabación de videoclase Módulo 2 - Anatomía Humana"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-2xs transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Descripción detallada */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Descripción del Requerimiento <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {descripcion.length} caracteres
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe los objetivos, entregables esperados, recursos disponibles o especificaciones técnicas para el CCV..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-2xs resize-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Fechas y Horas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Fecha Estimada de Entrega <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        required
                        min={hoyStr}
                        value={fechaEstimada}
                        onChange={(e) => setFechaEstimada(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-2xs transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Hora Requerida <span className="text-slate-400 font-normal">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="time"
                        value={horaEstimada}
                        onChange={(e) => setHoraEstimada(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white shadow-2xs transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Nivel de Urgencia */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Nivel de Urgencia
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Baja', 'Normal', 'Alta', 'Urgente'] as PrioridadSolicitud[]).map((p) => {
                      const isSelected = prioridad === p;
                      const getStyle = () => {
                        if (!isSelected) return 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';
                        switch (p) {
                          case 'Baja': return 'bg-sky-50 border-sky-400 text-sky-800 font-extrabold ring-1 ring-sky-400';
                          case 'Normal': return 'bg-slate-800 border-slate-800 text-white font-extrabold ring-1 ring-slate-800';
                          case 'Alta': return 'bg-amber-50 border-amber-400 text-amber-800 font-extrabold ring-1 ring-amber-400';
                          case 'Urgente': return 'bg-rose-50 border-rose-400 text-rose-800 font-extrabold ring-1 ring-rose-400';
                        }
                      };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPrioridad(p)}
                          className={`py-2 px-2 rounded-xl border text-center text-xs transition-all shadow-2xs cursor-pointer ${getStyle()}`}
                        >
                          {p === 'Urgente' ? '🔥 Urgente' : p}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer scale-100 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Radicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-sky-400" />
                      <span>Radicar Solicitud al CCV</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
