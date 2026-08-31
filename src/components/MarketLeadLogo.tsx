import React from 'react';

interface MarketLeadLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'compact' | 'badge';
  className?: string;
  showSubtitle?: boolean;
}

export const MarketLeadLogo: React.FC<MarketLeadLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showSubtitle = true,
}) => {
  // Dimensions based on size
  const iconDimensions = {
    sm: { width: 28, height: 20 },
    md: { width: 38, height: 26 },
    lg: { width: 50, height: 34 },
    xl: { width: 68, height: 46 },
  }[size];

  const textSize = {
    sm: { title: 'text-sm', subtitle: 'text-[8px] tracking-widest' },
    md: { title: 'text-base font-extrabold', subtitle: 'text-[9px] tracking-[0.2em]' },
    lg: { title: 'text-xl font-extrabold', subtitle: 'text-[11px] tracking-[0.22em]' },
    xl: { title: 'text-2xl font-black', subtitle: 'text-[12px] tracking-[0.25em]' },
  }[size];

  // SVG Eye with Bar Chart & Rising Arrow (MarketLead Mark)
  const LogoIcon = (
    <div className="relative flex items-center justify-center shrink-0">
      <svg
        width={iconDimensions.width}
        height={iconDimensions.height}
        viewBox="0 0 100 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform hover:scale-105"
      >
        <defs>
          {/* Arrow Gradient */}
          <linearGradient id="arrowGradient" x1="20" y1="60" x2="85" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>

          {/* Eye Frame Gradient */}
          <linearGradient id="eyeGradient" x1="0" y1="34" x2="100" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>

          {/* Bar Chart Gradient */}
          <linearGradient id="barGradient" x1="0" y1="50" x2="0" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {/* Outer Eye Shape */}
        <path
          d="M 6 34 C 24 10, 76 10, 94 34 C 76 58, 24 58, 6 34 Z"
          stroke="url(#eyeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-xs"
        />

        {/* Chart Bar 1 (Left / Shortest) */}
        <rect x="22" y="38" width="7" height="13" rx="1.5" fill="url(#barGradient)" />

        {/* Chart Bar 2 (Middle) */}
        <rect x="33" y="30" width="7" height="21" rx="1.5" fill="url(#barGradient)" />

        {/* Chart Bar 3 (Right / Taller) */}
        <rect x="62" y="36" width="7" height="15" rx="1.5" fill="url(#barGradient)" />

        {/* Diagonal Rising Arrow Cutting through the Eye */}
        {/* Arrow Shaft */}
        <path
          d="M 44 52 L 72 15"
          stroke="url(#arrowGradient)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* Arrow Left Wing / V-shape */}
        <path
          d="M 50 18 L 44 52 L 48 52"
          stroke="url(#arrowGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Arrowhead */}
        <path
          d="M 58 12 L 77 10 L 76 29"
          stroke="url(#arrowGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{LogoIcon}</div>;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center space-x-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-800 ${className}`}>
        {LogoIcon}
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-xs tracking-tight text-white leading-none">MARKETLEAD</span>
          <span className="text-[8px] font-semibold text-teal-400 tracking-widest leading-tight uppercase">
            Business Intelligence
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-3 text-left ${className}`}>
      {LogoIcon}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5 leading-none">
          <span className={`font-black text-slate-900 tracking-tight ${textSize.title}`}>
            MARKETLEAD
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-bold text-teal-700 uppercase mt-0.5 leading-none ${textSize.subtitle}`}>
            Business Intelligence Platform
          </span>
        )}
      </div>
    </div>
  );
};
