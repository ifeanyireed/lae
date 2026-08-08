'use client';

import React from 'react';
import Image from 'next/image';
import { IconTrash, IconCode, IconBrain, IconTag, IconHome, IconHeading, IconTypography, IconList } from '@tabler/icons-react';

export interface PureCSSLoopBlockProps {
  type: string;
  label: string;
  repeatCount?: number;
  isActive?: boolean;
  isPalette?: boolean;
  children?: React.ReactNode;
  onRemove?: () => void;
  onRepeatCountChange?: (val: number) => void;
  onAddChild?: (blockDef: any) => void;
}

export const isLoopBlockType = (type: string): boolean => {
  return [
    'repeat',
    'forever',
    'if_then',
    'html_tag',
    'head_tag',
    'title_tag',
    'body_tag',
    'h1_tag',
    'p_tag',
    'list_tag',
  ].includes(type);
};

const getBlockTheme = (type: string) => {
  switch (type) {
    case 'html_tag':
      return {
        bg: '#2563EB', // Blue 600
        border: '#1D4ED8', // Blue 700
        headerText: '<html>',
        footerText: '</html>',
        showRepeat: false,
        iconType: 'code',
      };
    case 'head_tag':
      return {
        bg: '#FF9100', // Lightened vibrant orange
        border: '#E65100', // Darker orange border
        headerText: '<head>',
        footerText: '</head>',
        showRepeat: false,
        iconType: 'head',
      };
    case 'title_tag':
      return {
        bg: '#E91E63', // Lightened vibrant magenta
        border: '#C2185B', // Darker magenta border
        headerText: '<title>',
        footerText: '</title>',
        showRepeat: false,
        iconType: 'title',
      };
    case 'body_tag':
      return {
        bg: '#7E22CE', // Purple 700
        border: '#6B21A8', // Purple 800
        headerText: '<body>',
        footerText: '</body>',
        showRepeat: false,
        iconType: 'body',
      };
    case 'h1_tag':
      return {
        bg: '#7E22CE', // Purple 700
        border: '#6B21A8', // Purple 800
        headerText: '<h1>',
        footerText: '</h1>',
        showRepeat: false,
        iconType: 'heading',
      };
    case 'p_tag':
      return {
        bg: '#7E22CE', // Purple 700
        border: '#6B21A8', // Purple 800
        headerText: '<p>',
        footerText: '</p>',
        showRepeat: false,
        iconType: 'p',
      };
    case 'list_tag':
      return {
        bg: '#7E22CE', // Purple 700
        border: '#6B21A8', // Purple 800
        headerText: '<ul>',
        footerText: '</ul>',
        showRepeat: false,
        iconType: 'list',
      };
    case 'forever':
      return {
        bg: '#FFAB19',
        border: '#CF8B17',
        headerText: 'forever',
        footerText: '',
        showRepeat: false,
        iconType: 'repeat',
      };
    case 'if_then':
      return {
        bg: '#FFAB19',
        border: '#CF8B17',
        headerText: 'if path',
        footerText: '',
        showRepeat: false,
        iconType: 'repeat',
      };
    case 'repeat':
    default:
      return {
        bg: '#FFAB19',
        border: '#CF8B17',
        headerText: 'repeat',
        footerText: '',
        showRepeat: true,
        iconType: 'repeat',
      };
  }
};

const renderHeaderIcon = (iconType: string) => {
  switch (iconType) {
    case 'code':
      return <IconCode className="w-3.5 h-3.5 text-white mr-1 shrink-0" />;
    case 'head':
      return <IconBrain className="w-3.5 h-3.5 text-white mr-1 shrink-0" />;
    case 'title':
      return <IconTag className="w-3.5 h-3.5 text-white mr-1 shrink-0" />;
    case 'body':
      return <IconHome className="w-3.5 h-3.5 text-white mr-1 shrink-0" />;
    case 'heading':
      return <IconHeading className="w-3.5 h-3.5 text-white mr-1 shrink-0" />;
    case 'p':
      return <IconTypography className="w-3.5 h-3.5 text-white mr-1 shrink-0" />;
    case 'list':
      return <IconList className="w-3.5 h-3.5 text-white mr-1 shrink-0" />;
    default:
      return null;
  }
};

