'use client';

import React from 'react';
import Image from 'next/image';
import { 
  IconArrowRight, 
  IconCornerUpRight, 
  IconArrowForwardUp,
  IconArrowBackUp,
  IconRotate, 
  IconCoins, 
  IconTrash,
  IconVolume,
  IconVariable,
  IconCode,
  IconMessage,
  IconSparkles,
  IconBell,
  IconFlag,
  IconPuzzle
} from '@tabler/icons-react';

export interface PureCSSBlockProps {
  type: string;
  label: string;
  category?: 'motion' | 'looks' | 'sound' | 'events' | 'control' | 'vars' | 'html';
  icon?: React.ReactNode;
  stepValue?: number;
  isActive?: boolean;
  isPalette?: boolean;
  onRemove?: () => void;
  onStepValueChange?: (val: number) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; badgeBorder: string }> = {
  motion: { bg: 'bg-[#4C97FF]', border: 'border-[#3373CC]', text: 'text-white', badgeBorder: 'border-[#3373CC]' },
  looks: { bg: 'bg-[#9966FF]', border: 'border-[#774DCB]', text: 'text-white', badgeBorder: 'border-[#774DCB]' },
  sound: { bg: 'bg-[#CF63CF]', border: 'border-[#BD42BD]', text: 'text-white', badgeBorder: 'border-[#BD42BD]' },
  events: { bg: 'bg-[#FFBF00]', border: 'border-[#CC9900]', text: 'text-slate-900', badgeBorder: 'border-[#CC9900]' },
  vars: { bg: 'bg-[#FF8C1A]', border: 'border-[#DB6E00]', text: 'text-white', badgeBorder: 'border-[#DB6E00]' },
  html: { bg: 'bg-[#0F9D58]', border: 'border-[#0B7B44]', text: 'text-white', badgeBorder: 'border-[#0B7B44]' },
};

const HEX_BG_COLORS: Record<string, string> = {
  motion: '#4C97FF',
  looks: '#9966FF',
  sound: '#CF63CF',
  events: '#FFBF00',
  vars: '#FF8C1A',
  html: '#0F9D58',
};

const HEX_BORDER_COLORS: Record<string, string> = {
  motion: '#3373CC',
  looks: '#774DCB',
  sound: '#BD42BD',
  events: '#CC9900',
  vars: '#DB6E00',
  html: '#0B7B44',
};

const renderBlockIcon = (type: string, category: string) => {
  switch (type) {
    case 'move_forward': return <IconArrowRight className="w-4 h-4 shrink-0" />;
    case 'turn_left': return <IconCornerUpRight className="w-4 h-4 shrink-0 -scale-x-100" />;
    case 'turn_right': return <IconArrowForwardUp className="w-4 h-4 shrink-0" />;
    case 'turn_around': return <IconRotate className="w-4 h-4 shrink-0" />;
    case 'jump': return <IconCornerUpRight className="w-4 h-4 shrink-0" />;
    case 'collect_coin': return <IconCoins className="w-4 h-4 text-amber-300 shrink-0" />;
    case 'go_to_start': return <IconArrowBackUp className="w-4 h-4 shrink-0" />;
    case 'when_flag_clicked': return (
      <div className="w-5 h-5 relative flex items-center justify-center shrink-0 filter drop-shadow">
        <Image src="/play.svg" alt="play" fill className="object-contain" />
      </div>
    );
    case 'when_space_pressed': 
    case 'if_touching_path': return <IconFlag className="w-4 h-4 shrink-0" />;
    case 'say_hello':
    case 'say_step': return <IconMessage className="w-4 h-4 shrink-0" />;
    case 'hide':
    case 'show':
    case 'change_size': return <IconSparkles className="w-4 h-4 shrink-0" />;
    case 'play_sound':
    case 'stop_sounds': return <IconBell className="w-4 h-4 shrink-0" />;
    case 'set_variable':
    case 'change_variable': return <IconPuzzle className="w-4 h-4 shrink-0" />;
    default:
      if (category === 'html') return <IconCode className="w-4 h-4 shrink-0" />;
      if (category === 'sound') return <IconBell className="w-4 h-4 shrink-0" />;
      if (category === 'looks') return <IconMessage className="w-4 h-4 shrink-0" />;
      if (category === 'vars') return <IconPuzzle className="w-4 h-4 shrink-0" />;
      return null;
  }
};

