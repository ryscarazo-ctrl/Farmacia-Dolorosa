import type { Metadata } from 'next';
import './globals.css';
import { PharmacyProvider } from '../contexts/PharmacyContext';

export const metadata: Metadata = {
  title: 'Farmacia Espíritu Santo — Sistema Integral de Gestión',
  description: 'Sistema empresarial de administración de farmacias con control de lotes FEFO, POS, kardex y auditoría.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-50 text-slate-800">
        <PharmacyProvider>{children}</PharmacyProvider>
      </body>
    </html>
  );
}
