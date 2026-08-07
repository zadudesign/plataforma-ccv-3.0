import { Area, Rol, Usuario, Facultad, Programa, ProyectoEspecial, CursoVirtual, TareaCCV, TareaComentario, PermisoDef, ConfiguracionTarifa, RegistroHoras } from '@/types';

export const INITIAL_TARIFAS_PROYECTO: ConfiguracionTarifa[] = [
  { id: 'tar-1', categoria: 'Diseño', tarifa_hora: 35000, descripcion: 'Tarifa por hora (COP) para diseño gráfico, instruccional y diagramación' },
  { id: 'tar-2', categoria: 'Multimedia', tarifa_hora: 45000, descripcion: 'Tarifa por hora (COP) para edición audiovisual, producción de video y animaciones H5P' },
  { id: 'tar-3', categoria: 'Soporte', tarifa_hora: 25000, descripcion: 'Tarifa por hora (COP) para soporte técnico, empaquetado SCORM y asistencia en plataformas' },
  { id: 'tar-4', categoria: 'Transmisión', tarifa_hora: 50000, descripcion: 'Tarifa por hora (COP) para producción de streaming, masterización en vivo y webinars' },
];

export const INITIAL_AREAS: Area[] = [
  { id: 'a-6', nombre: 'ADMIN', nivel: 6, parent_id: null },
  { id: 'a-5', nombre: 'CMU', nivel: 5, parent_id: 'a-6', area_padre_nombre: 'ADMIN' },
  { id: 'a-5-1', nombre: 'PRODUCCIÓN MULTIMEDIA', nivel: 5, parent_id: 'a-5', area_padre_nombre: 'CMU' },
  { id: 'a-5-2', nombre: 'DISEÑO INSTRUCCIONAL', nivel: 5, parent_id: 'a-5', area_padre_nombre: 'CMU' },
  { id: 'a-5-3', nombre: 'SOPORTE LMS', nivel: 5, parent_id: 'a-5', area_padre_nombre: 'CMU' },
  { id: 'a-4', nombre: 'DEPARTAMENTO', nivel: 4, parent_id: 'a-6', area_padre_nombre: 'ADMIN' },
  { id: 'a-4-1', nombre: 'Departamento de Innovación y Educación Virtual CCV', nivel: 4, parent_id: 'a-4', area_padre_nombre: 'DEPARTAMENTO' },
  { id: 'a-4-2', nombre: 'Departamento de Producción Multimedial (CMU)', nivel: 4, parent_id: 'a-4', area_padre_nombre: 'DEPARTAMENTO' },
  { id: 'a-4-3', nombre: 'Departamento de Desarrollo e Integración Tecnológica', nivel: 4, parent_id: 'a-4', area_padre_nombre: 'DEPARTAMENTO' },
  { id: 'a-3', nombre: 'FACULTAD', nivel: 3, parent_id: 'a-4', area_padre_nombre: 'DEPARTAMENTO' },
  { id: 'a-2', nombre: 'PROGRAMA', nivel: 2, parent_id: 'a-3', area_padre_nombre: 'FACULTAD' },
  { id: 'a-1', nombre: 'CURSO', nivel: 1, parent_id: 'a-2', area_padre_nombre: 'PROGRAMA' },
];

export const INITIAL_ROLES: Rol[] = [
  { id: 'r-1', nombre: 'Administrador', area_id: 'a-6', area_nombre: 'ADMIN' },
  { id: 'r-2', nombre: 'Jefe', area_id: 'a-5', area_nombre: 'CMU' },
  { id: 'r-3', nombre: 'Diseño', area_id: 'a-5', area_nombre: 'CMU' },
  { id: 'r-4', nombre: 'Multimedia', area_id: 'a-5', area_nombre: 'CMU' },
  { id: 'r-5', nombre: 'Soporte', area_id: 'a-5', area_nombre: 'CMU' },
  { id: 'r-6', nombre: 'Decano', area_id: 'a-3', area_nombre: 'FACULTAD' },
  { id: 'r-7', nombre: 'Coordinador', area_id: 'a-2', area_nombre: 'PROGRAMA' },
  { id: 'r-8', nombre: 'Docente', area_id: 'a-1', area_nombre: 'CURSO' },
  { id: 'r-9', nombre: 'Par Evaluador', area_id: 'a-1', area_nombre: 'CURSO' },
];

