import { TareaCCV, CursoVirtual, ProyectoEspecial, Area, Facultad, Programa, SolicitudTareaCCV } from '@/types';

export type TipoRemision = 'Facultad' | 'Departamento';

export interface InfoRemision {
  tipo: TipoRemision;
  nombre: string;
  subtexto?: string;
  entidadId?: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    accentColor: string;
  };
}

export interface RemisionContext {
  facultades?: Facultad[];
  programas?: Programa[];
  cursos?: CursoVirtual[];
  proyectos?: ProyectoEspecial[];
  areas?: Area[];
  solicitudesTareas?: SolicitudTareaCCV[];
}

export interface MetricasRemisionEntidad {
  nombre: string;
  tipo: TipoRemision;
  totalTareas: number;
  horasEstimadas: number;
  horasInvertidas: number;
  porcentajeHoras: number;
  rolesInvolucrados: string[];
  tareas: TareaCCV[];
  colaboradoresIds: string[];
}

// Paletas de color elegantes Hybrid Design
const ESTILO_FACULTAD = {
  bg: 'bg-emerald-50/70',
  text: 'text-emerald-950',
  border: 'border-emerald-200',
  badgeBg: 'bg-emerald-100',
  badgeText: 'text-emerald-800',
  accentColor: '#059669', // emerald-600
};

const ESTILO_DEPARTAMENTO = {
  bg: 'bg-sky-50/70',
  text: 'text-sky-950',
  border: 'border-sky-200',
  badgeBg: 'bg-sky-100',
  badgeText: 'text-sky-800',
  accentColor: '#0284c7', // sky-600
};

/**
 * Resuelve a qué Facultad o Departamento está remitida una tarea específica,
 * evaluando en orden: Solicitud original, Curso y Programa académico,
 * Proyecto especial, o Área asignada.
 */
