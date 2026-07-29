'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Key, CheckCircle2 } from 'lucide-react';
import { Rol, PermisoDef } from '@/types';

interface RolePermissionsModalProps {
  rol: Rol;
  permisosDef: PermisoDef[];
  permisosActuales: string[];
  onClose: () => void;
  onSave: (rolId: string, nuevosPermisos: string[]) => void;
}

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  rol,
  permisosDef,
  permisosActuales,
  onClose,
  onSave,
}) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(permisosActuales);

  const togglePermiso = (clave: string) => {
    if (permisosSeleccionados.includes(clave)) {
      setPermisosSeleccionados(prev => prev.filter(p => p !== clave));
    } else {
      setPermisosSeleccionados(prev => [...prev, clave]);
    }
  };

  const handleSave = () => {
    onSave(rol.id, permisosSeleccionados);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
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

        <div className="space-y-2.5 my-5 max-h-80 overflow-y-auto pr-1">
          {permisosDef.map((perm) => {
            const isChecked = permisosSeleccionados.includes(perm.clave);
            return (
              <div
                key={perm.id}
                onClick={() => togglePermiso(perm.clave)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isChecked
                    ? 'bg-sage-50 border-sage-400 shadow-sm'
                    : 'bg-cream-50 hover:bg-cream-100 border-stone-200/80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // handled by parent div click
                  className="mt-0.5 w-4 h-4 text-sage-600 rounded focus:ring-sage-500 border-stone-300"
                />
                <div>
                  <h4 className="text-xs font-mono font-bold text-charcoal-900">{perm.clave}</h4>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">{perm.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-charcoal-500 font-medium">
            {permisosSeleccionados.length} de {permisosDef.length} permisos asignados
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-bold rounded-full transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Guardar Permisos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
