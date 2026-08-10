'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, UserCheck, AlertCircle, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RegisterFormProps {
  onSuccess?: () => void;
  onGoToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onGoToLogin }) => {
  const { roles, registroConSupabase } = useAuth();
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [rolId, setRolId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-seleccionar primer rol si no está asignado
  React.useEffect(() => {
    if (roles && roles.length > 0 && !rolId) {
      const docenteRol = roles.find(r => r.nombre === 'Docente') || roles[0];
      setRolId(docenteRol.id);
    }
  }, [roles, rolId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombreCompleto.trim()) {
      setErrorMsg('Ingresa tu nombre completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico institucional válido.');
      return;
    }
    if (!rolId) {
      setErrorMsg('Selecciona tu rol en la plataforma.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const res = await registroConSupabase(email, password, nombreCompleto, rolId);
    setLoading(false);

    if (res.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    } else {
      setErrorMsg(res.error || 'Error al completar el registro.');
    }
  };

  const rolSeleccionadoObj = roles.find(r => r.id === rolId);

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sage-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-coral-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200/80 shadow-2xl p-8 z-10 relative animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-charcoal-900 text-cream-100 shadow-md mb-3">
            <ShieldCheck className="w-8 h-8 text-sage-400" />
          </div>
          <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Registro de Usuario</h1>
          <p className="text-xs text-charcoal-500 font-medium mt-1">
            Crea tu cuenta institucional en Plataforma CCV 3.0
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario de Registro */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={nombreCompleto}
                onChange={e => setNombreCompleto(e.target.value)}
                placeholder="Ej. Juan David Gómez"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Correo Institucional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@universidad.edu.co"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Seleccionar Rol en la Plataforma */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Rol y Nivel Jerárquico</span>
              {rolSeleccionadoObj && (
                <span className="text-[10px] bg-sage-100 text-sage-800 font-extrabold px-2 py-0.5 rounded-full border border-sage-300">
                  {rolSeleccionadoObj.area_nombre || 'Área Jerárquica'}
                </span>
              )}
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 z-10 pointer-events-none" />
              <select
                value={rolId}
                onChange={e => setRolId(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all appearance-none cursor-pointer"
                required
              >
                {roles.map(rol => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre} ({rol.area_nombre || 'CCV'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-charcoal-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-[10px] text-charcoal-400 font-medium mt-1">
              Este rol determinará tus permisos RBAC y la visibilidad de áreas/tareas en la plataforma.
            </p>
          </div>

          {/* Contraseña */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Confirmar
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span>Registrando e Iniciando Sesión...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Crear Cuenta & Acceder
              </>
            )}
          </button>
        </form>

        {/* Footer con Enlace a Login */}
        <div className="mt-6 pt-4 border-t border-stone-100 text-center flex items-center justify-between">
          {onGoToLogin ? (
            <button
              type="button"
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-700 hover:text-sage-900 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio de Sesión
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-700 hover:text-sage-900 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio de Sesión
            </Link>
          )}

          <span className="text-[11px] text-charcoal-400 font-medium">
            CCV • Universidad
          </span>
        </div>
      </div>
    </div>
  );
};