export const INITIAL_PERMISOS: PermisoDef[] = [
  { id: 'p-1', clave: 'registro:crear', descripcion: 'Permite crear nuevos registros académicos o tareas' },
  { id: 'p-2', clave: 'registro:editar', descripcion: 'Permite editar información de cursos y tareas' },
  { id: 'p-3', clave: 'registro:ver', descripcion: 'Permite visualizar contenidos según jerarquía de área' },
  { id: 'p-4', clave: 'registro:eliminar', descripcion: 'Permite eliminar registros del sistema' },
  { id: 'p-5', clave: 'tarea:aprobar', descripcion: 'Permite aprobar y cambiar estado a Completado' },
  { id: 'p-6', clave: 'usuario:gestionar', descripcion: 'Gestión total de usuarios, asignación de roles y permisos (Solo Admin)' },
];

// Matriz de permisos por defecto para el frontend
export const ROLES_PERMISOS_MAP: Record<string, string[]> = {
  'r-1': ['registro:crear', 'registro:editar', 'registro:ver', 'registro:eliminar', 'tarea:aprobar', 'usuario:gestionar'], // Administrador
  'r-2': ['registro:crear', 'registro:editar', 'registro:ver', 'registro:eliminar', 'tarea:aprobar'], // Jefe
  'r-3': ['registro:crear', 'registro:editar', 'registro:ver', 'tarea:aprobar'], // Diseño
  'r-4': ['registro:crear', 'registro:editar', 'registro:ver'], // Multimedia
  'r-5': ['registro:editar', 'registro:ver'], // Soporte
  'r-6': ['registro:crear', 'registro:editar', 'registro:ver', 'tarea:aprobar'], // Decano
  'r-7': ['registro:crear', 'registro:editar', 'registro:ver'], // Coordinador
  'r-8': ['registro:crear', 'registro:editar', 'registro:ver'], // Docente
  'r-9': ['registro:ver', 'tarea:aprobar'], // Par Evaluador
};

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'u-admin',
    nombre_completo: 'Administrador Principal CCV',
    email: 'admin@ccv.edu.co',
    rol_id: 'r-1',
    rol_nombre: 'Administrador',
    area_nombre: 'ADMIN',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 300 000 0001',
    activo: true,
    firma_digital: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 50 10 90 40 T 170 30" stroke="%233A5A40" stroke-width="3" fill="none"/></svg>'
  },
  {
    id: 'u-jefe',
    nombre_completo: 'Dra. Patricia Morales (Jefe CCV)',
    email: 'patricia.jefe@ccv.edu.co',
    rol_id: 'r-2',
    rol_nombre: 'Jefe',
    area_nombre: 'CMU',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 300 111 2233',
    activo: true,
  },
  {
    id: 'u-diseno',
    nombre_completo: 'Lic. Carlic Bolomboy',
    email: 'carlic.diseno@ccv.edu.co',
    rol_id: 'r-3',
    rol_nombre: 'Diseño',
    area_nombre: 'CMU',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 300 123 4567',
    activo: true,
    firma_digital: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 50 10 90 40 T 170 30" stroke="%233A5A40" stroke-width="3" fill="none"/></svg>'
  },
  {
    id: 'u-multi',
    nombre_completo: 'Ing. Carlos Mendoza',
    email: 'carlos.multimedia@ccv.edu.co',
    rol_id: 'r-4',
    rol_nombre: 'Multimedia',
    area_nombre: 'CMU',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 301 987 6543',
    activo: true,
  },
  {
    id: 'u-soporte',
    nombre_completo: 'Téc. Andrés Torres',
    email: 'andres.soporte@ccv.edu.co',
    rol_id: 'r-5',
    rol_nombre: 'Soporte',
    area_nombre: 'CMU',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 302 444 5566',
    activo: true,
  },
  {
    id: 'u-decano',
    nombre_completo: 'Dra. Elena Rostova',
    email: 'elena.decano@universidad.edu.co',
    rol_id: 'r-6',
    rol_nombre: 'Decano',
    area_nombre: 'FACULTAD',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 303 777 8899',
    activo: true,
  },
  {
    id: 'u-coord',
    nombre_completo: 'Mg. Fernando Ríos',
    email: 'fernando.coord@universidad.edu.co',
    rol_id: 'r-7',
    rol_nombre: 'Coordinador',
    area_nombre: 'PROGRAMA',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 304 222 3344',
    activo: true,
  },
  {
    id: 'u-docente',
    nombre_completo: 'Prof. Ana María Silva',
    email: 'ana.docente@universidad.edu.co',
    rol_id: 'r-8',
    rol_nombre: 'Docente',
    area_nombre: 'CURSO',
    avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 305 555 6677',
    activo: true,
  },
  {
    id: 'u-par',
    nombre_completo: 'Dr. Roberto Gómez',
    email: 'roberto.par@universidad.edu.co',
    rol_id: 'r-9',
    rol_nombre: 'Par Evaluador',
    area_nombre: 'CURSO',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    telefono: '+57 306 888 9900',
    activo: true,
  }
];

