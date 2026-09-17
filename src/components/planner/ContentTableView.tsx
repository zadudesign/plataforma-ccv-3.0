'use client';

import React from 'react';
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Link as LinkIcon, 
  FolderKanban, 
  BookOpen, 
  CheckSquare
} from 'lucide-react';
import { PublicacionParrilla, EstadoPublicacion } from '@/types';
import { getCanalVisualInfo, getEstadoBadgeStyle, esContenidoAtrasado } from './ContentCalendarGrid';

interface ContentTableViewProps {
  publicaciones: PublicacionParrilla[];
  onSelectPost: (post: PublicacionParrilla) => void;
  onDeletePost: (id: string) => void;
  filtroEstadoRapido: string;
  setFiltroEstadoRapido: (estado: string) => void;
}

export const ContentTableView: React.FC<ContentTableViewProps> = ({
  publicaciones,
  onSelectPost,
  onDeletePost,
  filtroEstadoRapido,
  setFiltroEstadoRapido,
}) => {
  // Conteo de publicaciones por estado
  const conteos = {
    todos: publicaciones.length,
    Borrador: publicaciones.filter(p => p.estado === 'Borrador').length,
    'En Diseño': publicaciones.filter(p => p.estado === 'En Diseño').length,
    'En Revisión': publicaciones.filter(p => p.estado === 'En Revisión').length,
    Aprobado: publicaciones.filter(p => p.estado === 'Aprobado').length,
    Programado: publicaciones.filter(p => p.estado === 'Programado').length,
    Publicado: publicaciones.filter(p => p.estado === 'Publicado').length,
    atrasados: publicaciones.filter(p => esContenidoAtrasado(p)).length,
  };

  const formatearFechaHora = (fechaIso: string) => {
    try {
      const d = new Date(fechaIso);
      if (isNaN(d.getTime())) return fechaIso;
      return d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaIso;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
      {/* Chips de Conteo y Filtro Rápido en la Cabecera */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs">
        <button
          onClick={() => setFiltroEstadoRapido('todos')}
          className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
            filtroEstadoRapido === 'todos' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todos ({conteos.todos})
        </button>

        {conteos.atrasados > 0 && (
          <button
            onClick={() => setFiltroEstadoRapido('atrasados')}
            className={`px-3 py-1.5 rounded-full font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer animate-pulse ${
              filtroEstadoRapido === 'atrasados'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Atrasados ({conteos.atrasados})</span>
          </button>
        )}

        {(['En Diseño', 'En Revisión', 'Programado', 'Publicado', 'Borrador'] as EstadoPublicacion[]).map(est => {
          const count = conteos[est] || 0;
          return (
            <button
              key={est}
              onClick={() => setFiltroEstadoRapido(est)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                filtroEstadoRapido === est
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {est} ({count})
            </button>
          );
        })}
      </div>

      {/* Tabla Estructurada */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <th className="p-3.5">Fecha / Hora</th>
              <th className="p-3.5">Canal</th>
              <th className="p-3.5">Formato</th>
              <th className="p-3.5">Tema / Título & Copy</th>
              <th className="p-3.5">Responsable</th>
              <th className="p-3.5">Entidad Académica</th>
              <th className="p-3.5">Estado</th>
              <th className="p-3.5">Recursos</th>
              <th className="p-3.5">Tarea CCV</th>
              <th className="p-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {publicaciones.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-slate-400 font-semibold">
                  No se encontraron publicaciones en el mes y filtros seleccionados.
                </td>
              </tr>
            ) : (
              publicaciones.map((post) => {
                const canalInfo = getCanalVisualInfo(post.canal);
                const CanalIcon = canalInfo.icon;
                const badgeEstado = getEstadoBadgeStyle(post.estado);
                const estaAtrasado = esContenidoAtrasado(post);

                return (
                  <tr 
                    key={post.id} 
                    className={`hover:bg-slate-50/70 transition-colors ${
                      estaAtrasado ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Fecha y Hora */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900">
                        {formatearFechaHora(post.fecha_publicacion)}
                      </div>
                      {estaAtrasado && (
                        <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded-md inline-flex items-center gap-1 mt-0.5 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" /> Atrasado
                        </span>
                      )}
                    </td>

                    {/* Canal */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1.5 ${canalInfo.color}`}>
                        <CanalIcon className="w-3 h-3" />
                        <span>{post.canal}</span>
                      </span>
                    </td>

                    {/* Formato */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {post.formato}
                      </span>
                    </td>

                    {/* Tema / Título & Copy */}
                    <td className="p-3.5 max-w-xs">
                      <div 
                        onClick={() => onSelectPost(post)}
                        className="font-extrabold text-slate-900 hover:text-sky-600 transition-colors cursor-pointer truncate"
                      >
                        {post.titulo}
                      </div>
                      {post.descripcion && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                          {post.descripcion}
                        </p>
                      )}
                    </td>

                    {/* Responsable */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[9px]">
                          {post.responsable_nombre?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-slate-800 truncate max-w-[110px]">
                          {post.responsable_nombre || 'Sin Asignar'}
                        </span>
                      </div>
                    </td>

                    {/* Entidad Académica */}
                    <td className="p-3.5 max-w-[130px] truncate">
                      {post.curso_nombre ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md truncate max-w-full">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span className="truncate">{post.curso_nombre}</span>
                        </span>
                      ) : post.proyecto_nombre ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md truncate max-w-full">
                          <FolderKanban className="w-3 h-3 shrink-0" />
                          <span className="truncate">{post.proyecto_nombre}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">General CCV</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeEstado}`}>
                        {post.estado}
                      </span>
                    </td>

                    {/* Recursos */}
                    <td className="p-3.5 whitespace-nowrap">
                      {post.link_recursos ? (
                        <a
                          href={post.link_recursos.startsWith('http') ? post.link_recursos : `https://${post.link_recursos}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition-all border border-slate-200 shadow-2xs"
                          title="Abrir carpeta de recursos en Google Drive o Figma"
                        >
                          <LinkIcon className="w-3 h-3 text-sky-600" />
                          <span>Ver</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Sin link</span>
                      )}
                    </td>

                    {/* Tarea CCV vinculada */}
                    <td className="p-3.5 whitespace-nowrap">
                      {post.tarea_vinculada_id ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Vinculada
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectPost(post)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
                          title="Editar publicación"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la publicación "${post.titulo}"?`)) {
                              onDeletePost(post.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Eliminar publicación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