export const PureCSSBlock: React.FC<PureCSSBlockProps> = ({
  type,
  label,
  category = 'motion',
  icon,
  stepValue,
  isActive = false,
  isPalette = false,
  onRemove,
  onStepValueChange,
}) => {
  const colorScheme = CATEGORY_COLORS[category] || CATEGORY_COLORS.motion;
  const hexBg = HEX_BG_COLORS[category] || HEX_BG_COLORS.motion;
  const hexBorder = HEX_BORDER_COLORS[category] || HEX_BORDER_COLORS.motion;

  // Event Hat Block (when flag clicked): Standard event block body + inverted top bow hat arc
  if (type === 'when_flag_clicked') {
    return (
      <div className={`relative inline-block ${isPalette ? 'mt-4 mb-1' : 'mt-4 mb-0'}`}>
        {/* Inverted Top Bow Hat Arc (Width 90px, offset left 12px, matching 2px #CC9900 stroke) */}
        <svg 
          className="absolute -top-[13px] left-[12px] w-[90px] h-[15px] z-20 pointer-events-none" 
          viewBox="0 0 90 15" 
          fill="none"
        >
          {/* Fill path */}
          <path 
            d="M 0 15 C 15 0.5, 45 0.5, 90 15 Z" 
            fill="#FFBF00" 
          />
          {/* Top curve border stroke matching 2px rectangle border */}
          <path 
            d="M 0 15 C 15 0.5, 45 0.5, 90 15" 
            fill="none" 
            stroke="#CC9900" 
            strokeWidth="2" 
          />
        </svg>

        {/* Seam Cover removing top border line under inverted bow */}
        <div className="absolute top-0 left-[13px] w-[88px] h-[3px] bg-[#FFBF00] z-25 pointer-events-none" />

        {/* Standard Block Body (height 44px, bg-[#FFBF00], border-[#CC9900]) */}
        <div 
          className={`relative inline-flex items-center bg-[#FFBF00] border-2 border-[#CC9900] rounded-md px-4 py-2 select-none transition-colors shadow-md ${
            isActive ? 'ring-4 ring-amber-400 z-30 shadow-lg' : 'hover:brightness-105 hover:shadow-lg'
          }`}
          style={{
            minWidth: isPalette ? '150px' : '175px',
            height: '44px',
          }}
        >
          {/* Content flexbox container */}
          <div className="flex items-center justify-between w-full space-x-2 text-slate-900 font-semibold text-xs leading-none relative z-20">
            <div className="flex items-center space-x-1.5 truncate h-full">
              <span className="lowercase font-medium text-sm tracking-tight leading-none">when</span>
              {/* play.svg red button icon scaled up */}
              <div className="w-7.5 h-7.5 relative flex items-center justify-center shrink-0 filter drop-shadow">
                <Image src="/play.svg" alt="play" width={30} height={30} className="object-contain scale-125" />
              </div>
              <span className="lowercase font-medium text-sm tracking-tight leading-none">clicked</span>
            </div>

            {!isPalette && onRemove && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1 hover:text-red-700 transition text-slate-900/80 shrink-0 ml-1"
                title="Remove Block"
              >
                <IconTrash className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Seamless Seam Fill Cover for bottom tab */}
        <div 
          className="absolute -bottom-[2px] left-[17px] w-[38px] h-[3px] bg-[#FFBF00] z-25 pointer-events-none" 
        />

        {/* Bottom Outset Puzzle Notch Protrusion */}
        <div 
          className="absolute -bottom-[11px] left-[16px] w-[40px] h-[11.5px] bg-[#FFBF00] border-b-2 border-x-2 border-[#CC9900] z-30"
          style={{ clipPath: 'polygon(0 0, 8px 100%, 32px 100%, 40px 0)' }}
        />
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${isPalette ? 'my-1' : 'my-0'}`}>
      {/* Main Block Body */}
      <div 
        className={`relative inline-flex items-center ${colorScheme.bg} border-2 ${colorScheme.border} rounded-md px-4 py-2 select-none transition-colors shadow-md ${
          isActive ? 'ring-4 ring-amber-400 z-30 shadow-lg' : 'hover:brightness-105 hover:shadow-lg'
        }`}
        style={{
          minWidth: isPalette ? '150px' : '175px',
          height: '44px',
          clipPath: 'polygon(0 0, 16px 0, 24px 9.5px, 48px 9.5px, 56px 0, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        {/* Content flexbox container */}
        <div className={`flex items-center justify-between w-full space-x-2 ${colorScheme.text} font-semibold text-xs leading-none relative z-20`}>
          <div className="flex items-center space-x-1.5 truncate h-full">
            {renderBlockIcon(type, category)}
            <span className="lowercase font-medium text-sm tracking-tight leading-none">{label}</span>
          </div>

          {/* Input step badge */}
          {stepValue !== undefined && (
            <div className="flex items-center space-x-1.5 shrink-0 ml-1.5 h-full">
              {isPalette ? (
                <div className={`h-7 min-w-[32px] px-2.5 flex items-center justify-center bg-white text-[#575E75] rounded-full font-mono text-sm font-medium border-2 ${colorScheme.badgeBorder} shadow-inner leading-none`}>
                  {stepValue}
                </div>
              ) : (
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={stepValue}
                  onChange={(e) => onStepValueChange && onStepValueChange(parseInt(e.target.value) || 1)}
                  className={`h-7 w-11 px-1 bg-white text-[#575E75] rounded-full font-mono text-center border-2 ${colorScheme.badgeBorder} font-medium text-sm outline-none focus:ring-2 focus:ring-amber-400 shadow-inner leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                />
              )}
              <span className={`text-sm font-medium ${colorScheme.text} lowercase leading-none`}>steps</span>
            </div>
          )}

          {!isPalette && onRemove && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1 hover:text-red-200 transition opacity-90 hover:opacity-100 shrink-0 ml-1"
              title="Remove Block"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Seamless Seam Fill Cover */}
      <div 
        className="absolute -bottom-[2px] left-[17px] w-[38px] h-[3px] z-25 pointer-events-none" 
        style={{ backgroundColor: hexBg }}
      />

      {/* Bottom Outset Puzzle Notch Protrusion */}
      <div 
        className="absolute -bottom-[11px] left-[16px] w-[40px] h-[11.5px] border-b-2 border-x-2 z-30"
        style={{ 
          backgroundColor: hexBg, 
          borderColor: hexBorder,
          clipPath: 'polygon(0 0, 8px 100%, 32px 100%, 40px 0)' 
        }}
      />
    </div>
  );
};
