'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  ExternalLink, 
  Calendar, 
  Clock, 
  FileText, 
  Layers, 
  Share2, 
  User, 
  BookOpen, 
  FolderKanban, 
  Link as LinkIcon, 
  CheckSquare, 
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  PublicacionParrilla, 
  EstadoPublicacion, 
  CanalPublicacion, 
  FormatoPublicacion, 
  CursoVirtual, 
  ProyectoEspecial, 
  Usuario 
} from '@/types';

interface ContentModalProps {
  publicacionAEditar?: PublicacionParrilla | null;
  fechaPreseleccionada?: string; // Formato YYYY-MM-DD
  onClose: () => void;
  onSave: (data: Omit<PublicacionParrilla, 'id'>, crearTareaCCV: boolean) => Promise<void>;
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  usuarios: Usuario[];
  usuarioActual: Usuario | null;
}

const CANALES_DISPONIBLES: CanalPublicacion[] = [
  'Instagram',
  'LinkedIn',
  'YouTube',
  'TikTok',
  'Blog/Web',
  'Moodle/Boletín',
  'Facebook',
  'Otro'
];

const FORMATOS_DISPONIBLES: FormatoPublicacion[] = [
  'Reel/Video',
  'Carrusel',
  'Post Estático',
  'Historia',
  'Artículo',
  'Podcast',
  'Infografía'
];

const ESTADOS_DISPONIBLES: EstadoPublicacion[] = [
  'Borrador',
  'En Diseño',
  'En Revisión',
  'Aprobado',
  'Programado',
  'Publicado'
];

