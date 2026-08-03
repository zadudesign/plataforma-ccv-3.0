'use client';

import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  UserCheck, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Plus,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Layers,
  AlertCircle,
  Search,
  Shield
} from 'lucide-react';
import { TareaCCV, Usuario, CursoVirtual, ProyectoEspecial, Programa, TareaComentario } from '@/types';

interface DashboardOverviewProps {
  tareas: TareaCCV[];
  comentarios: TareaComentario[];
  usuarioActual: Usuario;
  usuarios?: Usuario[];
  programas: Programa[];
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  onSelectTask: (tarea: TareaCCV) => void;
  onOpenCreateTask: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tareas,
  comentarios = [],
  usuarioActual,
  usuarios = [],
  programas = [],
  cursos = [],
  proyectos = [],
  onSelectTask,
  onOpenCreateTask,
}) => {
  // 1. CÁLCULO DE CONTADORES MAESTROS
  const numProgramas = programas.length;
  const numCursos = cursos.length;
  const numProyectos = proyectos.length;
  const numTareas = tareas.length;

  // Docentes: Usuarios con rol Docente o asignados a cursos
  const numDocentes = Math.max(
    usuarios.filter(u => u.rol_nombre === 'Docente' || u.area_nombre === 'CURSO').length,
    new Set(cursos.map(c => c.docente_id).filter(Boolean)).size,
    1
  );

  // Pares Evaluadores: Usuarios con rol Par Evaluador o asignados como evaluadores
  const numParesEvaluadores = Math.max(
    usuarios.filter(u => u.rol_nombre === 'Par Evaluador').length,
    new Set(cursos.map(c => c.evaluador_id).filter(Boolean)).size,
    1
  );

  // 2. CÁLCULO DE PROGRESO GLOBAL DE CURSOS VIRTUALES
  const cursosDesglose = {
    diseno: cursos.filter(c => c.estado === 'En Diseño').length,
    produccion: cursos.filter(c => c.estado === 'En Producción').length,
    revision: cursos.filter(c => c.estado === 'En Revisión').length,
    aprobado: cursos.filter(c => c.estado === 'Aprobado CCV').length,
    publicado: cursos.filter(c => c.estado === 'Publicado LMS').length,
  };

  const getCursoWeight = (estado: string) => {
    switch (estado) {
      case 'Publicado LMS': return 100;
      case 'Aprobado CCV': return 85;
      case 'En Revisión': return 65;
      case 'En Producción': return 40;
      case 'En Diseño': return 15;
      default: return 0;
    }
  };

  const progresoCursosPorcentaje = numCursos > 0 
    ? Math.round(cursos.reduce((acc, c) => acc + getCursoWeight(c.estado), 0) / numCursos)
    : 0;

  // 3. CÁLCULO DE PROGRESO GLOBAL DE PROYECTOS ESPECIALES
  const proyectosDesglose = {
    planificacion: proyectos.filter(p => p.estado === 'Planificación').length,
    proceso: proyectos.filter(p => p.estado === 'En Proceso').length,
    completado: proyectos.filter(p => p.estado === 'Completado').length,
    pausado: proyectos.filter(p => p.estado === 'Pausado').length,
  };

  const getProyectoWeight = (estado: string) => {
    switch (estado) {
      case 'Completado': return 100;
      case 'En Proceso': return 50;
      case 'Planificación': return 20;
      case 'Pausado': return 0;
      default: return 0;
    }
  };

  const progresoProyectosPorcentaje = numProyectos > 0
    ? Math.round(proyectos.reduce((acc, p) => acc + getProyectoWeight(p.estado), 0) / numProyectos)
    : 0;

  // 4. ACTIVIDAD RECIENTE
  const ultimasTareas = [...tareas].slice(0, 5);
  const ultimosComentarios = [...comentarios].slice(0, 5);

  return (
    <div className="space-y-7 animate-fadeIn pb-8">
      {/* ==================================================================== */}
      {/* 1. SECCIÓN: CONTADORES MAESTROS (6 Tarjetas)                         */}
      {/* ==================================================================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-extrabold text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sage-600" />
            Métricas Institucionales CCV
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-sage-800 bg-sage-100 border border-sage-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Vista de Rol: {usuarioActual.rol_nombre || 'Usuario'} ({usuarioActual.area_nombre || 'CURSO'})</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Card 1: Programas */}
          <div className="ccv-card p-4 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 border-l-4 border-l-sage-600">
            <div className="flex items-center justify-between text-sage-600 mb-2">
              <span className="text-[11px] font-extrabold text-charcoal-500 uppercase tracking-wider">Programas</span>
              <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-sage-600" />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black text-charcoal-900">{numProgramas}</h4>
              <p className="text-[10px] font-semibold text-sage-700 mt-0.5">Programas Activos</p>
            </div>
          </div>

          {/* Card 2: Cursos */}
          <div className="ccv-card p-4 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-extrabold text-charcoal-500 uppercase tracking-wider">Cursos</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black text-charcoal-900">{numCursos}</h4>
              <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">Cursos Virtuales</p>
            </div>
          </div>

          {/* Card 3: Proyectos */}
          <div className="ccv-card p-4 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-[11px] font-extrabold text-charcoal-500 uppercase tracking-wider">Proyectos</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <FolderKanban className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black text-charcoal-900">{numProyectos}</h4>
              <p className="text-[10px] font-semibold text-amber-700 mt-0.5">Proyectos CCV</p>
            </div>
          </div>

          {/* Card 4: Tareas */}
          <div className="ccv-card p-4 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-[11px] font-extrabold text-charcoal-500 uppercase tracking-wider">Tareas</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black text-charcoal-900">{numTareas}</h4>
              <p className="text-[10px] font-semibold text-blue-700 mt-0.5">Entregables Totales</p>
            </div>
          </div>

          {/* Card 5: Docentes */}
          <div className="ccv-card p-4 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-[11px] font-extrabold text-charcoal-500 uppercase tracking-wider">Docentes</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black text-charcoal-900">{numDocentes}</h4>
              <p className="text-[10px] font-semibold text-purple-700 mt-0.5">Docentes Creadores</p>
            </div>
          </div>

          {/* Card 6: Pares Evaluadores */}
          <div className="ccv-card p-4 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between text-rose-600 mb-2">
              <span className="text-[11px] font-extrabold text-charcoal-500 uppercase tracking-wider">Evaluadores</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-rose-600" />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black text-charcoal-900">{numParesEvaluadores}</h4>
              <p className="text-[10px] font-semibold text-rose-700 mt-0.5">Pares Calificadores</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. SECCIÓN: PROGRESO GLOBAL (CURSOS Y PROYECTOS)                     */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso Global de Cursos */}
        <div className="ccv-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-charcoal-900">Progreso Global de Cursos</h4>
                <p className="text-xs text-charcoal-500">Estado promedio de desarrollo pedagógico y LMS</p>
              </div>
            </div>
            <span className="text-2xl font-black text-sage-700 bg-sage-50 px-3 py-1 rounded-2xl border border-sage-200">
              {progresoCursosPorcentaje}%
            </span>
          </div>

          {/* Barra de Progreso Principal */}
          <div className="space-y-1.5">
            <div className="w-full bg-cream-200/80 rounded-full h-3.5 p-0.5 overflow-hidden border border-cream-300/50">
              <div 
                className="bg-gradient-to-r from-sage-600 via-emerald-600 to-amber-500 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(progresoCursosPorcentaje, 4)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-charcoal-500">
              <span>0% Diseño</span>
              <span>50% Producción / Revisión</span>
              <span>100% Publicado LMS</span>
            </div>
          </div>

          {/* Desglose de estados en Cursos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-cream-200/60 text-center">
            <div className="p-2 bg-cream-50/70 rounded-xl border border-cream-200/40">
              <p className="text-[10px] font-extrabold text-charcoal-500 uppercase">En Diseño</p>
              <p className="text-sm font-black text-amber-700">{cursosDesglose.diseno}</p>
            </div>
            <div className="p-2 bg-cream-50/70 rounded-xl border border-cream-200/40">
              <p className="text-[10px] font-extrabold text-charcoal-500 uppercase">Producción</p>
              <p className="text-sm font-black text-blue-700">{cursosDesglose.produccion}</p>
            </div>
            <div className="p-2 bg-cream-50/70 rounded-xl border border-cream-200/40">
              <p className="text-[10px] font-extrabold text-charcoal-500 uppercase">En Revisión</p>
              <p className="text-sm font-black text-purple-700">{cursosDesglose.revision}</p>
            </div>
            <div className="p-2 bg-cream-50/70 rounded-xl border border-cream-200/40">
              <p className="text-[10px] font-extrabold text-charcoal-500 uppercase">Publicados</p>
              <p className="text-sm font-black text-sage-700">{cursosDesglose.publicado + cursosDesglose.aprobado}</p>
            </div>
          </div>
        </div>

        {/* Progreso Global de Proyectos */}
        <div className="ccv-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-charcoal-900">Progreso Global de Proyectos</h4>
                <p className="text-xs text-charcoal-500">Cumplimiento de proyectos especiales CCV</p>
              </div>
            </div>
            <span className="text-2xl font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-2xl border border-amber-200">
              {progresoProyectosPorcentaje}%
            </span>
          </div>

          {/* Barra de Progreso Principal */}
          <div className="space-y-1.5">
            <div className="w-full bg-cream-200/80 rounded-full h-3.5 p-0.5 overflow-hidden border border-cream-300/50">
              <div 
                className="bg-gradient-to-r from-amber-500 via-amber-600 to-sage-600 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(progresoProyectosPorcentaje, 4)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-charcoal-500">
              <span>0% Planificación</span>
              <span>50% En Ejecución</span>
              <span>100% Completado</span>
            </div>
          </div>

          {/* Desglose de estados en Proyectos */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cream-200/60 text-center">
            <div className="p-2 bg-cream-50/70 rounded-xl border border-cream-200/40">
              <p className="text-[10px] font-extrabold text-charcoal-500 uppercase">Planificación</p>
              <p className="text-sm font-black text-amber-700">{proyectosDesglose.planificacion}</p>
            </div>
            <div className="p-2 bg-cream-50/70 rounded-xl border border-cream-200/40">
              <p className="text-[10px] font-extrabold text-charcoal-500 uppercase">En Proceso</p>
              <p className="text-sm font-black text-blue-700">{proyectosDesglose.proceso}</p>
            </div>
            <div className="p-2 bg-cream-50/70 rounded-xl border border-cream-200/40">
              <p className="text-[10px] font-extrabold text-charcoal-500 uppercase">Completados</p>
              <p className="text-sm font-black text-sage-700">{proyectosDesglose.completado}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. SECCIÓN: ACTIVIDAD RECIENTE (ÚLTIMAS TAREAS Y COMENTARIOS)        */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Últimas Tareas Agregadas (6 Cols) */}
        <div className="lg:col-span-6 ccv-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-200/80">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-sage-600" />
                <h4 className="text-base font-extrabold text-charcoal-900">Últimas Tareas Registradas</h4>
              </div>
              <span className="text-xs text-sage-700 font-bold bg-sage-50 px-2.5 py-0.5 rounded-full">
                {tareas.length} Tareas
              </span>
            </div>

            <div className="space-y-3">
              {ultimasTareas.length === 0 ? (
                <p className="text-xs text-charcoal-500 text-center py-6">No hay tareas registradas recientemente.</p>
              ) : (
                ultimasTareas.map((tarea) => {
                  const getEstadoBadgeClass = (estado: string) => {
                    switch (estado) {
                      case 'Completado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      case 'En Revisión': return 'bg-purple-100 text-purple-800 border-purple-200';
                      case 'En Proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
                      default: return 'bg-amber-100 text-amber-800 border-amber-200';
                    }
                  };

                  return (
                    <div
                      key={tarea.id}
                      onClick={() => onSelectTask(tarea)}
                      className="p-3 bg-white hover:bg-cream-50 rounded-2xl border border-cream-200/60 shadow-sm transition-all hover:shadow hover:-translate-y-0.5 cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={tarea.responsable_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={tarea.responsable_nombre}
                          className="w-10 h-10 rounded-full object-cover border border-cream-300 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-charcoal-900 truncate group-hover:text-sage-700 transition-colors">
                            {tarea.titulo}
                          </p>
                          <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                            {tarea.curso_nombre || tarea.proyecto_nombre || 'Asignación General'} • <span className="font-semibold text-charcoal-700">{tarea.responsable_nombre}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0 space-y-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getEstadoBadgeClass(tarea.estado)}`}>
                          {tarea.estado}
                        </span>
                        <span className="text-[10px] font-semibold text-charcoal-500">
                          Vence: {tarea.fecha_vencimiento}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-cream-200/60 text-right">
            <button 
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-sage-700 hover:text-sage-800 transition-colors"
            >
              <span>+ Agregar nueva tarea</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Columna Derecha: Últimos Comentarios Agregados (6 Cols) */}
        <div className="lg:col-span-6 ccv-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-200/80">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <h4 className="text-base font-extrabold text-charcoal-900">Últimos Comentarios & Feed</h4>
              </div>
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full">
                {comentarios.length} Comentarios
              </span>
            </div>

            <div className="space-y-3">
              {ultimosComentarios.length === 0 ? (
                <div className="text-center py-8 text-charcoal-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-40 text-charcoal-400" />
                  <p className="text-xs">No hay observaciones registradas en las tareas.</p>
                </div>
              ) : (
                ultimosComentarios.map((com) => {
                  const tareaAsociada = tareas.find(t => t.id === com.tarea_id);

                  return (
                    <div
                      key={com.id}
                      onClick={() => tareaAsociada && onSelectTask(tareaAsociada)}
                      className={`p-3 bg-white hover:bg-cream-50 rounded-2xl border border-cream-200/60 shadow-sm transition-all hover:shadow hover:-translate-y-0.5 ${tareaAsociada ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={com.usuario_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={com.usuario_nombre}
                          className="w-9 h-9 rounded-full object-cover border border-cream-300 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-extrabold text-charcoal-900">{com.usuario_nombre}</h5>
                            <span className="text-[10px] font-medium text-charcoal-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-charcoal-400" />
                              {com.created_at}
                            </span>
                          </div>

                          <p className="text-xs text-charcoal-700 mt-1 line-clamp-2 leading-relaxed bg-cream-50/80 p-2 rounded-xl border border-cream-100">
                            "{com.comentario}"
                          </p>

                          {tareaAsociada && (
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-sage-700 font-bold">
                              <span className="px-1.5 py-0.5 bg-sage-50 rounded text-sage-800">Tarea:</span>
                              <span className="truncate hover:underline">{tareaAsociada.titulo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-cream-200/60 text-center">
            <p className="text-[11px] text-charcoal-500 font-medium">
              Haz clic en cualquier comentario para abrir y responder en la tarea correspondiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