export const PureCSSLoopBlock: React.FC<PureCSSLoopBlockProps> = ({
  type,
  label,
  repeatCount = 1,
  isActive = false,
  isPalette = false,
  children,
  onRemove,
  onRepeatCountChange,
  onAddChild,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const dragCounter = React.useRef(0);

  const theme = getBlockTheme(type);

  const handleDragEnter = (e: React.DragEvent) => {
    if (isPalette) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isPalette) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isPalette) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isPalette) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragOver(false);
    try {
      const json = e.dataTransfer.getData('application/json');
      if (json && onAddChild) {
        const blockDef = JSON.parse(json);
        onAddChild(blockDef);
      }
    } catch (err) {}
  };

  return (
    <div 
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative inline-flex flex-col select-none transition-all duration-200 ease-out ${isPalette ? 'my-1' : 'my-0'} ${
        isActive ? 'ring-4 ring-amber-400 z-30 shadow-lg' : 'hover:brightness-105'
      }`}
    >
      {/* 1. TOP HEADER BAR */}
      <div 
        className="relative flex items-center justify-between rounded-t-md rounded-br-md rounded-bl-none px-4 py-2 text-white font-semibold text-xs leading-none shadow-md z-20"
        style={{
          backgroundColor: theme.bg,
          border: `2px solid ${theme.border}`,
          minWidth: isPalette ? '180px' : '220px',
          height: '44px',
          clipPath: 'polygon(0 0, 16px 0, 24px 9.5px, 48px 9.5px, 56px 0, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        <div className="flex items-center space-x-1.5 text-white truncate h-full z-10">
          {renderHeaderIcon(theme.iconType)}
          <span className="font-mono font-medium text-sm tracking-tight text-white leading-none">
            {theme.headerText}
          </span>

          {theme.showRepeat && (
            <div className="flex items-center space-x-1.5 shrink-0 ml-1 h-full">
              {isPalette ? (
                <div className="h-7 min-w-[32px] px-2.5 flex items-center justify-center bg-white text-[#575E75] rounded-full font-mono text-sm font-medium border-2 border-[#CF8B17] shadow-inner leading-none">
                  {repeatCount}
                </div>
              ) : (
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={repeatCount}
                  onChange={(e) => onRepeatCountChange && onRepeatCountChange(parseInt(e.target.value) || 1)}
                  className="h-7 w-11 px-1 bg-white text-[#575E75] rounded-full font-mono text-center border-2 border-[#CF8B17] font-medium text-sm outline-none focus:ring-2 focus:ring-amber-400 shadow-inner leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              )}
              <span className="text-sm font-medium text-white lowercase leading-none">times</span>
            </div>
          )}
        </div>

        {!isPalette && onRemove && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 hover:text-red-200 transition text-white/90 shrink-0 ml-1 z-10"
            title="Remove Container Block"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Outer Tab at bottom of top header bar */}
      <div className="absolute top-[42px] left-[41px] w-[38px] h-[3px] z-25 pointer-events-none" style={{ backgroundColor: theme.bg }} />
      <div 
        className="absolute top-[44px] left-[40px] w-[40px] h-[11.5px] z-30"
        style={{
          backgroundColor: theme.bg,
          borderBottom: `2px solid ${theme.border}`,
          borderLeft: `2px solid ${theme.border}`,
          borderRight: `2px solid ${theme.border}`,
          clipPath: 'polygon(0 0, 8px 100%, 32px 100%, 40px 0)',
        }}
      />

      {/* 2. INNER C-BRACKET SPINE & NESTED CHILDREN AREA */}
      <div className={`relative flex items-stretch transition-all duration-200 ease-out my-0 ${
        isDragOver ? 'min-h-[88px]' : 'min-h-[44px]'
      }`}>
        {/* Vertical C-Spine (width 24px) */}
        <div 
          className="w-[24px] shrink-0 relative z-10 transition-all duration-200 ease-out"
          style={{
            backgroundColor: theme.bg,
            borderLeft: `2px solid ${theme.border}`,
            borderRight: `2px solid ${theme.border}`,
          }}
        />

        {/* Seam Covers */}
        <div className="absolute -top-[2px] left-[1px] w-[22px] h-[3px] z-25 pointer-events-none" style={{ backgroundColor: theme.bg }} />
        <div className="absolute -bottom-[2px] left-[1px] w-[22px] h-[3px] z-25 pointer-events-none" style={{ backgroundColor: theme.bg }} />

        {/* Inner Top-Left Corner Curved Fillet */}
        <svg className="absolute -top-[1px] left-[23.5px] w-1.5 h-1.5 z-25 pointer-events-none" viewBox="0 0 6 6" fill="none">
          <path d="M 0 0 L 6 0 C 3 0, 0 3, 0 6 Z" fill={theme.bg} />
          <path d="M 6 0 C 3 0, 0 3, 0 6" fill="none" stroke={theme.border} strokeWidth="1.5" />
        </svg>

        {/* Inner Bottom-Left Corner Curved Fillet */}
        <svg className="absolute -bottom-[1px] left-[23.5px] w-1.5 h-1.5 z-25 pointer-events-none" viewBox="0 0 6 6" fill="none">
          <path d="M 0 6 L 6 6 C 3 6, 0 3, 0 0 Z" fill={theme.bg} />
          <path d="M 6 6 C 3 6, 0 3, 0 0" fill="none" stroke={theme.border} strokeWidth="1.5" />
        </svg>
        
        {/* Enclosed Action Area where nested blocks snap and interlock */}
        <div 
          className={`flex-1 pl-0 pr-0 py-0 flex flex-col space-y-[2px] items-start justify-center transition-all duration-200 ease-out ${
            isDragOver ? 'bg-amber-300/50 ring-2 ring-dashed ring-amber-500 rounded-r-md shadow-inner min-h-[88px]' : 'min-h-[44px]'
          }`}
        >
          {children}

          {/* Interactive Nesting Drop Indicator */}
          {isDragOver && (
            <div className="w-full h-9 border-2 border-dashed border-amber-600/80 bg-amber-400/40 rounded-md flex items-center justify-center text-amber-950 font-black text-[11px] animate-pulse my-1 px-3 shadow-sm tracking-wide">
              <span>+ Drop block inside {theme.headerText}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM LOOP FOOTER */}
      <div 
        className="relative flex items-center justify-between rounded-b-md px-4 py-2 z-20"
        style={{
          backgroundColor: theme.bg,
          border: `2px solid ${theme.border}`,
          minWidth: isPalette ? '180px' : '220px',
          height: '40px',
          clipPath: 'polygon(0 0, 40px 0, 48px 9.5px, 72px 9.5px, 80px 0, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        {theme.footerText ? (
          <span className="font-mono font-medium text-sm tracking-tight text-white select-none">
            {theme.footerText}
          </span>
        ) : (
          <div className="w-full flex justify-end">
            <div className="w-5 h-5 relative flex items-center justify-center shrink-0">
              <Image src="/ic_repeat.svg" alt="repeat" width={20} height={20} className="object-contain" />
            </div>
          </div>
        )}
      </div>

      {/* Seamless Seam Fill Cover for bottom footer tab */}
      <div className="absolute -bottom-[2px] left-[17px] w-[38px] h-[3px] z-25 pointer-events-none" style={{ backgroundColor: theme.bg }} />

      {/* Bottom Outset Puzzle Notch Protrusion */}
      <div 
        className="absolute -bottom-[11px] left-[16px] w-[40px] h-[11.5px] z-30"
        style={{
          backgroundColor: theme.bg,
          borderBottom: `2px solid ${theme.border}`,
          borderLeft: `2px solid ${theme.border}`,
          borderRight: `2px solid ${theme.border}`,
          clipPath: 'polygon(0 0, 8px 100%, 32px 100%, 40px 0)',
        }}
      />
    </div>
  );
};
