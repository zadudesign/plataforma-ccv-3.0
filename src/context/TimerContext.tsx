'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TareaCCV, Usuario, EstadoTarea } from '@/types';

export interface ActiveTaskTimer {
  tareaId: string;
  tareaTitulo: string;
  tipoTarea: string;
  proyectoNombre?: string;
  startTime: number; // Timestamp en milisegundos (Date.now())
  esResponsableSecundario: boolean;
  responsableId?: string;
  responsableNombre?: string;
}

interface TimerContextType {
  activeTimer: ActiveTaskTimer | null;
  secondsElapsed: number;
  formattedTime: string; // Formato H:MM:SS (ej. "0:00:14")
  startTimer: (
    tarea: TareaCCV, 
    esResponsableSecundario: boolean, 
    usuarioActual: Usuario | null,
    onAutoUpdateStatus?: (tareaId: string, nuevoEstado: EstadoTarea) => void
  ) => void;
  stopTimer: (
    onAddHours: (tareaId: string, horas: number, esResponsableSecundario?: boolean, notas?: string) => Promise<void> | void
  ) => Promise<{ segundos: number; horas: number } | null>;
  cancelTimer: () => void;
  isTimerForTask: (tareaId: string) => boolean;
}

const TIMER_STORAGE_KEY = 'ccv_active_task_timer';

const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Helper para dar formato H:MM:SS (o M:SS si es menor a 10 minutos, pero H:MM:SS para máxima claridad)
export function formatTimerSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState<ActiveTaskTimer | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // 1. Cargar cronómetro persistido en localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TIMER_STORAGE_KEY);
      if (stored) {
        const parsed: ActiveTaskTimer = JSON.parse(stored);
        if (parsed && parsed.tareaId && parsed.startTime) {
          const now = Date.now();
          const diffSeconds = Math.max(0, Math.floor((now - parsed.startTime) / 1000));
          setActiveTimer(parsed);
          setSecondsElapsed(diffSeconds);
        }
      }
    } catch (err) {
      console.error('Error recuperando cronómetro de localStorage:', err);
    }
  }, []);

  // 2. Intervalo de actualización cada segundo cuando hay un cronómetro activo
  useEffect(() => {
    if (!activeTimer) {
      setSecondsElapsed(0);
      return;
    }

    // Calcular segundos transcurridos exactos respecto a la marca de tiempo de inicio
    const updateElapsed = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - activeTimer.startTime) / 1000));
      setSecondsElapsed(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  // 3. Iniciar cronómetro
  const startTimer = useCallback((
    tarea: TareaCCV, 
    esResponsableSecundario: boolean, 
    usuarioActual: Usuario | null,
    onAutoUpdateStatus?: (tareaId: string, nuevoEstado: EstadoTarea) => void
  ) => {
    const newTimer: ActiveTaskTimer = {
      tareaId: tarea.id,
      tareaTitulo: tarea.titulo,
      tipoTarea: tarea.tipo_tarea,
      proyectoNombre: tarea.proyecto_nombre || tarea.curso_nombre || 'Proyecto CCV',
      startTime: Date.now(),
      esResponsableSecundario,
      responsableId: esResponsableSecundario ? tarea.responsable_secundario_id : (tarea.responsable_id || usuarioActual?.id),
      responsableNombre: esResponsableSecundario ? tarea.responsable_secundario_nombre : (tarea.responsable_nombre || usuarioActual?.nombre_completo)
    };

    setActiveTimer(newTimer);
    setSecondsElapsed(0);

    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(newTimer));
    } catch (err) {
      console.error('Error guardando cronómetro en localStorage:', err);
    }

    // Transición automática a "En Proceso" si la tarea está en estado "Pendiente"
    if (tarea.estado === 'Pendiente' && onAutoUpdateStatus) {
      onAutoUpdateStatus(tarea.id, 'En Proceso');
    }
  }, []);

  // 4. Detener cronómetro y sumar horas automáticamente
  const stopTimer = useCallback(async (
    onAddHours: (tareaId: string, horas: number, esResponsableSecundario?: boolean, notas?: string) => Promise<void> | void
  ) => {
    if (!activeTimer) return null;

    const now = Date.now();
    const totalSecs = Math.max(1, Math.floor((now - activeTimer.startTime) / 1000));
    
    // Convertir segundos a horas con 2 decimales (mínimo 0.02 horas ~ 1 minuto para que siempre se compute)
    const horasCalculadas = Math.max(0.02, Number((totalSecs / 3600).toFixed(2)));
    const tiempoTexto = formatTimerSeconds(totalSecs);
    const notaAvance = `Sesión de cronómetro: ${tiempoTexto} (${horasCalculadas} hrs)`;

    // Guardar en la tarea y base de datos
    await onAddHours(
      activeTimer.tareaId, 
      horasCalculadas, 
      activeTimer.esResponsableSecundario, 
      notaAvance
    );

    // Limpiar estado y almacenamiento
    setActiveTimer(null);
    setSecondsElapsed(0);
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (err) {
      console.error('Error eliminando cronómetro de localStorage:', err);
    }

    return { segundos: totalSecs, horas: horasCalculadas };
  }, [activeTimer]);

  // 5. Cancelar cronómetro sin registrar horas
  const cancelTimer = useCallback(() => {
    setActiveTimer(null);
    setSecondsElapsed(0);
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (err) {
      console.error('Error cancelando cronómetro en localStorage:', err);
    }
  }, []);

  // 6. Verificar si el cronómetro activo pertenece a una tarea específica
  const isTimerForTask = useCallback((tareaId: string) => {
    return activeTimer?.tareaId === tareaId;
  }, [activeTimer]);

  const formattedTime = useMemo(() => {
    return formatTimerSeconds(secondsElapsed);
  }, [secondsElapsed]);

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        secondsElapsed,
        formattedTime,
        startTimer,
        stopTimer,
        cancelTimer,
        isTimerForTask,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTaskTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTaskTimer debe ser utilizado dentro de un TimerProvider');
  }
  return context;
};
