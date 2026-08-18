'use client';

import React, { useState } from 'react';
import { X, Building2, GraduationCap, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { Facultad, Programa, CursoVirtual, ProyectoEspecial, Area, Usuario } from '@/types';

export type TipoEntidad = 'facultad' | 'programa' | 'curso' | 'proyecto';

interface CreateEntityModalProps {
  tipo: TipoEntidad;
  initialData?: Facultad | Programa | CursoVirtual | ProyectoEspecial | null;
  facultades: Facultad[];
  programas: Programa[];
  areas: Area[];
  usuarios: Usuario[];
  onClose: () => void;
  onCrearFacultad: (nombre: string, decanoId?: string) => void;
  onEditarFacultad?: (id: string, nombre: string, decanoId?: string) => void;
  onCrearPrograma: (nombre: string, facultadId: string, coordinadorId?: string) => void;
  onEditarPrograma?: (id: string, nombre: string, facultadId: string, coordinadorId?: string) => void;
  onCrearCurso: (datos: Omit<CursoVirtual, 'id'>) => void;
  onEditarCurso?: (id: string, datos: Partial<CursoVirtual>) => void;
  onCrearProyecto: (datos: Omit<ProyectoEspecial, 'id'>) => void;
  onEditarProyecto?: (id: string, datos: Partial<ProyectoEspecial>) => void;
}

export const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
  tipo,
  initialData,
  facultades,
  programas,
  areas,
  usuarios,
  onClose,
  onCrearFacultad,
  onEditarFacultad,
  onCrearPrograma,
  onEditarPrograma,
  onCrearCurso,
  onEditarCurso,
  onCrearProyecto,
  onEditarProyecto,
}) => {
  const isEditing = Boolean(initialData);

  // Campos genéricos
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Campos específicos Facultad / Programa
  const [facultadId, setFacultadId] = useState(
    (initialData as Programa)?.facultad_id || facultades[0]?.id || ''
  );
  const [decanoId, setDecanoId] = useState((initialData as Facultad)?.decano_id || '');
  const [coordinadorId, setCoordinadorId] = useState((initialData as Programa)?.coordinador_id || '');

  // Campos específicos Curso
  const [codigo, setCodigo] = useState((initialData as CursoVirtual)?.codigo || '');
  const [programaId, setProgramaId] = useState(
    (initialData as CursoVirtual)?.programa_id || programas[0]?.id || ''
  );
  const [periodo, setPeriodo] = useState((initialData as CursoVirtual)?.periodo || '2026-1');
  const [docenteId, setDocenteId] = useState((initialData as CursoVirtual)?.docente_id || '');
  const [evaluadorId, setEvaluadorId] = useState((initialData as CursoVirtual)?.evaluador_id || '');

  // Campos específicos Proyecto
  const [descripcion, setDescripcion] = useState((initialData as ProyectoEspecial)?.descripcion || '');
  const [areaId, setAreaId] = useState(
    (initialData as ProyectoEspecial)?.area_id || areas.find(a => a.nombre === 'CMU')?.id || areas[0]?.id || ''
  );
  const [estadoProyecto, setEstadoProyecto] = useState<'Planificación' | 'En Proceso' | 'Completado' | 'Pausado'>(
    (initialData as ProyectoEspecial)?.estado || 'En Proceso'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre es un campo obligatorio.');
      return;
    }

    if (tipo === 'facultad') {
      if (isEditing && initialData?.id && onEditarFacultad) {
        onEditarFacultad(initialData.id, nombre, decanoId || undefined);
      } else {
        onCrearFacultad(nombre, decanoId || undefined);
      }
    } else if (tipo === 'programa') {
      if (!facultadId) {
        setErrorMsg('Debes seleccionar una facultad.');
        return;
      }
      if (isEditing && initialData?.id && onEditarPrograma) {
        onEditarPrograma(initialData.id, nombre, facultadId, coordinadorId || undefined);
      } else {
        onCrearPrograma(nombre, facultadId, coordinadorId || undefined);
      }
    } else if (tipo === 'curso') {
      if (!codigo.trim() || !programaId) {
        setErrorMsg('El código y el programa son requeridos.');
        return;
      }
      const prog = programas.find(p => p.id === programaId);
      if (isEditing && initialData?.id && onEditarCurso) {
        onEditarCurso(initialData.id, {
          nombre,
          codigo,
          programa_id: programaId,
          programa_nombre: prog?.nombre,
          facultad_nombre: prog?.facultad_nombre,
          periodo,
          docente_id: docenteId || undefined,
          evaluador_id: evaluadorId || undefined,
        });
      } else {
        onCrearCurso({
          nombre,
          codigo,
          programa_id: programaId,
          programa_nombre: prog?.nombre,
          facultad_nombre: prog?.facultad_nombre,
          periodo,
          docente_id: docenteId || undefined,
          evaluador_id: evaluadorId || undefined,
          estado: 'En Diseño',
        });
      }
    } else if (tipo === 'proyecto') {
      if (isEditing && initialData?.id && onEditarProyecto) {
        onEditarProyecto(initialData.id, {
          nombre,
          descripcion,
          area_id: areaId,
          estado: estadoProyecto,
        });
      } else {
        onCrearProyecto({
          nombre,
          descripcion,
          area_id: areaId,
          estado: estadoProyecto,
        });
      }
    }

    onClose();
  };

  const getHeaderInfo = () => {
    switch (tipo) {
      case 'facultad':
        return {
          icon: <Building2 className="w-5 h-5 text-sage-600" />,
          title: isEditing ? 'Editar Facultad' : 'Registrar Nueva Facultad',
          subtitle: isEditing
            ? 'Actualiza los datos de la facultad o su Decano.'
            : 'Crea una unidad académica e incluye su Decano a cargo.',
        };
      case 'programa':
        return {
          icon: <GraduationCap className="w-5 h-5 text-sage-600" />,
          title: isEditing ? 'Editar Programa Académico' : 'Registrar Nuevo Programa Académico',
          subtitle: isEditing
            ? 'Modifica los datos del programa o su coordinador.'
            : 'Registra un programa o diplomado virtual y vincula su facultad.',
        };
      case 'curso':
        return {
          icon: <BookOpen className="w-5 h-5 text-sage-600" />,
          title: isEditing ? 'Editar Curso Virtual' : 'Registrar Nuevo Curso Virtual',
          subtitle: isEditing
            ? 'Actualiza los datos del curso virtual.'
            : 'Crea una asignatura virtual con su código institucional.',
        };
      case 'proyecto':
        return {
          icon: <Layers className="w-5 h-5 text-sage-600" />,
          title: isEditing ? 'Editar Proyecto' : 'Registrar Nuevo Proyecto',
          subtitle: isEditing
            ? 'Modifica la información del proyecto institucional.'
            : 'Añade una iniciativa institucional estratégica del CCV.',
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 flex items-center justify-center shadow-sm border border-sage-200">
            {header.icon}
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900">{header.title}</h3>
            <p className="text-xs text-charcoal-500">{header.subtitle}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-coral-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Nombre de {tipo === 'facultad' ? 'la Facultad' : tipo === 'programa' ? 'del Programa' : tipo === 'curso' ? 'del Curso' : 'del Proyecto'} *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder={
                tipo === 'facultad'
                  ? 'Ej: Facultad de Ciencias de la Educación'
                  : tipo === 'programa'
                  ? 'Ej: Máster en Entornos Virtuales'
                  : tipo === 'curso'
                  ? 'Ej: Evaluación Aprendizaje Virtual'
                  : 'Ej: Rediseño Plataforma LMS 2026'
              }
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              required
            />
          </div>

          {/* Formulario Específico de Facultad */}
          {tipo === 'facultad' && (
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Decano Asignado
              </label>
              <select
                value={decanoId}
                onChange={e => setDecanoId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value="">-- Asignar Decano después --</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo} ({u.rol_nombre || 'Usuario'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Formulario Específico de Programa */}
          {tipo === 'programa' && (
            <>
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Facultad Pertenece *
                </label>
                <select
                  value={facultadId}
                  onChange={e => setFacultadId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                >
                  {facultades.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Coordinador de Programa
                </label>
                <select
                  value={coordinadorId}
                  onChange={e => setCoordinadorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="">-- Asignar Coordinador después --</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo} ({u.rol_nombre || 'Usuario'})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Formulario Específico de Curso Virtual */}
          {tipo === 'curso' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Código Institucional *
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    placeholder="CCV-ED-101"
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-mono font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Periodo Lectivo *
                  </label>
                  <input
                    type="text"
                    value={periodo}
                    onChange={e => setPeriodo(e.target.value)}
                    placeholder="2026-1"
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Programa Académico *
                </label>
                <select
                  value={programaId}
                  onChange={e => setProgramaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                >
                  {programas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.facultad_nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-charcoal-600 mb-1">Docente Asignado</label>
                  <select
                    value={docenteId}
                    onChange={e => setDocenteId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900"
                  >
                    <option value="">-- Sin Asignar --</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre_completo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-charcoal-600 mb-1">Par Evaluador</label>
                  <select
                    value={evaluadorId}
                    onChange={e => setEvaluadorId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-medium text-charcoal-900"
                  >
                    <option value="">-- Sin Asignar --</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Formulario Específico de Proyecto */}
          {tipo === 'proyecto' && (
            <>
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Descripción del Proyecto
                </label>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalles y alcance estratégico..."
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Departamento / Área Responsable
                  </label>
                  <select
                    value={areaId}
                    onChange={e => setAreaId(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900"
                  >
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={estadoProyecto}
                    onChange={e => setEstadoProyecto(e.target.value as any)}
                    className="w-full px-3 py-2 bg-cream-50 border border-stone-200 rounded-xl text-xs font-bold text-charcoal-900"
                  >
                    <option value="Planificación">Planificación</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Pausado">Pausado</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-bold rounded-full transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Guardar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
