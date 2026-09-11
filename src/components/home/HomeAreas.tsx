'use client';

import React from 'react';
import { 
  Palette, 
  Sparkles, 
  Video, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

interface AreaItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tag: string;
  tagColor: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
  capabilities: string[];
}

const AREAS_DATA: AreaItem[] = [
  {
    id: 'diseno',
    name: 'DISEÑO',
    subtitle: 'Identidad y Comunicación Visual',
    description: 'Conceptualización visual, diagramación instruccional y materialización estética de contenidos. Transforma directrices curriculares en piezas gráficas institucionales de alto impacto y rigor estético.',
    tag: 'Branding & Layout',
    tagColor: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: <Palette className="w-6 h-6" />,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    accentBorder: 'hover:border-sky-400 group-hover:shadow-sky-100/50',
    capabilities: [
      'Identidad gráfica y manual de estilo',
      'Diagramación instruccional y guías de aprendizaje',
      'Infografías y recursos editoriales interactivos'
    ]
  },
  {
    id: 'multimedia',
    name: 'MULTIMEDIA',
    subtitle: 'Experiencia Didáctica e Interactiva',
    description: 'Creación de recursos didácticos interactivos y gamificación alineados con las necesidades pedagógicas. Integra criterios de accesibilidad, usabilidad (UI/UX) y dinamización visual mediante animación digital.',
    tag: 'UI/UX & Animación',
    tagColor: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: <Sparkles className="w-6 h-6" />,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    accentBorder: 'hover:border-violet-400 group-hover:shadow-violet-100/50',
    capabilities: [
      'Objetos virtuales de aprendizaje (OVA/SCORM)',
      'Animación 2D/3D y microinteracciones didácticas',
      'Gamificación y diseño de experiencias UI/UX'
    ]
  },
  {
    id: 'produccion',
    name: 'PRODUCCIÓN',
    subtitle: 'Célula Audiovisual & Streaming',
    description: 'Gestión y operación integral del estudio de grabación, rodaje, postproducción y masterización de audio y video. Responsable de transmisiones en directo, cubrimiento de eventos y estándares de emisión profesional.',
    tag: 'Audio, Video & Set',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <Video className="w-6 h-6" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    accentBorder: 'hover:border-amber-400 group-hover:shadow-amber-100/50',
    capabilities: [
      'Estudio de grabación con croma y set profesional',
      'Postproducción de video, locución y masterización',
      'Streaming institucional y micro-clases audiovisuales'
    ]
  },
  {
    id: 'soporte',
    name: 'SOPORTE',
    subtitle: 'Calidad, Orientación & Cumplimiento',
    description: 'Veeduría activa y asesoría metodológica continua. Brinda acompañamiento pedagógico y técnico a docentes y directivos para asegurar que cada entregable cumpla con los estándares de acreditación institucional.',
    tag: 'QA & Asesoría',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <ShieldCheck className="w-6 h-6" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    accentBorder: 'hover:border-emerald-400 group-hover:shadow-emerald-100/50',
    capabilities: [
      'Control de calidad curricular y metodológico',
      'Asesoría técnica y pedagógica a docentes autores',
      'Veeduría de cumplimiento y tiempos de entrega'
    ]
  },
  {
    id: 'desarrollo',
    name: 'DESARROLLO',
    subtitle: 'Innovación & Tecnologías Emergentes',
    description: 'Investigación aplicada sobre nuevas tendencias en tecnología educativa, arquitecturas web e inteligencia artificial. Desarrolla soluciones técnicas adaptativas ante los nuevos retos del ecosistema digital.',
    tag: 'I+D & Tech',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: <Cpu className="w-6 h-6" />,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    accentBorder: 'hover:border-indigo-400 group-hover:shadow-indigo-100/50',
    capabilities: [
      'Arquitecturas web escalables y microservicios',
      'Integraciones con IA aplicada a educación',
      'Herramientas analíticas y automatización de procesos'
    ]
  }
];

export const HomeAreas: React.FC = () => {
  return (
    <section 
      id="areas" 
      className="py-16 md:py-24 bg-white relative border-t border-slate-200/80 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 shadow-2xs">
            <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
              Equipo Especializado
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Un Ecosistema Articulado por Especialidades
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Cinco frentes coordinados bajo un mismo flujo de trabajo técnico y pedagógico.
          </p>
        </div>

        {/* 5-Area Grid: 3 on top row, 2 centered on bottom row for desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AREAS_DATA.map((area, index) => {
            const isLastTwo = index >= 3;
            return (
              <div
                key={area.id}
                className={`group relative bg-slate-50/70 hover:bg-white rounded-2xl p-7 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 ${
                  isLastTwo ? 'lg:col-span-1 lg:last:col-span-1' : ''
                } ${area.accentBorder}`}
              >
                <div>
                  {/* Top: Icon + Tag */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`p-3 rounded-xl ${area.iconBg} ${area.iconColor} group-hover:scale-105 transition-transform duration-200 shadow-2xs`}>
                      {area.icon}
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${area.tagColor} shadow-2xs`}>
                      {area.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                        {area.name}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                      {area.subtitle}
                    </h4>
                  </div>

                  {/* Main Description */}
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                    {area.description}
                  </p>

                  {/* Capability Bullets */}
                  <div className="space-y-2 pt-4 border-t border-slate-200/70">
                    <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                      Capacidades Clave
                    </div>
                    {area.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500">PrismaLab Operativo</span>
                  <span className="text-sky-600 font-bold group-hover:underline">Área Integrada</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
