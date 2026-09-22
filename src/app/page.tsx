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
import { TaskRequestModal } from '@/components/home/TaskRequestModal';
import { LandingHome } from '@/components/home/LandingHome';
import { DevRoleSimulatorModal } from '@/components/auth/DevRoleSimulatorModal';
import { DigitalSignatureModal } from '@/components/auth/DigitalSignatureModal';
import { useAuth } from '@/context/AuthContext';
import { TimerProvider } from '@/context/TimerContext';

import { 
  fetchTareasDB, 
  createTareaDB, 
  updateTareaEstadoDB, 
  updateTareaFullDB,
  fetchComentariosDB, 
  addComentarioDB,
  addRegistroHorasDB
} from '@/lib/supabaseService';
import { CourseProjectProgressModal } from '@/components/academic/CourseProjectProgressModal';
import { ProductivityDashboard } from '@/components/productivity/ProductivityDashboard';
import { ContentPlannerView } from '@/components/planner/ContentPlannerView';
import { VistaNavegacion, PestanaAdmin, TareaCCV, TareaComentario, EstadoTarea, CursoVirtual, ProyectoEspecial } from '@/types';
import { simularDesbloqueoEnCascada } from '@/lib/courseTemplateUtils';
import { getEntitiesVisibleByRole } from '@/lib/roleVisibilityUtils';
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
  const [tareas, setTareas] = useState<TareaCCV[]>([]);
  const [comentarios, setComentarios] = useState<TareaComentario[]>([]);
  
  // Modal states
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCCV | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isTaskRequestOpen, setIsTaskRequestOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [entidadProgresoSeleccionada, setEntidadProgresoSeleccionada] = useState<{ entidad: CursoVirtual | ProyectoEspecial; tipo: 'curso' | 'proyecto' } | null>(null);
  const [pestanaAdminInicial, setPestanaAdminInicial] = useState<PestanaAdmin>('usuarios');

  // Por defecto al ingresar a cada perfil se ingresa directamente al Dashboard como página principal y se requiere firma si está pendiente
  useEffect(() => {
    if (usuarioActual) {
      setVistaActual('dashboard');
      if (!usuarioActual.firma_digital || usuarioActual.firma_digital.trim() === '') {
        setIsSignatureModalOpen(true);
      }
    }
  }, [usuarioActual?.id]);

  // Función helper para ordenar tareas de la más próxima a vencer a la última en vencer
  const ordenarTareasPorVencimiento = (lista: TareaCCV[]) => {
    return [...lista].sort((a, b) => {
      const fechaA = a.fecha_vencimiento?.trim() || '';
      const fechaB = b.fecha_vencimiento?.trim() || '';

      const sinFechaA = !fechaA || fechaA === 'Sin fecha';
      const sinFechaB = !fechaB || fechaB === 'Sin fecha';

      if (sinFechaA && !sinFechaB) return 1;
      if (!sinFechaA && sinFechaB) return -1;
      if (sinFechaA && sinFechaB) return 0;

      if (fechaA !== fechaB) {
        return fechaA.localeCompare(fechaB);
      }

      const horaA = (a.hora_vencimiento?.trim() || '18:00').padStart(5, '0');
      const horaB = (b.hora_vencimiento?.trim() || '18:00').padStart(5, '0');
      return horaA.localeCompare(horaB);
    });
  };

  // Cargar tareas iniciales exclusivamente desde Supabase DB
  useEffect(() => {
    const loadTareas = async () => {
      const dbTareas = await fetchTareasDB();
      setTareas(ordenarTareasPorVencimiento(dbTareas || []));
    };
    loadTareas();
  }, []);

  // Sincronizar y purgar tareas en memoria si un curso o proyecto es eliminado
  useEffect(() => {
    if (cursos.length > 0 || proyectos.length > 0) {
      const activeCursoIds = new Set(cursos.map(c => c.id));
      const activeProyIds = new Set(proyectos.map(p => p.id));
      setTareas(prev => prev.filter(t => {
        if (t.tipo_tarea === 'Curso Virtual' && t.curso_id && !activeCursoIds.has(t.curso_id)) {
          return false;
        }
        if (t.tipo_tarea === 'Proyecto' && t.proyecto_id && !activeProyIds.has(t.proyecto_id)) {
          return false;
        }
        return true;
      }));
      if (entidadProgresoSeleccionada) {
        if (entidadProgresoSeleccionada.tipo === 'curso' && !activeCursoIds.has(entidadProgresoSeleccionada.entidad.id)) {
          setEntidadProgresoSeleccionada(null);
        } else if (entidadProgresoSeleccionada.tipo === 'proyecto' && !activeProyIds.has(entidadProgresoSeleccionada.entidad.id)) {
          setEntidadProgresoSeleccionada(null);
        }
      }
    }
  }, [cursos, proyectos, entidadProgresoSeleccionada]);

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

  const handleUpdateTaskHours = async (tareaId: string, horasAñadir: number, esResponsableSecundario?: boolean, notas?: string) => {
    const tareaObj = tareas.find(t => t.id === tareaId);
    if (!tareaObj || tareaObj.tipo_tarea !== 'Proyecto') return;

    const targetRol = esResponsableSecundario 
      ? (tareaObj.rol_destino_secundario || tareaObj.rol_destino || 'General')
      : (tareaObj.rol_destino || 'General');
    const targetUserId = esResponsableSecundario
      ? (tareaObj.responsable_secundario_id || usuarioActual?.id)
      : (tareaObj.responsable_id || usuarioActual?.id);

    // Registrar en tabla de auditoría
    await addRegistroHorasDB({
      tarea_id: tareaId,
      usuario_id: targetUserId,
      rol_destino: targetRol,
      horas_registradas: horasAñadir,
      fecha: new Date().toISOString().split('T')[0],
      descripcion_avance: notas || `Imputación de ${horasAñadir} horas (${esResponsableSecundario ? 'Co-responsable' : 'Responsable Principal'})`
    }, esResponsableSecundario);

    // Calcular nuevos tiempos invertidos individuales
    const nuevoTPrincipal = esResponsableSecundario 
      ? (tareaObj.tiempo_invertido || 0) 
      : ((tareaObj.tiempo_invertido || 0) + horasAñadir);
    const nuevoTSecundario = esResponsableSecundario 
      ? ((tareaObj.tiempo_invertido_secundario || 0) + horasAñadir) 
      : tareaObj.tiempo_invertido_secundario;
    
    const totalHorasCalculadas = nuevoTPrincipal + (nuevoTSecundario || 0);
    const nuevaTarifaTarea = tareaObj.tarifa_hora ? totalHorasCalculadas * tareaObj.tarifa_hora : tareaObj.tarifa_tarea;

    // Actualizar tarea en base de datos Supabase
    await updateTareaFullDB(tareaId, {
      tiempo_invertido: nuevoTPrincipal,
      tiempo_invertido_secundario: nuevoTSecundario,
      tarifa_tarea: nuevaTarifaTarea
    });

    setTareas(prev => prev.map(t => {
      if (t.id === tareaId) {
        return {
          ...t,
          tiempo_invertido: nuevoTPrincipal,
          tiempo_invertido_secundario: nuevoTSecundario,
          tarifa_tarea: nuevaTarifaTarea
        };
      }
      return t;
    }));

    if (tareaSeleccionada && tareaSeleccionada.id === tareaId) {
      setTareaSeleccionada(prev => prev ? {
        ...prev,
        tiempo_invertido: nuevoTPrincipal,
        tiempo_invertido_secundario: nuevoTSecundario,
        tarifa_tarea: nuevaTarifaTarea
      } : null);
    }

    // Publicar automáticamente en la sección de Discusión & Comentarios
    if (usuarioActual) {
      const autorNombre = esResponsableSecundario
        ? (tareaObj.responsable_secundario_nombre || usuarioActual.nombre_completo)
        : (tareaObj.responsable_nombre || usuarioActual.nombre_completo);
      const autorAvatar = esResponsableSecundario
        ? tareaObj.responsable_secundario_avatar
        : (tareaObj.responsable_avatar || usuarioActual.avatar_url);

      const textoComentario = notas && notas.trim()
        ? `⏱️ Registro de Avance (+${horasAñadir}h): ${notas.trim()}`
        : `⏱️ Registro de Avance: Se sumaron +${horasAñadir} hrs trabajadas al proyecto (${esResponsableSecundario ? 'Co-responsable' : 'Responsable Principal'}).`;

      const dbCom = await addComentarioDB(tareaId, usuarioActual.id, textoComentario);
      const nuevoComentarioObj: TareaComentario = dbCom || {
        id: `com-${Date.now()}`,
        tarea_id: tareaId,
        usuario_id: usuarioActual.id,
        usuario_nombre: autorNombre,
        usuario_avatar: autorAvatar,
        comentario: textoComentario,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setComentarios(prev => [nuevoComentarioObj, ...prev]);
    }
  };

  // Handlers
  const handleUpdateStatus = async (tareaId: string, nuevoEstado: EstadoTarea) => {
    const targetTarea = tareas.find(t => t.id === tareaId);
    if (targetTarea && targetTarea.curso_id && targetTarea.estado_bloqueo === 'BLOQUEADA' && nuevoEstado !== 'Pendiente') {
      alert('Esta tarea está bloqueada en la secuencia del curso por dependencias previas no completadas.');
      return;
    }

    await updateTareaEstadoDB(tareaId, nuevoEstado);

    setTareas(prev => {
      let base = prev;
      if (targetTarea && targetTarea.curso_id) {
        base = simularDesbloqueoEnCascada(tareaId, nuevoEstado, prev);
      }

      return base.map(t => {
        if (t.id === tareaId) {
          const fechaCompletada = nuevoEstado === 'Completada' ? new Date().toISOString().split('T')[0] : undefined;
          const totalHoras = (t.tiempo_invertido || 0) + (t.tiempo_invertido_secundario || 0);
          const tarifaConsolidada = (t.tipo_tarea === 'Proyecto' && t.tarifa_hora) ? totalHoras * t.tarifa_hora : t.tarifa_tarea;

          if (nuevoEstado === 'Completada' && t.tipo_tarea === 'Proyecto') {
            updateTareaFullDB(tareaId, {
              estado: 'Completada',
              tarifa_tarea: tarifaConsolidada,
              tiempo_invertido: t.tiempo_invertido,
              tiempo_invertido_secundario: t.tiempo_invertido_secundario
            });
          }

          return {
            ...t,
            estado: nuevoEstado,
            fecha_completada: fechaCompletada,
            tarifa_tarea: tarifaConsolidada
          };
        }
        return t;
      });
    });

    if (tareaSeleccionada && tareaSeleccionada.id === tareaId) {
      setTareaSeleccionada(prev => {
        if (!prev) return null;
        const totalHoras = (prev.tiempo_invertido || 0) + (prev.tiempo_invertido_secundario || 0);
        const tarifaConsolidada = (prev.tipo_tarea === 'Proyecto' && prev.tarifa_hora) ? totalHoras * prev.tarifa_hora : prev.tarifa_tarea;
        return { 
          ...prev, 
          estado: nuevoEstado,
          fecha_completada: nuevoEstado === 'Completada' ? new Date().toISOString().split('T')[0] : undefined,
          tarifa_tarea: tarifaConsolidada,
          estado_bloqueo: nuevoEstado === 'Completada' ? 'COMPLETADA' : nuevoEstado === 'Pendiente' ? 'DISPONIBLE' : 'EN_PROCESO'
        };
      });
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
    const res = await createTareaDB(nuevaTarea);
    if (res.success && res.data) {
      setTareas(prev => ordenarTareasPorVencimiento([res.data!, ...prev]));
    } else {
      alert(`⚠️ Error al guardar tarea en Supabase:\n\n${res.error || 'No se pudo conectar con la base de datos.'}\n\nRevisa que el archivo .env.local esté configurado o que se hayan ejecutado las tablas en Supabase.`);
      const fallbackTarea: TareaCCV = { ...nuevaTarea, id: `t-${Date.now()}` };
      setTareas(prev => ordenarTareasPorVencimiento([fallbackTarea, ...prev]));
    }
  };

  const handleSelectCurso = (curso: CursoVirtual) => {
    setVistaActual('kanban');
  };

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // REGLAS DE SEGURIDAD Y VISIBILIDAD DE TAREAS POR ROL & JERARQUÍA
  // ---------------------------------------------------------------------------

  const {
    isSupervisorGlobal,
    tareasVisibles: tareasVisiblesPorRol,
    cursosVisibles: cursosVisiblesPorRol,
    proyectosVisibles: proyectosVisiblesPorRol,
    programasVisibles: programasVisiblesPorRol,
    facultadesVisibles: facultadesVisiblesPorRol,
    comentariosVisibles: comentariosVisiblesPorRol,
  } = React.useMemo(() => {
    return getEntitiesVisibleByRole({
      usuarioActual,
      nivelArea,
      roles,
      areas,
      facultades,
      programas,
      cursos,
      proyectos,
      tareas,
      comentarios,
    });
  }, [usuarioActual, nivelArea, roles, areas, facultades, programas, cursos, proyectos, tareas, comentarios]);

  // Si no hay sesión iniciada, mostrar la Landing Institucional CCV con acceso al Login
  if (!usuarioActual) {
    return <LandingHome />;
  }

  // Filter tasks by search query
  const tareasFiltradas = tareasVisiblesPorRol.filter(t => 
    t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.responsable_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.responsable_secundario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.curso_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.proyecto_nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const tareasPendientesCount = tareasVisiblesPorRol.filter(t => t.estado === 'Pendiente' && t.estado_bloqueo !== 'BLOQUEADA').length;

  return (
    <TimerProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans relative">
        {/* Floating Left Pill Sidebar */}
        <Sidebar 
          vistaActual={vistaActual} 
          setVistaActual={setVistaActual} 
          tareasPendientesCount={tareasPendientesCount}
        />

        {/* Main App Container */}
        <main className="flex-1 ml-0 px-3.5 pt-16 pb-6 md:pt-0 md:px-0 md:ml-28 md:mr-6 md:my-6 min-w-0 transition-all">
          {/* Top Hero Blue Banner */}
          <WelcomeBanner usuarioActual={usuarioActual} />

          <Header
            usuarioActual={usuarioActual}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onOpenTaskRequest={() => setIsTaskRequestOpen(true)}
            onOpenSolicitudes={() => {
              setPestanaAdminInicial('solicitudes');
              setVistaActual('admin');
            }}
            onOpenTareasPendientes={() => setVistaActual('kanban')}
            tareasPendientesCount={tareasPendientesCount}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onSelectTaskById={(id) => {
              const t = tareas.find(x => x.id === id);
              if (t) setTareaSeleccionada(t);
            }}
            onAddHours={handleUpdateTaskHours}
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
            facultades={facultadesVisiblesPorRol}
            onSelectTask={(t) => setTareaSeleccionada(t)}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onOpenTaskRequest={() => setIsTaskRequestOpen(true)}
            onOpenProgreso={(entidad, tipo) => setEntidadProgresoSeleccionada({ entidad, tipo })}
          />
        )}

        {vistaActual === 'academic' && (
          <AcademicTree
            facultades={facultadesVisiblesPorRol}
            programas={programasVisiblesPorRol}
            cursos={cursosVisiblesPorRol}
            proyectos={proyectosVisiblesPorRol}
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

        {vistaActual === 'parrilla' && (
          <ContentPlannerView
            cursos={cursosVisiblesPorRol}
            proyectos={proyectosVisiblesPorRol}
            usuarios={usuarios}
            usuarioActual={usuarioActual}
            onSelectTask={(tareaId) => {
              const t = tareas.find(item => item.id === tareaId);
              if (t) setTareaSeleccionada(t);
            }}
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
              pestanaInicial={pestanaAdminInicial}
              tareasPendientesCount={tareasPendientesCount}
              onNavigateKanban={() => setVistaActual('kanban')}
              onTareaCreada={(nueva) => {
                setTareas(prev => {
                  const filtered = prev.filter(t => t.id !== nueva.id);
                  return ordenarTareasPorVencimiento([nueva, ...filtered]);
                });
              }}
              onRecargarTareas={async () => {
                const dbTareas = await fetchTareasDB();
                if (dbTareas && dbTareas.length > 0) {
                  setTareas(ordenarTareasPorVencimiento(dbTareas));
                }
              }}
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
            onAddHours={handleUpdateTaskHours}
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
            cursos={cursosVisiblesPorRol}
            proyectos={proyectosVisiblesPorRol}
            usuarios={usuarios}
            onClose={() => setIsCreateTaskOpen(false)}
            onCreateTask={handleCreateTask}
          />
        )}

        {/* Task Request Modal (CCV) */}
        {isTaskRequestOpen && (
          <TaskRequestModal
            isOpen={isTaskRequestOpen}
            onClose={() => setIsTaskRequestOpen(false)}
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
            onAddComentario={handleAddComment}
            onAddHours={handleUpdateTaskHours}
            onRefreshTareas={async () => {
              const dbTareas = await fetchTareasDB();
              setTareas(ordenarTareasPorVencimiento(dbTareas || []));
            }}
          />
        )}
        {/* Digital Signature Modal */}
        {isSignatureModalOpen && (
          <DigitalSignatureModal onClose={() => setIsSignatureModalOpen(false)} />
        )}
      </main>
    </div>
  </TimerProvider>
  );
}
