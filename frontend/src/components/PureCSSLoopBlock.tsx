'use client';

import React from 'react';
import Image from 'next/image';
import { IconTrash } from '@tabler/icons-react';

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
      {/* 1. TOP HEADER BAR (Matching loop_top.svg with top notch cutout & bottom outset tab) */}
      <div 
        className="relative flex items-center justify-between bg-[#FFAB19] border-2 border-[#CF8B17] rounded-t-md rounded-br-md rounded-bl-none px-4 py-2 text-[#575E75] font-semibold text-xs leading-none shadow-md z-20"
        style={{
          minWidth: isPalette ? '180px' : '220px',
          height: '44px',
          clipPath: 'polygon(0 0, 16px 0, 24px 9.5px, 48px 9.5px, 56px 0, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        <div className="flex items-center space-x-2 text-white truncate h-full z-10">
          <span className="lowercase font-medium text-sm tracking-tight text-white leading-none">
            {type === 'repeat' ? 'repeat' : type === 'forever' ? 'forever' : 'if path'}
          </span>

          {type === 'repeat' && (
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
            title="Remove Loop Block"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Outer Tab at bottom of top header bar (aligned with nested block top notch at X = 24px spine + 16px = 40px) */}
      <div className="absolute top-[42px] left-[41px] w-[38px] h-[3px] bg-[#FFAB19] z-25 pointer-events-none" />
      <div 
        className="absolute top-[44px] left-[40px] w-[40px] h-[11.5px] bg-[#FFAB19] border-b-2 border-x-2 border-[#CF8B17] z-30"
        style={{ clipPath: 'polygon(0 0, 8px 100%, 32px 100%, 40px 0)' }}
      />

      {/* 2. INNER C-BRACKET SPINE & NESTED CHILDREN AREA */}
      <div className={`relative flex items-stretch transition-all duration-200 ease-out my-0 ${
        isDragOver ? 'min-h-[88px]' : 'min-h-[44px]'
      }`}>
        {/* Vertical C-Spine (width 24px) */}
        <div className="w-[24px] bg-[#FFAB19] border-l-2 border-r-2 border-[#CF8B17] shrink-0 relative z-10 transition-all duration-200 ease-out" />

        {/* Seam Covers removing horizontal border lines between top header, C-spine, and bottom footer */}
        <div className="absolute -top-[2px] left-[1px] w-[22px] h-[3px] bg-[#FFAB19] z-25 pointer-events-none" />
        <div className="absolute -bottom-[2px] left-[1px] w-[22px] h-[3px] bg-[#FFAB19] z-25 pointer-events-none" />

        {/* Inner Top-Left Corner Curved Fillet (Subtle 6px radius, 1.5px stroke) */}
        <svg className="absolute -top-[1px] left-[23.5px] w-1.5 h-1.5 z-25 pointer-events-none" viewBox="0 0 6 6" fill="none">
          <path d="M 0 0 L 6 0 C 3 0, 0 3, 0 6 Z" fill="#FFAB19" />
          <path d="M 6 0 C 3 0, 0 3, 0 6" fill="none" stroke="#CF8B17" strokeWidth="1.5" />
        </svg>

        {/* Inner Bottom-Left Corner Curved Fillet (Subtle 6px radius, 1.5px stroke) */}
        <svg className="absolute -bottom-[1px] left-[23.5px] w-1.5 h-1.5 z-25 pointer-events-none" viewBox="0 0 6 6" fill="none">
          <path d="M 0 6 L 6 6 C 3 6, 0 3, 0 0 Z" fill="#FFAB19" />
          <path d="M 6 6 C 3 6, 0 3, 0 0" fill="none" stroke="#CF8B17" strokeWidth="1.5" />
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
              <span>+ Drop here to nest block</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM LOOP FOOTER (Matching loop_bottom.svg with top inner concave notch at X=40px & ic_repeat.svg) */}
      <div 
        className="relative flex items-center justify-end bg-[#FFAB19] border-2 border-[#CF8B17] rounded-b-md px-4 py-2 z-20"
        style={{
          minWidth: isPalette ? '180px' : '220px',
          height: '40px',
          clipPath: 'polygon(0 0, 40px 0, 48px 9.5px, 72px 9.5px, 80px 0, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        {/* ic_repeat.svg icon at bottom right */}
        <div className="w-5 h-5 relative flex items-center justify-center shrink-0">
          <Image src="/ic_repeat.svg" alt="repeat" width={20} height={20} className="object-contain" />
        </div>
      </div>

      {/* Seamless Seam Fill Cover for bottom footer tab (placed outside clipped footer div) */}
      <div className="absolute -bottom-[2px] left-[17px] w-[38px] h-[3px] bg-[#FFAB19] z-25 pointer-events-none" />

      {/* Bottom Outset Puzzle Notch Protrusion (placed outside clipped footer div at X=16px so it is NOT clipped) */}
      <div 
        className="absolute -bottom-[11px] left-[16px] w-[40px] h-[11.5px] bg-[#FFAB19] border-b-2 border-x-2 border-[#CF8B17] z-30"
        style={{ clipPath: 'polygon(0 0, 8px 100%, 32px 100%, 40px 0)' }}
      />
    </div>
  );
};
