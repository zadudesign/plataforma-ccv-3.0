'use client';

import React from 'react';
import { 
  GitMerge, 
  FileCheck2, 
  Clock, 
  Users2, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PillarItem {
  id: string;
  number: string;
  title: string;
  principle: string;
  inPlatform: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  highlights: string[];
}

const PILLARS_DATA: PillarItem[] = [
  {
    id: 'descomposicion',
    number: '01',
    title: 'Descomposición Estructurada',
    principle: 'Ordenar sin fragmentar',
    inPlatform: 'Organización modular basada en arquitectura jerárquica con seguridad de visibilidad descendente estricta (RLS), asegurando que cada estamento opere en su jurisdicción sin saturación.',
    icon: <GitMerge className="w-6 h-6" />,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    highlights: [
      'Segmentación por Decanaturas, Programas, Cursos y Proyectos',
      'Políticas de Row Level Security (RLS) en PostgreSQL',
      'Reducción de sobrecarga cognitiva en cada rol operativo'
    ]
  },
  {
    id: 'trazabilidad',
    number: '02',
    title: 'Trazabilidad Cristalina',
    principle: 'Visibilidad sin ambigüedad',
    inPlatform: 'Bitácoras sincronizadas en tiempo real, trazabilidad de fases mediante tableros dinámicos y certificación de entregables mediante firmas digitales de autor y revisor.',
    icon: <FileCheck2 className="w-6 h-6" />,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    highlights: [
      'Auditoría continua de cambios y aprobaciones',
      'Módulo de firma digital criptográfica de autor y par',
      'Tableros Kanban sincronizados con comentarios en vivo'
    ]
  },
  {
    id: 'precision',
    number: '03',
    title: 'Precisión Operativa y Financiera',
    principle: 'Medición en tiempo real',
    inPlatform: 'Veeduría cronológica de plazos, temporizadores de precisión para registro de horas y cálculo automatizado de tarifas y costos operativos por perfil técnico.',
    icon: <Clock className="w-6 h-6" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    highlights: [
      'Imputación de horas dedicada por tarea y responsable',
      'Configuración de tarifas parametrizables por categoría',
      'Liquidación automática y estimación presupuestal'
    ]
  },
  {
    id: 'sinergia',
    number: '04',
    title: 'Sinergia Multidisciplinar',
    principle: 'Convergencia de talentos',
    inPlatform: 'Punto de encuentro unificado donde la pedagogía, la comunicación gráfica, la técnica audiovisual y la dirección académica dialogan en un único tablero operativo.',
    icon: <Users2 className="w-6 h-6" />,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badgeBg: 'bg-violet-50 text-violet-800 border-violet-200',
    highlights: [
      'Canales de co-creación y revisión interdisciplinaria',
      'Estandarización de entregables institucionales',
      'Interacción directa entre docentes, técnicos y directivos'
    ]
  }
];

interface HomePillarsProps {
  onOpenLogin: () => void;
}

export const HomePillars: React.FC<HomePillarsProps> = ({ onOpenLogin }) => {
  return (
    <section 
      id="pilares" 
      className="py-16 md:py-24 bg-slate-50 relative border-t border-slate-200/80 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
              Pilares Fundamentales
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Los Fundamentos de Nuestra Operación
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Principios convertidos en capacidades técnicas dentro de la plataforma.
          </p>
        </div>

        {/* 2x2 Grid of Premium Corporate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PILLARS_DATA.map((pillar) => (
            <div
              key={pillar.id}
              className="group relative bg-white rounded-3xl p-8 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Number + Principle Badge */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${pillar.iconBg} ${pillar.iconColor} group-hover:scale-105 transition-transform duration-200 shadow-2xs`}>
                      {pillar.icon}
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {pillar.number}
                    </span>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-extrabold border ${pillar.badgeBg} shadow-2xs`}>
                    Principio: &ldquo;{pillar.principle}&rdquo;
                  </div>
                </div>

                {/* Pillar Title */}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 group-hover:text-sky-700 transition-colors">
                  {pillar.title}
                </h3>

                {/* In Platform Description */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 mb-6">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    En la Plataforma:
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {pillar.inPlatform}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="space-y-2.5 mb-6">
                  {pillar.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action */}
              <button
                onClick={onOpenLogin}
                className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-bold border border-slate-200 hover:border-sky-300 transition-all flex items-center justify-center gap-2 group/btn"
              >
                <span>Acceder a las Funcionalidades</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-16 rounded-3xl p-8 sm:p-12 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-400 text-xs font-extrabold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Control Institucional Seguro
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Transforma la gestión de tus cursos y proyectos
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              Ingresa a PrismaLab para coordinar equipos, registrar tiempos, certificar entregables con firma digital y supervisar el avance curricular en tiempo real.
            </p>
          </div>

          <button
            onClick={onOpenLogin}
            className="z-10 shrink-0 px-8 py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-lg hover:shadow-sky-500/25 transition-all duration-200 flex items-center gap-2 scale-100 hover:scale-105 active:scale-95"
          >
            <span>Ingresar a la Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
