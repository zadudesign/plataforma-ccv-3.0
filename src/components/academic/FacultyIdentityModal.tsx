'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Palette, Search, CheckCircle2 } from 'lucide-react';
import { Facultad } from '@/types';
import { FACULTY_THEMES, FACULTY_ICONS_LIST, getFacultyTheme } from '@/lib/facultyThemes';
import { DynamicLucideIcon } from '@/components/common/DynamicLucideIcon';

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
  const [selectedIcon, setSelectedIcon] = useState<string>(entidadActual?.icono || (esDepartamento ? 'FolderKanban' : 'Building2'));
  const [busquedaIcono, setBusquedaIcono] = useState<string>('');
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas');
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar cuando cambia la entidad seleccionada
  React.useEffect(() => {
    if (entidadActual) {
      setSelectedColor(entidadActual.color || (esDepartamento ? 'amber' : 'emerald'));
      setSelectedIcon(entidadActual.icono || (esDepartamento ? 'FolderKanban' : 'Building2'));
      setBusquedaIcono('');
      setCategoriaActiva('todas');
    }
  }, [facultad, area, esDepartamento]);

  if (!isOpen || !entidadActual) return null;

  const currentTheme = getFacultyTheme(selectedColor);

  const categorias = [
    'todas',
    'Institucional',
    'Ingeniería y TIC',
    'Salud y Vida',
    'Negocios y Finanzas',
    'Educación y Humanidades',
    'Artes y Diseño',
    'Ciencias'
  ];

  const iconosFiltrados = FACULTY_ICONS_LIST.filter(item => {
    const matchBusqueda = item.name.toLowerCase().includes(busquedaIcono.toLowerCase()) || 
                          item.label.toLowerCase().includes(busquedaIcono.toLowerCase());
    const matchCategoria = categoriaActiva === 'todas' || item.category === categoriaActiva;
    return matchBusqueda && matchCategoria;
  });

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      await onSave(entidadActual.id, selectedColor, selectedIcon);
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Previsualización en Vivo de la Herencia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-charcoal-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                Previsualización en Vivo ({esDepartamento ? 'Herencia a Proyectos del Departamento' : 'Herencia a Programas y Cursos'})
              </label>
              <span className="text-[11px] font-bold text-charcoal-400">
                Así se visualizará en la plataforma
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-3">
              {/* Preview Header */}
              <div className={`p-3.5 rounded-2xl border ${currentTheme.borderLight} bg-white flex items-center justify-between shadow-2xs border-l-4 ${currentTheme.borderLeft}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${currentTheme.iconBg} ${currentTheme.iconText} flex items-center justify-center font-bold shadow-2xs`}>
                    <DynamicLucideIcon name={selectedIcon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-charcoal-900">{entidadActual.nombre}</h4>
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      {esDepartamento ? 'Departamento Institucional de Proyectos' : `Decano: ${facultad?.decano_nombre || 'Asignado'}`}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${currentTheme.badgeBg} ${currentTheme.badgeText} ${currentTheme.badgeBorder}`}>
                  Identidad {currentTheme.name}
                </span>
              </div>

              {/* Preview Cards */}
              {esDepartamento ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className={`p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                        PROYECTO CCV
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">En Proceso</span>
                    </div>
                    <p className="text-xs font-extrabold text-charcoal-900 line-clamp-1">
                      Plataforma Interactiva & Recursos Didácticos
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-charcoal-500">Progreso Entregables</span>
                        <span className={currentTheme.textPrimary}>65%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${currentTheme.progressFill}`} style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                        PROYECTO CCV
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completado</span>
                    </div>
                    <p className="text-xs font-extrabold text-charcoal-900 line-clamp-1">
                      Banco Institucional de Objetos H5P
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-charcoal-500">Progreso Entregables</span>
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
                  {/* Preview Programa Card */}
                  <div className={`p-3 rounded-xl border border-stone-200 bg-white shadow-2xs border-l-4 ${currentTheme.borderLeft} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                        Programa Heredado
                      </span>
                      <span className={`text-[10px] font-bold ${currentTheme.textPrimary}`}>Coord. Asignado</span>
                    </div>
                    <p className="text-xs font-extrabold text-charcoal-800 line-clamp-1">
                      Especialización / Diplomado
                    </p>
                  </div>

                  {/* Preview Curso Card */}
                  <div className={`p-3 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                        CCV-MOD-101
                      </span>
                      <span className="text-[10px] font-bold text-charcoal-400">En Producción</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-charcoal-500">Avance</span>
                        <span className={currentTheme.textPrimary}>75%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${currentTheme.progressFill}`} style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1. Selector de Color */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-charcoal-700 block">
              1. Selecciona el Color Distintivo
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.values(FACULTY_THEMES).map((tema) => {
                const isSelected = selectedColor === tema.id;
                return (
                  <button
                    key={tema.id}
                    type="button"
                    onClick={() => setSelectedColor(tema.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 relative ${
                      isSelected
                        ? `border-charcoal-900 bg-white shadow-sm ring-2 ring-charcoal-900/10`
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
                      <div className="text-xs font-bold text-charcoal-900 truncate">
                        {tema.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-charcoal-400 truncate">
                        {tema.name.split(' ').slice(1).join(' ')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Selector de Ícono Lucide */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-charcoal-700 block">
                2. Selecciona el Ícono de Lucide
              </label>

              {/* Buscador de iconos */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  placeholder="Buscar icono..."
                  value={busquedaIcono}
                  onChange={(e) => setBusquedaIcono(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 w-full sm:w-48"
                />
              </div>
            </div>

            {/* Categorías de iconos */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaActiva(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    categoriaActiva === cat
                      ? 'bg-charcoal-800 text-white shadow-2xs'
                      : 'bg-stone-100 text-charcoal-600 hover:bg-stone-200'
                  }`}
                >
                  {cat === 'todas' ? 'Todos' : cat}
                </button>
              ))}
            </div>

            {/* Cuadrícula de Íconos */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-1 border border-stone-100 rounded-2xl bg-stone-50/30">
              {iconosFiltrados.map((item) => {
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 group ${
                      isSelected
                        ? `${currentTheme.bgLight} ${currentTheme.borderPrimary} text-charcoal-900 shadow-2xs ring-2 ring-sage-500/20`
                        : 'bg-white border-stone-200 hover:border-stone-300 text-charcoal-600 hover:bg-white'
                    }`}
                    title={item.label}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isSelected ? `${currentTheme.iconBg} ${currentTheme.iconText}` : 'bg-stone-100 text-charcoal-600'
                    }`}>
                      <DynamicLucideIcon name={item.name} className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-charcoal-700 truncate w-full">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between">
          <div className="text-xs text-charcoal-500">
            Se aplicará a <strong className="text-charcoal-800">{facultad.nombre}</strong> y toda su jerarquía.
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
