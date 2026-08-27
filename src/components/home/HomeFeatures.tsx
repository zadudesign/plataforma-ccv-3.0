'use client';

import React from 'react';
import { 
  Layers, 
  Kanban, 
  Clock, 
  ShieldCheck, 
  FileSignature, 
  CalendarDays, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface HomeFeaturesProps {
  onOpenLogin: () => void;
}

export const HomeFeatures: React.FC<HomeFeaturesProps> = ({ onOpenLogin }) => {
  const pillars = [
    {
      id: 'modulos',
      icon: <Layers className="w-6 h-6 text-primary-600" />,
      tag: 'Estructura Institucional',
      title: 'Jerarquía y Árbol Académico',
      description: 'Organización multidimensional que agrupa Facultades, Programas de Pregrado y Posgrado, Cursos Virtuales y Proyectos Especiales de producción.',
      highlights: [
        'Organización por Decanaturas y Coordinaciones',
        'Cursos Virtuales con códigos institucionales',
        'Gestión de Proyectos Especiales con líderes designados'
      ],
      badgeBg: 'bg-primary-50 text-primary-700 border-primary-200'
    },
    {
      id: 'flujo',
      icon: <Kanban className="w-6 h-6 text-amber-600" />,
      tag: 'Flujo Operativo',
      title: 'Tableros Kanban & Asignación por Roles',
      description: 'Gestión ágil de tareas con asignación por rol operativo (Diseño Instruccional, Multimedia, Soporte, Docencia y Pares Evaluadores).',
      highlights: [
        'Estados: Por Iniciar, En Proceso, En Revisión y Completada',
        'Filtro dinámico de tareas según perfil del usuario',
        'Comentarios y retroalimentación en tiempo real'
      ],
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'productividad',
      icon: <Clock className="w-6 h-6 text-emerald-600" />,
      tag: 'Control de Horas',
      title: 'Productividad, Tarifas & Liquidación',
      description: 'Monitoreo riguroso de tiempo invertido, cálculo automatizado de honorarios según tarifas por categoría y supervisión de rendimiento.',
      highlights: [
        'Registro e imputación de horas por entregable',
        'Configuración de tarifas por roles y categorías',
        'Resumen de costos y valor devengado por colaborador'
      ],
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'seguridad',
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      tag: 'Seguridad & RBAC',
      title: 'Control de Acceso Jerárquico (6 Niveles)',
      description: 'Políticas de seguridad descendente donde cada rol visualiza estrictamente la información pertinente a su línea de mando y asignación.',
      highlights: [
        'Nivel 1 al 6: Desde Curso hasta Administrador Global',
        'Row Level Security (RLS) en base de datos PostgreSQL',
        'Simulador rápido de roles para auditoría administrativa'
      ],
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'firma',
      icon: <FileSignature className="w-6 h-6 text-rose-600" />,
      tag: 'Validación Oficial',
      title: 'Firma Digital y Trazabilidad',
      description: 'Registro de firmas digitales para garantizar la formalidad, autoría y validación en revisiones de cursos y proyectos especiales.',
      highlights: [
        'Panel de firma interactivo integrado',
        'Vinculación directa a perfiles de usuario',
        'Cumplimiento con estándares de calidad institucional'
      ],
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'calendario',
      icon: <CalendarDays className="w-6 h-6 text-cyan-600" />,
      tag: 'Planificación',
      title: 'Calendario y Fechas de Entrega',
      description: 'Visualización cronológica interactiva para supervisar hitos de producción, plazos de diseño y fechas críticas de lanzamiento.',
      highlights: [
        'Vista de calendario mensual organizada',
        'Semáforo de vencimientos y alertas de entrega',
        'Sincronización automática con las tareas asignadas'
      ],
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    }
  ];

  return (
    <section className="py-16 bg-cream-50/50 relative border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-extrabold uppercase tracking-wider border border-primary-200">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            Capacidades del Sistema
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            Pilares Estratégicos del Centro de Educación Virtual
          </h2>
          <p className="text-sm text-charcoal-600 font-medium">
            Una plataforma diseñada para optimizar los flujos académicos, acelerar la producción de contenidos virtuales y garantizar los más altos estándares de calidad institucional.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              id={pillar.id}
              className="ccv-card p-6 sm:p-7 bg-white flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group"
            >
              <div>
                {/* Header Icon & Tag */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-cream-50 border border-stone-200 group-hover:scale-105 transition-transform">
                    {pillar.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${pillar.badgeBg}`}>
                    {pillar.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-black text-charcoal-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-charcoal-600 font-medium leading-relaxed mb-5">
                  {pillar.description}
                </p>

                {/* Bullet Highlights */}
                <div className="space-y-2 pt-2 border-t border-stone-100 mb-6">
                  {pillar.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-charcoal-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action */}
              <button
                onClick={onOpenLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-cream-50 hover:bg-primary-50 text-charcoal-700 hover:text-primary-800 text-xs font-bold border border-stone-200 group-hover:border-primary-300 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Explorar en el Sistema</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 ccv-card p-8 sm:p-10 bg-gradient-to-r from-primary-800 via-primary-700 to-charcoal-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-none shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 z-10 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              ¿Listo para comenzar a trabajar?
            </h3>
            <p className="text-xs sm:text-sm text-primary-100/90 max-w-xl font-medium">
              Inicia sesión con tus credenciales institucionales para acceder a tu panel de tareas, cursos asignados y herramientas de producción.
            </p>
          </div>

          <button
            onClick={onOpenLogin}
            className="z-10 shrink-0 px-8 py-3.5 rounded-full bg-accent-500 hover:bg-accent-600 text-charcoal-900 font-extrabold text-xs shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 scale-100 hover:scale-105 active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Ingresar Ahora</span>
          </button>
        </div>

      </div>
    </section>
  );
};
