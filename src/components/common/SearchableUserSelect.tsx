'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, User, UserCheck, Filter, UserX } from 'lucide-react';
import { Usuario } from '@/types';

export interface SearchableUserSelectProps {
  usuarios: Usuario[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  icon?: React.ReactNode;
  areaBadge?: string;
  placeholder?: string;
  optional?: boolean;
  optionalLabel?: string;
  excludeUserId?: string;
  accentColor?: 'sage' | 'amber' | 'blue';
  disabled?: boolean;
}

const normalizeText = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const SearchableUserSelect: React.FC<SearchableUserSelectProps> = ({
  usuarios,
  value,
  onChange,
  label,
  icon,
  areaBadge,
  placeholder = 'Seleccionar responsable...',
  optional = false,
  optionalLabel = '-- Sin Asignar --',
  excludeUserId,
  accentColor = 'sage',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('todos');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filtrar si hay que excluir a un usuario (ej. si ya es el responsable principal)
  const availableUsers = useMemo(() => {
    if (!excludeUserId) return usuarios;
    return usuarios.filter((u) => u.id !== excludeUserId);
  }, [usuarios, excludeUserId]);

  // Lista dinámica de roles disponibles en los usuarios actuales
  const rolesDisponibles = useMemo(() => {
    const countMap = new Map<string, number>();
    availableUsers.forEach((u) => {
      const rol = u.rol_nombre?.trim() || 'General';
      countMap.set(rol, (countMap.get(rol) || 0) + 1);
    });

    return Array.from(countMap.entries())
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [availableUsers]);

  // Filtrado combinado por búsqueda (nombre, email, rol, área) y por rol seleccionado
  const filteredUsers = useMemo(() => {
    return availableUsers.filter((u) => {
      // Filtro por Rol
      if (selectedRole !== 'todos') {
        const userRol = u.rol_nombre?.trim() || 'General';
        if (userRol.toLowerCase() !== selectedRole.toLowerCase()) {
          return false;
        }
      }

      // Filtro por texto de búsqueda
      if (searchTerm.trim()) {
        const term = normalizeText(searchTerm);
        const matchName = normalizeText(u.nombre_completo).includes(term);
        const matchEmail = normalizeText(u.email || '').includes(term);
        const matchRole = normalizeText(u.rol_nombre || '').includes(term);
        const matchArea = normalizeText(u.area_nombre || '').includes(term);
        return matchName || matchEmail || matchRole || matchArea;
      }

      return true;
    });
  }, [availableUsers, selectedRole, searchTerm]);

  // Ordenar alfabéticamente por nombre completo
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      (a.nombre_completo || '').localeCompare(b.nombre_completo || '', 'es', { sensitivity: 'base' })
    );
  }, [filteredUsers]);

  // Usuario seleccionado
  const selectedUser = useMemo(() => {
    return usuarios.find((u) => u.id === value);
  }, [usuarios, value]);

