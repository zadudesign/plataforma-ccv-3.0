'use client';

import React from 'react';
import { ShieldCheck, LogIn, Mail, Globe, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface HomeFooterProps {
  onOpenLogin: () => void;
}

export const HomeFooter: React.FC<HomeFooterProps> = ({ onOpenLogin }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Slogan Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-sm">
                <span className="font-black text-xl text-sky-400">P</span>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Prisma<span className="text-sky-400">Lab</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 font-extrabold text-[10px] border border-sky-800">
                  v3.0 Enterprise
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold italic text-sky-300">
              &ldquo;Proyectos complejos, resultados claros&rdquo;
            </p>

            <p className="text-xs text-slate-400 font-medium max-w-md leading-relaxed">
              Entorno institucional y tecnológico para la estructuración curricular, desarrollo instruccional, producción multimedia, veeduría y control de tiempos de proyectos educativos virtuales.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-sm hover:shadow-sky-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar a la Plataforma</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <button 
                  onClick={() => scrollToSection('inicio')} 
                  className="hover:text-white transition-colors"
                >
                  Inicio & Quiénes Somos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('estadisticas')} 
                  className="hover:text-white transition-colors"
                >
                  Estadísticas en Tiempo Real
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('areas')} 
                  className="hover:text-white transition-colors"
                >
                  Áreas Especializadas (5 Frentes)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('pilares')} 
                  className="hover:text-white transition-colors"
                >
                  Los 4 Pilares de PrismaLab
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional Contact */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">
              Contacto & Soporte
            </h4>
            <ul className="space-y-3 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>prismalab@universidad.edu.co</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Centro de Educación Virtual (CCV)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Campus Universitario</span>
              </li>
              <li className="flex items-center gap-2.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[11px] text-slate-400">Seguridad RLS & Auditoría Criptográfica</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>
            © {new Date().getFullYear()} PrismaLab • Centro de Educación Virtual (CCV). Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Diseñado con rigor metodológico para la excelencia académica y técnica</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
