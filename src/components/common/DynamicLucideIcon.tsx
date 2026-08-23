import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps, Building2 } from 'lucide-react';

interface DynamicLucideIconProps extends LucideProps {
  name?: string;
  fallbackName?: string;
}

/**
 * Normaliza y resuelve cualquier nombre de icono de Lucide (PascalCase, camelCase o kebab-case).
 * Retorna el componente del icono o null si no se encuentra.
 */
export const resolveLucideIcon = (name?: string): React.ComponentType<LucideProps> | null => {
  if (!name || typeof name !== 'string') return null;

  const raw = name.trim();
  if (!raw) return null;

  const iconsRecord = LucideIcons as unknown as Record<string, unknown>;

  // 1. Coincidencia directa exacta
  if (iconsRecord[raw] && typeof iconsRecord[raw] === 'object' || typeof iconsRecord[raw] === 'function') {
    return iconsRecord[raw] as React.ComponentType<LucideProps>;
  }

  // 2. Convertir kebab-case o snake_case a PascalCase (ej: 'building-2' -> 'Building2', 'file_text' -> 'FileText')
  const pascal = raw
    .split(/[-_\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  if (iconsRecord[pascal] && (typeof iconsRecord[pascal] === 'object' || typeof iconsRecord[pascal] === 'function')) {
    return iconsRecord[pascal] as React.ComponentType<LucideProps>;
  }

  // 3. Capitalizar primera letra (ej: 'sparkles' -> 'Sparkles')
  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
  if (iconsRecord[capitalized] && (typeof iconsRecord[capitalized] === 'object' || typeof iconsRecord[capitalized] === 'function')) {
    return iconsRecord[capitalized] as React.ComponentType<LucideProps>;
  }

  // 4. Búsqueda insensible a mayúsculas/minúsculas en el diccionario
  const cleanSearch = raw.replace(/[-_\s]/g, '').toLowerCase();
  const matchedKey = Object.keys(LucideIcons).find(k => k.toLowerCase() === cleanSearch);
  if (matchedKey && iconsRecord[matchedKey] && (typeof iconsRecord[matchedKey] === 'object' || typeof iconsRecord[matchedKey] === 'function')) {
    return iconsRecord[matchedKey] as React.ComponentType<LucideProps>;
  }

  return null;
};

/**
 * Retorna el nombre canónico en PascalCase de un icono si es válido en Lucide.
 */
export const getValidLucideIconName = (name?: string): string | null => {
  if (!name || typeof name !== 'string') return null;
  const raw = name.trim();
  if (!raw) return null;

  const iconsRecord = LucideIcons as unknown as Record<string, unknown>;

  if (iconsRecord[raw] && (typeof iconsRecord[raw] === 'object' || typeof iconsRecord[raw] === 'function')) {
    return raw;
  }

  const pascal = raw
    .split(/[-_\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  if (iconsRecord[pascal] && (typeof iconsRecord[pascal] === 'object' || typeof iconsRecord[pascal] === 'function')) {
    return pascal;
  }

  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
  if (iconsRecord[capitalized] && (typeof iconsRecord[capitalized] === 'object' || typeof iconsRecord[capitalized] === 'function')) {
    return capitalized;
  }

  const cleanSearch = raw.replace(/[-_\s]/g, '').toLowerCase();
  const matchedKey = Object.keys(LucideIcons).find(k => k.toLowerCase() === cleanSearch);
  if (matchedKey && iconsRecord[matchedKey] && (typeof iconsRecord[matchedKey] === 'object' || typeof iconsRecord[matchedKey] === 'function')) {
    return matchedKey;
  }

  return null;
};

export const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({
  name,
  fallbackName = 'Building2',
  ...props
}) => {
  const IconComponent = resolveLucideIcon(name) || resolveLucideIcon(fallbackName) || Building2;
  return <IconComponent {...props} />;
};
