'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Activity 
} from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  suffix: string;
  formattedDisplay: (val: number) => string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badgeColor: string;
  borderColor: string;
}

const STATS_DATA: StatItem[] = [
  {
    id: 'programas',
    label: 'Programas Académicos',
    sublabel: 'Pregrado y Posgrado vinculados',
    value: 24,
    suffix: '+',
    formattedDisplay: (v) => `${v}+`,
    icon: <GraduationCap className="w-6 h-6" />,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    borderColor: 'hover:border-sky-300'
  },
  {
    id: 'cursos',
    label: 'Cursos Virtuales',
    sublabel: 'Aulas estructuradas y activas',
    value: 180,
    suffix: '+',
    formattedDisplay: (v) => `${v}+`,
    icon: <BookOpen className="w-6 h-6" />,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    borderColor: 'hover:border-indigo-300'
  },
  {
    id: 'proyectos',
    label: 'Proyectos Especiales',
    sublabel: 'Producción audiovisual e I+D',
    value: 45,
    suffix: '+',
    formattedDisplay: (v) => `${v}+`,
    icon: <Layers className="w-6 h-6" />,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    borderColor: 'hover:border-violet-300'
  },
  {
    id: 'tareas',
    label: 'Tareas Monitoreadas',
    sublabel: 'Entregables con trazabilidad total',
    value: 1250,
    suffix: '+',
    formattedDisplay: (v) => `${v.toLocaleString('es-CO')}+`,
    icon: <CheckCircle2 className="w-6 h-6" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderColor: 'hover:border-emerald-300'
  },
  {
    id: 'docentes',
    label: 'Docentes Activos',
    sublabel: 'Autores y creadores de contenido',
    value: 95,
    suffix: '+',
    formattedDisplay: (v) => `${v}+`,
    icon: <Users className="w-6 h-6" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: 'hover:border-amber-300'
  },
  {
    id: 'evaluadores',
    label: 'Pares Evaluadores',
    sublabel: 'Veeduría de calidad metodológica',
    value: 18,
    suffix: '+',
    formattedDisplay: (v) => `${v}+`,
    icon: <UserCheck className="w-6 h-6" />,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    borderColor: 'hover:border-cyan-300'
  },
];

export const HomeStats: React.FC = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<number[]>(STATS_DATA.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 1800; // 1.8 seconds animation
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Smooth ease-out cubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts(
        STATS_DATA.map((item) => {
          const currentVal = Math.round(easeOut * item.value);
          return currentVal > item.value ? item.value : currentVal;
        })
      );

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCounts(STATS_DATA.map((item) => item.value));
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [hasAnimated]);

  return (
    <section 
      id="estadisticas" 
      ref={sectionRef} 
      className="py-16 md:py-20 bg-slate-50 relative border-t border-slate-200/80 scroll-mt-24"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-64 bg-gradient-to-r from-sky-100/30 via-slate-200/40 to-violet-100/30 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
            <Activity className="w-4 h-4 text-sky-600 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
              Operación y Cobertura en Vivo
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Estadísticas en Tiempo Real
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Métricas consolidadas de proyectos, cursos y talento que operan activamente dentro del ecosistema institucional de PrismaLab.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATS_DATA.map((item, index) => {
            const currentCount = counts[index] || 0;
            const displayValue = item.formattedDisplay(currentCount);

            return (
              <div
                key={item.id}
                className={`group relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${item.borderColor}`}
              >
                <div>
                  {/* Top Bar: Icon & Live Active Indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${item.iconBg} ${item.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                      {item.icon}
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>En Operación</span>
                    </div>
                  </div>

                  {/* Main Metric Value */}
                  <div className="mb-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                      {displayValue}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="text-base font-extrabold text-slate-800 mb-1 group-hover:text-sky-700 transition-colors">
                    {item.label}
                  </h3>
                  
                  {/* Sublabel */}
                  <p className="text-xs text-slate-500 font-medium">
                    {item.sublabel}
                  </p>
                </div>

                {/* Bottom subtle progress line */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1 text-slate-500">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-500" /> Veeduría Continua
                  </span>
                  <span className="font-semibold text-slate-600">Sincronizado</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
