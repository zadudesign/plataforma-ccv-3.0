'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  Edit, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Camera,
  Trash2,
  User,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { Usuario, Rol } from '@/types';

interface UserFormModalProps {
  usuarioEditar?: Usuario | null;
  roles: Rol[];
  onClose: () => void;
  onSave: (usuario: (Omit<Usuario, 'id'> & { password?: string }) | Partial<Usuario>) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  usuarioEditar,
  roles,
  onClose,
  onSave,
}) => {
  const [nombreCompleto, setNombreCompleto] = useState(usuarioEditar?.nombre_completo || '');
  const [email, setEmail] = useState(usuarioEditar?.email || '');
  const [rolId, setRolId] = useState(usuarioEditar?.rol_id || roles[0]?.id || '');
  const [telefono, setTelefono] = useState(usuarioEditar?.telefono || '');
  const [activo, setActivo] = useState(usuarioEditar?.activo !== false);
  const [avatarUrl, setAvatarUrl] = useState(usuarioEditar?.avatar_url || '');
  const [firmaDigital, setFirmaDigital] = useState(usuarioEditar?.firma_digital || '');
  const [isDragging, setIsDragging] = useState(false);
  
  // Campos de contraseña para la creación inicial
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen seleccionada supera el límite de 5MB.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      // Optimizar y redimensionar la imagen a max 400x400
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarUrl(compressedDataUrl);
        } else {
          setAvatarUrl(rawDataUrl);
        }
      };
      img.onerror = () => {
        setAvatarUrl(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto || !email || !rolId) return;

    if (!usuarioEditar) {
      if (!password) {
        setErrorMsg('Debes asignar una contraseña al nuevo usuario.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas ingresadas no coinciden.');
        return;
      }
    }

    onSave({
      nombre_completo: nombreCompleto,
      email,
      rol_id: rolId,
      telefono,
      activo,
      avatar_url: avatarUrl || undefined,
      firma_digital: firmaDigital || undefined,
      ...(usuarioEditar ? {} : { password }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-cream-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center shadow-sm">
            {usuarioEditar ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-charcoal-900">
              {usuarioEditar ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario CCV'}
            </h3>
            <p className="text-xs text-charcoal-500">
              {usuarioEditar
                ? 'Actualiza los datos, foto de perfil, rol o estado del integrante.'
                : 'Crea una cuenta institucional, asigna su foto y rol jerárquico.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-coral-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sección de Foto de Perfil / Avatar */}
          <div className="p-4 bg-cream-50/80 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row items-center gap-4">
            {/* Input oculto de archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Avatar Preview con zona de drop */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-20 h-20 rounded-full cursor-pointer group shrink-0 border-2 transition-all overflow-hidden shadow-md flex items-center justify-center bg-white ${
                isDragging ? 'border-sage-600 ring-4 ring-sage-100 scale-105' : 'border-stone-200 hover:border-sage-500'
              }`}
              title="Haz clic o arrastra una imagen para cambiar la foto"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={nombreCompleto || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sage-100 to-sage-200 text-sage-700 flex flex-col items-center justify-center">
                  <User className="w-8 h-8 opacity-80" />
                </div>
              )}

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-charcoal-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-0.5">
                <Camera className="w-5 h-5 text-white" />
                <span>Cambiar</span>
              </div>
            </div>

            {/* Controles de Foto */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Foto de Perfil del Usuario
              </label>
              <p className="text-[11px] text-charcoal-500 leading-tight">
                Sube una foto personalizada para reemplazar el avatar por defecto.
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-sage-50 text-sage-800 border border-stone-200 hover:border-sage-300 text-xs font-bold rounded-full transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-sage-600" />
                  <span>{avatarUrl ? 'Cambiar Foto' : 'Subir Foto'}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-1.5 bg-white hover:bg-coral-50 text-coral-700 border border-stone-200 hover:border-coral-200 text-xs font-bold rounded-full transition-all shadow-xs flex items-center gap-1"
                    title="Quitar foto y usar avatar inicial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar</span>
                  </button>
                )}
              </div>
              <span className="block text-[10px] text-charcoal-400 font-mono">
                Formatos: JPG, PNG o WebP (Máx. 5MB)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={e => setNombreCompleto(e.target.value)}
              placeholder="Ej: Dra. María López"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Correo Electrónico Institucional *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="maria.lopez@universidad.edu.co"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                required
              />
            </div>
          </div>

          {!usuarioEditar && (
            <>
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Contraseña Inicial *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-10 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-mono font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-800"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-mono font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Rol de Plataforma & Área *
            </label>
            <select
              value={rolId}
              onChange={e => setRolId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nombre} (Área: {r.area_nombre})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              <input
                type="text"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+57 300 123 4567"
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-stone-200 rounded-2xl text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          </div>

          {/* Firma Digital Status en Perfil */}
          <div className="p-3 bg-cream-50 rounded-2xl border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Firma Digital Oficial
              </span>
              <span className="text-[10px] text-charcoal-500">
                {firmaDigital ? 'Firma registrada y lista para documentos.' : 'Sin firma registrada.'}
              </span>
            </div>
            {firmaDigital ? (
              <div className="flex items-center gap-2">
                <img
                  src={firmaDigital}
                  alt="Firma Digital"
                  className="h-7 max-w-24 object-contain border border-stone-200 bg-white p-1 rounded shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setFirmaDigital('')}
                  className="text-[10px] text-coral-600 hover:text-coral-800 font-bold underline"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-bold border border-amber-200">
                Pendiente de registro
              </span>
            )}
          </div>

          {usuarioEditar && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="activoCheck"
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
                className="w-4 h-4 text-sage-600 rounded focus:ring-sage-500 border-stone-300"
              />
              <label htmlFor="activoCheck" className="text-xs font-bold text-charcoal-800">
                Usuario Activo en el Sistema
              </label>
            </div>
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
              <CheckCircle2 className="w-4 h-4" /> Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
