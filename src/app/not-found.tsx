'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm border border-amber-100">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200">
            Error 404
          </span>
          <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
            Página No Encontrada
          </h2>
          <p className="text-xs text-charcoal-600 font-medium leading-relaxed max-w-sm mx-auto">
            La sección o recurso al que intentas acceder no existe o fue reubicado.
          </p>
        </div>

        <div className="flex items-center justify-center pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all scale-100 hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4 text-accent-400" />
            <span>Volver a la Plataforma</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-stone-100 text-[11px] text-charcoal-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-accent-500" />
          <span>Plataforma CCV 3.0 • Centro de Educación Virtual</span>
        </div>
      </div>
    </div>
  );
}
