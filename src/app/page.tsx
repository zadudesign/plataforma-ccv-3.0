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
import { LandingHome } from '@/components/home/LandingHome';
import { DevRoleSimulatorModal } from '@/components/auth/DevRoleSimulatorModal';
import { DigitalSignatureModal } from '@/components/auth/DigitalSignatureModal';
import { useAuth } from '@/context/AuthContext';

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
  const [tareas, setTareas] = useState<TareaCCV[]>([]);
  const [comentarios, setComentarios] = useState<TareaComentario[]>([]);
  
  // Modal states
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCCV | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [entidadProgresoSeleccionada, setEntidadProgresoSeleccionada] = useState<{ entidad: CursoVirtual | ProyectoEspecial; tipo: 'curso' | 'proyecto' } | null>(null);

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

  // If no user is logged in, show Landing Home with modal login trigger
  if (!usuarioActual) {
    return <LandingHome />;
  }

  // Handlers
  const handleUpdateStatus = async (tareaId: string, nuevoEstado: EstadoTarea) => {
    await updateTareaEstadoDB(tareaId, nuevoEstado);

    setTareas(prev => prev.map(t => {
      if (t.id === tareaId) {
        const fechaCompletada = nuevoEstado === 'Completada' ? new Date().toISOString().split('T')[0] : undefined;
        // Consolidación de costos si es Proyecto y pasa a completado
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
    }));

    if (tareaSeleccionada && tareaSeleccionada.id === tareaId) {
      setTareaSeleccionada(prev => {
        if (!prev) return null;
        const totalHoras = (prev.tiempo_invertido || 0) + (prev.tiempo_invertido_secundario || 0);
        const tarifaConsolidada = (prev.tipo_tarea === 'Proyecto' && prev.tarifa_hora) ? totalHoras * prev.tarifa_hora : prev.tarifa_tarea;
        return { 
          ...prev, 
          estado: nuevoEstado,
          fecha_completada: nuevoEstado === 'Completada' ? new Date().toISOString().split('T')[0] : undefined,
          tarifa_tarea: tarifaConsolidada
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

  const rolNombre = usuarioActual.rol_nombre || roles.find(r => r.id === usuarioActual.rol_id)?.nombre || '';
  const isSupervisorGlobal = nivelArea === 6 || rolNombre === 'Administrador';

  // Detección de Áreas/Departamentos donde el usuario actual es Jefe asignado
  const usuarioRolObj = roles.find(r => r.id === usuarioActual.rol_id);
  const areasDondeEsJefe = areas.filter(a => 
    a.jefe_id === usuarioActual.id || 
    (rolNombre === 'Jefe' && (a.id === usuarioRolObj?.area_id || a.nombre === usuarioRolObj?.area_nombre))
  );

  // Conjunto de IDs de áreas supervisadas por el Jefe (el departamento y todas sus subáreas hijas)
  const areaIdsSupervisadasPorJefe = React.useMemo(() => {
    const ids = new Set<string>();
    const agregarAreaYSubareas = (areaId: string) => {
      ids.add(areaId);
      areas.filter(sub => sub.parent_id === areaId).forEach(sub => agregarAreaYSubareas(sub.id));
    };
    areasDondeEsJefe.forEach(a => agregarAreaYSubareas(a.id));
    return ids;
  }, [areasDondeEsJefe, areas]);

  const esJefeDeArea = areaIdsSupervisadasPorJefe.size > 0;

  // 1. Tareas Visibles por Rol:
  // - Administrador (Nivel 6): Visión global de toda la plataforma.
  // - Jefe de Departamento: Tareas adscritas a su departamento o a proyectos de su departamento.
  // - Decano: Tareas asociadas a cursos/proyectos de su facultad o asignadas a él/su rol.
  // - Coordinador: Tareas asociadas a cursos de su programa o asignadas a él/su rol.
  // - Roles operativos (Diseño, Multimedia, Soporte, Docente, Par Evaluador):
  //   Ven las tareas asignadas específicamente a su ROL o a su usuario (responsable principal/secundario).
  const tareasVisiblesPorRol = tareas.filter(t => {
    // 1. Administrador (Nivel 6) ve todas las tareas
    if (isSupervisorGlobal) return true;

    // 2. Asignado directamente al usuario actual (Principal o Secundario)
    if (t.responsable_id === usuarioActual.id || t.responsable_secundario_id === usuarioActual.id) return true;

    // 3. Jefe de Departamento: Tareas de su departamento o de proyectos pertenecientes a su departamento
    if (esJefeDeArea) {
      if (t.area_id && areaIdsSupervisadasPorJefe.has(t.area_id)) return true;
      if (t.proyecto_id) {
        const proy = proyectos.find(p => p.id === t.proyecto_id);
        if (proy && proy.area_id && areaIdsSupervisadasPorJefe.has(proy.area_id)) return true;
      }
    }

    // 4. Coincidencia de Rol Destino con el Rol del usuario (Principal o Secundario)
    if (t.rol_destino && rolNombre && t.rol_destino.toLowerCase().trim() === rolNombre.toLowerCase().trim()) {
      return true;
    }
    if (t.rol_destino_secundario && rolNombre && t.rol_destino_secundario.toLowerCase().trim() === rolNombre.toLowerCase().trim()) {
      return true;
    }

    // 5. Líder o Co-Líder de Proyecto asignado ve las tareas de su proyecto
    if (t.proyecto_id && proyectos.some(p => p.id === t.proyecto_id && (p.lider_id === usuarioActual.id || p.lider_secundario_id === usuarioActual.id))) {
      return true;
    }

    // 6. Decano: Tareas asociadas a cursos o proyectos de su facultad
    const decanoFacultad = facultades.find(f => f.decano_id === usuarioActual.id);
    if (decanoFacultad) {
      if (t.curso_id && cursos.some(c => c.id === t.curso_id && c.facultad_nombre === decanoFacultad.nombre)) {
        return true;
      }
      if (t.proyecto_id && proyectos.some(p => p.id === t.proyecto_id)) {
        return true;
      }
    }

    // 7. Coordinador: Tareas asociadas a cursos de su programa
    const coordPrograma = programas.find(p => p.coordinador_id === usuarioActual.id);
    if (coordPrograma) {
      if (t.curso_id && cursos.some(c => c.id === t.curso_id && c.programa_id === coordPrograma.id)) {
        return true;
      }
    }

    // 8. Docente / Evaluador asignado al curso de la tarea
    if (t.curso_id) {
      const cursoDeTarea = cursos.find(c => c.id === t.curso_id);
      if (cursoDeTarea) {
        if (cursoDeTarea.docente_id === usuarioActual.id && (rolNombre === 'Docente' || !t.rol_destino || t.rol_destino === 'Docente')) {
          return true;
        }
        if (cursoDeTarea.evaluador_id === usuarioActual.id && (rolNombre === 'Par Evaluador' || !t.rol_destino || t.rol_destino === 'Par Evaluador')) {
          return true;
        }
      }
    }

    return false;
  });

  // Filter tasks by search query
  const tareasFiltradas = tareasVisiblesPorRol.filter(t => 
    t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.responsable_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.responsable_secundario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.curso_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.proyecto_nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 2. Cursos Visibles por Rol (Docente/Evaluador ven solo sus cursos asignados)
  const cursosVisiblesPorRol = cursos.filter(c => {
    if (isSupervisorGlobal) return true;
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
    if (isSupervisorGlobal) return true;
    // Jefe de Departamento: Proyectos adscritos a su departamento
    if (esJefeDeArea && p.area_id && areaIdsSupervisadasPorJefe.has(p.area_id)) return true;
    // Líder o Co-Líder
    if (p.lider_id === usuarioActual.id || p.lider_secundario_id === usuarioActual.id) return true;
    // O tareas asignadas en ese proyecto
    return tareasVisiblesPorRol.some(t => t.proyecto_id === p.id);
  });

  // 4. Programas Visibles por Rol
  const programasVisiblesPorRol = programas.filter(p => {
    if (isSupervisorGlobal) return true;
    const decanoFacultad = facultades.find(f => f.decano_id === usuarioActual.id);
    if (decanoFacultad && (p.facultad_id === decanoFacultad.id || p.facultad_nombre === decanoFacultad.nombre)) return true;
    if (p.coordinador_id === usuarioActual.id) return true;
    return cursosVisiblesPorRol.some(c => c.programa_id === p.id || c.programa_nombre === p.nombre);
  });

  // 5. Facultades Visibles por Rol
  const facultadesVisiblesPorRol = facultades.filter(f => {
    if (isSupervisorGlobal) return true;
    if (f.decano_id === usuarioActual.id) return true;
    return programasVisiblesPorRol.some(p => p.facultad_id === f.id || p.facultad_nombre === f.nombre);
  });

  // 6. Comentarios Visibles por Rol
  const comentariosVisiblesPorRol = comentarios.filter(com => {
    if (isSupervisorGlobal) return true;
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
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
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
            onAddComentario={handleAddComment}
          />
        )}
        {/* Digital Signature Modal */}
        {isSignatureModalOpen && (
          <DigitalSignatureModal onClose={() => setIsSignatureModalOpen(false)} />
        )}
      </main>
    </div>
  );
}
