'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  UserCheck,
  Search,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PrioridadSolicitud } from '@/types';
import { INITIAL_USUARIOS } from '@/lib/mockData';

interface TaskRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskRequestModal: React.FC<TaskRequestModalProps> = ({ isOpen, onClose }) => {
  const { usuarios, roles, areas, facultades, usuarioActual, enviarSolicitudTarea } = useAuth();

  // Lista de usuarios registrados (con fallback robusto)
  const listaUsuarios = usuarios && usuarios.length > 0 ? usuarios : INITIAL_USUARIOS;

  // Lista siempre ordenada alfabéticamente por nombre completo (A-Z)
  const sortedUsuarios = useMemo(() => {
    return [...listaUsuarios].sort((a, b) =>
      (a.nombre_completo || '').localeCompare(b.nombre_completo || '', 'es', { sensitivity: 'base' })
    );
  }, [listaUsuarios]);

  // Estados del Formulario
  const [selectedUserId, setSelectedUserId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEstimada, setFechaEstimada] = useState('');
  const [horaEstimada, setHoraEstimada] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadSolicitud>('Normal');

  // Estados del Combobox buscador de usuarios
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados de control y feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [radicadoExitoso, setRadicadoExitoso] = useState<string | null>(null);

  // Fecha mínima: Hoy
  const hoyStr = new Date().toISOString().split('T')[0];

  // Usuario seleccionado actual
  const selectedUser = sortedUsuarios.find(u => u.id === selectedUserId) || (sortedUsuarios.length > 0 ? sortedUsuarios[0] : null);

  // Filtrado dinámico en tiempo real para el autocompletado
  const filteredUsuarios = useMemo(() => {
    if (!searchQuery.trim()) return sortedUsuarios;
    const q = searchQuery.toLowerCase().trim();
    return sortedUsuarios.filter(u => 
      (u.nombre_completo && u.nombre_completo.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.rol_nombre && u.rol_nombre.toLowerCase().includes(q)) ||
      (u.area_nombre && u.area_nombre.toLowerCase().includes(q))
    );
  }, [sortedUsuarios, searchQuery]);

  // Resolver Rol y Área / Jerarquía del usuario seleccionado
  const selectedRol = roles.find(r => r.id === selectedUser?.rol_id);
  const selectedRolNombre = selectedUser?.rol_nombre || selectedRol?.nombre || 'Docente / Usuario';

  const selectedArea = areas.find(a => 
    a.nombre.toLowerCase() === (selectedUser?.area_nombre || '').toLowerCase() || 
    (selectedRol?.area_id && a.id === selectedRol.area_id)
  );
  const selectedAreaNombre = selectedArea?.nombre || selectedUser?.area_nombre || 'Centro de Educación Virtual';
  
