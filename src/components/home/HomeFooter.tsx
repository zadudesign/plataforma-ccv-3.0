'use client';

import React from 'react';
import { ShieldCheck, Mail, Globe, MapPin, Heart } from 'lucide-react';

interface HomeFooterProps {
  onOpenLogin: () => void;
}

export const HomeFooter: React.FC<HomeFooterProps> = ({ onOpenLogin }) => {
  return (
    <footer className="bg-charcoal-900 text-white pt-14 pb-8 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-charcoal-800">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-700 text-white flex items-center justify-center border border-primary-600">
                <ShieldCheck className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-tight">
                  Plataforma CCV 3.0
                </span>
                <p className="text-[11px] text-charcoal-400 font-medium">
                  Centro de Educación Virtual
                </p>
              </div>
            </div>
            <p className="text-xs text-charcoal-400 font-medium max-w-sm leading-relaxed">
              Ecosistema integral para la estructuración curricular, desarrollo instruccional, producción multimedia y auditoría de calidad de cursos virtuales.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Acceso a Colaboradores
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-200 mb-3">
              Módulos Principales
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-400 font-medium">
              <li>
                <a href="#modulos" className="hover:text-white transition-colors">
                  Árbol Académico Institucional
                </a>
              </li>
              <li>
                <a href="#flujo" className="hover:text-white transition-colors">
                  Tableros Kanban por Roles
                </a>
              </li>
              <li>
                <a href="#productividad" className="hover:text-white transition-colors">
                  Métricas de Productividad
                </a>
              </li>
              <li>
                <a href="#seguridad" className="hover:text-white transition-colors">
                  Control RBAC Nivel 1-6
                </a>
              </li>
            </ul>
          </div>

          {/* Contact / Institutional */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-200 mb-3">
              Soporte & Contacto
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-400 font-medium">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-500 shrink-0" />
                <span>ccv@universidad.edu.co</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-400 shrink-0" />
                <span>Portal de Educación Virtual</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Campus Universitario</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-charcoal-500 font-medium">
          <p>
            © {new Date().getFullYear()} Centro de Educación Virtual (CCV) • Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1 text-charcoal-400">
            <span>Diseñado con excelencia para la innovación educativa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
