'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  IconPuzzle, 
  IconPlus, 
  IconFlag, 
  IconSparkles, 
  IconTrash, 
  IconChevronDown, 
  IconMaximize, 
  IconGripHorizontal,
  IconGripVertical,
  IconArrowRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCornerUpRight,
  IconRotate,
  IconMessage,
  IconBell,
  IconRepeat,
  IconFileCode,
  IconCode,
  IconBrain,
  IconTag,
  IconHome,
  IconHeading,
  IconTypography,
  IconList,
  IconLink,
  IconPhoto
} from '@tabler/icons-react';
import { soundManager } from '@/utils/sound';
import { animateBlockSnap, animateButtonPress } from '@/utils/gsapAnimations';

export interface CodeBlock {
  instanceId: string;
  type: string;
  label: string;
  category: 'motion' | 'looks' | 'sound' | 'events' | 'control' | 'vars' | 'html';
  blockClass: string;
  stepValue?: number;
  repeatCount?: number;
  icon?: React.ReactNode;
}

export interface CharacterItem {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  description: string;
  unlocked: boolean;
  requiredXP: number;
}

interface BlocklyEditorProps {
  availableBlocks?: string[];
  maxBlocks?: number;
  onRunCode?: (program: CodeBlock[], speed?: number) => void;
  onReset?: () => void;
  onReturnToStart?: () => void;
  isRunning: boolean;
  activeStepIndex: number | null;
  selectedCharacter: string;
  onSelectCharacter: (charId: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  program?: CodeBlock[];
  setProgram?: React.Dispatch<React.SetStateAction<CodeBlock[]>>;
}

export const ALL_SCRATCH_PALETTE: Array<Omit<CodeBlock, 'instanceId'>> = [
  // MOTION (Blue) - Default step values = 1
  { type: 'move_forward', label: 'move forward', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconArrowRight className="w-3.5 h-3.5" /> },
  { type: 'turn_left', label: 'turn left', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconArrowBackUp className="w-3.5 h-3.5" /> },
  { type: 'turn_right', label: 'turn right', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconArrowForwardUp className="w-3.5 h-3.5" /> },
  { type: 'turn_around', label: 'turn around', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconRotate className="w-3.5 h-3.5" /> },
  { type: 'jump', label: 'jump', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconCornerUpRight className="w-3.5 h-3.5" /> },
  { type: 'go_to_start', label: 'go to start', category: 'motion', blockClass: 'block-motion', icon: <IconArrowBackUp className="w-3.5 h-3.5" /> },

  // LOOKS (Purple) - Default step values = 1
  { type: 'say_hello', label: 'say Hello!', category: 'looks', blockClass: 'block-looks', icon: <IconMessage className="w-3.5 h-3.5" /> },
  { type: 'say_step', label: 'say 1 step', category: 'looks', blockClass: 'block-looks', stepValue: 1, icon: <IconMessage className="w-3.5 h-3.5" /> },
  { type: 'hide', label: 'hide character', category: 'looks', blockClass: 'block-looks', icon: <IconSparkles className="w-3.5 h-3.5" /> },
  { type: 'show', label: 'show character', category: 'looks', blockClass: 'block-looks', icon: <IconSparkles className="w-3.5 h-3.5" /> },
  { type: 'change_size', label: 'change size by 1', category: 'looks', blockClass: 'block-looks', stepValue: 1, icon: <IconSparkles className="w-3.5 h-3.5" /> },

  // SOUND (Magenta/Pink)
  { type: 'play_sound', label: 'play sound', category: 'sound', blockClass: 'block-sound', icon: <IconBell className="w-3.5 h-3.5" /> },
  { type: 'stop_sounds', label: 'stop all sounds', category: 'sound', blockClass: 'block-sound', icon: <IconBell className="w-3.5 h-3.5" /> },

  // EVENTS (Yellow/Amber)
  { type: 'when_flag_clicked', label: 'when play clicked', category: 'events', blockClass: 'block-events', icon: <div className="w-6.5 h-6.5 relative flex items-center justify-center shrink-0 filter drop-shadow scale-110"><Image src="/play.svg" alt="play" fill className="object-contain" /></div> },
  { type: 'when_space_pressed', label: 'when key pressed', category: 'events', blockClass: 'block-events', icon: <IconFlag className="w-3.5 h-3.5" /> },
  { type: 'if_touching_path', label: 'if touching path', category: 'events', blockClass: 'block-events', icon: <IconFlag className="w-3.5 h-3.5" /> },

  // CONTROL (Orange) - Default counts = 1
  { type: 'repeat', label: 'repeat 1 time', category: 'control', blockClass: 'block-control', repeatCount: 1, icon: <IconRepeat className="w-3.5 h-3.5" /> },
  { type: 'forever', label: 'forever loop', category: 'control', blockClass: 'block-control', icon: <IconRepeat className="w-3.5 h-3.5" /> },
  { type: 'wait_sec', label: 'wait 1 sec', category: 'control', blockClass: 'block-control', stepValue: 1, icon: <IconRepeat className="w-3.5 h-3.5" /> },
  { type: 'if_then', label: 'if path ahead then', category: 'control', blockClass: 'block-control', icon: <IconRepeat className="w-3.5 h-3.5" /> },

  // VARIABLES (Emerald/Teal) - Default values = 1
  { type: 'set_variable', label: 'set variable to 1', category: 'vars', blockClass: 'block-vars', stepValue: 1, icon: <IconPuzzle className="w-3.5 h-3.5" /> },
  { type: 'change_variable', label: 'change variable by 1', category: 'vars', blockClass: 'block-vars', stepValue: 1, icon: <IconPuzzle className="w-3.5 h-3.5" /> },

  // WORLD 2: HTML PROGRAMMING BLOCKS (Separate Category: 'html', Tabler Icons)
  { type: 'doctype', label: 'DOCTYPE', category: 'html', blockClass: 'bg-purple-600 text-white border-purple-800 font-bold', icon: <IconFileCode className="w-3.5 h-3.5" /> },
  { type: 'html_tag', label: 'HTML', category: 'html', blockClass: 'bg-blue-600 text-white border-blue-800 font-bold', icon: <IconCode className="w-3.5 h-3.5" /> },
  { type: 'head_tag', label: 'HEAD', category: 'html', blockClass: 'bg-emerald-600 text-white border-emerald-800 font-bold', icon: <IconBrain className="w-3.5 h-3.5" /> },
  { type: 'title_tag', label: 'TITLE', category: 'html', blockClass: 'bg-amber-500 text-slate-950 border-amber-700 font-bold', icon: <IconTag className="w-3.5 h-3.5" /> },
  { type: 'body_tag', label: 'BODY', category: 'html', blockClass: 'bg-orange-600 text-white border-orange-800 font-bold', icon: <IconHome className="w-3.5 h-3.5" /> },
  { type: 'h1_tag', label: 'H1', category: 'html', blockClass: 'bg-rose-600 text-white border-rose-800 font-bold', icon: <IconHeading className="w-3.5 h-3.5" /> },
  { type: 'p_tag', label: 'P', category: 'html', blockClass: 'bg-green-600 text-white border-green-800 font-bold', icon: <IconTypography className="w-3.5 h-3.5" /> },
  { type: 'list_tag', label: 'LIST', category: 'html', blockClass: 'bg-cyan-600 text-white border-cyan-800 font-bold', icon: <IconList className="w-3.5 h-3.5" /> },
  { type: 'link_tag', label: 'LINK', category: 'html', blockClass: 'bg-sky-600 text-white border-sky-800 font-bold', icon: <IconLink className="w-3.5 h-3.5" /> },
  { type: 'img_tag', label: 'IMAGE', category: 'html', blockClass: 'bg-purple-700 text-white border-purple-900 font-bold', icon: <IconPhoto className="w-3.5 h-3.5" /> },
];

export const BlocklyEditor: React.FC<BlocklyEditorProps> = ({
  availableBlocks,
  maxBlocks,
  onRunCode,
  onReset,
  onReturnToStart,
  isRunning,
  activeStepIndex,
  selectedCharacter,
  onSelectCharacter,
  selectedCategory: externalCategory = 'motion',
  onSelectCategory,
  program: externalProgram,
  setProgram: externalSetProgram,
}) => {
  const dragControls = useDragControls();

  const [internalCategory, setInternalCategory] = useState<string>('motion');
  const activeCategory = externalCategory || internalCategory;
  const setActiveCategory = onSelectCategory || setInternalCategory;

  const [internalProgram, setInternalProgram] = useState<CodeBlock[]>([
    { instanceId: 'default-1', type: 'move_forward', label: 'move forward', category: 'motion', blockClass: 'block-motion', stepValue: 1 },
    { instanceId: 'default-2', type: 'turn_right', label: 'if touching path', category: 'events', blockClass: 'block-events' },
    { instanceId: 'default-3', type: 'say_hello', label: 'say 1 step', category: 'looks', blockClass: 'block-looks', stepValue: 1 },
    { instanceId: 'default-4', type: 'repeat', label: 'repeat 1 time', category: 'control', blockClass: 'block-control', repeatCount: 1 },
  ]);

  const program = externalProgram || internalProgram;
  const setProgram = externalSetProgram || setInternalProgram;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [modalSize, setModalSize] = useState({ width: 520, height: 520 });

  // Adjustable Dividing Point Percentages
  const [topSectionPercent, setTopSectionPercent] = useState<number>(45);
  const [heroesPercent, setHeroesPercent] = useState<number>(30);

  const characterList = [
    { id: 'monkey', name: 'MONKEY', avatar: '/monkey1.svg' },
  ];

  // Category Tabs Configuration (ALL filter removed)
  const categoryTabs = [
    { id: 'motion', label: 'MOTION', color: 'bg-blue-600 text-white' },
    { id: 'looks', label: 'LOOKS', color: 'bg-purple-600 text-white' },
    { id: 'sound', label: 'SOUND', color: 'bg-pink-600 text-white' },
    { id: 'events', label: 'EVENTS', color: 'bg-amber-500 text-slate-950' },
    { id: 'control', label: 'CONTROL', color: 'bg-amber-600 text-white' },
    { id: 'vars', label: 'VARS', color: 'bg-emerald-600 text-white' },
    { id: 'html', label: 'HTML', color: 'bg-purple-700 text-white font-black' },
  ];

  // Filter Palette based strictly on Active Category
  const filteredPalette = ALL_SCRATCH_PALETTE.filter((block) => {
    const normActive = activeCategory === 'controls' ? 'control' : (activeCategory || 'motion');
    return block.category === normActive;
  });

  const handleResizePointerDown = (edge: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = modalSize.width;
    const startHeight = modalSize.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (edge.includes('right')) newWidth = Math.max(360, startWidth + deltaX);
      if (edge.includes('left')) newWidth = Math.max(360, startWidth - deltaX);
      if (edge.includes('bottom')) newHeight = Math.max(140, startHeight + deltaY);
      if (edge.includes('top')) newHeight = Math.max(140, startHeight - deltaY);

      setModalSize({ width: newWidth, height: newHeight });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Draggable Vertical Split Handler
  const handleVerticalSplitPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const onPointerMove = (moveEvent: PointerEvent) => {
      const relativeY = moveEvent.clientY - rect.top;
      const newPercent = Math.max(20, Math.min(75, Math.round((relativeY / rect.height) * 100)));
      setTopSectionPercent(newPercent);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Draggable Horizontal Split Handler
  const handleHorizontalSplitPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const onPointerMove = (moveEvent: PointerEvent) => {
      const relativeX = moveEvent.clientX - rect.left;
      const newPercent = Math.max(15, Math.min(60, Math.round((relativeX / rect.width) * 100)));
      setHeroesPercent(newPercent);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleAddBlock = (blockDef: Omit<CodeBlock, 'instanceId'>, e: React.MouseEvent<HTMLButtonElement>) => {
    if (program.length >= (maxBlocks ?? 15)) {
      soundManager.playError();
      return;
    }
    animateButtonPress(e.currentTarget);
    soundManager.playSnap();
    const newBlock: CodeBlock = {
      ...blockDef,
      instanceId: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setProgram(prev => [...prev, newBlock]);
  };

  const handleUpdateStepValue = (instanceId: string, value: number) => {
    setProgram(prev => prev.map(b => b.instanceId === instanceId ? { ...b, stepValue: value } : b));
  };

  const handleRemoveBlock = (index: number) => {
    soundManager.playClick();
    setProgram(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.05}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => {
        if (isCollapsed) {
          soundManager.playClick();
          setIsCollapsed(false);
        }
      }}
      style={!isCollapsed ? { width: `${modalSize.width}px`, height: `${modalSize.height}px` } : {}}
      className={`liquid-glass z-40 flex flex-col justify-center transition-all duration-100 relative ${
        isCollapsed 
          ? 'w-auto h-9 max-h-9 !min-h-0 px-3 py-0 rounded-full cursor-pointer border-[0.5px] border-white/20 shadow-xl max-w-fit overflow-hidden' 
          : 'p-5 rounded-3xl min-w-[340px] min-h-[140px]'
      }`}
    >
      <div className="glass-glint" />

      {/* 4-Edge & 4-Corner Resizing Handles */}
      {!isCollapsed && (
        <>
          <div onPointerDown={(e) => handleResizePointerDown('top', e)} className="absolute top-0 left-3 right-3 h-2 cursor-ns-resize z-50 hover:bg-amber-400/30 rounded-t-xl transition" />
          <div onPointerDown={(e) => handleResizePointerDown('bottom', e)} className="absolute bottom-0 left-3 right-3 h-2 cursor-ns-resize z-50 hover:bg-amber-400/30 rounded-b-xl transition" />
          <div onPointerDown={(e) => handleResizePointerDown('left', e)} className="absolute top-3 bottom-3 left-0 w-2 cursor-ew-resize z-50 hover:bg-amber-400/30 rounded-l-xl transition" />
          <div onPointerDown={(e) => handleResizePointerDown('right', e)} className="absolute top-3 bottom-3 right-0 w-2 cursor-ew-resize z-50 hover:bg-amber-400/30 rounded-r-xl transition" />
          <div onPointerDown={(e) => handleResizePointerDown('top-left', e)} className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-amber-400/60 rounded-tl-xl transition" />
          <div onPointerDown={(e) => handleResizePointerDown('top-right', e)} className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-amber-400/60 rounded-tr-xl transition" />
          <div onPointerDown={(e) => handleResizePointerDown('bottom-left', e)} className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-amber-400/60 rounded-bl-xl transition" />
          <div onPointerDown={(e) => handleResizePointerDown('bottom-right', e)} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-amber-400/60 rounded-br-xl transition" />
        </>
      )}

      {/* Header Drag Handle */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className={`w-full flex items-center justify-between cursor-grab active:cursor-grabbing select-none flex-shrink-0 ${
          isCollapsed ? 'h-full pb-0 border-b-0 space-x-1.5' : 'pb-3 border-b border-slate-900/15'
        }`}
      >
        <div className={`flex items-center space-x-1.5 ${isCollapsed ? 'border-r border-slate-900/15 pr-2 mr-0.5' : ''}`}>
          <IconGripHorizontal className="w-3.5 h-3.5 text-slate-800 opacity-80" />
          <span className="text-[11px] font-black text-slate-950 font-mono tracking-wide flex items-center space-x-1 whitespace-nowrap">
            <IconPuzzle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Scratch Editor</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5" onClick={(e) => isCollapsed && e.stopPropagation()}>
          {!isCollapsed && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center space-x-1 bg-white/70 p-1 rounded-full border border-slate-300/80 shadow-sm"
            >
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => { soundManager.playClick(); setSpeed(s); }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black transition ${
                    speed === s ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}

          {/* Block Counter Pill */}
          <div className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full border border-amber-600 font-black text-[11px] shadow-sm flex items-center space-x-1">
            <span>{program.length}/{maxBlocks}</span>
          </div>

          {/* Collapse/Expand Toggle Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setIsCollapsed(!isCollapsed);
            }}
            className="w-7 h-7 rounded-full bg-white/80 border border-slate-300 flex items-center justify-center text-slate-800 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer shadow-sm"
            title={isCollapsed ? 'Expand Scratch Editor' : 'Collapse Scratch Editor'}
          >
            {isCollapsed ? <IconMaximize className="w-3.5 h-3.5" /> : <IconChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Content */}
      {!isCollapsed && (
        <div className="pt-3 flex flex-col flex-1 min-h-0 space-y-2 w-full h-full relative">
          
          {/* Top Palette & Heroes Row */}
          <div 
            style={{ height: `${topSectionPercent}%` }} 
            className="w-full flex items-stretch gap-2 flex-shrink-0 min-h-[90px] relative"
          >
            {/* Heroes Selector Column */}
            <div 
              style={{ width: `${heroesPercent}%` }}
              className="flex flex-col space-y-1.5 h-full overflow-y-auto pr-1 flex-shrink-0"
            >
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">HEROES</span>
              {characterList.map((char) => {
                const isSelected = selectedCharacter === char.id;
                return (
                  <div
                    key={char.id}
                    onClick={() => { soundManager.playClick(); onSelectCharacter(char.id); }}
                    className="cursor-pointer transition flex items-center shrink-0 w-fit max-w-full self-start py-1 space-x-1.5"
                  >
                    <div className="w-6 h-6 relative flex-shrink-0">
                      <Image src={char.avatar} alt={char.name} fill className="object-contain" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-900 truncate">{char.name}</span>
                    {isSelected && (
                      <div className="w-4 h-4 relative flex-shrink-0 ml-2">
                        <Image src="/maze_finish.svg" alt="Selected" fill className="object-contain" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Draggable Horizontal Splitter */}
            <div
              onPointerDown={handleHorizontalSplitPointerDown}
              className="w-2.5 h-full cursor-col-resize bg-slate-300/60 hover:bg-amber-400 rounded-full flex items-center justify-center transition flex-shrink-0 select-none shadow-sm"
              title="Drag horizontally to adjust Heroes vs Palette split width"
            >
              <IconGripVertical className="w-3 h-3 text-slate-700 opacity-70 pointer-events-none" />
            </div>

            {/* Block Palette Column with Category Filter Tabs */}
            <div className="flex-1 flex flex-col space-y-1.5 h-full overflow-hidden">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  PALETTE ({activeCategory.toUpperCase()})
                </span>

                {/* Category Pill Filters */}
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        soundManager.playClick();
                        setActiveCategory(tab.id);
                      }}
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-black transition whitespace-nowrap border ${
                        activeCategory === tab.id || (activeCategory === 'controls' && tab.id === 'control')
                          ? 'ring-2 ring-amber-400 scale-105 border-white shadow-sm'
                          : 'opacity-70 hover:opacity-100 border-transparent'
                      } ${tab.color}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-start content-start gap-1.5 p-2 bg-white/50 rounded-2xl border border-slate-300/80 h-full overflow-y-auto w-full shadow-inner">
                {filteredPalette.map((block) => (
                  <button
                    key={block.type}
                    onClick={(e) => handleAddBlock(block, e)}
                    className={`px-3 py-1 h-7 max-h-7 shrink-0 w-fit max-w-fit self-start rounded-full ${block.blockClass} text-white font-black text-[11px] shadow flex items-center space-x-1 hover:scale-105 transition cursor-pointer border border-white/30`}
                  >
                    {block.icon}
                    <span>{block.label}</span>
                    {block.stepValue !== undefined && (
                      <span className="w-6 py-0.2 bg-black/40 rounded-full font-mono text-amber-300 text-center border border-white/20 text-[10px] font-black inline-block">
                        {block.stepValue}
                      </span>
                    )}
                    <IconPlus className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Draggable Vertical Splitter Bar */}
          <div
            onPointerDown={handleVerticalSplitPointerDown}
            className="w-full h-3 cursor-row-resize bg-slate-300/60 hover:bg-amber-400 rounded-full flex items-center justify-center transition flex-shrink-0 select-none shadow-sm border border-white/50"
            title="Drag vertically to adjust Palette vs Code Stack split height"
          >
            <IconGripHorizontal className="w-4 h-4 text-slate-800 opacity-80 pointer-events-none" />
          </div>

          {/* Interlocking Code Stack Dropzone */}
          <div className="flex-1 min-h-[90px] overflow-y-auto flex flex-col space-y-2 p-3 bg-white/50 rounded-2xl border border-slate-300/80 w-full shadow-inner items-start">
            
            {/* Interlocking Code Blocks */}
            <AnimatePresence>
              {program.map((block, index) => {
                const isActive = activeStepIndex === index;

                if (block.type === 'when_flag_clicked') {
                  return (
                    <motion.div
                      key={block.instanceId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      ref={(el) => { if (el) animateBlockSnap(el); }}
                      className={`px-3.5 py-1.5 h-8 max-h-8 shrink-0 w-fit max-w-fit self-start rounded-full block-events text-slate-950 font-black text-xs shadow flex items-center space-x-2 border border-amber-600/40 select-none group ${
                        isActive ? 'ring-4 ring-amber-400 scale-105 z-20 shadow-[0_0_30px_rgba(251,191,36,0.9)]' : ''
                      }`}
                    >
                      <span>WHEN</span>
                      <div className="w-7 h-7 relative flex items-center justify-center shrink-0 filter drop-shadow scale-110">
                        <Image src="/play.svg" alt="play" fill className="object-contain" />
                      </div>
                      <span>CLICKED</span>

                      {program.length > 1 && (
                        <button
                          onClick={() => handleRemoveBlock(index)}
                          className="opacity-70 group-hover:opacity-100 hover:text-red-600 transition pl-1"
                          title="Remove block"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={block.instanceId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    ref={(el) => { if (el) animateBlockSnap(el); }}
                    className={`px-3.5 py-1.5 h-8 max-h-8 shrink-0 w-fit max-w-fit self-start rounded-full ${block.blockClass} text-white font-black text-xs shadow flex items-center space-x-3 border border-white/30 transition group ${
                      isActive ? 'ring-4 ring-amber-400 scale-105 z-20 shadow-[0_0_30px_rgba(251,191,36,0.9)]' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-black/40 px-2 py-0.2 rounded-full font-mono font-black text-white">
                        #{index + 1}
                      </span>
                      <span className="drop-shadow-sm whitespace-nowrap">{block.label}</span>

                      {block.stepValue !== undefined && (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={block.stepValue}
                            onChange={(e) => handleUpdateStepValue(block.instanceId, parseInt(e.target.value) || 1)}
                            className="w-10 px-1 py-0.2 rounded-full bg-black/40 text-amber-300 font-mono text-center border border-white/40 font-black text-xs outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          <span>steps</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveBlock(index)}
                      className="opacity-70 group-hover:opacity-100 hover:text-red-300 transition pl-1"
                      title="Remove block"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>

                    <IconSparkles className="w-3.5 h-3.5 text-amber-300 opacity-70 animate-pulse" />
                  </motion.div>
                );
              })}
            </AnimatePresence>

          </div>

        </div>
      )}

    </motion.div>
  );
};
