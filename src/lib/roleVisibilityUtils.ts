import {
  Usuario,
  Rol,
  Area,
  NivelArea,
  Facultad,
  Programa,
  CursoVirtual,
  ProyectoEspecial,
  TareaCCV,
  TareaComentario,
  PublicacionParrilla,
} from '@/types';

/**
 * Normaliza nombres de roles removiendo acentos, espacios extras y pasando a minúsculas.
 */
export function normalizeRoleName(roleName?: string): string {
  if (!roleName) return '';
  return roleName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Compara dos nombres de roles considerando sinónimos y variaciones habituales.
 */
export function isRoleMatch(roleA?: string, roleB?: string): boolean {
  if (!roleA || !roleB) return false;
  const a = normalizeRoleName(roleA);
  const b = normalizeRoleName(roleB);

  if (a === b) return true;

  // Administrador
  if ((a.includes('admin') || a === 'r-1') && (b.includes('admin') || b === 'r-1')) return true;

  // Jefe de departamento
  if (a.includes('jefe') && b.includes('jefe')) return true;

  // Diseño
  if (
    (a.includes('disen') || a === 'r-3') &&
    (b.includes('disen') || b === 'r-3')
  ) {
    return true;
  }

  // Multimedia
  if (
    (a.includes('multimedia') || a === 'r-4') &&
    (b.includes('multimedia') || b === 'r-4')
  ) {
    return true;
  }

  // Soporte
  if (
    (a.includes('soporte') || a === 'r-5') &&
    (b.includes('soporte') || b === 'r-5')
  ) {
    return true;
  }

  // Producción
  if (
    (a.includes('produccion') || a.includes('productor')) &&
    (b.includes('produccion') || b.includes('productor'))
  ) {
    return true;
  }

  // Decano
  if (
    (a.includes('decano') || a.includes('decana') || a === 'r-6') &&
    (b.includes('decano') || b.includes('decana') || b === 'r-6')
  ) {
    return true;
  }

  // Coordinador
  if (
    (a.includes('coordinador') || a.includes('coordinacion') || a === 'r-7') &&
    (b.includes('coordinador') || b.includes('coordinacion') || b === 'r-7')
  ) {
    return true;
  }

  // Docente / Profesor
  if (
    (a.includes('docente') || a.includes('profesor') || a.includes('autor') || a === 'r-8') &&
    (b.includes('docente') || b.includes('profesor') || b.includes('autor') || b === 'r-8')
  ) {
    return true;
  }

  // Par Evaluador
  if (
    (a.includes('evaluador') || a.includes('par') || a === 'r-9') &&
    (b.includes('evaluador') || b.includes('par') || b === 'r-9')
  ) {
    return true;
  }

  return false;
}

export interface FilterEntitiesParams {
  usuarioActual: Usuario | null;
  nivelArea: NivelArea;
  roles: Rol[];
  areas: Area[];
  facultades: Facultad[];
  programas: Programa[];
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  tareas: TareaCCV[];
  comentarios?: TareaComentario[];
}

export interface FilteredEntitiesResult {
  isSupervisorGlobal: boolean;
  tareasVisibles: TareaCCV[];
  cursosVisibles: CursoVirtual[];
  proyectosVisibles: ProyectoEspecial[];
  programasVisibles: Programa[];
  facultadesVisibles: Facultad[];
  comentariosVisibles: TareaComentario[];
}

/**
 * Aplica las reglas estrictas de visibilidad y aislamiento de información por rol y jerarquía.
 * Cada rol ve exclusivamente lo que está bajo su responsabilidad:
 * - Administrador (Nivel 6): Visión total.
 * - Jefe de Departamento: Proyectos y tareas de su departamento y subáreas.
 * - Decano: Facultades, programas, cursos y proyectos de su facultad, o asignados directamente.
 * - Coordinador: Programas, cursos y tareas de su programa, o asignados directamente.
 * - Docente: Solo sus cursos asignados (donde es docente o par) y sus tareas correspondientes.
 * - Par Evaluador: Solo sus cursos asignados (donde es par o docente) y sus tareas correspondientes.
 * - Especialistas CMU (Diseño, Multimedia, Soporte, Producción): Tareas asignadas a su rol/usuario y los cursos/proyectos respectivos.
 */
export function getEntitiesVisibleByRole(params: FilterEntitiesParams): FilteredEntitiesResult {
  const {
    usuarioActual,
    nivelArea,
    roles,
    areas,
    facultades,
    programas,
    cursos,
    proyectos,
    tareas,
    comentarios = [],
  } = params;

  if (!usuarioActual) {
    return {
      isSupervisorGlobal: false,
      tareasVisibles: [],
      cursosVisibles: [],
      proyectosVisibles: [],
      programasVisibles: [],
      facultadesVisibles: [],
      comentariosVisibles: [],
    };
  }

  const rolObj = roles.find(r => r.id === usuarioActual.rol_id);
  const rolNombre = usuarioActual.rol_nombre || rolObj?.nombre || '';
  const isSupervisorGlobal = nivelArea === 6 || isRoleMatch(rolNombre, 'Administrador');

  if (isSupervisorGlobal) {
    return {
      isSupervisorGlobal: true,
      tareasVisibles: tareas,
      cursosVisibles: cursos,
      proyectosVisibles: proyectos,
      programasVisibles: programas,
      facultadesVisibles: facultades,
      comentariosVisibles: comentarios,
    };
  }

  // 1. Detección de Áreas/Departamentos bajo jefatura
  const areasDondeEsJefe = areas.filter(
    a =>
      (a.jefe_id && a.jefe_id === usuarioActual.id) ||
      (isRoleMatch(rolNombre, 'Jefe') &&
        (a.id === rolObj?.area_id || a.nombre === rolObj?.area_nombre || a.nombre === usuarioActual.area_nombre))
  );

  const areaIdsSupervisadasPorJefe = new Set<string>();
  const agregarAreaYSubareas = (areaId: string) => {
    if (!areaId || areaIdsSupervisadasPorJefe.has(areaId)) return;
    areaIdsSupervisadasPorJefe.add(areaId);
    areas
      .filter(sub => sub.parent_id === areaId && sub.id && sub.id !== areaId && !areaIdsSupervisadasPorJefe.has(sub.id))
      .forEach(sub => agregarAreaYSubareas(sub.id));
  };
  areasDondeEsJefe.forEach(a => {
    if (a.id) agregarAreaYSubareas(a.id);
  });
  const esJefeDeArea = areaIdsSupervisadasPorJefe.size > 0;

  // 2. Detección de Facultades y Programas a cargo
  const facultadesDondeEsDecano = facultades.filter(
    f =>
      f.decano_id === usuarioActual.id ||
      (isRoleMatch(rolNombre, 'Decano') &&
        (f.nombre === usuarioActual.area_nombre || f.nombre === rolObj?.area_nombre))
  );
  const nombresFacultadesDecano = new Set(facultadesDondeEsDecano.map(f => f.nombre));
  const idsFacultadesDecano = new Set(facultadesDondeEsDecano.map(f => f.id));

  const programasDondeEsCoordinador = programas.filter(
    p =>
      p.coordinador_id === usuarioActual.id ||
      (isRoleMatch(rolNombre, 'Coordinador') &&
        (p.nombre === usuarioActual.area_nombre || p.nombre === rolObj?.area_nombre))
  );
  const idsProgramasCoordinador = new Set(programasDondeEsCoordinador.map(p => p.id));
  const nombresProgramasCoordinador = new Set(programasDondeEsCoordinador.map(p => p.nombre));

  // 3. Detección de Cursos asignados directamente (Docente / Evaluador)
  const cursosAsignadosDirectamente = cursos.filter(
    c => c.docente_id === usuarioActual.id || c.evaluador_id === usuarioActual.id
  );
  const idsCursosAsignadosDirectamente = new Set(cursosAsignadosDirectamente.map(c => c.id));

  // 4. Detección de Proyectos asignados directamente (Líder / Co-Líder)
  const proyectosAsignadosDirectamente = proyectos.filter(
    p => p.lider_id === usuarioActual.id || p.lider_secundario_id === usuarioActual.id
  );
  const idsProyectosAsignadosDirectamente = new Set(proyectosAsignadosDirectamente.map(p => p.id));

  // 5. Determinar si el rol es operativo CMU (Diseño, Multimedia, Soporte, Producción)
  const isOperativoCMU =
    isRoleMatch(rolNombre, 'Diseño') ||
    isRoleMatch(rolNombre, 'Multimedia') ||
    isRoleMatch(rolNombre, 'Soporte') ||
    isRoleMatch(rolNombre, 'Producción');

  // 6. Filtrar Tareas Visibles
  const tareasVisibles = tareas.filter(t => {
    // Las tareas bloqueadas no son visibles para roles no administradores
    if (t.estado_bloqueo === 'BLOQUEADA') {
      return false;
    }

    // A. Asignado directamente al usuario como responsable principal o secundario
    if (t.responsable_id === usuarioActual.id || t.responsable_secundario_id === usuarioActual.id) {
      return true;
    }

    // B. Jefe de departamento: Tareas asignadas a la jefatura o directamente a su usuario
    if (esJefeDeArea) {
      if (isRoleMatch(t.rol_destino, 'Jefe') || isRoleMatch(t.rol_destino_secundario, 'Jefe')) {
        if (!t.area_id || areaIdsSupervisadasPorJefe.has(t.area_id)) return true;
      }
    }

    // C. Decano: Tareas con rol destino Decano dentro de su facultad
    if (facultadesDondeEsDecano.length > 0 || isRoleMatch(rolNombre, 'Decano')) {
      if (isRoleMatch(t.rol_destino, 'Decano') || isRoleMatch(t.rol_destino_secundario, 'Decano')) {
        if (!t.curso_id && !t.proyecto_id) return true;
        if (t.curso_id) {
          const c = cursos.find(item => item.id === t.curso_id);
          if (c && ((c.facultad_nombre && nombresFacultadesDecano.has(c.facultad_nombre)) || (c.programa_id && programas.some(prog => prog.id === c.programa_id && idsFacultadesDecano.has(prog.facultad_id))))) {
            return true;
          }
        }
        if (t.proyecto_id) {
          const p = proyectos.find(item => item.id === t.proyecto_id);
          if (p && ((p.area_id && idsFacultadesDecano.has(p.area_id)) || p.lider_id === usuarioActual.id || p.lider_secundario_id === usuarioActual.id)) {
            return true;
          }
        }
      }
    }

    // D. Coordinador: Tareas con rol destino Coordinador dentro de sus programas coordinados
    if (programasDondeEsCoordinador.length > 0 || isRoleMatch(rolNombre, 'Coordinador')) {
      if (isRoleMatch(t.rol_destino, 'Coordinador') || isRoleMatch(t.rol_destino_secundario, 'Coordinador')) {
        if (!t.curso_id) return true;
        const c = cursos.find(item => item.id === t.curso_id);
        if (c && (idsProgramasCoordinador.has(c.programa_id) || (c.programa_nombre && nombresProgramasCoordinador.has(c.programa_nombre)))) {
          return true;
        }
      }
    }

    // E. Docente / Par Evaluador en cursos específicos
    if (t.curso_id && idsCursosAsignadosDirectamente.has(t.curso_id)) {
      const cursoDeTarea = cursos.find(c => c.id === t.curso_id);
      if (cursoDeTarea) {
        const esDocenteDelCurso = cursoDeTarea.docente_id === usuarioActual.id;
        const esEvaluadorDelCurso = cursoDeTarea.evaluador_id === usuarioActual.id;

        // Tarea para el docente asignado al curso (si no tiene responsable asignado o si es el docente)
        if (esDocenteDelCurso && (
          isRoleMatch(t.rol_destino, 'Docente') ||
          isRoleMatch(t.rol_destino_secundario, 'Docente') ||
          (isRoleMatch(rolNombre, 'Docente') && (!t.rol_destino || t.rol_destino === 'General'))
        )) {
          return true;
        }

        // Tarea para el par evaluador asignado al curso
        if (esEvaluadorDelCurso && (
          isRoleMatch(t.rol_destino, 'Par Evaluador') ||
          isRoleMatch(t.rol_destino_secundario, 'Par Evaluador') ||
          (isRoleMatch(rolNombre, 'Par Evaluador') && (!t.rol_destino || t.rol_destino === 'General'))
        )) {
          return true;
        }
      }
    }

    // F. Líder o Co-Líder de Proyecto ve tareas dirigidas al liderazgo del proyecto o asignadas a él
    if (t.proyecto_id && idsProyectosAsignadosDirectamente.has(t.proyecto_id)) {
      if (isRoleMatch(t.rol_destino, 'Líder') || isRoleMatch(t.rol_destino, 'Lider') || !t.responsable_id) {
        return true;
      }
    }

    // G. Roles Operativos CMU (Diseño, Multimedia, Soporte, Producción):
    // Ven las tareas asignadas específicamente a su especialidad cuando no tienen otro responsable exclusivo
    if (isOperativoCMU) {
      const matchPrincipal = t.rol_destino && isRoleMatch(t.rol_destino, rolNombre);
      const matchSecundario = t.rol_destino_secundario && isRoleMatch(t.rol_destino_secundario, rolNombre);
      if (matchPrincipal || matchSecundario) {
        // Si la tarea tiene un responsable_id diferente y específico, sólo la ve ese usuario responsable (o si el usuario actual es el asignado)
        if (!t.responsable_id || t.responsable_id === usuarioActual.id || t.responsable_secundario_id === usuarioActual.id) {
          return true;
        }
      }
    }

    return false;
  });

  const idsCursosConTareasVisibles = new Set(tareasVisibles.map(t => t.curso_id).filter(Boolean));
  const idsProyectosConTareasVisibles = new Set(tareasVisibles.map(t => t.proyecto_id).filter(Boolean));

  // 7. Cursos Visibles por Rol
  const cursosVisibles = cursos.filter(c => {
    // Decano: Cursos de su facultad
    if (facultadesDondeEsDecano.length > 0) {
      if (c.facultad_nombre && nombresFacultadesDecano.has(c.facultad_nombre)) return true;
      const prog = programas.find(p => p.id === c.programa_id);
      if (prog && idsFacultadesDecano.has(prog.facultad_id)) return true;
    }

    // Coordinador: Cursos de su programa
    if (programasDondeEsCoordinador.length > 0) {
      if (idsProgramasCoordinador.has(c.programa_id) || (c.programa_nombre && nombresProgramasCoordinador.has(c.programa_nombre))) {
        return true;
      }
    }

    // Docente o Evaluador asignado al curso
    if (c.docente_id === usuarioActual.id || c.evaluador_id === usuarioActual.id) {
      return true;
    }

    // O si tiene tareas visibles asignadas en ese curso
    if (idsCursosConTareasVisibles.has(c.id)) {
      return true;
    }

    return false;
  });

  // 8. Proyectos Visibles por Rol
  const proyectosVisibles = proyectos.filter(p => {
    // Jefe de Departamento: Proyectos adscritos a su departamento/subáreas
    if (esJefeDeArea && p.area_id && areaIdsSupervisadasPorJefe.has(p.area_id)) {
      return true;
    }

    // Líder o Co-Líder asignado
    if (p.lider_id === usuarioActual.id || p.lider_secundario_id === usuarioActual.id) {
      return true;
    }

    // Decano: Proyectos de su facultad
    if (facultadesDondeEsDecano.length > 0 && p.area_id && idsFacultadesDecano.has(p.area_id)) {
      return true;
    }

    // O si tiene tareas visibles asignadas en ese proyecto
    if (idsProyectosConTareasVisibles.has(p.id)) {
      return true;
    }

    return false;
  });

  // 9. Programas Visibles por Rol
  const visibleCursosProgIds = new Set(cursosVisibles.map(c => c.programa_id));
  const visibleCursosProgNames = new Set(cursosVisibles.map(c => c.programa_nombre));

  const programasVisibles = programas.filter(p => {
    if (facultadesDondeEsDecano.length > 0) {
      if (idsFacultadesDecano.has(p.facultad_id) || nombresFacultadesDecano.has(p.facultad_nombre || '')) {
        return true;
      }
    }

    if (p.coordinador_id === usuarioActual.id) {
      return true;
    }

    if (visibleCursosProgIds.has(p.id) || visibleCursosProgNames.has(p.nombre)) {
      return true;
    }

    return false;
  });

  // 10. Facultades Visibles por Rol
  const visibleProgFacIds = new Set(programasVisibles.map(p => p.facultad_id));
  const visibleProgFacNames = new Set(programasVisibles.map(p => p.facultad_nombre).filter(Boolean));

  const facultadesVisibles = facultades.filter(f => {
    if (f.decano_id === usuarioActual.id) return true;
    if (visibleProgFacIds.has(f.id) || visibleProgFacNames.has(f.nombre)) return true;
    return false;
  });

  // 11. Comentarios Visibles por Rol
  const idsTareasVisibles = new Set(tareasVisibles.map(t => t.id));
  const comentariosVisibles = comentarios.filter(com => idsTareasVisibles.has(com.tarea_id));

  return {
    isSupervisorGlobal: false,
    tareasVisibles,
    cursosVisibles,
    proyectosVisibles,
    programasVisibles,
    facultadesVisibles,
    comentariosVisibles,
  };
}
