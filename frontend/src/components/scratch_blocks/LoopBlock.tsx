'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface LoopBlockProps {
  fillColor?: string;
  strokeColor?: string;
  headerContent?: React.ReactNode;
  footerLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const LoopBlock: React.FC<LoopBlockProps> = ({
  fillColor = '#FFAB19',
  strokeColor = '#CF8B17',
  headerContent,
  footerLabel = 'END LOOP',
  className = '',
  style = {},
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [middleHeight, setMiddleHeight] = useState<number>(48);

  // ResizeObserver to handle dynamic block heights programmatically
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const measuredHeight = Math.max(48, Math.round(entry.contentRect.height));
          setMiddleHeight(measuredHeight);
        }
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`w-full flex flex-col relative select-none filter drop-shadow-md my-1 ${className}`} style={style}>
      {/* 1. TOP HEADER C-BLOCK from loop_top.svg */}
      <div className="relative w-full h-[46px] flex items-center px-4 space-x-2">
        <svg viewBox="0 0 241 85" preserveAspectRatio="none" className="w-full h-full absolute inset-0 pointer-events-none">
          <path d="M124.191 0L124.191 68H116.198C113.985 68 111.85 68.8156 110.2 70.2908L101.928 77.6896C100.278 79.1648 98.1428 79.9803 95.9299 79.9803H77.0791C74.9269 79.9803 72.8461 79.2089 71.2141 77.8059L62.337 70.1744C60.7051 68.7715 58.6242 68 56.4721 68H44.4038C42.6486 68 41.036 68.6108 39.7671 69.6314C37.9144 71.2597 37 73.953 37 77V85H0V8.99668C0 4.02795 4.02795 0 8.99668 0H21.4985C23.5941 0 25.624 0.731537 27.2378 2.06836L36.2466 9.53102C37.8604 10.8679 39.8903 11.5994 41.9858 11.5994H60.5166C62.6121 11.5994 64.642 10.8679 66.2558 9.53103L75.2646 2.06837C76.8784 0.731539 78.9083 0 81.0038 0H124.191Z" fill={fillColor} />
          <path d="M8.99707 1H21.499C23.3615 1.00011 25.1653 1.65073 26.5996 2.83887L35.6084 10.3008C37.4014 11.7861 39.657 12.5995 41.9854 12.5996H60.5166C62.8451 12.5996 65.1004 11.7862 66.8936 10.3008L75.9023 2.83887C77.3368 1.65063 79.1413 1 81.0039 1H123.191V67H116.198C113.739 67 111.366 67.9058 109.533 69.5449L101.261 76.9443C99.7947 78.2555 97.8965 78.9805 95.9297 78.9805H77.0791C75.1663 78.9805 73.3168 78.2947 71.8662 77.0479L62.9893 69.416C61.1759 67.8571 58.863 67 56.4717 67H44.4043C42.413 67 40.5808 67.6942 39.1406 68.8525L39.123 68.8662L39.1064 68.8799C36.963 70.7637 36 73.7827 36 77V84H1V8.99707C1 4.71872 4.35986 1.22503 8.58496 1.01074L8.99707 1Z" stroke={strokeColor} strokeWidth="3" />
        </svg>

        <div className="relative z-10 w-full flex items-center justify-between font-black text-xs text-white">
          {headerContent}
        </div>
      </div>

      {/* 2. MIDDLE EXPANDABLE SPINE driven programmatically by ResizeObserver from loop_middle.svg */}
      <div 
        className="relative pl-8 py-2 flex flex-col justify-center border-l-[12px] transition-all duration-150 ml-0.5"
        style={{ 
          borderColor: strokeColor, 
          backgroundColor: `${fillColor}1F`, 
          minHeight: `${middleHeight}px` 
        }}
      >
        <div ref={contentRef} className="w-full flex flex-col space-y-1.5">
          {children}
        </div>
      </div>

      {/* 3. BOTTOM FOOTER C-BLOCK from loop_bottom.svg */}
      <div className="relative w-full h-[40px] flex items-center px-4">
        <svg viewBox="0 0 241 81" preserveAspectRatio="none" className="w-full h-full absolute inset-0 pointer-events-none">
          <path d="M77.0791 28.9803H95.93C98.1428 28.9803 100.278 28.1648 101.928 26.6896L110.2 19.2908C111.85 17.8156 113.985 17 116.198 17H124.191L124.191 69H81.1978C78.9849 69 76.8496 69.8156 75.2002 71.2908L66.9275 78.6896C65.2781 80.1648 63.1428 80.9803 60.93 80.9803H42.0791C39.9269 80.9803 37.8461 80.2089 36.2142 78.8059L27.337 71.1744C25.7051 69.7715 23.6242 69 21.4721 69H16.4038L9.20437 69.1662C4.15567 69.2828 0 65.222 0 60.172V0H37.0017V8C37.0017 11.0468 37.9153 13.74 39.7673 15.3683C41.0361 16.3891 42.6486 17 44.4038 17H56.4721C58.6242 17 60.7051 17.7715 62.337 19.1744L71.2142 26.8059C72.8461 28.2089 74.9269 28.9803 77.0791 28.9803Z" fill={fillColor} />
          <path d="M36.002 1V8C36.002 11.2169 36.9647 14.2352 39.1074 16.1191L39.123 16.1338L39.1406 16.1475C40.5806 17.3059 42.413 18 44.4043 18H56.4717C58.3846 18 60.235 18.6856 61.6855 19.9326L70.5625 27.5645C72.3758 29.1232 74.6879 29.9805 77.0791 29.9805H95.9297C98.3885 29.9805 100.761 29.0737 102.594 27.4346L110.867 20.0361C112.333 18.725 114.231 18 116.198 18H123.191V68H81.1982C78.7394 68 76.366 68.9058 74.5332 70.5449L66.2607 77.9443C64.7947 79.2555 62.8965 79.9805 60.9297 79.9805H42.0791C40.1663 79.9805 38.3168 79.2948 36.8662 78.0479L27.9893 70.416C26.1759 68.8571 23.863 68 21.4717 68H16.3809L9.18164 68.167C4.69412 68.2706 1 64.6606 1 60.1719V1H36.002Z" stroke={strokeColor} strokeWidth="3" />
        </svg>
        <span className="relative z-10 text-[10px] font-black text-white uppercase tracking-widest">
          {footerLabel}
        </span>
      </div>
    </div>
  );
};
