'use client';

import { Search, Plus, Shield, Sparkles, FileSignature, FilePlus, Inbox, ListTodo } from 'lucide-react';
import { Usuario } from '@/types';
import { useAuth } from '@/context/AuthContext';

import { HeaderTimerWidget } from './HeaderTimerWidget';

interface HeaderProps {
  usuarioActual?: Usuario;
  onOpenCreateTask: () => void;
  onOpenTaskRequest?: () => void;
  onOpenSolicitudes?: () => void;
  onOpenTareasPendientes?: () => void;
  tareasPendientesCount?: number;
  busqueda: string;
  setBusqueda: (val: string) => void;
  onOpenSignatureModal?: () => void;
  onSelectTaskById?: (tareaId: string) => void;
  onAddHours?: (tareaId: string, horas: number, esResponsableSecundario?: boolean, notas?: string) => Promise<void> | void;
}

export const Header: React.FC<HeaderProps> = ({
  usuarioActual: propsUsuario,
  onOpenCreateTask,
  onOpenTaskRequest,
  onOpenSolicitudes,
  onOpenTareasPendientes,
  tareasPendientesCount = 0,
  busqueda,
  setBusqueda,
  onOpenSignatureModal,
  onSelectTaskById,
  onAddHours,
}) => {
  const { usuarioActual: contextUsuario, nivelArea, setIsDevSimulatorOpen, isRealAdmin, isAdmin, solicitudesTareas } = useAuth();
  const usuarioActual = propsUsuario || contextUsuario;

  const solicitudesPendientes = solicitudesTareas?.filter(s => s.estado === 'Pendiente').length || 0;
  const tareasPendientes = tareasPendientesCount;

  if (!usuarioActual) return null;

  return (
    <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Buscar tarea, curso o profesor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full py-2.5 pl-5 pr-14 bg-white rounded-full text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs text-slate-900 placeholder-slate-400"
        />
        <button className="absolute right-1.5 top-1 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 transition-colors shadow-xs">
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Global Live Task Timer Widget */}
        {onAddHours && (
          <HeaderTimerWidget
            onSelectTaskById={onSelectTaskById}
            onAddHours={onAddHours}
          />
        )}
        {/* Role Simulator Badge Button (Exclusivo para Admin) */}
        {isRealAdmin() && (
          <button
            onClick={() => setIsDevSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold border border-slate-200 transition-colors shadow-2xs"
            title="Haz clic para simular otro rol de usuario"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>Simulador: {usuarioActual.rol_nombre || 'Docente'} (Nivel {nivelArea})</span>
            <Sparkles className="w-3 h-3 text-amber-500 ml-0.5" />
          </button>
        )}

        {/* Digital Signature Badge Button (Highlight: Control de Veeduría / Tiempos) */}
        {onOpenSignatureModal && (
          <button
            onClick={onOpenSignatureModal}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all shadow-2xs ${
              usuarioActual.firma_digital
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm animate-pulse'
            }`}
            title={usuarioActual.firma_digital ? "Firma Digital Registrada. Haz clic para actualizar." : "Firma Digital Pendiente. Haz clic para registrar."}
          >
            <FileSignature className={`w-3.5 h-3.5 ${usuarioActual.firma_digital ? 'text-amber-600' : 'text-white'}`} />
            <span>{usuarioActual.firma_digital ? 'Firma Registrada' : 'Registrar Firma'}</span>
          </button>
        )}

        {/* Action Button: Nueva Tarea (Exclusivo Admin) con Alerta de Tareas Pendientes y Solicitudes Vigentes vs Solicitar Tarea */}
        <div className="flex items-center gap-2.5">
          {/* Alerta de Tareas Pendientes (Visible tanto para Admin como para Docentes/Operativos) */}
          {onOpenTareasPendientes && (
            <button
              onClick={onOpenTareasPendientes}
              id="btn-header-alerta-tareas-pendientes"
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md scale-100 hover:scale-105 active:scale-95 cursor-pointer border ${
                tareasPendientes > 0
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400/40 animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              title={
                tareasPendientes > 0
                  ? `⚠️ Hay ${tareasPendientes} tarea(s) pendiente(s) por gestionar. Haz clic para abrir el Tablero Kanban.`
                  : 'Todas las tareas al día (0 tareas pendientes). Haz clic para abrir el Tablero Kanban.'
              }
            >
              <div className="relative">
                <ListTodo className={`w-4 h-4 ${tareasPendientes > 0 ? 'text-white' : 'text-slate-500'}`} />
                {tareasPendientes > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
                )}
              </div>
              <span>Tareas Pendientes</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black flex items-center justify-center ${
                  tareasPendientes > 0
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tareasPendientes}
              </span>
            </button>
          )}

          {isAdmin() ? (
            <>
              {/* Alerta de Bandeja de Solicitudes (Visible siempre al lado de Nueva Tarea para saber solicitudes vigentes) */}
              {onOpenSolicitudes && (
                <button
                  onClick={onOpenSolicitudes}
                  id="btn-header-alerta-solicitudes"
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md scale-100 hover:scale-105 active:scale-95 cursor-pointer border ${
                    solicitudesPendientes > 0
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 ring-2 ring-amber-400/40 animate-pulse'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                  title={
                    solicitudesPendientes > 0
                      ? `⚠️ Hay ${solicitudesPendientes} solicitud(es) vigente(s) pendiente(s) por revisar. Haz clic para abrir la Bandeja.`
                      : 'Bandeja de Solicitudes al día (0 solicitudes vigentes pendientes). Haz clic para abrir el historial.'
                  }
                >
                  <div className="relative">
                    <Inbox className={`w-4 h-4 ${solicitudesPendientes > 0 ? 'text-white' : 'text-slate-500'}`} />
                    {solicitudesPendientes > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                  <span>Bandeja de Solicitudes</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black flex items-center justify-center ${
                      solicitudesPendientes > 0
                        ? 'bg-white text-amber-700 shadow-2xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {solicitudesPendientes}
                  </span>
                </button>
              )}

              <button
                onClick={onOpenCreateTask}
                id="btn-header-nueva-tarea"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                title="Crear nueva tarea en la plataforma CCV"
              >
                <Plus className="w-4 h-4 stroke-[3] text-sky-400" />
                <span>Nueva Tarea</span>
              </button>
            </>
          ) : onOpenTaskRequest ? (
            <button
              onClick={onOpenTaskRequest}
              id="btn-header-solicitar-tarea"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg scale-100 hover:scale-105 active:scale-95"
              title="Solicitar nueva tarea o requerimiento al CCV"
            >
              <FilePlus className="w-4 h-4 stroke-[2.5] text-sky-400" />
              <span>Solicitar Tarea</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