export const INITIAL_FACULTADES: Facultad[] = [
  { id: 'f-1', nombre: 'Facultad de Ingeniería y Ciencias Aplicadas', decano_id: 'u-decano', decano_nombre: 'Dra. Elena Rostova' },
  { id: 'f-2', nombre: 'Facultad de Ciencias de la Salud', decano_id: 'u-par', decano_nombre: 'Dr. Roberto Gómez' },
  { id: 'f-3', nombre: 'Facultad de Ciencias Empresariales y Economía', decano_id: 'u-diseno', decano_nombre: 'Lic. Carlic Bolomboy' },
];

export const INITIAL_PROGRAMAS: Programa[] = [
  { id: 'p-1', nombre: 'Diplomado en Inteligencia Artificial Aplicada', facultad_id: 'f-1', facultad_nombre: 'Facultad de Ingeniería y Ciencias Aplicadas', coordinador_id: 'u-multi', coordinador_nombre: 'Ing. Carlos Mendoza' },
  { id: 'p-2', nombre: 'Especialización Virtual en Telemedicina', facultad_id: 'f-2', facultad_nombre: 'Facultad de Ciencias de la Salud', coordinador_id: 'u-par', coordinador_nombre: 'Dr. Roberto Gómez' },
  { id: 'p-3', nombre: 'Programa Ejecutivo en Gerencia Digital', facultad_id: 'f-3', facultad_nombre: 'Facultad de Ciencias Empresariales y Economía', coordinador_id: 'u-diseno', coordinador_nombre: 'Lic. Carlic Bolomboy' },
];

export const INITIAL_PROYECTOS: ProyectoEspecial[] = [
  { id: 'pry-1', nombre: 'Renovación Curricular Educación Continua 2026', descripcion: 'Actualización y virtualización de microcredenciales institucionales', area_id: 'a-4-1', estado: 'En Proceso' },
  { id: 'pry-2', nombre: 'Plataforma Interactiva de Simulación Clínica', descripcion: 'Desarrollo de escenarios inmersivos para posgrados de medicina', area_id: 'a-4-2', estado: 'Planificación' },
  { id: 'pry-3', nombre: 'Banco Institucional de Objetos de Aprendizaje H5P', descripcion: 'Repositorio estandarizado de recursos didácticos interactivos', area_id: 'a-4-3', estado: 'En Proceso' },
  { id: 'pry-4', nombre: 'Migración y Integración de Paquetes SCORM 2026', descripcion: 'Optimización de empaquetado para plataformas LMS Canvas y Moodle', area_id: 'a-4-1', estado: 'Completado' },
];

