'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  Key, 
  KeyRound,
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Search, 
  UserCheck, 
  UserX,
  Sparkles,
  GraduationCap,
  BookOpen,
  Building2,
  CheckCircle2,
  DollarSign,
  GitMerge,
  CornerDownRight,
  Briefcase,
  Filter,
  RotateCcw,
  Clock,
  Activity,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FolderKanban,
  Tag,
  ChevronRight
} from 'lucide-react';
import { Area, Rol, Usuario, Facultad, Programa, CursoVirtual, ProyectoEspecial, CategoriaTareaProyecto } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { UserFormModal } from './UserFormModal';
import { RolePermissionsModal } from './RolePermissionsModal';
import { AdminResetPasswordModal } from './AdminResetPasswordModal';
import { CreateEntityModal, TipoEntidad } from './CreateEntityModal';
import { CreateRoleModal } from './CreateRoleModal';
import { CreateAreaModal } from './CreateAreaModal';
import { ConfirmDeleteAreaModal } from './ConfirmDeleteAreaModal';

interface AreaHierarchyNodeProps {
  area: Area;
  allAreas: Area[];
  roles: Rol[];
  usuarios: Usuario[];
  proyectos: ProyectoEspecial[];
  onOpenCreateSubarea: (parentAreaId: string) => void;
  onOpenCreateRole: (areaId: string) => void;
  onOpenDeleteArea: (area: Area) => void;
  depth?: number;
}

