import { TareaCCV, EstadoBloqueoTarea, CursoVirtual } from '@/types';

/**
 * Verifica si un curso cumple con los requisitos estrictos para instanciar la plantilla:
 * - Debe tener docente_id asignado.
 * - Debe tener evaluador_id asignado.
 * - No debe tener tareas previas generadas por plantilla.
 */
export function validarRequisitosCargaPlantilla(
  curso: CursoVirtual,
  tareasDelCurso: TareaCCV[]
): { valido: boolean; motivo?: string } {
  const yaTienePlantilla = tareasDelCurso.some(t => !!t.plantilla_origen_id);
  if (yaTienePlantilla) {
    return {
      valido: false,
      motivo: 'El curso ya tiene tareas cargadas desde la plantilla predeterminada.'
    };
  }

  if (!curso.docente_id) {
    return {
      valido: false,
      motivo: 'Para cargar la plantilla, el curso debe tener un Docente asignado.'
    };
  }

  if (!curso.evaluador_id) {
    return {
      valido: false,
      motivo: 'Para cargar la plantilla, el curso debe tener un Par Evaluador asignado.'
    };
  }

  return { valido: true };
}

/**
 * Ordena una lista de tareas respetando estrictamente el orden oficial del
 * Catálogo Maestro de Tareas Predeterminadas:
 * 1. `orden_tarea` ASC (1, 2, 3, 4, 5...)
 * 2. `numero_unidad` ASC (Unidad 1, Unidad 2, Unidad 3...) para tareas duplicadas
 * 3. Fecha de creación o vencimiento como desempate secundario
 */
export function ordenarTareasSegunCatalogo(tareas: TareaCCV[]): TareaCCV[] {
  return [...tareas].sort((a, b) => {
    // 1. Orden oficial de la plantilla maestra
    const ordenA = a.orden_tarea !== undefined && a.orden_tarea !== null ? a.orden_tarea : 9999;
    const ordenB = b.orden_tarea !== undefined && b.orden_tarea !== null ? b.orden_tarea : 9999;

    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }

    // 2. Si tienen el mismo orden_tarea (ej. tareas repetidas por unidad), ordenar por numero_unidad
    const unidadA = a.numero_unidad !== undefined && a.numero_unidad !== null ? a.numero_unidad : 0;
    const unidadB = b.numero_unidad !== undefined && b.numero_unidad !== null ? b.numero_unidad : 0;
    if (unidadA !== unidadB) {
      return unidadA - unidadB;
    }

    // 3. Desempate por fecha de creación o título
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return (a.titulo || '').localeCompare(b.titulo || '');
  });
}


/**
 * Obtiene la lista de tareas pendientes que están bloqueando a la tarea indicada.
 */
export function obtenerTareasBloqueantes(
  tarea: TareaCCV,
  todasLasTareasCurso: TareaCCV[]
): TareaCCV[] {
  if (!tarea.dependencias_operativas || tarea.dependencias_operativas.length === 0) {
    return [];
  }

  return todasLasTareasCurso.filter(t => 
    tarea.dependencias_operativas?.includes(t.id) && t.estado !== 'Completada'
  );
}

/**
 * Calcula en memoria el estado resultante de tareas de un curso tras completar o revertir una tarea.
 * Se utiliza para optimismo instantáneo en la UI antes o en concurrencia con la respuesta de Supabase.
 */
export function simularDesbloqueoEnCascada(
  tareaModificadaId: string,
  nuevoEstado: 'Pendiente' | 'En Proceso' | 'En Revisión' | 'Completada',
  tareasCurso: TareaCCV[]
): TareaCCV[] {
  const resultado = tareasCurso.map(t => ({ ...t }));
  const indexMod = resultado.findIndex(t => t.id === tareaModificadaId);
  if (indexMod === -1) return tareasCurso;

  const tareaMod = resultado[indexMod];
  const estadoAnterior = tareaMod.estado;
  tareaMod.estado = nuevoEstado;

  // CASO 1: Pasa a COMPLETADA -> Desbloqueo hacia adelante
  if (nuevoEstado === 'Completada' && estadoAnterior !== 'Completada') {
    tareaMod.estado_bloqueo = 'COMPLETADA';
    tareaMod.fecha_completada = new Date().toISOString().split('T')[0];

    // Buscar tareas que dependían de esta y ver si ya no les queda ninguna dependencia pendiente
    resultado.forEach(t => {
      if (t.curso_id === tareaMod.curso_id && t.estado_bloqueo === 'BLOQUEADA' && t.dependencias_operativas?.includes(tareaMod.id)) {
        const dependenciasFaltantes = resultado.filter(d => 
          t.dependencias_operativas?.includes(d.id) && d.estado !== 'Completada'
        );

        if (dependenciasFaltantes.length === 0) {
          t.estado_bloqueo = 'DISPONIBLE';
        }
      }
    });
  }
  // CASO 2: Se revierte de COMPLETADA a otro estado -> Rollback
  else if (estadoAnterior === 'Completada' && nuevoEstado !== 'Completada') {
    tareaMod.estado_bloqueo = nuevoEstado === 'Pendiente' ? 'DISPONIBLE' : 'EN_PROCESO';
    tareaMod.fecha_completada = undefined;

    // Buscar tareas dependientes directas que sigan en DISPONIBLE y 'Pendiente'
    resultado.forEach(t => {
      if (
        t.curso_id === tareaMod.curso_id && 
        t.estado_bloqueo === 'DISPONIBLE' && 
        t.estado === 'Pendiente' && 
        t.dependencias_operativas?.includes(tareaMod.id)
      ) {
        t.estado_bloqueo = 'BLOQUEADA';
      }
    });
  }

  return resultado;
}

/**
 * Obtiene el estilo visual de badge y colores para el estado de bloqueo
 */
export function getEstadoBloqueoVisual(estadoBloqueo?: EstadoBloqueoTarea) {
  switch (estadoBloqueo) {
    case 'BLOQUEADA':
      return {
        label: 'Bloqueada',
        bg: 'bg-stone-100 text-stone-600 border-stone-300',
        ring: 'ring-stone-200',
        iconColor: 'text-stone-400'
      };
    case 'DISPONIBLE':
      return {
        label: 'Disponible',
        bg: 'bg-sky-50 text-sky-700 border-sky-300',
        ring: 'ring-sky-200',
        iconColor: 'text-sky-600'
      };
    case 'EN_PROCESO':
      return {
        label: 'En Proceso',
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        ring: 'ring-amber-200',
        iconColor: 'text-amber-600'
      };
    case 'COMPLETADA':
      return {
        label: 'Completada',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        ring: 'ring-emerald-200',
        iconColor: 'text-emerald-600'
      };
    default:
      return {
        label: 'Disponible',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        ring: 'ring-slate-100',
        iconColor: 'text-slate-500'
      };
  }
}
