'use client';

import React, { useState } from 'react';
import {
  Pill,
  Droplets,
  Syringe,
  Bandage,
} from 'lucide-react';

interface ProductLogoProps {
  name: string;
  laboratoryName?: string;
  presentation?: string;
  categoryName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

interface BrandDefinition {
  label: string;
  logoSrc: string;
  badgeColor: string;
  bgGradient: string;
  borderColor: string;
  isDarkLogo?: boolean;
}

export const ProductLogo: React.FC<ProductLogoProps> = ({
  name = '',
  laboratoryName = '',
  presentation = '',
  categoryName = '',
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const upperName = (name || '').toUpperCase();
  const upperLab = (laboratoryName || '').toUpperCase();
  const upperPres = (presentation || '').toUpperCase();
  const upperCat = (categoryName || '').toUpperCase();

  // Dimensiones según tamaño
  const sizeConfig = {
    xs: { box: 'w-7 h-7 rounded-lg', img: 'w-5 h-5', icon: 'w-3.5 h-3.5', text: 'text-[7px]' },
    sm: { box: 'w-9 h-9 rounded-xl', img: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-[9px]' },
    md: { box: 'w-12 h-12 rounded-2xl', img: 'w-9 h-9', icon: 'w-6 h-6', text: 'text-[11px]' },
    lg: { box: 'w-16 h-16 rounded-2xl', img: 'w-12 h-12', icon: 'w-8 h-8', text: 'text-xs' },
    xl: { box: 'w-20 h-20 rounded-3xl', img: 'w-16 h-16', icon: 'w-10 h-10', text: 'text-sm' },
  }[size];

  // 1. Detección Inteligente de Laboratorio / Marca Farmacéutica Oficial
  const getBrand = (): BrandDefinition => {
    // BAYER
    if (
      upperName.includes('BAYER') ||
      upperLab.includes('BAYER') ||
      upperName.includes('ASPIRINA') ||
      upperName.includes('ALKA-SELTZER') ||
      upperName.includes('CANESTEN') ||
      upperName.includes('ALEVE')
    ) {
      return {
        label: 'BAYER',
        logoSrc: '/logos/labs/bayer.svg',
        badgeColor: 'bg-emerald-600 text-white',
        bgGradient: 'from-emerald-50 to-teal-50',
        borderColor: 'border-emerald-300',
        isDarkLogo: true,
      };
    }

    // MK / TECNOQUÍMICAS
    if (
      upperName.includes(' MK') ||
      upperName.startsWith('MK ') ||
      upperLab.includes('MK') ||
      upperLab.includes('TECNOQUIMICA') ||
      upperLab.includes('TECNOQUÍMICA')
    ) {
      return {
        label: 'MK',
        logoSrc: '/logos/labs/mk.svg',
        badgeColor: 'bg-blue-700 text-white',
        bgGradient: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-300',
      };
    }

    // PFIZER
    if (
      upperName.includes('PFIZER') ||
      upperLab.includes('PFIZER') ||
      upperName.includes('VIAGRA') ||
      upperName.includes('CELEBREX') ||
      upperName.includes('LIPITOR')
    ) {
      return {
        label: 'PFIZER',
        logoSrc: '/logos/labs/pfizer.svg',
        badgeColor: 'bg-blue-800 text-white',
        bgGradient: 'from-sky-50 to-blue-50',
        borderColor: 'border-blue-300',
        isDarkLogo: true,
      };
    }

    // LA SANTÉ
    if (
      upperName.includes('LA SANTE') ||
      upperName.includes('LA SANTÉ') ||
      upperLab.includes('LA SANTE') ||
      upperLab.includes('LA SANTÉ') ||
      upperLab.includes('SANTE')
    ) {
      return {
        label: 'LA SANTÉ',
        logoSrc: '/logos/labs/lasante.svg',
        badgeColor: 'bg-teal-700 text-white',
        bgGradient: 'from-teal-50 to-cyan-50',
        borderColor: 'border-teal-300',
      };
    }

    // CALOX
    if (upperName.includes('CALOX') || upperLab.includes('CALOX')) {
      return {
        label: 'CALOX',
        logoSrc: '/logos/labs/calox.svg',
        badgeColor: 'bg-amber-600 text-white',
        bgGradient: 'from-amber-50 to-orange-50',
        borderColor: 'border-amber-300',
      };
    }

    // LABORATORIOS RAMOS (Nicaragua)
    if (
      upperName.includes('RAMOS') ||
      upperLab.includes('RAMOS') ||
      upperName.includes('DICLORARPE')
    ) {
      return {
        label: 'RAMOS',
        logoSrc: '/logos/labs/ramos.svg',
        badgeColor: 'bg-emerald-800 text-white',
        bgGradient: 'from-emerald-50 to-green-50',
        borderColor: 'border-emerald-300',
      };
    }

    // LABORATORIOS SOLKA (Nicaragua)
    if (upperName.includes('SOLKA') || upperLab.includes('SOLKA')) {
      return {
        label: 'SOLKA',
        logoSrc: '/logos/labs/solka.svg',
        badgeColor: 'bg-blue-800 text-white',
        bgGradient: 'from-blue-50 to-sky-50',
        borderColor: 'border-blue-300',
      };
    }

    // LABORATORIOS VIJOSA (El Salvador)
    if (
      upperName.includes('VIJOSA') ||
      upperLab.includes('VIJOSA') ||
      upperName.includes('VIRO-GRIP') ||
      upperName.includes('VIROGRIP') ||
      upperName.includes('GRIPEX')
    ) {
      return {
        label: 'VIJOSA',
        logoSrc: '/logos/labs/vijosa.svg',
        badgeColor: 'bg-red-700 text-white',
        bgGradient: 'from-rose-50 to-red-50',
        borderColor: 'border-red-300',
      };
    }

    // GENERIFAR
    if (upperName.includes('GENERIFAR') || upperLab.includes('GENERIFAR')) {
      return {
        label: 'GENERIFAR',
        logoSrc: '/logos/labs/generifar.svg',
        badgeColor: 'bg-green-700 text-white',
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-300',
      };
    }

    // SELECTPHARMA
    if (
      upperName.includes('SELECTPHARMA') ||
      upperLab.includes('SELECTPHARMA') ||
      upperName.includes('SELECT PHARMA')
    ) {
      return {
        label: 'SELECTPHARMA',
        logoSrc: '/logos/labs/selectpharma.svg',
        badgeColor: 'bg-purple-700 text-white',
        bgGradient: 'from-purple-50 to-fuchsia-50',
        borderColor: 'border-purple-300',
      };
    }

    // INFASA
    if (
      upperName.includes('INFASA') ||
      upperLab.includes('INFASA') ||
      upperName.includes('FLORENTEROL') ||
      upperName.includes('NEUROFORTAN') ||
      upperName.includes('PASINERVA')
    ) {
      return {
        label: 'INFASA',
        logoSrc: '/logos/labs/infasa.svg',
        badgeColor: 'bg-sky-700 text-white',
        bgGradient: 'from-sky-50 to-cyan-50',
        borderColor: 'border-sky-300',
      };
    }

    // MENARINI
    if (
      upperName.includes('MENARINI') ||
      upperLab.includes('MENARINI') ||
      upperName.includes('MENAXOL') ||
      upperName.includes('ENANTYUM')
    ) {
      return {
        label: 'MENARINI',
        logoSrc: '/logos/labs/menarini.svg',
        badgeColor: 'bg-rose-800 text-white',
        bgGradient: 'from-rose-50 to-red-50',
        borderColor: 'border-rose-300',
      };
    }

    // MEGALABS
    if (
      upperName.includes('MEGALABS') ||
      upperLab.includes('MEGALABS') ||
      upperName.includes('MIGRADORIXINA')
    ) {
      return {
        label: 'MEGALABS',
        logoSrc: '/logos/labs/megalabs.svg',
        badgeColor: 'bg-slate-900 text-white',
        bgGradient: 'from-slate-100 to-cyan-50',
        borderColor: 'border-cyan-300',
      };
    }

    // PHARMALAT
    if (
      upperName.includes('PHARMALAT') ||
      upperLab.includes('PHARMALAT') ||
      upperName.includes('ROYALINE')
    ) {
      return {
        label: 'PHARMALAT',
        logoSrc: '/logos/labs/pharmalat.svg',
        badgeColor: 'bg-teal-800 text-white',
        bgGradient: 'from-teal-50 to-emerald-50',
        borderColor: 'border-teal-300',
      };
    }

    // PIERSAN
    if (
      upperName.includes('PIERSAN') ||
      upperName.includes('PIERSN') ||
      upperLab.includes('PIERSAN') ||
      upperName.includes('DOLOVITANERVO') ||
      upperName.includes('GASTOPRAL')
    ) {
      return {
        label: 'PIERSAN',
        logoSrc: '/logos/labs/piersan.svg',
        badgeColor: 'bg-blue-600 text-white',
        bgGradient: 'from-blue-50 to-sky-50',
        borderColor: 'border-blue-300',
      };
    }

    // CAPLIN POINT
    if (
      upperName.includes('CAPLIN') ||
      upperLab.includes('CAPLIN') ||
      upperName.includes('IBUWIN') ||
      upperName.includes('PARACITEL')
    ) {
      return {
        label: 'CAPLIN',
        logoSrc: '/logos/labs/caplin.svg',
        badgeColor: 'bg-indigo-800 text-white',
        bgGradient: 'from-indigo-50 to-purple-50',
        borderColor: 'border-indigo-300',
      };
    }

    // PANADOL / GSK
    if (upperName.includes('PANADOL')) {
      return {
        label: 'PANADOL',
        logoSrc: '/logos/labs/panadol.svg',
        badgeColor: 'bg-blue-700 text-white',
        bgGradient: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-300',
      };
    }

    // GSK
    if (
      upperName.includes('GSK') ||
      upperLab.includes('GSK') ||
      upperLab.includes('GLAXOSMITHKLINE') ||
      upperName.includes('VENTOLIN')
    ) {
      return {
        label: 'GSK',
        logoSrc: '/logos/labs/gsk.svg',
        badgeColor: 'bg-orange-600 text-white',
        bgGradient: 'from-orange-50 to-amber-50',
        borderColor: 'border-orange-300',
      };
    }

    // SANOFI
    if (
      upperName.includes('SANOFI') ||
      upperLab.includes('SANOFI') ||
      upperName.includes('NOVALGINA') ||
      upperName.includes('ENTEROGERMINA') ||
      upperName.includes('ALLEGRA')
    ) {
      return {
        label: 'SANOFI',
        logoSrc: '/logos/labs/sanofi.svg',
        badgeColor: 'bg-purple-800 text-white',
        bgGradient: 'from-purple-50 to-slate-50',
        borderColor: 'border-purple-300',
        isDarkLogo: true,
      };
    }

    // ABBOTT
    if (
      upperName.includes('ABBOTT') ||
      upperLab.includes('ABBOTT') ||
      upperName.includes('PEDIALYTE') ||
      upperName.includes('ENSURE') ||
      upperName.includes('KLACID')
    ) {
      return {
        label: 'ABBOTT',
        logoSrc: '/logos/labs/abbott.svg',
        badgeColor: 'bg-blue-700 text-white',
        bgGradient: 'from-sky-50 to-blue-50',
        borderColor: 'border-blue-300',
        isDarkLogo: true,
      };
    }

    // ROCHE
    if (
      upperName.includes('ROCHE') ||
      upperLab.includes('ROCHE') ||
      upperName.includes('BACTRIM') ||
      upperName.includes('VALIUM')
    ) {
      return {
        label: 'ROCHE',
        logoSrc: '/logos/labs/roche.svg',
        badgeColor: 'bg-blue-700 text-white',
        bgGradient: 'from-sky-50 to-blue-50',
        borderColor: 'border-blue-300',
        isDarkLogo: true,
      };
    }

    // NOVARTIS
    if (
      upperName.includes('NOVARTIS') ||
      upperLab.includes('NOVARTIS') ||
      upperName.includes('VOLTAREN') ||
      upperName.includes('CATAFLAM')
    ) {
      return {
        label: 'NOVARTIS',
        logoSrc: '/logos/labs/novartis.svg',
        badgeColor: 'bg-orange-700 text-white',
        bgGradient: 'from-amber-50 to-orange-50',
        borderColor: 'border-orange-300',
      };
    }

    // SANDOZ
    if (upperName.includes('SANDOZ') || upperLab.includes('SANDOZ')) {
      return {
        label: 'SANDOZ',
        logoSrc: '/logos/labs/sandoz.svg',
        badgeColor: 'bg-blue-600 text-white',
        bgGradient: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-300',
      };
    }

    // DEFAULT INSTITUCIONAL (Farmacia Espíritu Santo)
    return {
      label: 'FARMACIA',
      logoSrc: '/logos/labs/default_pharma.svg',
      badgeColor: 'bg-emerald-700 text-white',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
    };
  };

  const brand = getBrand();

  // 2. Icono de respaldo si falla la carga de imagen
  const renderFallbackIcon = () => {
    if (
      upperPres.includes('JARABE') ||
      upperPres.includes('SUSPENSION') ||
      upperPres.includes('SOLUCION') ||
      upperPres.includes('BEBIBLE')
    ) {
      return <Droplets className={`${sizeConfig.icon} text-emerald-700`} />;
    }
    if (
      upperPres.includes('INYECTABLE') ||
      upperPres.includes('AMPOLLA') ||
      upperPres.includes('VIAL')
    ) {
      return <Syringe className={`${sizeConfig.icon} text-blue-700`} />;
    }
    if (
      upperPres.includes('CREMA') ||
      upperPres.includes('POMADA') ||
      upperPres.includes('GEL') ||
      upperPres.includes('UNGUENTO')
    ) {
      return <Bandage className={`${sizeConfig.icon} text-amber-700`} />;
    }
    return <Pill className={`${sizeConfig.icon} text-emerald-700`} />;
  };

  return (
    <div className={`relative inline-flex flex-col items-center shrink-0 ${className}`}>
      <div
        className={`relative inline-flex items-center justify-center bg-white ${sizeConfig.box} shadow-sm border ${brand.borderColor} overflow-hidden group transition-all duration-200 hover:shadow-md hover:scale-105 p-1`}
        title={`${name} • Laboratorio: ${brand.label}`}
      >
        {/* Fondo sutil con gradiente */}
        <div className={`absolute inset-0 bg-gradient-to-br ${brand.bgGradient} opacity-60`} />

        {/* Logo Oficial Vectorial (SVG) */}
        {!imageError ? (
          <img
            src={brand.logoSrc}
            alt={`Logo Oficial ${brand.label}`}
            className={`${sizeConfig.img} object-contain relative z-10 drop-shadow-xs transition-transform duration-200 group-hover:scale-110`}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center">
            {renderFallbackIcon()}
          </div>
        )}

        {/* Micro-sello de autenticidad en tamaños grandes */}
        {(size === 'lg' || size === 'xl') && (
          <div className="absolute top-1 right-1 z-20">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        )}
      </div>

      {/* Etiqueta de Marca opcional o en tamaños grandes */}
      {(showBadge || size === 'lg' || size === 'xl') && (
        <span
          className={`mt-1 px-1.5 py-0.5 rounded-md font-black tracking-wider text-center uppercase shadow-xs truncate max-w-full ${brand.badgeColor} ${sizeConfig.text}`}
        >
          {brand.label}
        </span>
      )}
    </div>
  );
};