export const ContentModal: React.FC<ContentModalProps> = ({
  publicacionAEditar,
  fechaPreseleccionada,
  onClose,
  onSave,
  cursos,
  proyectos,
  usuarios,
  usuarioActual,
}) => {
  // Helper para convertir ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
  const getFechaLocalStr = (fechaIso?: string, fechaDefault?: string) => {
    if (fechaIso) {
      const d = new Date(fechaIso);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }
    if (fechaDefault) {
      return `${fechaDefault}T10:00`;
    }
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T10:00`;
  };

  const [titulo, setTitulo] = useState(publicacionAEditar?.titulo || '');
  const [descripcion, setDescripcion] = useState(publicacionAEditar?.descripcion || '');
  const [fechaHora, setFechaHora] = useState(getFechaLocalStr(publicacionAEditar?.fecha_publicacion, fechaPreseleccionada));
  const [canal, setCanal] = useState<CanalPublicacion>(publicacionAEditar?.canal || 'Instagram');
  const [formato, setFormato] = useState<FormatoPublicacion>(publicacionAEditar?.formato || 'Post Estático');
  const [estado, setEstado] = useState<EstadoPublicacion>(publicacionAEditar?.estado || 'Borrador');
  const [responsableId, setResponsableId] = useState(publicacionAEditar?.responsable_id || usuarioActual?.id || '');
  const [tipoAsociacion, setTipoAsociacion] = useState<'ninguno' | 'curso' | 'proyecto'>(
    publicacionAEditar?.curso_id ? 'curso' : publicacionAEditar?.proyecto_id ? 'proyecto' : 'ninguno'
  );
  const [cursoId, setCursoId] = useState(publicacionAEditar?.curso_id || '');
  const [proyectoId, setProyectoId] = useState(publicacionAEditar?.proyecto_id || '');
  const [linkRecursos, setLinkRecursos] = useState(publicacionAEditar?.link_recursos || '');
  const [notasInternas, setNotasInternas] = useState(publicacionAEditar?.notas_internas || '');
  const [crearTareaCCV, setCrearTareaCCV] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMsg('El título o tema del contenido es requerido.');
      return;
    }
    if (!fechaHora) {
      setErrorMsg('La fecha y hora de publicación es requerida.');
      return;
    }

    setGuardando(true);
    setErrorMsg(null);

    try {
      const mesCalc = fechaHora.substring(0, 7);
      const respUser = usuarios.find(u => u.id === responsableId);
      const cursoObj = cursos.find(c => c.id === cursoId);
      const proyObj = proyectos.find(p => p.id === proyectoId);

      const payload: Omit<PublicacionParrilla, 'id'> = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha_publicacion: new Date(fechaHora).toISOString(),
        mes_planeado: mesCalc,
        canal,
        formato,
        estado,
        link_recursos: linkRecursos.trim() || undefined,
        responsable_id: responsableId || undefined,
        responsable_nombre: respUser?.nombre_completo,
        curso_id: tipoAsociacion === 'curso' ? cursoId || undefined : undefined,
        curso_nombre: tipoAsociacion === 'curso' ? cursoObj?.nombre : undefined,
        proyecto_id: tipoAsociacion === 'proyecto' ? proyectoId || undefined : undefined,
        proyecto_nombre: tipoAsociacion === 'proyecto' ? proyObj?.nombre : undefined,
        tarea_vinculada_id: publicacionAEditar?.tarea_vinculada_id,
        notas_internas: notasInternas.trim() || undefined
      };

      await onSave(payload, crearTareaCCV);
      onClose();
    } catch (err: any) {
      console.error('Error al guardar publicación:', err);
      setErrorMsg(err?.message || 'Ocurrió un error al guardar la publicación.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="ccv-card w-full max-w-2xl bg-white max-h-[92vh] overflow-y-auto flex flex-col justify-between shadow-floating border-stone-300 rounded-3xl">
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-start bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>{publicacionAEditar ? 'Editar Publicación' : 'Nueva Publicación Editorial'}</span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Parrilla PrismaLab
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Planifica y programa contenidos institucionales y de facultades.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Título o Tema del post */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
              Tema / Título del Contenido *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Lanzamiento Diplomado en IA, 5 Tips Didácticos Moodle..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Fecha y Hora de Publicación + Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                Fecha y Hora Prevista *
              </label>
              <input
                type="datetime-local"
                value={fechaHora}
                onChange={e => setFechaHora(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                Estado del Contenido *
              </label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as EstadoPublicacion)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {ESTADOS_DISPONIBLES.map(est => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Canal y Formato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                Canal / Red Social *
              </label>
              <select
                value={canal}
                onChange={e => setCanal(e.target.value as CanalPublicacion)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {CANALES_DISPONIBLES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
                Formato del Contenido *
              </label>
              <select
                value={formato}
                onChange={e => setFormato(e.target.value as FormatoPublicacion)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {FORMATOS_DISPONIBLES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Copy / Descripción base */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
              Copy / Guión o Texto Base del Post
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Escribe el copy con emojis, hashtags o el guión para el reel/carrusel..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Responsable del contenido */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
              Responsable de Producción / Edición
            </label>
            <select
              value={responsableId}
              onChange={e => setResponsableId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Sin Asignar</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo} ({u.rol_nombre || 'Equipo'})
                </option>
              ))}
            </select>
          </div>

          {/* Asociación Académica: Curso o Proyecto Especial */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                Vincular a Entidad Académica:
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTipoAsociacion('ninguno')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${tipoAsociacion === 'ninguno' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setTipoAsociacion('curso')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${tipoAsociacion === 'curso' ? 'bg-sky-600 text-white' : 'text-slate-600'}`}
                >
                  Curso
                </button>
                <button
                  type="button"
                  onClick={() => setTipoAsociacion('proyecto')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${tipoAsociacion === 'proyecto' ? 'bg-amber-600 text-white' : 'text-slate-600'}`}
                >
                  Proyecto
                </button>
              </div>
            </div>

            {tipoAsociacion === 'curso' && (
              <select
                value={cursoId}
                onChange={e => setCursoId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Selecciona el Curso Virtual...</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.facultad_nombre || 'General'})
                  </option>
                ))}
              </select>
            )}

            {tipoAsociacion === 'proyecto' && (
              <select
                value={proyectoId}
                onChange={e => setProyectoId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecciona el Proyecto Especial...</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Enlace a Recursos Externos (Google Drive / Figma) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                Enlace a Recursos (Drive / Figma / Canva)
              </label>
              {linkRecursos && (
                <a
                  href={linkRecursos.startsWith('http') ? linkRecursos : `https://${linkRecursos}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <span>Probar enlace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type="url"
                value={linkRecursos}
                onChange={e => setLinkRecursos(e.target.value)}
                placeholder="https://drive.google.com/... o https://figma.com/..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Notas internas del equipo */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-1">
              Notas Internas de Producción (Opcional)
            </label>
            <input
              type="text"
              value={notasInternas}
              onChange={e => setNotasInternas(e.target.value)}
              placeholder="Instrucciones al diseñador, especificaciones técnicas, correcciones..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Vinculación con Tareas CCV (Requisito confirmado por usuario) */}
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="chk-vincular-tarea"
              checked={crearTareaCCV || Boolean(publicacionAEditar?.tarea_vinculada_id)}
              disabled={Boolean(publicacionAEditar?.tarea_vinculada_id)}
              onChange={e => setCrearTareaCCV(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="chk-vincular-tarea" className="cursor-pointer select-none">
              <span className="font-extrabold text-sky-950 block">
                {publicacionAEditar?.tarea_vinculada_id 
                  ? '✅ Vinculada con Tarea de Producción CCV' 
                  : 'Crear automáticamente una Tarea CCV vinculada'}
              </span>
              <span className="text-[11px] text-sky-700 block mt-0.5">
                Genera una tarjeta en el Tablero Kanban del área de {formato.includes('Video') || canal === 'YouTube' ? 'Multimedia' : 'Diseño'} para coordinar las horas y entregas de este post.
              </span>
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? 'Guardando...' : publicacionAEditar ? 'Guardar Cambios' : 'Crear Publicación'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
