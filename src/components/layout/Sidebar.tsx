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
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { VistaNavegacion } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  vistaActual: VistaNavegacion;
  setVistaActual: (vista: VistaNavegacion) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ vistaActual, setVistaActual }) => {
  const { usuarioActual, isAdmin, isRealAdmin, setIsDevSimulatorOpen, logout } = useAuth();

  const allNavItems: { id: VistaNavegacion; label: string; icon: React.ReactNode; requiresAdmin?: boolean }[] = [
    { id: 'dashboard', label: 'Métricas Institucionales CCV', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendario de Entregas & Vencimientos CCV', icon: <Calendar className="w-5 h-5" /> },
    { id: 'kanban', label: 'Tablero Kanban de Producción CCV', icon: <Kanban className="w-5 h-5" /> },
    { id: 'productivity', label: 'Panel de Productividad y Control de Entregas', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'academic', label: 'Estructura Académica e Institucional CCV', icon: <FolderTree className="w-5 h-5" /> },
    { id: 'admin', label: 'Panel de Administración RBAC & Asignaciones CCV', icon: <ShieldCheck className="w-5 h-5" />, requiresAdmin: true },
  ];

  // Filter items based on user role (Admin section is exclusive to Nivel 6 / Admin)
  const navItems = allNavItems.filter(item => !item.requiresAdmin || isAdmin());

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-20 flex flex-col items-center justify-between py-6 ccv-pill-sidebar z-40 bg-white">
      {/* Top Logo */}
      <div className="flex flex-col items-center space-y-2">
        <button 
          onClick={() => setVistaActual('dashboard')}
          className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center p-2 text-sky-600 hover:bg-sky-50 transition-all shadow-2xs border border-slate-200/80 hover:scale-105 active:scale-95"
          title="Plataforma CCV 3.0"
        >
          <img src="/isotipo.svg" alt="CCV" className="w-9 h-9 object-contain drop-shadow-xs" />
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
                  ? 'bg-slate-800 text-white shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              {isActive && (
                <span className="absolute -right-1 w-1.5 h-1.5 rounded-full bg-sky-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions & User Profile */}
      <div className="flex flex-col items-center space-y-4">
        {isRealAdmin() && (
          <button 
            onClick={() => setIsDevSimulatorOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors shadow-2xs"
            title="Simulador de Roles (Solo Administrador)"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}

        <button 
          onClick={logout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* User Avatar Circle */}
        <div className="pt-2" title={`${usuarioActual?.nombre_completo} (${usuarioActual?.rol_nombre || 'Docente'})`}>
          <img
            src={usuarioActual?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={usuarioActual?.nombre_completo || 'Usuario'}
            className="w-10 h-10 rounded-full object-cover border-2 border-sky-500 shadow-sm"
          />
        </div>
      </div>
    </aside>
  );
};

