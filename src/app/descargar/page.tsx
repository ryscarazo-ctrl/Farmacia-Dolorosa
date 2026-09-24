'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Globe, 
  Monitor, 
  Apple, 
  Smartphone, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  X,
  FileCode,
  QrCode,
  FolderArchive
} from 'lucide-react';
import Link from 'next/link';

export default function DescargarPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'mac' | 'iphone' | 'android'>('windows');
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // FUNCIÓN DE 1 SOLO CLIC: DESCARGA INMEDIATA DEL SISTEMA
  const handleOneClickDownload = () => {
    setDownloadStarted(true);

    // 1. Iniciar la descarga directa del instalador de inmediato
    const link = document.createElement('a');
    link.href = '/Instalador_Farmacia_Espiritu_Santo.bat';
    link.download = 'Instalador_Farmacia_Espiritu_Santo.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Si el navegador soporta el diálogo de instalación PWA, también lo lanza
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
      } catch (e) {
        // Silencioso
      }
    }

    setTimeout(() => {
      setDownloadStarted(false);
    }, 4000);
  };

  const handlePlatformClick = (platform: 'windows' | 'mac' | 'iphone' | 'android') => {
    setSelectedPlatform(platform);
    if (platform === 'windows') {
      // En Windows descarga directamente con 1 solo clic
      handleOneClickDownload();
    } else if (platform === 'android') {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowInstructionsModal(true);
      }
    } else {
      setShowInstructionsModal(true);
    }
  };

  const getPlatformName = () => {
    switch (selectedPlatform) {
      case 'windows': return 'Windows';
      case 'mac': return 'MacBook';
      case 'iphone': return 'iPhone / iPad';
      case 'android': return 'Android';
      default: return 'tu equipo';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-emerald-900 relative">
      
      {/* GLOW DECORATIVO SUAVE DE FONDO */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />

      {/* CONTENEDOR PRINCIPAL MINIMALISTA AL CENTRO */}
      <div className="max-w-2xl w-full text-center flex flex-col items-center justify-center z-10 py-6">
        
        {/* LOGO EN EL PURO MEDIO EN GRANDE */}
        <div className="relative mb-5">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white p-2.5 shadow-2xl shadow-emerald-950/40 ring-4 ring-white/30 flex items-center justify-center overflow-hidden transition-transform hover:scale-105 duration-300">
            <img 
              src="/logo.jpg" 
              alt="Logo Farmacia Espíritu Santo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* NOMBRE DE LA FARMACIA */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">
          Farmacia Espíritu Santo
        </h1>
        <p className="text-emerald-100/90 text-sm sm:text-base font-medium mb-6">
          Sucursal 19 de Julio • Instalación Oficial del Sistema
        </p>

        {/* BOTÓN PRINCIPAL DE 1 SOLO CLIC */}
        <div className="w-full max-w-md mb-6">
          <button
            id="btn-descargar-1-clic"
            onClick={handleOneClickDownload}
            className="w-full py-4 sm:py-5 px-8 rounded-full bg-white hover:bg-emerald-50 text-emerald-900 font-black text-lg sm:text-xl shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group active:scale-95 ring-4 ring-white/50 hover:scale-102"
          >
            <Download className="w-6 h-6 text-emerald-700 group-hover:scale-120 group-hover:translate-y-0.5 transition-transform" />
            <span>DESCARGAR SISTEMA (1 Clic)</span>
          </button>

          {downloadStarted && (
            <p className="text-xs text-white bg-emerald-900/60 border border-emerald-400/40 py-1.5 px-4 rounded-full mt-2.5 inline-block animate-fade-in font-bold">
              ✓ ¡Descarga iniciada! Abre el archivo descargado para instalar.
            </p>
          )}
        </div>

        {/* SELECCIÓN RÁPIDA POR DISPOSITIVO CON 1 SOLO CLIC */}
        <div className="w-full mb-8">
          <p className="text-emerald-100 text-xs font-semibold tracking-wider uppercase mb-3 opacity-90">
            O elige tu dispositivo:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-xl mx-auto">
            
            {/* BOTÓN WINDOWS (DESCARGA INMEDIATA AL CLIC) */}
            <button
              id="btn-platform-windows"
              onClick={() => handlePlatformClick('windows')}
              className={`px-5 py-3 rounded-full border transition-all flex items-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm font-bold ${
                selectedPlatform === 'windows'
                  ? 'bg-white text-emerald-900 border-white shadow-xl scale-105 ring-4 ring-white/30'
                  : 'bg-white/15 hover:bg-white/25 border-white/20 text-white backdrop-blur-md'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Windows</span>
              {selectedPlatform === 'windows' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
            </button>

            {/* BOTÓN MACBOOK */}
            <button
              id="btn-platform-mac"
              onClick={() => handlePlatformClick('mac')}
              className={`px-5 py-3 rounded-full border transition-all flex items-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm font-bold ${
                selectedPlatform === 'mac'
                  ? 'bg-white text-emerald-900 border-white shadow-xl scale-105 ring-4 ring-white/30'
                  : 'bg-white/15 hover:bg-white/25 border-white/20 text-white backdrop-blur-md'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>MacBook</span>
              {selectedPlatform === 'mac' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
            </button>

            {/* BOTÓN IPHONE / IPAD */}
            <button
              id="btn-platform-iphone"
              onClick={() => handlePlatformClick('iphone')}
              className={`px-5 py-3 rounded-full border transition-all flex items-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm font-bold ${
                selectedPlatform === 'iphone'
                  ? 'bg-white text-emerald-900 border-white shadow-xl scale-105 ring-4 ring-white/30'
                  : 'bg-white/15 hover:bg-white/25 border-white/20 text-white backdrop-blur-md'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>iPhone / iPad</span>
              {selectedPlatform === 'iphone' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
            </button>

            {/* BOTÓN ANDROID */}
            <button
              id="btn-platform-android"
              onClick={() => handlePlatformClick('android')}
              className={`px-5 py-3 rounded-full border transition-all flex items-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm font-bold ${
                selectedPlatform === 'android'
                  ? 'bg-white text-emerald-900 border-white shadow-xl scale-105 ring-4 ring-white/30'
                  : 'bg-white/15 hover:bg-white/25 border-white/20 text-white backdrop-blur-md'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android</span>
              {selectedPlatform === 'android' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
            </button>

          </div>
        </div>

        {/* ACCESOS SECUNDARIOS: CÓDIGOS QR Y ENTRAR A LA WEB */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            id="btn-show-qr"
            onClick={() => setShowQRModal(true)}
            className="px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all inline-flex items-center gap-2 active:scale-95 shadow-sm cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-200" />
            <span>Ver Códigos QR</span>
          </button>

          <a
            href="/Farmacia_Espiritu_Santo_Sistema.zip"
            download
            className="px-6 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all inline-flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FolderArchive className="w-4 h-4 text-emerald-200" />
            <span>Descargar Paquete .zip</span>
          </a>

          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all inline-flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <Globe className="w-4 h-4 text-white" />
            <span>Entrar a la Web</span>
          </Link>
        </div>

        {/* PIE DE PÁGINA LIMPIO */}
        <div className="text-emerald-100/70 text-xs font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Funcionamiento Offline 100% • Sincronización Automática en la Nube</span>
        </div>

      </div>

      {/* MODAL CON LOS 2 CÓDIGOS QR */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full text-slate-900 shadow-2xl relative border border-emerald-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 leading-tight">
                  Códigos QR Oficiales
                </h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  Farmacia Espíritu Santo • Sucursal 19 de Julio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              {/* QR 1: QR DE DESCARGA */}
              <div className="bg-emerald-50/70 border-2 border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center justify-between text-center">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  App Oficial
                </span>
                <h4 className="font-extrabold text-sm text-emerald-950 leading-tight mb-2">
                  QR DE DESCARGA
                </h4>
                
                <div className="p-2 bg-white rounded-xl border border-emerald-200 shadow-inner mb-3">
                  <img 
                    src="/qr-descargar.png" 
                    alt="QR DE DESCARGA" 
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                </div>

                <p className="text-[11px] text-slate-600 mb-3 leading-snug">
                  Escanea para instalar en celular, tablet o computadora.
                </p>

                <a
                  href="/qr-descargar.png"
                  download="QR_DE_DESCARGA.png"
                  className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PNG</span>
                </a>
              </div>

              {/* QR 2: QR DE SISTEMA WEB */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between text-center">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  Acceso Rápido
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight mb-2">
                  QR DE SISTEMA WEB
                </h4>
                
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-inner mb-3">
                  <img 
                    src="/qr-web.png" 
                    alt="QR DE SISTEMA WEB" 
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                </div>

                <p className="text-[11px] text-slate-600 mb-3 leading-snug">
                  Escanea para entrar inmediatamente desde el navegador web.
                </p>

                <a
                  href="/qr-web.png"
                  download="QR_DE_SISTEMA_WEB.png"
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PNG</span>
                </a>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/qr"
                target="_blank"
                className="flex-1 py-2.5 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Ver Afiche Imprimible en Pantalla Completa</span>
              </Link>
              <button
                onClick={() => setShowQRModal(false)}
                className="py-2.5 px-6 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CON INSTRUCCIONES ESPECÍFICAS SEGÚN LA PLATAFORMA */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl relative border border-emerald-100">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                  Instalar en {getPlatformName()}
                </h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  Pasos sencillos para tener la App oficial
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-slate-700 space-y-3 mb-6">
              {selectedPlatform === 'windows' && (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Ejecuta el archivo <strong>Instalador_Farmacia_Espiritu_Santo.bat</strong> recién descargado.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>El instalador colocará automáticamente el programa con su icono en tu Escritorio.</span>
                  </div>
                </>
              )}

              {selectedPlatform === 'mac' && (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>En Safari, haz clic en el menú superior <strong>Archivo &rarr; Agregar al Dock</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Haz clic en el botón <strong>"Agregar"</strong>.</span>
                  </div>
                </>
              )}

              {selectedPlatform === 'iphone' && (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>En Safari, toca el botón de <strong>Compartir</strong> (cuadrado con flecha hacia arriba).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Selecciona <strong>"Agregar a pantalla de inicio"</strong>.</span>
                  </div>
                </>
              )}

              {selectedPlatform === 'android' && (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Toca los <strong>3 puntos (⋮)</strong> en la esquina superior de Chrome.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Toca <strong>"Instalar aplicación"</strong>.</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
