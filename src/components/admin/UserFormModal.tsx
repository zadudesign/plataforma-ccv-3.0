'use client';

import React, { useState } from 'react';
import { X, UserPlus, Edit, ShieldCheck, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { Usuario, Rol } from '@/types';

interface UserFormModalProps {
  usuarioEditar?: Usuario | null;
  roles: Rol[];
  onClose: () => void;
  onSave: (usuario: Omit<Usuario, 'id'> | Partial<Usuario>) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  usuarioEditar,
  roles,
  onClose,
  onSave,
}) => {
  const [nombreCompleto, setNombreCompleto] = useState(usuarioEditar?.nombre_completo || '');
  const [email, setEmail] = useState(usuarioEditar?.email || '');
  const [rolId, setRolId] = useState(usuarioEditar?.rol_id || roles[0]?.id || '');
  const [telefono, setTelefono] = useState(usuarioEditar?.telefono || '');
  const [activo, setActivo] = useState(usuarioEditar?.activo !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto || !email || !rolId) return;

    onSave({
      nombre_completo: nombreCompleto,
      email,
      rol_id: rolId,
      telefono,
      activo,
    });
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

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center shadow-sm">
            {usuarioEditar ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900">
              {usuarioEditar ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario CCV'}
            </h3>
            <p className="text-xs text-charcoal-500">
              {usuarioEditar
                ? 'Modifica los permisos, rol o estado del usuario.'
                : 'Crea una cuenta institucional y asigna su rol jerárquico.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={e => setNombreCompleto(e.target.value)}
              placeholder="Ej: Dra. María López"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Correo Electrónico Institucional *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="maria.lopez@universidad.edu.co"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Rol de Plataforma & Área *
            </label>
            <select
              value={rolId}
              onChange={e => setRolId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nombre} (Área: {r.area_nombre})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              <input
                type="text"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+57 300 123 4567"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          </div>

          {usuarioEditar && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="activoCheck"
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
                className="w-4 h-4 text-sage-600 rounded focus:ring-sage-500 border-stone-300"
              />
              <label htmlFor="activoCheck" className="text-xs font-bold text-charcoal-800">
                Usuario Activo en el Sistema
              </label>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-bold rounded-full transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
