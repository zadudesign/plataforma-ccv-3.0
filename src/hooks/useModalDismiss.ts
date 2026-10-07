import { useEffect } from 'react';

interface UseModalDismissOptions {
  isOpen?: boolean;
  onClose: () => void;
  disabled?: boolean;
}

/**
 * Hook reutilizable para habilitar el cierre de modales con la tecla 'Escape'
 * y asegurar una experiencia de usuario consistente en toda la plataforma.
 */
export function useModalDismiss({
  isOpen = true,
  onClose,
  disabled = false,
}: UseModalDismissOptions) {
  useEffect(() => {
    if (!isOpen || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, disabled]);
}
