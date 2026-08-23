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
  hoverBorder: string;
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
    bgLight: 'bg-emerald-50/70',
    bgLightHover: 'hover:bg-emerald-100/60',
    borderLight: 'border-emerald-200',
    borderPrimary: 'border-emerald-500',
    hoverBorder: 'hover:border-emerald-500',
    borderLeft: 'border-l-emerald-600',
    textPrimary: 'text-emerald-700',
    textDark: 'text-emerald-900',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    progressFill: 'bg-emerald-600',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
  },
  blue: {
    id: 'blue',
    name: 'Azul Real',
    hex: '#2563EB',
    bgPrimary: 'bg-blue-600',
    bgLight: 'bg-blue-50/70',
    bgLightHover: 'hover:bg-blue-100/60',
    borderLight: 'border-blue-200',
    borderPrimary: 'border-blue-500',
    hoverBorder: 'hover:border-blue-500',
    borderLeft: 'border-l-blue-600',
    textPrimary: 'text-blue-700',
    textDark: 'text-blue-900',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    progressFill: 'bg-blue-600',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-700',
  },
  amber: {
    id: 'amber',
    name: 'Ámbar Negocios',
    hex: '#D97706',
    bgPrimary: 'bg-amber-600',
    bgLight: 'bg-amber-50/70',
    bgLightHover: 'hover:bg-amber-100/60',
    borderLight: 'border-amber-200',
    borderPrimary: 'border-amber-500',
    hoverBorder: 'hover:border-amber-500',
    borderLeft: 'border-l-amber-500',
    textPrimary: 'text-amber-700',
    textDark: 'text-amber-900',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    progressFill: 'bg-amber-600',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-800',
  },
  rose: {
    id: 'rose',
    name: 'Rosa Salud',
    hex: '#E11D48',
    bgPrimary: 'bg-rose-600',
    bgLight: 'bg-rose-50/70',
    bgLightHover: 'hover:bg-rose-100/60',
    borderLight: 'border-rose-200',
    borderPrimary: 'border-rose-500',
    hoverBorder: 'hover:border-rose-500',
    borderLeft: 'border-l-rose-600',
    textPrimary: 'text-rose-700',
    textDark: 'text-rose-900',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-300',
    progressFill: 'bg-rose-600',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
  },
  purple: {
    id: 'purple',
    name: 'Púrpura Humanidades',
    hex: '#7C3AED',
    bgPrimary: 'bg-purple-600',
    bgLight: 'bg-purple-50/70',
    bgLightHover: 'hover:bg-purple-100/60',
    borderLight: 'border-purple-200',
    borderPrimary: 'border-purple-500',
    hoverBorder: 'hover:border-purple-500',
    borderLeft: 'border-l-purple-600',
    textPrimary: 'text-purple-700',
    textDark: 'text-purple-900',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    progressFill: 'bg-purple-600',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-700',
  },
  cyan: {
    id: 'cyan',
    name: 'Cian Innovación',
    hex: '#0891B2',
    bgPrimary: 'bg-cyan-600',
    bgLight: 'bg-cyan-50/70',
    bgLightHover: 'hover:bg-cyan-100/60',
    borderLight: 'border-cyan-200',
    borderPrimary: 'border-cyan-500',
    hoverBorder: 'hover:border-cyan-500',
    borderLeft: 'border-l-cyan-600',
    textPrimary: 'text-cyan-700',
    textDark: 'text-cyan-900',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-300',
    progressFill: 'bg-cyan-600',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-700',
  },
  orange: {
    id: 'orange',
    name: 'Naranja Creativo',
    hex: '#EA580C',
    bgPrimary: 'bg-orange-600',
    bgLight: 'bg-orange-50/70',
    bgLightHover: 'hover:bg-orange-100/60',
    borderLight: 'border-orange-200',
    borderPrimary: 'border-orange-500',
    hoverBorder: 'hover:border-orange-500',
    borderLeft: 'border-l-orange-600',
    textPrimary: 'text-orange-700',
    textDark: 'text-orange-900',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-300',
    progressFill: 'bg-orange-600',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-700',
  },
  indigo: {
    id: 'indigo',
    name: 'Índigo Ciencias Sociales',
    hex: '#4F46E5',
    bgPrimary: 'bg-indigo-600',
    bgLight: 'bg-indigo-50/70',
    bgLightHover: 'hover:bg-indigo-100/60',
    borderLight: 'border-indigo-200',
    borderPrimary: 'border-indigo-500',
    hoverBorder: 'hover:border-indigo-500',
    borderLeft: 'border-l-indigo-600',
    textPrimary: 'text-indigo-700',
    textDark: 'text-indigo-900',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-300',
    progressFill: 'bg-indigo-600',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-700',
  },
  fuchsia: {
    id: 'fuchsia',
    name: 'Fucsia Multimedia',
    hex: '#C026D3',
    bgPrimary: 'bg-fuchsia-600',
    bgLight: 'bg-fuchsia-50/70',
    bgLightHover: 'hover:bg-fuchsia-100/60',
    borderLight: 'border-fuchsia-200',
    borderPrimary: 'border-fuchsia-500',
    hoverBorder: 'hover:border-fuchsia-500',
    borderLeft: 'border-l-fuchsia-600',
    textPrimary: 'text-fuchsia-700',
    textDark: 'text-fuchsia-900',
    badgeBg: 'bg-fuchsia-100',
    badgeText: 'text-fuchsia-800',
    badgeBorder: 'border-fuchsia-300',
    progressFill: 'bg-fuchsia-600',
    iconBg: 'bg-fuchsia-100',
    iconText: 'text-fuchsia-700',
  },
};

// Mapeo de alias o colores anteriores a la paleta oficial sin repeticiones
const COLOR_FALLBACKS: Record<string, string> = {
  sky: 'blue',
  teal: 'cyan',
  green: 'emerald',
  lime: 'emerald',
  red: 'rose',
  pink: 'fuchsia',
  violet: 'purple',
  yellow: 'amber',
  slate: 'indigo',
  zinc: 'indigo',
  stone: 'amber',
};

export function getFacultyTheme(colorKey?: string): FacultyThemeConfig {
  if (!colorKey) return FACULTY_THEMES.emerald;
  const normalized = colorKey.toLowerCase().trim();
  
  if (FACULTY_THEMES[normalized]) {
    return FACULTY_THEMES[normalized];
  }

  const alias = COLOR_FALLBACKS[normalized];
  if (alias && FACULTY_THEMES[alias]) {
    return FACULTY_THEMES[alias];
  }

  return FACULTY_THEMES.emerald;
}

export const POPULAR_LUCIDE_SUGGESTIONS = [
  'Building2',
  'Sparkles',
  'GraduationCap',
  'FolderKanban',
  'Layers',
  'Cpu',
  'Code2',
  'Video',
  'Film',
  'Palette',
  'HeartPulse',
  'Briefcase',
  'Globe',
  'Atom',
  'Brain',
  'Bot',
  'Rocket',
  'BookOpen',
  'Scale',
  'ShieldCheck',
];
