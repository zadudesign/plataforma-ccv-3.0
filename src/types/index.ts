export type NivelArea = 1 | 2 | 3 | 4 | 5 | 6;

export interface Area {
  id: string;
  nombre: 'ADMIN' | 'CMU' | 'DEPARTAMENTO' | 'FACULTAD' | 'PROGRAMA' | 'CURSO';
  nivel: NivelArea;
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
  created_at?: string;
}

export interface Facultad {
  id: string;
  nombre: string;
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

export type EstadoTarea = 'Pendiente' | 'En Proceso' | 'En Revisión' | 'Completado';
export type TipoTarea = 'Curso Virtual' | 'Proyecto Especial';

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
  orden_tarea: number;
  estado: EstadoTarea;
  tipo_tarea: TipoTarea;
  fecha_vencimiento: string;
  fecha_completada?: string;
  tiempo_estimado: number; // en horas
  tiempo_invertido: number; // en horas
  tarifa_tarea: number; // valor monetario
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

export type VistaNavegacion = 'dashboard' | 'academic' | 'kanban' | 'calendar' | 'admin';
