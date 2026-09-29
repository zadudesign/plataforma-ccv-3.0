'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, FolderKanban } from 'lucide-react';
import { ProyectoEspecial } from '@/types';

export interface SearchableProjectSelectProps {
  proyectos: ProyectoEspecial[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  placeholder?: string;
  accentColor?: 'sage' | 'amber';
  disabled?: boolean;
}

const normalizeText = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const SearchableProjectSelect: React.FC<SearchableProjectSelectProps> = ({
  proyectos,
  value,
  onChange,
  label = 'Proyecto Asociado',
  placeholder = 'Seleccionar proyecto...',
  accentColor = 'sage',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Ordenar los proyectos estrictamente por orden alfabético A-Z
  const sortedProyectos = useMemo(() => {
    return [...proyectos].sort((a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
    );
  }, [proyectos]);

  // Filtrar según el término de búsqueda (insensible a mayúsculas y acentos)
  const filteredProyectos = useMemo(() => {
    if (!searchTerm.trim()) return sortedProyectos;
    const term = normalizeText(searchTerm);
    return sortedProyectos.filter((p) =>
      normalizeText(p.nombre).includes(term)
    );
  }, [sortedProyectos, searchTerm]);

  // Proyecto actualmente seleccionado
  const selectedProject = useMemo(() => {
    return sortedProyectos.find((p) => p.id === value);
  }, [sortedProyectos, value]);

  // Enfocar el input de búsqueda cuando se abre el desplegable
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

  // Manejar clics fuera del componente para cerrarlo
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

  // Manejo de teclado (Escape, Enter, Flechas Arriba/Abajo)
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
        prev < filteredProyectos.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProyectos.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredProyectos.length) {
        handleSelect(filteredProyectos[highlightedIndex].id);
      } else if (filteredProyectos.length > 0) {
        handleSelect(filteredProyectos[0].id);
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
      ? 'focus:ring-amber-500 focus:border-amber-500 border-amber-300/80'
      : 'focus:ring-sage-500 focus:border-sage-500 border-stone-200';

  const selectedBadgeClass =
    accentColor === 'amber'
      ? 'bg-amber-50 text-amber-900 border-amber-200'
      : 'bg-sage-50 text-sage-900 border-sage-200';

  const activeIconColor =
    accentColor === 'amber' ? 'text-amber-600' : 'text-sage-600';

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block font-bold text-charcoal-800 text-xs">
            {label}
          </label>
          {sortedProyectos.length > 0 && (
            <span className="text-[10px] text-stone-400 font-medium">
              {sortedProyectos.length} proyecto{sortedProyectos.length !== 1 ? 's' : ''} (A-Z)
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
        className={`w-full p-3 rounded-xl border bg-white flex items-center justify-between gap-2 text-xs font-medium transition-all shadow-2xs hover:bg-stone-50/70 focus:outline-none focus:ring-2 ${ringColorClass} ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <FolderKanban className={`w-4 h-4 shrink-0 ${activeIconColor}`} />
          <span className={`truncate ${selectedProject ? 'text-charcoal-900 font-semibold' : 'text-stone-400'}`}>
            {selectedProject ? selectedProject.nombre : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-charcoal-700' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable con Buscador */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden animate-fadeIn">
          {/* Barra de Búsqueda */}
          <div className="p-2 border-b border-stone-100 bg-stone-50/60">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Escribe para buscar proyecto..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                className="w-full pl-8 pr-7 py-2 bg-white border border-stone-200 rounded-lg text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500 placeholder:text-stone-400"
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

          {/* Lista de Proyectos Ordenados */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto divide-y divide-stone-100/60 py-1"
          >
            {filteredProyectos.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs font-semibold text-stone-600">No se encontraron proyectos</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  No hay coincidencias para &quot;{searchTerm}&quot;
                </p>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      searchInputRef.current?.focus();
                    }}
                    className="mt-2 px-2.5 py-1 text-[11px] font-bold text-sage-700 bg-sage-50 hover:bg-sage-100 rounded-md transition-colors"
                  >
                    Ver todos los proyectos
                  </button>
                )}
              </div>
            ) : (
              filteredProyectos.map((proyecto, index) => {
                const isSelected = proyecto.id === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={proyecto.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(proyecto.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? selectedBadgeClass + ' font-bold'
                        : isHighlighted
                        ? 'bg-stone-50 text-charcoal-900'
                        : 'text-charcoal-800 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderKanban
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? activeIconColor : 'text-stone-400'
                        }`}
                      />
                      <span className="truncate">{proyecto.nombre}</span>
                    </div>

                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 shrink-0 ${activeIconColor}`} />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Informativo */}
          {filteredProyectos.length > 0 && (
            <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-medium">
              <span>
                {filteredProyectos.length} de {sortedProyectos.length} proyecto
                {sortedProyectos.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[9px] text-stone-400">Orden alfabético (A-Z)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
