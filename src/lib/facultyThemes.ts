export interface FacultyThemeConfig {
  id: string;
  name: string;
  hex: string;
  // Clases Tailwind
  bgPrimary: string;
  bgLight: string;
  bgLightHover: string;
  borderLight: string;
  borderPrimary: string;
  borderLeft: string;
  textPrimary: string;
  textDark: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  progressFill: string;
  iconBg: string;
  iconText: string;
}

export const FACULTY_THEMES: Record<string, FacultyThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Esmeralda Institucional',
    hex: '#059669',
    bgPrimary: 'bg-emerald-600',
    bgLight: 'bg-emerald-50/60',
    bgLightHover: 'hover:bg-emerald-50/90',
    borderLight: 'border-emerald-100',
    borderPrimary: 'border-emerald-500',
    borderLeft: 'border-l-emerald-600',
    textPrimary: 'text-emerald-700',
    textDark: 'text-emerald-900',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    progressFill: 'bg-emerald-600',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
  },
  blue: {
    id: 'blue',
    name: 'Azul Tecnología e Ingeniería',
    hex: '#2563EB',
    bgPrimary: 'bg-blue-600',
    bgLight: 'bg-blue-50/60',
    bgLightHover: 'hover:bg-blue-50/90',
    borderLight: 'border-blue-100',
    borderPrimary: 'border-blue-500',
    borderLeft: 'border-l-blue-600',
    textPrimary: 'text-blue-700',
    textDark: 'text-blue-900',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    progressFill: 'bg-blue-600',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-700',
  },
  rose: {
    id: 'rose',
    name: 'Rosa Salud y Ciencias de la Vida',
    hex: '#E11D48',
    bgPrimary: 'bg-rose-600',
    bgLight: 'bg-rose-50/60',
    bgLightHover: 'hover:bg-rose-50/90',
    borderLight: 'border-rose-100',
    borderPrimary: 'border-rose-500',
    borderLeft: 'border-l-rose-600',
    textPrimary: 'text-rose-700',
    textDark: 'text-rose-900',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    progressFill: 'bg-rose-600',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
  },
  amber: {
    id: 'amber',
    name: 'Ámbar Negocios y Economía',
    hex: '#D97706',
    bgPrimary: 'bg-amber-600',
    bgLight: 'bg-amber-50/60',
    bgLightHover: 'hover:bg-amber-50/90',
    borderLight: 'border-amber-100',
    borderPrimary: 'border-amber-500',
    borderLeft: 'border-l-amber-600',
    textPrimary: 'text-amber-700',
    textDark: 'text-amber-900',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    progressFill: 'bg-amber-600',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
  },
  purple: {
    id: 'purple',
    name: 'Púrpura Humanidades y Educación',
    hex: '#7C3AED',
    bgPrimary: 'bg-purple-600',
    bgLight: 'bg-purple-50/60',
    bgLightHover: 'hover:bg-purple-50/90',
    borderLight: 'border-purple-100',
    borderPrimary: 'border-purple-500',
    borderLeft: 'border-l-purple-600',
    textPrimary: 'text-purple-700',
    textDark: 'text-purple-900',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    progressFill: 'bg-purple-600',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-700',
  },
  cyan: {
    id: 'cyan',
    name: 'Cian Diseño e Innovación',
    hex: '#0891B2',
    bgPrimary: 'bg-cyan-600',
    bgLight: 'bg-cyan-50/60',
    bgLightHover: 'hover:bg-cyan-50/90',
    borderLight: 'border-cyan-100',
    borderPrimary: 'border-cyan-500',
    borderLeft: 'border-l-cyan-600',
    textPrimary: 'text-cyan-700',
    textDark: 'text-cyan-900',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
    progressFill: 'bg-cyan-600',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-700',
  },
  indigo: {
    id: 'indigo',
    name: 'Índigo Ciencias Sociales y Jurídicas',
    hex: '#4F46E5',
    bgPrimary: 'bg-indigo-600',
    bgLight: 'bg-indigo-50/60',
    bgLightHover: 'hover:bg-indigo-50/90',
    borderLight: 'border-indigo-100',
    borderPrimary: 'border-indigo-500',
    borderLeft: 'border-l-indigo-600',
    textPrimary: 'text-indigo-700',
    textDark: 'text-indigo-900',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    progressFill: 'bg-indigo-600',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-700',
  },
  teal: {
    id: 'teal',
    name: 'Verde Azulado Ambiental y Bioética',
    hex: '#0D9488',
    bgPrimary: 'bg-teal-600',
    bgLight: 'bg-teal-50/60',
    bgLightHover: 'hover:bg-teal-50/90',
    borderLight: 'border-teal-100',
    borderPrimary: 'border-teal-500',
    borderLeft: 'border-l-teal-600',
    textPrimary: 'text-teal-700',
    textDark: 'text-teal-900',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    progressFill: 'bg-teal-600',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-700',
  },
  slate: {
    id: 'slate',
    name: 'Pizarra Interdisciplinaria',
    hex: '#475569',
    bgPrimary: 'bg-slate-600',
    bgLight: 'bg-slate-50/60',
    bgLightHover: 'hover:bg-slate-50/90',
    borderLight: 'border-slate-100',
    borderPrimary: 'border-slate-500',
    borderLeft: 'border-l-slate-600',
    textPrimary: 'text-slate-700',
    textDark: 'text-slate-900',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    progressFill: 'bg-slate-600',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-700',
  },
};

