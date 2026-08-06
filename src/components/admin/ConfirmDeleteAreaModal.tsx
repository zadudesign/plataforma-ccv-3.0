'use client';

import React from 'react';
import { X, Trash2, AlertTriangle, ShieldCheck, Users, Briefcase, GitMerge } from 'lucide-react';
import { Area, Rol, Usuario, ProyectoEspecial } from '@/types';

interface ConfirmDeleteAreaModalProps {
  area: Area;
  allAreas: Area[];
  roles: Rol[];
  usuarios: Usuario[];
  proyectos: ProyectoEspecial[];
  onClose: () => void;
  onConfirmDelete: (areaId: string) => void;
}

export const ConfirmDeleteAreaModal: React.FC<ConfirmDeleteAreaModalProps> = ({
  area,
  allAreas,
  roles,
  usuarios,
  proyectos,
  onClose,
  onConfirmDelete,
}) => {
  const subareas = allAreas.filter(a => a.parent_id === area.id);
  const rolesArea = roles.filter(r => r.area_id === area.id || r.area_nombre === area.nombre);
  const usuariosArea = usuarios.filter(u =>
    rolesArea.some(r => r.id === u.rol_id) || u.area_nombre === area.nombre
  );
  const proyectosArea = proyectos.filter(p => p.area_id === area.id);

  const handleConfirm = () => {
    onConfirmDelete(area.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
              Acción Destructiva Controlada
            </span>
            <h3 className="text-xl font-black text-charcoal-900 leading-snug">
              ¿Eliminar el área "{area.nombre}"?
            </h3>
          </div>
        </div>

        {/* Informative Alert Guardrail */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Mecanismo de Protección Jerárquica:</p>
            <p className="mt-1 text-amber-800">
              La eliminación de esta unidad se realizará de manera <strong>controlada</strong>. Si posee subáreas derivadas, estas serán reasignadas automáticamente{' '}
              {area.area_padre_nombre ? (
                <>al área padre <strong>({area.area_padre_nombre})</strong>.</>
              ) : (
                <>como <strong>Áreas Principales</strong> independientes.</>
              )}
            </p>
          </div>
        </div>

        {/* Dependency Analysis Cards */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-charcoal-500 tracking-wider">
            Análisis de Recursos Vinculados
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-cream-50 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
              <GitMerge className="w-4 h-4 text-sage-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-charcoal-900">{subareas.length}</span>
                <p className="text-[11px] text-charcoal-500">Subáreas derivadas</p>
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-charcoal-900">{rolesArea.length}</span>
                <p className="text-[11px] text-charcoal-500">Roles adscritos</p>
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
              <Users className="w-4 h-4 text-sage-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-charcoal-900">{usuariosArea.length}</span>
                <p className="text-[11px] text-charcoal-500">Usuarios en la unidad</p>
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-sage-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-charcoal-900">{proyectosArea.length}</span>
                <p className="text-[11px] text-charcoal-500">Proyectos asociados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subareas List if any */}
        {subareas.length > 0 && (
          <div className="p-3 bg-cream-100/60 rounded-2xl border border-stone-200/80 text-xs">
            <span className="font-bold text-charcoal-800">Subáreas que serán reasignadas:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {subareas.map(sub => (
                <span key={sub.id} className="px-2.5 py-0.5 rounded-full bg-white text-charcoal-900 font-extrabold border border-stone-200 text-[10px]">
                  {sub.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-bold rounded-full transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full shadow hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Eliminar Área
          </button>
        </div>
      </div>
    </div>
  );
};
