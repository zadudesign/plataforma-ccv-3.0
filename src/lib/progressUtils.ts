import { TareaCCV, EstadoTarea, CursoVirtual, ProyectoEspecial } from '@/types';

/**
 * Ponderaciones oficiales del Centro de Educación Virtual (CCV) para el cálculo de progreso:
 * - Pendiente: 10% (Asignación y Planificación de la tarea)
 * - En Proceso: 50% (10% de inicio + 40% de avance y desarrollo)
 * - En Revisión: 75% (50% de desarrollo + 25% de validación pedagógica/QA)
 * - Completada: 100% (75% anterior + 25% de finalización y entrega oficial)
 */
export const PESOS_ESTADO_TAREA: Record<EstadoTarea, number> = {
  'Pendiente': 10,
  'En Proceso': 50,
  'En Revisión': 75,
  'Completada': 100,
};

/**
 * Incrementos porcentuales por fase:
 */
export const INCREMENTOS_POR_FASE = {
  'Pendiente': 10,
  'En Proceso': 40,
  'En Revisión': 25,
  'Completada': 25,
};

/**
 * Calcula el progreso promedio (0 a 100%) de un conjunto de tareas según su estado.
 */
export function calcularProgresoTareas(tareas: TareaCCV[]): number {
  if (!tareas || tareas.length === 0) return 0;

  const totalPuntaje = tareas.reduce((acumulado, tarea) => {
    const puntaje = PESOS_ESTADO_TAREA[tarea.estado] ?? 10;
    return acumulado + puntaje;
  }, 0);

  return Math.min(100, Math.max(0, Math.round(totalPuntaje / tareas.length)));
}

/**
 * Calcula el progreso de un Curso Virtual en base a sus tareas asignadas.
 * Si no tiene tareas creadas todavía, utiliza el estado general del curso como referencia inicial.
 */
export function calcularProgresoCurso(curso: CursoVirtual, tareas: TareaCCV[]): number {
  const tareasCurso = tareas.filter(t => t.curso_id === curso.id);
  if (tareasCurso.length > 0) {
    return calcularProgresoTareas(tareasCurso);
  }

  // Fallback por estado si el curso aún no tiene tareas vinculadas
  switch (curso.estado) {
    case 'En Diseño':
      return 10;
    case 'En Producción':
      return 50;
    case 'En Revisión':
      return 75;
    case 'Aprobado CCV':
    case 'Publicado LMS':
      return 100;
    default:
      return 0;
  }
}

/**
 * Calcula el progreso de un Proyecto Especial en base a sus tareas asignadas.
 * Si no tiene tareas creadas todavía, utiliza el estado general del proyecto como referencia inicial.
 */
export function calcularProgresoProyecto(proyecto: ProyectoEspecial, tareas: TareaCCV[]): number {
  const tareasProyecto = tareas.filter(t => t.proyecto_id === proyecto.id);
  if (tareasProyecto.length > 0) {
    return calcularProgresoTareas(tareasProyecto);
  }

  // Fallback por estado si el proyecto aún no tiene tareas vinculadas
  switch (proyecto.estado) {
    case 'Planificación':
      return 10;
    case 'En Proceso':
      return 50;
    case 'Completado':
      return 100;
    default:
      return 0;
  }
}

/**
 * Calcula el progreso global de una lista de cursos considerando sus tareas asignadas.
 */
export function calcularProgresoGlobalCursos(cursos: CursoVirtual[], tareas: TareaCCV[]): number {
  if (!cursos || cursos.length === 0) return 0;
  
  const sumaProgresos = cursos.reduce((acc, c) => acc + calcularProgresoCurso(c, tareas), 0);
  return Math.round(sumaProgresos / cursos.length);
}

/**
 * Calcula el progreso global de una lista de proyectos considerando sus tareas asignadas.
 */
export function calcularProgresoGlobalProyectos(proyectos: ProyectoEspecial[], tareas: TareaCCV[]): number {
  if (!proyectos || proyectos.length === 0) return 0;

  const sumaProgresos = proyectos.reduce((acc, p) => acc + calcularProgresoProyecto(p, tareas), 0);
  return Math.round(sumaProgresos / proyectos.length);
}
