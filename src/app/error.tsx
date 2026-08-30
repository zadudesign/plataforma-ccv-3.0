'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home, Sparkles } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for diagnosis
    console.error('Plataforma CCV - Client Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl text-center space-y-6 animate-fadeIn">
        
        {/* Error Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm border border-rose-100">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider border border-rose-200">
            Control de Excepciones CCV
          </div>
          <h2 className="text-xl font-black text-charcoal-900 tracking-tight">
            Se produjo un error en la aplicación
          </h2>
          <p className="text-xs text-charcoal-600 font-medium leading-relaxed max-w-sm mx-auto">
            {error?.message || 'Ocurrió un error inesperado al renderizar la interfaz.'}
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-charcoal-400 bg-cream-50 py-1 px-2 rounded-lg inline-block">
              Código de rastreo: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all scale-100 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-cream-100 text-charcoal-800 text-xs font-bold border border-stone-200 transition-all"
          >
            <Home className="w-4 h-4 text-charcoal-500" />
            <span>Ir al Inicio</span>
          </button>
        </div>

        {/* Institutional Footer */}
        <div className="pt-4 border-t border-stone-100 text-[11px] text-charcoal-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-accent-500" />
          <span>Plataforma CCV 3.0 • Centro de Educación Virtual</span>
        </div>
      </div>
    </div>
  );
}
