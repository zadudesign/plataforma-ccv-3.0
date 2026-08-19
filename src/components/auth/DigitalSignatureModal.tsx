'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSignature, 
  PenTool, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  Trash2,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DigitalSignatureModalProps {
  onClose: () => void;
  isMandatory?: boolean;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({ 
  onClose,
  isMandatory = false
}) => {
  const { usuarioActual, actualizarUsuario } = useAuth();
  const [tab, setTab] = useState<'draw' | 'upload'>('draw');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedFirmaUrl, setUploadedFirmaUrl] = useState<string | null>(null);
  
  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Inicializar Canvas
  useEffect(() => {
    if (tab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a'; // Dark Charcoal
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [tab]);

  // Funciones para Dibujar en Canvas (Mouse & Touch)
  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = x - rect.left;
    const clientY = y - rect.top;

    ctx.beginPath();
    ctx.moveTo(clientX, clientY);
    isDrawingRef.current = true;
    setHasDrawn(true);
    setErrorMsg(null);
  };

  const draw = (x: number, y: number) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = x - rect.left;
    const clientY = y - rect.top;

    ctx.lineTo(clientX, clientY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawing(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    draw(e.clientX, e.clientY);
  };
  const handleMouseUp = () => stopDrawing();
  const handleMouseLeave = () => stopDrawing();

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      startDrawing(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      draw(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchEnd = () => stopDrawing();

  // Limpiar Canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    setErrorMsg(null);
  };

  // Procesar Archivo Adjunto de Firma
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Selecciona una imagen válida de firma (PNG, JPG, WebP o SVG).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('El archivo no debe superar 3MB.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFirmaUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Guardar Firma Digital
  const handleSaveSignature = async () => {
    if (!usuarioActual) return;

    let finalDataUrl = '';

    if (tab === 'draw') {
      if (!hasDrawn || !canvasRef.current) {
        setErrorMsg('Por favor realiza tu firma trazándola en el recuadro antes de guardar.');
        return;
      }
      finalDataUrl = canvasRef.current.toDataURL('image/png');
    } else {
      if (!uploadedFirmaUrl) {
        setErrorMsg('Por favor adjunta una imagen con tu firma digital.');
        return;
      }
      finalDataUrl = uploadedFirmaUrl;
    }

    setIsSaving(true);
    try {
      await actualizarUsuario(usuarioActual.id, {
        firma_digital: finalDataUrl
      });
      onClose();
    } catch (err) {
      setErrorMsg('Error guardando la firma digital en Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 relative">
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
              Registro de Firma Digital
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                OFICIAL
              </span>
            </h3>
            <p className="text-xs text-charcoal-500">
              Registra tu firma manuscrita para la aprobación y validación de entregables en la plataforma.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-coral-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pestañas de Selección de Modo */}
        <div className="flex items-center gap-2 mb-4 bg-cream-50 p-1 rounded-2xl border border-stone-200/80">
          <button
            type="button"
            onClick={() => setTab('draw')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'draw'
                ? 'bg-white text-sage-800 shadow-sm border border-stone-200'
                : 'text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Dibujar Firma</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'upload'
                ? 'bg-white text-sage-800 shadow-sm border border-stone-200'
                : 'text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Adjuntar Imagen</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        {tab === 'draw' ? (
          <div className="space-y-3">
            <div className="relative border-2 border-dashed border-stone-300 hover:border-sage-400 rounded-2xl bg-white overflow-hidden shadow-inner group">
              <canvas
                ref={canvasRef}
                width={440}
                height={170}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full h-44 cursor-crosshair touch-none bg-white"
              />

              {/* Guía visual de firma */}
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-stone-300">
                  <PenTool className="w-8 h-8 mb-1 opacity-40 animate-bounce" />
                  <span className="text-xs font-bold tracking-wider opacity-60 uppercase">
                    Firma aquí usando el mouse o pantalla táctil
                  </span>
                </div>
              )}

              {/* Línea base sutil para la firma */}
              <div className="absolute left-8 right-8 bottom-8 border-b border-stone-200 pointer-events-none" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-charcoal-400 font-mono">
                Trazo suavizado de alta resolución
              </span>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="px-3 py-1.5 bg-stone-100 hover:bg-coral-50 text-charcoal-600 hover:text-coral-700 rounded-full text-xs font-bold transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar Trazo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-sage-500 rounded-2xl p-6 text-center cursor-pointer bg-cream-50/60 hover:bg-cream-100/80 transition-all min-h-[170px] flex flex-col items-center justify-center gap-2"
            >
              {uploadedFirmaUrl ? (
                <div className="relative group max-w-full">
                  <img
                    src={uploadedFirmaUrl}
                    alt="Firma adjunta"
                    className="max-h-28 object-contain mx-auto rounded border border-stone-200 p-2 bg-white shadow-xs"
                  />
                  <div className="mt-2 text-xs font-bold text-sage-700 flex items-center justify-center gap-1">
                    <FileCheck2 className="w-4 h-4 text-sage-600" />
                    <span>Imagen cargada correctamente. Haz clic para reemplazar.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal-800">
                      Haz clic para seleccionar la imagen de tu firma
                    </p>
                    <p className="text-[10px] text-charcoal-400 font-mono mt-0.5">
                      Soporta PNG transparente, JPG o SVG (Máx. 3MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer Acciones */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          {!isMandatory ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-bold rounded-full transition-all"
            >
              Recordar más tarde
            </button>
          ) : (
            <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Requerido para continuar
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveSignature}
            disabled={isSaving}
            className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 ml-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Firma Digital'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
