'use client';

import React from 'react';
import { 
  IconArrowRight, 
  IconCornerUpRight, 
  IconArrowForwardUp,
  IconRotate, 
  IconCoins, 
  IconTrash
} from '@tabler/icons-react';

export interface PureCSSMotionBlockProps {
  type: string;
  label: string;
  stepValue?: number;
  isActive?: boolean;
  isPalette?: boolean;
  onRemove?: () => void;
  onStepValueChange?: (val: number) => void;
}

export const PureCSSMotionBlock: React.FC<PureCSSMotionBlockProps> = ({
  type,
  label,
  stepValue,
  isActive = false,
  isPalette = false,
  onRemove,
  onStepValueChange,
}) => {
  return (
    <div className={`relative inline-block ${isPalette ? 'my-1' : 'my-0'}`}>
      {/* Main Block Body with true transparent concave top notch cutout */}
      <div 
        className={`relative inline-flex items-center bg-[#4C97FF] border-2 border-[#3373CC] rounded-md px-4 py-2 select-none transition-all shadow-md ${
          isActive ? 'ring-4 ring-amber-400 scale-105 z-30' : 'hover:scale-[1.02]'
        }`}
        style={{
          minWidth: isPalette ? '160px' : '185px',
          height: '44px',
          clipPath: 'polygon(0 0, 16px 0, 24px 9.5px, 48px 9.5px, 56px 0, 100% 0, 100% 100%, 0 100%)',
        }}
      >

        {/* Content flexbox container */}
        <div className="flex items-center justify-between w-full space-x-2 text-white font-semibold text-xs leading-none relative z-20">
          <div className="flex items-center space-x-1.5 truncate h-full">
            {type === 'move_forward' && <IconArrowRight className="w-4 h-4 text-white shrink-0" />}
            {type === 'turn_left' && <IconCornerUpRight className="w-4 h-4 text-white shrink-0 -scale-x-100" />}
            {type === 'turn_right' && <IconArrowForwardUp className="w-4 h-4 text-white shrink-0" />}
            {type === 'turn_around' && <IconRotate className="w-4 h-4 text-white shrink-0" />}
            {type === 'collect_coin' && <IconCoins className="w-4 h-4 text-amber-300 shrink-0" />}

            <span className="lowercase font-medium text-sm tracking-tight leading-none">{label}</span>
          </div>

          {/* Exact input badge matching motion_move.svg */}
          {stepValue !== undefined && (
            <div className="flex items-center space-x-1.5 shrink-0 ml-1.5 h-full">
              {isPalette ? (
                <div className="h-7 min-w-[32px] px-2.5 flex items-center justify-center bg-white text-[#575E75] rounded-full font-mono text-sm font-medium border-2 border-[#3373CC] shadow-inner leading-none">
                  {stepValue}
                </div>
              ) : (
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={stepValue}
                  onChange={(e) => onStepValueChange && onStepValueChange(parseInt(e.target.value) || 1)}
                  className="h-7 w-11 px-1 bg-white text-[#575E75] rounded-full font-mono text-center border-2 border-[#3373CC] font-medium text-sm outline-none focus:ring-2 focus:ring-amber-400 shadow-inner leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              )}
              <span className="text-sm font-medium text-white lowercase leading-none">steps</span>
            </div>
          )}

          {!isPalette && onRemove && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1 hover:text-red-200 transition text-white/90 shrink-0 ml-1"
              title="Remove Block"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Seamless Seam Fill Cover (removes line between main rectangle and bottom tab) */}
      <div className="absolute -bottom-[2px] left-[17px] w-[38px] h-[3px] bg-[#4C97FF] z-25 pointer-events-none" />

      {/* Bottom Outset Puzzle Notch Protrusion (100% aligned to X: 16px -> 56px, width 40px, height 11.5px) */}
      <div 
        className="absolute -bottom-[11px] left-[16px] w-[40px] h-[11.5px] bg-[#4C97FF] border-b-2 border-x-2 border-[#3373CC] z-30"
        style={{ clipPath: 'polygon(0 0, 8px 100%, 32px 100%, 40px 0)' }}
      />
    </div>
  );
};
