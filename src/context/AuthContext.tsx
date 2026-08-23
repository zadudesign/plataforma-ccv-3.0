'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, Rol, Area, PermisoDef, NivelArea, Facultad, Programa, CursoVirtual, ProyectoEspecial, ConfiguracionTarifa, CategoriaTareaProyecto } from '@/types';
import { 
  INITIAL_PERMISOS, 
  ROLES_PERMISOS_MAP,
  INITIAL_TARIFAS_PROYECTO
} from '@/lib/mockData';
import { supabase } from '@/lib/supabaseClient';
import {
  fetchAreas,
  fetchRoles,
  fetchUsuarios,
  fetchFacultades,
  fetchProgramas,
  fetchCursos,
  fetchProyectos,
  isGuid,
  updateUsuarioDB,
  deleteUsuarioDB,
  createAreaDB,
  createFacultadDB,
  updateFacultadDB,
  deleteFacultadDB,
  updateFacultadFullDB,
  updateFacultadIdentidadDB,
  createProgramaDB,
  updateProgramaDB,
  deleteProgramaDB,
  updateProgramaFullDB,
  createCursoDB,
  updateCursoDB,
  deleteCursoDB,
  updateCursoFullDB,
  createProyectoDB,
  deleteProyectoDB,
  updateProyectoFullDB,
  createRoleDB,
  fetchRolesPermisosMapDB,
  updateRolPermisosDB,
  fetchPermisosDefDB
} from '@/lib/supabaseService';

interface AuthContextType {
  usuarioActual: Usuario | null;
  usuarios: Usuario[];
  roles: Rol[];
  areas: Area[];
  permisosDef: PermisoDef[];
  rolesPermisosMap: Record<string, string[]>;
  permisosUsuario: string[];
  nivelArea: NivelArea;
  usuarioReal: Usuario | null;
  isDevSimulatorOpen: boolean;
  setIsDevSimulatorOpen: (open: boolean) => void;
  
  // Entidades Académicas y Proyectos
  facultades: Facultad[];
  programas: Programa[];
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  tarifasProyecto: ConfiguracionTarifa[];

  // Helpers
  hasPermission: (clavePermiso: string) => boolean;
  canAccessLevel: (nivelRequerido: NivelArea) => boolean;
  isAdmin: () => boolean;
  isRealAdmin: () => boolean;
  
