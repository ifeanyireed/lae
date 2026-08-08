'use client';

import React from 'react';

export interface InstructionBlockProps {
  fillColor?: string;
  strokeColor?: string;
  isLast?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const InstructionBlock: React.FC<InstructionBlockProps> = ({
  fillColor = '#4C97FF',
  strokeColor = '#3373CC',
  isLast = false,
  className = '',
  style = {},
  children,
}) => {
  return (
    <div 
      className={`relative inline-flex items-center select-none filter drop-shadow-md transition-all ${className}`}
      style={{ minWidth: '150px', height: '44px', ...style }}
    >
      {/* Exact instruction_background.svg / instruction_end_background.svg vector path with dynamic props */}
      <svg 
        viewBox="0 0 112 80" 
        preserveAspectRatio="none" 
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        {isLast ? (
          <path 
            d="M21.4985 0H8.99668C4.02795 0 0 4.02795 0 8.99668V59.0033C0 63.972 4.02796 68 8.99669 68H77.7615H89.1911V0H81.0038C78.9082 0 76.8784 0.731538 75.2646 2.06837L66.2558 9.53103C64.642 10.8679 62.6121 11.5994 60.5166 11.5994H41.9858C39.8903 11.5994 37.8604 10.8679 36.2466 9.53102L27.2378 2.06836C25.624 0.731537 23.5941 0 21.4985 0Z" 
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="3"
          />
        ) : (
          <path 
            d="M0 8.99668C0 4.02795 4.02795 0 8.99668 0H21.4985C23.5941 0 25.624 0.731537 27.2378 2.06836L36.2466 9.53102C37.8604 10.8679 39.8903 11.5994 41.9858 11.5994H60.5166C62.6121 11.5994 64.642 10.8679 66.2558 9.53103L75.2646 2.06837C76.8784 0.731538 78.9082 0 81.0038 0H89.1911V68H81.1978C78.9849 68 76.8496 68.8156 75.2002 70.2908L66.9275 77.6896C65.2781 79.1648 63.1428 79.9803 60.9299 79.9803H42.0791C39.9269 79.9803 37.8461 79.2089 36.2141 77.8059L27.337 70.1744C25.7051 68.7715 23.6242 68 21.4721 68H8.99667C4.02794 68 0 63.972 0 59.0033V8.99668Z" 
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="3"
          />
        )}
      </svg>

      {/* Programmatically Stretchable Content Container */}
      <div className="relative z-10 w-full h-full flex items-center px-4 space-x-2 font-black text-xs text-white uppercase tracking-wide">
        {children}
      </div>
    </div>
  );
};
