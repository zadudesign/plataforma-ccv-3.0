'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WelcomeBanner } from '@/components/layout/WelcomeBanner';
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
  fetchTareasDB, 
  createTareaDB, 
  updateTareaEstadoDB, 
  fetchComentariosDB, 
  addComentarioDB,
  addRegistroHorasDB
} from '@/lib/supabaseService';
import { INITIAL_TAREAS, INITIAL_COMENTARIOS } from '@/lib/mockData';
import { CourseProjectProgressModal } from '@/components/academic/CourseProjectProgressModal';
import { ProductivityDashboard } from '@/components/productivity/ProductivityDashboard';
import { VistaNavegacion, TareaCCV, TareaComentario, EstadoTarea, CursoVirtual, ProyectoEspecial } from '@/types';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  const { 
    usuarioActual, 
    usuarios,
    nivelArea, 
    isAdmin, 
    isRealAdmin,
    isDevSimulatorOpen, 
    setIsDevSimulatorOpen,
    facultades,
    programas,
    cursos,
    proyectos,
    areas,
    roles
  } = useAuth();

  const [vistaActual, setVistaActual] = useState<VistaNavegacion>('dashboard');
  const [busqueda, setBusqueda] = useState('');
  
  // Data state
  const [tareas, setTareas] = useState<TareaCCV[]>(INITIAL_TAREAS);
  const [comentarios, setComentarios] = useState<TareaComentario[]>(INITIAL_COMENTARIOS);
  
  // Modal states
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCCV | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [entidadProgresoSeleccionada, setEntidadProgresoSeleccionada] = useState<{ entidad: CursoVirtual | ProyectoEspecial; tipo: 'curso' | 'proyecto' } | null>(null);

  // Cargar tareas iniciales desde Supabase DB
  useEffect(() => {
    const loadTareas = async () => {
      const dbTareas = await fetchTareasDB();
      if (dbTareas && dbTareas.length > 0) {
        setTareas(dbTareas);
      }
    };
    loadTareas();
  }, []);

  // Cargar comentarios al seleccionar una tarea
  useEffect(() => {
    if (tareaSeleccionada) {
      const loadComentarios = async () => {
        const dbComs = await fetchComentariosDB(tareaSeleccionada.id);
        if (dbComs && dbComs.length > 0) {
          setComentarios(prev => {
            const otros = prev.filter(c => c.tarea_id !== tareaSeleccionada.id);
            return [...dbComs, ...otros];
          });
        }
      };
      loadComentarios();
    }
  }, [tareaSeleccionada]);

  const handleUpdateTaskHours = async (tareaId: string, horasAñadir: number) => {
    const tareaObj = tareas.find(t => t.id === tareaId);
    if (tareaObj) {
      await addRegistroHorasDB({
        tarea_id: tareaId,
        usuario_id: usuarioActual?.id,
        rol_destino: tareaObj.rol_destino || 'General',
        horas_registradas: horasAñadir,
        fecha: new Date().toISOString().split('T')[0],
        descripcion_avance: `Imputación de ${horasAñadir} horas de trabajo`
      });
    }
    setTareas(prev => prev.map(t => {
      if (t.id === tareaId) {
        return {
          ...t,
          tiempo_invertido: (t.tiempo_invertido || 0) + horasAñadir
        };
      }
      return t;
    }));
  };

  // If no user is logged in, show Login Form
  if (!usuarioActual) {
    return <LoginForm />;
  }

  // Handlers
  const handleUpdateStatus = async (tareaId: string, nuevoEstado: EstadoTarea) => {
    await updateTareaEstadoDB(tareaId, nuevoEstado);
    setTareas(prev => prev.map(t => {
      if (t.id === tareaId) {
        return {
          ...t,
          estado: nuevoEstado,
          fecha_completada: nuevoEstado === 'Completada' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return t;
    }));
    if (tareaSeleccionada && tareaSeleccionada.id === tareaId) {
      setTareaSeleccionada(prev => prev ? { ...prev, estado: nuevoEstado } : null);
    }
  };

  const handleAddComment = async (tareaId: string, texto: string) => {
    if (!usuarioActual) return;
    const dbCom = await addComentarioDB(tareaId, usuarioActual.id, texto);
    const nuevoComentarioObj: TareaComentario = dbCom || {
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

  const handleCreateTask = async (nuevaTarea: Omit<TareaCCV, 'id'>) => {
    const dbTarea = await createTareaDB(nuevaTarea);
    const id = dbTarea?.id || `t-${Date.now()}`;
    const tareaCompleta: TareaCCV = { ...nuevaTarea, id };
    setTareas(prev => [tareaCompleta, ...prev]);
  };

  const handleSelectCurso = (curso: CursoVirtual) => {
    setVistaActual('kanban');
  };

  // ---------------------------------------------------------------------------
  // REGLAS DE SEGURIDAD Y VISIBILIDAD DESCENDENTE (RLS POR NIVEL Y ROL)
  // ---------------------------------------------------------------------------

  // 1. Tareas Visibles por Rol y Nivel Jerárquico (Nivel 6 ADMIN & 5 CMU ven 100%)
  const tareasVisiblesPorRol = tareas.filter(t => {
    if (nivelArea >= 5) return true; // ADMIN (6) y CMU (5) ven todo
    if (t.responsable_id === usuarioActual.id) return true; // Asignado a este usuario
    
    // Mapear área de la tarea a su nivel
    const areaTareaNombre = t.area_nombre || 'CURSO';
    const areaTareaDef = areas.find(a => a.nombre === areaTareaNombre);
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

  // 2. Cursos Visibles por Rol (Docente/Evaluador ven solo sus cursos asignados)
  const cursosVisiblesPorRol = cursos.filter(c => {
    if (nivelArea >= 5) return true; // ADMIN / CMU ven todo
    // Decano: Cursos de su facultad
    const decanoFacultad = facultades.find(f => f.decano_id === usuarioActual.id);
    if (decanoFacultad && c.facultad_nombre === decanoFacultad.nombre) return true;
    // Coordinador: Cursos de su programa
    const coordPrograma = programas.find(p => p.coordinador_id === usuarioActual.id);
    if (coordPrograma && c.programa_id === coordPrograma.id) return true;
    // Docente o Par Evaluador
    if (c.docente_id === usuarioActual.id || c.evaluador_id === usuarioActual.id) return true;
    // O si tiene tareas visibles en ese curso
    if (tareasVisiblesPorRol.some(t => t.curso_id === c.id)) return true;

    return false;
  });

  // 3. Proyectos Visibles por Rol
  const proyectosVisiblesPorRol = proyectos.filter(p => {
    if (nivelArea >= 5) return true;
    return tareasVisiblesPorRol.some(t => t.proyecto_id === p.id);
  });

  // 4. Programas Visibles por Rol
  const programasVisiblesPorRol = programas.filter(p => {
    if (nivelArea >= 5) return true;
    const decanoFacultad = facultades.find(f => f.decano_id === usuarioActual.id);
    if (decanoFacultad && p.facultad_id === decanoFacultad.id) return true;
    if (p.coordinador_id === usuarioActual.id) return true;
    return cursosVisiblesPorRol.some(c => c.programa_id === p.id);
  });

  // 5. Comentarios Visibles por Rol
  const comentariosVisiblesPorRol = comentarios.filter(com => {
    if (nivelArea >= 5) return true;
    return tareasVisiblesPorRol.some(t => t.id === com.tarea_id);
  });

  return (
    <div className="min-h-screen bg-cream-100 flex font-sans relative">
      {/* Floating Left Pill Sidebar */}
      <Sidebar vistaActual={vistaActual} setVistaActual={setVistaActual} />

      {/* Main App Container */}
      <main className="flex-1 ml-28 mr-6 my-6 min-w-0">
        {/* Top Hero Blue Banner */}
        <WelcomeBanner usuarioActual={usuarioActual} />

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
            comentarios={comentariosVisiblesPorRol}
            usuarioActual={usuarioActual}
            usuarios={usuarios}
            programas={programasVisiblesPorRol}
            cursos={cursosVisiblesPorRol}
            proyectos={proyectosVisiblesPorRol}
            onSelectTask={(t) => setTareaSeleccionada(t)}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onOpenProgreso={(entidad, tipo) => setEntidadProgresoSeleccionada({ entidad, tipo })}
          />
        )}

        {vistaActual === 'academic' && (
          <AcademicTree
            facultades={facultades}
            programas={programas}
            cursos={cursos}
            proyectos={proyectos}
            areas={areas}
            tareas={tareasFiltradas}
            busqueda={busqueda}
            onSelectCurso={handleSelectCurso}
            onOpenProgreso={(entidad, tipo) => setEntidadProgresoSeleccionada({ entidad, tipo })}
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

        {vistaActual === 'productivity' && (
          <ProductivityDashboard
            tareas={tareasFiltradas}
            usuarios={usuarios}
            usuarioActual={usuarioActual}
            onUpdateTaskHours={handleUpdateTaskHours}
            onSelectTask={(t) => setTareaSeleccionada(t)}
          />
        )}

        {vistaActual === 'admin' && (
          isAdmin() ? (
            <AdminDashboard
              areas={areas}
              roles={roles}
              usuarios={usuarios}
              facultades={facultades}
              programas={programas}
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
            onOpenCursoOProyecto={(entidadId, tipo) => {
              if (tipo === 'curso') {
                const c = cursos.find(x => x.id === entidadId);
                if (c) setEntidadProgresoSeleccionada({ entidad: c, tipo: 'curso' });
              } else {
                const p = proyectos.find(x => x.id === entidadId);
                if (p) setEntidadProgresoSeleccionada({ entidad: p, tipo: 'proyecto' });
              }
            }}
          />
        )}

        {isCreateTaskOpen && (
          <CreateTaskModal
            areas={areas}
            cursos={cursos}
            proyectos={proyectos}
            usuarios={usuarios}
            onClose={() => setIsCreateTaskOpen(false)}
            onCreateTask={handleCreateTask}
          />
        )}

        {/* Quick Role Simulator Modal */}
        {isDevSimulatorOpen && isRealAdmin() && (
          <DevRoleSimulatorModal onClose={() => setIsDevSimulatorOpen(false)} />
        )}

        {/* Course & Project Progress Detail Modal */}
        {entidadProgresoSeleccionada && (
          <CourseProjectProgressModal
            entidad={entidadProgresoSeleccionada.entidad}
            tipo={entidadProgresoSeleccionada.tipo}
            tareas={tareas}
            comentarios={comentarios}
            onClose={() => setEntidadProgresoSeleccionada(null)}
            onSelectTask={(t) => setTareaSeleccionada(t)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>
    </div>
  );
}
