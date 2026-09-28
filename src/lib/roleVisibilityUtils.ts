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
    (a.includes('produccion') || a.includes('productor') || a === 'r-10') &&
    (b.includes('produccion') || b.includes('productor') || b === 'r-10')
  ) {
    return true;
  }

  // Pedagogía / Asesoría Pedagógica / Diseño Instruccional
  if (
    (a.includes('pedagog') || a.includes('instruccional') || a === 'r-11') &&
    (b.includes('pedagog') || b.includes('instruccional') || b === 'r-11')
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
 * Obtiene el conjunto de IDs y nombres en minúscula de áreas y sub-áreas supervisadas por un usuario.
 * Respeta estrictamente la jerarquía institucional:
 * - El jefe de una sub-área SOLO supervisa su sub-área (y descendientes directos hacia abajo si los hubiere).
 *   Nunca sube al área padre ni accede a sub-áreas hermanas.
 * - El jefe de un área principal supervisa su área Y TODAS sus sub-áreas respectivas (recursivamente).
 */
export function getSupervisedAreasForUser(
  usuarioActual: Usuario | null,
  areas: Area[],
  roles: Rol[] = [],
  nivelArea: NivelArea = 1
): { areaIds: Set<string>; areaNombres: Set<string>; isJefe: boolean } {
  const areaIds = new Set<string>();
  const areaNombres = new Set<string>();

  if (!usuarioActual) {
    return { areaIds, areaNombres, isJefe: false };
  }

  const rolObj = roles.find(r => r.id === usuarioActual.rol_id);
  const rolNombre = usuarioActual.rol_nombre || rolObj?.nombre || '';

  // Administrador supervisa absolutamente todas las áreas
  if (isRoleMatch(rolNombre, 'Administrador')) {
    areas.forEach(a => {
      if (a.id) areaIds.add(a.id);
      if (a.nombre) areaNombres.add(a.nombre.toLowerCase());
    });
    return { areaIds, areaNombres, isJefe: true };
  }

  // Si el usuario tiene rol operativo (Diseño, Multimedia, Soporte, Producción, Pedagogía), NUNCA supervisa como Jefe de Área
  const isOperativo =
    isRoleMatch(rolNombre, 'Diseño') ||
    isRoleMatch(rolNombre, 'Multimedia') ||
    isRoleMatch(rolNombre, 'Soporte') ||
    isRoleMatch(rolNombre, 'Producción') ||
    isRoleMatch(rolNombre, 'Pedagogía');

  if (isOperativo) {
    return { areaIds, areaNombres, isJefe: false };
  }

  // 1. Identificar áreas donde está asignado explícitamente como jefe_id
  const areasJefeDirecto = areas.filter(a => a.jefe_id && a.jefe_id === usuarioActual.id);

  // 2. Si no tiene asignación directa como jefe_id, verificar si su rol es explícitamente de Jefe o Director
  const esRolJefe = isRoleMatch(rolNombre, 'Jefe') || isRoleMatch(rolNombre, 'Director') || rolNombre.toLowerCase().includes('jefatura');
  const areasBase: Area[] = [...areasJefeDirecto];

  if (areasBase.length === 0 && esRolJefe) {
    let areaAsignada: Area | undefined;
    if (usuarioActual.area_id) {
      areaAsignada = areas.find(a => a.id === usuarioActual.area_id);
    }
    if (!areaAsignada && usuarioActual.area_nombre) {
      areaAsignada = areas.find(a => a.nombre.toLowerCase() === usuarioActual.area_nombre?.toLowerCase());
    }
    if (!areaAsignada && rolObj?.area_id) {
      areaAsignada = areas.find(a => a.id === rolObj.area_id);
    }
    if (!areaAsignada && rolObj?.area_nombre) {
      areaAsignada = areas.find(a => a.nombre.toLowerCase() === rolObj.area_nombre?.toLowerCase());
    }
    if (areaAsignada) {
      areasBase.push(areaAsignada);
    }
  }

  if (areasBase.length === 0) {
    return { areaIds, areaNombres, isJefe: false };
  }

  // 3. Travesía jerárquica: ÚNICAMENTE hacia abajo (descendientes / sub-áreas).
  // Nunca hacia arriba (parent_id) y nunca hacia áreas hermanas.
  const agregarAreaYDescendientes = (area: Area) => {
    if (!area || !area.id || areaIds.has(area.id)) return;
    areaIds.add(area.id);
    if (area.nombre) areaNombres.add(area.nombre.toLowerCase());

    areas
      .filter(sub => (sub.parent_id === area.id || sub.parent_id === area.nombre) && sub.id !== area.id && !areaIds.has(sub.id))
      .forEach(sub => agregarAreaYDescendientes(sub));
  };

  areasBase.forEach(a => agregarAreaYDescendientes(a));

  return {
    areaIds,
    areaNombres,
    isJefe: areaIds.size > 0
  };
}

/**
 * Obtiene el conjunto de IDs y nombres de áreas accesibles para un colaborador según su área o sub-área asignada.
 * Respeta el aislamiento jerárquico:
 * - Un usuario adscrito a una sub-área sólo accede a esa sub-área y subdivisiones inferiores.
 * - Un usuario adscrito a un área principal accede a dicha área y a todas sus sub-áreas descendientes.
 */
export function getUserAreaScope(
  usuarioActual: Usuario | null,
  areas: Area[],
  roles: Rol[] = [],
  nivelArea: NivelArea = 1
): { areaIds: Set<string>; areaNombres: Set<string>; isRestricted: boolean } {
  const areaIds = new Set<string>();
  const areaNombres = new Set<string>();

  if (!usuarioActual) {
    return { areaIds, areaNombres, isRestricted: true };
  }

  const rolObj = roles.find(r => r.id === usuarioActual.rol_id);
  const rolNombre = usuarioActual.rol_nombre || rolObj?.nombre || '';

  // Administrador no tiene restricción
  if (isRoleMatch(rolNombre, 'Administrador')) {
    areas.forEach(a => {
      if (a.id) areaIds.add(a.id);
      if (a.nombre) areaNombres.add(a.nombre.toLowerCase());
    });
    return { areaIds, areaNombres, isRestricted: false };
  }

  let areaBase: Area | undefined;
  if (usuarioActual.area_id) {
    areaBase = areas.find(a => a.id === usuarioActual.area_id);
  }
  if (!areaBase && usuarioActual.area_nombre) {
    areaBase = areas.find(a => a.nombre.toLowerCase() === usuarioActual.area_nombre?.toLowerCase());
  }
  if (!areaBase && rolObj?.area_id) {
    areaBase = areas.find(a => a.id === rolObj.area_id);
  }
  if (!areaBase && rolObj?.area_nombre) {
    areaBase = areas.find(a => a.nombre.toLowerCase() === rolObj.area_nombre?.toLowerCase());
  }

  if (!areaBase) {
    return { areaIds, areaNombres, isRestricted: false };
  }

  const agregarAreaYDescendientes = (area: Area) => {
    if (!area || !area.id || areaIds.has(area.id)) return;
    areaIds.add(area.id);
    if (area.nombre) areaNombres.add(area.nombre.toLowerCase());

    areas
      .filter(sub => (sub.parent_id === area.id || sub.parent_id === area.nombre) && sub.id !== area.id && !areaIds.has(sub.id))
      .forEach(sub => agregarAreaYDescendientes(sub));
  };

  agregarAreaYDescendientes(areaBase);

  return {
    areaIds,
    areaNombres,
    isRestricted: areaIds.size > 0
  };
}

/**
 * Aplica las reglas estrictas de visibilidad y aislamiento de información por rol y jerarquía.
 * Cada rol ve exclusivamente lo que está bajo su responsabilidad:
 * - Administrador (Nivel 6): Visión total.
 * - Jefe de Departamento / Área: Proyectos y tareas de su departamento y todas sus subáreas respectivas.
 * - Jefe de Sub-área: Únicamente proyectos y tareas adscritos a su sub-área.
 * - Decano: Facultades, programas, cursos y proyectos de su facultad, o asignados directamente.
 * - Coordinador: Programas, cursos y tareas de su programa, o asignados directamente.
 * - Docente: Solo sus cursos asignados (donde es docente o par) y sus tareas correspondientes.
 * - Par Evaluador: Solo sus cursos asignados (donde es par o docente) y sus tareas correspondientes.
 * - Especialistas Operativos (Diseño, Multimedia, Soporte, Producción, Pedagogía): Tareas y proyectos de su área/sub-área asignadas a su especialidad.
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
  const isSupervisorGlobal = isRoleMatch(rolNombre, 'Administrador');

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

  // 1. Detección de Áreas/Departamentos bajo jefatura y sus subáreas jerárquicas
  const {
    areaIds: areaIdsSupervisadasPorJefe,
    areaNombres: areaNombresSupervisadasPorJefe,
    isJefe: esJefeDeArea
  } = getSupervisedAreasForUser(usuarioActual, areas, roles, nivelArea);

  const isAreaSupervisadaPorJefe = (areaIdOrName?: string) => {
    if (!areaIdOrName) return false;
    if (areaIdsSupervisadasPorJefe.has(areaIdOrName)) return true;
    if (areaNombresSupervisadasPorJefe.has(areaIdOrName.toLowerCase())) return true;
    const a = areas.find(x => x.id === areaIdOrName || x.nombre.toLowerCase() === areaIdOrName.toLowerCase());
    if (a && (areaIdsSupervisadasPorJefe.has(a.id) || areaNombresSupervisadasPorJefe.has(a.nombre.toLowerCase()))) {
      return true;
    }
    return false;
  };

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

  // 5. Determinar si el rol es operativo (Diseño, Multimedia, Soporte, Producción, Pedagogía)
  const isOperativoCMU =
    isRoleMatch(rolNombre, 'Diseño') ||
    isRoleMatch(rolNombre, 'Multimedia') ||
    isRoleMatch(rolNombre, 'Soporte') ||
    isRoleMatch(rolNombre, 'Producción') ||
    isRoleMatch(rolNombre, 'Pedagogía');

  // Ámbito de área asignada al usuario operativo respetando jerarquía de áreas y sub-áreas
  const {
    areaIds: areaIdsOperativo,
    areaNombres: areaNombresOperativo,
    isRestricted: tieneRestriccionAreaOperativa
  } = getUserAreaScope(usuarioActual, areas, roles, nivelArea);

  const isAreaEnAmbitoOperativo = (areaIdOrName?: string) => {
    if (!tieneRestriccionAreaOperativa) return true;
    if (!areaIdOrName) return true;
    if (areaIdsOperativo.has(areaIdOrName)) return true;
    if (areaNombresOperativo.has(areaIdOrName.toLowerCase())) return true;
    const a = areas.find(x => x.id === areaIdOrName || x.nombre.toLowerCase() === areaIdOrName.toLowerCase());
    if (a && (areaIdsOperativo.has(a.id) || areaNombresOperativo.has(a.nombre.toLowerCase()))) {
      return true;
    }
    return false;
  };

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

    // B. Roles Operativos (Diseño, Multimedia, Soporte, Producción, Pedagogía):
    // Un rol operativo SOLO puede ver tareas dirigidas a su especialidad dentro de su área/sub-área.
    // NUNCA ve tareas de otras especialidades o áreas ajenas a menos que esté asignado directamente como responsable (Sección A).
    if (isOperativoCMU) {
      const matchPrincipal = t.rol_destino && isRoleMatch(t.rol_destino, rolNombre);
      const matchSecundario = t.rol_destino_secundario && isRoleMatch(t.rol_destino_secundario, rolNombre);

      if (matchPrincipal || matchSecundario) {
        let perteneceArea = true;
        if (tieneRestriccionAreaOperativa) {
          if (t.area_id) {
            perteneceArea = isAreaEnAmbitoOperativo(t.area_id);
          } else if (t.proyecto_id) {
            const proy = proyectos.find(p => p.id === t.proyecto_id);
            if (proy?.area_id) {
              perteneceArea = isAreaEnAmbitoOperativo(proy.area_id);
            }
          }
        }
        return perteneceArea;
      }

      // Denegar completamente visibilidad de tareas de otras especialidades para roles operativos
      return false;
    }

    // C. Jefe de Área / Sub-área (no aplica para operativos):
    // - Ve tareas asignadas a la jefatura en sus áreas/sub-áreas supervisadas
    // - Ve TODAS las tareas correspondientes a proyectos adscritos a sus áreas/sub-áreas supervisadas
    if (esJefeDeArea) {
      if (isRoleMatch(t.rol_destino, 'Jefe') || isRoleMatch(t.rol_destino_secundario, 'Jefe')) {
        if (!t.area_id || isAreaSupervisadaPorJefe(t.area_id)) return true;
      }
      if (t.proyecto_id) {
        const proy = proyectos.find(p => p.id === t.proyecto_id);
        if (proy && proy.area_id && isAreaSupervisadaPorJefe(proy.area_id)) {
          return true;
        }
      }
    }

    // D. Decano: Tareas con rol destino Decano dentro de su facultad
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

    // E. Coordinador: Tareas con rol destino Coordinador dentro de sus programas coordinados
    if (programasDondeEsCoordinador.length > 0 || isRoleMatch(rolNombre, 'Coordinador')) {
      if (isRoleMatch(t.rol_destino, 'Coordinador') || isRoleMatch(t.rol_destino_secundario, 'Coordinador')) {
        if (!t.curso_id) return true;
        const c = cursos.find(item => item.id === t.curso_id);
        if (c && (idsProgramasCoordinador.has(c.programa_id) || (c.programa_nombre && nombresProgramasCoordinador.has(c.programa_nombre)))) {
          return true;
        }
      }
    }

    // F. Docente / Par Evaluador en cursos específicos
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

    // G. Líder o Co-Líder de Proyecto ve tareas dirigidas al liderazgo del proyecto o asignadas a él
    if (t.proyecto_id && idsProyectosAsignadosDirectamente.has(t.proyecto_id)) {
      if (isRoleMatch(t.rol_destino, 'Líder') || isRoleMatch(t.rol_destino, 'Lider') || !t.responsable_id) {
        return true;
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
    // Jefe de Área / Sub-área:
    // El jefe de una sub-área SOLO ve proyectos asignados a su sub-área.
    // El jefe de un área principal ve proyectos de dicha área Y de todas sus respectivas sub-áreas.
    if (esJefeDeArea && p.area_id && isAreaSupervisadaPorJefe(p.area_id)) {
      return true;
    }

    // Líder o Co-Líder asignado
    if (p.lider_id === usuarioActual.id || p.lider_secundario_id === usuarioActual.id) {
      return true;
    }

    // Decano: Proyectos de su facultad
    if (facultadesDondeEsDecano.length > 0 && p.area_id && (idsFacultadesDecano.has(p.area_id) || nombresFacultadesDecano.has(p.area_id))) {
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

/**
 * Determina si el usuario actual tiene permisos para editar una tarea específica.
 * Reglas de visualización y edición:
 * - Administrador (Nivel 6): Puede editar cualquier tarea del sistema.
 * - Jefe de Área / Sub-área: Puede editar las tareas de los proyectos adscritos a su jurisdicción:
 *   - El jefe de una sub-área SOLO puede editar tareas de los proyectos asignados a su sub-área.
 *   - El jefe de un área principal puede editar las tareas de los proyectos de dicha área y de todas sus sub-áreas respectivas.
 * - Líder o Co-líder de Proyecto: Puede editar las tareas del proyecto que lidera.
 */
export function canUserEditTask(
  usuarioActual: Usuario | null,
  tarea: TareaCCV,
  proyectos: ProyectoEspecial[],
  areas: Area[],
  roles: Rol[] = [],
  nivelArea: NivelArea = 1
): boolean {
  if (!usuarioActual) return false;

  const rolObj = roles.find(r => r.id === usuarioActual.rol_id);
  const rolNombre = usuarioActual.rol_nombre || rolObj?.nombre || '';

  // 1. Administrador tiene control total para editar cualquier tarea
  if (isRoleMatch(rolNombre, 'Administrador')) {
    return true;
  }

  // 2. Si la tarea pertenece a un proyecto especial
  if (tarea.tipo_tarea === 'Proyecto' || Boolean(tarea.proyecto_id)) {
    const proy = proyectos.find(p => p.id === tarea.proyecto_id);
    if (!proy) return false;

    // A. Líder o co-líder del proyecto asignado
    if (proy.lider_id === usuarioActual.id || proy.lider_secundario_id === usuarioActual.id) {
      return true;
    }

    // B. Jefe de Área o Sub-área adscrita al proyecto
    const proyAreaId = proy.area_id;
    if (proyAreaId) {
      const { areaIds, areaNombres, isJefe } = getSupervisedAreasForUser(usuarioActual, areas, roles, nivelArea);
      if (isJefe) {
        if (areaIds.has(proyAreaId) || areaNombres.has(proyAreaId.toLowerCase())) {
          return true;
        }
        const a = areas.find(x => x.id === proyAreaId || x.nombre.toLowerCase() === proyAreaId.toLowerCase());
        if (a && (areaIds.has(a.id) || areaNombres.has(a.nombre.toLowerCase()))) {
          return true;
        }
      }
    }
  }

  return false;
}

