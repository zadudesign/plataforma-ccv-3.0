'use client';

import React from 'react';
import { X, ShieldCheck, UserCheck, Sparkles, Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DevRoleSimulatorModalProps {
  onClose: () => void;
}

export const DevRoleSimulatorModal: React.FC<DevRoleSimulatorModalProps> = ({ onClose }) => {
  const { usuarios, usuarioActual, cambiarUsuarioSimulado, isRealAdmin } = useAuth();

  if (!isRealAdmin()) return null;

  const handleSelect = (id: string) => {
    cambiarUsuarioSimulado(id);
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
          <div className="w-10 h-10 rounded-2xl bg-coral-50 text-coral-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-charcoal-900">Simulador de Roles & Permisos (Dev/Demo)</h3>
            <p className="text-xs text-charcoal-500">
              Cambia instantáneamente de perfil para validar la visibilidad RLS y los permisos del sistema.
            </p>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {usuarios.map((usr) => {
            const isSelected = usuarioActual?.id === usr.id;
            return (
              <button
                key={usr.id}
                onClick={() => handleSelect(usr.id)}
                className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left ${
                  isSelected
                    ? 'bg-sage-50 border-sage-500 shadow-sm'
                    : 'bg-cream-50 hover:bg-cream-100 border-stone-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={usr.avatar_url}
                    alt={usr.nombre_completo}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <h4 className="text-xs font-black text-charcoal-900 flex items-center gap-2">
                      {usr.nombre_completo}
                      {isSelected && (
                        <span className="text-[10px] bg-sage-600 text-white px-2 py-0.5 rounded-full font-bold">
                          ACTIVO
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-sage-100 text-sage-800 px-2 py-0.5 rounded-full border border-sage-200">
                        {usr.rol_nombre}
                      </span>
                      <span className="text-[10px] font-mono text-charcoal-500 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Area: {usr.area_nombre || 'CURSO'}
                      </span>
                    </div>
                  </div>
                </div>

                <UserCheck className={`w-5 h-5 ${isSelected ? 'text-sage-600' : 'text-stone-300'}`} />
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-stone-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-charcoal-800 text-xs font-bold rounded-full transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
