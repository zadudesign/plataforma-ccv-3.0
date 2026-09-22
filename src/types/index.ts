export type NivelArea = number;

export interface Area {
  id: string;
  nombre: string;
  nivel: NivelArea;
  parent_id?: string | null;
  area_padre_nombre?: string;
  jefe_id?: string | null;
  jefe_nombre?: string | null;
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
  area_id?: string;
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
  numero_unidades?: number;
  estado: 'En Diseño' | 'En Producción' | 'En Revisión' | 'Aprobado CCV' | 'Publicado LMS';
  created_at?: string;
}

export type EstadoTarea = 'Pendiente' | 'En Proceso' | 'En Revisión' | 'Completada';
export type TipoTarea = 'Curso Virtual' | 'Proyecto';
export type CategoriaTareaProyecto = 'Diseño' | 'Multimedia' | 'Soporte' | 'Transmisión';

// TIPOS PARA MOTOR DE PLANTILLAS Y SECUENCIA DE TAREAS (CURSOS)
export type TipoResponsablePlantilla = 'DOCENTE' | 'PAR_EVALUADOR' | 'COORDINADOR' | 'DECANO' | 'CMU_FIJO';
export type EstadoBloqueoTarea = 'BLOQUEADA' | 'DISPONIBLE' | 'EN_PROCESO' | 'COMPLETADA';

export interface PlantillaTareaCurso {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  orden: number;
  tipo_responsable: TipoResponsablePlantilla;
  cmu_usuario_fijo_id?: string;
  cmu_usuario_fijo_nombre?: string;
  tipo_tarea?: string;
  tiempo_estimado?: number; // minutos
  activa: boolean;
  aplica_por_unidad?: boolean;
  seccion?: string;
  dependencias?: string[]; // IDs de tareas_plantilla de las que depende
  created_at?: string;
}

export interface PlantillaTareaDependencia {
  id: string;
  tarea_plantilla_id: string;
  depende_de_id: string;
}

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
  hora_vencimiento?: string; // Formato HH:mm (ej. "18:00")
  fecha_completada?: string;
  tiempo_estimado?: number; // en horas (estimación de duración)
  tiempo_invertido: number; // en horas (responsable principal)
  tiempo_invertido_secundario?: number; // en horas (co-responsable)
  tarifa_hora?: number; // valor por hora asignado
  tarifa_tarea?: number; // valor monetario total (tiempo_invertido * tarifa_hora o asignado)
  enlace_recurso?: string; // URL externa a material, Google Drive, OneDrive, Figma, etc.
  plantilla_origen_id?: string;
  estado_bloqueo?: EstadoBloqueoTarea;
  dependencias_operativas?: string[]; // IDs de tareas del mismo curso que la bloquean
  numero_unidad?: number;
  fecha_inicial?: string;
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

export type EstadoSolicitudTarea = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'En Evaluación';
export type PrioridadSolicitud = 'Baja' | 'Normal' | 'Alta' | 'Urgente';

export interface SolicitudTareaCCV {
  id: string;
  titulo: string;
  descripcion: string;
  tipo_origen: 'Facultad' | 'Departamento/Área';
  origen_id?: string | null;
  origen_nombre: string;
  fecha_estimada_entrega: string; // YYYY-MM-DD
  hora_estimada?: string | null; // HH:mm
  solicitante_id?: string | null;
  solicitante_nombre: string;
  solicitante_email?: string | null;
  solicitante_rol?: string | null;
  solicitante_contacto: string; // Teléfono / WhatsApp / Correo
  enlace_recurso?: string | null;
  prioridad: PrioridadSolicitud;
  estado: EstadoSolicitudTarea;
  motivo_rechazo?: string | null;
  tarea_creada_id?: string | null;
  revisado_por?: string | null;
  revisado_por_nombre?: string | null;
  fecha_revision?: string | null;
  created_at?: string;
}

export type VistaNavegacion = 'dashboard' | 'calendar' | 'kanban' | 'productivity' | 'academic' | 'admin' | 'parrilla';

export type PestanaAdmin = 'usuarios' | 'roles' | 'areas' | 'asignaciones' | 'tarifas' | 'solicitudes' | 'plantillas';
export type CategoriaAdmin = 'rbac' | 'academica' | 'operaciones';

export type RolCmuNombre = 'Diseño' | 'Soporte' | 'Producción' | 'Multimedia';

export interface CmuCapacidadRol {
  id?: string;
  rol_nombre: RolCmuNombre | string;
  horas_semanales_maximas: number;
  created_at?: string;
  updated_at?: string;
}

// ----------------------------------------------------------------------------
// PARRILLA DE PUBLICACIONES Y CALENDARIO EDITORIAL (CONTENT PLANNER)
// ----------------------------------------------------------------------------

export type EstadoPublicacion = 'Borrador' | 'En Diseño' | 'En Revisión' | 'Aprobado' | 'Programado' | 'Publicado';

export type CanalPublicacion = 
  | 'Instagram' 
  | 'LinkedIn' 
  | 'YouTube' 
  | 'TikTok' 
  | 'Blog/Web' 
  | 'Moodle/Boletín' 
  | 'Facebook' 
  | 'Otro';

export type FormatoPublicacion = 
  | 'Reel/Video' 
  | 'Carrusel' 
  | 'Post Estático' 
  | 'Historia' 
  | 'Artículo' 
  | 'Podcast' 
  | 'Infografía';

export interface PublicacionParrilla {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_publicacion: string; // ISO string o YYYY-MM-DDTHH:mm
  mes_planeado: string; // YYYY-MM
  estado: EstadoPublicacion;
  canal: CanalPublicacion;
  formato: FormatoPublicacion;
  link_recursos?: string;
  responsable_id?: string | null;
  responsable_nombre?: string;
  proyecto_id?: string | null;
  proyecto_nombre?: string;
  curso_id?: string | null;
  curso_nombre?: string;
  area_id?: string | null;
  area_nombre?: string;
  tarea_vinculada_id?: string | null;
  notas_internas?: string;
  created_at?: string;
  updated_at?: string;
}
