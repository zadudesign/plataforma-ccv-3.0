import { supabase } from './supabaseClient';
import {
  Usuario,
  Rol,
  Area,
  PermisoDef,
  Facultad,
  Programa,
  CursoVirtual,
  ProyectoEspecial,
  TareaCCV,
  TareaComentario,
  RegistroHoras,
  EstadoTarea,
  TipoTarea
} from '@/types';


// Helper para determinar si Supabase responde adecuadamente
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('areas').select('id').limit(1);
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// 1. ÁREAS, ROLES, PERMISOS Y USUARIOS
// ----------------------------------------------------------------------------

export async function fetchAreas(): Promise<Area[]> {
  try {
    const { data, error } = await supabase.from('areas').select('*').order('nivel', { ascending: false });
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      nombre: item.nombre,
      nivel: item.nivel,
      parent_id: item.parent_id,
      created_at: item.created_at
    }));
  } catch {
    return [];
  }
}

export async function fetchRoles(): Promise<Rol[]> {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*, areas(nombre)');
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      nombre: item.nombre,
      area_id: item.area_id,
      area_nombre: item.areas?.nombre || 'General',
      created_at: item.created_at
    }));
  } catch {
    return [];
  }
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(nombre, areas(nombre))');
    if (error || !data) return [];
    return data.map((u: any) => ({
      id: u.id,
      nombre_completo: u.nombre_completo,
      email: u.email,
      rol_id: u.rol_id,
      rol_nombre: u.roles?.nombre || 'Docente',
      area_nombre: u.roles?.areas?.nombre || 'CURSO',
      firma_digital: u.firma_digital,
      avatar_url: u.avatar_url,
      telefono: u.telefono,
      activo: u.activo,
      created_at: u.created_at
    }));
  } catch {
    return [];
  }
}

// Helper de validación de UUID para PostgreSQL
export function isGuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function updateUsuarioDB(id: string, datos: Partial<Usuario>): Promise<boolean> {
  try {
    if (!isGuid(id)) return false;

    const payload: any = {};
    if (datos.nombre_completo !== undefined) payload.nombre_completo = datos.nombre_completo;
    if (datos.email !== undefined) payload.email = datos.email;
    if (datos.rol_id !== undefined && isGuid(datos.rol_id)) payload.rol_id = datos.rol_id;
    if (datos.telefono !== undefined) payload.telefono = datos.telefono;
    if (datos.activo !== undefined) payload.activo = datos.activo;
    if (datos.avatar_url !== undefined) payload.avatar_url = datos.avatar_url;
    if (datos.firma_digital !== undefined) payload.firma_digital = datos.firma_digital;

    const { error } = await supabase
      .from('usuarios')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar usuario en Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción al actualizar usuario en Supabase:', err);
    return false;
  }
}

export async function deleteUsuarioDB(id: string): Promise<boolean> {
  try {
    if (!isGuid(id)) return false;
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar usuario en Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción al eliminar usuario en Supabase:', err);
    return false;
  }
}

export async function createAreaDB(nombre: string, nivel: number, parentId?: string | null): Promise<Area | null> {
  try {
    const payload: any = { nombre, nivel };
    if (parentId && isGuid(parentId)) payload.parent_id = parentId;
    const { data, error } = await supabase.from('areas').insert(payload).select().single();
    if (error) {
      console.error('Supabase Error (createAreaDB):', error);
      return null;
    }
    return {
      id: data.id,
      nombre: data.nombre,
      nivel: data.nivel,
      parent_id: data.parent_id,
      created_at: data.created_at
    };
  } catch (err) {
    console.error('Excepción (createAreaDB):', err);
    return null;
  }
}

// ----------------------------------------------------------------------------
// 2. ENTIDADES ACADÉMICAS (FACULTADES, PROGRAMAS, CURSOS, PROYECTOS)
// ----------------------------------------------------------------------------

export async function fetchFacultades(): Promise<Facultad[]> {
  try {
    const { data, error } = await supabase
      .from('facultades')
      .select('*, decano:usuarios!decano_id(nombre_completo)');
    if (error || !data) return [];
    return data.map((f: any) => ({
      id: f.id,
      nombre: f.nombre,
      decano_id: f.decano_id,
      decano_nombre: f.decano?.nombre_completo,
      created_at: f.created_at
    }));
  } catch {
    return [];
  }
}

