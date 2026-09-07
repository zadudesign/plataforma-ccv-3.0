'use client';

import React, { useState } from 'react';
import { HomeNavbar } from './HomeNavbar';
import { HomeHero } from './HomeHero';
import { HomeFeatures } from './HomeFeatures';
import { HomeFooter } from './HomeFooter';
import { LoginModal } from '@/components/auth/LoginModal';
import { TaskRequestModal } from './TaskRequestModal';

export const LandingHome: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTaskRequestModalOpen, setIsTaskRequestModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slatebg flex flex-col font-sans selection:bg-primary-600 selection:text-white">
      {/* Top Navigation Bar with the 'Acceder' and 'Solicitar Tarea' Buttons */}
      <HomeNavbar 
        onOpenLogin={() => setIsLoginModalOpen(true)} 
        onOpenTaskRequest={() => setIsTaskRequestModalOpen(true)}
      />

      {/* Main Home Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HomeHero 
          onOpenLogin={() => setIsLoginModalOpen(true)} 
          onOpenTaskRequest={() => setIsTaskRequestModalOpen(true)}
        />

        {/* Core Features & Modules */}
        <HomeFeatures onOpenLogin={() => setIsLoginModalOpen(true)} />
      </main>

      {/* Institutional Footer */}
      <HomeFooter 
        onOpenLogin={() => setIsLoginModalOpen(true)} 
        onOpenTaskRequest={() => setIsTaskRequestModalOpen(true)}
      />

      {/* Auth Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Task Request Modal (Public) */}
      <TaskRequestModal
        isOpen={isTaskRequestModalOpen}
        onClose={() => setIsTaskRequestModalOpen(false)}
      />
    </div>
  );
};

