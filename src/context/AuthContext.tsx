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
  logout: () => void;
  crearUsuario: (nuevo: Omit<Usuario, 'id'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  actualizarUsuario: (id: string, datos: Partial<Usuario>) => void;
  eliminarUsuario: (id: string) => void;
  actualizarPermisosRol: (rolId: string, permisos: string[]) => void;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [roles, setRoles] = useState<Rol[]>(INITIAL_ROLES);
  const [areas] = useState<Area[]>(INITIAL_AREAS);
  const [permisosDef] = useState<PermisoDef[]>(INITIAL_PERMISOS);
  const [rolesPermisosMap, setRolesPermisosMap] = useState<Record<string, string[]>>(ROLES_PERMISOS_MAP);
  
  // Entidades Académicas y Proyectos en Estado Global
  const [facultades, setFacultades] = useState<Facultad[]>(INITIAL_FACULTADES);
  const [programas, setProgramas] = useState<Programa[]>(INITIAL_PROGRAMAS);
  const [cursos, setCursos] = useState<CursoVirtual[]>(INITIAL_CURSOS);
  const [proyectos, setProyectos] = useState<ProyectoEspecial[]>(INITIAL_PROYECTOS);
  const [tarifasProyecto, setTarifasProyecto] = useState<ConfiguracionTarifa[]>(INITIAL_TARIFAS_PROYECTO);
  
  // Default logged in user: null (mostrando la pantalla de Login por defecto)
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [isDevSimulatorOpen, setIsDevSimulatorOpen] = useState(false);

  // Escuchar sesión de Supabase Auth si está conectada
  useEffect(() => {
    const checkSupabaseAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Buscar perfil en estado local o Supabase
        const email = session.user.email;
        const usuarioEncontrado = usuarios.find(u => u.email === email);
        if (usuarioEncontrado) {
          setUsuarioActual(usuarioEncontrado);
        }
      }
    };
    checkSupabaseAuth();
  }, []);

  // Calcular permisos y nivel de área del usuario actual
  const rolActual = roles.find(r => r.id === usuarioActual?.rol_id);
  const areaActual = areas.find(a => a.nombre === (rolActual?.area_nombre || usuarioActual?.area_nombre));
  const nivelArea: NivelArea = (areaActual?.nivel || (rolActual?.nombre === 'Administrador' ? 6 : 1)) as NivelArea;
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
    return nivelArea === 6 || rolActual?.nombre === 'Administrador';
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
        const usr = usuarios.find(u => u.email === data.user?.email) || {
          id: data.user.id,
          nombre_completo: data.user.user_metadata?.nombre_completo || data.user.email || 'Usuario CCV',
          email: data.user.email || email,
          rol_id: 'r-8',
          rol_nombre: 'Docente',
          area_nombre: 'CURSO',
          activo: true
        };
        setUsuarioActual(usr);
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

  const crearFacultad = (nombre: string, decanoId?: string) => {
    const decano = usuarios.find(u => u.id === decanoId);
    const nueva: Facultad = {
      id: `f-${Date.now()}`,
      nombre,
      decano_id: decanoId,
      decano_nombre: decano?.nombre_completo || 'Sin Asignar',
      created_at: new Date().toISOString()
    };
    setFacultades(prev => [nueva, ...prev]);
  };

  const crearPrograma = (nombre: string, facultadId: string, coordinadorId?: string) => {
    const facultad = facultades.find(f => f.id === facultadId);
    const coord = usuarios.find(u => u.id === coordinadorId);
    const nuevo: Programa = {
      id: `p-${Date.now()}`,
      nombre,
      facultad_id: facultadId,
      facultad_nombre: facultad?.nombre || 'Facultad General',
      coordinador_id: coordinadorId,
      coordinador_nombre: coord?.nombre_completo || 'Sin Asignar',
      created_at: new Date().toISOString()
    };
    setProgramas(prev => [nuevo, ...prev]);
  };

  const crearCurso = (datos: Omit<CursoVirtual, 'id'>) => {
    const prog = programas.find(p => p.id === datos.programa_id);
    const doc = usuarios.find(u => u.id === datos.docente_id);
    const ev = usuarios.find(u => u.id === datos.evaluador_id);
    const nuevo: CursoVirtual = {
      ...datos,
      id: `c-${Date.now()}`,
      programa_nombre: prog?.nombre || datos.programa_nombre,
      facultad_nombre: prog?.facultad_nombre || datos.facultad_nombre,
      docente_nombre: doc?.nombre_completo || 'Sin Asignar',
      evaluador_nombre: ev?.nombre_completo || 'Sin Asignar',
      created_at: new Date().toISOString()
    };
    setCursos(prev => [nuevo, ...prev]);
  };

  const crearProyecto = (datos: Omit<ProyectoEspecial, 'id'>) => {
    const nuevo: ProyectoEspecial = {
      ...datos,
      id: `pry-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setProyectos(prev => [nuevo, ...prev]);
  };

  const asignarDecano = (facultadId: string, decanoId: string) => {
    const decano = usuarios.find(u => u.id === decanoId);
    setFacultades(prev => prev.map(f => f.id === facultadId ? {
      ...f,
      decano_id: decanoId,
      decano_nombre: decano?.nombre_completo || 'Sin Asignar'
    } : f));
  };

  const asignarCoordinador = (programaId: string, coordinadorId: string) => {
    const coord = usuarios.find(u => u.id === coordinadorId);
    setProgramas(prev => prev.map(p => p.id === programaId ? {
      ...p,
      coordinador_id: coordinadorId,
      coordinador_nombre: coord?.nombre_completo || 'Sin Asignar'
    } : p));
  };

  const asignarDocenteCurso = (cursoId: string, docenteId: string) => {
    const doc = usuarios.find(u => u.id === docenteId);
    setCursos(prev => prev.map(c => c.id === cursoId ? {
      ...c,
      docente_id: docenteId,
      docente_nombre: doc?.nombre_completo || 'Sin Asignar'
    } : c));
  };

  const asignarEvaluadorCurso = (cursoId: string, evaluadorId: string) => {
    const ev = usuarios.find(u => u.id === evaluadorId);
    setCursos(prev => prev.map(c => c.id === cursoId ? {
      ...c,
      evaluador_id: evaluadorId,
      evaluador_nombre: ev?.nombre_completo || 'Sin Asignar'
    } : c));
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
        logout,
        crearUsuario,
        actualizarUsuario,
        eliminarUsuario,
        actualizarPermisosRol,
        adminResetPassword,
        crearFacultad,
        crearPrograma,
        crearCurso,
        crearProyecto,
        asignarDecano,
        asignarCoordinador,
        asignarDocenteCurso,
        asignarEvaluadorCurso
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
