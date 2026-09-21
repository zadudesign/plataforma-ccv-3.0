import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Prisma LAB - Ecosistema Integral de Gestión de Flujos de Trabajo y Operaciones',
  description: 'Sistema integral full-stack para la gestión, control, producción y supervisión de cursos virtuales y diseño instruccional del Centro de Educación Virtual.',
  icons: {
    icon: '/isotipo.svg',
    shortcut: '/isotipo.svg',
    apple: '/isotipo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

