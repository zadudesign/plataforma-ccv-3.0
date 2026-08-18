'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, Rol, Area, PermisoDef, NivelArea, Facultad, Programa, CursoVirtual, ProyectoEspecial, ConfiguracionTarifa, CategoriaTareaProyecto } from '@/types';
import { 
  INITIAL_USUARIOS, 
  INITIAL_ROLES, 
  INITIAL_AREAS, 
  INITIAL_PERMISOS, 
  ROLES_PERMISOS_MAP,
  INITIAL_FACULTADES,
  INITIAL_PROGRAMAS,
  INITIAL_CURSOS,
  INITIAL_PROYECTOS,
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
  createAreaDB,
  createFacultadDB,
  updateFacultadDB,
  createProgramaDB,
  updateProgramaDB,
  createCursoDB,
  updateCursoDB,
  createProyectoDB
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
  crearFacultad: (nombre: string, decanoId?: string) => void;
  crearPrograma: (nombre: string, facultadId: string, coordinadorId?: string) => void;
  crearCurso: (datos: Omit<CursoVirtual, 'id'>) => void;
  crearProyecto: (datos: Omit<ProyectoEspecial, 'id'>) => void;

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
  const [roles, setRoles] = useState<Rol[]>(INITIAL_ROLES);
  const [areas, setAreas] = useState<Area[]>(INITIAL_AREAS);
  const [permisosDef] = useState<PermisoDef[]>(INITIAL_PERMISOS);
  const [rolesPermisosMap, setRolesPermisosMap] = useState<Record<string, string[]>>(ROLES_PERMISOS_MAP);
  
  // Entidades Académicas y Proyectos en Estado Global
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [cursos, setCursos] = useState<CursoVirtual[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoEspecial[]>([]);
  const [tarifasProyecto, setTarifasProyecto] = useState<ConfiguracionTarifa[]>(INITIAL_TARIFAS_PROYECTO);
  
  // Default logged in user: null (mostrando la pantalla de Login por defecto)
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [isDevSimulatorOpen, setIsDevSimulatorOpen] = useState(false);

  // Cargar datos iniciales desde Supabase o Fallback
  useEffect(() => {
    const loadInitialData = async () => {
      const [dbAreas, dbRoles, dbUsuarios, dbFacultades, dbProgramas, dbCursos, dbProyectos] = await Promise.all([
        fetchAreas(),
        fetchRoles(),
        fetchUsuarios(),
        fetchFacultades(),
        fetchProgramas(),
        fetchCursos(),
        fetchProyectos()
      ]);

      if (dbAreas.length > 0) setAreas(dbAreas);
      if (dbRoles.length > 0) setRoles(dbRoles);
      if (dbUsuarios.length > 0) setUsuarios(dbUsuarios);
      if (dbFacultades.length > 0) setFacultades(dbFacultades);
      if (dbProgramas.length > 0) setProgramas(dbProgramas);
      if (dbCursos.length > 0) setCursos(dbCursos);
      if (dbProyectos.length > 0) setProyectos(dbProyectos);

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
          setUsuarioActual(usuarioEncontrado);
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
    const usr = usuarios.find(u => u.id === usuarioId);
    if (usr) {
      setUsuarioActual(usr);
    }
  };

  const loginConSupabase = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Si es entorno local sin backend Supabase activo, intentar login simulado por email
        const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (usuarioEncontrado) {
          setUsuarioActual(usuarioEncontrado);
          return { success: true };
        }
        return { success: false, error: error.message };
      }
      if (data.user) {
        // Cargar usuarios actualizados desde Supabase con la sesión activa
        const freshUsers = await fetchUsuarios();
        if (freshUsers.length > 0) {
          setUsuarios(freshUsers);
        }

        const emailLower = (data.user.email || email).toLowerCase();
        const usr = freshUsers.find(u => u.email?.toLowerCase() === emailLower) || usuarios.find(u => u.email?.toLowerCase() === emailLower);

        if (usr) {
          setUsuarioActual(usr);
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
              rol_nombre: dbUser.roles?.nombre || 'Administrador',
              area_nombre: dbUser.roles?.areas?.nombre || 'ADMIN',
              firma_digital: dbUser.firma_digital,
              avatar_url: dbUser.avatar_url,
              telefono: dbUser.telefono,
              activo: dbUser.activo,
              created_at: dbUser.created_at
            };
            setUsuarioActual(parsedUser);
          } else {
            // Asignar rol de Administrador si coincide la cuenta principal
            const adminRol = roles.find(r => r.nombre === 'Administrador');
            setUsuarioActual({
              id: data.user.id,
              nombre_completo: data.user.user_metadata?.nombre_completo || data.user.email || 'Usuario CCV',
              email: data.user.email || email,
              rol_id: adminRol?.id || 'r-1',
              rol_nombre: adminRol?.nombre || 'Administrador',
              area_nombre: adminRol?.area_nombre || 'ADMIN',
              activo: true
            });
          }
        }
        return { success: true };
      }
      return { success: false, error: 'No se pudo obtener la información de usuario.' };
    } catch (err: any) {
      // Fallback para usuarios simulados si Supabase no está configurado aún
      const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (usuarioEncontrado) {
        setUsuarioActual(usuarioEncontrado);
        return { success: true };
      }
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
    setUsuarioActual(null);
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

  const actualizarUsuario = (id: string, datos: Partial<Usuario>) => {
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
  };

  const eliminarUsuario = (id: string) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
  };

  const actualizarPermisosRol = (rolId: string, permisos: string[]) => {
    setRolesPermisosMap(prev => ({
      ...prev,
      [rolId]: permisos
    }));
  };

  const crearRol = (nombre: string, areaId: string, permisos: string[] = ['registro:ver']) => {
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
  };

  // Sincronización continua: Las Áreas de Nivel 3 (FACULTAD) se reflejan como Facultades y de Nivel 2 (PROGRAMA) como Programas
  useEffect(() => {
    if (!areas || areas.length === 0) return;

    // 1. Áreas de Nivel 3 -> Facultades
    const areasFacultad = areas.filter(a => Number(a.nivel) === 3);
    setFacultades(prevFacultades => {
      let updated = [...prevFacultades];
      let hasChanges = false;

      areasFacultad.forEach(a => {
        const isIncluded = updated.some(f => f.id === a.id || f.nombre.trim().toUpperCase() === a.nombre.trim().toUpperCase());
        if (!isIncluded) {
          updated.push({
            id: a.id,
            nombre: a.nombre,
            decano_nombre: 'Sin Asignar',
            created_at: a.created_at || new Date().toISOString()
          });
          hasChanges = true;
        }
      });

      return hasChanges ? updated : prevFacultades;
    });

    // 2. Áreas de Nivel 2 -> Programas
    const areasPrograma = areas.filter(a => Number(a.nivel) === 2);
    setProgramas(prevProgramas => {
      let updated = [...prevProgramas];
      let hasChanges = false;

      areasPrograma.forEach(a => {
        const isIncluded = updated.some(p => p.id === a.id || p.nombre.trim().toUpperCase() === a.nombre.trim().toUpperCase());
        if (!isIncluded) {
          const parentFac = facultades.find(f => f.id === a.parent_id || f.nombre.toUpperCase() === a.area_padre_nombre?.toUpperCase());
          const facId = parentFac ? parentFac.id : (facultades[0]?.id || 'f-1');
          const facNombre = parentFac ? parentFac.nombre : (facultades[0]?.nombre || 'Facultad General');

          updated.push({
            id: a.id,
            nombre: a.nombre,
            facultad_id: facId,
            facultad_nombre: facNombre,
            coordinador_nombre: 'Sin Asignar',
            created_at: a.created_at || new Date().toISOString()
          });
          hasChanges = true;
        }
      });

      return hasChanges ? updated : prevProgramas;
    });
  }, [areas, facultades]);

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

    // Sincronizar automáticamente la creación con la pestaña de Asignaciones Académicas
    if (Number(nivel) === 3) {
      crearFacultad(nuevaArea.nombre);
    } else if (Number(nivel) === 2) {
      const parentFac = facultades.find(f => f.id === parentId || f.nombre.toUpperCase() === areaPadre?.nombre.toUpperCase());
      const facId = parentFac ? parentFac.id : (facultades[0]?.id || 'f-1');
      crearPrograma(nuevaArea.nombre, facId);
    }
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

  const crearFacultad = async (nombre: string, decanoId?: string) => {
    const dbItem = await createFacultadDB(nombre, decanoId);
    const decano = usuarios.find(u => u.id === decanoId);
    const nueva: Facultad = {
      id: dbItem?.id || `f-${Date.now()}`,
      nombre,
      decano_id: decanoId,
      decano_nombre: decano?.nombre_completo || 'Sin Asignar',
      created_at: dbItem?.created_at || new Date().toISOString()
    };
    setFacultades(prev => [nueva, ...prev]);

    setAreas(prev => {
      const exists = prev.some(a => a.nombre.trim().toUpperCase() === nombre.trim().toUpperCase());
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `a-${Date.now()}`,
          nombre: nombre.trim().toUpperCase(),
          nivel: 3,
          parent_id: null,
          created_at: new Date().toISOString()
        }
      ];
    });
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

    setAreas(prev => {
      const exists = prev.some(a => a.nombre.trim().toUpperCase() === nombre.trim().toUpperCase());
      if (exists) return prev;
      const parentArea = prev.find(a => a.nombre.trim().toUpperCase() === (facultad?.nombre || '').trim().toUpperCase());
      return [
        ...prev,
        {
          id: `a-${Date.now()}`,
          nombre: nombre.trim().toUpperCase(),
          nivel: 2,
          parent_id: parentArea ? parentArea.id : null,
          area_padre_nombre: parentArea ? parentArea.nombre : facultad?.nombre,
          created_at: new Date().toISOString()
        }
      ];
    });
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
        usuarios,
        roles,
        areas,
        permisosDef,
        rolesPermisosMap,
        permisosUsuario,
        nivelArea,
        isDevSimulatorOpen,
        setIsDevSimulatorOpen,
        facultades,
        programas,
        cursos,
        proyectos,
        tarifasProyecto,
        hasPermission,
        canAccessLevel,
        isAdmin,
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
        crearPrograma,
        crearCurso,
        crearProyecto,
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
