'use client';

import React from 'react';

export interface EventHatBlockProps {
  fillColor?: string;
  strokeColor?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const EventHatBlock: React.FC<EventHatBlockProps> = ({
  fillColor = '#FFBF00',
  strokeColor = '#CC9900',
  className = '',
  style = {},
  children,
}) => {
  return (
    <div 
      className={`relative inline-flex items-center select-none filter drop-shadow-md transition-all ${className}`}
      style={{ minWidth: '190px', height: '56px', ...style }}
    >
      {/* Exact event_background.svg vector path with programmatic fill & stroke */}
      <svg 
        viewBox="0 0 212 104" 
        preserveAspectRatio="none" 
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        <path 
          d="M8.99667 91.9998H21.4721C23.6242 91.9998 25.7051 92.7713 27.337 94.1743L36.2141 101.806C37.8461 103.209 39.9269 103.98 42.0791 103.98H60.9299C63.1428 103.98 65.2781 103.165 66.9275 101.689L75.2002 94.2906C76.8496 92.8154 78.9849 91.9998 81.1978 91.9998H151.191V23.9999H142.449C142.449 23.9999 124.664 0.38623 73.741 0.38623C22.8184 0.38623 0 23.9999 0 23.9999V83.0032C0 87.9719 4.02794 91.9998 8.99667 91.9998Z" 
          fill={fillColor} 
        />
        <path 
          d="M73.7412 1.38623C99.0407 1.38627 116.052 7.25042 126.712 13.0708C132.045 15.9826 135.796 18.8884 138.206 21.0542C139.411 22.137 140.281 23.0349 140.845 23.6567C141.127 23.9676 141.333 24.2094 141.466 24.3706C141.532 24.4512 141.581 24.5124 141.611 24.5513C141.627 24.5706 141.637 24.5848 141.644 24.5933L141.65 24.6011L141.95 24.9995H150.191V90.9995H81.1982C78.7394 90.9995 76.366 91.9062 74.5332 93.5454L66.2607 100.944C64.7947 102.255 62.8966 102.98 60.9297 102.98H42.0791C40.1662 102.98 38.3168 102.294 36.8662 101.047L27.9893 93.4155C26.1759 91.8566 23.863 90.9995 21.4717 90.9995H8.99707C4.58071 90.9995 1.00014 87.4197 1 83.0034V24.4194C1.17048 24.2561 1.41879 24.0231 1.74609 23.731C2.45004 23.1026 3.51894 22.1981 4.96289 21.1089C7.85155 18.93 12.2413 16.0125 18.2139 13.0913C30.1548 7.25101 48.4406 1.38623 73.7412 1.38623Z" 
          stroke={strokeColor} 
          strokeWidth="3" 
        />
        <path d="M203.003 24H149V92H203.003C207.972 92 212 87.972 212 83.0033V32.9967C212 28.028 207.972 24 203.003 24Z" fill={fillColor} />
        <path d="M203.003 25C207.419 25 211 28.5806 211 32.9971V83.0029C211 87.4194 207.419 91 203.003 91H150V25H203.003Z" stroke={strokeColor} strokeWidth="3" />
      </svg>

      {/* Stretchable Content Overlay */}
      <div className="relative z-10 w-full h-full flex items-center px-4 pt-3 space-x-2 font-black text-xs text-slate-950 uppercase tracking-wide">
        {children}
      </div>
    </div>
  );
};
