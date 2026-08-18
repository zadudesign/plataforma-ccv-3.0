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
  Briefcase
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
import { INITIAL_CURSOS } from '@/lib/mockData';

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
    facultades,
    programas,
    cursos,
    proyectos,
    crearFacultad,
    crearPrograma,
    crearCurso,
    crearProyecto,
    asignarDecano,
    asignarCoordinador,
    asignarDocenteCurso,
    asignarEvaluadorCurso,
    asignarLiderProyecto,
    tarifasProyecto,
    actualizarTarifaProyecto
  } = useAuth();

  const [pestana, setPestana] = useState<'usuarios' | 'roles' | 'areas' | 'asignaciones' | 'tarifas'>('usuarios');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  
  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [usuarioResetPassword, setUsuarioResetPassword] = useState<Usuario | null>(null);
  const [rolPermisosEditar, setRolPermisosEditar] = useState<Rol | null>(null);
  const [createEntityType, setCreateEntityType] = useState<TipoEntidad | null>(null);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isCreateAreaModalOpen, setIsCreateAreaModalOpen] = useState(false);
  const [defaultParentIdForAreaModal, setDefaultParentIdForAreaModal] = useState<string | undefined>(undefined);
  const [defaultAreaIdForRoleModal, setDefaultAreaIdForRoleModal] = useState<string | undefined>(undefined);
  const [areaAEliminar, setAreaAEliminar] = useState<Area | null>(null);

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

  // Filter users by search box
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre_completo.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.email.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.rol_nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.area_nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

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
        <div className="ccv-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-charcoal-900">Gestión de Perfiles, Áreas & Roles de Integrantes</h3>
              <button
                onClick={() => setIsDevSimulatorOpen(true)}
                className="hidden lg:flex items-center gap-1 px-3 py-1 bg-coral-50 hover:bg-coral-100 text-coral-700 text-xs font-extrabold rounded-full border border-coral-200"
              >
                <Sparkles className="w-3.5 h-3.5" /> Cambiar Perfil Activo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={busquedaUsuario}
                  onChange={e => setBusquedaUsuario(e.target.value)}
                  placeholder="Buscar usuario o correo..."
                  className="pl-8 pr-3 py-1.5 bg-cream-50 border border-stone-200 rounded-full text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 w-48 sm:w-64"
                />
              </div>

              <button
                onClick={handleOpenCreateUser}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow shrink-0 transition-all"
              >
                <Plus className="w-4 h-4" /> Crear / Invitar Usuario
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-charcoal-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Área & Jerarquía</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Firma Digital</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal-800">
                {usuariosFiltrados.map((usr) => {
                  const isCurrentSession = usuarioActual?.id === usr.id;
                  return (
                    <tr key={usr.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3 px-4 font-bold flex items-center gap-3">
                        <img
                          src={usr.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={usr.nombre_completo}
                          className="w-8 h-8 rounded-full object-cover border border-stone-200"
                        />
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5">
                            {usr.nombre_completo}
                            {isCurrentSession && (
                              <span className="bg-sage-600 text-white text-[9px] px-1.5 py-0.2 rounded font-extrabold">TÚ</span>
                            )}
                          </span>
                          <span className="text-[10px] text-charcoal-400 font-normal">{usr.telefono || 'Sin teléfono'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-charcoal-600 font-medium">{usr.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-sage-100 text-sage-800 font-bold px-2.5 py-1 rounded-full border border-sage-200">
                          {usr.rol_nombre || 'Docente'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-charcoal-900 bg-cream-100 px-2 py-0.5 rounded border border-stone-200/60">
                          {usr.area_nombre || 'CURSO'}
                        </span>
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
                      <td className="py-3 px-4 text-right space-x-1">
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Academic Assignments Tab */}
      {pestana === 'asignaciones' && (
        <div className="space-y-6">
          {/* Section 1: Facultades & Decanos */}
          <div className="ccv-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sage-600" />
                <h3 className="text-base font-extrabold text-charcoal-900">1. Asignación y Registro de Facultades</h3>
              </div>
              <button
                onClick={() => setCreateEntityType('facultad')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Facultad
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultades.map(fac => (
                <div key={fac.id} className="p-4 bg-cream-50 rounded-2xl border border-stone-200 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-charcoal-900 text-sm">{fac.nombre}</h4>
                      <p className="text-xs text-charcoal-500 mt-1">
                        Decano Actual: <strong className="text-sage-700">{fac.decano_nombre || 'Sin Asignar'}</strong>
                      </p>
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
                        onClick={() => handleConfirmDeleteFacultad(fac)}
                        title="Eliminar Facultad"
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-coral-600 hover:bg-white transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
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
              ))}
            </div>
          </div>

          {/* Section 2: Programas & Coordinadores */}
          <div className="ccv-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sage-600" />
                <h3 className="text-base font-extrabold text-charcoal-900">2. Asignación y Registro de Programas Académicos</h3>
              </div>
              <button
                onClick={() => setCreateEntityType('programa')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Programa
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programas.map(prog => (
                <div key={prog.id} className="p-4 bg-cream-50 rounded-2xl border border-stone-200 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-charcoal-900 text-sm">{prog.nombre}</h4>
                      <p className="text-xs text-charcoal-500 mt-1">
                        Coordinador Actual: <strong className="text-sage-700">{prog.coordinador_nombre || 'Sin Asignar'}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEntityToEdit({ tipo: 'programa', data: prog })}
                        title="Editar Programa"
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-white transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleConfirmDeletePrograma(prog)}
                        title="Eliminar Programa"
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-coral-600 hover:bg-white transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-[10px] font-bold uppercase text-charcoal-500 mb-1">Cambiar Coordinador:</label>
                    <select
                      value={prog.coordinador_id || ''}
                      onChange={e => handleAssignCoordinador(prog.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:ring-2 focus:ring-sage-500"
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
          </div>

          {/* Section 3: Cursos Virtuales (Docente & Par Evaluador) */}
          <div className="ccv-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sage-600" />
                <h3 className="text-base font-extrabold text-charcoal-900">3. Asignación y Creación de Cursos Virtuales</h3>
              </div>
              <button
                onClick={() => setCreateEntityType('curso')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Curso
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cursos.map(cur => (
                <div key={cur.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-charcoal-900 text-sm">{cur.nombre}</h4>
                        <p className="text-[11px] text-charcoal-500 mt-0.5">Programa: {cur.programa_nombre} • Periodo: {cur.periodo}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[10px] bg-sage-100 text-sage-800 px-2 py-0.5 rounded font-bold">{cur.codigo}</span>
                        <button
                          onClick={() => setEntityToEdit({ tipo: 'curso', data: cur })}
                          title="Editar Curso"
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-cream-50 transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleConfirmDeleteCurso(cur)}
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
                        className="w-full px-2.5 py-1.5 bg-cream-50 border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900"
                      >
                        <option value="">-- Seleccionar Docente --</option>
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
                        className="w-full px-2.5 py-1.5 bg-cream-50 border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900"
                      >
                        <option value="">-- Seleccionar Evaluador --</option>
                        {usuarios.map(u => (
                          <option key={u.id} value={u.id}>{u.nombre_completo}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Proyectos CCV */}
          <div className="ccv-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sage-600" />
                <h3 className="text-base font-extrabold text-charcoal-900">4. Registro de Proyectos CCV</h3>
              </div>
              <button
                onClick={() => setCreateEntityType('proyecto')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Proyecto
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proyectos.map(pry => (
                <div key={pry.id} className="p-4 bg-cream-50 rounded-2xl border border-stone-200 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-charcoal-900 text-sm">{pry.nombre}</h4>
                        <p className="text-xs text-charcoal-600 mt-1">{pry.descripcion}</p>
                        <p className="text-xs text-charcoal-500 mt-1">
                          Líder Responsable: <strong className="text-sage-700">{pry.lider_nombre || 'Sin Asignar'}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-100 text-sage-800 border border-sage-200">
                          {pry.estado}
                        </span>
                        <button
                          onClick={() => setEntityToEdit({ tipo: 'proyecto', data: pry })}
                          title="Editar Proyecto"
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-white transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleConfirmDeleteProyecto(pry)}
                          title="Eliminar Proyecto"
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-coral-600 hover:bg-white transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-stone-200/60">
                    <label className="block text-[10px] font-bold uppercase text-charcoal-500 mb-1">Cambiar Líder de Proyecto:</label>
                    <select
                      value={pry.lider_id || ''}
                      onChange={e => asignarLiderProyecto(pry.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900 focus:ring-2 focus:ring-sage-500"
                    >
                      <option value="">-- Seleccionar Líder / Responsable --</option>
                      {usuarios.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.nombre_completo} ({u.rol_nombre || u.area_nombre})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
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
