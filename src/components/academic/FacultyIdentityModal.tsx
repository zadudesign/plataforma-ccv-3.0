'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Palette, Search, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Facultad, Area } from '@/types';
import { FACULTY_THEMES, POPULAR_LUCIDE_SUGGESTIONS, getFacultyTheme } from '@/lib/facultyThemes';
import { DynamicLucideIcon, resolveLucideIcon, getValidLucideIconName } from '@/components/common/DynamicLucideIcon';

interface FacultyIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultad?: Facultad | null;
  area?: Area | null;
  tipo?: 'facultad' | 'departamento';
  onSave: (id: string, color: string, icono: string) => Promise<void> | void;
}

export const FacultyIdentityModal: React.FC<FacultyIdentityModalProps> = ({
  isOpen,
  onClose,
  facultad,
  area,
  tipo = facultad ? 'facultad' : 'departamento',
  onSave,
}) => {
  const entidadActual = facultad || area;
  const esDepartamento = tipo === 'departamento' || (!facultad && !!area);

  const [selectedColor, setSelectedColor] = useState<string>(entidadActual?.color || (esDepartamento ? 'amber' : 'emerald'));
  const [selectedIconInput, setSelectedIconInput] = useState<string>(entidadActual?.icono || (esDepartamento ? 'FolderKanban' : 'Building2'));
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar cuando cambia la entidad seleccionada
  React.useEffect(() => {
    if (entidadActual) {
      setSelectedColor(entidadActual.color || (esDepartamento ? 'amber' : 'emerald'));
      setSelectedIconInput(entidadActual.icono || (esDepartamento ? 'FolderKanban' : 'Building2'));
    }
  }, [facultad, area, esDepartamento]);

  if (!isOpen || !entidadActual) return null;

  const currentTheme = getFacultyTheme(selectedColor);

  // Validar si el icono escrito existe en la librería Lucide
  const canonicalIconName = getValidLucideIconName(selectedIconInput);
  const isValidIcon = !!canonicalIconName;
  const displayIconName = canonicalIconName || selectedIconInput || (esDepartamento ? 'FolderKanban' : 'Building2');

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      const finalIcon = canonicalIconName || (esDepartamento ? 'FolderKanban' : 'Building2');
      await onSave(entidadActual.id, selectedColor, finalIcon);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold shadow-2xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-charcoal-900">
                  {esDepartamento ? 'Identidad Visual de Departamento' : 'Identidad Visual de Facultad'}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-sage-100 text-sage-800 px-2 py-0.5 rounded-md">
                  Personalización
                </span>
              </div>
              <p className="text-xs text-charcoal-500 truncate max-w-md">
                {entidadActual.nombre}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Previsualización en Vivo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-charcoal-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                Previsualización en Vivo ({esDepartamento ? 'Herencia a Proyectos' : 'Herencia a Programas y Cursos'})
              </label>
              <span className="text-[11px] font-bold text-charcoal-400">
                Visualización en la plataforma
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-3">
              {/* Preview Header */}
              <div className={`p-3.5 rounded-2xl border ${currentTheme.borderLight} bg-white flex items-center justify-between shadow-2xs border-l-4 ${currentTheme.borderLeft}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${currentTheme.iconBg} ${currentTheme.iconText} flex items-center justify-center font-bold shadow-2xs shrink-0`}>
                    <DynamicLucideIcon name={displayIconName} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-charcoal-900 truncate">{entidadActual.nombre}</h4>
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      {esDepartamento ? 'Departamento Institucional de Proyectos' : `Decano: ${facultad?.decano_nombre || 'Asignado'}`}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${currentTheme.badgeBg} ${currentTheme.badgeText} ${currentTheme.badgeBorder} shrink-0`}>
                  {currentTheme.name.split('&')[0]}
                </span>
              </div>

              {/* Preview Cards */}
              {esDepartamento ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className={`p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2 ${currentTheme.hoverBorder}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${currentTheme.iconBg} ${currentTheme.iconText} flex items-center justify-center font-bold shadow-2xs shrink-0 border ${currentTheme.badgeBorder}`}>
                          <DynamicLucideIcon name={displayIconName} className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${currentTheme.badgeBg} ${currentTheme.badgeText} border ${currentTheme.badgeBorder}`}>
                          PROYECTO CCV
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">En Proceso</span>
                    </div>
                    <p className="text-xs font-extrabold text-charcoal-900 line-clamp-1">
                      Plataforma Interactiva & Recursos Didácticos
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-charcoal-500">Progreso</span>
                        <span className={currentTheme.textPrimary}>65%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${currentTheme.progressFill}`} style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2 ${currentTheme.hoverBorder}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${currentTheme.iconBg} ${currentTheme.iconText} flex items-center justify-center font-bold shadow-2xs shrink-0 border ${currentTheme.badgeBorder}`}>
                          <DynamicLucideIcon name={displayIconName} className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${currentTheme.badgeBg} ${currentTheme.badgeText} border ${currentTheme.badgeBorder}`}>
                          PROYECTO CCV
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completado</span>
                    </div>
                    <p className="text-xs font-extrabold text-charcoal-900 line-clamp-1">
                      Banco Institucional de Objetos H5P
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-charcoal-500">Progreso</span>
                        <span className={currentTheme.textPrimary}>100%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${currentTheme.progressFill}`} style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className={`p-3 rounded-xl border border-stone-200 bg-white shadow-2xs border-l-4 ${currentTheme.borderLeft} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                        Programa Heredado
                      </span>
                      <span className={`text-[10px] font-bold ${currentTheme.textPrimary}`}>Coord. Asignado</span>
                    </div>
                    <p className="text-xs font-extrabold text-charcoal-800 line-clamp-1">
                      Diplomado / Especialización
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                        CCV-CUR-101
                      </span>
                      <span className="text-[10px] font-bold text-charcoal-400">En Producción</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-charcoal-500">Avance</span>
                        <span className={currentTheme.textPrimary}>80%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${currentTheme.progressFill}`} style={{ width: '80%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1. Selector de Color */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-charcoal-700 block">
                1. Selecciona el Color Distintivo (9 Paletas Únicas de Alto Contraste)
              </label>
              <span className="text-[11px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-200">
                Seleccionado: {currentTheme.name}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-1.5 border border-stone-100 rounded-2xl bg-stone-50/30">
              {Object.values(FACULTY_THEMES).map((tema) => {
                const isSelected = selectedColor === tema.id;
                return (
                  <button
                    key={tema.id}
                    type="button"
                    onClick={() => setSelectedColor(tema.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 relative ${
                      isSelected
                        ? `border-charcoal-900 bg-white shadow-sm ring-2 ring-charcoal-900/15`
                        : `border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50`
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: tema.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-charcoal-900 truncate">
                        {tema.name}
                      </div>
                      <div className="text-[10px] font-mono text-charcoal-400">
                        {tema.hex}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Entrada Directa de Ícono de Lucide con Reconocimiento Instantáneo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-charcoal-700 block">
                2. Ícono de Lucide Personalizado (Cualquier Ícono)
              </label>
              <a
                href="https://lucide.dev/icons"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-sage-700 hover:text-sage-900 flex items-center gap-1 hover:underline"
              >
                <span>Explorar catálogo oficial de Lucide</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Input y Preview del Icono */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Visual Preview Box */}
                <div className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 transition-all ${
                  isValidIcon 
                    ? `${currentTheme.bgLight} ${currentTheme.borderPrimary} ${currentTheme.textPrimary} shadow-xs` 
                    : 'bg-stone-100 border-dashed border-stone-300 text-stone-400'
                }`}>
                  <DynamicLucideIcon name={displayIconName} className="w-7 h-7" />
                </div>

                {/* Input Field */}
                <div className="flex-1 space-y-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="text"
                      placeholder="Escribe el nombre del ícono (ej: Sparkles, Video, Brain, Rocket, Atom, FolderKanban...)"
                      value={selectedIconInput}
                      onChange={(e) => setSelectedIconInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-bold text-charcoal-900 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 shadow-2xs"
                    />
                  </div>

                  {/* Recognition Status Badge */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    {isValidIcon ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ícono reconocido: <strong className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900">{canonicalIconName}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Ícono no encontrado en Lucide, usando por defecto.
                      </span>
                    )}
                    <span className="text-charcoal-400">Admite PascalCase, minúsculas o kebab-case</span>
                  </div>
                </div>
              </div>

              {/* Sugerencias Rápidas Populares (Chips de 1 clic) */}
              <div className="pt-2 border-t border-stone-200/70 space-y-1.5">
                <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block">
                  Sugerencias rápidas (Haz clic para aplicar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_LUCIDE_SUGGESTIONS.map((sug) => {
                    const isCurrent = (canonicalIconName || selectedIconInput).toLowerCase() === sug.toLowerCase();
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setSelectedIconInput(sug)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                          isCurrent
                            ? `${currentTheme.bgLight} ${currentTheme.borderPrimary} ${currentTheme.textPrimary} shadow-2xs font-extrabold`
                            : 'bg-white border-stone-200 text-charcoal-700 hover:bg-stone-100'
                        }`}
                      >
                        <DynamicLucideIcon name={sug} className="w-3.5 h-3.5" />
                        <span>{sug}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between">
          <div className="text-xs text-charcoal-500">
            Se aplicará a <strong className="text-charcoal-800">{entidadActual.nombre}</strong> y quedará alojado en Supabase.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-charcoal-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-extrabold text-white bg-sage-600 hover:bg-sage-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>Guardando...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aplicar Identidad</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
