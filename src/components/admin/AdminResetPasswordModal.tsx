'use client';

import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, RefreshCw, Copy, Check, ShieldAlert } from 'lucide-react';
import { Usuario } from '@/types';

interface AdminResetPasswordModalProps {
  usuario: Usuario;
  onClose: () => void;
  onResetPassword: (userId: string, nuevaPassword: string) => Promise<{ success: boolean; error?: string }>;
}

export const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
  usuario,
  onClose,
  onResetPassword,
}) => {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Función para generar contraseña aleatoria segura
  const generarPasswordSegura = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let pwd = 'Ccv#';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNuevaPassword(pwd);
    setMensajeError(null);
  };

  const handleCopiar = () => {
    if (!nuevaPassword) return;
    navigator.clipboard.writeText(nuevaPassword);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPassword || nuevaPassword.length < 6) {
      setMensajeError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setMensajeError(null);
    setMensajeExito(null);

    const result = await onResetPassword(usuario.id, nuevaPassword);
    setLoading(false);

    if (result.success) {
      setMensajeExito(`Contraseña actualizada con éxito para ${usuario.nombre_completo}.`);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setMensajeError(result.error || 'Ocurrió un error al restablecer la contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-md p-6 relative">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-200">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900">Restablecer Contraseña</h3>
            <p className="text-xs text-charcoal-500 font-medium">
              Asigna una nueva clave de acceso para <strong className="text-charcoal-900">{usuario.nombre_completo}</strong>
            </p>
          </div>
        </div>

        {/* Badge Usuario */}
        <div className="mb-4 p-3 bg-cream-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-charcoal-800">{usuario.email}</p>
            <p className="text-[11px] text-charcoal-500">Rol: {usuario.rol_nombre || 'Docente'}</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 text-[10px] font-extrabold border border-sage-200">
            {usuario.area_nombre || 'CCV'}
          </span>
        </div>

        {/* Notificaciones */}
        {mensajeError && (
          <div className="mb-4 p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-coral-600" />
            <span>{mensajeError}</span>
          </div>
        )}

        {mensajeExito && (
          <div className="mb-4 p-3 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-sage-600" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                Nueva Contraseña *
              </label>
              <button
                type="button"
                onClick={generarPasswordSegura}
                className="text-[11px] font-bold text-sage-700 hover:text-sage-900 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Generar Segura
              </button>
            </div>

            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={nuevaPassword}
                onChange={e => setNuevaPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-3.5 pr-20 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-mono font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                required
              />

              <div className="absolute right-2 top-2 flex items-center gap-1">
                {nuevaPassword && (
                  <button
                    type="button"
                    onClick={handleCopiar}
                    className="p-1 text-charcoal-400 hover:text-charcoal-800 rounded transition-all"
                    title="Copiar contraseña"
                  >
                    {copiado ? <Check className="w-4 h-4 text-sage-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="p-1 text-charcoal-400 hover:text-charcoal-800 rounded transition-all"
                  title={mostrarPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">
              El usuario utilizará esta clave en su próximo inicio de sesión.
            </p>
          </div>

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
              disabled={loading || !nuevaPassword}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <span>Actualizando...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Guardar Nueva Clave
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