const AreaHierarchyNode: React.FC<AreaHierarchyNodeProps> = ({
  area,
  allAreas,
  roles,
  usuarios,
  proyectos,
  onOpenCreateSubarea,
  onOpenCreateRole,
  onOpenDeleteArea,
  depth = 0,
}) => {
  const subareas = allAreas.filter(a => a.parent_id === area.id);
  const rolesArea = roles.filter(r => r.area_id === area.id || r.area_nombre === area.nombre);
  const usuariosArea = usuarios.filter(u => 
    rolesArea.some(r => r.id === u.rol_id) || 
    u.area_nombre === area.nombre
  );
  const proyectosArea = proyectos.filter(p => p.area_id === area.id);

  const getNivelColor = (nivel: number) => {
    switch (nivel) {
      case 6: return 'bg-amber-600 text-white';
      case 5: return 'bg-sage-600 text-white';
      case 4: return 'bg-sky-600 text-white';
      case 3: return 'bg-purple-600 text-white';
      case 2: return 'bg-indigo-600 text-white';
      case 1: return 'bg-teal-600 text-white';
      default: return 'bg-stone-600 text-white';
    }
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-sage-300/80 mt-3' : ''}`}>
      <div className="p-5 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
        {/* Header: Área & Acciones */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            {depth > 0 && (
              <CornerDownRight className="w-5 h-5 text-sage-600 shrink-0" />
            )}
            <div className={`w-10 h-10 rounded-2xl ${getNivelColor(area.nivel)} font-extrabold flex items-center justify-center text-sm shadow-xs`}>
              {area.nivel}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-charcoal-900 text-base">{area.nombre}</h4>
                {depth === 0 ? (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 uppercase tracking-wide">
                    Área Principal
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cream-200 text-charcoal-700 uppercase tracking-wide">
                    Subárea de {area.area_padre_nombre || 'Área Superior'}
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Nivel RLS {area.nivel} — Visibilidad descendente activa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenCreateRole(area.id)}
              className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-charcoal-800 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 border border-stone-200"
              title="Agregar nuevo rol adscrito a este área"
            >
              <Plus className="w-3.5 h-3.5 text-sage-600" /> Nuevo Rol
            </button>
            <button
              onClick={() => onOpenCreateSubarea(area.id)}
              className="px-3 py-1.5 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow-xs transition-all flex items-center gap-1.5"
              title="Crear una subárea dependiente de esta unidad"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva Subárea
            </button>
            <button
              onClick={() => onOpenDeleteArea(area)}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full border border-rose-200 transition-all shadow-xs"
              title="Eliminar esta área de forma controlada"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desglose de Dependencias (Roles, Usuarios, Proyectos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Roles dependientes */}
          <div className="p-3 bg-cream-50/60 rounded-2xl border border-stone-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-charcoal-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sage-600" />
                Roles Adscritos ({rolesArea.length})
              </span>
            </div>
            {rolesArea.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {rolesArea.map(r => (
                  <span key={r.id} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-charcoal-800 shadow-xs">
                    {r.nombre}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-charcoal-400 italic">Sin roles específicos asignados</p>
            )}
          </div>

          {/* Usuarios pertenecientes */}
          <div className="p-3 bg-cream-50/60 rounded-2xl border border-stone-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-charcoal-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sage-600" />
                Usuarios en el Área ({usuariosArea.length})
              </span>
            </div>
            {usuariosArea.length > 0 ? (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {usuariosArea.map(u => (
                  <div key={u.id} title={`${u.nombre_completo} (${u.rol_nombre || 'Sin Rol'})`} className="shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.nombre_completo} className="w-7 h-7 rounded-full object-cover border border-sage-300" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-sage-700 text-white text-[10px] font-bold flex items-center justify-center border border-sage-300">
                        {u.nombre_completo.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-charcoal-400 italic">Sin usuarios asignados</p>
            )}
          </div>

          {/* Proyectos Especiales */}
          <div className="p-3 bg-cream-50/60 rounded-2xl border border-stone-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-charcoal-700 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-sage-600" />
                Proyectos CCV ({proyectosArea.length})
              </span>
            </div>
            {proyectosArea.length > 0 ? (
              <div className="space-y-1">
                {proyectosArea.map(p => (
                  <div key={p.id} className="text-[10px] font-medium text-charcoal-800 truncate flex items-center justify-between">
                    <span>• {p.nombre}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-sage-100 text-sage-800 font-bold">{p.estado}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-charcoal-400 italic">Sin proyectos asociados</p>
            )}
          </div>
        </div>
      </div>

      {/* Subáreas Hijas (Recursivo) */}
      {subareas.length > 0 && (
        <div className="space-y-3">
          {subareas.map(sub => (
            <AreaHierarchyNode
              key={sub.id}
              area={sub}
              allAreas={allAreas}
              roles={roles}
              usuarios={usuarios}
              proyectos={proyectos}
              onOpenCreateSubarea={onOpenCreateSubarea}
              onOpenCreateRole={onOpenCreateRole}
              onOpenDeleteArea={onOpenDeleteArea}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface InfoConexion {
  texto: string;
  subtexto?: string;
  fechaCompleta?: string;
  esReciente: boolean;
  badgeClass: string;
}

const formatUltimaConexion = (timestamp?: string): InfoConexion => {
  if (!timestamp) {
    return {
      texto: 'Sin registro',
      subtexto: 'Nunca ha ingresado',
      esReciente: false,
      badgeClass: 'text-stone-400 bg-stone-50 border-stone-200'
    };
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return {
      texto: 'Fecha no válida',
      esReciente: false,
      badgeClass: 'text-stone-400 bg-stone-50 border-stone-200'
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  const horaStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  const fechaCompleta = date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (diffMin < 2) {
    return {
      texto: 'En línea',
      subtexto: 'Ahora mismo',
      fechaCompleta,
      esReciente: true,
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-300 font-extrabold'
    };
  } else if (diffMin < 60) {
    return {
      texto: `Hace ${diffMin} min`,
      subtexto: horaStr,
      fechaCompleta,
      esReciente: true,
      badgeClass: 'text-emerald-700 bg-emerald-50/90 border-emerald-200 font-bold'
    };
  } else if (diffHours < 24 && date.getDate() === now.getDate()) {
    return {
      texto: `Hoy, ${horaStr}`,
      subtexto: `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`,
      fechaCompleta,
      esReciente: diffHours < 3,
      badgeClass: diffHours < 3 ? 'text-sage-800 bg-sage-50 border-sage-200 font-bold' : 'text-charcoal-700 bg-cream-50 border-stone-200'
    };
  } else if (diffDays === 1 || (diffHours < 48 && date.getDate() === now.getDate() - 1)) {
    return {
      texto: `Ayer, ${horaStr}`,
      subtexto: '1 día atrás',
      fechaCompleta,
      esReciente: false,
      badgeClass: 'text-charcoal-700 bg-stone-100/80 border-stone-200'
    };
  } else if (diffDays < 7) {
    return {
      texto: `Hace ${diffDays} días`,
      subtexto: horaStr,
      fechaCompleta,
      esReciente: false,
      badgeClass: 'text-charcoal-600 bg-stone-50 border-stone-200'
    };
  } else {
    const fechaCorta = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    return {
      texto: `${fechaCorta}, ${horaStr}`,
      subtexto: `Hace ${diffDays} días`,
      fechaCompleta,
      esReciente: false,
      badgeClass: 'text-stone-500 bg-stone-50 border-stone-200'
    };
  }
};

interface AdminDashboardProps {
  areas: Area[];
  roles: Rol[];
  usuarios: Usuario[];
  facultades: Facultad[];
  programas: Programa[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  areas: initialAreas,
  roles: initialRoles,
  usuarios: initialUsuarios,
  facultades: initialFacultades,
  programas: initialProgramas,
}) => {
  const {
    usuarios,
    roles,
    areas,
    permisosDef,
    rolesPermisosMap,
    usuarioActual,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarPermisosRol,
    crearRol,
    crearArea,
    eliminarArea,
    adminResetPassword,
    setIsDevSimulatorOpen,
    isRealAdmin,
    facultades,
    programas,
    cursos,
    proyectos,
    crearFacultad,
    editarFacultad,
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
    asignarLiderProyecto,
    asignarCoLiderProyecto,
    tarifasProyecto,
    actualizarTarifaProyecto
  } = useAuth();

  const [pestana, setPestana] = useState<'usuarios' | 'roles' | 'areas' | 'asignaciones' | 'tarifas'>('usuarios');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  
  // Ordenamiento dinámico de usuarios por columna
  const [ordenCampo, setOrdenCampo] = useState<'nombre' | 'email' | 'rol' | 'area' | 'conexion' | 'estado'>('conexion');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');

  const handleToggleOrden = (campo: 'nombre' | 'email' | 'rol' | 'area' | 'conexion' | 'estado') => {
    if (ordenCampo === campo) {
      setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenCampo(campo);
      setOrdenDireccion(campo === 'conexion' ? 'desc' : 'asc');
    }
  };

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [usuarioResetPassword, setUsuarioResetPassword] = useState<Usuario | null>(null);
  const [rolPermisosEditar, setRolPermisosEditar] = useState<Rol | null>(null);
  const [createEntityType, setCreateEntityType] = useState<TipoEntidad | null>(null);
  const [entityToEdit, setEntityToEdit] = useState<{ tipo: TipoEntidad; data: any } | null>(null);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isCreateAreaModalOpen, setIsCreateAreaModalOpen] = useState(false);
  const [defaultParentIdForAreaModal, setDefaultParentIdForAreaModal] = useState<string | undefined>(undefined);
  const [defaultAreaIdForRoleModal, setDefaultAreaIdForRoleModal] = useState<string | undefined>(undefined);
  const [areaAEliminar, setAreaAEliminar] = useState<Area | null>(null);
  const [filtroAreaAsignaciones, setFiltroAreaAsignaciones] = useState<string>('todas');

  const handleOpenCreateSubarea = (parentAreaId: string) => {
    setDefaultParentIdForAreaModal(parentAreaId);
    setIsCreateAreaModalOpen(true);
  };

  const handleOpenCreateRoleForArea = (areaId: string) => {
    setDefaultAreaIdForRoleModal(areaId);
    setIsCreateRoleModalOpen(true);
  };

  const handleOpenDeleteArea = (area: Area) => {
    setAreaAEliminar(area);
  };

  // Filter users by search box, role, and area/hierarchy
  const usuariosFiltrados = usuarios.filter(u => {
    const query = busquedaUsuario.toLowerCase().trim();
    const matchBusqueda = !query ||
      u.nombre_completo.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.rol_nombre?.toLowerCase().includes(query) ||
      u.area_nombre?.toLowerCase().includes(query);

    const matchRol = !filtroRol || filtroRol === 'todos' || u.rol_id === filtroRol || u.rol_nombre === filtroRol;
    const matchEstado = !filtroEstado || filtroEstado === 'todos' || (filtroEstado === 'activos' ? u.activo !== false : u.activo === false);

    let matchArea = true;
    if (filtroArea && filtroArea !== 'todos') {
      if (filtroArea.startsWith('nivel:')) {
        const nivel = parseInt(filtroArea.replace('nivel:', ''), 10);
        const areaObj = areas.find(a => a.nombre.toLowerCase() === u.area_nombre?.toLowerCase());
        matchArea = areaObj?.nivel === nivel;
      } else {
        matchArea = u.area_nombre?.toLowerCase() === filtroArea.toLowerCase() ||
                    areas.some(a => a.id === filtroArea && a.nombre.toLowerCase() === u.area_nombre?.toLowerCase());
      }
    }

    return matchBusqueda && matchRol && matchArea && matchEstado;
  });

  // Ordenar usuarios según la columna y dirección seleccionada
  const usuariosOrdenados = React.useMemo(() => {
    return [...usuariosFiltrados].sort((a, b) => {
      let comparison = 0;
      switch (ordenCampo) {
        case 'nombre':
          comparison = a.nombre_completo.localeCompare(b.nombre_completo, 'es', { sensitivity: 'base' });
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email, 'es', { sensitivity: 'base' });
          break;
        case 'rol':
          comparison = (a.rol_nombre || '').localeCompare(b.rol_nombre || '', 'es', { sensitivity: 'base' });
          break;
        case 'area':
          comparison = (a.area_nombre || '').localeCompare(b.area_nombre || '', 'es', { sensitivity: 'base' });
          break;
        case 'conexion': {
          const timeA = a.ultima_conexion ? new Date(a.ultima_conexion).getTime() : 0;
          const timeB = b.ultima_conexion ? new Date(b.ultima_conexion).getTime() : 0;
          comparison = timeA - timeB;
          break;
        }
        case 'estado': {
          const actA = a.activo !== false ? 1 : 0;
          const actB = b.activo !== false ? 1 : 0;
          comparison = actB - actA;
          break;
        }
      }
      return ordenDireccion === 'asc' ? comparison : -comparison;
    });
  }, [usuariosFiltrados, ordenCampo, ordenDireccion]);

  const hayFiltrosActivos = busquedaUsuario !== '' || filtroRol !== 'todos' || filtroArea !== 'todos' || filtroEstado !== 'todos';

  const limpiarFiltros = () => {
    setBusquedaUsuario('');
    setFiltroRol('todos');
    setFiltroArea('todos');
    setFiltroEstado('todos');
    setOrdenCampo('conexion');
    setOrdenDireccion('desc');
  };

  // Handlers for assignments
  const handleAssignDecano = (facultadId: string, decanoId: string) => {
    asignarDecano(facultadId, decanoId);
  };

  const handleAssignCoordinador = (programaId: string, coordinadorId: string) => {
    asignarCoordinador(programaId, coordinadorId);
  };

  const handleAssignCursoDocente = (cursoId: string, docenteId: string) => {
    asignarDocenteCurso(cursoId, docenteId);
  };

  const handleAssignCursoEvaluador = (cursoId: string, evaluadorId: string) => {
    asignarEvaluadorCurso(cursoId, evaluadorId);
  };

  const handleOpenCreateUser = () => {
    setUsuarioEditar(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: Usuario) => {
    setUsuarioEditar(u);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (datos: Omit<Usuario, 'id'> | Partial<Usuario>) => {
    if (usuarioEditar) {
      actualizarUsuario(usuarioEditar.id, datos);
    } else {
      crearUsuario(datos as Omit<Usuario, 'id'>);
    }
  };

  const handleDeleteUser = (u: Usuario) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${u.nombre_completo}"?`)) {
      eliminarUsuario(u.id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="ccv-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-sage-600" />
            Panel de Administración RBAC & Asignaciones CCV
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Gestión completa de usuarios, asignación de los 9 roles oficiales, permisos CRUD, asignaciones académicas y áreas jerárquicas.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1.5 bg-cream-100 rounded-full border border-stone-200 text-xs font-bold flex-wrap">
          <button
            onClick={() => setPestana('usuarios')}
            className={`px-4 py-2 rounded-full transition-all ${
              pestana === 'usuarios' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Usuarios ({usuarios.length})
          </button>
          <button
            onClick={() => setPestana('asignaciones')}
            className={`px-4 py-2 rounded-full transition-all ${
              pestana === 'asignaciones' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Asignaciones Académicas
          </button>
          <button
            onClick={() => setPestana('roles')}
            className={`px-4 py-2 rounded-full transition-all ${
              pestana === 'roles' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Roles ({roles.length})
          </button>
          <button
            onClick={() => setPestana('areas')}
            className={`px-4 py-2 rounded-full transition-all ${
              pestana === 'areas' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Áreas Jerárquicas
          </button>
          <button
            onClick={() => setPestana('tarifas')}
            className={`px-4 py-2 rounded-full transition-all ${
              pestana === 'tarifas' ? 'bg-charcoal-900 text-white shadow' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Tarifas por Categoría
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {pestana === 'usuarios' && (
        <div className="ccv-card p-6 space-y-5">
          {/* Header de la pestaña */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sage-600" />
                  Gestión de Perfiles, Áreas & Roles de Integrantes
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Visualiza, audita y administra las cuentas de usuario, sus roles RBAC adscritos y su actividad de conexión.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isRealAdmin() && (
                <button
                  onClick={() => setIsDevSimulatorOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-coral-50 hover:bg-coral-100 text-coral-700 text-xs font-extrabold rounded-full border border-coral-200 shadow-xs transition-all"
                  title="Simular la vista de otro usuario del sistema"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Cambiar Perfil Activo
                </button>
              )}
              <button
                onClick={handleOpenCreateUser}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm shrink-0 transition-all"
              >
                <Plus className="w-4 h-4" /> Crear / Invitar Usuario
              </button>
            </div>
          </div>

          {/* Barra de Filtros Multifactorial (Hybrid Design) */}
          <div className="p-4 bg-cream-50/70 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-extrabold text-charcoal-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-sage-600" />
                Filtros de Búsqueda & Jerarquía
              </span>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="text-xs font-bold text-coral-600 hover:text-coral-800 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg hover:bg-coral-50"
                >
                  <RotateCcw className="w-3 h-3" /> Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Buscador de texto */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={busquedaUsuario}
                  onChange={e => setBusquedaUsuario(e.target.value)}
                  placeholder="Buscar nombre o correo..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-xs"
                />
              </div>

              {/* Ordenar por Columna */}
              <div className="relative">
                <select
                  value={`${ordenCampo}-${ordenDireccion}`}
                  onChange={e => {
                    const [campo, dir] = e.target.value.split('-');
                    setOrdenCampo(campo as any);
                    setOrdenDireccion(dir as any);
                  }}
                  className="w-full px-3 py-2 bg-white border border-sage-300 rounded-xl text-xs font-extrabold text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-xs cursor-pointer appearance-none"
                >
                  <option value="conexion-desc">⚡ Conexión: Más Reciente</option>
                  <option value="conexion-asc">🕒 Conexión: Más Antigua</option>
                  <option value="nombre-asc">🔤 Nombre: A → Z</option>
                  <option value="nombre-desc">🔤 Nombre: Z → A</option>
                  <option value="email-asc">📧 Correo: A → Z</option>
                  <option value="rol-asc">🎭 Rol: A → Z</option>
                  <option value="area-asc">🏛️ Área: A → Z</option>
                  <option value="estado-desc">🟢 Estado: Activos Primero</option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-sage-600 text-[10px] font-bold">
                  ▼
                </div>
              </div>

              {/* Filtro por Rol */}
              <div className="relative">
                <select
                  value={filtroRol}
                  onChange={e => setFiltroRol(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-xs cursor-pointer appearance-none"
                >
                  <option value="todos">🎭 Todos los roles ({usuarios.length})</option>
                  {roles.map(r => {
                    const count = usuarios.filter(u => u.rol_id === r.id || u.rol_nombre === r.nombre).length;
                    return (
                      <option key={r.id} value={r.id}>
                        {r.nombre} ({count})
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-charcoal-400 text-[10px] font-bold">
                  ▼
                </div>
              </div>

              {/* Filtro por Área o Jerarquía */}
              <div className="relative">
                <select
                  value={filtroArea}
                  onChange={e => setFiltroArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-xs cursor-pointer appearance-none"
                >
                  <option value="todos">🏛️ Todas las áreas</option>
                  <optgroup label="── Por Nivel Jerárquico RLS ──">
                    <option value="nivel:6">Nivel 6: ADMIN ({usuarios.filter(u => {
                      const areaObj = areas.find(a => a.nombre.toLowerCase() === u.area_nombre?.toLowerCase());
                      return areaObj?.nivel === 6;
                    }).length})</option>
                    <option value="nivel:5">Nivel 5: CMU ({usuarios.filter(u => {
                      const areaObj = areas.find(a => a.nombre.toLowerCase() === u.area_nombre?.toLowerCase());
                      return areaObj?.nivel === 5;
                    }).length})</option>
                    <option value="nivel:4">Nivel 4: DEPARTAMENTO ({usuarios.filter(u => {
                      const areaObj = areas.find(a => a.nombre.toLowerCase() === u.area_nombre?.toLowerCase());
                      return areaObj?.nivel === 4;
                    }).length})</option>
                    <option value="nivel:3">Nivel 3: FACULTAD ({usuarios.filter(u => {
                      const areaObj = areas.find(a => a.nombre.toLowerCase() === u.area_nombre?.toLowerCase());
                      return areaObj?.nivel === 3;
                    }).length})</option>
                    <option value="nivel:2">Nivel 2: PROGRAMA ({usuarios.filter(u => {
                      const areaObj = areas.find(a => a.nombre.toLowerCase() === u.area_nombre?.toLowerCase());
                      return areaObj?.nivel === 2;
                    }).length})</option>
                    <option value="nivel:1">Nivel 1: CURSO ({usuarios.filter(u => {
                      const areaObj = areas.find(a => a.nombre.toLowerCase() === u.area_nombre?.toLowerCase());
                      return areaObj?.nivel === 1 || !areaObj;
                    }).length})</option>
                  </optgroup>
                  <optgroup label="── Por Área Específica ──">
                    {areas.map(a => {
                      const count = usuarios.filter(u => u.area_nombre?.toLowerCase() === a.nombre.toLowerCase()).length;
                      return (
                        <option key={a.id} value={a.nombre}>
                          Área: {a.nombre} (Nivel {a.nivel}) — {count}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-charcoal-400 text-[10px] font-bold">
                  ▼
                </div>
              </div>

              {/* Filtro por Estado */}
              <div className="relative">
                <select
                  value={filtroEstado}
                  onChange={e => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-xs cursor-pointer appearance-none"
                >
                  <option value="todos">🔘 Todos los estados</option>
                  <option value="activos">🟢 Solo Activos ({usuarios.filter(u => u.activo !== false).length})</option>
                  <option value="inactivos">🔴 Inactivos ({usuarios.filter(u => u.activo === false).length})</option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-charcoal-400 text-[10px] font-bold">
                  ▼
                </div>
              </div>
            </div>

            {/* Resumen de resultados & Chips activos */}
            <div className="flex items-center justify-between text-xs text-charcoal-500 pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-charcoal-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                  Mostrando <strong className="text-sage-700 font-extrabold">{usuariosOrdenados.length}</strong> de {usuarios.length} usuarios
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-900 text-[11px] font-extrabold border border-sage-200">
                  Orden: {ordenCampo === 'nombre' ? 'Alfabético' : ordenCampo === 'conexion' ? 'Última Conexión' : ordenCampo} ({ordenDireccion === 'asc' ? 'A-Z / Asc' : 'Desc'})
                </span>
                {filtroRol !== 'todos' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 text-[11px] font-bold">
                    Rol: {roles.find(r => r.id === filtroRol)?.nombre || filtroRol}
                    <button onClick={() => setFiltroRol('todos')} className="hover:text-coral-600 font-extrabold ml-1">×</button>
                  </span>
                )}
                {filtroArea !== 'todos' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cream-200 text-charcoal-800 text-[11px] font-bold">
                    Área/Nivel: {filtroArea}
                    <button onClick={() => setFiltroArea('todos')} className="hover:text-coral-600 font-extrabold ml-1">×</button>
                  </span>
                )}
                {filtroEstado !== 'todos' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-200 text-charcoal-800 text-[11px] font-bold">
                    Estado: {filtroEstado === 'activos' ? 'Activos' : 'Inactivos'}
                    <button onClick={() => setFiltroEstado('todos')} className="hover:text-coral-600 font-extrabold ml-1">×</button>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de Usuarios con Columna de Última Conexión & Ordenamiento Interactivo */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200/90 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100/70 border-b border-stone-200 text-charcoal-600 font-extrabold uppercase tracking-wider">
                  <th 
                    onClick={() => handleToggleOrden('nombre')} 
                    className="py-3.5 px-4 cursor-pointer hover:bg-cream-200/80 transition-colors select-none group"
                    title="Ordenar por nombre alfabético"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Usuario</span>
                      {ordenCampo === 'nombre' ? (
                        ordenDireccion === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleToggleOrden('email')} 
                    className="py-3.5 px-4 cursor-pointer hover:bg-cream-200/80 transition-colors select-none group"
                    title="Ordenar por correo electrónico"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Correo Electrónico</span>
                      {ordenCampo === 'email' ? (
                        ordenDireccion === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleToggleOrden('rol')} 
                    className="py-3.5 px-4 cursor-pointer hover:bg-cream-200/80 transition-colors select-none group"
                    title="Ordenar por rol asignado"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Rol Asignado</span>
                      {ordenCampo === 'rol' ? (
                        ordenDireccion === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleToggleOrden('area')} 
                    className="py-3.5 px-4 cursor-pointer hover:bg-cream-200/80 transition-colors select-none group"
                    title="Ordenar por área asignada"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Área & Jerarquía</span>
                      {ordenCampo === 'area' ? (
                        ordenDireccion === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleToggleOrden('conexion')} 
                    className="py-3.5 px-4 cursor-pointer hover:bg-cream-200/80 transition-colors select-none group"
                    title="Ordenar por fecha de última conexión"
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sage-600" />
                      <span>Última Conexión</span>
                      {ordenCampo === 'conexion' ? (
                        ordenDireccion === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleToggleOrden('estado')} 
                    className="py-3.5 px-4 cursor-pointer hover:bg-cream-200/80 transition-colors select-none group"
                    title="Ordenar por estado activo/inactivo"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Estado</span>
                      {ordenCampo === 'estado' ? (
                        ordenDireccion === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 text-sage-700 stroke-[2.5]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Firma Digital</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal-800 bg-white">
                {usuariosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-charcoal-500">
                      <div className="max-w-xs mx-auto space-y-3">
                        <Users className="w-10 h-10 text-stone-300 mx-auto" />
                        <p className="font-bold text-sm text-charcoal-800">No se encontraron usuarios</p>
                        <p className="text-xs text-charcoal-500">
                          Ningún usuario coincide con los filtros de rol, área o texto ingresados.
                        </p>
                        <button
                          onClick={limpiarFiltros}
                          className="px-4 py-1.5 bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold rounded-full text-xs border border-stone-200 transition-all inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restablecer Filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usuariosOrdenados.map((usr) => {
                    const isCurrentSession = usuarioActual?.id === usr.id;
                    const infoConexion = formatUltimaConexion(usr.ultima_conexion);

                    return (
                      <tr key={usr.id} className="hover:bg-cream-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold flex items-center gap-3">
                          <img
                            src={usr.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={usr.nombre_completo}
                            className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 font-bold text-charcoal-900">
                              {usr.nombre_completo}
                              {isCurrentSession && (
                                <span className="bg-sage-600 text-white text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider">TÚ</span>
                              )}
                            </span>
                            <span className="text-[10px] text-charcoal-400 font-normal">{usr.telefono || 'Sin teléfono'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-charcoal-600 font-medium">{usr.email}</td>
                        <td className="py-3 px-4">
                          <span className="bg-sage-100 text-sage-800 font-bold px-2.5 py-1 rounded-full border border-sage-200 inline-block">
                            {usr.rol_nombre || 'Docente'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-charcoal-900 bg-cream-100 px-2 py-0.5 rounded border border-stone-200/60 inline-block">
                            {usr.area_nombre || 'CURSO'}
                          </span>
                        </td>
                        {/* Nueva Columna: Última Conexión */}
                        <td className="py-3 px-4">
                          <div 
                            className="flex items-center gap-2"
                            title={infoConexion.fechaCompleta ? `Último ingreso: ${infoConexion.fechaCompleta}` : undefined}
                          >
                            <span className="relative flex h-2 w-2 shrink-0">
                              {infoConexion.esReciente && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              )}
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${infoConexion.esReciente ? 'bg-emerald-500' : 'bg-stone-300'}`}></span>
                            </span>
                            <div className="flex flex-col">
                              <span className={`text-[11px] px-2 py-0.5 rounded-md border w-fit font-bold ${infoConexion.badgeClass}`}>
                                {infoConexion.texto}
                              </span>
                              {infoConexion.subtexto && (
                                <span className="text-[9px] text-charcoal-400 mt-0.5 font-medium pl-0.5">
                                  {infoConexion.subtexto}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {usr.activo !== false ? (
                            <span className="text-sage-700 bg-sage-50 border border-sage-200 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <UserCheck className="w-3 h-3" /> Activo
                            </span>
                          ) : (
                            <span className="text-coral-700 bg-coral-50 border border-coral-200 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <UserX className="w-3 h-3" /> Inactivo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {usr.firma_digital ? (
                            <span className="text-sage-600 flex items-center gap-1 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" /> Registrada
                            </span>
                          ) : (
                            <span className="text-charcoal-400">Pendiente</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setUsuarioResetPassword(usr)}
                            className="p-1.5 text-charcoal-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                            title="Restablecer Contraseña"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditUser(usr)}
                            className="p-1.5 text-charcoal-500 hover:text-sage-600 hover:bg-cream-100 rounded-full transition-all"
                            title="Editar Perfil"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr)}
                            className="p-1.5 text-charcoal-500 hover:text-coral-600 hover:bg-coral-50 rounded-full transition-all"
                            title="Eliminar Usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Academic Assignments Tab */}
      {pestana === 'asignaciones' && (
        <div className="space-y-6">
          {/* Barra de Clasificación y Filtro Multifactorial por Área */}
          <div className="p-4 bg-cream-50/80 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-sage-600" />
                <h4 className="text-xs font-extrabold text-charcoal-800 uppercase tracking-wider">
                  Clasificación & Filtro Jerárquico por Área
                </h4>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-charcoal-500">Filtrar vista por área:</span>
                <select
                  value={filtroAreaAsignaciones}
                  onChange={(e) => setFiltroAreaAsignaciones(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:ring-2 focus:ring-sage-500 shadow-2xs"
                >
                  <option value="todas">Todas las Áreas & Jerarquías</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.nombre}>
                      Nivel {a.nivel} — {a.nombre}
                    </option>
                  ))}
                </select>
                {filtroAreaAsignaciones !== 'todas' && (
                  <button
                    onClick={() => setFiltroAreaAsignaciones('todas')}
                    className="px-2.5 py-1 bg-white hover:bg-stone-100 text-coral-600 rounded-lg text-xs font-bold border border-stone-200 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Quick Area Summary Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-200/60">
              <button
                onClick={() => setFiltroAreaAsignaciones('todas')}
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                  filtroAreaAsignaciones === 'todas'
                    ? 'bg-charcoal-900 text-white shadow-xs'
                    : 'bg-white text-charcoal-700 hover:bg-cream-100 border border-stone-200'
                }`}
              >
                Todas ({facultades.length} Fac. / {programas.length} Prog. / {cursos.length} Cur. / {proyectos.length} Proy.)
              </button>
              {areas.map(a => {
                const isSelected = filtroAreaAsignaciones === a.nombre;
                return (
                  <button
                    key={a.id}
                    onClick={() => setFiltroAreaAsignaciones(a.nombre)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-sage-700 text-white shadow-xs'
                        : 'bg-white text-charcoal-700 hover:bg-cream-100 border border-stone-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                    <span>{a.nombre}</span>
                    <span className="text-[9px] opacity-75 font-semibold">(N{a.nivel})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 1: Facultades & Decanos (Clasificadas por Área Nivel 3 FACULTAD) */}
          <div className="ccv-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4 text-sage-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-charcoal-900">1. Asignación y Registro de Facultades</h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      Área: FACULTAD (Nivel 3)
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Unidades académicas mayores de la corporación y decanos asignados.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateEntityType('facultad')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Facultad
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultades.map(fac => {
                const progsDeFacultad = programas.filter(p => p.facultad_id === fac.id);
                return (
                  <div key={fac.id} className="p-4 bg-cream-50 rounded-2xl border border-stone-200 flex flex-col justify-between space-y-3 hover:border-sage-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-charcoal-900 text-sm">{fac.nombre}</h4>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white border border-stone-200 text-charcoal-700">
                            {progsDeFacultad.length} {progsDeFacultad.length === 1 ? 'Programa' : 'Programas'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold text-sage-800 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-200">
                            Área: FACULTAD (Nivel 3)
                          </span>
                          <span className="text-xs text-charcoal-500">
                            Decano: <strong className="text-sage-700 font-extrabold">{fac.decano_nombre || 'Sin Asignar'}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEntityToEdit({ tipo: 'facultad', data: fac })}
                          title="Editar Facultad"
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-white transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (window.confirm(`¿Eliminar la facultad "${fac.nombre}"?`)) eliminarFacultad(fac.id); }}
                          title="Eliminar Facultad"
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-coral-600 hover:bg-white transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60">
                      <label className="block text-[10px] font-bold uppercase text-charcoal-500 mb-1">Cambiar Decano:</label>
                      <select
                        value={fac.decano_id || ''}
                        onChange={e => handleAssignDecano(fac.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:ring-2 focus:ring-sage-500"
                      >
                        <option value="">-- Seleccionar Decano --</option>
                        {usuarios.filter(u => u.rol_nombre === 'Decano' || u.area_nombre === 'FACULTAD' || u.rol_nombre === 'Administrador').map(u => (
                          <option key={u.id} value={u.id}>
                            {u.nombre_completo} ({u.rol_nombre})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Programas Académicos (Clasificados internamente por Facultad / Área) */}
          <div className="ccv-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-charcoal-900">2. Asignación y Registro de Programas Académicos</h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      Clasificado por Área / Facultad
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Programas de pregrado/posgrado agrupados bajo su respectiva Facultad y Área académica.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateEntityType('programa')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Programa
              </button>
            </div>

            {/* Programas agrupados por Facultad */}
            <div className="space-y-4">
              {facultades.map(fac => {
                const progsEnFac = programas.filter(p => p.facultad_id === fac.id);
                if (progsEnFac.length === 0 && filtroAreaAsignaciones !== 'todas') return null;

                return (
                  <div key={fac.id} className="p-4 bg-cream-50/70 rounded-3xl border border-stone-200/80 space-y-3">
                    {/* Header de la Facultad / Área */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-sage-600" />
                        <h4 className="font-black text-charcoal-900 text-sm">{fac.nombre}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-charcoal-700 border border-stone-200">
                          {progsEnFac.length} {progsEnFac.length === 1 ? 'Programa' : 'Programas'}
                        </span>
                      </div>
                      <span className="text-[11px] text-charcoal-500 font-medium">
                        Decano: <strong className="text-sage-800">{fac.decano_nombre || 'Sin asignar'}</strong>
                      </span>
                    </div>

                    {/* Grid de Programas de esta Facultad */}
                    {progsEnFac.length === 0 ? (
                      <p className="text-xs text-charcoal-400 italic py-2">No hay programas registrados en esta facultad.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {progsEnFac.map(prog => (
                          <div key={prog.id} className="p-3.5 bg-white rounded-2xl border border-stone-200 flex flex-col justify-between space-y-3 shadow-2xs hover:border-sage-300 transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-extrabold text-charcoal-900 text-xs sm:text-sm">{prog.nombre}</h5>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                    PROGRAMA (Nivel 2)
                                  </span>
                                  <span className="text-[11px] text-charcoal-500">
                                    Coord: <strong className="text-sage-700 font-bold">{prog.coordinador_nombre || 'Sin Asignar'}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setEntityToEdit({ tipo: 'programa', data: prog })}
                                  title="Editar Programa"
                                  className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-cream-50 transition-all"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => { if (window.confirm(`¿Eliminar el programa "${prog.nombre}"?`)) eliminarPrograma(prog.id); }}
                                  title="Eliminar Programa"
                                  className="p-1.5 rounded-lg text-charcoal-400 hover:text-coral-600 hover:bg-cream-50 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-stone-100">
                              <label className="block text-[10px] font-bold uppercase text-charcoal-500 mb-1">Cambiar Coordinador:</label>
                              <select
                                value={prog.coordinador_id || ''}
                                onChange={e => handleAssignCoordinador(prog.id, e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-cream-50 border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900 focus:ring-2 focus:ring-sage-500"
                              >
                                <option value="">-- Seleccionar Coordinador --</option>
                                {usuarios.filter(u => u.rol_nombre === 'Coordinador' || u.area_nombre === 'PROGRAMA' || u.rol_nombre === 'Administrador').map(u => (
                                  <option key={u.id} value={u.id}>
                                    {u.nombre_completo} ({u.rol_nombre})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Programas sin Facultad asignada si existieran */}
              {programas.filter(p => !facultades.some(f => f.id === p.facultad_id)).length > 0 && (
                <div className="p-4 bg-amber-50/70 rounded-3xl border border-amber-200 space-y-3">
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Programas Generales / Sin Facultad Asignada
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {programas.filter(p => !facultades.some(f => f.id === p.facultad_id)).map(prog => (
                      <div key={prog.id} className="p-3 bg-white rounded-2xl border border-amber-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-extrabold text-charcoal-900 text-xs">{prog.nombre}</h5>
                            <p className="text-[11px] text-charcoal-500 mt-1">Coord: {prog.coordinador_nombre || 'Sin Asignar'}</p>
                          </div>
                          <button
                            onClick={() => setEntityToEdit({ tipo: 'programa', data: prog })}
                            className="p-1 text-charcoal-400 hover:text-sage-700"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Cursos Virtuales (Clasificados internamente por Programa y Área/Facultad) */}
          <div className="ccv-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-charcoal-900">3. Asignación y Creación de Cursos Virtuales</h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Clasificado por Programa & Área
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Cursos didácticos organizados por Programa Académico con asignación de Docente y Par Evaluador.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateEntityType('curso')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Curso
              </button>
            </div>

            {/* Cursos agrupados por Programa */}
            <div className="space-y-4">
              {programas.map(prog => {
                const cursosEnProg = cursos.filter(c => c.programa_id === prog.id);
                if (cursosEnProg.length === 0 && filtroAreaAsignaciones !== 'todas') return null;

                const fac = facultades.find(f => f.id === prog.facultad_id);

                return (
                  <div key={prog.id} className="p-4 bg-cream-50/70 rounded-3xl border border-stone-200/80 space-y-3">
                    {/* Header del Programa / Área */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-700" />
                        <h4 className="font-black text-charcoal-900 text-sm">{prog.nombre}</h4>
                        {fac && (
                          <span className="text-[10px] font-bold text-charcoal-600 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                            Fac. {fac.nombre}
                          </span>
                        )}
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                          {cursosEnProg.length} {cursosEnProg.length === 1 ? 'Curso' : 'Cursos'}
                        </span>
                      </div>
                      <span className="text-[11px] text-charcoal-500 font-medium">
                        Coord: <strong className="text-sage-800">{prog.coordinador_nombre || 'Sin asignar'}</strong>
                      </span>
                    </div>

                    {/* Grid de Cursos de este Programa */}
                    {cursosEnProg.length === 0 ? (
                      <p className="text-xs text-charcoal-400 italic py-2">No hay cursos registrados en este programa.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cursosEnProg.map(cur => (
                          <div key={cur.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 hover:border-sage-300 transition-all">
                            <div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-extrabold text-charcoal-900 text-xs sm:text-sm">{cur.nombre}</h5>
                                  <p className="text-[10px] text-charcoal-500 mt-0.5 flex items-center gap-1.5 font-medium">
                                    <span className="font-bold text-sage-800 bg-sage-50 px-1.5 py-0.2 rounded border border-sage-200">
                                      CURSO (Nivel 1)
                                    </span>
                                    <span>Periodo: {cur.periodo}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="font-mono text-[10px] bg-sage-100 text-sage-800 px-2 py-0.5 rounded font-bold">{cur.codigo}</span>
                                  <button
                                    onClick={() => setEntityToEdit({ tipo: 'curso', data: cur })}
                                    title="Editar Curso"
                                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-cream-50 transition-all"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => { if (window.confirm(`¿Eliminar el curso "${cur.nombre}"?`)) eliminarCurso(cur.id); }}
                                    title="Eliminar Curso"
                                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-coral-600 hover:bg-cream-50 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-charcoal-600 mb-1">Docente Asignado:</label>
                                <select
                                  value={cur.docente_id || ''}
                                  onChange={e => handleAssignCursoDocente(cur.id, e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-cream-50 border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900 focus:ring-2 focus:ring-sage-500"
                                >
                                  <option value="">-- Docente --</option>
                                  {usuarios.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre_completo}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-charcoal-600 mb-1">Par Evaluador:</label>
                                <select
                                  value={cur.evaluador_id || ''}
                                  onChange={e => handleAssignCursoEvaluador(cur.id, e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-cream-50 border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900 focus:ring-2 focus:ring-sage-500"
                                >
                                  <option value="">-- Evaluador --</option>
                                  {usuarios.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre_completo}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Cursos sin Programa Asignado */}
              {cursos.filter(c => !programas.some(p => p.id === c.programa_id)).length > 0 && (
                <div className="p-4 bg-amber-50/70 rounded-3xl border border-amber-200 space-y-3">
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Cursos Generales / Sin Programa Asignado
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cursos.filter(c => !programas.some(p => p.id === c.programa_id)).map(cur => (
                      <div key={cur.id} className="p-3 bg-white rounded-2xl border border-amber-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-extrabold text-charcoal-900 text-xs">{cur.nombre}</h5>
                            <p className="text-[11px] text-charcoal-500 mt-1">Código: {cur.codigo} • Periodo: {cur.periodo}</p>
                          </div>
                          <button
                            onClick={() => setEntityToEdit({ tipo: 'curso', data: cur })}
                            className="p-1 text-charcoal-400 hover:text-sage-700"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Proyectos CCV (Clasificados internamente por Área Responsable) */}
          <div className="ccv-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-charcoal-900">4. Registro de Proyectos CCV</h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      Clasificado por Área Responsable
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Iniciativas y proyectos especiales organizados por cada unidad o área responsable del CCV.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateEntityType('proyecto')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Proyecto
              </button>
            </div>

            {/* Proyectos agrupados por Área */}
            <div className="space-y-4">
              {areas.map(area => {
                const proyectosDeEstaArea = proyectos.filter(
                  p => p.area_id === area.id || p.area_id === area.nombre || area.nombre.toLowerCase() === (p.area_id || '').toLowerCase()
                );

                if (proyectosDeEstaArea.length === 0 && filtroAreaAsignaciones !== 'todas') return null;

                return (
                  <div key={area.id} className="p-4 bg-cream-50/70 rounded-3xl border border-stone-200/80 space-y-3">
                    {/* Header del Área */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-purple-700" />
                        <h4 className="font-black text-charcoal-900 text-sm">{area.nombre}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
                          Nivel {area.nivel}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                          {proyectosDeEstaArea.length} {proyectosDeEstaArea.length === 1 ? 'Proyecto' : 'Proyectos'}
                        </span>
                      </div>
                      <span className="text-[11px] text-charcoal-500 font-medium">
                        Área Padre: <strong className="text-charcoal-700">{area.area_padre_nombre || 'Principal'}</strong>
                      </span>
                    </div>

                    {/* Grid de Proyectos de esta Área */}
                    {proyectosDeEstaArea.length === 0 ? (
                      <p className="text-xs text-charcoal-400 italic py-2">No hay proyectos registrados adscritos a este área.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {proyectosDeEstaArea.map(pry => (
                          <div key={pry.id} className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col justify-between space-y-3 shadow-2xs hover:border-sage-300 transition-all">
                            <div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-extrabold text-charcoal-900 text-xs sm:text-sm">{pry.nombre}</h5>
                                  <p className="text-xs text-charcoal-600 mt-1 line-clamp-2">{pry.descripcion}</p>
                                  <div className="flex flex-wrap gap-2 text-xs text-charcoal-500 mt-1.5">
                                    <span>Líder: <strong className="text-sage-700 font-bold">{pry.lider_nombre || 'Sin Asignar'}</strong></span>
                                    {pry.lider_secundario_nombre && (
                                      <span>• Co-Líder: <strong className="text-blue-700 font-bold">{pry.lider_secundario_nombre}</strong></span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-100 text-sage-800 border border-sage-200">
                                    {pry.estado}
                                  </span>
                                  <button
                                    onClick={() => setEntityToEdit({ tipo: 'proyecto', data: pry })}
                                    title="Editar Proyecto"
                                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-cream-50 transition-all"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => { if (window.confirm(`¿Eliminar el proyecto "${pry.nombre}"?`)) eliminarProyecto(pry.id); }}
                                    title="Eliminar Proyecto"
                                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-coral-600 hover:bg-cream-50 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-charcoal-500 mb-0.5">Líder Principal:</label>
                                <select
                                  value={pry.lider_id || ''}
                                  onChange={e => asignarLiderProyecto(pry.id, e.target.value)}
                                  className="w-full px-2 py-1 bg-cream-50 border border-stone-200 rounded-lg text-[11px] font-bold text-charcoal-900 focus:ring-2 focus:ring-sage-500"
                                >
                                  <option value="">-- Sin Asignar --</option>
                                  {usuarios.map(u => (
                                    <option key={u.id} value={u.id}>
                                      {u.nombre_completo} ({u.rol_nombre || u.area_nombre})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold uppercase text-charcoal-500 mb-0.5">Co-Líder (Opcional):</label>
                                <select
                                  value={pry.lider_secundario_id || ''}
                                  onChange={e => asignarCoLiderProyecto(pry.id, e.target.value)}
                                  className="w-full px-2 py-1 bg-cream-50 border border-stone-200 rounded-lg text-[11px] font-bold text-charcoal-900 focus:ring-2 focus:ring-sage-500"
                                >
                                  <option value="">-- Sin Co-Líder --</option>
                                  {usuarios.filter(u => u.id !== pry.lider_id).map(u => (
                                    <option key={u.id} value={u.id}>
                                      {u.nombre_completo} ({u.rol_nombre || u.area_nombre})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Proyectos sin Área Específica */}
              {proyectos.filter(p => !areas.some(a => a.id === p.area_id || a.nombre === p.area_id)).length > 0 && (
                <div className="p-4 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
                  <h4 className="font-bold text-charcoal-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5" /> Proyectos Generales CCV
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {proyectos.filter(p => !areas.some(a => a.id === p.area_id || a.nombre === p.area_id)).map(pry => (
                      <div key={pry.id} className="p-3 bg-white rounded-2xl border border-stone-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-extrabold text-charcoal-900 text-xs">{pry.nombre}</h5>
                            <p className="text-xs text-charcoal-600 mt-1">{pry.descripcion}</p>
                            <p className="text-xs text-charcoal-500 mt-1">Líder: {pry.lider_nombre || 'Sin Asignar'}</p>
                          </div>
                          <button
                            onClick={() => setEntityToEdit({ tipo: 'proyecto', data: pry })}
                            className="p-1 text-charcoal-400 hover:text-sage-700"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {pestana === 'roles' && (
        <div className="ccv-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-charcoal-900">Matriz de Roles de la Plataforma CCV</h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Definición de roles organizacionales ({roles.length}) y asignación de permisos CRUD.
              </p>
            </div>
            <button
              onClick={() => setIsCreateRoleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow transition-all shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Crear Nuevo Rol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((rol) => {
              const permisosRol = rolesPermisosMap[rol.id] || [];
              const usuariosAsignados = usuarios.filter(u => u.rol_id === rol.id).length;

              return (
                <div key={rol.id} className="p-4 bg-cream-50 rounded-2xl border border-stone-200/80 flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-charcoal-900 text-sm">{rol.nombre}</h4>
                      <span className="text-[10px] font-mono font-bold bg-sage-100 text-sage-800 px-2 py-0.5 rounded border border-sage-200">
                        Área: {rol.area_nombre}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-charcoal-400 tracking-wider block">
                        Permisos ({permisosRol.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {permisosRol.map(pKey => (
                          <span key={pKey} className="text-[10px] font-mono font-bold bg-white text-charcoal-800 px-1.5 py-0.5 rounded border border-stone-200">
                            {pKey}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/60 flex justify-between items-center text-xs">
                    <span className="text-charcoal-500 font-medium">Usuarios asignados: {usuariosAsignados}</span>
                    <button
                      onClick={() => setRolPermisosEditar(rol)}
                      className="text-sage-700 font-extrabold hover:underline flex items-center gap-1 text-xs"
                    >
                      <Key className="w-3.5 h-3.5" /> Editar Permisos
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Areas Hierarchy Tab */}
      {pestana === 'areas' && (
        <div className="ccv-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-1 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-sage-600" />
                Organigrama de Áreas Jerárquicas y Subáreas
              </h3>
              <p className="text-xs text-charcoal-500">
                La regla de visibilidad descendente (RLS) permite que las áreas padre tengan supervisión total de las tareas e información creadas en sus subáreas derivadas.
              </p>
            </div>
            <button
              onClick={() => setIsCreateAreaModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow transition-all shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Crear Nueva Área / Subárea
            </button>
          </div>

          <div className="space-y-4 max-w-4xl">
            {/* Renderizar áreas raíz y sus jerarquías de dependencias completas */}
            {areas
              .filter(a => !a.parent_id || !areas.some(p => p.id === a.parent_id))
              .sort((a, b) => b.nivel - a.nivel)
              .map((areaPrincipal) => (
                <AreaHierarchyNode
                  key={areaPrincipal.id}
                  area={areaPrincipal}
                  allAreas={areas}
                  roles={roles}
                  usuarios={usuarios}
                  proyectos={proyectos}
                  onOpenCreateSubarea={handleOpenCreateSubarea}
                  onOpenCreateRole={handleOpenCreateRoleForArea}
                  onOpenDeleteArea={handleOpenDeleteArea}
                />
              ))}
          </div>
        </div>
      )}

      {/* Hourly Rate Configuration Tab */}
      {pestana === 'tarifas' && (
        <div className="ccv-card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-charcoal-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-sage-600" />
              Configuración de Tarifas por Hora (Proyectos)
            </h3>
            <p className="text-xs text-charcoal-500 mt-1">
              Establece la tarifa monetaria por hora para cada especialidad de tarea de proyectos. El valor total de cada tarea se calculará automáticamente multiplicando la tarifa por las horas estimadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tarifasProyecto.map((t) => (
              <div key={t.categoria} className="p-5 bg-cream-50/60 rounded-2xl border border-stone-200 flex flex-col justify-between space-y-4 hover:border-sage-300 transition-all shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 uppercase tracking-wider">
                      Especialidad de Tarea
                    </span>
                    <h4 className="text-lg font-black text-charcoal-900 mt-1">{t.categoria}</h4>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{t.descripcion}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-sage-700 font-extrabold text-sm shadow-xs">
                    $/h
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between gap-4">
                  <div className="flex-1 max-w-[220px]">
                    <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Tarifa por Hora (COP $)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-charcoal-400 font-bold">$</span>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        defaultValue={t.tarifa_hora}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                            actualizarTarifaProyecto(t.categoria as CategoriaTareaProyecto, val);
                          }
                        }}
                        className="w-full pl-7 pr-3 py-2 bg-white rounded-xl border border-stone-300 text-xs font-black text-charcoal-900 focus:ring-2 focus:ring-sage-500 focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-charcoal-500 block uppercase">Ejemplo 10 Horas</span>
                    <span className="text-sm font-black text-sage-700">${(t.tarifa_hora * 10).toLocaleString('es-CO')} COP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {isUserModalOpen && (
        <UserFormModal
          usuarioEditar={usuarioEditar}
          roles={roles}
          onClose={() => setIsUserModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}

      {rolPermisosEditar && (
        <RolePermissionsModal
          rol={rolPermisosEditar}
          permisosDef={permisosDef}
          permisosActuales={rolesPermisosMap[rolPermisosEditar.id] || []}
          onClose={() => setRolPermisosEditar(null)}
          onSave={actualizarPermisosRol}
        />
      )}

      {usuarioResetPassword && (
        <AdminResetPasswordModal
          usuario={usuarioResetPassword}
          onClose={() => setUsuarioResetPassword(null)}
          onResetPassword={adminResetPassword}
        />
      )}

      {createEntityType && (
        <CreateEntityModal
          tipo={createEntityType}
          facultades={facultades}
          programas={programas}
          areas={areas}
          usuarios={usuarios}
          onClose={() => setCreateEntityType(null)}
          onCrearFacultad={crearFacultad}
          onCrearPrograma={crearPrograma}
          onCrearCurso={crearCurso}
          onCrearProyecto={crearProyecto}
        />
      )}

      {entityToEdit && (
        <CreateEntityModal
          tipo={entityToEdit.tipo}
          initialData={entityToEdit.data}
          facultades={facultades}
          programas={programas}
          areas={areas}
          usuarios={usuarios}
          onClose={() => setEntityToEdit(null)}
          onCrearFacultad={crearFacultad}
          onEditarFacultad={editarFacultad}
          onCrearPrograma={crearPrograma}
          onEditarPrograma={editarPrograma}
          onCrearCurso={crearCurso}
          onEditarCurso={editarCurso}
          onCrearProyecto={crearProyecto}
          onEditarProyecto={editarProyecto}
        />
      )}

      {isCreateRoleModalOpen && (
        <CreateRoleModal
          areas={areas}
          permisosDef={permisosDef}
          defaultAreaId={defaultAreaIdForRoleModal}
          onClose={() => {
            setIsCreateRoleModalOpen(false);
            setDefaultAreaIdForRoleModal(undefined);
          }}
          onCrearRol={crearRol}
        />
      )}

      {isCreateAreaModalOpen && (
        <CreateAreaModal
          areas={areas}
          defaultParentId={defaultParentIdForAreaModal}
          onClose={() => {
            setIsCreateAreaModalOpen(false);
            setDefaultParentIdForAreaModal(undefined);
          }}
          onCrearArea={crearArea}
        />
      )}

      {areaAEliminar && (
        <ConfirmDeleteAreaModal
          area={areaAEliminar}
          allAreas={areas}
          roles={roles}
          usuarios={usuarios}
          proyectos={proyectos}
          onClose={() => setAreaAEliminar(null)}
          onConfirmDelete={eliminarArea}
        />
      )}
    </div>
  );
};
