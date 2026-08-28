export type NivelArea = number;

export interface Area {
  id: string;
  nombre: string;
  nivel: NivelArea;
  parent_id?: string | null;
  area_padre_nombre?: string;
  color?: string;
  icono?: string;
  created_at?: string;
}

export interface Rol {
  id: string;
  nombre: string;
  area_id: string;
  area_nombre?: string;
  created_at?: string;
}

export interface PermisoDef {
  id: string;
  clave: string;
  descripcion: string;
}

export interface Usuario {
  id: string;
  nombre_completo: string;
  email: string;
  rol_id: string;
  rol_nombre?: string;
  area_nombre?: string;
  firma_digital?: string; // SVG / Base64 string
  avatar_url?: string;
  telefono?: string;
  activo?: boolean;
  ultima_conexion?: string;
  created_at?: string;
}

export interface Facultad {
  id: string;
  nombre: string;
  color?: string;
  icono?: string;
  decano_id?: string;
  decano_nombre?: string;
  created_at?: string;
}

export interface Programa {
  id: string;
  nombre: string;
  facultad_id: string;
  facultad_nombre?: string;
  coordinador_id?: string;
  coordinador_nombre?: string;
  created_at?: string;
}

export interface ProyectoEspecial {
  id: string;
  nombre: string;
  descripcion: string;
  area_id?: string;
  lider_id?: string;
  lider_nombre?: string;
  lider_secundario_id?: string;
  lider_secundario_nombre?: string;
  estado: 'Planificación' | 'En Proceso' | 'Completado' | 'Pausado';
  created_at?: string;
}

export interface CursoVirtual {
  id: string;
  nombre: string;
  codigo: string;
  programa_id: string;
  programa_nombre?: string;
  facultad_nombre?: string;
  periodo: string;
  docente_id?: string;
  docente_nombre?: string;
  evaluador_id?: string;
  evaluador_nombre?: string;
  estado: 'En Diseño' | 'En Producción' | 'En Revisión' | 'Aprobado CCV' | 'Publicado LMS';
  created_at?: string;
}

export type EstadoTarea = 'Pendiente' | 'En Proceso' | 'En Revisión' | 'Completada';
export type TipoTarea = 'Curso Virtual' | 'Proyecto';
export type CategoriaTareaProyecto = 'Diseño' | 'Multimedia' | 'Soporte' | 'Transmisión';

export interface ConfiguracionTarifa {
  id?: string;
  categoria: CategoriaTareaProyecto;
  tarifa_hora: number;
  descripcion?: string;
}

export interface TareaCCV {
  id: string;
  titulo: string;
  descripcion: string;
  proyecto_id?: string;
  proyecto_nombre?: string;
  curso_id?: string;
  curso_nombre?: string;
  area_id?: string;
  area_nombre?: string;
  responsable_id?: string;
  responsable_nombre?: string;
  responsable_avatar?: string;
  rol_destino?: string;
  responsable_secundario_id?: string;
  responsable_secundario_nombre?: string;
  responsable_secundario_avatar?: string;
  rol_destino_secundario?: string;
  orden_tarea: number;
  estado: EstadoTarea;
  tipo_tarea: TipoTarea;
  categoria_proyecto?: CategoriaTareaProyecto;
  fecha_vencimiento: string;
  fecha_completada?: string;
  tiempo_invertido: number; // en horas (responsable principal)
  tiempo_invertido_secundario?: number; // en horas (co-responsable)
  tarifa_hora?: number; // valor por hora asignado
  tarifa_tarea?: number; // valor monetario total (tiempo_invertido * tarifa_hora o asignado)
  enlace_recurso?: string; // URL externa a material, Google Drive, OneDrive, Figma, etc.
  created_at?: string;
}

export interface TareaComentario {
  id: string;
  tarea_id: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_avatar?: string;
  comentario: string;
  adjunto_url?: string;
  created_at: string;
}

export interface RegistroHoras {
  id: string;
  tarea_id: string;
  tarea_titulo?: string;
  usuario_id?: string;
  usuario_nombre?: string;
  rol_destino: string;
  horas_registradas: number;
  fecha: string; // Formato YYYY-MM-DD
  descripcion_avance?: string;
  created_at?: string;
}

export type VistaNavegacion = 'dashboard' | 'calendar' | 'kanban' | 'productivity' | 'academic' | 'admin';
