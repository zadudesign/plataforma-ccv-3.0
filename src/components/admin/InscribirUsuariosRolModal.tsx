'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserPlus, 
  UserMinus, 
  Users, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Building2,
  Plus,
  Key,
  Briefcase
} from 'lucide-react';
import { Area, Rol, Usuario } from '@/types';
import { useModalDismiss } from '@/hooks/useModalDismiss';

interface InscribirUsuariosRolModalProps {
  area: Area;
  rolesArea: Rol[];
  rolSeleccionadoInicial?: Rol;
  usuarios: Usuario[];
  rolesPermisosMap: Record<string, string[]>;
  onClose: () => void;
  onAsignarUsuarioRol: (usuarioId: string, rolId: string, areaNombre?: string) => Promise<boolean | void>;
  onDesvincularUsuarioRol?: (usuarioId: string) => Promise<boolean | void>;
  onOpenCreateRole?: (areaId: string) => void;
}

export const InscribirUsuariosRolModal: React.FC<InscribirUsuariosRolModalProps> = ({
  area,
  rolesArea,
  rolSeleccionadoInicial,
  usuarios,
  rolesPermisosMap,
  onClose,
  onAsignarUsuarioRol,
  onDesvincularUsuarioRol,
  onOpenCreateRole,
}) => {
  const [rolActivoId, setRolActivoId] = useState<string>(
    rolSeleccionadoInicial?.id || rolesArea[0]?.id || ''
  );
  const [busquedaCandidato, setBusquedaCandidato] = useState('');
  const [candidatoSeleccionadoId, setCandidatoSeleccionadoId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMensaje, setFeedbackMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  useModalDismiss({
    isOpen: true,
    onClose,
    disabled: isProcessing
  });

  const rolActivo = useMemo(() => {
    return rolesArea.find(r => r.id === rolActivoId) || rolesArea[0];
  }, [rolesArea, rolActivoId]);

  // Usuarios actualmente inscritos en el rol seleccionado dentro de esta área
  const usuariosInscritos = useMemo(() => {
    if (!rolActivo) return [];
    return usuarios.filter(u => {
      // Coincidencia por ID de rol o por nombre de rol si el área coincide
      if (u.rol_id === rolActivo.id) return true;
      if (u.rol_nombre === rolActivo.nombre && (u.area_nombre === area.nombre || !u.area_nombre)) return true;
      return false;
    });
  }, [usuarios, rolActivo, area.nombre]);

  // Candidatos disponibles para inscribir (usuarios no inscritos aún en este rol)
  const candidatosDisponibles = useMemo(() => {
    const idsInscritos = new Set(usuariosInscritos.map(u => u.id));
    return usuarios.filter(u => {
      if (idsInscritos.has(u.id)) return false;
      if (!busquedaCandidato.trim()) return true;
      const term = busquedaCandidato.toLowerCase();
      return (
        u.nombre_completo.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.rol_nombre && u.rol_nombre.toLowerCase().includes(term)) ||
        (u.area_nombre && u.area_nombre.toLowerCase().includes(term))
      );
    });
  }, [usuarios, usuariosInscritos, busquedaCandidato]);

  // Permisos asociados al rol activo
  const permisosRolActivo = useMemo(() => {
    if (!rolActivo) return [];
    return rolesPermisosMap[rolActivo.id] || rolesPermisosMap[rolActivo.nombre] || [];
  }, [rolActivo, rolesPermisosMap]);

  const handleInscribir = async () => {
    if (!candidatoSeleccionadoId || !rolActivo) return;
    setIsProcessing(true);
    setFeedbackMensaje(null);

    const candidato = usuarios.find(u => u.id === candidatoSeleccionadoId);
    try {
      await onAsignarUsuarioRol(candidatoSeleccionadoId, rolActivo.id, area.nombre);
      setFeedbackMensaje({
        tipo: 'success',
        texto: `¡${candidato?.nombre_completo || 'Usuario'} fue inscrito exitosamente en el rol "${rolActivo.nombre}"!`
      });
      setCandidatoSeleccionadoId('');
      setBusquedaCandidato('');
      setTimeout(() => setFeedbackMensaje(null), 3500);
    } catch (err: any) {
      setFeedbackMensaje({
        tipo: 'error',
        texto: err?.message || 'Error al inscribir al usuario en el rol.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDesvincular = async (usuario: Usuario) => {
    if (!confirm(`¿Deseas desvincular a ${usuario.nombre_completo} del rol ${rolActivo?.nombre}?`)) {
      return;
    }
    setIsProcessing(true);
    setFeedbackMensaje(null);

    try {
      if (onDesvincularUsuarioRol) {
        await onDesvincularUsuarioRol(usuario.id);
      } else {
        // Asignar rol por defecto o nulo
        await onAsignarUsuarioRol(usuario.id, '', '');
      }
      setFeedbackMensaje({
        tipo: 'success',
        texto: `${usuario.nombre_completo} ha sido desvinculado del rol.`
      });
      setTimeout(() => setFeedbackMensaje(null), 3500);
    } catch (err: any) {
      setFeedbackMensaje({
        tipo: 'error',
        texto: err?.message || 'Error al desvincular al usuario.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={isProcessing ? undefined : onClose} />
      <div className="relative z-10 bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-700 flex items-center justify-center font-extrabold shadow-sm shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-charcoal-900">
                  Inscribir Usuarios en Roles Adscritos
                </h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 uppercase tracking-wide">
                  Nivel {area.nivel}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <Building2 className="w-3.5 h-3.5 text-sage-600" />
                Unidad: <span className="font-bold text-charcoal-800">{area.nombre}</span>
                {area.area_padre_nombre && (
                  <span className="text-charcoal-400"> (Subárea de {area.area_padre_nombre})</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificaciones de Feedback */}
        {feedbackMensaje && (
          <div className={`mx-6 mt-3 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn ${
            feedbackMensaje.tipo === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {feedbackMensaje.tipo === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedbackMensaje.texto}</span>
          </div>
        )}

        {/* Selector de Roles Adscritos (Pills / Tabs) */}
        <div className="px-6 pt-3 pb-2 border-b border-stone-100 bg-cream-50/50 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-charcoal-500">
              Seleccionar Rol Adscrito a Administrar:
            </span>
            {onOpenCreateRole && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateRole(area.id);
                }}
                className="text-[11px] font-bold text-sage-700 hover:text-sage-900 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Crear Nuevo Rol
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {rolesArea.length > 0 ? (
              rolesArea.map((r) => {
                const isSelected = r.id === rolActivo?.id;
                const count = usuarios.filter(u => u.rol_id === r.id || (u.rol_nombre === r.nombre && u.area_nombre === area.nombre)).length;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRolActivoId(r.id);
                      setCandidatoSeleccionadoId('');
                      setFeedbackMensaje(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-sage-600 text-white border-sage-600 shadow-xs ring-1 ring-sage-500'
                        : 'bg-white hover:bg-stone-50 text-charcoal-700 border-stone-200'
                    }`}
                  >
                    <span>{r.nombre}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-stone-100 text-charcoal-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-charcoal-500 italic py-1">
                Esta área aún no tiene roles adscritos específicos. Puedes crear uno con el botón "+ Crear Nuevo Rol".
              </div>
            )}
          </div>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {rolActivo ? (
            <>
              {/* Sección 1: Usuarios Actualmente Inscritos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-charcoal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sage-600" />
                    Usuarios Inscritos en "{rolActivo.nombre}" ({usuariosInscritos.length})
                  </h4>
                  <span className="text-[11px] text-charcoal-400">
                    Tienen acceso a las tareas dirigidas a este rol
                  </span>
                </div>

                {usuariosInscritos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {usuariosInscritos.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 bg-cream-50/80 rounded-2xl border border-stone-200/90 flex items-center justify-between gap-3 hover:shadow-2xs transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.nombre_completo}
                              className="w-9 h-9 rounded-full object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-sage-700 text-white font-black text-xs flex items-center justify-center border border-sage-300 shrink-0">
                              {u.nombre_completo.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-charcoal-900 truncate">
                              {u.nombre_completo}
                            </p>
                            <p className="text-[11px] text-charcoal-500 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDesvincular(u)}
                          disabled={isProcessing}
                          className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                          title="Desvincular usuario de este rol"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-cream-50/60 rounded-2xl border border-dashed border-stone-300 text-center space-y-1">
                    <Users className="w-6 h-6 text-charcoal-400 mx-auto" />
                    <p className="text-xs font-bold text-charcoal-700">
                      No hay usuarios inscritos en este rol para {area.nombre}
                    </p>
                    <p className="text-[11px] text-charcoal-500">
                      Selecciona un usuario en la sección de abajo para inscribirlo y otorgarle acceso operativo a las tareas.
                    </p>
                  </div>
                )}
              </div>

              {/* Sección 2: Inscribir Nuevo Usuario */}
              <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-charcoal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-sage-600" />
                    Inscribir Nuevo Usuario en "{rolActivo.nombre}"
                  </h4>
                  <span className="text-[11px] text-charcoal-500">
                    {candidatosDisponibles.length} candidatos disponibles
                  </span>
                </div>

                {/* Buscador de Candidatos */}
                <div className="relative">
                  <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={busquedaCandidato}
                    onChange={(e) => setBusquedaCandidato(e.target.value)}
                    placeholder="Buscar candidato por nombre, correo, rol actual o área..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-2xs"
                  />
                </div>

                {/* Lista de selección de candidatos */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {candidatosDisponibles.slice(0, 15).map((cand) => {
                    const isSelected = cand.id === candidatoSeleccionadoId;
                    return (
                      <div
                        key={cand.id}
                        onClick={() => setCandidatoSeleccionadoId(cand.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-sage-50 border-sage-500 shadow-2xs ring-1 ring-sage-400'
                            : 'bg-white hover:bg-cream-50 border-stone-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {cand.avatar_url ? (
                            <img
                              src={cand.avatar_url}
                              alt={cand.nombre_completo}
                              className="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-stone-300 text-charcoal-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {cand.nombre_completo.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-charcoal-900 block truncate">
                              {cand.nombre_completo}
                            </span>
                            <span className="text-[10px] text-charcoal-500 truncate block">
                              {cand.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-charcoal-700 font-bold border border-stone-200">
                            {cand.rol_nombre || 'Sin Rol'} • {cand.area_nombre || 'General'}
                          </span>
                          <input
                            type="radio"
                            name="candidatoSeleccionado"
                            checked={isSelected}
                            onChange={() => setCandidatoSeleccionadoId(cand.id)}
                            className="w-3.5 h-3.5 text-sage-600 focus:ring-sage-500 border-stone-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {candidatosDisponibles.length === 0 && (
                    <p className="text-center text-xs text-charcoal-400 py-3 italic">
                      No se encontraron usuarios disponibles con ese criterio.
                    </p>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleInscribir}
                    disabled={!candidatoSeleccionadoId || isProcessing}
                    className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isProcessing ? 'Inscribiendo...' : `Inscribir en "${rolActivo.nombre}"`}
                  </button>
                </div>
              </div>

              {/* Sección 3: Resumen de Permisos del Rol */}
              <div className="p-3 bg-cream-50/50 rounded-2xl border border-stone-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-charcoal-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-sage-600" />
                    Permisos y Atribuciones del Rol "{rolActivo.nombre}" ({permisosRolActivo.length}):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {permisosRolActivo.length > 0 ? (
                    permisosRolActivo.map((perm) => (
                      <span
                        key={perm}
                        className="text-[10px] font-mono font-bold bg-white text-charcoal-800 px-2 py-0.5 rounded-lg border border-stone-200"
                      >
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-charcoal-400 italic">
                      Sin permisos específicos asignados en la matriz
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-charcoal-500 leading-snug">
                  📌 Al inscribirse en este rol, el usuario tendrá acceso inmediato a las tareas dirigidas a{' '}
                  <strong>{rolActivo.nombre}</strong> dentro de <strong>{area.nombre}</strong> y sus proyectos asociados.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-charcoal-400">
              No hay roles adscritos disponibles en esta unidad.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-cream-50/40 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-charcoal-500 font-medium">
            Los cambios se guardan y sincronizan automáticamente en Supabase.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-800 text-xs font-bold rounded-full transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
