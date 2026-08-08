'use client';

import React from 'react';
import { CodeBlock } from './BlocklyEditor';
import { 
  IconArrowRight, 
  IconCornerUpRight, 
  IconRotate, 
  IconCoins, 
  IconTrash, 
  IconPlus,
  IconSparkles,
  IconGripVertical
} from '@tabler/icons-react';

export interface ScratchBlockComponentProps {
  block: CodeBlock | Omit<CodeBlock, 'instanceId'>;
  index: number;
  isLast?: boolean;
  isActive?: boolean;
  isPalette?: boolean;
  onRemove?: () => void;
  onStepValueChange?: (val: number) => void;
  onRepeatCountChange?: (val: number) => void;
}

export const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  events: { fill: '#FFBF00', stroke: '#CC9900', text: '#3E2723' },
  motion: { fill: '#4C97FF', stroke: '#3373CC', text: '#FFFFFF' },
  looks: { fill: '#9966FF', stroke: '#774DCB', text: '#FFFFFF' },
  sound: { fill: '#CF63CF', stroke: '#BD42BD', text: '#FFFFFF' },
  control: { fill: '#FFAB19', stroke: '#CF8B17', text: '#FFFFFF' },
  vars: { fill: '#FF8C1A', stroke: '#DB6E00', text: '#FFFFFF' },
  html: { fill: '#59C059', stroke: '#389438', text: '#FFFFFF' },
};

import { EventHatBlock } from './scratch_blocks/EventHatBlock';
import { InstructionBlock } from './scratch_blocks/InstructionBlock';
import { LoopBlock } from './scratch_blocks/LoopBlock';

