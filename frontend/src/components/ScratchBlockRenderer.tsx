'use client';

import React from 'react';
import { CodeBlock } from './BlocklyEditor';
import { 
  IconArrowRight, 
  IconArrowLeft, 
  IconCornerUpRight, 
  IconRotate, 
  IconCoins, 
  IconTrash, 
  IconPlus,
  IconSparkles
} from '@tabler/icons-react';

interface ScratchBlockRendererProps {
  block: CodeBlock;
  index: number;
  isLast?: boolean;
  isActive?: boolean;
  isPalette?: boolean;
  onRemove?: () => void;
  onStepValueChange?: (val: number) => void;
  onRepeatCountChange?: (val: number) => void;
}

const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  events: { fill: '#FFBF00', stroke: '#CC9900', text: '#593e00' },
  motion: { fill: '#4C97FF', stroke: '#3373CC', text: '#ffffff' },
  looks: { fill: '#9966FF', stroke: '#774DCB', text: '#ffffff' },
  sound: { fill: '#CF63CF', stroke: '#BD42BD', text: '#ffffff' },
  control: { fill: '#FFAB19', stroke: '#CF8B17', text: '#ffffff' },
  vars: { fill: '#FF8C1A', stroke: '#DB6E00', text: '#ffffff' },
  html: { fill: '#59C059', stroke: '#389438', text: '#ffffff' },
};

