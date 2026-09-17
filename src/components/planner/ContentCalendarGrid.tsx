'use client';

import React from 'react';
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Globe, 
  Share2, 
  Video, 
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { PublicacionParrilla, EstadoPublicacion, CanalPublicacion } from '@/types';

interface ContentCalendarGridProps {
  mesSeleccionado: string; // Formato YYYY-MM
  publicaciones: PublicacionParrilla[];
  onSelectPost: (post: PublicacionParrilla) => void;
  onAddOnDate: (fechaStr: string) => void;
}

// Helper para resolver ícono y color por Canal
export function getCanalVisualInfo(canal: CanalPublicacion) {
  switch (canal) {
    case 'Instagram':
      return { icon: Instagram, color: 'text-pink-600 bg-pink-50 border-pink-200' };
    case 'LinkedIn':
      return { icon: Linkedin, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'YouTube':
      return { icon: Youtube, color: 'text-red-600 bg-red-50 border-red-200' };
    case 'TikTok':
      return { icon: Video, color: 'text-slate-900 bg-slate-100 border-slate-300' };
    case 'Blog/Web':
      return { icon: Globe, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    case 'Moodle/Boletín':
      return { icon: Share2, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    default:
      return { icon: Share2, color: 'text-slate-600 bg-slate-50 border-slate-200' };
  }
}

// Helper de estilos por Estado según Paleta PrismaLab
export function getEstadoBadgeStyle(estado: EstadoPublicacion) {
  switch (estado) {
    case 'Borrador':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'En Diseño':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'En Revisión':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Aprobado':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'Programado':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Publicado':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

// Verifica si un contenido está atrasado
export function esContenidoAtrasado(post: PublicacionParrilla): boolean {
  if (post.estado === 'Publicado' || post.estado === 'Programado' || post.estado === 'Aprobado') {
    return false;
  }
  const fechaPost = new Date(post.fecha_publicacion);
  const hoy = new Date();
  return fechaPost < hoy;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ContentCalendarGrid: React.FC<ContentCalendarGridProps> = ({
  mesSeleccionado,
  publicaciones,
  onSelectPost,
  onAddOnDate,
}) => {
  const [anio, mesNum] = mesSeleccionado.split('-').map(Number);
  const primerDiaMes = new Date(anio, mesNum - 1, 1);
  const ultimoDiaMes = new Date(anio, mesNum, 0);

  const numDiasMes = ultimoDiaMes.getDate();
  // En JS getDay() es 0=Domingo, 1=Lunes. Lo convertimos a 0=Lunes, 6=Domingo
  const diaSemanaInicio = (primerDiaMes.getDay() + 6) % 7;

  const hoyStr = new Date().toISOString().split('T')[0];

  // Construir celdas del calendario
  const celdas = [];

  // Días previos del mes anterior
  const mesAnteriorUltimoDia = new Date(anio, mesNum - 1, 0).getDate();
  for (let i = diaSemanaInicio - 1; i >= 0; i--) {
    const diaNum = mesAnteriorUltimoDia - i;
    const mesPrevStr = mesNum === 1 ? `${anio - 1}-12` : `${anio}-${String(mesNum - 1).padStart(2, '0')}`;
    const fechaCompleta = `${mesPrevStr}-${String(diaNum).padStart(2, '0')}`;
    celdas.push({
      fechaStr: fechaCompleta,
      diaNumero: diaNum,
      esMesActual: false,
      esHoy: fechaCompleta === hoyStr
    });
  }

  // Días del mes actual
  for (let d = 1; d <= numDiasMes; d++) {
    const diaStr = String(d).padStart(2, '0');
    const fechaCompleta = `${mesSeleccionado}-${diaStr}`;
    celdas.push({
      fechaStr: fechaCompleta,
      diaNumero: d,
      esMesActual: true,
      esHoy: fechaCompleta === hoyStr
    });
  }

  // Días posteriores para completar la última semana
  const celdasRestantes = (7 - (celdas.length % 7)) % 7;
  for (let d = 1; d <= celdasRestantes; d++) {
    const mesSigStr = mesNum === 12 ? `${anio + 1}-01` : `${anio}-${String(mesNum + 1).padStart(2, '0')}`;
    const fechaCompleta = `${mesSigStr}-${String(d).padStart(2, '0')}`;
    celdas.push({
      fechaStr: fechaCompleta,
      diaNumero: d,
      esMesActual: false,
      esHoy: fechaCompleta === hoyStr
    });
  }

  // Agrupar publicaciones por fecha (YYYY-MM-DD)
  const postsPorFecha: Record<string, PublicacionParrilla[]> = {};
  publicaciones.forEach(pub => {
    const fKey = pub.fecha_publicacion ? pub.fecha_publicacion.split('T')[0] : '';
    if (fKey) {
      if (!postsPorFecha[fKey]) postsPorFecha[fKey] = [];
      postsPorFecha[fKey].push(pub);
    }
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Cabecera de Días de la Semana */}
      <div className="grid grid-cols-7 bg-slate-100/80 border-b border-slate-200 text-center text-xs font-black text-slate-700 py-3">
        {DIAS_SEMANA.map((dia, idx) => (
          <div key={dia} className={`${idx >= 5 ? 'text-slate-400' : ''}`}>
            <span className="hidden sm:inline">{dia}</span>
            <span className="sm:hidden">{dia.substring(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Cuadrícula de Días */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-xs">
        {celdas.map((celda) => {
          const postsDelDia = postsPorFecha[celda.fechaStr] || [];

          return (
            <div
              key={celda.fechaStr}
              className={`min-h-[140px] p-2 flex flex-col justify-between transition-colors group relative ${
                !celda.esMesActual 
                  ? 'bg-slate-50/40 text-slate-400' 
                  : celda.esHoy 
                  ? 'bg-sky-50/30' 
                  : 'bg-white hover:bg-slate-50/60'
              }`}
            >
              {/* Encabezado del Día */}
              <div className="flex items-center justify-between pb-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    celda.esHoy
                      ? 'bg-sky-600 text-white shadow-xs font-black'
                      : celda.esMesActual
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {celda.diaNumero}
                </span>

                {/* Botón rápido para agregar en esa fecha */}
                <button
                  onClick={() => onAddOnDate(celda.fechaStr)}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-slate-200/80 hover:bg-sky-600 hover:text-white text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title={`Añadir publicación el ${celda.fechaStr}`}
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              </div>

              {/* Lista de Publicaciones en el día */}
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[160px] scrollbar-thin">
                {postsDelDia.map((post) => {
                  const canalInfo = getCanalVisualInfo(post.canal);
                  const CanalIcon = canalInfo.icon;
                  const estaAtrasado = esContenidoAtrasado(post);
                  const badgeEstado = getEstadoBadgeStyle(post.estado);

                  return (
                    <div
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className={`p-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-98 ${
                        estaAtrasado
                          ? 'bg-rose-50/90 border-rose-300 text-rose-900 ring-1 ring-rose-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                      title={`${post.titulo} • ${post.canal} (${post.formato}) - ${post.estado}`}
                    >
                      {/* Fila 1: Canal y Alerta de Atrasado */}
                      <div className="flex items-center justify-between gap-1 pb-1">
                        <div className="flex items-center gap-1">
                          <span className={`p-0.5 rounded-md border text-[9px] font-bold flex items-center gap-0.5 ${canalInfo.color}`}>
                            <CanalIcon className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[55px]">{post.canal}</span>
                          </span>
                        </div>

                        {estaAtrasado ? (
                          <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-100 border border-rose-300 px-1 rounded flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Atrasado
                          </span>
                        ) : (
                          <span className={`text-[9px] font-bold px-1 rounded border truncate max-w-[65px] ${badgeEstado}`}>
                            {post.estado}
                          </span>
                        )}
                      </div>

                      {/* Título recortado */}
                      <p className="font-extrabold line-clamp-2 leading-tight text-slate-900">
                        {post.titulo}
                      </p>

                      {/* Hora y Formato */}
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-100/80 mt-1">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          {post.fecha_publicacion ? post.fecha_publicacion.split('T')[1]?.substring(0, 5) : '10:00'}
                        </span>
                        <span className="truncate max-w-[60px] font-medium text-slate-600">
                          {post.formato}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pie de celda si está vacía */}
              {postsDelDia.length === 0 && (
                <div className="h-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
