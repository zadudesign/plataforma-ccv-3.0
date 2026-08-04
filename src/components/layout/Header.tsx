'use client';

import React from 'react';
import { Search, Bell, Plus, Shield, Sparkles } from 'lucide-react';
import { Usuario } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  usuarioActual?: Usuario;
  onOpenCreateTask: () => void;
  busqueda: string;
  setBusqueda: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  usuarioActual: propsUsuario,
  onOpenCreateTask,
  busqueda,
  setBusqueda,
}) => {
  const { usuarioActual: contextUsuario, nivelArea, setIsDevSimulatorOpen } = useAuth();
  const usuarioActual = propsUsuario || contextUsuario;

  if (!usuarioActual) return null;

  return (
    <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Buscar tarea, curso o profesor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full py-2.5 pl-5 pr-14 bg-white rounded-full text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-sm text-charcoal-900 placeholder-charcoal-400"
        />
        <button className="absolute right-1.5 top-1 w-8 h-8 rounded-full bg-charcoal-900 text-white flex items-center justify-center hover:bg-sage-600 transition-colors shadow">
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Role Simulator Badge Button */}
        <button
          onClick={() => setIsDevSimulatorOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sage-50 hover:bg-sage-100 text-sage-800 text-xs font-bold border border-sage-200 transition-colors shadow-xs"
          title="Haz clic para simular otro rol de usuario"
        >
          <Shield className="w-3.5 h-3.5 text-sage-600" />
          <span>Simulador: {usuarioActual.rol_nombre || 'Docente'} (Nivel {nivelArea})</span>
          <Sparkles className="w-3 h-3 text-amber-500 ml-0.5" />
        </button>

        {/* Notification Bell */}
        <button 
          className="relative w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-charcoal-800 hover:bg-cream-100 transition-colors shadow-sm"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-coral-500 ring-2 ring-white" />
        </button>

        {/* Create Task Action Button */}
        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg scale-100 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nueva Tarea</span>
        </button>
      </div>
    </header>
  );
};
