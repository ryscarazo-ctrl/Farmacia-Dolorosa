'use client';

import React from 'react';
import Link from 'next/link';
import { Download, Globe, Printer, ArrowLeft, Smartphone, CheckCircle2 } from 'lucide-react';

export default function QRPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-8 flex flex-col items-center justify-center print:bg-white print:text-slate-900 print:p-0">
      
      {/* BARRA SUPERIOR (OCULTA AL IMPRIMIR) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 print:hidden">
        <Link
          href="/descargar"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Instalador</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-emerald-900 hover:bg-emerald-50 text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-emerald-700" />
          <span>Imprimir Afiche para la Sucursal</span>
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL IMPRIMIBLE */}
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl print:shadow-none print:border-none print:bg-white print:p-6 text-center">
        
        {/* LOGO Y ENCABEZADO */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1.5 shadow-xl ring-4 ring-white/30 flex items-center justify-center overflow-hidden mb-3 print:ring-emerald-700">
            <img 
              src="/logo.jpg" 
              alt="Logo Farmacia Espíritu Santo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white print:text-emerald-900 tracking-tight">
            Farmacia Espíritu Santo
          </h1>
          <p className="text-emerald-100 print:text-slate-600 text-xs sm:text-sm font-semibold mt-1">
            Sucursal 19 de Julio • Escanea con tu teléfono celular
          </p>
        </div>

        {/* TARJETAS CON LOS DOS CÓDIGOS QR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          
          {/* QR 1: DESCARGAR FARMACIA ESPIRITU SANTO */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xl flex flex-col items-center justify-between border-2 border-emerald-500/30 print:border-2 print:border-emerald-700">
            <div className="w-full text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2">
                Opción Recomendada
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-900 leading-tight">
                QR DE DESCARGA
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Instala la App Oficial en Windows, Mac, iPhone o Android
              </p>
            </div>

            {/* IMAGEN DEL CÓDIGO QR */}
            <div className="p-2 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-inner mb-5">
              <img 
                src="/qr-descargar.png" 
                alt="QR DE DESCARGA"
                className="w-56 h-auto sm:w-64 object-contain rounded-xl shadow-sm"
              />
            </div>

            <div className="w-full space-y-2.5">
              <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Funciona 100% Sin Internet (Offline)</span>
              </div>

              <a
                href="/qr-descargar.png"
                download="QR_DE_DESCARGA.png"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 print:hidden cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Imagen (PNG)</span>
              </a>
            </div>
          </div>

          {/* QR 2: QR DE SISTEMA WEB */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xl flex flex-col items-center justify-between border-2 border-slate-200 print:border-2 print:border-slate-400">
            <div className="w-full text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider mb-2">
                Acceso Inmediato
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                QR DE SISTEMA WEB
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Entra directamente al sistema desde cualquier navegador
              </p>
            </div>

            {/* IMAGEN DEL CÓDIGO QR */}
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner mb-5">
              <img 
                src="/qr-web.png" 
                alt="QR DE SISTEMA WEB"
                className="w-56 h-auto sm:w-64 object-contain rounded-xl shadow-sm"
              />
            </div>

            <div className="w-full space-y-2.5">
              <div className="text-[11px] text-slate-600 font-bold flex items-center justify-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Acceso directo sin instalar nada</span>
              </div>

              <a
                href="/qr-web.png"
                download="QR_Web_Farmacia_Espiritu_Santo.png"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 print:hidden cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Imagen QR (PNG)</span>
              </a>
            </div>
          </div>

        </div>

        {/* PIE DE PÁGINA */}
        <div className="mt-8 pt-6 border-t border-white/20 print:border-slate-200 text-emerald-100 print:text-slate-500 text-xs">
          <span>Sistema Integral Farmacia Espíritu Santo • Sucursal 19 de Julio • Desarrollado para uso oficial</span>
        </div>

      </div>

    </div>
  );
}
