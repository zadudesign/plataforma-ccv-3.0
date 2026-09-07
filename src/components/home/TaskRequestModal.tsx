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
  Phone, 
  Link2, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PrioridadSolicitud } from '@/types';

interface TaskRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskRequestModal: React.FC<TaskRequestModalProps> = ({ isOpen, onClose }) => {
  const { facultades, areas, enviarSolicitudTarea } = useAuth();

  // Estados del Formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoOrigen, setTipoOrigen] = useState<'Facultad' | 'Departamento/Área'>('Facultad');
  const [origenId, setOrigenId] = useState('');
  const [origenNombre, setOrigenNombre] = useState('');
  const [fechaEstimada, setFechaEstimada] = useState('');
  const [horaEstimada, setHoraEstimada] = useState('');
  const [solicitanteNombre, setSolicitanteNombre] = useState('');
  const [solicitanteContacto, setSolicitanteContacto] = useState('');
  const [enlaceRecurso, setEnlaceRecurso] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadSolicitud>('Normal');

  // Estados de control y feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [radicadoExitoso, setRadicadoExitoso] = useState<string | null>(null);

  // Fecha mínima: Hoy
  const hoyStr = new Date().toISOString().split('T')[0];

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

  // Si no hay origen seleccionado al abrir, preseleccionar el primero disponible
  useEffect(() => {
    if (isOpen) {
      if (!origenNombre) {
        if (facultades.length > 0) {
          setTipoOrigen('Facultad');
          setOrigenId(facultades[0].id);
          setOrigenNombre(facultades[0].nombre);
        } else if (areas.length > 0) {
          setTipoOrigen('Departamento/Área');
          setOrigenId(areas[0].id);
          setOrigenNombre(areas[0].nombre);
        }
      }
      if (!fechaEstimada) {
        // Sugerir fecha por defecto: dentro de 5 días hábiles
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 5);
        setFechaEstimada(defaultDate.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, facultades, areas, origenNombre, fechaEstimada]);

  if (!isOpen) return null;

  const handleSelectOrigen = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;

    const [tipo, id, nombre] = val.split('|');
    setTipoOrigen(tipo as 'Facultad' | 'Departamento/Área');
    setOrigenId(id || '');
    setOrigenNombre(nombre || '');
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setHoraEstimada('');
    setSolicitanteNombre('');
    setSolicitanteContacto('');
    setEnlaceRecurso('');
    setPrioridad('Normal');
    setErrorMsg(null);
    setRadicadoExitoso(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validaciones
    if (!solicitanteNombre.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo como solicitante.');
      return;
    }
    if (!solicitanteContacto.trim()) {
      setErrorMsg('Por favor ingresa un número de contacto (Teléfono/WhatsApp).');
      return;
    }
    if (!origenNombre) {
      setErrorMsg('Por favor selecciona la Facultad o Departamento solicitante.');
      return;
    }
    if (!titulo.trim()) {
      setErrorMsg('Por favor ingresa el título del requerimiento o tarea.');
      return;
    }
    if (!descripcion.trim()) {
      setErrorMsg('Por favor describe en detalle la tarea requerida.');
      return;
    }
    if (!fechaEstimada) {
      setErrorMsg('Por favor indica la fecha estimada de entrega deseada.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo_origen: tipoOrigen,
        origen_id: origenId || null,
        origen_nombre: origenNombre,
        fecha_estimada_entrega: fechaEstimada,
        hora_estimada: horaEstimada.trim() || null,
        solicitante_nombre: solicitanteNombre.trim(),
        solicitante_contacto: solicitanteContacto.trim(),
        enlace_recurso: enlaceRecurso.trim() || null,
        prioridad,
        estado: 'Pendiente' as const
      };

      const result = await enviarSolicitudTarea(payload);

      if (result.success && result.data) {
        // Generar radicado visual amigable
        const radicadoCode = `RAD-CCV-${result.data.id.slice(0, 8).toUpperCase()}`;
        setRadicadoExitoso(radicadoCode);
      } else {
        setErrorMsg(result.error || 'Ocurrió un error al enviar la solicitud. Intenta nuevamente.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error de conexión al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop con desenfoque elegante */}
      <div 
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header con gradiente institucional */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-primary-800 via-primary-700 to-charcoal-900 text-white overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-accent-400 shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Solicitud de Tarea CCV</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent-400/20 text-accent-300 font-extrabold text-[10px] border border-accent-400/30">
                    Público
                  </span>
                </h2>
                <p className="text-xs text-white/80 font-medium">
                  Radica tu requerimiento al Centro de Educación Virtual
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!loading) onClose();
              }}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          
          {radicadoExitoso ? (
            /* Vista de Éxito */
            <div className="py-8 px-4 text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-charcoal-900 tracking-tight">
                  ¡Solicitud Radicada con Éxito!
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
                  Tu requerimiento ha sido registrado en la bandeja de entrada del Administrador del CCV para su revisión y asignación formal.
                </p>
              </div>

              {/* Tarjeta con detalles del radicado */}
              <div className="p-4 bg-cream-50/80 rounded-2xl border border-stone-200 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                  <span className="font-bold text-charcoal-500">Número de Radicado:</span>
                  <span className="font-mono font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-200">
                    {radicadoExitoso}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-500">Solicitante:</span>
                  <span className="font-bold text-charcoal-800">{solicitanteNombre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-500">Contacto:</span>
                  <span className="font-bold text-charcoal-800">{solicitanteContacto}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-500">Área / Facultad:</span>
                  <span className="font-bold text-charcoal-800">{origenNombre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-500">Entrega Estimada:</span>
                  <span className="font-bold text-charcoal-800">
                    {fechaEstimada} {horaEstimada ? `(${horaEstimada})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-charcoal-700 font-bold text-xs hover:bg-stone-50 transition-all"
                >
                  Radicar otra solicitud
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Entendido y Cerrar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Alerta de Error si ocurre */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Banner informativo */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-accent-600 shrink-0" />
                <span>
                  No requieres iniciar sesión. Los Administradores del CCV evaluarán tu requerimiento y te contactarán si se requieren especificaciones adicionales.
                </span>
              </div>

              {/* SECCIÓN 1: DATOS DEL SOLICITANTE */}
              <div className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary-600" />
                  1. Datos del Solicitante
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nombre completo */}
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                      Nombre Completo <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={solicitanteNombre}
                        onChange={(e) => setSolicitanteNombre(e.target.value)}
                        placeholder="Ej. Dra. María Gómez"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Número de contacto */}
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                      Número de Contacto (Tel / WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={solicitanteContacto}
                        onChange={(e) => setSolicitanteContacto(e.target.value)}
                        placeholder="Ej. +57 300 123 4567 o Ext. 402"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Área / Facultad solicitante (Desplegable agrupado) */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                    Área o Facultad Solicitante <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      required
                      value={`${tipoOrigen}|${origenId}|${origenNombre}`}
                      onChange={handleSelectOrigen}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                    >
                      <option value="" disabled>-- Selecciona la dependencia o facultad --</option>
                      
                      {/* Grupo de Facultades */}
                      {facultades.length > 0 && (
                        <optgroup label="🏢 FACULTADES">
                          {facultades.map(f => (
                            <option key={`fac-${f.id}`} value={`Facultad|${f.id}|${f.nombre}`}>
                              {f.nombre}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {/* Grupo de Departamentos y Áreas */}
                      {areas.length > 0 && (
                        <optgroup label="📂 DEPARTAMENTOS Y ÁREAS INSTITUCIONALES">
                          {areas.map(a => (
                            <option key={`area-${a.id}`} value={`Departamento/Área|${a.id}|${a.nombre}`}>
                              {a.nombre} (Nivel {a.nivel})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DETALLES DEL REQUERIMIENTO */}
              <div className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 space-y-3">
                <h4 className="text-xs font-extrabold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary-600" />
                  2. Especificaciones de la Tarea
                </h4>

                {/* Título de la tarea */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                    Título de la Tarea / Requerimiento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Grabación de videoclase Módulo 2 - Anatomía Humana"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                  />
                </div>

                {/* Descripción detallada */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-charcoal-700">
                      Descripción del Requerimiento <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-charcoal-400 font-medium">
                      {descripcion.length} caracteres
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe los entregables esperados, formato deseado, software o detalles técnicos necesarios para el CCV..."
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-medium text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs resize-none"
                  />
                </div>

                {/* Fechas y Horas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                      Fecha Estimada de Entrega <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        required
                        min={hoyStr}
                        value={fechaEstimada}
                        onChange={(e) => setFechaEstimada(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                      Hora Requerida <span className="text-charcoal-400 font-normal">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="time"
                        value={horaEstimada}
                        onChange={(e) => setHoraEstimada(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Enlace a recursos externos */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                    Enlace a Material de Apoyo / Guión / Drive <span className="text-charcoal-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="url"
                      value={enlaceRecurso}
                      onChange={(e) => setEnlaceRecurso(e.target.value)}
                      placeholder="https://drive.google.com/... o OneDrive, Figma, etc."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Nivel de Prioridad */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1.5">
                    Nivel de Urgencia
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Baja', 'Normal', 'Alta', 'Urgente'] as PrioridadSolicitud[]).map((p) => {
                      const isSelected = prioridad === p;
                      const getStyle = () => {
                        if (!isSelected) return 'bg-white border-stone-200 text-charcoal-600 hover:bg-stone-50';
                        switch (p) {
                          case 'Baja': return 'bg-teal-50 border-teal-400 text-teal-800 font-extrabold ring-1 ring-teal-400';
                          case 'Normal': return 'bg-primary-50 border-primary-400 text-primary-800 font-extrabold ring-1 ring-primary-400';
                          case 'Alta': return 'bg-amber-50 border-amber-400 text-amber-800 font-extrabold ring-1 ring-amber-400';
                          case 'Urgente': return 'bg-rose-50 border-rose-400 text-rose-800 font-extrabold ring-1 ring-rose-400';
                        }
                      };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPrioridad(p)}
                          className={`py-1.5 px-2 rounded-xl border text-center text-xs transition-all shadow-2xs ${getStyle()}`}
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
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-charcoal-700 font-bold text-xs hover:bg-stone-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Radicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-accent-400" />
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
