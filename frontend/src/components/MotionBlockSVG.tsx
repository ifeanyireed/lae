'use client';

import React from 'react';
import { 
  IconArrowRight, 
  IconCornerUpRight, 
  IconArrowForwardUp,
  IconRotate, 
  IconCoins, 
  IconTrash, 
  IconPlus,
  IconGripVertical
} from '@tabler/icons-react';

export interface MotionBlockSVGProps {
  type: string;
  label: string;
  stepValue?: number;
  isActive?: boolean;
  isPalette?: boolean;
  onRemove?: () => void;
  onStepValueChange?: (val: number) => void;
}

export const MotionBlockSVG: React.FC<MotionBlockSVGProps> = ({
  type,
  label,
  stepValue,
  isActive = false,
  isPalette = false,
  onRemove,
  onStepValueChange,
}) => {
  return (
    <div 
      className={`relative inline-flex items-center select-none filter drop-shadow-md transition-all ${
        isActive ? 'scale-105 z-30 ring-4 ring-amber-400 rounded-xl' : 'hover:scale-[1.02]'
      }`}
      style={{ height: '48px', minWidth: isPalette ? '160px' : '185px' }}
    >
      {/* Single combined vector path for 100% blue block fill without clip-path collisions */}
      <svg 
        viewBox="0 0 212 80" 
        preserveAspectRatio="none" 
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        <path 
          d="M0 8.99668C0 4.02795 4.02795 0 8.99668 0H21.4985C23.5941 0 25.624 0.731537 27.2378 2.06836L36.2466 9.53102C37.8604 10.8679 39.8903 11.5994 41.9858 11.5994H60.5166C62.6121 11.5994 64.642 10.8679 66.2558 9.53103L75.2646 2.06837C76.8784 0.731538 78.9082 0 81.0038 0H203.003C207.972 0 212 4.02795 212 8.99668V59.0033C212 63.972 207.972 68 203.003 68H81.1978C78.9849 68 76.8496 68.8156 75.2002 70.2908L66.9275 77.6896C65.2781 79.1648 63.1428 79.9803 60.9299 79.9803H42.0791C39.9269 79.9803 37.8461 79.2089 36.2141 77.8059L27.337 70.1744C25.7051 68.7715 23.6242 68 21.4721 68H8.99667C4.02794 68 0 63.972 0 59.0033V8.99668Z" 
          fill="#4C97FF"
        />
        <path 
          d="M8.99707 1H21.499C23.3615 1.00011 25.1653 1.65073 26.5996 2.83887L35.6084 10.3008C37.4014 11.7861 39.657 12.5995 41.9854 12.5996H60.5166C62.8451 12.5996 65.1004 11.7862 66.8936 10.3008L75.9023 2.83887C77.3368 1.65063 79.1413 1 81.0039 1H203.003C207.419 1 211 4.58063 211 8.99707V59.0029C211 63.4194 207.419 67 203.003 67H81.1982C78.7394 67 76.366 67.9058 74.5332 69.5449L66.2607 76.9443C64.7947 78.2555 62.8965 78.9805 60.9297 78.9805H42.0791C40.1663 78.9805 38.3167 78.2948 36.8662 77.0479L27.9893 69.416C26.1759 67.8571 23.863 67 21.4717 67H8.99707C4.58063 67 1 63.4194 1 59.0029V8.99707C1 4.71872 4.35986 1.22503 8.58496 1.01074L8.99707 1Z" 
          stroke="#3373CC" 
          strokeWidth="3"
        />
      </svg>

      {/* Content overlay styled exactly like motion_move.svg */}
      <div className="relative z-10 w-full h-full flex items-center justify-between px-4 text-xs font-semibold text-white tracking-wide leading-none">
        <div className="flex items-center space-x-1.5 truncate h-full">
          {type === 'move_forward' && <IconArrowRight className="w-4 h-4 text-white shrink-0" />}
          {type === 'turn_left' && <IconCornerUpRight className="w-4 h-4 text-white shrink-0 -scale-x-100" />}
          {type === 'turn_right' && <IconArrowForwardUp className="w-4 h-4 text-white shrink-0" />}
          {type === 'turn_around' && <IconRotate className="w-4 h-4 text-white shrink-0" />}
          {type === 'collect_coin' && <IconCoins className="w-4 h-4 text-amber-300 shrink-0" />}

          <span className="font-semibold text-xs lowercase leading-none">{label}</span>
        </div>

        {/* White rounded pill step input badge with enlarged height & font size */}
        {stepValue !== undefined ? (
          <div className="flex items-center space-x-1.5 shrink-0 ml-1.5 h-full">
            {isPalette ? (
              <div className="h-7 min-w-[32px] px-2.5 flex items-center justify-center bg-white text-[#575E75] rounded-full font-mono text-sm font-bold border-2 border-[#3373CC] shadow-inner leading-none">
                {stepValue}
              </div>
            ) : (
              <input
                type="number"
                min={1}
                max={99}
                value={stepValue}
                onChange={(e) => onStepValueChange && onStepValueChange(parseInt(e.target.value) || 1)}
                className="h-7 w-11 px-1 bg-white text-[#575E75] rounded-full font-mono text-center border-2 border-[#3373CC] font-bold text-sm outline-none focus:ring-2 focus:ring-amber-400 shadow-inner leading-none"
              />
            )}
            <span className="text-xs font-semibold text-white lowercase leading-none">steps</span>
          </div>
        ) : null}

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
  );
};
