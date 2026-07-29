'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, UserCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { loginConSupabase, usuarios, cambiarUsuarioSimulado } = useAuth();
  
  const [modo, setModo] = useState<'auth' | 'simulator'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleSelectSimulado = (usrId: string) => {
    cambiarUsuarioSimulado(usrId);
    if (onSuccess) onSuccess();
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

        {/* Mode Selector Tabs */}
        <div className="flex bg-cream-100 p-1 rounded-full mb-6 border border-stone-200 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setModo('auth')}
            className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              modo === 'auth' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Iniciar Sesión (Supabase)
          </button>
          <button
            type="button"
            onClick={() => setModo('simulator')}
            className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              modo === 'simulator' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-coral-400" /> Selector Rápido Roles
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Auth */}
        {modo === 'auth' ? (
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
        ) : (
          /* Simulator / Fast Role Selector */
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <p className="text-xs text-charcoal-500 mb-3 font-medium">
              Selecciona cualquier perfil para explorar la plataforma con sus permisos y visibilidad por área asignada:
            </p>

            {usuarios.map((usr) => (
              <button
                key={usr.id}
                type="button"
                onClick={() => handleSelectSimulado(usr.id)}
                className="w-full p-3 bg-cream-50 hover:bg-sage-50 border border-stone-200/80 rounded-2xl flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={usr.avatar_url}
                    alt={usr.nombre_completo}
                    className="w-9 h-9 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-charcoal-900 group-hover:text-sage-800">
                      {usr.nombre_completo}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="bg-sage-100 text-sage-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-sage-200">
                        {usr.rol_nombre}
                      </span>
                      <span className="text-[10px] font-mono text-charcoal-500">
                        ({usr.area_nombre || 'CURSO'})
                      </span>
                    </div>
                  </div>
                </div>

                <UserCheck className="w-4 h-4 text-charcoal-300 group-hover:text-sage-600 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-100 text-center">
          <p className="text-[11px] text-charcoal-400 font-medium">
            Centro de Educación Virtual (CCV) • Universidad
          </p>
        </div>
      </div>
    </div>
  );
};
