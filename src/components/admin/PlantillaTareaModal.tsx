'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Clock, 
  ListOrdered, 
  UserCheck, 
  Layers, 
  CheckSquare, 
  Square, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { PlantillaTareaCurso, TipoResponsablePlantilla, Usuario } from '@/types';

interface PlantillaTareaModalProps {
  isOpen: boolean;
  initialData?: PlantillaTareaCurso | null;
  todasLasTareas: PlantillaTareaCurso[];
  usuariosCMU: Usuario[];
  onSave: (datos: Omit<PlantillaTareaCurso, 'id'>, dependenciasIds: string[]) => Promise<void>;
  onClose: () => void;
}

export const PlantillaTareaModal: React.FC<PlantillaTareaModalProps> = ({
  isOpen,
  initialData,
  todasLasTareas,
  usuariosCMU,
  onSave,
  onClose
}) => {
  const [codigo, setCodigo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState<number>(1);
  const [tipoResponsable, setTipoResponsable] = useState<TipoResponsablePlantilla>('DOCENTE');
  const [cmuUsuarioFijoId, setCmuUsuarioFijoId] = useState<string>('');
  const [tipoTarea, setTipoTarea] = useState('PRODUCCION');
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(120);
  const [activa, setActiva] = useState(true);
  const [dependenciasSeleccionadas, setDependenciasSeleccionadas] = useState<string[]>([]);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCodigo(initialData.codigo || '');
      setTitulo(initialData.titulo || '');
      setDescripcion(initialData.descripcion || '');
      setOrden(initialData.orden || 1);
      setTipoResponsable(initialData.tipo_responsable || 'DOCENTE');
      setCmuUsuarioFijoId(initialData.cmu_usuario_fijo_id || '');
      setTipoTarea(initialData.tipo_tarea || 'PRODUCCION');
      setTiempoEstimado(initialData.tiempo_estimado || 0);
      setActiva(initialData.activa !== false);
      setDependenciasSeleccionadas(initialData.dependencias || []);
    } else {
      const siguienteOrden = todasLasTareas.length > 0 
        ? Math.max(...todasLasTareas.map(t => t.orden)) + 1 
        : 1;
      setCodigo(`T${String(siguienteOrden).padStart(2, '0')}`);
      setTitulo('');
      setDescripcion('');
      setOrden(siguienteOrden);
      setTipoResponsable('DOCENTE');
      setCmuUsuarioFijoId('');
      setTipoTarea('PRODUCCION');
      setTiempoEstimado(120);
      setActiva(true);
      setDependenciasSeleccionadas([]);
    }
    setErrorValidacion(null);
  }, [initialData, todasLasTareas, isOpen]);

  if (!isOpen) return null;

  // Filtrar tareas que pueden ser dependencias (excluyendo a la misma tarea para evitar loops)
  const tareasCandidatas = todasLasTareas
    .filter(t => !initialData || t.id !== initialData.id)
    .sort((a, b) => a.orden - b.orden);

  const toggleDependencia = (depId: string) => {
    setDependenciasSeleccionadas(prev => 
      prev.includes(depId)
        ? prev.filter(id => id !== depId)
        : [...prev, depId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setErrorValidacion('El código de la tarea es obligatorio.');
      return;
    }
    if (!titulo.trim()) {
      setErrorValidacion('El título de la tarea es obligatorio.');
      return;
    }
    if (tipoResponsable === 'CMU_FIJO' && !cmuUsuarioFijoId) {
      setErrorValidacion('Debes seleccionar un usuario del CMU para el tipo de responsable fijo.');
      return;
    }

    setGuardando(true);
    setErrorValidacion(null);

    try {
      await onSave({
        codigo: codigo.trim().toUpperCase(),
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        orden,
        tipo_responsable: tipoResponsable,
        cmu_usuario_fijo_id: tipoResponsable === 'CMU_FIJO' ? cmuUsuarioFijoId : undefined,
        tipo_tarea: tipoTarea,
        tiempo_estimado: tiempoEstimado,
        activa
      }, dependenciasSeleccionadas);
      onClose();
    } catch (err: any) {
      setErrorValidacion(err?.message || 'Error al guardar la tarea de plantilla.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-cream-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-charcoal-900">
                {initialData ? 'Editar Tarea de Plantilla' : 'Nueva Tarea de Plantilla Base'}
              </h3>
              <p className="text-xs text-charcoal-500 font-medium">
                Configuración maestra de la secuencia progresiva para Cursos Virtuales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer border border-stone-200 shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {errorValidacion && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorValidacion}</span>
            </div>
          )}

          {/* Row 1: Código, Orden y Tiempo Estimado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Código *
              </label>
              <input
                type="text"
                required
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej. T01"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-400 font-mono font-bold text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ListOrdered className="w-3.5 h-3.5 text-sage-600" />
                Orden Secuencial *
              </label>
              <input
                type="number"
                min={1}
                required
                value={orden}
                onChange={e => setOrden(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-400 font-bold text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sage-600" />
                Duración (min) *
              </label>
              <input
                type="number"
                min={0}
                step={15}
                required
                value={tiempoEstimado}
                onChange={e => setTiempoEstimado(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-400 font-bold text-sm bg-white"
              />
            </div>
          </div>

          {/* Row 2: Título */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Título de la Tarea *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej. Entrega de Microcurrículo y Plan de Asignatura"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-400 font-bold text-sm bg-white text-charcoal-900"
            />
          </div>

          {/* Row 3: Descripción */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Descripción / Instrucciones Operativas
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Detalla qué entregable debe elaborarse o validarse en esta fase..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-400 text-xs text-charcoal-800 bg-white"
            />
          </div>

          {/* Row 4: Tipo de Responsable & Selector */}
          <div className="p-4 bg-cream-50 rounded-2xl border border-stone-200 space-y-3">
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-sage-600" />
              Asignación de Responsabilidad al Instanciar *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                tipoResponsable === 'DOCENTE'
                  ? 'bg-sky-50 border-sky-300 text-sky-900 font-black ring-1 ring-sky-300'
                  : 'bg-white border-stone-200 text-charcoal-700 hover:bg-stone-50 font-medium'
              }`}>
                <input
                  type="radio"
                  name="tipoResponsable"
                  value="DOCENTE"
                  checked={tipoResponsable === 'DOCENTE'}
                  onChange={() => setTipoResponsable('DOCENTE')}
                  className="accent-sky-600"
                />
                <div>
                  <p className="leading-tight font-bold">Docente del Curso</p>
                  <p className="text-[10px] text-charcoal-500 font-normal">Hereda del curso virtual</p>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                tipoResponsable === 'PAR_EVALUADOR'
                  ? 'bg-purple-50 border-purple-300 text-purple-900 font-black ring-1 ring-purple-300'
                  : 'bg-white border-stone-200 text-charcoal-700 hover:bg-stone-50 font-medium'
              }`}>
                <input
                  type="radio"
                  name="tipoResponsable"
                  value="PAR_EVALUADOR"
                  checked={tipoResponsable === 'PAR_EVALUADOR'}
                  onChange={() => setTipoResponsable('PAR_EVALUADOR')}
                  className="accent-purple-600"
                />
                <div>
                  <p className="leading-tight font-bold">Par Evaluador</p>
                  <p className="text-[10px] text-charcoal-500 font-normal">Hereda del curso virtual</p>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                tipoResponsable === 'COORDINADOR'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-black ring-1 ring-indigo-300'
                  : 'bg-white border-stone-200 text-charcoal-700 hover:bg-stone-50 font-medium'
              }`}>
                <input
                  type="radio"
                  name="tipoResponsable"
                  value="COORDINADOR"
                  checked={tipoResponsable === 'COORDINADOR'}
                  onChange={() => setTipoResponsable('COORDINADOR')}
                  className="accent-indigo-600"
                />
                <div>
                  <p className="leading-tight font-bold">Coordinador de Programa</p>
                  <p className="text-[10px] text-charcoal-500 font-normal">Hereda del programa del curso</p>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                tipoResponsable === 'DECANO'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-black ring-1 ring-emerald-300'
                  : 'bg-white border-stone-200 text-charcoal-700 hover:bg-stone-50 font-medium'
              }`}>
                <input
                  type="radio"
                  name="tipoResponsable"
                  value="DECANO"
                  checked={tipoResponsable === 'DECANO'}
                  onChange={() => setTipoResponsable('DECANO')}
                  className="accent-emerald-600"
                />
                <div>
                  <p className="leading-tight font-bold">Decano de Facultad</p>
                  <p className="text-[10px] text-charcoal-500 font-normal">Hereda de la facultad del curso</p>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                tipoResponsable === 'CMU_FIJO'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-black ring-1 ring-amber-300'
                  : 'bg-white border-stone-200 text-charcoal-700 hover:bg-stone-50 font-medium'
              }`}>
                <input
                  type="radio"
                  name="tipoResponsable"
                  value="CMU_FIJO"
                  checked={tipoResponsable === 'CMU_FIJO'}
                  onChange={() => setTipoResponsable('CMU_FIJO')}
                  className="accent-amber-600"
                />
                <div>
                  <p className="leading-tight font-bold">CMU Específico</p>
                  <p className="text-[10px] text-charcoal-500 font-normal">Usuario fijo predeterminado</p>
                </div>
              </label>
            </div>

            {/* Selector de Usuario CMU si aplica */}
            {tipoResponsable === 'CMU_FIJO' && (
              <div className="pt-2 animate-in fade-in">
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                  Selecciona el miembro del CMU responsable:
                </label>
                <select
                  value={cmuUsuarioFijoId}
                  onChange={e => setCmuUsuarioFijoId(e.target.value)}
                  required={tipoResponsable === 'CMU_FIJO'}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">-- Seleccionar usuario del CMU --</option>
                  {usuariosCMU.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo} ({u.rol_nombre || 'CMU'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 5: Selector Múltiple de Dependencias */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                Dependencias Previas Requeridas ({dependenciasSeleccionadas.length})
              </label>
              <span className="text-[10px] text-charcoal-400 italic">
                La tarea iniciará bloqueada hasta que estas tareas se completen
              </span>
            </div>

            {tareasCandidatas.length === 0 ? (
              <p className="text-xs text-charcoal-400 italic p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                No hay otras tareas creadas aún para establecer dependencias.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-2xl p-2 divide-y divide-stone-100 bg-white scrollbar-thin">
                {tareasCandidatas.map(candidata => {
                  const isChecked = dependenciasSeleccionadas.includes(candidata.id);
                  return (
                    <div
                      key={candidata.id}
                      onClick={() => toggleDependencia(candidata.id)}
                      className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-sky-50 text-sky-900 font-bold' 
                          : 'hover:bg-cream-50 text-charcoal-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-300 shrink-0" />
                        )}
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200">
                          {candidata.codigo}
                        </span>
                        <span className="truncate">{candidata.titulo}</span>
                      </div>
                      <span className="text-[10px] text-charcoal-500 font-bold shrink-0">
                        {candidata.tipo_responsable === 'DOCENTE' ? 'Docente' :
                         candidata.tipo_responsable === 'PAR_EVALUADOR' ? 'Par Eval.' :
                         candidata.tipo_responsable === 'COORDINADOR' ? 'Coordinador' :
                         candidata.tipo_responsable === 'DECANO' ? 'Decano' : 'CMU Fijo'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Row 6: Switch Activa */}
          <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-stone-200">
            <div>
              <p className="text-xs font-bold text-charcoal-800">Tarea Activa en la Plantilla</p>
              <p className="text-[10px] text-charcoal-500">
                Si está desmarcada, se ignorará al cargar la plantilla en nuevos cursos
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activa}
                onChange={e => setActiva(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-sage-700 hover:bg-sage-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : initialData ? 'Actualizar Tarea' : 'Crear Tarea Base'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
