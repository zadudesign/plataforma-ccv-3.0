'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  ShieldCheck, 
  FolderKanban, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { Area, Rol, Usuario, ProyectoEspecial } from '@/types';
import { getUsuariosCandidatosParaArea } from '@/lib/roleVisibilityUtils';
import { useModalDismiss } from '@/hooks/useModalDismiss';
import { useToast } from '@/context/ToastContext';

interface AsignarLiderLoteModalProps {
  area: Area;
  allAreas: Area[];
  roles: Rol[];
  usuarios: Usuario[];
  proyectos: ProyectoEspecial[];
  onClose: () => void;
  onConfirmAsignacionEnLote: (areaId: string, usuarioId: string, tipo: 'lider' | 'co_lider') => Promise<number>;
}

export const AsignarLiderLoteModal: React.FC<AsignarLiderLoteModalProps> = ({
  area,
  allAreas,
  roles,
  usuarios,
  proyectos,
  onClose,
  onConfirmAsignacionEnLote,
}) => {
  const toast = useToast();
  const [tipoLiderazgo, setTipoLiderazgo] = useState<'lider' | 'co_lider'>('lider');
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeResultado, setMensajeResultado] = useState<{ exito: boolean; texto: string } | null>(null);

  useModalDismiss({
    isOpen: true,
    onClose,
    disabled: isSubmitting
  });

  // Proyectos adscritos al área
  const proyectosDeEstaArea = useMemo(() => {
    return proyectos.filter(
      p => p.area_id === area.id || p.area_id === area.nombre || (p.area_id && p.area_id.toLowerCase() === area.nombre.toLowerCase())
    );
  }, [proyectos, area]);

  // Colaboradores estrictamente adscritos al área (respetando organigrama RLS)
  const candidatosDisponibles = useMemo(() => {
    return getUsuariosCandidatosParaArea(area.id, allAreas, roles, usuarios);
  }, [area.id, allAreas, roles, usuarios]);

  const usuarioSeleccionado = useMemo(() => {
    return usuarios.find(u => u.id === usuarioSeleccionadoId);
  }, [usuarios, usuarioSeleccionadoId]);

  const handleEjecutarAsignacion = async () => {
    if (!usuarioSeleccionadoId) return;
    setIsSubmitting(true);
    setMensajeResultado(null);
    try {
      const cantidad = await onConfirmAsignacionEnLote(area.id, usuarioSeleccionadoId, tipoLiderazgo);
      const textoExito = `Se asignó exitosamente a ${usuarioSeleccionado?.nombre_completo} como ${tipoLiderazgo === 'lider' ? 'Líder Principal' : 'Co-Líder'} en ${cantidad} ${cantidad === 1 ? 'proyecto' : 'proyectos'}.`;
      setMensajeResultado({
        exito: true,
        texto: textoExito
      });
      toast.success(textoExito);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error en asignación en lote:', err);
      const textoError = 'Ocurrió un error al procesar la asignación en lote. Intenta de nuevo.';
      setMensajeResultado({
        exito: false,
        texto: textoError
      });
      toast.error(textoError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shadow-2xs">
              <Users className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-charcoal-900">
                  Asignación de Liderazgo en Lote
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Nivel {area.nivel}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-medium">
                {area.nombre} — {proyectosDeEstaArea.length} {proyectosDeEstaArea.length === 1 ? 'proyecto adscrito' : 'proyectos adscritos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Alerta de Aislamiento de Área */}
          <div className="p-3 bg-sage-50/80 rounded-2xl border border-sage-200/80 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-charcoal-700 leading-relaxed">
              <strong className="text-sage-900 block font-bold">Aislamiento y Reglas de Pertenencia Institucional</strong>
              Solo se muestran colaboradores <strong>adscritos a esta área o departamento</strong> para garantizar coherencia con los permisos y roles RBAC asignados.
            </div>
          </div>

          {/* Tipo de Liderazgo */}
          <div>
            <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Tipo de Asignación en los Proyectos:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoLiderazgo('lider')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  tipoLiderazgo === 'lider'
                    ? 'border-purple-500 bg-purple-50/70 text-purple-950 ring-2 ring-purple-400/30'
                    : 'border-stone-200 bg-white text-charcoal-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Líder Principal</span>
                </div>
                <p className="text-[10px] text-charcoal-500 mt-1 leading-tight">
                  Reemplaza el líder principal en todos los proyectos de este área.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTipoLiderazgo('co_lider')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  tipoLiderazgo === 'co_lider'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 ring-2 ring-blue-400/30'
                    : 'border-stone-200 bg-white text-charcoal-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  <Users className="w-3.5 h-3.5 text-blue-700" />
                  <span>Co-Líder</span>
                </div>
                <p className="text-[10px] text-charcoal-500 mt-1 leading-tight">
                  Se añade al equipo de co-liderazgo sin sobreescribir el líder principal.
                </p>
              </button>
            </div>
          </div>

          {/* Selector de Colaborador */}
          <div>
            <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Colaborador Adscrito a Asignar ({candidatosDisponibles.length} disponibles):
            </label>
            {candidatosDisponibles.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-[11px]">
                No hay usuarios adscritos a esta área actualmente. Puedes inscribir colaboradores desde la pestaña <strong>Áreas Jerárquicas</strong>.
              </div>
            ) : (
              <select
                value={usuarioSeleccionadoId}
                onChange={e => setUsuarioSeleccionadoId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-2xs"
              >
                <option value="">-- Seleccionar Colaborador Adscrito --</option>
                {candidatosDisponibles.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo} — {u.rol_nombre || 'Usuario'} ({u.area_nombre || area.nombre})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Resumen de Proyectos Afectados */}
          <div>
            <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Proyectos a Modificar ({proyectosDeEstaArea.length}):
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-cream-50/60 rounded-2xl border border-stone-200">
              {proyectosDeEstaArea.map(pry => (
                <div key={pry.id} className="p-2 bg-white rounded-xl border border-stone-200/80 flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-charcoal-900 truncate max-w-[280px]">
                    {pry.nombre}
                  </span>
                  <span className="text-[10px] text-charcoal-500 shrink-0 font-medium">
                    Actual: <strong className="text-sage-800">{pry.lider_nombre || 'Sin líder'}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {mensajeResultado && (
            <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
              mensajeResultado.exito 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {mensajeResultado.exito ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{mensajeResultado.texto}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-end gap-2 bg-cream-50/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white hover:bg-stone-100 text-charcoal-700 text-xs font-bold rounded-full border border-stone-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleEjecutarAsignacion}
            disabled={!usuarioSeleccionadoId || isSubmitting || proyectosDeEstaArea.length === 0}
            className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:bg-stone-300 text-white text-xs font-extrabold rounded-full shadow-sm transition-all flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>Asignar a los {proyectosDeEstaArea.length} Proyectos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