export async function createFacultadDB(nombre: string, decanoId?: string): Promise<Facultad | null> {
  try {
    const payload: any = { nombre };
    if (decanoId && isGuid(decanoId)) payload.decano_id = decanoId;
    const { data, error } = await supabase.from('facultades').insert(payload).select().single();
    if (error) {
      console.error('Supabase Error (createFacultadDB):', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Excepción (createFacultadDB):', err);
    return null;
  }
}

export async function updateFacultadDB(facultadId: string, decanoId?: string | null): Promise<boolean> {
  try {
    if (!isGuid(facultadId)) return false;
    const payload: any = { decano_id: isGuid(decanoId) ? decanoId : null };
    const { error } = await supabase.from('facultades').update(payload).eq('id', facultadId);
    if (error) console.error('Error actualizando facultad en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción actualizando facultad:', err);
    return false;
  }
}

export async function fetchProgramas(): Promise<Programa[]> {
  try {
    const { data, error } = await supabase
      .from('programas')
      .select('*, facultades(nombre), coordinador:usuarios!coordinador_id(nombre_completo)');
    if (error || !data) return [];
    return data.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      facultad_id: p.facultad_id,
      facultad_nombre: p.facultades?.nombre,
      coordinador_id: p.coordinador_id,
      coordinador_nombre: p.coordinador?.nombre_completo,
      created_at: p.created_at
    }));
  } catch {
    return [];
  }
}