export const INITIAL_CURSOS: CursoVirtual[] = [
  {
    id: 'c-1',
    nombre: 'Machine Learning y Modelos Generativos',
    codigo: 'CCV-ING-401',
    programa_id: 'p-1',
    programa_nombre: 'Diplomado en Inteligencia Artificial Aplicada',
    facultad_nombre: 'Facultad de Ingeniería y Ciencias Aplicadas',
    periodo: '2026-1',
    docente_id: 'u-docente',
    docente_nombre: 'Prof. Ana María Silva',
    evaluador_id: 'u-par',
    evaluador_nombre: 'Dr. Roberto Gómez',
    estado: 'En Producción'
  },
  {
    id: 'c-2',
    nombre: 'Fundamentos de Bioética y Telemedicina',
    codigo: 'CCV-SAL-202',
    programa_id: 'p-2',
    programa_nombre: 'Especialización Virtual en Telemedicina',
    facultad_nombre: 'Facultad de Ciencias de la Salud',
    periodo: '2026-1',
    docente_id: 'u-par',
    docente_nombre: 'Dr. Roberto Gómez',
    evaluador_id: 'u-diseno',
    evaluador_nombre: 'Lic. Carlic Bolomboy',
    estado: 'En Revisión'
  },
  {
    id: 'c-3',
    nombre: 'Estrategia y Transformación Digital de Negocios',
    codigo: 'CCV-EMP-105',
    programa_id: 'p-3',
    programa_nombre: 'Programa Ejecutivo en Gerencia Digital',
    facultad_nombre: 'Facultad de Ciencias Empresariales y Economía',
    periodo: '2026-1',
    docente_id: 'u-diseno',
    docente_nombre: 'Lic. Carlic Bolomboy',
    evaluador_id: 'u-decano',
    evaluador_nombre: 'Dra. Elena Rostova',
    estado: 'Aprobado CCV'
  }
];