export function resolverRemisionTarea(tarea: TareaCCV, ctx: RemisionContext): InfoRemision {
  const { facultades = [], programas = [], cursos = [], proyectos = [], areas = [], solicitudesTareas = [] } = ctx;

  // 1. Verificar si proviene o se vincula con una Solicitud formal de tarea
  const solicitudDirecta = solicitudesTareas.find(s => 
    (s.tarea_creada_id && s.tarea_creada_id === tarea.id) || 
    (s.titulo && tarea.titulo && s.titulo.trim().toLowerCase() === tarea.titulo.trim().toLowerCase())
  );

  if (solicitudDirecta && solicitudDirecta.origen_nombre) {
    const esFacultad = solicitudDirecta.tipo_origen === 'Facultad' || 
      solicitudDirecta.origen_nombre.toLowerCase().includes('facultad');
    const tipo: TipoRemision = esFacultad ? 'Facultad' : 'Departamento';
    return {
      tipo,
      nombre: solicitudDirecta.origen_nombre,
      subtexto: `Solicitante: ${solicitudDirecta.solicitante_nombre}`,
      entidadId: solicitudDirecta.origen_id || undefined,
      color: esFacultad ? ESTILO_FACULTAD : ESTILO_DEPARTAMENTO,
    };
  }

  // Verificar si en la descripción quedó la huella de la solicitud (creada vía SolicitudesInboxTab)
  if (tarea.descripcion) {
    const matchSolicitud = tarea.descripcion.match(/📌 Solicitado por:\s*([^\n-]+)\s*-\s*([^\n]+)/i);
    if (matchSolicitud && matchSolicitud[2]) {
      const nombreOrigen = matchSolicitud[2].trim();
      const solicitante = matchSolicitud[1].trim();
      const esFacultad = nombreOrigen.toLowerCase().includes('facultad');
      const tipo: TipoRemision = esFacultad ? 'Facultad' : 'Departamento';
      return {
        tipo,
        nombre: nombreOrigen,
        subtexto: `Solicitado por: ${solicitante}`,
        color: esFacultad ? ESTILO_FACULTAD : ESTILO_DEPARTAMENTO,
      };
    }
  }

  // 2. Si es Curso Virtual o tiene curso_id
  if (tarea.tipo_tarea === 'Curso Virtual' || tarea.curso_id || tarea.curso_nombre) {
    const cursoEncontrado = cursos.find(c => 
      (tarea.curso_id && c.id === tarea.curso_id) || 
      (tarea.curso_nombre && c.nombre.trim().toLowerCase() === tarea.curso_nombre.trim().toLowerCase())
    );

    let nombreFacultad: string | undefined = cursoEncontrado?.facultad_nombre;
    let nombrePrograma: string | undefined = cursoEncontrado?.programa_nombre;

    // Si el curso no tiene directamente facultad_nombre, buscar en el programa
    if (!nombreFacultad && cursoEncontrado?.programa_id) {
      const prog = programas.find(p => p.id === cursoEncontrado.programa_id);
      if (prog) {
        nombrePrograma = nombrePrograma || prog.nombre;
        nombreFacultad = prog.facultad_nombre;
        if (!nombreFacultad && prog.facultad_id) {
          const fac = facultades.find(f => f.id === prog.facultad_id);
          nombreFacultad = fac?.nombre;
        }
      }
    }

    // Si aún no se tiene nombreFacultad, intentar deducir a partir de las facultades existentes
    if (!nombreFacultad && (tarea.curso_nombre || tarea.titulo)) {
      const textoEval = `${tarea.curso_nombre || ''} ${tarea.titulo || ''}`.toLowerCase();
      const facMatch = facultades.find(f => textoEval.includes(f.nombre.toLowerCase()));
      if (facMatch) {
        nombreFacultad = facMatch.nombre;
      }
    }

    const nombreFinal = nombreFacultad || 'Facultad General / Asuntos Académicos';
    const subtextoFinal = tarea.curso_nombre 
      ? `Curso: ${tarea.curso_nombre}${nombrePrograma ? ` • ${nombrePrograma}` : ''}`
      : 'Asignatura Virtual';

    return {
      tipo: 'Facultad',
      nombre: nombreFinal,
      subtexto: subtextoFinal,
      color: ESTILO_FACULTAD,
    };
  }

  // 3. Si es Proyecto Especial o tiene proyecto_id
  if (tarea.tipo_tarea === 'Proyecto' || tarea.proyecto_id || tarea.proyecto_nombre) {
    const proyEncontrado = proyectos.find(p => 
      (tarea.proyecto_id && p.id === tarea.proyecto_id) || 
      (tarea.proyecto_nombre && p.nombre.trim().toLowerCase() === tarea.proyecto_nombre.trim().toLowerCase())
    );

    let areaVinculada: Area | undefined;
    if (proyEncontrado?.area_id) {
      areaVinculada = areas.find(a => a.id === proyEncontrado.area_id);
    }
    if (!areaVinculada && tarea.area_id) {
      areaVinculada = areas.find(a => a.id === tarea.area_id);
    }
    if (!areaVinculada && tarea.area_nombre) {
      areaVinculada = areas.find(a => a.nombre.toLowerCase() === tarea.area_nombre?.toLowerCase());
    }

    if (areaVinculada) {
      const esFacultad = areaVinculada.nombre.toLowerCase().includes('facultad') || areaVinculada.nivel === 3;
      const tipo: TipoRemision = esFacultad ? 'Facultad' : 'Departamento';
      return {
        tipo,
        nombre: areaVinculada.nombre,
        subtexto: `Proyecto: ${tarea.proyecto_nombre || proyEncontrado?.nombre || tarea.titulo}`,
        entidadId: areaVinculada.id,
        color: esFacultad ? ESTILO_FACULTAD : ESTILO_DEPARTAMENTO,
      };
    }

    // Si el proyecto no tiene área definida, remitir al Centro CCV o al nombre del proyecto
    return {
      tipo: 'Departamento',
      nombre: tarea.proyecto_nombre || 'Centro de Educación Virtual (CCV)',
      subtexto: 'Proyecto Estratégico Especial',
      color: ESTILO_DEPARTAMENTO,
    };
  }

  // 4. Si la tarea cuenta directamente con area_id o area_nombre
  if (tarea.area_id || tarea.area_nombre) {
    const areaDirecta = areas.find(a => 
      (tarea.area_id && a.id === tarea.area_id) || 
      (tarea.area_nombre && a.nombre.toLowerCase() === tarea.area_nombre.toLowerCase())
    );

    const nombreArea = areaDirecta?.nombre || tarea.area_nombre || 'Departamento Institucional';
    const esFacultad = nombreArea.toLowerCase().includes('facultad') || (areaDirecta && areaDirecta.nivel === 3);
    const tipo: TipoRemision = esFacultad ? 'Facultad' : 'Departamento';

    return {
      tipo,
      nombre: nombreArea,
      subtexto: 'Área Asignada',
      entidadId: areaDirecta?.id,
      color: esFacultad ? ESTILO_FACULTAD : ESTILO_DEPARTAMENTO,
    };
  }

  // 5. Fallback por defecto
  return {
    tipo: 'Departamento',
    nombre: 'Centro de Educación Virtual (CCV)',
    subtexto: 'Operación y Gestión Interna',
    color: ESTILO_DEPARTAMENTO,
  };
}

