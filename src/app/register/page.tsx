'use client';

import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { usuarioActual } = useAuth();
  const router = useRouter();

  // Si el usuario ya está autenticado, redirigir al Dashboard principal
  React.useEffect(() => {
    if (usuarioActual) {
      router.push('/');
    }
  }, [usuarioActual, router]);

  return (
    <RegisterForm
      onSuccess={() => {
        router.push('/');
      }}
      onGoToLogin={() => {
        router.push('/');
      }}
    />
  );
}