export const INITIAL_TAREAS: TareaCCV[] = [
  {
    id: 't-101',
    titulo: 'Diseño de Guiones Didácticos - Módulo 2 IA',
    descripcion: 'Elaboración del guión tecno-pedagógico para los videos animados del módulo de PyTorch.',
    curso_id: 'c-1',
    curso_nombre: 'Machine Learning y Modelos Generativos',
    area_id: 'a-5',
    area_nombre: 'CMU',
    responsable_id: 'u-diseno',
    responsable_nombre: 'Lic. Carlic Bolomboy',
    responsable_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rol_destino: 'Diseño',
    orden_tarea: 1,
    estado: 'Completada',
    tipo_tarea: 'Curso Virtual',
    fecha_vencimiento: '2026-08-01',
    fecha_completada: '2026-08-04', // 3 días de retraso
    tiempo_estimado: 24,
    tiempo_invertido: 20.5,
  },
  {
    id: 't-102',
    titulo: 'Edición y Renderizado de Videos Interactivos H5P',
    descripcion: 'Producción audiovisual de cápsulas de 5 minutos con preguntas interactivas incrustadas.',
    curso_id: 'c-1',
    curso_nombre: 'Machine Learning y Modelos Generativos',
    area_id: 'a-5',
    area_nombre: 'CMU',
    responsable_id: 'u-multi',
    responsable_nombre: 'Ing. Carlos Mendoza',
    responsable_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rol_destino: 'Multimedia',
    orden_tarea: 2,
    estado: 'Completada',
    tipo_tarea: 'Curso Virtual',
    fecha_vencimiento: '2026-08-05',
    fecha_completada: '2026-08-03', // 2 días antes (A tiempo)
    tiempo_estimado: 16,
    tiempo_invertido: 16.5,
  },
  {
    id: 't-103',
    titulo: 'Auditoría Teórica y Evaluación de Calidad Técnico-Docente',
    descripcion: 'Revisión por par evaluador del Syllabus y rúbricas de evaluación del curso.',
    curso_id: 'c-2',
    curso_nombre: 'Fundamentos de Bioética y Telemedicina',
    area_id: 'a-1',
    area_nombre: 'CURSO',
    responsable_id: 'u-par',
    responsable_nombre: 'Dr. Roberto Gómez',
    responsable_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rol_destino: 'Par Evaluador',
    orden_tarea: 1,
    estado: 'En Revisión',
    tipo_tarea: 'Curso Virtual',
    fecha_vencimiento: '2026-08-02', // Pendiente con retraso respecto a 2026-08-07
    tiempo_estimado: 12,
    tiempo_invertido: 8.5,
  },
  {
    id: 't-104',
    titulo: 'Montaje Final de Recursos y Exámenes en LMS Moodle/Canvas',
    descripcion: 'Empaquetado SCORM 1.2 y subida de actividades y cuestionarios calificados.',
    curso_id: 'c-3',
    curso_nombre: 'Estrategia y Transformación Digital de Negocios',
    area_id: 'a-5',
    area_nombre: 'CMU',
    responsable_id: 'u-docente',
    responsable_nombre: 'Prof. Ana María Silva',
    responsable_avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    rol_destino: 'Soporte',
    orden_tarea: 1,
    estado: 'Completada',
    tipo_tarea: 'Curso Virtual',
    fecha_vencimiento: '2026-07-25',
    fecha_completada: '2026-07-24', // A tiempo (1 día antes)
    tiempo_estimado: 30,
    tiempo_invertido: 9.5,
  },
  {
    id: 't-105',
    titulo: 'Estructuración de Microcredenciales de Educación Continua',
    descripcion: 'Definición de Insignias Digitales y mapa de competencias para graduados.',
    proyecto_id: 'pry-1',
    proyecto_nombre: 'Renovación Curricular Educación Continua 2026',
    area_id: 'a-2',
    area_nombre: 'PROGRAMA',
    responsable_id: 'u-coord',
    responsable_nombre: 'Mg. Fernando Ríos',
    responsable_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rol_destino: 'Diseño',
    orden_tarea: 1,
    estado: 'En Proceso',
    tipo_tarea: 'Proyecto',
    categoria_proyecto: 'Diseño',
    fecha_vencimiento: '2026-08-15', // Pendiente dentro del plazo
    tiempo_estimado: 40,
    tiempo_invertido: 10.0,
    tarifa_hora: 35000,
    tarifa_tarea: 1400000,
  },
  {
    id: 't-106',
    titulo: 'Validación de Accesibilidad Web y SCORM 2.0',
    descripcion: 'Pruebas de compatibilidad con lectores de pantalla y estándares WCAG 2.1.',
    curso_id: 'c-3',
    curso_nombre: 'Estrategia y Transformación Digital de Negocios',
    area_id: 'a-5',
    area_nombre: 'CMU',
    responsable_id: 'u-multi',
    responsable_nombre: 'Ing. Carlos Mendoza',
    responsable_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rol_destino: 'Multimedia',
    orden_tarea: 2,
    estado: 'Completada',
    tipo_tarea: 'Curso Virtual',
    fecha_vencimiento: '2026-07-30',
    fecha_completada: '2026-08-05', // 6 días de retraso
    tiempo_estimado: 18,
    tiempo_invertido: 13.0,
  }
];

