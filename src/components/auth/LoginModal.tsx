'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, X, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginConSupabase } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isForgotPasswordOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isForgotPasswordOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo institucional y contraseña.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const result = await loginConSupabase(email.trim(), password);
    setLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || 'Credenciales no válidas. Verifica tu correo y contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-stone-200/90 shadow-2xl p-6 sm:p-8 z-10 animate-fadeIn overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-accent-100/40 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-100 transition-all focus:outline-none"
          title="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-700 to-charcoal-900 text-white shadow-md mb-3 border border-primary-600/30">
            <ShieldCheck className="w-8 h-8 text-accent-500" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-extrabold uppercase tracking-wider border border-primary-200">
              Acceso Institucional
            </span>
          </div>
          <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
            Plataforma CCV 3.0
          </h2>
          <p className="text-xs text-charcoal-500 font-medium mt-1">
            Centro de Educación Virtual • Control RBAC
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative">
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
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50/80 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition-all"
                required
                autoFocus
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
                className="text-[11px] font-bold text-primary-600 hover:text-primary-800 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-cream-50/80 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-charcoal-400 hover:text-charcoal-700 transition-colors"
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Iniciando Sesión...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Acceder a la Plataforma
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-100 text-center flex flex-col items-center gap-1">
          <p className="text-[11px] text-charcoal-500 font-medium">
            Centro de Educación Virtual (CCV) • Universidad
          </p>
          <span className="text-[10px] text-charcoal-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent-500" /> Sistema seguro con autenticación Supabase y cifrado SSL
          </span>
        </div>
      </div>

      {isForgotPasswordOpen && (
        <ForgotPasswordModal onClose={() => setIsForgotPasswordOpen(false)} />
      )}
    </div>
  );
};
