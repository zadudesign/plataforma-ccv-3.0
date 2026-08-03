import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Plataforma CCV 3.0 — Ecosistema de Cursos Virtuales y Educación Continua',
  description: 'Sistema integral full-stack para la gestión, control, producción y supervisión de cursos virtuales y diseño instruccional del Centro de Educación Virtual.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-300 text-charcoal-900 min-h-screen antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

