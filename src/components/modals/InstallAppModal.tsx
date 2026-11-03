'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Monitor,
  Apple,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  QrCode,
  Share,
  PlusSquare,
  HelpCircle,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onInstalled?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}) => {
  const [activeTab, setActiveTab] = useState<'windows' | 'android' | 'ios'>('windows');
  const [isPromptTriggered, setIsPromptTriggered] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setActiveTab('ios');
      } else if (/android/.test(userAgent)) {
        setActiveTab('android');
      } else {
        setActiveTab('windows');
      }

      // Comprobar si ya se ejecuta en modo standalone (App instalada)
      const isApp =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isApp);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsPromptTriggered(true);
          if (onInstalled) onInstalled();
        }
      } catch (e) {
        console.error('Error al invocar instalación:', e);
      }
    } else {
      // Si el navegador no disparó el evento (ej. ya instalado o en navegador que requiere clic manual)
      if (activeTab === 'windows') {
        // Ofrecer descargar el lanzador de escritorio .bat
        const link = document.createElement('a');
        link.href = '/Instalador_Farmacia_Espiritu_Santo.bat';
        link.download = 'Instalador_Farmacia_Espiritu_Santo.bat';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg border-2 border-emerald-400 flex items-center justify-center shrink-0">
              <img
                src="/icon-192.png"
                alt="Farmacia Espíritu Santo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Aplicación Oficial Instalable</span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">
                Farmacia Espíritu Santo
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                Instala el sistema como App en tu Computadora o Celular
              </p>
            </div>
          </div>
        </div>

        {/* Pestañas de Plataforma */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex-1 py-2.5 px-3 rounded-t-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'windows'
                ? 'bg-white text-emerald-800 border-t-2 border-x border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-700" />
            <span>Windows PC</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 px-3 rounded-t-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white text-emerald-800 border-t-2 border-x border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 px-3 rounded-t-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white text-emerald-800 border-t-2 border-x border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-700" />
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800 text-xs">
          {isStandalone && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-extrabold text-xs">¡Ya estás usando la App instalada!</p>
                <p className="text-[11px] text-emerald-700">El sistema se ejecuta en su propia ventana nativa independiente.</p>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">1</span>
                  <span>Opción A: Instalación Directa desde el Navegador (Recomendada)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px] pl-8">
                  En <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong>, haz clic en el botón de abajo o busca el ícono de instalar <strong className="text-emerald-800">(⊕ Instalar aplicación)</strong> en la barra superior de direcciones (junto a la estrella de favoritos).
                </p>
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>¡Instalar Ahora en Esta Computadora!</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-emerald-100/60 rounded-xl text-emerald-900 text-[11px] font-semibold border border-emerald-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Presiona los 3 puntos (⋮) en tu navegador ➔ "Instalar Farmacia Espíritu Santo" o "Aplicaciones ➔ Instalar este sitio como aplicación".</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black">2</span>
                  <span>Opción B: Crear Acceso Directo de Escritorio Automático</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px] pl-8">
                  Si prefieres un acceso con ícono directo en el Escritorio de Windows que abra el sistema a pantalla completa sin barras:
                </p>
                <a
                  href="/Instalador_Farmacia_Espiritu_Santo.bat"
                  download="Instalador_Farmacia_Espiritu_Santo.bat"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm text-center"
                >
                  <Download className="w-4 h-4 text-slate-300" />
                  <span>Descargar Instalador de Escritorio (.bat)</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Cómo instalar en Celular o Tablet Android:</span>
                </h4>

                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>¡Instalar Aplicación en Android!</span>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                      <p className="text-slate-700 text-xs">
                        Abre <strong>Google Chrome</strong> en tu teléfono y visita el sistema.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                      <p className="text-slate-700 text-xs">
                        Toca los <strong>3 puntos verticales (⋮)</strong> en la esquina superior derecha del navegador.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                      <p className="text-slate-700 text-xs">
                        Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Se colocará el ícono oficial en tu pantalla como cualquier App de Google Play!</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                  <Apple className="w-4 h-4 text-slate-800" />
                  <span>Cómo instalar en iPhone o iPad (Safari):</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <Share className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-xs">Paso 1: Botón Compartir</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        En la barra inferior de <strong>Safari</strong>, toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                      <PlusSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-xs">Paso 2: Agregar a Inicio</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Desplaza hacia abajo en las opciones y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-xs">Paso 3: Confirmar</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Toca <strong>"Agregar"</strong> en la esquina superior derecha. ¡Listo, tendrás la App con el ícono de la farmacia!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Código QR para instalar en otro dispositivo */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/qr-descargar.png"
                alt="QR Descarga"
                className="w-12 h-12 rounded-lg bg-white p-1 border border-emerald-300 shrink-0"
              />
              <div>
                <p className="font-extrabold text-xs text-emerald-950">
                  ¿Quieres instalarla en otro teléfono o tablet?
                </p>
                <p className="text-[10px] text-emerald-700">
                  Escanea este código QR con la cámara de tu celular.
                </p>
              </div>
            </div>
            <a
              href="/descargar"
              target="_blank"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shrink-0 transition-colors"
            >
              Ver QR Grande
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Funciona sin conexión (Offline) & en Vivo</span>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};