export const ScratchBlockRenderer: React.FC<ScratchBlockRendererProps> = ({
  block,
  index,
  isLast = false,
  isActive = false,
  isPalette = false,
  onRemove,
  onStepValueChange,
  onRepeatCountChange,
}) => {
  const colors = CATEGORY_COLORS[block.category] || CATEGORY_COLORS.motion;

  // Render Green Flag Event Hat Block
  if (block.type === 'when_flag_clicked') {
    return (
      <div 
        className={`relative inline-flex items-center filter drop-shadow-md transition-transform ${
          isActive ? 'scale-105 z-30 ring-4 ring-amber-400 rounded-2xl' : 'hover:scale-[1.02]'
        }`}
        style={{ width: isPalette ? '180px' : '212px', height: isPalette ? '56px' : '64px' }}
      >
        <svg viewBox="0 0 212 104" className="w-full h-full absolute inset-0 preserve-3d">
          {/* Hat shape top arch + bottom puzzle notch */}
          <path 
            d="M8.99667 91.9998H21.4721C23.6242 91.9998 25.7051 92.7713 27.337 94.1743L36.2141 101.806C37.8461 103.209 39.9269 103.98 42.0791 103.98H60.9299C63.1428 103.98 65.2781 103.165 66.9275 101.689L75.2002 94.2906C76.8496 92.8154 78.9849 91.9998 81.1978 91.9998H151.191V23.9999H142.449C142.449 23.9999 124.664 0.38623 73.741 0.38623C22.8184 0.38623 0 23.9999 0 23.9999V83.0032C0 87.9719 4.02794 91.9998 8.99667 91.9998Z" 
            fill={colors.fill} 
          />
          <path 
            d="M73.7412 1.38623C99.0407 1.38627 116.052 7.25042 126.712 13.0708C132.045 15.9826 135.796 18.8884 138.206 21.0542C139.411 22.137 140.281 23.0349 140.845 23.6567C141.127 23.9676 141.333 24.2094 141.466 24.3706C141.532 24.4512 141.581 24.5124 141.611 24.5513C141.627 24.5706 141.637 24.5848 141.644 24.5933L141.65 24.6011L141.95 24.9995H150.191V90.9995H81.1982C78.7394 90.9995 76.366 91.9062 74.5332 93.5454L66.2607 100.944C64.7947 102.255 62.8966 102.98 60.9297 102.98H42.0791C40.1662 102.98 38.3168 102.294 36.8662 101.047L27.9893 93.4155C26.1759 91.8566 23.863 90.9995 21.4717 90.9995H8.99707C4.58071 90.9995 1.00014 87.4197 1 83.0034V24.4194C1.17048 24.2561 1.41879 24.0231 1.74609 23.731C2.45004 23.1026 3.51894 22.1981 4.96289 21.1089C7.85155 18.93 12.2413 16.0125 18.2139 13.0913C30.1548 7.25101 48.4406 1.38623 73.7412 1.38623Z" 
            stroke={colors.stroke} 
            strokeWidth="3" 
          />
          {/* Extended Hat Header */}
          <path d="M203.003 24H149V92H203.003C207.972 92 212 87.972 212 83.0033V32.9967C212 28.028 207.972 24 203.003 24Z" fill={colors.fill} />
          <path d="M203.003 25C207.419 25 211 28.5806 211 32.9971V83.0029C211 87.4194 207.419 91 203.003 91H150V25H203.003Z" stroke={colors.stroke} strokeWidth="3" />
        </svg>

        {/* Content Overlay */}
        <div className="relative z-10 flex items-center px-4 pt-4 space-x-2 font-black text-xs text-slate-950 uppercase tracking-wide select-none">
          {/* Green Flag SVG Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M20.8 3.7C20.4 3.5 19.9 3.6 19.6 3.9C17.6 5.5 14.8 5.5 12.8 3.9C10.5 2 7.2 1.6 4.5 2.9V2.5C4.5 1.9 4 1.5 3.5 1.5C3 1.5 2.5 1.9 2.5 2.5V21.3C2.5 21.8 3 22.3 3.5 22.3H3.6C4.1 22.3 4.6 21.8 4.6 21.3V14.9C5.6 14.2 6.7 13.7 8 13.6C9.2 13.6 10.4 14 11.4 14.8C14.3 17.1 18.4 17.1 21.2 14.8C21.5 14.6 21.6 14.3 21.6 13.9V4.7C21.6 4.2 21.3 3.8 20.8 3.7Z" fill="#2E7D32"/>
            <path d="M20.5 13.9C18 16 14.4 16 11.9 14C10.8 13.1 9.4 12.6 7.9 12.6C6.7 12.7 5.6 13.1 4.5 13.7V4C7 2.6 10 2.9 12.2 4.6C14.6 6.5 17.9 6.5 20.3 4.6Z" fill="#4CAF50"/>
          </svg>
          <span>WHEN CLICKED</span>
          {onRemove && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="ml-auto p-1 hover:text-red-700 transition"
              title="Remove Block"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Standard Interlocking Scratch Instruction Block
  const isEndBlock = isLast && !isPalette;

  return (
    <div 
      className={`relative inline-flex items-center filter drop-shadow-md transition-transform ${
        isActive ? 'scale-105 z-30 ring-4 ring-amber-400 rounded-xl' : 'hover:scale-[1.02]'
      }`}
      style={{ height: '44px', minWidth: '160px' }}
    >
      <svg viewBox="0 0 112 80" preserveAspectRatio="none" className="w-full h-full absolute inset-0 preserve-3d">
        {/* Top Notch + Bottom Notch puzzle-piece path */}
        {isEndBlock ? (
          <path 
            d="M21.4985 0H8.99668C4.02795 0 0 4.02795 0 8.99668V59.0033C0 63.972 4.02796 68 8.99669 68H77.7615H89.1911V0H81.0038C78.9082 0 76.8784 0.731538 75.2646 2.06837L66.2558 9.53103C64.642 10.8679 62.6121 11.5994 60.5166 11.5994H41.9858C39.8903 11.5994 37.8604 10.8679 36.2466 9.53102L27.2378 2.06836C25.624 0.731537 23.5941 0 21.4985 0Z" 
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth="3"
          />
        ) : (
          <path 
            d="M0 8.99668C0 4.02795 4.02795 0 8.99668 0H21.4985C23.5941 0 25.624 0.731537 27.2378 2.06836L36.2466 9.53102C37.8604 10.8679 39.8903 11.5994 41.9858 11.5994H60.5166C62.6121 11.5994 64.642 10.8679 66.2558 9.53103L75.2646 2.06837C76.8784 0.731538 78.9082 0 81.0038 0H89.1911V68H81.1978C78.9849 68 76.8496 68.8156 75.2002 70.2908L66.9275 77.6896C65.2781 79.1648 63.1428 79.9803 60.9299 79.9803H42.0791C39.9269 79.9803 37.8461 79.2089 36.2141 77.8059L27.337 70.1744C25.7051 68.7715 23.6242 68 21.4721 68H8.99667C4.02794 68 0 63.972 0 59.0033V8.99668Z" 
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth="3"
          />
        )}
      </svg>

      {/* Content Label + Icon Overlay */}
      <div className="relative z-10 flex items-center px-3.5 space-x-2 font-black text-xs text-white uppercase tracking-wide select-none w-full justify-between">
        <div className="flex items-center space-x-1.5 truncate">
          {block.type === 'move_forward' && <IconArrowRight className="w-4 h-4 text-white shrink-0" />}
          {block.type === 'turn_left' && <IconCornerUpRight className="w-4 h-4 text-white shrink-0 -scale-x-100" />}
          {block.type === 'turn_right' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M22.68 12.2C21.41 12.83 13.72 12.83 13.72 12.83H12.35L13.68 8.84L8.54 8.87L7.2 10.6C6.9 11.36 6.81 12.17 6.9 12.98C7.74 15.22 9.58 16.98 12 17.74L14.18 20.08L13.46 21.65L11.84 22.26C7.29 21.08 3.74 18 2.25 8.78L5.08 4.64L9.66 2.5L17.38 4.18L22.94 10.81Z" fill="#29B6F6"/>
            </svg>
          )}
          {block.type === 'turn_around' && <IconRotate className="w-4 h-4 text-white shrink-0" />}
          {block.type === 'collect_coin' && <IconCoins className="w-4 h-4 text-amber-300 shrink-0" />}

          <span>{block.label}</span>
        </div>

        {/* Input step numeric badge if applicable */}
        {block.stepValue !== undefined && (
          <div className="px-2 py-0.5 bg-black/30 rounded-full font-mono text-amber-300 text-[11px] font-black border border-white/20 ml-2 shrink-0">
            {block.stepValue}
          </div>
        )}

        {isPalette && <IconPlus className="w-3.5 h-3.5 text-white/80 shrink-0 ml-1" />}

        {!isPalette && onRemove && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 hover:text-red-300 transition text-white/80 shrink-0 ml-1"
            title="Remove Block"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