export function getFacultyTheme(colorKey?: string): FacultyThemeConfig {
  if (!colorKey) return FACULTY_THEMES.emerald;
  const normalized = colorKey.toLowerCase().trim();
  return FACULTY_THEMES[normalized] || FACULTY_THEMES.emerald;
}

export interface LucideIconOption {
  name: string;
  label: string;
  category: 'Ingeniería y TIC' | 'Salud y Vida' | 'Negocios y Finanzas' | 'Educación y Humanidades' | 'Artes y Diseño' | 'Ciencias' | 'Institucional';
}

export const FACULTY_ICONS_LIST: LucideIconOption[] = [
  // Institucional / General
  { name: 'Building2', label: 'Edificio / Institución', category: 'Institucional' },
  { name: 'GraduationCap', label: 'Birrete Académico', category: 'Institucional' },
  { name: 'Landmark', label: 'Facultad / Campus', category: 'Institucional' },
  { name: 'Award', label: 'Excelencia / Calidad', category: 'Institucional' },
  
  // Ingeniería y TIC
  { name: 'Cpu', label: 'Procesador / Hardware', category: 'Ingeniería y TIC' },
  { name: 'Binary', label: 'Datos / IA / Software', category: 'Ingeniería y TIC' },
  { name: 'Laptop', label: 'Informática / Sistemas', category: 'Ingeniería y TIC' },
  { name: 'Code', label: 'Programación', category: 'Ingeniería y TIC' },
  { name: 'Wrench', label: 'Mecánica / Obras', category: 'Ingeniería y TIC' },
  { name: 'Layers', label: 'Estructuras / Redes', category: 'Ingeniería y TIC' },
  
  // Salud y Vida
  { name: 'HeartPulse', label: 'Cardiología / Salud', category: 'Salud y Vida' },
  { name: 'Stethoscope', label: 'Medicina / Clínica', category: 'Salud y Vida' },
  { name: 'Activity', label: 'Signos / Enfermería', category: 'Salud y Vida' },
  { name: 'ShieldPlus', label: 'Salud Pública / Cuidado', category: 'Salud y Vida' },
  { name: 'Dna', label: 'Genética / Biología', category: 'Salud y Vida' },

  // Negocios y Finanzas
  { name: 'Briefcase', label: 'Administración / Negocios', category: 'Negocios y Finanzas' },
  { name: 'TrendingUp', label: 'Economía / Crecimiento', category: 'Negocios y Finanzas' },
  { name: 'BarChart3', label: 'Estadística / Finanzas', category: 'Negocios y Finanzas' },
  { name: 'PieChart', label: 'Marketing / Analítica', category: 'Negocios y Finanzas' },

  // Educación y Humanidades
  { name: 'BookOpen', label: 'Pedagogía / Lectura', category: 'Educación y Humanidades' },
  { name: 'BookMarked', label: 'Literatura / Historia', category: 'Educación y Humanidades' },
  { name: 'Scale', label: 'Derecho / Jurisprudencia', category: 'Educación y Humanidades' },
  { name: 'Globe', label: 'Idiomas / Relaciones', category: 'Educación y Humanidades' },
  { name: 'Lightbulb', label: 'Filosofía / Ideas', category: 'Educación y Humanidades' },

  // Artes y Diseño
  { name: 'Palette', label: 'Artes / Creatividad', category: 'Artes y Diseño' },
  { name: 'Sparkles', label: 'Animación / Medios', category: 'Artes y Diseño' },
  { name: 'Compass', label: 'Arquitectura / Trazado', category: 'Artes y Diseño' },
  { name: 'Film', label: 'Audiovisual / Cine', category: 'Artes y Diseño' },

  // Ciencias
  { name: 'Atom', label: 'Física / Cuántica', category: 'Ciencias' },
  { name: 'FlaskConical', label: 'Química / Laboratorio', category: 'Ciencias' },
  { name: 'Microscope', label: 'Investigación / Micro', category: 'Ciencias' },
];