export const ScratchBlockComponent: React.FC<ScratchBlockComponentProps> = ({
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

  // 1. EVENT HAT BLOCK (when_flag_clicked)
  if (block.type === 'when_flag_clicked') {
    return (
      <EventHatBlock 
        fillColor={colors.fill} 
        strokeColor={colors.stroke}
        className={isActive ? 'scale-105 z-30 ring-4 ring-amber-400 rounded-2xl' : 'hover:scale-[1.02]'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M20.8 3.7C20.4 3.5 19.9 3.6 19.6 3.9C17.6 5.5 14.8 5.5 12.8 3.9C10.5 2 7.2 1.6 4.5 2.9V2.5C4.5 1.9 4 1.5 3.5 1.5C3 1.5 2.5 1.9 2.5 2.5V21.3C2.5 21.8 3 22.3 3.5 22.3H3.6C4.1 22.3 4.6 21.8 4.6 21.3V14.9C5.6 14.2 6.7 13.7 8 13.6C9.2 13.6 10.4 14 11.4 14.8C14.3 17.1 18.4 17.1 21.2 14.8C21.5 14.6 21.6 14.3 21.6 13.9V4.7C21.6 4.2 21.3 3.8 20.8 3.7Z" fill="#2E7D32"/>
          <path d="M20.5 13.9C18 16 14.4 16 11.9 14C10.8 13.1 9.4 12.6 7.9 12.6C6.7 12.7 5.6 13.1 4.5 13.7V4C7 2.6 10 2.9 12.2 4.6C14.6 6.5 17.9 6.5 20.3 4.6Z" fill="#4CAF50"/>
        </svg>
        <span className="font-extrabold font-mono tracking-tight text-slate-950">WHEN CLICKED</span>
        {!isPalette && onRemove && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="ml-auto p-1 hover:text-red-700 transition"
            title="Remove Block"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </EventHatBlock>
    );
  }

  // 2. EXPANDABLE & STRETCHABLE C-SHAPE REPEAT / CONTROL LOOP BLOCK
  if (block.type === 'repeat' || block.type === 'forever' || block.type === 'if_then') {
    return (
      <LoopBlock
        fillColor={colors.fill}
        strokeColor={colors.stroke}
        className={isActive ? 'scale-102 z-30 ring-4 ring-amber-400 rounded-2xl' : 'hover:scale-[1.01]'}
        headerContent={
          <>
            <div className="flex items-center space-x-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M23.3 11C23 11.6 22.4 12 21.8 12H20.2C20.1 13.3 19.7 14.5 19.1 15.6C18.2 17.3 16.8 18.8 15 19.7C13.3 20.6 11.4 20.9 9.5 20.6C7.7 20.3 6 19.5 4.6 18.3C3.9 17.6 3.9 16.4 4.6 15.7C5.2 15.1 6.2 15 6.9 15.5C7.9 16.1 8.9 16.4 9.9 16.4C10.9 16.4 11.8 16.1 12.6 15.5C13.7 14.7 14.4 13.4 14.4 12H12.9C12 12 11.2 11.3 11.2 10.3C11.2 9.9 11.4 9.4 11.7 9.1L16.1 4.7C16.8 4.1 17.8 4.1 18.5 4.7L23 9.2C23.5 9.7 23.6 10.4 23.3 11Z" fill="#FFFFFF"/>
              </svg>
              <span>{block.type === 'repeat' ? 'REPEAT' : block.type === 'forever' ? 'FOREVER' : 'IF PATH'}</span>
              {block.type === 'repeat' && (
                <div className="flex items-center space-x-1 ml-2">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={block.repeatCount ?? 2}
                    onChange={(e) => onRepeatCountChange && onRepeatCountChange(parseInt(e.target.value) || 1)}
                    className="w-10 px-1 py-0.5 rounded-full bg-black/40 text-amber-300 font-mono text-center border border-white/40 font-black text-xs outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-[10px] text-amber-100 font-bold uppercase">TIMES</span>
                </div>
              )}
            </div>
            {!isPalette && onRemove && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1 hover:text-red-300 transition text-white/80"
                title="Remove Block"
              >
                <IconTrash className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        }
      >
        <div className="text-[10px] font-extrabold text-amber-200/90 flex items-center space-x-1.5 bg-amber-900/40 px-2.5 py-1 rounded-lg border border-amber-500/30 w-fit">
          <IconCornerUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Enclosed loop action (Repeats {block.repeatCount ?? 2}x)</span>
        </div>
      </LoopBlock>
    );
  }

  // 3. STANDARD INSTRUCTION BLOCK
  return (
    <InstructionBlock
      fillColor={colors.fill}
      strokeColor={colors.stroke}
      isLast={isLast}
      className={isActive ? 'scale-105 z-30 ring-4 ring-amber-400 rounded-xl' : 'hover:scale-[1.02]'}
      style={{ minWidth: isPalette ? '140px' : '160px' }}
    >
      <div className="flex items-center space-x-1.5 truncate">
        <IconGripVertical className="w-3.5 h-3.5 text-white/70 shrink-0" />
        {block.type === 'move_forward' && <IconArrowRight className="w-4 h-4 text-white shrink-0" />}
        {block.type === 'turn_left' && <IconCornerUpRight className="w-4 h-4 text-white shrink-0 -scale-x-100" />}
        {block.type === 'turn_right' && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M22.68 12.2C21.41 12.83 13.72 12.83 13.72 12.83H12.35L13.68 8.84L8.54 8.87L7.2 10.6C6.9 11.36 6.81 12.17 6.9 12.98C7.74 15.22 9.58 16.98 12 17.74L14.18 20.08L13.46 21.65L11.84 22.26C7.29 21.08 3.74 18 2.25 8.78L5.08 4.64L9.66 2.5L17.38 4.18L22.94 10.81Z" fill="#FFFFFF"/>
          </svg>
        )}
        {block.type === 'turn_around' && <IconRotate className="w-4 h-4 text-white shrink-0" />}
        {block.type === 'collect_coin' && <IconCoins className="w-4 h-4 text-amber-300 shrink-0" />}
        <span>{block.label}</span>
      </div>

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
    </InstructionBlock>
  );
};
