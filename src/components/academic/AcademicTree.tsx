'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  FolderKanban, 
  ChevronRight, 
  ChevronDown, 
  User, 
  CheckCircle2, 
  Clock, 
  Plus,
  Filter
} from 'lucide-react';
import { Facultad, Programa, CursoVirtual, ProyectoEspecial, TareaCCV } from '@/types';

interface AcademicTreeProps {
  facultades: Facultad[];
  programas: Programa[];
  cursos: CursoVirtual[];
  proyectos: ProyectoEspecial[];
  tareas: TareaCCV[];
  busqueda: string;
  onSelectCurso: (curso: CursoVirtual) => void;
}

export const AcademicTree: React.FC<AcademicTreeProps> = ({
  facultades,
  programas,
  cursos,
  proyectos,
  tareas,
  busqueda,
  onSelectCurso,
}) => {
  const [facultadesAbiertas, setFacultadesAbiertas] = useState<Record<string, boolean>>({
    'f-1': true,
    'f-2': true,
    'f-3': true,
  });

  const toggleFacultad = (id: string) => {
    setFacultadesAbiertas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getEstadoBadge = (estado: CursoVirtual['estado']) => {
    switch (estado) {
      case 'En Diseño':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> En Diseño</span>;
      case 'En Producción':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> En Producción</span>;
      case 'En Revisión':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> En Revisión Calidad</span>;
      case 'Aprobado CCV':
        return <span className="badge-green flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Aprobado CCV</span>;
      case 'Publicado LMS':
        return <span className="bg-sage-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Publicado LMS</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="ccv-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-sage-600" />
            Estructura Académica e Institucional CCV
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Organización jerárquica de Facultades, Programas de Educación Continua y Cursos Virtuales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-cream-100 text-charcoal-800 text-xs font-bold hover:bg-cream-200 transition-colors">
            <Filter className="w-4 h-4 text-charcoal-500" />
            Filtros Jerárquicos RLS
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 transition-colors shadow">
            <Plus className="w-4 h-4" />
            Nuevo Curso / Asignatura
          </button>
        </div>
      </div>

      {/* Proyectos Section */}
      <div className="ccv-card p-6">
        <h3 className="text-lg font-bold text-charcoal-900 flex items-center gap-2 mb-4">
          <FolderKanban className="w-5 h-5 text-amber-600" />
          Proyectos ({proyectos.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proyectos.map((proy) => (
            <div key={proy.id} className="p-4 bg-cream-50 rounded-2xl border border-stone-200/60 hover:border-sage-300 transition-all">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-charcoal-900 text-sm">{proy.nombre}</h4>
                <span className="badge-green">{proy.estado}</span>
              </div>
              <p className="text-xs text-charcoal-500 mt-1">{proy.descripcion}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-charcoal-600 pt-2 border-t border-stone-200/40">
                <span>Área: CMU (Centro Multimedial)</span>
                <span>{tareas.filter(t => t.proyecto_id === proy.id).length} Tareas asociadas</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faculties Accordion Tree */}
      <div className="space-y-4">
        {facultades.map((facultad) => {
          const progsFacultad = programas.filter(p => p.facultad_id === facultad.id);
          const isOpen = facultadesAbiertas[facultad.id];

          return (
            <div key={facultad.id} className="ccv-card overflow-hidden">
              {/* Faculty Accordion Header */}
              <div 
                onClick={() => toggleFacultad(facultad.id)}
                className="p-5 flex items-center justify-between cursor-pointer bg-stone-50/50 hover:bg-cream-100/70 transition-colors border-b border-stone-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-charcoal-900">{facultad.nombre}</h3>
                    <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5" /> Decano: {facultad.decano_nombre || 'No asignado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-charcoal-600 bg-white px-3 py-1 rounded-full border border-stone-200">
                    {progsFacultad.length} Programas
                  </span>
                  {isOpen ? <ChevronDown className="w-5 h-5 text-charcoal-500" /> : <ChevronRight className="w-5 h-5 text-charcoal-500" />}
                </div>
              </div>

              {/* Programs and Courses Accordion Body */}
              {isOpen && (
                <div className="p-5 space-y-5 bg-white">
                  {progsFacultad.map((prog) => {
                    const cursosProg = cursos.filter(c => c.programa_id === prog.id);
                    return (
                      <div key={prog.id} className="p-4 bg-cream-50/60 rounded-2xl border border-stone-200/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-sage-600" />
                            <h4 className="font-extrabold text-charcoal-900 text-sm">{prog.nombre}</h4>
                          </div>
                          <span className="text-xs text-charcoal-500">Coordinador: {prog.coordinador_nombre}</span>
                        </div>

                        {/* Courses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                          {cursosProg.map((curso) => {
                            const tareasCurso = tareas.filter(t => t.curso_id === curso.id);
                            return (
                              <div
                                key={curso.id}
                                onClick={() => onSelectCurso(curso)}
                                className="p-4 bg-white rounded-xl border border-stone-200 hover:border-sage-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[11px] font-mono font-bold bg-sage-50 text-sage-700 px-2 py-0.5 rounded">
                                      {curso.codigo}
                                    </span>
                                    {getEstadoBadge(curso.estado)}
                                  </div>
                                  <h5 className="font-extrabold text-charcoal-900 text-sm line-clamp-2">{curso.nombre}</h5>
                                </div>

                                <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-charcoal-500 space-y-1">
                                  <p><span className="font-semibold text-charcoal-700">Docente:</span> {curso.docente_nombre}</p>
                                  <p><span className="font-semibold text-charcoal-700">Evaluador:</span> {curso.evaluador_nombre}</p>
                                  <div className="flex justify-between items-center mt-2 pt-1 font-semibold text-sage-700 text-[11px]">
                                    <span>Periodo: {curso.periodo}</span>
                                    <span>{tareasCurso.length} Tareas producidas</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
