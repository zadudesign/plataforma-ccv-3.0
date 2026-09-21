'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  FolderTree, 
  Kanban, 
  Calendar, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Menu,
  X
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Bloquear scroll de fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Cerrar menú móvil al presionar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <>
      {/* 1. Botón Activador en la Esquina Superior Izquierda (Visible solo en móvil) */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          id="btn-sidebar-mobile-trigger"
          aria-label="Abrir menú de navegación"
          aria-expanded={isMobileOpen}
          className="flex items-center gap-2.5 px-3 py-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md hover:shadow-lg active:scale-95 transition-all text-slate-800"
          title="Abrir menú"
        >
          <div className="relative flex items-center justify-center">
            <Menu className="w-5 h-5 text-slate-700" />
            {tareasPendientesCount > 0 && (
              <span 
                className="absolute -top-1.5 -right-1.5 px-1 min-w-[15px] h-[15px] text-[8px] font-black rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-white animate-pulse"
              >
                {tareasPendientesCount > 99 ? '99+' : tareasPendientesCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
            <img src="/isotipo.svg" alt="PrismaLab" className="w-5 h-5 object-contain" />
            <span className="text-xs font-black text-slate-900 tracking-tight">
              Prisma<span className="text-sky-600">Lab</span>
            </span>
          </div>
        </button>
      </div>

      {/* 2. Backdrop Overlay Oscuro en Móvil */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. Panel Lateral Móvil (Drawer vertical deslizable) */}
      <aside 
        className={`md:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between py-5 px-4 border-r border-slate-200/90 transition-transform duration-300 ease-in-out font-sans ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú móvil"
      >
        {/* Header del Menú Móvil */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-slate-100">
              <img src="/isotipo.svg" alt="PrismaLab" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 tracking-tight">
                Prisma<span className="text-sky-600">Lab</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                v3.0 CCV
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de navegación vertical interactiva */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = vistaActual === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setVistaActual(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-slate-700/60 text-sky-400' : 'bg-slate-100 text-slate-600'}`}>
                  {item.icon}
                </div>
                <span className="flex-1 leading-snug">{item.label}</span>
                {item.id === 'kanban' && tareasPendientesCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white shadow-xs">
                    {tareasPendientesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del Drawer con Usuario y Acciones */}
        <div className="pt-4 border-t border-slate-200/90 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <img
              src={usuarioActual?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={usuarioActual?.nombre_completo || 'Usuario'}
              className="w-10 h-10 rounded-full object-cover border-2 border-sky-500 shadow-xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {usuarioActual?.nombre_completo || 'Usuario'}
              </p>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {usuarioActual?.rol_nombre || 'Docente'} {usuarioActual?.area_nombre ? `· ${usuarioActual.area_nombre}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRealAdmin() && (
              <button
                type="button"
                onClick={() => {
                  setIsDevSimulatorOpen(true);
                  setIsMobileOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-bold border border-amber-200/60 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Simulador</span>
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-bold border border-rose-200/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 4. Menú Vertical Flotante en Escritorio (Permanece igual para pantallas medianas y grandes md+) */}
      <aside className="hidden md:flex fixed left-6 top-6 bottom-6 w-18 bg-white rounded-3xl border border-stone-200/80 shadow-xl flex-col items-center py-6 justify-between z-30 font-sans">
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
    </>
  );
};
