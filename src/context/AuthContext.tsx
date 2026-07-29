'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, Rol, Area, PermisoDef, NivelArea } from '@/types';
import { 
  INITIAL_USUARIOS, 
  INITIAL_ROLES, 
  INITIAL_AREAS, 
  INITIAL_PERMISOS, 
  ROLES_PERMISOS_MAP 
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
  
  // Helpers
  hasPermission: (clavePermiso: string) => boolean;
  canAccessLevel: (nivelRequerido: NivelArea) => boolean;
  isAdmin: () => boolean;
  
  // Acciones
  cambiarUsuarioSimulado: (usuarioId: string) => void;
  loginConSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  crearUsuario: (nuevo: Omit<Usuario, 'id'>) => void;
  actualizarUsuario: (id: string, datos: Partial<Usuario>) => void;
  eliminarUsuario: (id: string) => void;
  actualizarPermisosRol: (rolId: string, permisos: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [roles, setRoles] = useState<Rol[]>(INITIAL_ROLES);
  const [areas] = useState<Area[]>(INITIAL_AREAS);
  const [permisosDef] = useState<PermisoDef[]>(INITIAL_PERMISOS);
  const [rolesPermisosMap, setRolesPermisosMap] = useState<Record<string, string[]>>(ROLES_PERMISOS_MAP);
  
  // Default logged in user: Administrador Principal (u-admin)
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(INITIAL_USUARIOS[0]);
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

  const crearUsuario = (nuevo: Omit<Usuario, 'id'>) => {
    const id = `u-${Date.now()}`;
    const rol = roles.find(r => r.id === nuevo.rol_id);
    const usuarioCompleto: Usuario = {
      ...nuevo,
      id,
      rol_nombre: rol?.nombre || 'Docente',
      area_nombre: rol?.area_nombre || 'CURSO',
      activo: true,
      avatar_url: nuevo.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setUsuarios(prev => [usuarioCompleto, ...prev]);
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
        hasPermission,
        canAccessLevel,
        isAdmin,
        cambiarUsuarioSimulado,
        loginConSupabase,
        logout,
        crearUsuario,
        actualizarUsuario,
        eliminarUsuario,
        actualizarPermisosRol
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