  // Acciones
  actualizarTarifaProyecto: (categoria: CategoriaTareaProyecto, nuevaTarifa: number) => void;
  cambiarUsuarioSimulado: (usuarioId: string) => void;
  loginConSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registroConSupabase: (email: string, password: string, nombreCompleto: string, rolId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  crearUsuario: (nuevo: Omit<Usuario, 'id'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  actualizarUsuario: (id: string, datos: Partial<Usuario>) => void;
  eliminarUsuario: (id: string) => void;
  actualizarPermisosRol: (rolId: string, permisos: string[]) => void;
  crearRol: (nombre: string, areaId: string, permisos?: string[]) => void;
  crearArea: (nombre: string, nivel: NivelArea, parentId?: string | null) => void;
  eliminarArea: (areaId: string) => void;
  adminResetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Acciones de Creación de Entidades (Admin)
  crearFacultad: (nombre: string, decanoId?: string, color?: string, icono?: string) => void;
  editarFacultad: (id: string, nombre: string, decanoId?: string, color?: string, icono?: string) => void;
  actualizarIdentidadFacultad: (facultadId: string, color: string, icono: string) => Promise<void>;
  eliminarFacultad: (id: string) => void;

  crearPrograma: (nombre: string, facultadId: string, coordinadorId?: string) => void;
  editarPrograma: (id: string, nombre: string, facultadId: string, coordinadorId?: string) => void;
  eliminarPrograma: (id: string) => void;

  crearCurso: (datos: Omit<CursoVirtual, 'id'>) => void;
  editarCurso: (id: string, datos: Partial<CursoVirtual>) => void;
  eliminarCurso: (id: string) => void;

  crearProyecto: (datos: Omit<ProyectoEspecial, 'id'>) => void;
  editarProyecto: (id: string, datos: Partial<ProyectoEspecial>) => void;
  eliminarProyecto: (id: string) => void;

  // Acciones de Asignación Académica
  asignarDecano: (facultadId: string, decanoId: string) => void;
  asignarCoordinador: (programaId: string, coordinadorId: string) => void;
  asignarDocenteCurso: (cursoId: string, docenteId: string) => void;
  asignarEvaluadorCurso: (cursoId: string, evaluadorId: string) => void;
  asignarLiderProyecto: (proyectoId: string, liderId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [permisosDef, setPermisosDef] = useState<PermisoDef[]>(INITIAL_PERMISOS);
  const [rolesPermisosMap, setRolesPermisosMap] = useState<Record<string, string[]>>(ROLES_PERMISOS_MAP);
  
  // Entidades Académicas y Proyectos en Estado Global
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [cursos, setCursos] = useState<CursoVirtual[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoEspecial[]>([]);
  const [tarifasProyecto, setTarifasProyecto] = useState<ConfiguracionTarifa[]>(INITIAL_TARIFAS_PROYECTO);
  
  // Default logged in user: null (mostrando la pantalla de Login por defecto)
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [usuarioReal, setUsuarioReal] = useState<Usuario | null>(null);
  const [isDevSimulatorOpenState, setIsDevSimulatorOpenState] = useState(false);

  const establecerUsuarioAutenticado = (usr: Usuario | null) => {
    setUsuarioActual(usr);
    setUsuarioReal(usr);
  };

  const isRealAdmin = (): boolean => {
    const targetUser = usuarioReal || usuarioActual;
    if (!targetUser) return false;
    const targetRol = roles.find(r => r.id === targetUser.rol_id);
    return (
      targetUser.rol_nombre === 'Administrador' ||
      targetRol?.nombre === 'Administrador' ||
      targetUser.area_nombre === 'ADMIN'
    );
  };

  const setIsDevSimulatorOpen = (open: boolean) => {
    if (open && !isRealAdmin()) {
      setIsDevSimulatorOpenState(false);
      return;
    }
    setIsDevSimulatorOpenState(open);
  };

  // Cargar datos iniciales desde Supabase o Fallback
  useEffect(() => {
    const loadInitialData = async () => {
      const [dbAreas, dbRoles, dbUsuarios, dbFacultades, dbProgramas, dbCursos, dbProyectos, dbPermisosMap, dbPermisosDef] = await Promise.all([
        fetchAreas(),
        fetchRoles(),
        fetchUsuarios(),
        fetchFacultades(),
        fetchProgramas(),
        fetchCursos(),
        fetchProyectos(),
        fetchRolesPermisosMapDB(),
        fetchPermisosDefDB()
      ]);

      if (dbAreas.length > 0) setAreas(dbAreas);
      if (dbRoles.length > 0) setRoles(dbRoles);
      if (dbUsuarios.length > 0) setUsuarios(dbUsuarios);
      if (dbFacultades.length > 0) setFacultades(dbFacultades);
      if (dbProgramas.length > 0) setProgramas(dbProgramas);
      if (dbCursos.length > 0) setCursos(dbCursos);
      if (dbProyectos.length > 0) setProyectos(dbProyectos);
      if (Object.keys(dbPermisosMap).length > 0) {
        setRolesPermisosMap(prev => ({ ...prev, ...dbPermisosMap }));
      }
      if (dbPermisosDef.length > 0) {
        setPermisosDef(dbPermisosDef);
      }

      // Verificar sesión de Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const userEmail = session.user.email.toLowerCase();
        let usuarioEncontrado = dbUsuarios.find(u => u.email?.toLowerCase() === userEmail);
        if (!usuarioEncontrado) {
          const freshUsers = await fetchUsuarios();
          if (freshUsers.length > 0) {
            setUsuarios(freshUsers);
            usuarioEncontrado = freshUsers.find(u => u.email?.toLowerCase() === userEmail);
          }
        }
        if (usuarioEncontrado) {
          establecerUsuarioAutenticado(usuarioEncontrado);
        }
      }
    };
    loadInitialData();
  }, []);

  // Calcular permisos y nivel de área del usuario actual
  const rolActual = roles.find(r => r.id === usuarioActual?.rol_id);
  const areaActual = areas.find(a => a.nombre === (rolActual?.area_nombre || usuarioActual?.area_nombre));
  const nivelArea: NivelArea = (areaActual?.nivel || (rolActual?.nombre === 'Administrador' || usuarioActual?.rol_nombre === 'Administrador' ? 6 : 1)) as NivelArea;
  const permisosUsuario: string[] = rolActual ? (rolesPermisosMap[rolActual.id] || []) : [];

  const hasPermission = (clavePermiso: string): boolean => {
    if (!usuarioActual) return false;
    // Administrador (Nivel 6) tiene todos los permisos por defecto
    if (nivelArea === 6) return true;
    return permisosUsuario.includes(clavePermiso);
  };

  const canAccessLevel = (nivelRequerido: NivelArea): boolean => {
    if (!usuarioActual) return false;
    return nivelArea >= nivelRequerido;
  };

  const isAdmin = (): boolean => {
    return nivelArea === 6 || rolActual?.nombre === 'Administrador' || usuarioActual?.rol_nombre === 'Administrador';
  };

  const cambiarUsuarioSimulado = (usuarioId: string) => {
    const ahora = new Date().toISOString();
    setUsuarios(prev => prev.map(u => u.id === usuarioId ? { ...u, ultima_conexion: ahora } : u));
    const usr = usuarios.find(u => u.id === usuarioId);
    if (usr) {
      setUsuarioActual({ ...usr, ultima_conexion: ahora });
    }
  };

  const loginConSupabase = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const emailLower = email.toLowerCase().trim();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message || 'Credenciales inválidas.' };
      }
      if (data.user) {
        // Cargar usuarios actualizados desde Supabase con la sesión activa
        const freshUsers = await fetchUsuarios();
        if (freshUsers.length > 0) {
          setUsuarios(freshUsers);
        }

        const nowIso = new Date().toISOString();
        const sessionEmail = (data.user.email || email).toLowerCase().trim();
        const usr = freshUsers.find(u => u.email?.toLowerCase().trim() === sessionEmail) 
          || usuarios.find(u => u.email?.toLowerCase().trim() === sessionEmail);

        if (usr) {
          const userWithConnection = { ...usr, ultima_conexion: nowIso };
          setUsuarios(prev => prev.map(u => u.id === usr.id ? userWithConnection : u));
          establecerUsuarioAutenticado(userWithConnection);
          if (isGuid(usr.id)) {
            supabase.from('usuarios').update({ ultima_conexion: nowIso }).eq('id', usr.id).then();
          }
        } else {
          // Consultar perfil de usuario individual en Supabase
          const { data: dbUser } = await supabase
            .from('usuarios')
            .select('*, roles(nombre, areas(nombre))')
            .eq('id', data.user.id)
            .single();

          if (dbUser) {
            const parsedUser: Usuario = {
              id: dbUser.id,
              nombre_completo: dbUser.nombre_completo || data.user.email || 'Usuario CCV',
              email: dbUser.email || email,
              rol_id: dbUser.rol_id,
              rol_nombre: dbUser.roles?.nombre || 'Docente',
              area_nombre: dbUser.roles?.areas?.nombre || 'CURSO',
              firma_digital: dbUser.firma_digital,
              avatar_url: dbUser.avatar_url,
              telefono: dbUser.telefono,
              activo: dbUser.activo,
              ultima_conexion: nowIso,
              created_at: dbUser.created_at
            };
            establecerUsuarioAutenticado(parsedUser);
            if (isGuid(dbUser.id)) {
              supabase.from('usuarios').update({ ultima_conexion: nowIso }).eq('id', dbUser.id).then();
            }
          } else {
            establecerUsuarioAutenticado({
              id: data.user.id,
              nombre_completo: data.user.user_metadata?.nombre_completo || data.user.email || 'Usuario CCV',
              email: data.user.email || email,
              rol_id: data.user.user_metadata?.rol_id || '',
              rol_nombre: 'Docente',
              area_nombre: 'CURSO',
              activo: true,
              ultima_conexion: nowIso
            });
          }
        }
        return { success: true };
      }
      return { success: false, error: 'No se pudo obtener la información de usuario.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al iniciar sesión' };
    }
  };

  const registroConSupabase = async (
    email: string,
    password: string,
    nombreCompleto: string,
    rolId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const rolSeleccionado = roles.find(r => r.id === rolId);

      // 1. Crear cuenta en Supabase Auth enviando metadata (nombre y rol_id)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            rol_id: rolId,
          },
        },
      });

      if (error) {
        // En entorno local/offline sin Supabase backend activo, registrar usuario simulado
        const usuarioExistente = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (usuarioExistente) {
          return { success: false, error: 'El correo electrónico ya se encuentra registrado.' };
        }

        const nuevoSimulado: Usuario = {
          id: `u-${Date.now()}`,
          nombre_completo: nombreCompleto,
          email,
          rol_id: rolId,
          rol_nombre: rolSeleccionado?.nombre || 'Docente',
          area_nombre: rolSeleccionado?.area_nombre || 'CURSO',
          activo: true,
          created_at: new Date().toISOString()
        };
        setUsuarios(prev => [nuevoSimulado, ...prev]);
        setUsuarioActual(nuevoSimulado);
        return { success: true };
      }

      if (data.user) {
        // 2. Garantizar que la sesión quede iniciada de forma transparente
        let activeUser = data.session?.user;
        if (!activeUser) {
          const signInRes = await supabase.auth.signInWithPassword({ email, password });
          if (signInRes.data.user) {
            activeUser = signInRes.data.user;
          }
        }

        // 3. Garantizar inserción explícita en public.usuarios (por si el trigger tarda o no está presente)
        try {
          await supabase.from('usuarios').upsert({
            id: data.user.id,
            nombre_completo: nombreCompleto,
            email: email,
            rol_id: rolId,
            activo: true
          });
        } catch (e) {
          console.warn('Error guardando perfil en public.usuarios:', e);
        }

        // 4. Sincronizar perfiles actualizados desde Supabase
        const freshUsers = await fetchUsuarios();
        let usr: Usuario | undefined;
        if (freshUsers.length > 0) {
          setUsuarios(freshUsers);
          usr = freshUsers.find(u => u.id === data.user?.id || u.email?.toLowerCase() === email.toLowerCase());
        }

        if (!usr) {
          usr = {
            id: data.user.id,
            nombre_completo: nombreCompleto,
            email: email,
            rol_id: rolId,
            rol_nombre: rolSeleccionado?.nombre || 'Docente',
            area_nombre: rolSeleccionado?.area_nombre || 'CURSO',
            activo: true,
            created_at: new Date().toISOString()
          };
          setUsuarios(prev => [usr!, ...prev.filter(u => u.id !== usr?.id)]);
        }

        setUsuarioActual(usr);
        return { success: true };
      }

      return { success: false, error: 'No se pudo completar el registro del usuario.' };
    } catch (err: any) {
      const rolSeleccionado = roles.find(r => r.id === rolId);
      const nuevoSimulado: Usuario = {
        id: `u-${Date.now()}`,
        nombre_completo: nombreCompleto,
        email,
        rol_id: rolId,
        rol_nombre: rolSeleccionado?.nombre || 'Docente',
        area_nombre: rolSeleccionado?.area_nombre || 'CURSO',
        activo: true,
        created_at: new Date().toISOString()
      };
      setUsuarios(prev => [nuevoSimulado, ...prev]);
      setUsuarioActual(nuevoSimulado);
      return { success: true };
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    establecerUsuarioAutenticado(null);
    setIsDevSimulatorOpenState(false);
  };

  const crearUsuario = async (nuevo: Omit<Usuario, 'id'> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    let newUserId = `u-${Date.now()}`;

    if (nuevo.password) {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: nuevo.email,
            password: nuevo.password,
            nombre_completo: nuevo.nombre_completo,
            rol_id: nuevo.rol_id,
            telefono: nuevo.telefono,
            avatar_url: nuevo.avatar_url,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || 'Error al crear usuario en servidor.' };
        }
        if (data.user?.id) {
          newUserId = data.user.id;
        }
      } catch (err: any) {
        console.warn('API de administración no disponible, guardando en estado local:', err);
      }
    }

    // Intentar upsert directo en Supabase DB public.usuarios si tenemos un UUID válido o conexión
    if (!newUserId.startsWith('u-')) {
      try {
        await supabase.from('usuarios').upsert({
          id: newUserId,
          nombre_completo: nuevo.nombre_completo,
          email: nuevo.email,
          rol_id: nuevo.rol_id,
          telefono: nuevo.telefono,
          avatar_url: nuevo.avatar_url || null,
          activo: nuevo.activo !== false
        });
      } catch (e) {
        console.warn('No se pudo hacer upsert en public.usuarios:', e);
      }
    }

    const freshUsers = await fetchUsuarios();
    if (freshUsers.length > 0) {
      setUsuarios(freshUsers);
    } else {
      const rol = roles.find(r => r.id === nuevo.rol_id);
      const usuarioCompleto: Usuario = {
        nombre_completo: nuevo.nombre_completo,
        email: nuevo.email,
        rol_id: nuevo.rol_id,
        telefono: nuevo.telefono,
        activo: nuevo.activo !== false,
        id: newUserId,
        rol_nombre: rol?.nombre || 'Docente',
        area_nombre: rol?.area_nombre || 'CURSO',
        avatar_url: nuevo.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      setUsuarios(prev => [usuarioCompleto, ...prev]);
    }
    return { success: true };
  };

  const adminResetPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al restablecer la contraseña.' };
      }
      return { success: true };
    } catch (err: any) {
      // Modo local / offline
      return { success: true };
    }
  };

  const actualizarUsuario = async (id: string, datos: Partial<Usuario>) => {
    setUsuarios(prev => prev.map(u => {
      if (u.id === id) {
        const rolActualizado = datos.rol_id ? roles.find(r => r.id === datos.rol_id) : undefined;
        return {
          ...u,
          ...datos,
          rol_nombre: rolActualizado ? rolActualizado.nombre : u.rol_nombre,
          area_nombre: rolActualizado ? rolActualizado.area_nombre : u.area_nombre
        };
      }
      return u;
    }));

    // Actualizar usuario en sesión si es el mismo
    if (usuarioActual && usuarioActual.id === id) {
      setUsuarioActual(prev => prev ? { ...prev, ...datos } : null);
    }
    if (usuarioReal && usuarioReal.id === id) {
      setUsuarioReal(prev => prev ? { ...prev, ...datos } : null);
    }

    // Persistir directamente en Supabase (public.usuarios -> avatar_url y demás datos)
    try {
      await updateUsuarioDB(id, datos);
    } catch (e) {
      console.warn('Error sincronizando usuario con Supabase:', e);
    }
  };

  const eliminarUsuario = async (id: string) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    try {
      await deleteUsuarioDB(id);
    } catch (e) {
      console.warn('Error eliminando usuario de Supabase:', e);
    }
  };

  const actualizarPermisosRol = async (rolId: string, permisos: string[]) => {
    setRolesPermisosMap(prev => ({
      ...prev,
      [rolId]: permisos
    }));
    if (isGuid(rolId)) {
      await updateRolPermisosDB(rolId, permisos);
    }
  };

  const crearRol = async (nombre: string, areaId: string, permisos: string[] = ['registro:ver']) => {
    const res = await createRoleDB(nombre, areaId, permisos);
    if (res) {
      setRoles(prev => [...prev, res.rol]);
      setRolesPermisosMap(prev => ({
        ...prev,
        [res.rol.id]: res.permisos
      }));
    } else {
      const areaObj = areas.find(a => a.id === areaId);
      const nuevoRol: Rol = {
        id: `r-${Date.now()}`,
        nombre: nombre.trim(),
        area_id: areaId,
        area_nombre: areaObj?.nombre || 'CMU',
        created_at: new Date().toISOString()
      };
      setRoles(prev => [...prev, nuevoRol]);
      setRolesPermisosMap(prev => ({
        ...prev,
        [nuevoRol.id]: permisos
      }));
    }
  };

  const crearArea = async (nombre: string, nivel: NivelArea, parentId?: string | null) => {
    const areaPadre = parentId ? areas.find(a => a.id === parentId) : null;
    const dbItem = await createAreaDB(nombre.trim().toUpperCase(), Number(nivel), parentId);
    const nuevaArea: Area = {
      id: dbItem?.id || `a-${Date.now()}`,
      nombre: nombre.trim().toUpperCase(),
      nivel,
      parent_id: dbItem?.parent_id || parentId || null,
      area_padre_nombre: areaPadre ? areaPadre.nombre : undefined,
      created_at: dbItem?.created_at || new Date().toISOString()
    };
    setAreas(prev => [...prev, nuevaArea]);
  };

  const eliminarArea = (areaId: string) => {
    const areaAEliminar = areas.find(a => a.id === areaId);
    if (!areaAEliminar) return;

    const nuevoParentId = areaAEliminar.parent_id || null;
    const areaPadreObjeto = nuevoParentId ? areas.find(a => a.id === nuevoParentId) : null;

    setAreas(prev => 
      prev
        .filter(a => a.id !== areaId)
        .map(a => {
          if (a.parent_id === areaId) {
            return {
              ...a,
              parent_id: nuevoParentId,
              area_padre_nombre: areaPadreObjeto ? areaPadreObjeto.nombre : undefined
            };
          }
          return a;
        })
    );
  };

  const crearFacultad = async (nombre: string, decanoId?: string, color: string = 'emerald', icono: string = 'Building2') => {
    const dbItem = await createFacultadDB(nombre, decanoId, color, icono);
    const decano = usuarios.find(u => u.id === decanoId);
    const nueva: Facultad = {
      id: dbItem?.id || `f-${Date.now()}`,
      nombre,
      color: color || 'emerald',
      icono: icono || 'Building2',
      decano_id: decanoId,
      decano_nombre: decano?.nombre_completo || 'Sin Asignar',
      created_at: dbItem?.created_at || new Date().toISOString()
    };
    setFacultades(prev => [nueva, ...prev]);
  };

  const editarFacultad = async (id: string, nombre: string, decanoId?: string, color?: string, icono?: string) => {
    const decano = usuarios.find(u => u.id === decanoId);
    setFacultades(prev => prev.map(f => f.id === id ? {
      ...f,
      nombre,
      color: color || f.color || 'emerald',
      icono: icono || f.icono || 'Building2',
      decano_id: decanoId,
      decano_nombre: decano?.nombre_completo || 'Sin Asignar'
    } : f));
    await updateFacultadFullDB(id, nombre, decanoId, color, icono);
  };

  const actualizarIdentidadFacultad = async (facultadId: string, color: string, icono: string) => {
    // Actualización inmediata en estado local
    setFacultades(prev => prev.map(f => f.id === facultadId ? {
      ...f,
      color,
      icono
    } : f));
    // Sincronización en Supabase
    await updateFacultadIdentidadDB(facultadId, color, icono);
  };

  const eliminarFacultad = async (id: string) => {
    setFacultades(prev => prev.filter(f => f.id !== id));
    await deleteFacultadDB(id);
  };

  const crearPrograma = async (nombre: string, facultadId: string, coordinadorId?: string) => {
    const dbItem = await createProgramaDB(nombre, facultadId, coordinadorId);
    const facultad = facultades.find(f => f.id === facultadId);
    const coord = usuarios.find(u => u.id === coordinadorId);
    const nuevo: Programa = {
      id: dbItem?.id || `p-${Date.now()}`,
      nombre,
      facultad_id: dbItem?.facultad_id || facultadId,
      facultad_nombre: facultad?.nombre || 'Facultad General',
      coordinador_id: coordinadorId,
      coordinador_nombre: coord?.nombre_completo || 'Sin Asignar',
      created_at: dbItem?.created_at || new Date().toISOString()
    };
    setProgramas(prev => [nuevo, ...prev]);
  };

  const crearCurso = async (datos: Omit<CursoVirtual, 'id'>) => {
    const dbItem = await createCursoDB(datos);
    const prog = programas.find(p => p.id === datos.programa_id);
    const doc = usuarios.find(u => u.id === datos.docente_id);
    const ev = usuarios.find(u => u.id === datos.evaluador_id);
    const nuevo: CursoVirtual = {
      ...datos,
      id: dbItem?.id || `c-${Date.now()}`,
      programa_nombre: prog?.nombre || datos.programa_nombre,
      facultad_nombre: prog?.facultad_nombre || datos.facultad_nombre,
      docente_nombre: doc?.nombre_completo || 'Sin Asignar',
      evaluador_nombre: ev?.nombre_completo || 'Sin Asignar',
      created_at: dbItem?.created_at || new Date().toISOString()
    };
    setCursos(prev => [nuevo, ...prev]);
  };

  const crearProyecto = async (datos: Omit<ProyectoEspecial, 'id'>) => {
    const dbItem = await createProyectoDB(datos);
    const nuevo: ProyectoEspecial = {
      ...datos,
      id: dbItem?.id || `pry-${Date.now()}`,
      created_at: dbItem?.created_at || new Date().toISOString()
    };
    setProyectos(prev => [nuevo, ...prev]);
  };

  const eliminarPrograma = async (id: string) => {
    setProgramas(prev => prev.filter(p => p.id !== id));
    await deleteProgramaDB(id);
  };

  const editarPrograma = async (id: string, nombre: string, facultadId: string, coordinadorId?: string) => {
    const facultad = facultades.find(f => f.id === facultadId);
    const coord = usuarios.find(u => u.id === coordinadorId);
    setProgramas(prev => prev.map(p => p.id === id ? {
      ...p,
      nombre,
      facultad_id: facultadId,
      facultad_nombre: facultad?.nombre || p.facultad_nombre,
      coordinador_id: coordinadorId,
      coordinador_nombre: coord?.nombre_completo || 'Sin Asignar'
    } : p));
    await updateProgramaFullDB(id, nombre, facultadId, coordinadorId);
  };

  const eliminarCurso = async (id: string) => {
    setCursos(prev => prev.filter(c => c.id !== id));
    await deleteCursoDB(id);
  };

  const editarCurso = async (id: string, datos: Partial<CursoVirtual>) => {
    const prog = datos.programa_id ? programas.find(p => p.id === datos.programa_id) : undefined;
    const doc = datos.docente_id ? usuarios.find(u => u.id === datos.docente_id) : undefined;
    const ev = datos.evaluador_id ? usuarios.find(u => u.id === datos.evaluador_id) : undefined;

    setCursos(prev => prev.map(c => c.id === id ? {
      ...c,
      ...datos,
      programa_nombre: prog?.nombre || c.programa_nombre,
      facultad_nombre: prog?.facultad_nombre || c.facultad_nombre,
      docente_nombre: doc ? doc.nombre_completo : (datos.docente_id === '' ? 'Sin Asignar' : c.docente_nombre),
      evaluador_nombre: ev ? ev.nombre_completo : (datos.evaluador_id === '' ? 'Sin Asignar' : c.evaluador_nombre),
    } : c));
    await updateCursoFullDB(id, datos);
  };

  const eliminarProyecto = async (id: string) => {
    setProyectos(prev => prev.filter(p => p.id !== id));
    await deleteProyectoDB(id);
  };

  const editarProyecto = async (id: string, datos: Partial<ProyectoEspecial>) => {
    const lid = datos.lider_id ? usuarios.find(u => u.id === datos.lider_id) : undefined;
    setProyectos(prev => prev.map(p => p.id === id ? {
      ...p,
      ...datos,
      lider_nombre: lid ? lid.nombre_completo : (datos.lider_id === '' ? 'Sin Asignar' : p.lider_nombre),
    } : p));
    await updateProyectoFullDB(id, datos);
  };

  const asignarDecano = async (facultadId: string, decanoId: string) => {
    const decano = usuarios.find(u => u.id === decanoId);
    setFacultades(prev => prev.map(f => f.id === facultadId ? {
      ...f,
      decano_id: decanoId,
      decano_nombre: decano?.nombre_completo || 'Sin Asignar'
    } : f));
    await updateFacultadDB(facultadId, decanoId);
  };

  const asignarCoordinador = async (programaId: string, coordinadorId: string) => {
    const coord = usuarios.find(u => u.id === coordinadorId);
    setProgramas(prev => prev.map(p => p.id === programaId ? {
      ...p,
      coordinador_id: coordinadorId,
      coordinador_nombre: coord?.nombre_completo || 'Sin Asignar'
    } : p));
    await updateProgramaDB(programaId, coordinadorId);
  };

  const asignarDocenteCurso = async (cursoId: string, docenteId: string) => {
    const doc = usuarios.find(u => u.id === docenteId);
    setCursos(prev => prev.map(c => c.id === cursoId ? {
      ...c,
      docente_id: docenteId,
      docente_nombre: doc?.nombre_completo || 'Sin Asignar'
    } : c));
    await updateCursoDB(cursoId, { docente_id: docenteId });
  };

  const asignarEvaluadorCurso = async (cursoId: string, evaluadorId: string) => {
    const ev = usuarios.find(u => u.id === evaluadorId);
    setCursos(prev => prev.map(c => c.id === cursoId ? {
      ...c,
      evaluador_id: evaluadorId,
      evaluador_nombre: ev?.nombre_completo || 'Sin Asignar'
    } : c));
    await updateCursoDB(cursoId, { evaluador_id: evaluadorId });
  };

  const asignarLiderProyecto = (proyectoId: string, liderId: string) => {
    const lid = usuarios.find(u => u.id === liderId);
    setProyectos(prev => prev.map(p => p.id === proyectoId ? {
      ...p,
      lider_id: liderId,
      lider_nombre: lid?.nombre_completo || 'Sin Asignar'
    } : p));
  };

  const actualizarTarifaProyecto = (categoria: CategoriaTareaProyecto, nuevaTarifa: number) => {
    setTarifasProyecto(prev => prev.map(t => t.categoria === categoria ? { ...t, tarifa_hora: nuevaTarifa } : t));
  };

  return (
    <AuthContext.Provider
      value={{
        usuarioActual,
        usuarioReal,
        usuarios,
        roles,
        areas,
        permisosDef,
        rolesPermisosMap,
        permisosUsuario,
        nivelArea,
        isDevSimulatorOpen: isDevSimulatorOpenState,
        setIsDevSimulatorOpen,
        facultades,
        programas,
        cursos,
        proyectos,
        tarifasProyecto,
        hasPermission,
        canAccessLevel,
        isAdmin,
        isRealAdmin,
        actualizarTarifaProyecto,
        cambiarUsuarioSimulado,
        loginConSupabase,
        registroConSupabase,
        logout,
        crearUsuario,
        actualizarUsuario,
        eliminarUsuario,
        actualizarPermisosRol,
        crearRol,
        crearArea,
        eliminarArea,
        adminResetPassword,
        crearFacultad,
        editarFacultad,
        actualizarIdentidadFacultad,
        eliminarFacultad,
        crearPrograma,
        editarPrograma,
        eliminarPrograma,
        crearCurso,
        editarCurso,
        eliminarCurso,
        crearProyecto,
        editarProyecto,
        eliminarProyecto,
        asignarDecano,
        asignarCoordinador,
        asignarDocenteCurso,
        asignarEvaluadorCurso,
        asignarLiderProyecto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
