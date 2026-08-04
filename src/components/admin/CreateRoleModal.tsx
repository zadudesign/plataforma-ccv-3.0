'use client';

import React, { useState } from 'react';
import { X, ShieldPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Area, PermisoDef } from '@/types';

interface CreateRoleModalProps {
  areas: Area[];
  permisosDef: PermisoDef[];
  onClose: () => void;
  onCrearRol: (nombre: string, areaId: string, permisos: string[]) => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  areas,
  permisosDef,
  onClose,
  onCrearRol,
}) => {
  const [nombre, setNombre] = useState('');
  const [areaId, setAreaId] = useState(areas[0]?.id || '');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([
    'registro:ver',
    'registro:crear',
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const togglePermiso = (clave: string) => {
    if (permisosSeleccionados.includes(clave)) {
      setPermisosSeleccionados(prev => prev.filter(p => p !== clave));
    } else {
      setPermisosSeleccionados(prev => [...prev, clave]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre del rol es obligatorio.');
      return;
    }
    if (!areaId) {
      setErrorMsg('Debes asociar el rol a un área jerárquica.');
      return;
    }

    onCrearRol(nombre, areaId, permisosSeleccionados);
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
            <ShieldPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900">
              Crear Nuevo Rol Organizacional
            </h3>
            <p className="text-xs text-charcoal-500">
              Define el nombre, área jerárquica y matriz inicial de permisos.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Nombre del Rol <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Coordinador de Calidad, Diseñador Instruccional Senior..."
              className="w-full px-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Área Jerárquica Adscrita <span className="text-rose-500">*</span>
            </label>
            <select
              value={areaId}
              onChange={e => setAreaId(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              {areas.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nombre} (Nivel {a.nivel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-2">
              Asignación Inicial de Permisos CRUD
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {permisosDef.map(perm => {
                const isChecked = permisosSeleccionados.includes(perm.clave);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermiso(perm.clave)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-sage-50 border-sage-400 shadow-sm'
                        : 'bg-cream-50 hover:bg-cream-100 border-stone-200/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-sage-600 rounded focus:ring-sage-500 border-stone-300"
                    />
                    <div>
                      <h4 className="text-xs font-mono font-bold text-charcoal-900">{perm.clave}</h4>
                      <p className="text-[11px] text-charcoal-500">{perm.descripcion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-bold rounded-full transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Registrar Rol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
