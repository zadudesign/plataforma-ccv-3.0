'use client';

import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  // El registro de usuarios está habilitado exclusivamente para el Administrador
  React.useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
