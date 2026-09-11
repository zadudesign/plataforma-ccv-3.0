'use client';

import React, { useState } from 'react';
import { HomeNavbar } from './HomeNavbar';
import { HomeHero } from './HomeHero';
import { HomeStats } from './HomeStats';
import { HomeAreas } from './HomeAreas';
import { HomePillars } from './HomePillars';
import { HomeFooter } from './HomeFooter';
import { LoginModal } from '@/components/auth/LoginModal';

export const LandingHome: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      {/* SECCIÓN 1: Header / Navbar Fija */}
      <HomeNavbar 
        onOpenLogin={() => setIsLoginModalOpen(true)} 
      />

      {/* Contenido Principal Modular */}
      <main className="flex-1">
        {/* SECCIÓN 1: Hero Section & Quiénes Somos (PRISMA & LAB) */}
        <HomeHero 
          onOpenLogin={() => setIsLoginModalOpen(true)} 
        />

        {/* SECCIÓN 2: Estadísticas en Tiempo Real (Contadores Animados) */}
        <HomeStats />

        {/* SECCIÓN 3: Equipo de Trabajo (Nuestras 5 Áreas Operativas) */}
        <HomeAreas />

        {/* SECCIÓN 4: Los Cuatro Pilares de PrismaLab */}
        <HomePillars 
          onOpenLogin={() => setIsLoginModalOpen(true)} 
        />
      </main>

      {/* SECCIÓN 5: Footer Institucional */}
      <HomeFooter 
        onOpenLogin={() => setIsLoginModalOpen(true)} 
      />

      {/* Modal de Autenticación RLS */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};
