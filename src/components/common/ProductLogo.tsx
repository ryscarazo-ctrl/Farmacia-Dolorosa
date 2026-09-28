'use client';

import React from 'react';
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
}

export const ProductLogo: React.FC<ProductLogoProps> = ({
  name = '',
  laboratoryName = '',
  presentation = '',
  categoryName = '',
  size = 'md',
  className = '',
}) => {
  const upperName = (name || '').toUpperCase();
  const upperLab = (laboratoryName || '').toUpperCase();
  const upperPres = (presentation || '').toUpperCase();
  const upperCat = (categoryName || '').toUpperCase();

  // Dimensiones según tamaño
  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px] rounded-lg',
    sm: 'w-8 h-8 text-[10px] rounded-xl',
    md: 'w-11 h-11 text-xs rounded-2xl',
    lg: 'w-16 h-16 text-sm rounded-2xl',
    xl: 'w-20 h-20 text-base rounded-3xl',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  }[size];

  // 1. Detección de Laboratorio / Marca Líder
  const getBrandInfo = () => {
    // BAYER
    if (upperName.includes('BAYER') || upperLab.includes('BAYER')) {
      return {
        bg: 'from-blue-600 via-sky-600 to-cyan-500',
        text: 'text-white',
        border: 'border-blue-400/40',
        label: 'BAYER',
        badgeColor: 'bg-blue-600 text-white',
        logoType: 'BAYER',
      };
    }
    // MK / TECNOQUÍMICAS
    if (upperName.includes(' MK') || upperName.startsWith('MK ') || upperLab.includes('MK') || upperLab.includes('TECNOQUIMICA')) {
      return {
        bg: 'from-blue-700 via-indigo-600 to-sky-600',
        text: 'text-white',
        border: 'border-blue-400/40',
        label: 'MK',
        badgeColor: 'bg-indigo-700 text-white',
        logoType: 'MK',
      };
    }
    // SOLKA (Nicaragua)
    if (upperName.includes('SOLKA') || upperLab.includes('SOLKA')) {
      return {
        bg: 'from-emerald-700 via-teal-600 to-emerald-500',
        text: 'text-white',
        border: 'border-emerald-400/40',
        label: 'SOLKA',
        badgeColor: 'bg-emerald-700 text-white',
        logoType: 'SOLKA',
      };
    }
    // LA SANTE
    if (upperName.includes('LA SANTE') || upperLab.includes('LA SANTE') || upperName.includes('SANTE')) {
      return {
        bg: 'from-teal-600 via-cyan-600 to-sky-500',
        text: 'text-white',
        border: 'border-teal-400/40',
        label: 'SANTE',
        badgeColor: 'bg-teal-700 text-white',
        logoType: 'SANTE',
      };
    }
    // CALOX
    if (upperName.includes('CALOX') || upperLab.includes('CALOX')) {
      return {
        bg: 'from-amber-600 via-orange-600 to-yellow-500',
        text: 'text-white',
        border: 'border-amber-400/40',
        label: 'CALOX',
        badgeColor: 'bg-amber-700 text-white',
        logoType: 'CALOX',
      };
    }
    // SELECTPHARMA
    if (upperName.includes('SELECTPHARMA') || upperLab.includes('SELECTPHARMA')) {
      return {
        bg: 'from-purple-700 via-fuchsia-600 to-pink-500',
        text: 'text-white',
        border: 'border-purple-400/40',
        label: 'SELECT',
        badgeColor: 'bg-purple-700 text-white',
        logoType: 'SELECT',
      };
    }
    // RAMOS (Nicaragua)
    if (upperName.includes('RAMOS') || upperLab.includes('RAMOS')) {
      return {
        bg: 'from-emerald-800 via-green-700 to-teal-600',
        text: 'text-white',
        border: 'border-green-400/40',
        label: 'RAMOS',
        badgeColor: 'bg-emerald-800 text-white',
        logoType: 'RAMOS',
      };
    }
    // VIJOSA / VIRO-GRIP
    if (upperName.includes('VIJOSA') || upperLab.includes('VIJOSA') || upperName.includes('VIRO-GRIP') || upperName.includes('VIROGRIP')) {
      return {
        bg: 'from-red-600 via-rose-600 to-orange-500',
        text: 'text-white',
        border: 'border-red-400/40',
        label: 'VIJOSA',
        badgeColor: 'bg-red-700 text-white',
        logoType: 'VIJOSA',
      };
    }
    // GSK / PANADOL
    if (upperName.includes('GSK') || upperLab.includes('GSK') || upperName.includes('PANADOL')) {
      return {
        bg: 'from-orange-600 via-amber-600 to-yellow-500',
        text: 'text-white',
        border: 'border-orange-400/40',
        label: 'GSK',
        badgeColor: 'bg-orange-700 text-white',
        logoType: 'GSK',
      };
    }
    // PFIZER
    if (upperName.includes('PFIZER') || upperLab.includes('PFIZER')) {
      return {
        bg: 'from-blue-800 via-blue-600 to-indigo-600',
        text: 'text-white',
        border: 'border-blue-300/40',
        label: 'PFIZER',
        badgeColor: 'bg-blue-800 text-white',
        logoType: 'PFIZER',
      };
    }
    // GENFAR
    if (upperName.includes('GENFAR') || upperLab.includes('GENFAR')) {
      return {
        bg: 'from-red-700 via-rose-700 to-red-500',
        text: 'text-white',
        border: 'border-red-300/40',
        label: 'GENFAR',
        badgeColor: 'bg-red-800 text-white',
        logoType: 'GENFAR',
      };
    }
    // REYOUNG / HUAZHONG
    if (upperName.includes('REYOUNG') || upperName.includes('HUAZHONG') || upperLab.includes('REYOUNG') || upperLab.includes('HUAZHONG')) {
      return {
        bg: 'from-cyan-700 via-teal-600 to-emerald-600',
        text: 'text-white',
        border: 'border-cyan-400/40',
        label: 'PHARMA',
        badgeColor: 'bg-cyan-800 text-white',
        logoType: 'PHARMA',
      };
    }

    // Default por Categoría Farmacéutica
    if (upperCat.includes('ANTIBIOTIC') || upperName.includes('AMOXICILIN') || upperName.includes('AZITROMICIN') || upperName.includes('CIPRO')) {
      return {
        bg: 'from-violet-600 via-purple-600 to-indigo-600',
        text: 'text-white',
        border: 'border-purple-300/40',
        label: 'ANTIBIÓTICO',
        badgeColor: 'bg-violet-700 text-white',
        logoType: 'RX_ANTIBIOTIC',
      };
    }
    if (upperCat.includes('ANALGES') || upperCat.includes('ANTIINFLAM') || upperName.includes('ACETAMINOFEN') || upperName.includes('IBUPROFEN') || upperName.includes('PARACETAMOL')) {
      return {
        bg: 'from-rose-600 via-red-600 to-amber-500',
        text: 'text-white',
        border: 'border-rose-300/40',
        label: 'ANALGÉSICO',
        badgeColor: 'bg-rose-700 text-white',
        logoType: 'RX_PAIN',
      };
    }
    if (upperCat.includes('GASTRO') || upperName.includes('OMEPRAZOL') || upperName.includes('ALUMIN') || upperName.includes('RANITIDIN')) {
      return {
        bg: 'from-amber-600 via-emerald-600 to-teal-600',
        text: 'text-white',
        border: 'border-amber-300/40',
        label: 'GASTRO',
        badgeColor: 'bg-amber-700 text-white',
        logoType: 'RX_GASTRO',
      };
    }
    if (upperCat.includes('RESPIRAT') || upperCat.includes('GRIP') || upperName.includes('JARABE') || upperName.includes('DEXTRO')) {
      return {
        bg: 'from-sky-600 via-blue-600 to-cyan-500',
        text: 'text-white',
        border: 'border-sky-300/40',
        label: 'RESPIRATORIO',
        badgeColor: 'bg-sky-700 text-white',
        logoType: 'RX_RESP',
      };
    }

    // Default Genérico Farmacéutico Nacional
    return {
      bg: 'from-slate-800 via-slate-700 to-slate-900',
      text: 'text-white',
      border: 'border-slate-500/40',
      label: 'RX PHARMA',
      badgeColor: 'bg-slate-800 text-white',
      logoType: 'DEFAULT',
    };
  };

  const brand = getBrandInfo();

  // 2. Icono central de acuerdo a la presentación o tipo
  const renderIcon = () => {
    if (upperPres.includes('JARABE') || upperPres.includes('SUSPENSION') || upperPres.includes('SOLUCION') || upperPres.includes('FRASCO')) {
      return <Droplets className={`${iconSizes} text-white drop-shadow`} />;
    }
    if (upperPres.includes('INYECTABLE') || upperPres.includes('AMPOLLA') || upperPres.includes('VIAL')) {
      return <Syringe className={`${iconSizes} text-white drop-shadow`} />;
    }
    if (upperPres.includes('CREMA') || upperPres.includes('POMADA') || upperPres.includes('GEL') || upperPres.includes('UNGUENTO')) {
      return <Bandage className={`${iconSizes} text-white drop-shadow`} />;
    }
    if (brand.logoType === 'BAYER') {
      return (
        <span className="font-black tracking-tighter text-[11px] leading-none drop-shadow">
          BAYER
        </span>
      );
    }
    if (brand.logoType === 'MK') {
      return (
        <span className="font-black tracking-tighter text-xs leading-none drop-shadow">
          MK
        </span>
      );
    }
    if (brand.logoType === 'SOLKA') {
      return (
        <span className="font-black tracking-tighter text-[10px] leading-none drop-shadow">
          SOLKA
        </span>
      );
    }
    if (brand.logoType === 'SANTE') {
      return (
        <span className="font-black tracking-tighter text-[9px] leading-none drop-shadow">
          SANTÉ
        </span>
      );
    }
    if (brand.logoType === 'CALOX') {
      return (
        <span className="font-black tracking-tighter text-[10px] leading-none drop-shadow">
          CALOX
        </span>
      );
    }
    if (brand.logoType === 'SELECT') {
      return (
        <span className="font-black tracking-tighter text-[8px] leading-none drop-shadow">
          SELECT
        </span>
      );
    }

    // Default Pill
    return <Pill className={`${iconSizes} text-white drop-shadow`} />;
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-gradient-to-br ${brand.bg} ${brand.text} ${sizeClasses} font-black shadow-md border ${brand.border} shrink-0 select-none overflow-hidden ${className}`}
      title={`${name} • ${laboratoryName || 'Farmacéutico'}`}
    >
      {/* Patrón de fondo geométrico sutil */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />
      
      {/* Brillo superior tipo cristal */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-white/20 rounded-full blur-[4px] pointer-events-none" />

      {/* Contenido Central */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {renderIcon()}
      </div>

      {/* Micro-cintillo con iniciales o marca si el tamaño es grande */}
      {(size === 'lg' || size === 'xl') && (
        <div className="absolute bottom-1 inset-x-1 bg-black/30 backdrop-blur-[2px] rounded-md py-0.5 text-center text-[8px] uppercase tracking-wider font-bold truncate px-1">
          {brand.label}
        </div>
      )}
    </div>
  );
};
