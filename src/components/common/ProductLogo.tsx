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
  borderClass: string;
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

  // Dimensiones según tamaño
  const sizeConfig = {
    xs: { box: 'w-7 h-7 rounded-lg', img: 'w-5 h-5 max-h-5', icon: 'w-3.5 h-3.5', text: 'text-[7px]' },
    sm: { box: 'w-9 h-9 rounded-xl', img: 'w-7 h-7 max-h-7', icon: 'w-4 h-4', text: 'text-[9px]' },
    md: { box: 'w-12 h-12 rounded-2xl', img: 'w-9 h-9 max-h-9', icon: 'w-6 h-6', text: 'text-[11px]' },
    lg: { box: 'w-16 h-16 rounded-2xl', img: 'w-13 h-13 max-h-13', icon: 'w-8 h-8', text: 'text-xs' },
    xl: { box: 'w-20 h-20 rounded-3xl', img: 'w-16 h-16 max-h-16', icon: 'w-10 h-10', text: 'text-sm' },
  }[size];

  // Detección con Logos Oficiales de la Web
  const getBrand = (): BrandDefinition => {
    // 1. BAYER
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
        logoSrc: '/logos/labs/bayer_plm.png',
        badgeColor: 'bg-emerald-600 text-white',
        borderClass: 'border-emerald-200',
      };
    }

    // 2. MK / TECNOQUÍMICAS
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
        borderClass: 'border-blue-200',
      };
    }

    // 3. PFIZER
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
        borderClass: 'border-blue-200',
      };
    }

    // 4. LABORATORIOS RAMOS (Nicaragua)
    if (
      upperName.includes('RAMOS') ||
      upperLab.includes('RAMOS') ||
      upperName.includes('DICLORARPE')
    ) {
      return {
        label: 'RAMOS',
        logoSrc: '/logos/labs/ramos_plm.png',
        badgeColor: 'bg-emerald-800 text-white',
        borderClass: 'border-emerald-200',
      };
    }

    // 5. LABORATORIOS SOLKA (Nicaragua)
    if (upperName.includes('SOLKA') || upperLab.includes('SOLKA')) {
      return {
        label: 'SOLKA',
        logoSrc: '/logos/labs/solka.jpg',
        badgeColor: 'bg-blue-800 text-white',
        borderClass: 'border-blue-200',
      };
    }

    // 6. LABORATORIOS VIJOSA (El Salvador)
    if (
      upperName.includes('VIJOSA') ||
      upperLab.includes('VIJOSA') ||
      upperName.includes('VIRO-GRIP') ||
      upperName.includes('VIROGRIP') ||
      upperName.includes('GRIPEX')
    ) {
      return {
        label: 'VIJOSA',
        logoSrc: '/logos/labs/vijosa_plm.png',
        badgeColor: 'bg-red-700 text-white',
        borderClass: 'border-red-200',
      };
    }

    // 7. CALOX INTERNATIONAL
    if (upperName.includes('CALOX') || upperLab.includes('CALOX')) {
      return {
        label: 'CALOX',
        logoSrc: '/logos/labs/calox_plm.png',
        badgeColor: 'bg-amber-600 text-white',
        borderClass: 'border-amber-200',
      };
    }

    // 8. LA SANTÉ
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
        borderClass: 'border-teal-200',
      };
    }

    // 9. SELECTPHARMA
    if (
      upperName.includes('SELECTPHARMA') ||
      upperLab.includes('SELECTPHARMA') ||
      upperName.includes('SELECT PHARMA')
    ) {
      return {
        label: 'SELECTPHARMA',
        logoSrc: '/logos/labs/selectpharma.svg',
        badgeColor: 'bg-purple-700 text-white',
        borderClass: 'border-purple-200',
      };
    }

    // 10. INFASA
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
        borderClass: 'border-sky-200',
      };
    }

    // 11. MEGALABS
    if (
      upperName.includes('MEGALABS') ||
      upperLab.includes('MEGALABS') ||
      upperName.includes('MIGRADORIXINA')
    ) {
      return {
        label: 'MEGALABS',
        logoSrc: '/logos/labs/megalabs.png',
        badgeColor: 'bg-slate-900 text-white',
        borderClass: 'border-slate-300',
      };
    }

    // 12. MENARINI
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
        borderClass: 'border-rose-200',
      };
    }

    // 13. PHARMALAT
    if (
      upperName.includes('PHARMALAT') ||
      upperLab.includes('PHARMALAT') ||
      upperName.includes('ROYALINE')
    ) {
      return {
        label: 'PHARMALAT',
        logoSrc: '/logos/labs/pharmalat.png',
        badgeColor: 'bg-teal-800 text-white',
        borderClass: 'border-teal-200',
      };
    }

    // 14. CAPLIN POINT
    if (
      upperName.includes('CAPLIN') ||
      upperLab.includes('CAPLIN') ||
      upperName.includes('IBUWIN') ||
      upperName.includes('PARACITEL')
    ) {
      return {
        label: 'CAPLIN',
        logoSrc: '/logos/labs/caplin.png',
        badgeColor: 'bg-indigo-800 text-white',
        borderClass: 'border-indigo-200',
      };
    }

    // 15. GENFAR
    if (upperName.includes('GENFAR') || upperLab.includes('GENFAR')) {
      return {
        label: 'GENFAR',
        logoSrc: '/logos/labs/genfar.png',
        badgeColor: 'bg-red-700 text-white',
        borderClass: 'border-red-200',
      };
    }

    // 16. PANADOL
    if (upperName.includes('PANADOL')) {
      return {
        label: 'PANADOL',
        logoSrc: '/logos/labs/panadol.svg',
        badgeColor: 'bg-blue-700 text-white',
        borderClass: 'border-blue-200',
      };
    }

    // 17. GSK
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
        borderClass: 'border-orange-200',
      };
    }

    // 18. NOVARTIS
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
        borderClass: 'border-orange-200',
      };
    }

    // 19. ABBOTT
    if (
      upperName.includes('ABBOTT') ||
      upperLab.includes('ABBOTT') ||
      upperName.includes('PEDIALYTE') ||
      upperName.includes('ENSURE') ||
      upperName.includes('KLACID')
    ) {
      return {
        label: 'ABBOTT',
        logoSrc: '/logos/labs/abbott_plm.png',
        badgeColor: 'bg-blue-700 text-white',
        borderClass: 'border-blue-200',
      };
    }

    // 20. SANOFI
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
        borderClass: 'border-purple-200',
      };
    }

    // 21. ROCHE
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
        borderClass: 'border-blue-200',
      };
    }

    // 22. GENERIFAR
    if (upperName.includes('GENERIFAR') || upperLab.includes('GENERIFAR')) {
      return {
        label: 'GENERIFAR',
        logoSrc: '/logos/labs/ramos_plm.png',
        badgeColor: 'bg-green-700 text-white',
        borderClass: 'border-green-200',
      };
    }

    // DEFAULT FARMACIA ESPÍRITU SANTO
    return {
      label: 'FARMACIA',
      logoSrc: '/logo.jpg',
      badgeColor: 'bg-emerald-700 text-white',
      borderClass: 'border-emerald-200',
    };
  };

  const brand = getBrand();

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
        className={`relative inline-flex items-center justify-center bg-white ${sizeConfig.box} shadow-xs border ${brand.borderClass} overflow-hidden group transition-all duration-200 hover:shadow-md hover:scale-105 p-1`}
        title={`${name} • ${brand.label}`}
      >
        {!imageError ? (
          <img
            src={brand.logoSrc}
            alt={`Logo Oficial ${brand.label}`}
            className={`${sizeConfig.img} object-contain select-none transition-transform duration-200 group-hover:scale-110`}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center">
            {renderFallbackIcon()}
          </div>
        )}
      </div>

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
