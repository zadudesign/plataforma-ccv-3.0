import React from 'react';
import {
  Building2,
  GraduationCap,
  Landmark,
  Award,
  Cpu,
  Binary,
  Laptop,
  Code,
  Wrench,
  Layers,
  HeartPulse,
  Stethoscope,
  Activity,
  ShieldPlus,
  Dna,
  Briefcase,
  TrendingUp,
  BarChart3,
  PieChart,
  BookOpen,
  BookMarked,
  Scale,
  Globe,
  Lightbulb,
  Palette,
  Sparkles,
  Compass,
  Film,
  Atom,
  FlaskConical,
  Microscope,
  FolderKanban,
  LucideProps
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Building2,
  GraduationCap,
  Landmark,
  Award,
  Cpu,
  Binary,
  Laptop,
  Code,
  Wrench,
  Layers,
  HeartPulse,
  Stethoscope,
  Activity,
  ShieldPlus,
  Dna,
  Briefcase,
  TrendingUp,
  BarChart3,
  PieChart,
  BookOpen,
  BookMarked,
  Scale,
  Globe,
  Lightbulb,
  Palette,
  Sparkles,
  Compass,
  Film,
  Atom,
  FlaskConical,
  Microscope,
  FolderKanban,
};

interface DynamicLucideIconProps extends LucideProps {
  name?: string;
  fallbackName?: string;
}

export const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({
  name,
  fallbackName = 'Building2',
  ...props
}) => {
  const IconComponent = (name && ICON_MAP[name]) || ICON_MAP[fallbackName] || Building2;
  return <IconComponent {...props} />;
};
