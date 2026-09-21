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
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import { VistaNavegacion } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  vistaActual: VistaNavegacion;
  setVistaActual: (vista: VistaNavegacion) => void;
  tareasPendientesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ vistaActual, setVistaActual, tareasPendientesCount = 0 }) => {
  const { usuarioActual, roles, isAdmin, isRealAdmin, setIsDevSimulatorOpen, logout } = useAuth();

  // Verificar si el usuario es Admin o pertenece a un rol del CMU
  const isCmuOrAdmin = (): boolean => {
    if (isAdmin()) return true;
    const rolName = (usuarioActual?.rol_nombre || '').toLowerCase();
    const areaName = (usuarioActual?.area_nombre || '').toLowerCase();
    
    if (areaName.includes('cmu')) return true;
    if (['administrador', 'jefe', 'diseño', 'diseno', 'multimedia', 'soporte', 'producción', 'produccion'].includes(rolName)) return true;
    
    const rol = roles.find(r => r.id === usuarioActual?.rol_id);
    if (rol) {
      const rName = rol.nombre.toLowerCase();
      const aName = (rol.area_nombre || '').toLowerCase();
      if (aName.includes('cmu') || ['administrador', 'jefe', 'diseño', 'diseno', 'multimedia', 'soporte', 'producción', 'produccion'].includes(rName)) {
        return true;
      }
    }
    return false;
  };

  const allNavItems: { 
    id: VistaNavegacion; 
    label: string; 
    icon: React.ReactNode; 
    requiresAdmin?: boolean;
    requiresCmuOrAdmin?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Métricas Institucionales', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendario de Entregas & Vencimientos', icon: <Calendar className="w-5 h-5" /> },
    { id: 'kanban', label: 'Tablero Kanban de Producción', icon: <Kanban className="w-5 h-5" /> },
    { id: 'parrilla', label: 'Parrilla de Contenidos & Calendario Editorial (CMU)', icon: <CalendarDays className="w-5 h-5" />, requiresCmuOrAdmin: true },
    { id: 'productivity', label: 'Panel de Productividad y Control de Entregas', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'academic', label: 'Estructura Académica e Institucional', icon: <FolderTree className="w-5 h-5" /> },
    { id: 'admin', label: 'Panel de Administración RBAC & Asignaciones', icon: <ShieldCheck className="w-5 h-5" />, requiresAdmin: true },
  ];

  // Filter items based on user role (Admin section is exclusive to Admin; Parrilla is exclusive to Admin & CMU)
  const navItems = allNavItems.filter(item => {
    if (item.requiresAdmin && !isAdmin()) return false;
    if (item.requiresCmuOrAdmin && !isCmuOrAdmin()) return false;
    return true;
  });

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-18 bg-white rounded-3xl border border-stone-200/80 shadow-xl flex flex-col items-center py-6 justify-between z-30 font-sans">
      {/* Top Logo / Isotipo */}
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => setVistaActual('dashboard')}
          className="p-2 rounded-2xl bg-cream-100/80 hover:bg-cream-200/80 transition-colors shadow-2xs group cursor-pointer"
          title="PrismaLab v3.0"
        >
          <img src="/isotipo.svg" alt="PrismaLab" className="w-9 h-9 object-contain drop-shadow-xs" />
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
              {item.id === 'kanban' && tareasPendientesCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-[9px] font-black rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs border border-white animate-pulse"
                  title={`${tareasPendientesCount} Tareas Pendientes`}
                >
                  {tareasPendientesCount > 99 ? '99+' : tareasPendientesCount}
                </span>
              )}
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

