'use client';

import React, { useState } from 'react';
import { X, Layers, CheckCircle2, AlertCircle, GitMerge, UserCheck } from 'lucide-react';
import { Area, Usuario } from '@/types';

interface CreateAreaModalProps {
  areas: Area[];
  usuarios?: Usuario[];
  defaultParentId?: string;
  onClose: () => void;
  onCrearArea: (nombre: string, nivel: number, parentId?: string | null, jefeId?: string | null) => void;
}

export const CreateAreaModal: React.FC<CreateAreaModalProps> = ({
  areas,
  usuarios = [],
  defaultParentId = '',
  onClose,
  onCrearArea,
}) => {
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState<number>(() => {
    if (defaultParentId) {
      const parentObj = areas.find(a => a.id === defaultParentId);
      if (parentObj) return parentObj.nivel;
    }
    return 4; // Por defecto Departamento
  });
  const [parentId, setParentId] = useState<string>(defaultParentId);
  const [jefeId, setJefeId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleParentChange = (selectedParentId: string) => {
    setParentId(selectedParentId);
    if (selectedParentId) {
      const parentObj = areas.find(a => a.id === selectedParentId);
      if (parentObj) {
        setNivel(parentObj.nivel);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre de la nueva área es obligatorio.');
      return;
    }
    if (nivel < 1) {
      setErrorMsg('El nivel jerárquico debe ser mayor o igual a 1.');
      return;
    }

    onCrearArea(nombre, nivel, parentId || null, jefeId || null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900">
              Crear Nueva Área o Subárea
            </h3>
            <p className="text-xs text-charcoal-500">
              Registra una unidad o sub-equipo en la cadena organizacional.
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
              Nombre de la Nueva Área / Subárea <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: PRODUCCIÓN MULTIMEDIA, DISEÑO INSTRUCCIONAL..."
              className="w-full px-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium uppercase text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1 flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-sage-600" />
              Área Padre (Opcional - Para Subáreas)
            </label>
            <select
              value={parentId}
              onChange={e => handleParentChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="">-- Ninguna (Área Principal / Raíz) --</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nombre} (Nivel {a.nivel}){a.area_padre_nombre ? ` — Padre: ${a.area_padre_nombre}` : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-charcoal-400 mt-1">
              Si seleccionas un área padre, esta nueva unidad operará como subárea dentro de la jerarquía.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-sage-600" />
              Jefe de Departamento / Responsable de Área
            </label>
            <select
              value={jefeId}
              onChange={e => setJefeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="">-- Sin Jefe asignado por ahora --</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo} {u.rol_nombre ? `(${u.rol_nombre})` : ''} - {u.email}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-charcoal-400 mt-1">
              El usuario asignado como Jefe tendrá supervisión y visibilidad sobre los proyectos y tareas adscritos a este departamento.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Nivel Jerárquico (Visibilidad RLS) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={nivel}
              onChange={e => setNivel(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
            <p className="text-[11px] text-charcoal-400 mt-1.5 leading-relaxed">
              * Nota: Nivel 4 = DEPARTAMENTO, Nivel 5 = CMU/PRODUCCIÓN, Nivel 6 = ADMIN.
            </p>
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
              <CheckCircle2 className="w-4 h-4" /> Registrar Área
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
