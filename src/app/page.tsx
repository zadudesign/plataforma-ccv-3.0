'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { AcademicTree } from '@/components/academic/AcademicTree';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { LoginForm } from '@/components/auth/LoginForm';
import { DevRoleSimulatorModal } from '@/components/auth/DevRoleSimulatorModal';
import { useAuth } from '@/context/AuthContext';
import { 
  INITIAL_AREAS, 
  INITIAL_ROLES, 
  INITIAL_USUARIOS,
  INITIAL_FACULTADES, 
  INITIAL_PROGRAMAS, 
  INITIAL_PROYECTOS, 
  INITIAL_CURSOS, 
  INITIAL_TAREAS, 
  INITIAL_COMENTARIOS 
} from '@/lib/mockData';
import { VistaNavegacion, TareaCCV, TareaComentario, EstadoTarea, CursoVirtual } from '@/types';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  const { 
    usuarioActual, 
    nivelArea, 
    isAdmin, 
    isDevSimulatorOpen, 
    setIsDevSimulatorOpen 
  } = useAuth();

  const [vistaActual, setVistaActual] = useState<VistaNavegacion>('dashboard');
  const [busqueda, setBusqueda] = useState('');
  
  // Data state
  const [tareas, setTareas] = useState<TareaCCV[]>(INITIAL_TAREAS);
  const [comentarios, setComentarios] = useState<TareaComentario[]>(INITIAL_COMENTARIOS);
  
  // Modal states
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCCV | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // If no user is logged in, show the Login Form (connected to Supabase & Dev Simulator)
  if (!usuarioActual) {
    return <LoginForm />;
  }

  // Handlers
  const handleUpdateStatus = (tareaId: string, nuevoEstado: EstadoTarea) => {
    setTareas(prev => prev.map(t => {
      if (t.id === tareaId) {
        return {
          ...t,
          estado: nuevoEstado,
          fecha_completada: nuevoEstado === 'Completado' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return t;
    }));
    if (tareaSeleccionada && tareaSeleccionada.id === tareaId) {
      setTareaSeleccionada(prev => prev ? { ...prev, estado: nuevoEstado } : null);
    }
  };

  const handleAddComment = (tareaId: string, texto: string) => {
    if (!usuarioActual) return;
    const nuevoComentarioObj: TareaComentario = {
      id: `com-${Date.now()}`,
      tarea_id: tareaId,
      usuario_id: usuarioActual.id,
      usuario_nombre: usuarioActual.nombre_completo,
      usuario_avatar: usuarioActual.avatar_url,
      comentario: texto,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setComentarios(prev => [nuevoComentarioObj, ...prev]);
  };

  const handleCreateTask = (nuevaTarea: Omit<TareaCCV, 'id'>) => {
    const id = `t-${Date.now()}`;
    const tareaCompleta: TareaCCV = { ...nuevaTarea, id };
    setTareas(prev => [tareaCompleta, ...prev]);
  };

  const handleSelectCurso = (curso: CursoVirtual) => {
    setVistaActual('kanban');
  };

  // Regla de Visibilidad Descendente RLS según Jerarquía de Área del Usuario Autenticado
  // Nivel 6 (ADMIN) & Nivel 5 (CMU): Ven el 100% de tareas y proyectos.
  // Nivel 4 (DEPARTAMENTO), Nivel 3 (FACULTAD), Nivel 2 (PROGRAMA), Nivel 1 (CURSO): Ven sus tareas asignadas o correspondientes a su nivel.
  const tareasVisiblesPorRol = tareas.filter(t => {
    if (nivelArea >= 5) return true; // ADMIN (6) y CMU (5) ven todo
    if (t.responsable_id === usuarioActual.id) return true; // Asignado a este usuario
    
    // Mapear área de la tarea a su nivel
    const areaTareaNombre = t.area_nombre || 'CURSO';
    const areaTareaDef = INITIAL_AREAS.find(a => a.nombre === areaTareaNombre);
    const nivelTarea = areaTareaDef?.nivel || 1;

    return nivelArea >= nivelTarea;
  });

  // Filter tasks by search query
  const tareasFiltradas = tareasVisiblesPorRol.filter(t => 
    t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.responsable_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.curso_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.proyecto_nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-100 flex font-sans relative">
      {/* Floating Left Pill Sidebar */}
      <Sidebar vistaActual={vistaActual} setVistaActual={setVistaActual} />

      {/* Main App Container */}
      <main className="flex-1 ml-28 mr-6 my-6 min-w-0">
        <Header
          usuarioActual={usuarioActual}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
        />

        {/* View Switcher */}
        {vistaActual === 'dashboard' && (
          <DashboardOverview
            tareas={tareasFiltradas}
            usuarioActual={usuarioActual}
            cursos={INITIAL_CURSOS}
            proyectos={INITIAL_PROYECTOS}
            onSelectTask={(t) => setTareaSeleccionada(t)}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          />
        )}

        {vistaActual === 'academic' && (
          <AcademicTree
            facultades={INITIAL_FACULTADES}
            programas={INITIAL_PROGRAMAS}
            cursos={INITIAL_CURSOS}
            proyectos={INITIAL_PROYECTOS}
            tareas={tareasFiltradas}
            busqueda={busqueda}
            onSelectCurso={handleSelectCurso}
          />
        )}

        {vistaActual === 'kanban' && (
          <KanbanBoard
            tareas={tareasFiltradas}
            onSelectTask={(t) => setTareaSeleccionada(t)}
            onUpdateStatus={handleUpdateStatus}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          />
        )}

        {vistaActual === 'calendar' && (
          <CalendarView
            tareas={tareasFiltradas}
            onSelectTask={(t) => setTareaSeleccionada(t)}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          />
        )}

        {vistaActual === 'admin' && (
          isAdmin() ? (
            <AdminDashboard
              areas={INITIAL_AREAS}
              roles={INITIAL_ROLES}
              usuarios={INITIAL_USUARIOS}
              facultades={INITIAL_FACULTADES}
              programas={INITIAL_PROGRAMAS}
            />
          ) : (
            <div className="ccv-card p-12 text-center space-y-4 max-w-lg mx-auto my-12 animate-fadeIn">
              <div className="w-16 h-16 bg-coral-100 text-coral-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">Acceso Restringido por Rol</h3>
              <p className="text-xs text-charcoal-600 font-medium leading-relaxed">
                El panel de administración y gestión de usuarios está reservado exclusivamente para usuarios con el rol de <strong className="text-charcoal-900">Administrador (Nivel 6)</strong>. Tu perfil actual ({usuarioActual.rol_nombre}) posee nivel {nivelArea} ({usuarioActual.area_nombre || 'CURSO'}).
              </p>
              <button
                onClick={() => setVistaActual('dashboard')}
                className="px-6 py-2.5 bg-charcoal-900 text-white font-bold text-xs rounded-full shadow hover:bg-sage-700 transition-all"
              >
                Volver al Dashboard principal
              </button>
            </div>
          )
        )}

        {/* Modals */}
        {tareaSeleccionada && (
          <TaskDetailModal
            tarea={tareaSeleccionada}
            usuarioActual={usuarioActual}
            comentarios={comentarios}
            onClose={() => setTareaSeleccionada(null)}
            onUpdateStatus={handleUpdateStatus}
            onAddComment={handleAddComment}
          />
        )}

        {isCreateTaskOpen && (
          <CreateTaskModal
            areas={INITIAL_AREAS}
            cursos={INITIAL_CURSOS}
            proyectos={INITIAL_PROYECTOS}
            usuarios={INITIAL_USUARIOS}
            onClose={() => setIsCreateTaskOpen(false)}
            onCreateTask={handleCreateTask}
          />
        )}

        {/* Quick Role Simulator Modal */}
        {isDevSimulatorOpen && (
          <DevRoleSimulatorModal onClose={() => setIsDevSimulatorOpen(false)} />
        )}
      </main>
    </div>
  );
}
