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
  IconPuzzle,
  IconFileCode,
  IconBrain,
  IconTag,
  IconHome,
  IconHeading,
  IconTypography,
  IconList,
  IconLink,
  IconPhoto,
} from '@tabler/icons-react';

export interface PureCSSBlockProps {
  type: string;
  label: string;
  category?: 'motion' | 'looks' | 'sound' | 'events' | 'control' | 'vars' | 'html' | 'css' | 'js' | 'javascript' | 'python';
  icon?: React.ReactNode;
  stepValue?: number;
  textValue?: string;
  isActive?: boolean;
  isPalette?: boolean;
  onRemove?: () => void;
  onStepValueChange?: (val: number) => void;
  onTextValueChange?: (val: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; badgeBorder: string }> = {
  motion: { bg: 'bg-[#4C97FF]', border: 'border-[#3373CC]', text: 'text-white', badgeBorder: 'border-[#3373CC]' },
  looks: { bg: 'bg-[#9966FF]', border: 'border-[#774DCB]', text: 'text-white', badgeBorder: 'border-[#774DCB]' },
  sound: { bg: 'bg-[#CF63CF]', border: 'border-[#BD42BD]', text: 'text-white', badgeBorder: 'border-[#BD42BD]' },
  events: { bg: 'bg-[#FFBF00]', border: 'border-[#CC9900]', text: 'text-slate-900', badgeBorder: 'border-[#CC9900]' },
  vars: { bg: 'bg-[#FF8C1A]', border: 'border-[#DB6E00]', text: 'text-white', badgeBorder: 'border-[#DB6E00]' },
  html: { bg: 'bg-[#7E22CE]', border: 'border-[#6B21A8]', text: 'text-white', badgeBorder: 'border-[#6B21A8]' },
};

const HEX_BG_COLORS: Record<string, string> = {
  motion: '#4C97FF',
  looks: '#9966FF',
  sound: '#CF63CF',
  events: '#FFBF00',
  vars: '#FF8C1A',
  html: '#7E22CE',
};

const HEX_BORDER_COLORS: Record<string, string> = {
  motion: '#3373CC',
  looks: '#774DCB',
  sound: '#BD42BD',
  events: '#CC9900',
  vars: '#DB6E00',
  html: '#6B21A8',
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

    // HTML Functional Icons
    case 'doctype': return <IconFileCode className="w-4 h-4 shrink-0 text-white" />;
    case 'html_tag': return <IconCode className="w-4 h-4 shrink-0 text-white" />;
    case 'head_tag': return <IconBrain className="w-4 h-4 shrink-0 text-white" />;
    case 'title_tag': return <IconTag className="w-4 h-4 shrink-0 text-white" />;
    case 'body_tag': return <IconHome className="w-4 h-4 shrink-0 text-white" />;
    case 'h1_tag': return <IconHeading className="w-4 h-4 shrink-0 text-white" />;
    case 'p_tag': return <IconTypography className="w-4 h-4 shrink-0 text-white" />;
    case 'list_tag': return <IconList className="w-4 h-4 shrink-0 text-white" />;
    case 'link_tag': return <IconLink className="w-4 h-4 shrink-0 text-white" />;
    case 'img_tag': return <IconPhoto className="w-4 h-4 shrink-0 text-white" />;

    default:
      if (category === 'html') return <IconCode className="w-4 h-4 shrink-0 text-white" />;
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
  textValue,
  isActive = false,
  isPalette = false,
  onRemove,
  onStepValueChange,
  onTextValueChange,
}) => {
  let colorScheme = CATEGORY_COLORS[category] || CATEGORY_COLORS.motion;
  let hexBg = HEX_BG_COLORS[category] || HEX_BG_COLORS.motion;
  let hexBorder = HEX_BORDER_COLORS[category] || HEX_BORDER_COLORS.motion;

  if (type === 'html_tag') {
    colorScheme = { bg: 'bg-[#2563EB]', border: 'border-[#1D4ED8]', text: 'text-white', badgeBorder: 'border-[#1D4ED8]' };
    hexBg = '#2563EB';
    hexBorder = '#1D4ED8';
  } else if (type === 'head_tag') {
    colorScheme = { bg: 'bg-[#FF9100]', border: 'border-[#E65100]', text: 'text-white', badgeBorder: 'border-[#E65100]' };
    hexBg = '#FF9100';
    hexBorder = '#E65100';
  } else if (type === 'title_tag') {
    colorScheme = { bg: 'bg-[#E91E63]', border: 'border-[#C2185B]', text: 'text-white', badgeBorder: 'border-[#C2185B]' };
    hexBg = '#E91E63';
    hexBorder = '#C2185B';
  } else if (type === 'text_input') {
    colorScheme = { bg: 'bg-[#38BDF8]', border: 'border-[#0284C7]', text: 'text-slate-950', badgeBorder: 'border-[#0284C7]' };
    hexBg = '#38BDF8';
    hexBorder = '#0284C7';
  }

  // Event Hat Block (when flag clicked OR HTML started): Standard event block body + inverted top bow hat arc
  if (type === 'when_flag_clicked' || type === 'when_html_started') {
    const isHtmlHat = type === 'when_html_started';
    const hatFill = isHtmlHat ? '#7E22CE' : '#FFBF00';
    const hatStroke = isHtmlHat ? '#6B21A8' : '#CC9900';
    const textColor = isHtmlHat ? 'text-white' : 'text-slate-900';

    return (
      <div className={`relative inline-block ${isPalette ? 'mt-4 mb-1' : 'mt-4 mb-0'}`}>
        {/* Inverted Top Bow Hat Arc */}
        <svg 
          className="absolute -top-[13px] left-[12px] w-[90px] h-[15px] z-20 pointer-events-none" 
          viewBox="0 0 90 15" 
          fill="none"
        >
          <path 
            d="M 0 15 C 15 0.5, 45 0.5, 90 15 Z" 
            fill={hatFill} 
          />
          <path 
            d="M 0 15 C 15 0.5, 45 0.5, 90 15" 
            fill="none" 
            stroke={hatStroke} 
            strokeWidth="2" 
          />
        </svg>

        {/* Seam Cover removing top border line under inverted bow */}
        <div className="absolute top-0 left-[13px] w-[88px] h-[3px] z-25 pointer-events-none" style={{ backgroundColor: hatFill }} />

        {/* Standard Block Body */}
        <div 
          className={`relative inline-flex items-center border-2 rounded-md px-4 py-2 select-none transition-colors shadow-md ${
            isActive ? 'ring-4 ring-amber-400 z-30 shadow-lg' : 'hover:brightness-105 hover:shadow-lg'
          }`}
          style={{
            minWidth: isPalette ? '140px' : '150px',
            height: '44px',
            backgroundColor: hatFill,
            borderColor: hatStroke,
          }}
        >
          {/* Content flexbox container */}
          <div className={`flex items-center justify-between w-full space-x-2 ${textColor} font-semibold text-xs leading-none relative z-20`}>
            <div className="flex items-center space-x-1.5 truncate h-full">
              {isHtmlHat ? (
                <>
                  <IconCode className="w-4.5 h-4.5 text-amber-300 flex-shrink-0" />
                  <span className="font-extrabold text-sm tracking-wider uppercase leading-none">HTML</span>
                </>
              ) : (
                <>
                  <span className="lowercase font-medium text-sm tracking-tight leading-none">when</span>
                  <div className="w-7.5 h-7.5 relative flex items-center justify-center shrink-0 filter drop-shadow">
                    <Image src="/play.svg" alt="play" width={30} height={30} className="object-contain scale-125" />
                  </div>
                  <span className="lowercase font-medium text-sm tracking-tight leading-none">clicked</span>
                </>
              )}
            </div>

            {!isPalette && onRemove && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1 hover:text-red-700 transition opacity-80 shrink-0 ml-1"
                title="Remove Block"
              >
                <IconTrash className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Seamless Seam Fill Cover for bottom tab */}
        <div 
          className="absolute -bottom-[2px] left-[17px] w-[38px] h-[3px] z-25 pointer-events-none" 
          style={{ backgroundColor: hatFill }}
        />

        {/* Bottom Outset Puzzle Notch Protrusion */}
        <div 
          className="absolute -bottom-[11px] left-[16px] w-[40px] h-[11.5px] border-b-2 border-x-2 z-30"
          style={{ 
            backgroundColor: hatFill, 
            borderColor: hatStroke,
            clipPath: 'polygon(0 0, 8px 100%, 32px 100%, 40px 0)' 
          }}
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
            <span className={`lowercase font-medium text-sm tracking-tight leading-none ${category === 'html' ? 'font-mono' : ''}`}>{label}</span>
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

          {/* Editable text value input field */}
          {(type === 'text_input' || textValue !== undefined) && (
            <div className="flex items-center space-x-1.5 shrink-0 ml-1.5 h-full">
              {isPalette ? (
                <div className={`h-7 px-3 flex items-center justify-center bg-white text-[#575E75] rounded-full font-mono text-xs font-bold border-2 ${colorScheme.badgeBorder} shadow-inner leading-none truncate max-w-[110px]`}>
                  {textValue || 'text'}
                </div>
              ) : (
                <input
                  type="text"
                  value={textValue ?? 'Hello'}
                  onChange={(e) => onTextValueChange && onTextValueChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={`h-7 w-24 sm:w-36 px-2.5 bg-white text-slate-900 rounded-full font-mono text-center border-2 ${colorScheme.badgeBorder} font-bold text-xs outline-none focus:ring-2 focus:ring-amber-400 shadow-inner leading-none select-text`}
                  placeholder="type text..."
                />
              )}
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
