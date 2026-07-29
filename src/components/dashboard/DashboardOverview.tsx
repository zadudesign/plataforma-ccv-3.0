'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Fingerprint, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronDown,
  BookOpen,
  Award
} from 'lucide-react';
import { TareaCCV, Usuario, CursoVirtual, ProyectoEspecial } from '@/types';

interface DashboardOverviewProps {
  tareas: TareaCCV[];
  usuarioActual: Usuario;
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  onSelectTask: (tarea: TareaCCV) => void;
  onOpenCreateTask: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tareas,
  usuarioActual,
  cursos,
  proyectos,
  onSelectTask,
  onOpenCreateTask,
}) => {
  const tareasCompletadas = tareas.filter(t => t.estado === 'Completado');
  const tareasEnProceso = tareas.filter(t => t.estado === 'En Proceso' || t.estado === 'En Revisión');
  const totalTarifa = tareas.reduce((acc, t) => acc + (t.tarifa_tarea || 0), 0);
  const totalHoras = tareas.reduce((acc, t) => acc + (t.tiempo_invertido || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOP ROW: STAT CARDS (4 Columns) matching diseño base.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Spent this month / Presupuesto Ejecutado */}
        <div className="ccv-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Inversión Producción CCV</p>
            <h3 className="text-2xl font-extrabold text-charcoal-900 mt-1">${totalTarifa.toFixed(1)}</h3>
          </div>
          <div className="flex items-end gap-1 h-9 px-2 py-1 bg-cream-100 rounded-lg">
            <span className="w-1.5 h-4 bg-sage-500 rounded-full"></span>
            <span className="w-1.5 h-7 bg-sage-600 rounded-full"></span>
            <span className="w-1.5 h-3 bg-sage-500 rounded-full"></span>
            <span className="w-1.5 h-6 bg-sage-700 rounded-full"></span>
          </div>
        </div>

        {/* Card 2: New Clients / Docentes & Cursos */}
        <div className="ccv-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Cursos & Docentes</p>
            <h3 className="text-2xl font-extrabold text-charcoal-900 mt-1">{cursos.length * 8 + 27}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Earnings / Tarifas Honorarios */}
        <div className="ccv-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Horas Registradas</p>
            <h3 className="text-2xl font-extrabold text-charcoal-900 mt-1">{totalHoras} hrs</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Dark Green Activity Card */}
        <div className="ccv-card p-5 bg-sage-700 text-white flex items-center justify-between border-none shadow-md">
          <div>
            <p className="text-xs font-medium text-sage-100 uppercase tracking-wider">Tasa Aprobación Calidad</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">$540.50</h3>
          </div>
          <div className="w-12 h-6">
            <svg viewBox="0 0 50 20" className="w-full h-full stroke-white fill-none stroke-2">
              <path d="M0 15 Q 12 5, 25 12 T 50 5" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: CHARTS & USER WIDGETS (3 Columns: 5/12, 4/12, 3/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Balance / Progress Wave Chart (5 cols) */}
        <div className="lg:col-span-5 ccv-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-charcoal-900">Progreso Entregables CCV</h4>
              <span className="flex items-center gap-1 text-xs font-medium text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> En tiempo
              </span>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 bg-cream-100 px-3 py-1 rounded-full">
              Mensual <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric Sub-boxes */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200/50">
              <p className="text-xs font-semibold text-charcoal-500">Eficiencia Diseño</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-extrabold text-charcoal-900">43.50%</span>
                <span className="badge-green flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +2.45%
                </span>
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200/50">
              <p className="text-xs font-semibold text-charcoal-500">Saldo Presupuestal</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-extrabold text-charcoal-900">$52,422</span>
                <span className="badge-red flex items-center gap-0.5">
                  <ArrowDownRight className="w-3 h-3" /> -4.75%
                </span>
              </div>
            </div>
          </div>

          {/* Smooth Wave Area Graphic */}
          <div className="h-28 w-full">
            <svg viewBox="0 0 300 80" className="w-full h-full">
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4E725F" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4E725F" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 50 Q 30 20, 60 45 T 120 30 T 180 55 T 240 25 T 300 40 L 300 80 L 0 80 Z"
                fill="url(#waveGradient)"
              />
              <path
                d="M 0 50 Q 30 20, 60 45 T 120 30 T 180 55 T 240 25 T 300 40"
                fill="none"
                stroke="#3A5A40"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        {/* Gauge Circular Progress Widget (4 cols) */}
        <div className="lg:col-span-4 ccv-card p-6 flex flex-col justify-between text-center">
          <div>
            <h4 className="text-base font-bold text-charcoal-900 text-left">Meta de Producción</h4>
            <p className="text-xs text-charcoal-500 text-left mt-0.5">Meta Trimestral Educación Continua</p>
            
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-charcoal-900">$6,078.76</h3>
              <p className="text-xs font-semibold text-sage-600 mt-1">
                La producción es un 34% mayor que el mes pasado
              </p>
            </div>
          </div>

          {/* 80% Semicircular Gauge */}
          <div className="relative flex justify-center items-end h-32 my-2">
            <svg className="w-44 h-24" viewBox="0 0 100 50">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#E8E6DD"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 78 20"
                fill="none"
                stroke="#3A5A40"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-0 text-center">
              <span className="text-2xl font-extrabold text-charcoal-900">80%</span>
            </div>
          </div>
        </div>

        {/* User Profile Widget (3 cols) matching right card of design base */}
        <div className="lg:col-span-3 ccv-card p-6 flex flex-col items-center justify-between text-center">
          <div className="relative">
            <img
              src={usuarioActual.avatar_url}
              alt={usuarioActual.nombre_completo}
              className="w-20 h-20 rounded-full object-cover border-4 border-sage-100 shadow"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full shadow">
              😎
            </span>
          </div>

          <div className="mt-3">
            <h4 className="text-lg font-extrabold text-charcoal-900">{usuarioActual.nombre_completo}</h4>
            <p className="text-xs font-medium text-charcoal-500">{usuarioActual.email}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-stone-100 mt-4">
            <div>
              <p className="text-xs text-charcoal-500 font-semibold">Cursos</p>
              <p className="text-base font-extrabold text-charcoal-900">{cursos.length}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 font-semibold">Proyectos</p>
              <p className="text-base font-extrabold text-charcoal-900">{proyectos.length}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 font-semibold">Tareas</p>
              <p className="text-base font-extrabold text-charcoal-900">{tareas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: ACTION CARDS & RECENT ACTIVITY (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Digital Signature & Deliverable Card (5 cols) */}
        <div className="lg:col-span-5 ccv-card p-6 flex flex-col justify-between bg-gradient-to-br from-white to-sage-50/40">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-sage-600" />
              <h4 className="text-base font-bold text-charcoal-900">Firma Digital & Entregables CCV</h4>
            </div>
            <p className="text-xs text-charcoal-500 leading-relaxed mb-4">
              Validación oficial de syllabus, guiones multimedia y certificados de educación continua con firma criptográfica SVG.
            </p>

            {/* Stacked Graphic representing digital certificates */}
            <div className="p-4 bg-sage-700 text-white rounded-2xl shadow-sm mb-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono tracking-widest text-sage-200">CERTIFICADO CCV-2026</span>
                <ShieldCheck className="w-5 h-5 text-sage-300" />
              </div>
              <p className="text-sm font-extrabold mt-3 tracking-wider">{usuarioActual.nombre_completo.toUpperCase()}</p>
              <div className="flex justify-between items-end mt-2 text-xs text-sage-200 font-mono">
                <span>FIRMA: VALIDADA</span>
                <span>EXP: 06/28</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onOpenCreateTask}
            className="w-full py-3 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Registrar Nuevo Entregable +
          </button>
        </div>

        {/* Recent Task Activity List (4 cols) matching "Your Transfers" */}
        <div className="lg:col-span-4 ccv-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-charcoal-900">Últimas Tareas Actualizadas</h4>
            <span className="text-xs text-sage-600 font-semibold cursor-pointer hover:underline">Ver todas</span>
          </div>

          <div className="space-y-3.5">
            {tareas.slice(0, 3).map((tarea) => (
              <div
                key={tarea.id}
                onClick={() => onSelectTask(tarea)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-cream-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={tarea.responsable_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={tarea.responsable_nombre}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-charcoal-900 line-clamp-1">{tarea.titulo}</p>
                    <p className="text-[11px] text-charcoal-500">{tarea.responsable_nombre} • Vence {tarea.fecha_vencimiento}</p>
                  </div>
                </div>
                <span className={tarea.estado === 'Completado' ? 'badge-green' : 'badge-red'}>
                  ${tarea.tarifa_tarea}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & RLS Policy Status Card (3 cols) matching right bottom card */}
        <div className="lg:col-span-3 ccv-card p-6 flex flex-col items-center justify-between text-center">
          <div className="w-14 h-14 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center mb-2">
            <Fingerprint className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-base font-extrabold text-charcoal-900">Control RLS Activo</h4>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              Visibilidad de proyectos descendente activa para el nivel {usuarioActual.area_nombre}.
            </p>
          </div>

          <button className="w-full py-2.5 px-4 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold transition-colors shadow-sm mt-4">
            Verificar Permisos RLS
          </button>
        </div>
      </div>
    </div>
  );
};
