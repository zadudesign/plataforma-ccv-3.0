'use client';

import React from 'react';
import { Search, Bell, MessageSquare, Plus, Shield, Sparkles } from 'lucide-react';
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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
      {/* Greeting Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
          ¡Hola, {usuarioActual.nombre_completo.split(' ')[0]}!
        </h1>
        <p className="text-sm font-medium text-charcoal-500 mt-1">
          Explora la producción, diseño instruccional y proyectos de Educación Continua.
        </p>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar tarea, curso o profesor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-64 md:w-80 py-3 pl-5 pr-14 bg-white rounded-full text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-sm text-charcoal-900 placeholder-charcoal-500"
          />
          <button className="absolute right-1.5 w-9 h-9 rounded-full bg-charcoal-900 text-white flex items-center justify-center hover:bg-sage-600 transition-colors shadow">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Role & Area Badge */}
        <button
          onClick={() => setIsDevSimulatorOpen(true)}
          className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-sage-50 hover:bg-sage-100 text-sage-800 text-xs font-semibold border border-sage-200 transition-colors shadow-xs"
          title="Haz clic para simular otro rol de usuario"
        >
          <Shield className="w-3.5 h-3.5 text-sage-600" />
          <span>{usuarioActual.area_nombre || 'CURSO'} (Nivel {nivelArea}) • {usuarioActual.rol_nombre || 'Docente'}</span>
          <Sparkles className="w-3 h-3 text-coral-500 ml-0.5" />
        </button>

        {/* Notification Bell with red dot */}
        <button 
          className="relative w-11 h-11 rounded-full bg-white border border-stone-200 flex items-center justify-center text-charcoal-800 hover:bg-cream-100 transition-colors shadow-sm"
          title="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-coral-500 ring-2 ring-white" />
        </button>

        {/* Chat / Feedback Button */}
        <button 
          className="w-11 h-11 rounded-full bg-white border border-stone-200 flex items-center justify-center text-charcoal-800 hover:bg-cream-100 transition-colors shadow-sm"
          title="Mensajes y Soporte"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Create Task Action Button */}
        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg scale-100 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Nueva Tarea CCV</span>
        </button>
      </div>
    </header>
  );
};

