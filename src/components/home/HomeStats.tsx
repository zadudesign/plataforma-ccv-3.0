'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Activity 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchTareasDB } from '@/lib/supabaseService';
import { INITIAL_TAREAS } from '@/lib/mockData';

interface StatConfig {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badgeColor: string;
  borderColor: string;
}

export const HomeStats: React.FC = () => {
  const { programas, cursos, proyectos, usuarios } = useAuth();
  const [tareasCount, setTareasCount] = useState<number>(INITIAL_TAREAS.length);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Cargar el conteo real de tareas desde la base de datos Supabase
  useEffect(() => {
    let isMounted = true;
    const loadTareas = async () => {
      try {
        const dbTareas = await fetchTareasDB();
        if (isMounted && dbTareas && dbTareas.length > 0) {
          setTareasCount(dbTareas.length);
        }
      } catch (err) {
        console.warn('Error al cargar tareas para estadísticas de Home:', err);
      }
    };
    loadTareas();
    return () => {
      isMounted = false;
    };
  }, []);

  // Métricas idénticas al DashboardOverview
  const numProgramas = programas.length;
  const numCursos = cursos.length;
  const numProyectos = proyectos.length;
  const numTareas = tareasCount;
  const numDocentes = usuarios.filter(u => u.rol_nombre === 'Docente').length;
  const numParesEvaluadores = usuarios.filter(u => u.rol_nombre === 'Par Evaluador').length;

  const statsList: StatConfig[] = [
    {
      id: 'programas',
      label: 'Programas Académicos',
      sublabel: 'Pregrado y Posgrado vinculados',
      value: numProgramas,
      icon: <GraduationCap className="w-6 h-6" />,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-800',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      borderColor: 'hover:border-slate-400'
    },
    {
      id: 'cursos',
      label: 'Cursos Virtuales',
      sublabel: 'Aulas estructuradas y activas',
      value: numCursos,
      icon: <BookOpen className="w-6 h-6" />,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      borderColor: 'hover:border-sky-300'
    },
    {
      id: 'proyectos',
      label: 'Proyectos Especiales',
      sublabel: 'Producción audiovisual e I+D',
      value: numProyectos,
      icon: <FolderKanban className="w-6 h-6" />,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      borderColor: 'hover:border-amber-300'
    },
    {
      id: 'tareas',
      label: 'Tareas Monitoreadas',
      sublabel: 'Entregables con trazabilidad total',
      value: numTareas,
      icon: <CheckSquare className="w-6 h-6" />,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      borderColor: 'hover:border-sky-300'
    },
    {
      id: 'docentes',
      label: 'Docentes Activos',
      sublabel: 'Autores y creadores de contenido',
      value: numDocentes,
      icon: <Users className="w-6 h-6" />,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      borderColor: 'hover:border-violet-300'
    },
    {
      id: 'evaluadores',
      label: 'Pares Evaluadores',
      sublabel: 'Veeduría de calidad metodológica',
      value: numParesEvaluadores,
      icon: <UserCheck className="w-6 h-6" />,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderColor: 'hover:border-emerald-300'
    },
  ];

  const [counts, setCounts] = useState<number[]>(statsList.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.15 }
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

    const targetValues = statsList.map((item) => item.value);
    const duration = 1200; // 1.2 segundos de animación fluida
    const frameRate = 1000 / 60;
    const totalFrames = Math.max(Math.round(duration / frameRate), 1);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Curva cúbica suave ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts(
        targetValues.map((target) => {
          const currentVal = Math.round(easeOut * target);
          return currentVal > target ? target : currentVal;
        })
      );

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCounts(targetValues);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [hasAnimated, numProgramas, numCursos, numProyectos, numTareas, numDocentes, numParesEvaluadores]);

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
            Métricas institucionales consolidadas y sincronizadas en tiempo real con el panel general del Centro de Educación Virtual (CCV).
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsList.map((item, index) => {
            const currentCount = hasAnimated ? (counts[index] ?? item.value) : 0;
            const displayValue = currentCount.toLocaleString('es-CO');

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
                    <TrendingUp className="w-3.5 h-3.5 text-sky-500" /> Sincronización DB
                  </span>
                  <span className="font-semibold text-slate-600">CCV 3.0</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