export async function createProgramaDB(nombre: string, facultadId: string, coordinadorId?: string): Promise<Programa | null> {
  try {
    let validFacultadId = isGuid(facultadId) ? facultadId : null;

    // Si la facultad_id no es un UUID válido (ej. mock local 'f-1'), resolver/crear una facultad base en Supabase
    if (!validFacultadId) {
      const { data: facultadesExistentes } = await supabase.from('facultades').select('id').limit(1);
      if (facultadesExistentes && facultadesExistentes.length > 0) {
        validFacultadId = facultadesExistentes[0].id;
      } else {
        const nuevaFac = await createFacultadDB('Facultad General');
        validFacultadId = nuevaFac?.id || null;
      }
    }

    if (!validFacultadId) {
      console.error('No se pudo asociar una facultad válida en Supabase.');
      return null;
    }

    const payload: any = { nombre, facultad_id: validFacultadId };
    if (coordinadorId && isGuid(coordinadorId)) payload.coordinador_id = coordinadorId;

    const { data, error } = await supabase.from('programas').insert(payload).select().single();
    if (error) {
      console.error('Supabase Error (createProgramaDB):', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Excepción (createProgramaDB):', err);
    return null;
  }
}

export async function updateProgramaDB(programaId: string, coordinadorId?: string | null): Promise<boolean> {
  try {
    if (!isGuid(programaId)) return false;
    const payload: any = { coordinador_id: isGuid(coordinadorId) ? coordinadorId : null };
    const { error } = await supabase.from('programas').update(payload).eq('id', programaId);
    if (error) console.error('Error actualizando programa en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción actualizando programa:', err);
    return false;
  }
}

export async function fetchProyectos(): Promise<ProyectoEspecial[]> {
  try {
    const { data, error } = await supabase.from('proyectos').select('*');
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function createProyectoDB(proyecto: Omit<ProyectoEspecial, 'id'>): Promise<ProyectoEspecial | null> {
  try {
    const payload: any = {
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      estado: proyecto.estado || 'En Proceso'
    };
    if (proyecto.area_id && isGuid(proyecto.area_id)) payload.area_id = proyecto.area_id;
    if (proyecto.lider_id && isGuid(proyecto.lider_id)) payload.lider_id = proyecto.lider_id;

    const { data, error } = await supabase.from('proyectos').insert(payload).select().single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchCursos(): Promise<CursoVirtual[]> {
  try {
    const { data, error } = await supabase
      .from('cursos')
      .select(`
        *,
        programas(nombre, facultades(nombre)),
        docente:usuarios!docente_id(nombre_completo),
        evaluador:usuarios!evaluador_id(nombre_completo)
      `);
    if (error || !data) return [];
    return data.map((c: any) => ({
      id: c.id,
      nombre: c.nombre,
      codigo: c.codigo,
      programa_id: c.programa_id,
      programa_nombre: c.programas?.nombre,
      facultad_nombre: c.programas?.facultades?.nombre,
      periodo: c.periodo,
      docente_id: c.docente_id,
      docente_nombre: c.docente?.nombre_completo,
      evaluador_id: c.evaluador_id,
      evaluador_nombre: c.evaluador?.nombre_completo,
      estado: c.estado,
      created_at: c.created_at
    }));
  } catch {
    return [];
  }
}

export async function createCursoDB(curso: Omit<CursoVirtual, 'id'>): Promise<CursoVirtual | null> {
  try {
    let validProgramaId = isGuid(curso.programa_id) ? curso.programa_id : null;

    // Si programa_id no es UUID válido, resolver/crear un programa base en Supabase
    if (!validProgramaId) {
      const { data: programasExistentes } = await supabase.from('programas').select('id').limit(1);
      if (programasExistentes && programasExistentes.length > 0) {
        validProgramaId = programasExistentes[0].id;
      } else {
        const nuevoProg = await createProgramaDB('Programa General', 'f-1');
        validProgramaId = nuevoProg?.id || null;
      }
    }

    if (!validProgramaId) {
      console.error('No se pudo asociar un programa válido en Supabase para el curso.');
      return null;
    }

    const payload: any = {
      nombre: curso.nombre,
      codigo: curso.codigo,
      programa_id: validProgramaId,
      periodo: curso.periodo || '2026-1',
      docente_id: isGuid(curso.docente_id) ? curso.docente_id : null,
      evaluador_id: isGuid(curso.evaluador_id) ? curso.evaluador_id : null,
      estado: curso.estado || 'En Diseño'
    };
    const { data, error } = await supabase.from('cursos').insert(payload).select().single();
    if (error) {
      console.error('Supabase Error (createCursoDB):', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Excepción (createCursoDB):', err);
    return null;
  }
}

export async function updateCursoDB(cursoId: string, updates: Partial<{ docente_id: string | null; evaluador_id: string | null; estado: string }>): Promise<boolean> {
  try {
    if (!isGuid(cursoId)) return false;
    const payload: any = {};
    if (updates.docente_id !== undefined) payload.docente_id = isGuid(updates.docente_id) ? updates.docente_id : null;
    if (updates.evaluador_id !== undefined) payload.evaluador_id = isGuid(updates.evaluador_id) ? updates.evaluador_id : null;
    if (updates.estado !== undefined) payload.estado = updates.estado;

    const { error } = await supabase.from('cursos').update(payload).eq('id', cursoId);
    if (error) console.error('Error actualizando curso en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción actualizando curso:', err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// ELIMINACIÓN Y EDICIÓN COMPLETA DE ENTIDADES ACADÉMICAS
// ----------------------------------------------------------------------------

export async function deleteFacultadDB(id: string): Promise<boolean> {
  try {
    if (!isGuid(id)) return true;
    const { error } = await supabase.from('facultades').delete().eq('id', id);
    if (error) console.error('Error al eliminar facultad en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción al eliminar facultad:', err);
    return false;
  }
}

export async function updateFacultadFullDB(id: string, nombre: string, decanoId?: string): Promise<boolean> {
  try {
    if (!isGuid(id)) return true;
    const payload: any = { nombre };
    payload.decano_id = isGuid(decanoId) ? decanoId : null;
    const { error } = await supabase.from('facultades').update(payload).eq('id', id);
    if (error) console.error('Error al actualizar facultad en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción al actualizar facultad:', err);
    return false;
  }
}

export async function deleteProgramaDB(id: string): Promise<boolean> {
  try {
    if (!isGuid(id)) return true;
    const { error } = await supabase.from('programas').delete().eq('id', id);
    if (error) console.error('Error al eliminar programa en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción al eliminar programa:', err);
    return false;
  }
}

export async function updateProgramaFullDB(id: string, nombre: string, facultadId: string, coordinadorId?: string): Promise<boolean> {
  try {
    if (!isGuid(id)) return true;
    const payload: any = { nombre };
    if (isGuid(facultadId)) payload.facultad_id = facultadId;
    payload.coordinador_id = isGuid(coordinadorId) ? coordinadorId : null;
    const { error } = await supabase.from('programas').update(payload).eq('id', id);
    if (error) console.error('Error al actualizar programa en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción al actualizar programa:', err);
    return false;
  }
}

export async function deleteCursoDB(id: string): Promise<boolean> {
  try {
    if (!isGuid(id)) return true;
    const { error } = await supabase.from('cursos').delete().eq('id', id);
    if (error) console.error('Error al eliminar curso en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción al eliminar curso:', err);
    return false;
  }
}

export async function updateCursoFullDB(id: string, datos: Partial<CursoVirtual>): Promise<boolean> {
  try {
    if (!isGuid(id)) return true;
    const payload: any = {};
    if (datos.nombre) payload.nombre = datos.nombre;
    if (datos.codigo) payload.codigo = datos.codigo;
    if (datos.programa_id && isGuid(datos.programa_id)) payload.programa_id = datos.programa_id;
    if (datos.periodo) payload.periodo = datos.periodo;
    if (datos.docente_id !== undefined) payload.docente_id = isGuid(datos.docente_id) ? datos.docente_id : null;
    if (datos.evaluador_id !== undefined) payload.evaluador_id = isGuid(datos.evaluador_id) ? datos.evaluador_id : null;
    if (datos.estado) payload.estado = datos.estado;

    const { error } = await supabase.from('cursos').update(payload).eq('id', id);
    if (error) console.error('Error al actualizar curso en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción al actualizar curso:', err);
    return false;
  }
}

export async function deleteProyectoDB(id: string): Promise<boolean> {
  try {
    if (!isGuid(id)) return true;
    const { error } = await supabase.from('proyectos').delete().eq('id', id);
    if (error) console.error('Error al eliminar proyecto en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción al eliminar proyecto:', err);
    return false;
  }
}

export async function updateProyectoFullDB(id: string, datos: Partial<ProyectoEspecial>): Promise<boolean> {
  try {
    if (!isGuid(id)) return true;
    const payload: any = {};
    if (datos.nombre) payload.nombre = datos.nombre;
    if (datos.descripcion !== undefined) payload.descripcion = datos.descripcion;
    if (datos.area_id !== undefined) payload.area_id = isGuid(datos.area_id) ? datos.area_id : null;
    if (datos.lider_id !== undefined) payload.lider_id = isGuid(datos.lider_id) ? datos.lider_id : null;
    if (datos.estado) payload.estado = datos.estado;

    const { error } = await supabase.from('proyectos').update(payload).eq('id', id);
    if (error) console.error('Error al actualizar proyecto en Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Excepción al actualizar proyecto:', err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 3. TAREAS Y COMENTARIOS
// ----------------------------------------------------------------------------

export async function fetchTareasDB(): Promise<TareaCCV[]> {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select(`
        *,
        proyecto:proyectos(nombre),
        curso:cursos(nombre),
        area:areas(nombre),
        responsable:usuarios!responsable_id(nombre_completo, avatar_url)
      `)
      .order('orden_tarea', { ascending: true });

    if (error || !data) return [];

    return data.map((t: any) => ({
      id: t.id,
      titulo: t.titulo,
      descripcion: t.descripcion || '',
      proyecto_id: t.proyecto_id,
      proyecto_nombre: t.proyecto?.nombre,
      curso_id: t.curso_id,
      curso_nombre: t.curso?.nombre,
      area_id: t.area_id,
      area_nombre: t.area?.nombre,
      responsable_id: t.responsable_id,
      responsable_nombre: t.responsable?.nombre_completo,
      responsable_avatar: t.responsable?.avatar_url,
      rol_destino: t.rol_destino,
      orden_tarea: t.orden_tarea || 0,
      estado: t.estado as EstadoTarea,
      tipo_tarea: (t.tipo_tarea === 'Curso Virtual' ? 'Curso Virtual' : 'Proyecto') as TipoTarea,
      fecha_vencimiento: t.fecha_vencimiento || new Date().toISOString().split('T')[0],
      fecha_completada: t.fecha_completada,
      tiempo_estimado: Number(t.tiempo_estimado || 0),
      tiempo_invertido: Number(t.tiempo_invertido || 0),
      tarifa_tarea: Number(t.tarifa_tarea || 0),
      created_at: t.created_at
    }));
  } catch {
    return [];
  }
}

export async function createTareaDB(tarea: Omit<TareaCCV, 'id'>): Promise<TareaCCV | null> {
  try {
    const payload = {
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      proyecto_id: tarea.proyecto_id || null,
      curso_id: tarea.curso_id || null,
      area_id: tarea.area_id || null,
      responsable_id: tarea.responsable_id || null,
      rol_destino: tarea.rol_destino || null,
      orden_tarea: tarea.orden_tarea || 0,
      estado: tarea.estado,
      tipo_tarea: tarea.tipo_tarea === 'Proyecto' ? 'Proyecto Especial' : tarea.tipo_tarea,
      fecha_vencimiento: tarea.fecha_vencimiento,
      tiempo_estimado: tarea.tiempo_estimado || 0,
      tiempo_invertido: tarea.tiempo_invertido || 0,
      tarifa_tarea: tarea.tarifa_tarea || 0
    };
    const { data, error } = await supabase.from('tareas').insert(payload).select().single();
    if (error) return null;
    return {
      ...tarea,
      id: data.id,
      created_at: data.created_at
    };
  } catch {
    return null;
  }
}

export async function updateTareaEstadoDB(id: string, nuevoEstado: EstadoTarea): Promise<boolean> {
  try {
    const payload: any = { estado: nuevoEstado, updated_at: new Date().toISOString() };
    if (nuevoEstado === 'Completada') {
      payload.fecha_completada = new Date().toISOString().split('T')[0];
    } else {
      payload.fecha_completada = null;
    }
    const { error } = await supabase.from('tareas').update(payload).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchComentariosDB(tareaId: string): Promise<TareaComentario[]> {
  try {
    const { data, error } = await supabase
      .from('tarea_comentarios')
      .select('*, usuario:usuarios(nombre_completo, avatar_url)')
      .eq('tarea_id', tareaId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((c: any) => ({
      id: c.id,
      tarea_id: c.tarea_id,
      usuario_id: c.usuario_id,
      usuario_nombre: c.usuario?.nombre_completo || 'Usuario',
      usuario_avatar: c.usuario?.avatar_url,
      comentario: c.comentario,
      adjunto_url: c.adjunto_url,
      created_at: c.created_at
    }));
  } catch {
    return [];
  }
}

export async function addComentarioDB(tareaId: string, usuarioId: string, comentario: string, adjuntoUrl?: string): Promise<TareaComentario | null> {
  try {
    const payload = { tarea_id: tareaId, usuario_id: usuarioId, comentario, adjunto_url: adjuntoUrl || null };
    const { data, error } = await supabase.from('tarea_comentarios').insert(payload).select('*, usuario:usuarios(nombre_completo, avatar_url)').single();
    if (error) return null;
    return {
      id: data.id,
      tarea_id: data.tarea_id,
      usuario_id: data.usuario_id,
      usuario_nombre: data.usuario?.nombre_completo || 'Usuario',
      usuario_avatar: data.usuario?.avatar_url,
      comentario: data.comentario,
      adjunto_url: data.adjunto_url,
      created_at: data.created_at
    };
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// 4. REGISTRO DE HORAS DE PRODUCTIVIDAD
// ----------------------------------------------------------------------------

export async function fetchRegistroHorasDB(): Promise<RegistroHoras[]> {
  try {
    const { data, error } = await supabase
      .from('registro_horas')
      .select('*, tarea:tareas(titulo), usuario:usuarios(nombre_completo)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      tarea_id: r.tarea_id,
      tarea_titulo: r.tarea?.titulo || 'Tarea General',
      usuario_id: r.usuario_id,
      usuario_nombre: r.usuario?.nombre_completo || 'Usuario',
      rol_destino: r.rol_destino,
      horas_registradas: Number(r.horas_registradas),
      fecha: r.fecha,
      descripcion_avance: r.descripcion_avance,
      created_at: r.created_at
    }));
  } catch {
    return [];
  }
}

export async function addRegistroHorasDB(registro: Omit<RegistroHoras, 'id'>): Promise<RegistroHoras | null> {
  try {
    const payload = {
      tarea_id: registro.tarea_id,
      usuario_id: registro.usuario_id || null,
      rol_destino: registro.rol_destino,
      horas_registradas: registro.horas_registradas,
      fecha: registro.fecha,
      descripcion_avance: registro.descripcion_avance || ''
    };
    const { data, error } = await supabase.from('registro_horas').insert(payload).select().single();
    if (error) return null;
    
    // Además actualizar tiempo_invertido en la tarea en Supabase
    const { data: tareaAtual } = await supabase.from('tareas').select('tiempo_invertido').eq('id', registro.tarea_id).single();
    if (tareaAtual) {
      const nuevoTiempo = Number(tareaAtual.tiempo_invertido || 0) + Number(registro.horas_registradas);
      await supabase.from('tareas').update({ tiempo_invertido: nuevoTiempo }).eq('id', registro.tarea_id);
    }

    return {
      ...registro,
      id: data.id,
      created_at: data.created_at
    };
  } catch {
    return null;
  }
}