  // Manejo de foco automático al abrir
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Cierre al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Atajos de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < sortedUsers.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : sortedUsers.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < sortedUsers.length) {
        handleSelect(sortedUsers[highlightedIndex].id);
      } else if (sortedUsers.length > 0) {
        handleSelect(sortedUsers[0].id);
      }
    }
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const ringColorClass =
    accentColor === 'amber'
      ? 'focus:ring-amber-500 focus:border-amber-500'
      : accentColor === 'blue'
      ? 'focus:ring-blue-500 focus:border-blue-500'
      : 'focus:ring-sage-500 focus:border-sage-500';

  const activeTextClass =
    accentColor === 'amber'
      ? 'text-amber-700'
      : accentColor === 'blue'
      ? 'text-blue-700'
      : 'text-sage-700';

  const selectedBgClass =
    accentColor === 'amber'
      ? 'bg-amber-50/80 text-amber-900 border-amber-200'
      : accentColor === 'blue'
      ? 'bg-blue-50/80 text-blue-900 border-blue-200'
      : 'bg-sage-50/80 text-sage-900 border-sage-200';

  const getInitials = (nombre: string) => {
    return (nombre || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Encabezado con Label y Badge de Área */}
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block font-bold text-charcoal-800 text-[11px] flex items-center gap-1">
            {icon || <User className="w-3.5 h-3.5 text-sage-700" />} {label}
          </label>
          {areaBadge && (
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                accentColor === 'blue'
                  ? 'text-blue-800 bg-blue-50 border-blue-200'
                  : 'text-sage-800 bg-sage-50 border-sage-200'
              }`}
            >
              {areaBadge}
            </span>
          )}
        </div>
      )}

      {/* Botón Disparador del Selector */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-2 text-xs font-medium transition-all shadow-2xs hover:bg-stone-50/70 focus:outline-none focus:ring-2 ${ringColorClass} ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedUser ? (
            <>
              {selectedUser.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedUser.avatar_url}
                  alt={selectedUser.nombre_completo}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${
                    accentColor === 'blue'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-sage-100 text-sage-800'
                  }`}
                >
                  {getInitials(selectedUser.nombre_completo)}
                </div>
              )}
              <span className="truncate text-charcoal-900 font-semibold">
                {selectedUser.nombre_completo}
              </span>
              <span className="text-[10px] text-stone-500 font-normal shrink-0">
                — {selectedUser.rol_nombre || 'Usuario'}
              </span>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="truncate text-stone-400 font-normal">
                {optional ? optionalLabel : placeholder}
              </span>
            </>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-charcoal-700' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden animate-fadeIn">
          {/* Barra de Búsqueda */}
          <div className="p-2 border-b border-stone-100 bg-stone-50/60">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por nombre, email o cargo..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500 placeholder:text-stone-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 p-1 text-stone-400 hover:text-stone-600 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro por Rol */}
          <div className="px-2.5 py-1.5 bg-stone-50/90 border-b border-stone-100 flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-600 shrink-0">
              <Filter className="w-3 h-3 text-sage-600" />
              <span>Filtrar Rol:</span>
            </div>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setHighlightedIndex(0);
              }}
              className="w-full py-1 px-2 text-xs bg-white border border-stone-200 rounded-md text-charcoal-800 font-semibold focus:outline-none focus:ring-1 focus:ring-sage-500 cursor-pointer shadow-2xs"
            >
              <option value="todos">Todos los roles ({availableUsers.length})</option>
              {rolesDisponibles.map((r) => (
                <option key={r.nombre} value={r.nombre}>
                  {r.nombre} ({r.count})
                </option>
              ))}
            </select>
          </div>

          {/* Lista de Usuarios Filtrados */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto divide-y divide-stone-100/60 py-1"
          >
            {/* Opción para desasignar (solo si es opcional) */}
            {optional && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                  !value
                    ? selectedBgClass + ' font-bold'
                    : 'text-stone-500 hover:bg-stone-50'
                }`}
              >
                <UserX className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate italic">{optionalLabel}</span>
                {!value && <Check className={`w-3.5 h-3.5 ml-auto shrink-0 ${activeTextClass}`} />}
              </button>
            )}

            {sortedUsers.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs font-semibold text-stone-600">No se encontraron responsables</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {searchTerm && selectedRole !== 'todos'
                    ? `No hay coincidencias para "${searchTerm}" en el rol "${selectedRole}"`
                    : searchTerm
                    ? `No hay coincidencias para "${searchTerm}"`
                    : `No hay usuarios registrados con el rol "${selectedRole}"`}
                </p>
                {(searchTerm || selectedRole !== 'todos') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRole('todos');
                      searchInputRef.current?.focus();
                    }}
                    className="mt-2 px-2.5 py-1 text-[11px] font-bold text-sage-700 bg-sage-50 hover:bg-sage-100 rounded-md transition-colors"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>
            ) : (
              sortedUsers.map((u, index) => {
                const isSelected = u.id === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={u.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(u.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? selectedBgClass + ' font-bold'
                        : isHighlighted
                        ? 'bg-stone-50 text-charcoal-900'
                        : 'text-charcoal-800 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatar_url}
                          alt={u.nombre_completo}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white shadow-2xs text-charcoal-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {getInitials(u.nombre_completo)}
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-semibold block truncate leading-tight">
                          {u.nombre_completo}
                        </span>
                        <span className="text-[10px] text-stone-500 block truncate">
                          {u.rol_nombre || 'Usuario'} • {u.area_nombre || 'CMU'}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 shrink-0 ${activeTextClass}`} />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Informativo */}
          {sortedUsers.length > 0 && (
            <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-medium">
              <span>
                {sortedUsers.length} de {availableUsers.length} usuario
                {sortedUsers.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[9px] text-stone-400">
                {selectedRole !== 'todos' ? `Filtrado por: ${selectedRole}` : 'A-Z'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