  // Jerarquía descriptiva
  const getNivelJerarquia = () => {
    if (!selectedArea) return 'Área Institucional';
    switch (selectedArea.nivel) {
      case 6: return 'Nivel 6 • Dirección / Admin';
      case 5: return 'Nivel 5 • Unidad CCV';
      case 4: return 'Nivel 4 • Departamento';
      case 3: return 'Nivel 3 • Facultad';
      case 2: return 'Nivel 2 • Programa';
      case 1: return 'Nivel 1 • Curso';
      default: return `Nivel ${selectedArea.nivel} • Institucional`;
    }
  };
  const selectedJerarquiaTexto = getNivelJerarquia();

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

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        if (selectedUser) {
          setSearchQuery(selectedUser.nombre_completo);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedUser]);

  // Sincronizar texto de búsqueda con el usuario seleccionado al abrir o cambiar
  useEffect(() => {
    if (selectedUser && !isDropdownOpen) {
      setSearchQuery(selectedUser.nombre_completo);
    }
  }, [selectedUser, isDropdownOpen]);

  // Al abrir el modal, preseleccionar usuario y fecha estimada por defecto
  useEffect(() => {
    if (isOpen) {
      if (!selectedUserId) {
        if (usuarioActual?.id) {
          setSelectedUserId(usuarioActual.id);
        } else if (sortedUsuarios.length > 0) {
          setSelectedUserId(sortedUsuarios[0].id);
        }
      }
      if (!fechaEstimada) {
        // Sugerir fecha por defecto: dentro de 5 días hábiles
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 5);
        setFechaEstimada(defaultDate.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, usuarioActual, sortedUsuarios, selectedUserId, fechaEstimada]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setHoraEstimada('');
    setPrioridad('Normal');
    setErrorMsg(null);
    setRadicadoExitoso(null);
    setIsDropdownOpen(false);
    if (sortedUsuarios.length > 0) {
      const defaultUser = (usuarioActual && sortedUsuarios.find(u => u.id === usuarioActual.id)) || sortedUsuarios[0];
      setSelectedUserId(defaultUser.id);
      setSearchQuery(defaultUser.nombre_completo);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validaciones
    if (!selectedUser) {
      setErrorMsg('Por favor selecciona un usuario registrado en la plataforma.');
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
      const tipoOrigen: 'Facultad' | 'Departamento/Área' = selectedArea?.nivel === 3 ? 'Facultad' : 'Departamento/Área';
      const origenId = selectedArea?.id || null;

      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo_origen: tipoOrigen,
        origen_id: origenId,
        origen_nombre: selectedAreaNombre,
        fecha_estimada_entrega: fechaEstimada,
        hora_estimada: horaEstimada.trim() || null,
        solicitante_nombre: selectedUser.nombre_completo.trim(),
        solicitante_contacto: selectedUser.telefono || selectedUser.email || 'Plataforma CCV',
        enlace_recurso: null,
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
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
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
              <div className="p-4 bg-cream-50/80 rounded-2xl border border-stone-200 text-left max-w-md mx-auto space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                  <span className="font-bold text-charcoal-500">Número de Radicado:</span>
                  <span className="font-mono font-black text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-200">
                    {radicadoExitoso}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-500">Solicitante:</span>
                  <span className="font-bold text-charcoal-800">{selectedUser?.nombre_completo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-500">Rol Asignado:</span>
                  <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                    {selectedRolNombre}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-500">Área / Jerarquía:</span>
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {selectedAreaNombre} ({selectedJerarquiaTexto})
                  </span>
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
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-charcoal-700 font-bold text-xs hover:bg-stone-50 transition-all cursor-pointer"
                >
                  Radicar otra solicitud
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  Busca o selecciona tu usuario registrado en la plataforma. Los administradores del CCV evaluarán tu requerimiento institucional.
                </span>
              </div>

              {/* SECCIÓN 1: DATOS DEL SOLICITANTE (SELECTOR CON BÚSQUEDA Y ORDEN ALFABÉTICO) */}
              <div className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-600" />
                    1. Datos del Solicitante
                  </h4>
                  <span className="text-[10px] font-semibold text-charcoal-500">
                    Orden alfabético (A-Z)
                  </span>
                </div>

                {/* Combobox Buscador Interactivo */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                    Usuario Solicitante Registrado <span className="text-rose-500">*</span>
                  </label>

                  <div className="relative">
                    <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!isDropdownOpen) setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Escribe para buscar por nombre, correo, área o rol..."
                      className="w-full pl-9 pr-16 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 placeholder:text-charcoal-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs transition-all"
                    />

                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setIsDropdownOpen(true);
                          }}
                          className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Limpiar búsqueda"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Desplegar lista"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-primary-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Menú Desplegable Flotante */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-stone-100 animate-in fade-in-50 zoom-in-95 duration-150">
                      <div className="p-2 bg-stone-50/90 sticky top-0 z-10 border-b border-stone-200 flex items-center justify-between text-[10px] text-charcoal-500 font-bold uppercase tracking-wider backdrop-blur-xs">
                        <span>Usuarios ({filteredUsuarios.length} de {sortedUsuarios.length})</span>
                        <span className="text-primary-700 font-extrabold">A-Z</span>
                      </div>
                      
                      {filteredUsuarios.length === 0 ? (
                        <div className="p-4 text-center text-xs text-charcoal-500 space-y-1">
                          <p className="font-bold text-charcoal-700">No se encontraron usuarios</p>
                          <p className="text-[11px] text-charcoal-400">Intenta con otro término o limpia la búsqueda.</p>
                        </div>
                      ) : (
                        filteredUsuarios.map((u) => {
                          const isSelected = u.id === selectedUserId;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setSearchQuery(u.nombre_completo);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full p-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'bg-primary-50/90 text-primary-950 font-bold' 
                                  : 'hover:bg-stone-50 text-charcoal-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-primary-700 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt={u.nombre_completo} className="w-full h-full object-cover" />
                                  ) : (
                                    u.nombre_completo.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-black truncate">{u.nombre_completo}</div>
                                  <div className="text-[10px] text-charcoal-500 truncate flex items-center gap-1.5">
                                    <span className="font-semibold text-primary-700">{u.rol_nombre || 'Usuario'}</span>
                                    <span>•</span>
                                    <span className="text-charcoal-500">{u.area_nombre || 'CCV'}</span>
                                    <span>•</span>
                                    <span className="text-charcoal-400">{u.email}</span>
                                  </div>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Tarjeta Visual Dinámica: Rol Asignado + Área / Jerarquía */}
                {selectedUser && (
                  <div className="p-3.5 bg-gradient-to-br from-primary-50/70 via-white to-amber-50/50 rounded-xl border border-primary-100/90 shadow-2xs animate-in fade-in duration-200 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Avatar / Iniciales e Identificación */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm border border-primary-600 overflow-hidden">
                          {selectedUser.avatar_url ? (
                            <img 
                              src={selectedUser.avatar_url} 
                              alt={selectedUser.nombre_completo} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            selectedUser.nombre_completo.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-charcoal-900 leading-tight">
                            {selectedUser.nombre_completo}
                          </div>
                          <div className="text-[11px] text-charcoal-500 font-medium">
                            {selectedUser.email}
                          </div>
                        </div>
                      </div>

                      {/* Badges de Rol y Área / Jerarquía */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Rol Asignado */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-100/90 border border-primary-200 text-primary-900 text-[11px] font-extrabold shadow-2xs">
                          <Shield className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                          <span>Rol: {selectedRolNombre}</span>
                        </div>

                        {/* Área / Jerarquía */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/80 border border-amber-200 text-amber-900 text-[11px] font-extrabold shadow-2xs">
                          <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Área: {selectedAreaNombre}</span>
                          <span className="text-[10px] text-amber-800/80 font-bold">
                            ({selectedJerarquiaTexto})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-charcoal-700 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
