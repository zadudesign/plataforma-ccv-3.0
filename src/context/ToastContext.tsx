'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ShowToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ShowToastOptions) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismissToast = useCallback((id: string) => {
    // Limpiar timer si existe
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id)!);
      timersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(({
    type = 'info',
    title,
    message,
    duration = 4200
  }: ShowToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Títulos predeterminados elegantes si no se especifica uno
    const defaultTitles: Record<ToastType, string> = {
      success: '¡Acción Exitosa!',
      error: 'Error en la Operación',
      warning: 'Atención Requerida',
      info: 'Notificación del Sistema'
    };

    const newToast: ToastItem = {
      id,
      type,
      title: title || defaultTitles[type],
      message,
      duration
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Máximo 5 toasts visibles

    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissToast]);

  const success = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'success', message, title, duration });
  }, [showToast]);

  const error = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'error', message, title, duration: duration || 5000 });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'warning', message, title, duration: duration || 4800 });
  }, [showToast]);

  const info = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'info', message, title, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, dismissToast }}>
      {children}

      {/* Contenedor Flotante de Toasts renderizado en Portal para sobreponerse a cualquier modal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div 
          aria-live="polite"
          className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[99999] flex flex-col items-end gap-2.5 w-full max-w-[340px] sm:max-w-[380px] pointer-events-none px-2 sm:px-0"
          style={{ zIndex: 99999 }}
        >
          {toasts.map(toast => {
            const config = {
              success: {
                border: 'border-emerald-300/90',
                bgIcon: 'bg-emerald-500/15 text-emerald-600',
                badgeBg: 'bg-emerald-100 text-emerald-800',
                barBg: 'bg-emerald-500',
                Icon: CheckCircle2,
              },
              error: {
                border: 'border-rose-300/90',
                bgIcon: 'bg-rose-500/15 text-rose-600',
                badgeBg: 'bg-rose-100 text-rose-800',
                barBg: 'bg-rose-500',
                Icon: AlertCircle,
              },
              warning: {
                border: 'border-amber-300/90',
                bgIcon: 'bg-amber-500/15 text-amber-600',
                badgeBg: 'bg-amber-100 text-amber-800',
                barBg: 'bg-amber-500',
                Icon: AlertTriangle,
              },
              info: {
                border: 'border-sky-300/90',
                bgIcon: 'bg-sky-500/15 text-sky-600',
                badgeBg: 'bg-sky-100 text-sky-800',
                barBg: 'bg-sky-500',
                Icon: Info,
              },
            }[toast.type];

            const { border, bgIcon, barBg, Icon } = config;

            return (
              <div
                key={toast.id}
                role="alert"
                className={`w-full pointer-events-auto relative overflow-hidden bg-white/95 backdrop-blur-md border ${border} rounded-2xl shadow-xl transition-all duration-300 animate-slideInRight hover:shadow-2xl flex flex-col`}
              >
                <div className="p-3.5 sm:p-4 flex items-start gap-3">
                  {/* Icono temático */}
                  <div className={`p-2 rounded-xl shrink-0 ${bgIcon} shadow-2xs mt-0.5`}>
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  {/* Contenido textual */}
                  <div className="flex-1 min-w-0 pr-1">
                    {toast.title && (
                      <h5 className="text-xs font-black text-slate-900 tracking-tight leading-snug">
                        {toast.title}
                      </h5>
                    )}
                    <p className="text-[12px] font-medium text-slate-600 mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                      {toast.message}
                    </p>
                  </div>

                  {/* Botón de descarte manual */}
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
                    title="Cerrar notificación"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Barra de progreso de auto-cierre */}
                {toast.duration && toast.duration > 0 && (
                  <div className="w-full bg-slate-100 h-1 overflow-hidden">
                    <div 
                      className={`h-full ${barBg} opacity-80 animate-toastProgress`} 
                      style={{ animationDuration: `${toast.duration}ms` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
}