/**
 * Agrupa una lista de tareas por su entidad remitente (Facultad o Departamento)
 * y calcula métricas agregadas de esfuerzo, tareas y roles involucrados.
 */
export function agruparTareasPorRemision(
  tareas: TareaCCV[], 
  ctx: RemisionContext
): MetricasRemisionEntidad[] {
  const mapa = new Map<string, {
    nombre: string;
    tipo: TipoRemision;
    totalTareas: number;
    horasEstimadas: number;
    horasInvertidas: number;
    rolesSet: Set<string>;
    colaboradoresSet: Set<string>;
    tareas: TareaCCV[];
  }>();

  let horasEstimadasGlobales = 0;

  tareas.forEach(tarea => {
    const rem = resolverRemisionTarea(tarea, ctx);
    const clave = `${rem.tipo}__${rem.nombre.trim().toLowerCase()}`;

    const hrsEstimadas = Number(tarea.tiempo_estimado || 0);
    const hrsInvertidas = Number(tarea.tiempo_invertido || 0) + Number(tarea.tiempo_invertido_secundario || 0);

    horasEstimadasGlobales += hrsEstimadas;

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        nombre: rem.nombre,
        tipo: rem.tipo,
        totalTareas: 0,
        horasEstimadas: 0,
        horasInvertidas: 0,
        rolesSet: new Set<string>(),
        colaboradoresSet: new Set<string>(),
        tareas: [],
      });
    }

    const entrada = mapa.get(clave)!;
    entrada.totalTareas += 1;
    entrada.horasEstimadas += hrsEstimadas;
    entrada.horasInvertidas += hrsInvertidas;
    entrada.tareas.push(tarea);

    if (tarea.rol_destino) entrada.rolesSet.add(tarea.rol_destino);
    if (tarea.rol_destino_secundario) entrada.rolesSet.add(tarea.rol_destino_secundario);
    if (tarea.responsable_id) entrada.colaboradoresSet.add(tarea.responsable_id);
    if (tarea.responsable_secundario_id) entrada.colaboradoresSet.add(tarea.responsable_secundario_id);
  });

  const resultado: MetricasRemisionEntidad[] = [];

  mapa.forEach(val => {
    const porcentajeHoras = horasEstimadasGlobales > 0 
      ? Math.round((val.horasEstimadas / horasEstimadasGlobales) * 100) 
      : 0;

    resultado.push({
      nombre: val.nombre,
      tipo: val.tipo,
      totalTareas: val.totalTareas,
      horasEstimadas: val.horasEstimadas,
      horasInvertidas: val.horasInvertidas,
      porcentajeHoras,
      rolesInvolucrados: Array.from(val.rolesSet),
      tareas: val.tareas,
      colaboradoresIds: Array.from(val.colaboradoresSet),
    });
  });

  // Ordenar por mayor cantidad de horas estimadas descendente
  return resultado.sort((a, b) => b.horasEstimadas - a.horasEstimadas);
}
