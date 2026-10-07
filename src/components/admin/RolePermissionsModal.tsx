'use client';

import React, { useState } from 'react';
import { X, Key, CheckCircle2, Loader2, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { Rol, PermisoDef } from '@/types';
import { useModalDismiss } from '@/hooks/useModalDismiss';

interface RolePermissionsModalProps {
  rol: Rol;
  permisosDef: PermisoDef[];
  permisosActuales: string[];
  onClose: () => void;
  onSave: (rolId: string, nuevosPermisos: string[]) => Promise<{ success: boolean; error?: string; remote?: boolean }> | void;
}

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  rol,
  permisosDef,
  permisosActuales,
  onClose,
  onSave,
}) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(permisosActuales);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useModalDismiss({
    isOpen: true,
    onClose,
    disabled: isSaving
  });

  const togglePermiso = (clave: string) => {
    if (isSaving) return;
    if (permisosSeleccionados.includes(clave)) {
      setPermisosSeleccionados(prev => prev.filter(p => p !== clave));
    } else {
      setPermisosSeleccionados(prev => [...prev, clave]);
    }
  };

  const handleSeleccionarTodos = () => {
    if (isSaving) return;
    setPermisosSeleccionados(permisosDef.map(p => p.clave));
  };

  const handleDeseleccionarTodos = () => {
    if (isSaving) return;
    setPermisosSeleccionados([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(null);

    try {
      const res = await onSave(rol.id, permisosSeleccionados);
      if (res && res.success === false) {
        setErrorMsg(res.error || 'No fue posible guardar los permisos en la base de datos.');
        setIsSaving(false);
        return;
      }

      const mensajeExito = res?.remote 
        ? '¡Permisos guardados y sincronizados en Supabase!' 
        : '¡Permisos guardados y activados en la sesión!';
      
      setSaveSuccess(mensajeExito);
      setTimeout(() => {
        onClose();
      }, 750);
    } catch (err: any) {
      console.error('Error al guardar permisos del rol:', err);
      setErrorMsg(err?.message || 'Error inesperado al intentar guardar los permisos.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={isSaving ? undefined : onClose} />
      <div className="relative z-10 bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg p-6">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center shadow-sm">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900">
              Permisos para el Rol: <span className="text-sage-700">{rol.nombre}</span>
            </h3>
            <p className="text-xs text-charcoal-500">
              Área adscrita: <span className="font-bold text-charcoal-800">{rol.area_nombre}</span>
            </p>
          </div>
        </div>

        {/* Acciones rápidas de selección */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100 text-xs">
          <span className="text-charcoal-500 font-medium text-[11px]">
            {permisosSeleccionados.length} de {permisosDef.length} permisos activos
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSeleccionarTodos}
              disabled={isSaving}
              className="text-[11px] font-bold text-sage-700 hover:text-sage-900 hover:underline flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Marcar todos
            </button>
            <span className="text-stone-300">•</span>
            <button
              type="button"
              onClick={handleDeseleccionarTodos}
              disabled={isSaving}
              className="text-[11px] font-bold text-charcoal-500 hover:text-charcoal-800 hover:underline flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> Desmarcar todos
            </button>
          </div>
        </div>

        {/* Banner de error si existe */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-coral-50 border border-coral-200 rounded-2xl flex items-center gap-2 text-xs text-coral-800 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-coral-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Banner de éxito */}
        {saveSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Lista de permisos */}
        <div className="space-y-2.5 my-4 max-h-80 overflow-y-auto pr-1">
          {permisosDef.map((perm) => {
            const isChecked = permisosSeleccionados.includes(perm.clave);
            return (
              <div
                key={perm.id}
                onClick={() => togglePermiso(perm.clave)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-sage-50 border-sage-400 shadow-sm'
                    : 'bg-cream-50 hover:bg-cream-100 border-stone-200/80 opacity-75'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // controlado por onClick del contenedor
                  disabled={isSaving}
                  className="mt-0.5 w-4 h-4 text-sage-600 rounded focus:ring-sage-500 border-stone-300 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-charcoal-900">{perm.clave}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isChecked ? 'bg-sage-200 text-sage-900' : 'bg-stone-200 text-charcoal-600'
                    }`}>
                      {isChecked ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 leading-snug">{perm.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] text-charcoal-400">
            Los cambios afectan inmediatamente la autorización en la plataforma.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-bold rounded-full transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando en Supabase...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Guardar Permisos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
