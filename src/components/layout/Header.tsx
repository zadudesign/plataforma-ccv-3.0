'use client';

import { Search, Plus, Shield, Sparkles, FileSignature, FilePlus, Inbox } from 'lucide-react';
import { Usuario } from '@/types';
import { useAuth } from '@/context/AuthContext';

import { HeaderTimerWidget } from './HeaderTimerWidget';

interface HeaderProps {
  usuarioActual?: Usuario;
  onOpenCreateTask: () => void;
  onOpenTaskRequest?: () => void;
  onOpenSolicitudes?: () => void;
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
  busqueda,
  setBusqueda,
  onOpenSignatureModal,
  onSelectTaskById,
  onAddHours,
}) => {
  const { usuarioActual: contextUsuario, nivelArea, setIsDevSimulatorOpen, isRealAdmin, isAdmin, solicitudesTareas } = useAuth();
  const usuarioActual = propsUsuario || contextUsuario;

  const solicitudesPendientes = solicitudesTareas?.filter(s => s.estado === 'Pendiente').length || 0;

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

        {/* Action Button: Nueva Tarea (Exclusivo Admin) con Alerta de Solicitudes vs Solicitar Tarea */}
        {isAdmin() ? (
          <div className="flex items-center gap-2">
            {/* Alerta de Bandeja de Solicitudes si hay solicitudes pendientes recibidas */}
            {solicitudesPendientes > 0 && onOpenSolicitudes && (
              <button
                onClick={onOpenSolicitudes}
                id="btn-header-alerta-solicitudes"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all duration-200 shadow-md hover:shadow-lg scale-100 hover:scale-105 active:scale-95 animate-pulse cursor-pointer"
                title={`${solicitudesPendientes} solicitud(es) nueva(s) en la Bandeja. Haz clic para revisar.`}
              >
                <Inbox className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Solicitudes</span>
                <span className="w-5 h-5 rounded-full bg-white text-amber-700 text-[11px] font-black flex items-center justify-center shadow-2xs">
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
          </div>
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
    </header>
  );
};
