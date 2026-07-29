'use client';

import React from 'react';
import { 
  LayoutGrid, 
  FolderTree, 
  Kanban, 
  Calendar, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { VistaNavegacion } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  vistaActual: VistaNavegacion;
  setVistaActual: (vista: VistaNavegacion) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ vistaActual, setVistaActual }) => {
  const { usuarioActual, isAdmin, setIsDevSimulatorOpen, logout } = useAuth();

  const allNavItems: { id: VistaNavegacion; label: string; icon: React.ReactNode; requiresAdmin?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'academic', label: 'Estructura Académica', icon: <FolderTree className="w-5 h-5" /> },
    { id: 'kanban', label: 'Tablero Kanban', icon: <Kanban className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendario', icon: <Calendar className="w-5 h-5" /> },
    { id: 'admin', label: 'Administración RBAC', icon: <ShieldCheck className="w-5 h-5" />, requiresAdmin: true },
  ];

  // Filter items based on user role (Admin section is exclusive to Nivel 6 / Admin)
  const navItems = allNavItems.filter(item => !item.requiresAdmin || isAdmin());

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-20 flex flex-col items-center justify-between py-6 ccv-pill-sidebar z-40 bg-white">
      {/* Top Logo */}
      <div className="flex flex-col items-center space-y-2">
        <button 
          onClick={() => setVistaActual('dashboard')}
          className="w-12 h-12 rounded-full bg-sage-50 flex items-center justify-center text-sage-600 hover:bg-sage-100 transition-colors shadow-sm"
          title="Plataforma CCV 3.0"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-sage-600 animate-pulse" />
          </div>
        </button>
      </div>

      {/* Center Navigation Icons */}
      <nav className="flex flex-col items-center space-y-4">
        {navItems.map((item) => {
          const isActive = vistaActual === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setVistaActual(item.id)}
              title={item.label}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-charcoal-900 text-white shadow-md scale-105'
                  : 'text-charcoal-500 hover:text-charcoal-900 hover:bg-cream-100'
              }`}
            >
              {item.icon}
              {isActive && (
                <span className="absolute -right-1 w-1.5 h-1.5 rounded-full bg-sage-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions & User Profile */}
      <div className="flex flex-col items-center space-y-4">
        <button 
          onClick={() => setIsDevSimulatorOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-coral-600 bg-coral-50 hover:bg-coral-100 transition-colors shadow-xs"
          title="Simulador de Roles (Dev)"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <button 
          onClick={logout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal-500 hover:text-coral-600 hover:bg-coral-50 transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* User Avatar Circle */}
        <div className="pt-2" title={`${usuarioActual?.nombre_completo} (${usuarioActual?.rol_nombre || 'Docente'})`}>
          <img
            src={usuarioActual?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={usuarioActual?.nombre_completo || 'Usuario'}
            className="w-10 h-10 rounded-full object-cover border-2 border-sage-500 shadow-sm"
          />
        </div>
      </div>
    </aside>
  );
};

