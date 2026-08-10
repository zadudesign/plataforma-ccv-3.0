'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: () => void;
  onGoToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onGoToRegister }) => {
  const { loginConSupabase } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const result = await loginConSupabase(email, password);
    setLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(result.error || 'Credenciales no válidas.');
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative background blur elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sage-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-coral-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/80 shadow-2xl p-8 z-10 relative animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-charcoal-900 text-cream-100 shadow-md mb-3">
            <ShieldCheck className="w-8 h-8 text-sage-400" />
          </div>
          <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Plataforma CCV 3.0</h1>
          <p className="text-xs text-charcoal-500 font-medium mt-1">
            Sistema de Gestión de Cursos Virtuales & Control RBAC
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Auth */}
        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="ejemplo@universidad.edu.co"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-[11px] font-bold text-sage-700 hover:text-sage-900 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Iniciando Sesión...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Autenticarse
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-100 text-center flex items-center justify-between">
          {onGoToRegister ? (
            <button
              type="button"
              onClick={onGoToRegister}
              className="inline-flex items-center gap-1 text-xs font-bold text-sage-700 hover:text-sage-900 hover:underline"
            >
              <UserPlus className="w-3.5 h-3.5" /> ¿No tienes cuenta? Regístrate
            </button>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-1 text-xs font-bold text-sage-700 hover:text-sage-900 hover:underline"
            >
              <UserPlus className="w-3.5 h-3.5" /> ¿No tienes cuenta? Regístrate
            </Link>
          )}

          <span className="text-[11px] text-charcoal-400 font-medium">
            CCV • Universidad
          </span>
        </div>
      </div>

      {isForgotPasswordOpen && (
        <ForgotPasswordModal onClose={() => setIsForgotPasswordOpen(false)} />
      )}
    </div>
  );
};
