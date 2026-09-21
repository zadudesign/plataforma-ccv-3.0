'use client';

import React, { useState, useMemo } from 'react';
import { X, ShieldCheck, UserCheck, Sparkles, Layers, Search, UserX, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DevRoleSimulatorModalProps {
  onClose: () => void;
}

export const DevRoleSimulatorModal: React.FC<DevRoleSimulatorModalProps> = ({ onClose }) => {
  const { usuarios, usuarioActual, cambiarUsuarioSimulado, isRealAdmin } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');

  const rolesConConteo = useMemo(() => {
    const conteo: Record<string, number> = {};
    usuarios.forEach((u) => {
      const rol = u.rol_nombre || 'Sin Rol';
      conteo[rol] = (conteo[rol] || 0) + 1;
    });
    const rolesList = Object.keys(conteo).sort((a, b) => a.localeCompare(b));
    return { conteo, rolesList };
  }, [usuarios]);

  if (!isRealAdmin()) return null;

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return usuarios.filter((usr) => {
      if (filtroRol !== 'todos') {
        const rolUsuario = usr.rol_nombre || 'Sin Rol';
        if (rolUsuario.toLowerCase() !== filtroRol.toLowerCase() && usr.rol_id !== filtroRol) {
          return false;
        }
      }

      if (!q) return true;
      const matchNombre = usr.nombre_completo.toLowerCase().includes(q);
      const matchEmail = usr.email?.toLowerCase().includes(q);
      const matchRol = usr.rol_nombre?.toLowerCase().includes(q);
      const matchArea = usr.area_nombre?.toLowerCase().includes(q);
      return matchNombre || matchEmail || matchRol || matchArea;
    });
  }, [usuarios, busqueda, filtroRol]);

  const handleSelect = (id: string) => {
    cambiarUsuarioSimulado(id);
    onClose();
  };

  const handleResetFiltros = () => {
    setBusqueda('');
    setFiltroRol('todos');
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
          title="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-coral-50 text-coral-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-charcoal-900">Simulador de Roles & Permisos (Dev/Demo)</h3>
            <p className="text-xs text-charcoal-500">
              Cambia instantáneamente de perfil para validar la visibilidad RLS y los permisos del sistema.
            </p>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="shrink-0 space-y-2.5 mb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo, rol o área..."
              className="w-full pl-10 pr-9 py-2.5 bg-cream-50/80 border border-stone-200 rounded-2xl text-xs font-semibold text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all shadow-2xs"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-2.5 p-0.5 text-charcoal-400 hover:text-charcoal-700 rounded-full hover:bg-stone-200/60 transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro Rápido de Roles (Chips / Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <button
              type="button"
              onClick={() => setFiltroRol('todos')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                filtroRol === 'todos'
                  ? 'bg-charcoal-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-charcoal-600 hover:bg-stone-200 hover:text-charcoal-900'
              }`}
            >
              <span>Todos</span>
              <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                filtroRol === 'todos' ? 'bg-white/20 text-white' : 'bg-stone-200 text-charcoal-700'
              }`}>
                {usuarios.length}
              </span>
            </button>

            {rolesConConteo.rolesList.map((rol) => {
              const isSelected = filtroRol.toLowerCase() === rol.toLowerCase();
              const count = rolesConConteo.conteo[rol];
              return (
                <button
                  key={rol}
                  type="button"
                  onClick={() => setFiltroRol(isSelected ? 'todos' : rol)}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sage-600 text-white shadow-2xs ring-1 ring-sage-500'
                      : 'bg-stone-100 text-charcoal-600 hover:bg-stone-200 hover:text-charcoal-900'
                  }`}
                >
                  <span>{rol}</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-charcoal-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contador y botón de limpiar */}
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 px-1 font-medium">
            <span>
              Mostrando <strong className="text-sage-700 font-bold">{usuariosFiltrados.length}</strong> de {usuarios.length} usuarios
              {filtroRol !== 'todos' && (
                <span className="text-charcoal-700 font-bold"> • Rol: {filtroRol}</span>
              )}
            </span>
            {(busqueda || filtroRol !== 'todos') && (
              <button
                onClick={handleResetFiltros}
                className="text-sage-600 hover:text-sage-800 font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Listado de Usuarios */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {usuariosFiltrados.length === 0 ? (
            <div className="p-8 text-center bg-cream-50/50 rounded-2xl border border-dashed border-stone-200 space-y-2 my-2 animate-fadeIn">
              <UserX className="w-8 h-8 text-charcoal-300 mx-auto" />
              <p className="text-xs font-bold text-charcoal-700">
                No se encontraron usuarios {busqueda ? `para "${busqueda}"` : ''} {filtroRol !== 'todos' ? `con rol "${filtroRol}"` : ''}
              </p>
              <p className="text-[11px] text-charcoal-400">
                Intenta buscar por otro término o restablece los filtros.
              </p>
              <button
                onClick={handleResetFiltros}
                className="mt-2 px-3 py-1 bg-sage-50 text-sage-700 border border-sage-200 rounded-full text-xs font-bold hover:bg-sage-100 transition-colors"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            usuariosFiltrados.map((usr) => {
              const isSelected = usuarioActual?.id === usr.id;
              return (
                <button
                  key={usr.id}
                  onClick={() => handleSelect(usr.id)}
                  className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left group ${
                    isSelected
                      ? 'bg-sage-50/90 border-sage-500 shadow-sm ring-1 ring-sage-400/50'
                      : 'bg-cream-50/70 hover:bg-cream-100/90 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={usr.avatar_url}
                      alt={usr.nombre_completo}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-charcoal-900 flex items-center gap-2 truncate">
                        <span className="truncate">{usr.nombre_completo}</span>
                        {isSelected && (
                          <span className="text-[9px] bg-sage-600 text-white px-2 py-0.5 rounded-full font-extrabold shrink-0">
                            ACTIVO
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-charcoal-500 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 shrink-0 text-charcoal-400" />
                        <span className="truncate">{usr.email}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[9px] font-bold bg-sage-100 text-sage-800 px-2 py-0.5 rounded-full border border-sage-200">
                          {usr.rol_nombre}
                        </span>
                        <span className="text-[9px] font-mono text-charcoal-500 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                          <Layers className="w-2.5 h-2.5 text-charcoal-400" /> {usr.area_nombre || 'CURSO'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <UserCheck className={`w-5 h-5 shrink-0 ml-2 ${isSelected ? 'text-sage-600' : 'text-stone-300 group-hover:text-stone-400'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-charcoal-800 text-xs font-bold rounded-full transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
