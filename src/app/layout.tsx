import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PharmacyProvider } from '../contexts/PharmacyContext';

export const metadata: Metadata = {
  title: 'Farmacia Espíritu Santo — Sistema Integral de Gestión',
  description: 'Sistema empresarial de administración de farmacias con control de lotes FEFO, POS, kardex y auditoría.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Espíritu Santo',
  },
  applicationName: 'Farmacia Espíritu Santo',
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#059669" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Manejo de errores globales y registro de Service Worker
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.indexOf('ChunkLoadError') !== -1 || e.message.indexOf('Loading chunk') !== -1)) {
                  window.location.reload();
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && (String(e.reason).indexOf('ChunkLoadError') !== -1 || String(e.reason).indexOf('Loading chunk') !== -1)) {
                  window.location.reload();
                }
              });

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js?v=27').then(function(reg) {
                    reg.update();
                  }).catch(function(err) {
                    console.log('SW registration note:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-slate-50 text-slate-800" suppressHydrationWarning>
        <PharmacyProvider>{children}</PharmacyProvider>
      </body>
    </html>
  );
}