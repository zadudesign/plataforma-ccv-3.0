'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  Key, 
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
  CheckCircle2
} from 'lucide-react';
import { Area, Rol, Usuario, Facultad, Programa, CursoVirtual } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { UserFormModal } from './UserFormModal';
import { RolePermissionsModal } from './RolePermissionsModal';
import { INITIAL_CURSOS } from '@/lib/mockData';

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
    setIsDevSimulatorOpen
  } = useAuth();

  const [pestana, setPestana] = useState<'usuarios' | 'roles' | 'areas' | 'asignaciones'>('usuarios');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  
  // Asignaciones local state
  const [facultades, setFacultades] = useState<Facultad[]>(initialFacultades);
  const [programas, setProgramas] = useState<Programa[]>(initialProgramas);
  const [cursos, setCursos] = useState<CursoVirtual[]>(INITIAL_CURSOS);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [rolPermisosEditar, setRolPermisosEditar] = useState<Rol | null>(null);

  // Filter users by search box
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre_completo.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.email.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.rol_nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.area_nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  // Handlers for assignments
  const handleAssignDecano = (facultadId: string, decanoId: string) => {
    const decano = usuarios.find(u => u.id === decanoId);
    setFacultades(prev => prev.map(f => f.id === facultadId ? {
      ...f,
      decano_id: decanoId,
      decano_nombre: decano?.nombre_completo || 'Sin Asignar'
    } : f));
  };

  const handleAssignCoordinador = (programaId: string, coordinadorId: string) => {
    const coord = usuarios.find(u => u.id === coordinadorId);
    setProgramas(prev => prev.map(p => p.id === programaId ? {
      ...p,
      coordinador_id: coordinadorId,
      coordinador_nombre: coord?.nombre_completo || 'Sin Asignar'
    } : p));
  };

  const handleAssignCursoDocente = (cursoId: string, docenteId: string) => {
    const doc = usuarios.find(u => u.id === docenteId);
    setCursos(prev => prev.map(c => c.id === cursoId ? {
      ...c,
      docente_id: docenteId,
      docente_nombre: doc?.nombre_completo || 'Sin Asignar'
    } : c));
  };

  const handleAssignCursoEvaluador = (cursoId: string, evaluadorId: string) => {
    const ev = usuarios.find(u => u.id === evaluadorId);
    setCursos(prev => prev.map(c => c.id === cursoId ? {
      ...c,
      evaluador_id: evaluadorId,
      evaluador_nombre: ev?.nombre_completo || 'Sin Asignar'
    } : c));
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
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sage-600" />
              <h3 className="text-base font-extrabold text-charcoal-900">1. Asignación de Decanos por Facultad</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultades.map(fac => (
                <div key={fac.id} className="p-4 bg-cream-50 rounded-2xl border border-stone-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-charcoal-900 text-sm">{fac.nombre}</h4>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Decano Actual: <strong className="text-sage-700">{fac.decano_nombre || 'Sin Asignar'}</strong>
                    </p>
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
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-sage-600" />
              <h3 className="text-base font-extrabold text-charcoal-900">2. Asignación de Coordinadores por Programa</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programas.map(prog => (
                <div key={prog.id} className="p-4 bg-cream-50 rounded-2xl border border-stone-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-charcoal-900 text-sm">{prog.nombre}</h4>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Coordinador Actual: <strong className="text-sage-700">{prog.coordinador_nombre || 'Sin Asignar'}</strong>
                    </p>
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
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sage-600" />
              <h3 className="text-base font-extrabold text-charcoal-900">3. Asignación de Docente & Par Evaluador por Curso</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cursos.map(cur => (
                <div key={cur.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-charcoal-900 text-sm">{cur.nombre}</h4>
                      <span className="font-mono text-[10px] bg-sage-100 text-sage-800 px-2 py-0.5 rounded font-bold">{cur.codigo}</span>
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">Programa: {cur.programa_nombre} • Periodo: {cur.periodo}</p>
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
        </div>
      )}

      {/* Roles Tab */}
      {pestana === 'roles' && (
        <div className="ccv-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-charcoal-900">Matriz de Roles de la Plataforma CCV</h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Definición de los 9 roles organizacionales y asignación de permisos CRUD.
              </p>
            </div>
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
          <h3 className="text-lg font-bold text-charcoal-900 mb-2">Cadena Organizacional y Niveles Jerárquicos</h3>
          <p className="text-xs text-charcoal-500 mb-6">
            La regla de visibilidad descendente (RLS) permite que los roles con áreas de jerarquía superior (Nivel 6 ADMIN, Nivel 5 CMU, Nivel 4 DEPARTAMENTO, Nivel 3 FACULTAD) supervisen los registros e información de sus áreas inferiores dependientes.
          </p>

          <div className="space-y-3 max-w-2xl">
            {areas.sort((a, b) => b.nivel - a.nivel).map((area) => (
              <div key={area.id} className="p-4 bg-white rounded-2xl border border-stone-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                    {area.nivel}
                  </div>
                  <div>
                    <h4 className="font-black text-charcoal-900 text-sm">{area.nombre}</h4>
                    <p className="text-xs text-charcoal-500">
                      {area.nivel === 6 ? 'Acceso Total Administrador' : area.nivel === 5 ? 'Centro Multimedial CCV (Producción y Supervisión)' : `Acceso Jerárquico Nivel ${area.nivel}`}
                    </p>
                  </div>
                </div>
                <span className="badge-green font-mono">Jerarquía Nivel {area.nivel}</span>
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
    </div>
  );
};