export const INITIAL_COMENTARIOS: TareaComentario[] = [
  {
    id: 'com-1',
    tarea_id: 't-101',
    usuario_id: 'u-multi',
    usuario_nombre: 'Ing. Carlos Mendoza',
    usuario_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    comentario: 'He revisado el borrador del módulo 2. Sugiero ampliar el esquema interactivo de la lección 3.',
    created_at: '2026-07-20 14:34'
  },
  {
    id: 'com-2',
    tarea_id: 't-101',
    usuario_id: 'u-diseno',
    usuario_nombre: 'Lic. Carlic Bolomboy',
    usuario_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    comentario: 'Entendido, ajustaré los diagramas vectoriales para la animación multimedia esta tarde.',
    created_at: '2026-07-20 15:23'
  }
];

export const INITIAL_REGISTRO_HORAS: RegistroHoras[] = [
  {
    id: 'log-1',
    tarea_id: 't-101',
    tarea_titulo: 'Diseño de Guiones Didácticos - Módulo 2 IA',
    usuario_id: 'u-diseno',
    usuario_nombre: 'Lic. Carlic Bolomboy',
    rol_destino: 'Diseño',
    horas_registradas: 4.0,
    fecha: '2026-08-01',
    descripcion_avance: 'Elaboración de esquemas conceptuales y diagramas pedagógicos',
    created_at: '2026-08-01 17:00'
  },
  {
    id: 'log-2',
    tarea_id: 't-102',
    tarea_titulo: 'Edición y Renderizado de Videos Interactivos H5P',
    usuario_id: 'u-multi',
    usuario_nombre: 'Ing. Carlos Mendoza',
    rol_destino: 'Multimedia',
    horas_registradas: 3.5,
    fecha: '2026-08-01',
    descripcion_avance: 'Corte inicial de video y sincronización de pistas de audio',
    created_at: '2026-08-01 18:30'
  },
  {
    id: 'log-3',
    tarea_id: 't-101',
    tarea_titulo: 'Diseño de Guiones Didácticos - Módulo 2 IA',
    usuario_id: 'u-diseno',
    usuario_nombre: 'Lic. Carlic Bolomboy',
    rol_destino: 'Diseño',
    horas_registradas: 6.0,
    fecha: '2026-08-02',
    descripcion_avance: 'Redacción final de scripts de locución para las lecciones 1 a 4',
    created_at: '2026-08-02 16:45'
  },
  {
    id: 'log-4',
    tarea_id: 't-103',
    tarea_titulo: 'Auditoría Teórica y Evaluación de Calidad Técnico-Docente',
    usuario_id: 'u-par',
    usuario_nombre: 'Dr. Roberto Gómez',
    rol_destino: 'Par Evaluador',
    horas_registradas: 5.0,
    fecha: '2026-08-02',
    descripcion_avance: 'Revisión técnica del syllabus y estructura del sistema de evaluación',
    created_at: '2026-08-02 19:10'
  },
  {
    id: 'log-5',
    tarea_id: 't-104',
    tarea_titulo: 'Montaje Final de Recursos y Exámenes en LMS Moodle/Canvas',
    usuario_id: 'u-docente',
    usuario_nombre: 'Prof. Ana María Silva',
    rol_destino: 'Soporte',
    horas_registradas: 4.5,
    fecha: '2026-08-03',
    descripcion_avance: 'Carga de objetos SCORM y pruebas de calificación automática',
    created_at: '2026-08-03 14:20'
  },
  {
    id: 'log-6',
    tarea_id: 't-105',
    tarea_titulo: 'Estructuración de Microcredenciales de Educación Continua',
    usuario_id: 'u-coord',
    usuario_nombre: 'Mg. Fernando Ríos',
    rol_destino: 'Diseño',
    horas_registradas: 3.0,
    fecha: '2026-08-03',
    descripcion_avance: 'Diseño gráfico de insignias digitales y criterios de logro',
    created_at: '2026-08-03 16:00'
  },
  {
    id: 'log-7',
    tarea_id: 't-102',
    tarea_titulo: 'Edición y Renderizado de Videos Interactivos H5P',
    usuario_id: 'u-multi',
    usuario_nombre: 'Ing. Carlos Mendoza',
    rol_destino: 'Multimedia',
    horas_registradas: 5.5,
    fecha: '2026-08-04',
    descripcion_avance: 'Incrustación de preguntas evaluativas H5P y render final MP4',
    created_at: '2026-08-04 18:00'
  },
  {
    id: 'log-8',
    tarea_id: 't-101',
    tarea_titulo: 'Diseño de Guiones Didácticos - Módulo 2 IA',
    usuario_id: 'u-diseno',
    usuario_nombre: 'Lic. Carlic Bolomboy',
    rol_destino: 'Diseño',
    horas_registradas: 4.0,
    fecha: '2026-08-04',
    descripcion_avance: 'Corrección de observaciones teóricas del par evaluador',
    created_at: '2026-08-04 17:30'
  },
  {
    id: 'log-9',
    tarea_id: 't-103',
    tarea_titulo: 'Auditoría Teórica y Evaluación de Calidad Técnico-Docente',
    usuario_id: 'u-par',
    usuario_nombre: 'Dr. Roberto Gómez',
    rol_destino: 'Par Evaluador',
    horas_registradas: 3.5,
    fecha: '2026-08-05',
    descripcion_avance: 'Emisión del concepto favorable y firma digital de aprobación',
    created_at: '2026-08-05 12:15'
  },
  {
    id: 'log-10',
    tarea_id: 't-105',
    tarea_titulo: 'Estructuración de Microcredenciales de Educación Continua',
    usuario_id: 'u-coord',
    usuario_nombre: 'Mg. Fernando Ríos',
    rol_destino: 'Diseño',
    horas_registradas: 7.0,
    fecha: '2026-08-05',
    descripcion_avance: 'Vinculación de insignias en plataforma OpenBadges',
    created_at: '2026-08-05 18:45'
  },
  {
    id: 'log-11',
    tarea_id: 't-104',
    tarea_titulo: 'Montaje Final de Recursos y Exámenes en LMS Moodle/Canvas',
    usuario_id: 'u-docente',
    usuario_nombre: 'Prof. Ana María Silva',
    rol_destino: 'Soporte',
    horas_registradas: 5.0,
    fecha: '2026-08-06',
    descripcion_avance: 'Verificación final de accesibilidad y simulación de estudiante',
    created_at: '2026-08-06 15:30'
  },
  {
    id: 'log-12',
    tarea_id: 't-102',
    tarea_titulo: 'Edición y Renderizado de Videos Interactivos H5P',
    usuario_id: 'u-multi',
    usuario_nombre: 'Ing. Carlos Mendoza',
    rol_destino: 'Multimedia',
    horas_registradas: 4.5,
    fecha: '2026-08-06',
    descripcion_avance: 'Exportación SCORM de módulos multimediales',
    created_at: '2026-08-06 17:15'
  },
  {
    id: 'log-13',
    tarea_id: 't-101',
    tarea_titulo: 'Diseño de Guiones Didácticos - Módulo 2 IA',
    usuario_id: 'u-diseno',
    usuario_nombre: 'Lic. Carlic Bolomboy',
    rol_destino: 'Diseño',
    horas_registradas: 6.5,
    fecha: '2026-08-07',
    descripcion_avance: 'Entrega de paquete de diseño completo para aprobación final',
    created_at: '2026-08-07 11:30'
  },
  {
    id: 'log-14',
    tarea_id: 't-102',
    tarea_titulo: 'Edición y Renderizado de Videos Interactivos H5P',
    usuario_id: 'u-multi',
    usuario_nombre: 'Ing. Carlos Mendoza',
    rol_destino: 'Multimedia',
    horas_registradas: 3.0,
    fecha: '2026-08-07',
    descripcion_avance: 'Ajuste de niveles de audio y publicación en servidor de video',
    created_at: '2026-08-07 12:45'
  }
];
