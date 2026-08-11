'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useDragControls, Reorder } from 'framer-motion';
import { 
  IconPuzzle, 
  IconPlus, 
  IconFlag, 
  IconSparkles, 
  IconTrash, 
  IconChevronDown, 
  IconChevronRight,
  IconChevronLeft,
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
  IconCoins,
  IconFileCode,
  IconCode,
  IconBrain,
  IconTag,
  IconHome,
  IconHeading,
  IconTypography,
  IconList,
  IconLink,
  IconPhoto,
  IconZoomIn,
  IconZoomOut,
  IconBrandHtml5,
  IconBrandCss3,
  IconBrandJavascript,
  IconBrandPython
} from '@tabler/icons-react';
import { soundManager } from '@/utils/sound';
import { animateBlockSnap, animateButtonPress } from '@/utils/gsapAnimations';
import { PureCSSBlock } from './PureCSSBlock';
import { PureCSSLoopBlock, isLoopBlockType } from './PureCSSLoopBlock';

export interface CodeBlock {
  instanceId: string;
  type: string;
  label: string;
  category: 'motion' | 'looks' | 'sound' | 'events' | 'control' | 'vars' | 'html';
  blockClass: string;
  stepValue?: number;
  repeatCount?: number;
  textValue?: string;
  icon?: React.ReactNode;
  children?: CodeBlock[];
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
  isWorld2?: boolean;
  selectedWorldId?: number;
}

export const ALL_SCRATCH_PALETTE: Array<Omit<CodeBlock, 'instanceId'>> = [
  // MOTION (Blue) - Default step values = 1
  { type: 'move_forward', label: 'move forward', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconArrowRight className="w-3.5 h-3.5" /> },
  { type: 'turn_left', label: 'turn left', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconArrowBackUp className="w-3.5 h-3.5" /> },
  { type: 'turn_right', label: 'turn right', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconArrowForwardUp className="w-3.5 h-3.5" /> },
  { type: 'turn_around', label: 'turn around', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconRotate className="w-3.5 h-3.5" /> },
  { type: 'jump', label: 'jump', category: 'motion', blockClass: 'block-motion', stepValue: 1, icon: <IconCornerUpRight className="w-3.5 h-3.5" /> },
  { type: 'collect_coin', label: 'collect coin', category: 'motion', blockClass: 'block-motion', icon: <IconCoins className="w-3.5 h-3.5" /> },
  { type: 'go_to_start', label: 'go to start', category: 'motion', blockClass: 'block-motion', icon: <IconArrowBackUp className="w-3.5 h-3.5" /> },

  // LOOKS (Purple) - Default step values = 1
  { type: 'say_hello', label: 'say hello!', category: 'looks', blockClass: 'block-looks', icon: <IconMessage className="w-3.5 h-3.5" /> },
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
  { type: 'doctype', label: '<!doctype html>', category: 'html', blockClass: 'bg-purple-700 text-white border-purple-900 font-bold', icon: <IconFileCode className="w-3.5 h-3.5" /> },
  { type: 'html_tag', label: '<html>', category: 'html', blockClass: 'bg-blue-600 text-white border-blue-800 font-bold', icon: <IconCode className="w-3.5 h-3.5" /> },
  { type: 'head_tag', label: '<head>', category: 'html', blockClass: 'bg-[#FF9100] text-white border-[#E65100] font-bold', icon: <IconBrain className="w-3.5 h-3.5" /> },
  { type: 'text_input', label: 'text', category: 'html', blockClass: 'bg-[#00A2FF] text-white border-[#0088D6] font-bold', textValue: 'Hello', icon: <IconTypography className="w-3.5 h-3.5" /> },
  { type: 'title_tag', label: '<title>', category: 'html', blockClass: 'bg-[#E91E63] text-white border-[#C2185B] font-bold', icon: <IconTag className="w-3.5 h-3.5" /> },
  { type: 'body_tag', label: '<body>', category: 'html', blockClass: 'bg-[#F1D300] text-slate-950 border-[#C7AD00] font-bold', icon: <IconHome className="w-3.5 h-3.5" /> },
  { type: 'h1_tag', label: '<h1>', category: 'html', blockClass: 'bg-[#B80751] text-white border-[#90053E] font-bold', icon: <IconHeading className="w-3.5 h-3.5" /> },
  { type: 'p_tag', label: '<p>', category: 'html', blockClass: 'bg-[#EC4899] text-white border-[#DB2777] font-bold', icon: <IconTypography className="w-3.5 h-3.5" /> },
  { type: 'list_tag', label: '<ul>', category: 'html', blockClass: 'bg-purple-700 text-white border-purple-900 font-bold', icon: <IconList className="w-3.5 h-3.5" /> },
  { type: 'link_tag', label: '<a href="...">', category: 'html', blockClass: 'bg-purple-700 text-white border-purple-900 font-bold', icon: <IconLink className="w-3.5 h-3.5" /> },
  { type: 'img_tag', label: '<img src="...">', category: 'html', blockClass: 'bg-purple-700 text-white border-purple-900 font-bold', icon: <IconPhoto className="w-3.5 h-3.5" /> },
];

const getLanguageLabel = (worldId: number): string => {
  switch (worldId) {
    case 2: return 'HTML5';
    case 3: return 'CSS3';
    case 4: return 'JavaScript';
    case 5: return 'Python';
    default: return 'Code';
  }
};

const renderLanguageLogo = (worldId: number) => {
  switch (worldId) {
    case 2: // HTML
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 backdrop-blur-md border border-orange-500/40 text-orange-600 text-[10px] font-black tracking-wider uppercase shadow-sm">
          <IconBrandHtml5 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span>HTML5</span>
        </span>
      );
    case 3: // CSS
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/25 backdrop-blur-md border border-blue-400/50 text-blue-700 text-[10px] font-black tracking-wider uppercase shadow-sm">
          <IconBrandCss3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>CSS3</span>
        </span>
      );
    case 4: // JavaScript
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-400/25 backdrop-blur-md border border-amber-500/40 text-amber-900 text-[10px] font-black tracking-wider uppercase shadow-sm">
          <IconBrandJavascript className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>JavaScript</span>
        </span>
      );
    case 5: // Python
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-600/20 backdrop-blur-md border border-blue-500/40 text-blue-800 text-[10px] font-black tracking-wider uppercase shadow-sm">
          <IconBrandPython className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Python</span>
        </span>
      );
    default:
      return null;
  }
};

const getIdeFilename = (worldId: number): string => {
  switch (worldId) {
    case 2: return 'index.html';
    case 3: return 'styles.css';
    case 4: return 'script.js';
    case 5: return 'main.py';
    default: return 'script.txt';
  }
};

const getInitialIdeCode = (worldId: number): string => {
  return '';
};

const convertProgramToText = (blocks: CodeBlock[], worldId: number): string => {
  // Filter out hat blocks (when_flag_clicked and when_html_started)
  const actionBlocks = (blocks || []).filter(b => b.type !== 'when_flag_clicked' && b.type !== 'when_html_started');

  if (actionBlocks.length === 0) {
    return '';
  }

  let codeLines: string[] = [];

  actionBlocks.forEach((b) => {
    // HTML Tag Blocks
    if (b.type === 'h1_tag') codeLines.push(`<h1>${b.textValue || 'Welcome Builder'}</h1>`);
    else if (b.type === 'p_tag') codeLines.push(`<p>${b.textValue || 'Build the world with HTML tags.'}</p>`);
    else if (b.type === 'text_input') codeLines.push(`<span>${b.textValue || 'Sample Text'}</span>`);
    else if (b.type === 'list_tag') codeLines.push('<ul>\n  <li>First Item</li>\n  <li>Second Item</li>\n</ul>');
    else if (b.type === 'link_tag') codeLines.push('<a href="/schools">Kingdom Link</a>');
    else if (b.type === 'img_tag') codeLines.push('<img src="/monkey1.svg" alt="Monkey" />');
    
    // CSS Blocks
    else if (b.type === 'css_color') codeLines.push(`color: ${b.textValue || '#f59e0b'};`);
    else if (b.type === 'css_font_size') codeLines.push(`font-size: ${b.textValue || '2rem'};`);
    else if (b.type === 'css_background') codeLines.push(`background-color: ${b.textValue || '#0f172a'};`);
    else if (b.type === 'css_margin') codeLines.push(`margin: ${b.textValue || '20px'};`);
    
    // Motion & Logic Blocks (JS / Python format depending on world)
    else if (b.type === 'move_forward') {
      if (worldId === 5) codeLines.push(`move_forward(${b.stepValue || 1})`);
      else codeLines.push(`moveForward(${b.stepValue || 1});`);
    }
    else if (b.type === 'turn_left') {
      if (worldId === 5) codeLines.push('turn_left()');
      else codeLines.push('turnLeft();');
    }
    else if (b.type === 'turn_right') {
      if (worldId === 5) codeLines.push('turn_right()');
      else codeLines.push('turnRight();');
    }
    else if (b.type === 'turn_around') {
      if (worldId === 5) codeLines.push('turn_around()');
      else codeLines.push('turnAround();');
    }
    else if (b.type === 'say_hello') {
      if (worldId === 5) codeLines.push(`print("${b.textValue || 'Hello World!'}")`);
      else codeLines.push(`say("${b.textValue || 'Hello!' }");`);
    }
    else if (b.type === 'collect_coin') {
      if (worldId === 5) codeLines.push('collect_coin()');
      else codeLines.push('collectCoin();');
    }
    else if (b.type === 'repeat') {
      if (worldId === 5) codeLines.push(`for i in range(${b.repeatCount || 1}):\n    move_forward()`);
      else codeLines.push(`for (let i = 0; i < ${b.repeatCount || 1}; i++) {\n  moveForward(1);\n}`);
    }
  });

  return codeLines.join('\n');
};

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
  isWorld2 = false,
  selectedWorldId = 1,
}) => {
  const activeWorldId = selectedWorldId || (isWorld2 ? 2 : 1);
  const dragControls = useDragControls();

  const [isIdeMode, setIsIdeMode] = useState<boolean>(false);
  const [ideCodeText, setIdeCodeText] = useState<string>('');

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);
  const codeStackContainerRef = React.useRef<HTMLDivElement>(null);

  const handleTextareaScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const [internalCategory, setInternalCategory] = useState<string>('motion');
  const activeCategory = externalCategory || internalCategory;
  const setActiveCategory = onSelectCategory || setInternalCategory;

  const [internalProgram, setInternalProgram] = useState<CodeBlock[]>([
    { instanceId: 'default-when-clicked', type: 'when_flag_clicked', label: 'when play clicked', category: 'events', blockClass: 'block-events' },
    { instanceId: 'default-html-hat', type: 'when_html_started', label: 'HTML', category: 'html', blockClass: 'bg-purple-700 text-white border-purple-900 font-bold' },
    { instanceId: 'default-1', type: 'move_forward', label: 'move forward', category: 'motion', blockClass: 'block-motion', stepValue: 1 },
    { instanceId: 'default-2', type: 'say_hello', label: 'say 1 step', category: 'looks', blockClass: 'block-looks', stepValue: 1 },
    { instanceId: 'default-3', type: 'repeat', label: 'repeat 1 time', category: 'control', blockClass: 'block-control', repeatCount: 1 },
  ]);

  const program = externalProgram || internalProgram;
  const setProgram = externalSetProgram || setInternalProgram;

  // Helper to ensure when_flag_clicked and when_html_started hat blocks remain in the frame when empty
  const ensureHatBlocks = React.useCallback((blocks: CodeBlock[]): CodeBlock[] => {
    const hasFlag = blocks.some(b => b.type === 'when_flag_clicked');
    const hasHtml = blocks.some(b => b.type === 'when_html_started');

    let result = [...blocks];
    if (!hasFlag) {
      result.unshift({ instanceId: 'default-when-clicked', type: 'when_flag_clicked', label: 'when play clicked', category: 'events', blockClass: 'block-events' });
    }
    if ((activeWorldId === 2 || isWorld2) && !hasHtml) {
      const flagIdx = result.findIndex(b => b.type === 'when_flag_clicked');
      const htmlBlock: CodeBlock = { instanceId: 'default-html-hat', type: 'when_html_started', label: 'HTML', category: 'html', blockClass: 'bg-purple-700 text-white border-purple-900 font-bold' };
      if (flagIdx >= 0) {
        result.splice(flagIdx + 1, 0, htmlBlock);
      } else {
        result.unshift(htmlBlock);
      }
    }
    return result;
  }, [activeWorldId, isWorld2]);

  // Keep when_flag_clicked and when_html_started hat blocks in the frame if empty
  useEffect(() => {
    if (program.length === 0 || !program.some(b => b.type === 'when_flag_clicked')) {
      const hatBlocks = ensureHatBlocks(program);
      setProgram(hatBlocks);
    }
  }, [program.length, ensureHatBlocks, setProgram]);

  // Live translation: compile stacked blocks into actual code whenever blocks change
  useEffect(() => {
    setIdeCodeText(convertProgramToText(program, activeWorldId));
  }, [program, activeWorldId]);



  // Auto-scroll IDE editor to active line or latest typed line on activity
  useEffect(() => {
    if (isIdeMode && textareaRef.current) {
      const lines = ideCodeText.split('\n');
      const targetLine = activeStepIndex !== null && activeStepIndex < lines.length
        ? activeStepIndex
        : lines.length - 1;
      
      const lineHeight = 24;
      const scrollTop = Math.max(0, targetLine * lineHeight - 40);

      textareaRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [ideCodeText, activeStepIndex, isIdeMode]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [paletteZoomScale, setPaletteZoomScale] = useState<number>(1);
  const [codeStackZoomScale, setCodeStackZoomScale] = useState<number>(1);
  const [modalSize, setModalSize] = useState({ width: 520, height: 520 });

  const handleToggleExpand = () => {
    soundManager.playClick();
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        setModalSize((s) => ({ ...s, width: Math.min(1080, typeof window !== 'undefined' ? window.innerWidth - 48 : 1080) }));
      } else {
        setModalSize((s) => ({ ...s, width: 520 }));
      }
      return next;
    });
  };

  // On load, default height fills screen up to slightly below score bar (~120px clearance offset)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const calculatedHeight = Math.max(340, window.innerHeight - 120);
      setModalSize(prev => ({ ...prev, height: calculatedHeight }));
    }
  }, []);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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

  const handleUpdateRepeatCount = (instanceId: string, value: number) => {
    setProgram(prev => prev.map(b => b.instanceId === instanceId ? { ...b, repeatCount: Math.max(1, value) } : b));
  };

  const handleRemoveBlock = (index: number) => {
    soundManager.playClick();
    setProgram(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddChildToLoop = (parentInstanceId: string, blockDef: any) => {
    soundManager.playSnap();
    const newChild: CodeBlock = {
      ...blockDef,
      instanceId: `nested-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setProgram((prev) => {
      const updateTree = (list: CodeBlock[]): CodeBlock[] => {
        return list.map((b) => {
          if (b.instanceId === parentInstanceId) {
            return { ...b, children: [...(b.children || []), newChild] };
          }
          if (b.children && b.children.length > 0) {
            return { ...b, children: updateTree(b.children) };
          }
          return b;
        });
      };
      return updateTree(prev);
    });
  };

  const handleRemoveChildFromLoop = (targetInstanceId: string) => {
    soundManager.playClick();
    setProgram((prev) => {
      const removeFromTree = (list: CodeBlock[]): CodeBlock[] => {
        return list
          .filter((b) => b.instanceId !== targetInstanceId)
          .map((b) => {
            if (b.children && b.children.length > 0) {
              return { ...b, children: removeFromTree(b.children) };
            }
            return b;
          });
      };
      return removeFromTree(prev);
    });
  };

  const handleReorderChildren = (parentInstanceId: string, newChildren: CodeBlock[]) => {
    setProgram((prev) => {
      const updateTree = (list: CodeBlock[]): CodeBlock[] => {
        return list.map((b) => {
          if (b.instanceId === parentInstanceId) {
            return { ...b, children: newChildren };
          }
          if (b.children && b.children.length > 0) {
            return { ...b, children: updateTree(b.children) };
          }
          return b;
        });
      };
      return updateTree(prev);
    });
  };

  const handleUpdateNestedStepValue = (targetInstanceId: string, val: number) => {
    setProgram((prev) => {
      const updateTree = (list: CodeBlock[]): CodeBlock[] => {
        return list.map((b) => {
          if (b.instanceId === targetInstanceId) {
            return { ...b, stepValue: val };
          }
          if (b.children && b.children.length > 0) {
            return { ...b, children: updateTree(b.children) };
          }
          return b;
        });
      };
      return updateTree(prev);
    });
  };

  const handleUpdateNestedTextValue = (targetInstanceId: string, val: string) => {
    setProgram((prev) => {
      const updateTree = (list: CodeBlock[]): CodeBlock[] => {
        return list.map((b) => {
          if (b.instanceId === targetInstanceId) {
            return { ...b, textValue: val };
          }
          if (b.children && b.children.length > 0) {
            return { ...b, children: updateTree(b.children) };
          }
          return b;
        });
      };
      return updateTree(prev);
    });
  };

  const motionBlocks = program.filter((b) => b.category !== 'html' && b.type !== 'when_html_started');
  const pureHtmlBlocks = program.filter((b) => b.category === 'html' && b.type !== 'when_html_started');
  
  const htmlHatBlock: CodeBlock = {
    instanceId: 'default-html-hat',
    type: 'when_html_started',
    label: 'HTML',
    category: 'html',
    blockClass: 'bg-purple-700 text-white border-purple-900 font-bold',
  };

  const htmlBlocks = [htmlHatBlock, ...pureHtmlBlocks];

  const setMotionBlocks = (newMotion: CodeBlock[]) => {
    setProgram([...newMotion, ...pureHtmlBlocks]);
  };

  const setHtmlBlocks = (newHtml: CodeBlock[]) => {
    const cleanHtml = newHtml.filter(b => b.type !== 'when_html_started');
    setProgram([...motionBlocks, ...cleanHtml]);
  };

  const renderBlockNode = (block: CodeBlock, indexInProgram: number, isActive: boolean): React.ReactNode => {
    if (block.type === 'when_flag_clicked' || block.type === 'when_html_started') {
      return (
        <Reorder.Item key={block.instanceId} value={block} layout className="w-fit flex items-start">
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="cursor-grab active:cursor-grabbing shrink-0"
          >
            <PureCSSBlock 
              category={block.category || (block.type === 'when_html_started' ? 'html' : 'events')}
              type={block.type}
              label={block.label}
              isActive={isActive}
              isPalette={false}
              onRemove={program.length > 1 ? () => handleRemoveBlock(indexInProgram) : undefined}
            />
          </motion.div>
        </Reorder.Item>
      );
    }

    const isCBlock = isLoopBlockType(block.type);

    if (isCBlock) {
      const renderNestedNode = (node: CodeBlock): React.ReactNode => {
        const isNodeCBlock = isLoopBlockType(node.type);

        if (isNodeCBlock) {
          return (
            <PureCSSLoopBlock
              type={node.type}
              label={node.label}
              repeatCount={node.repeatCount ?? 1}
              isActive={isActive}
              isPalette={false}
              onRemove={() => handleRemoveChildFromLoop(node.instanceId)}
              onRepeatCountChange={(val) => handleUpdateRepeatCount(node.instanceId, val)}
              onAddChild={(blockDef) => handleAddChildToLoop(node.instanceId, blockDef)}
            >
              <Reorder.Group
                axis="y"
                values={node.children || []}
                onReorder={(newChildren) => handleReorderChildren(node.instanceId, newChildren)}
                className="w-full flex flex-col space-y-[2px] items-start"
              >
                <AnimatePresence>
                  {(node.children || []).map((child) => (
                    <Reorder.Item key={child.instanceId} value={child} layout className="w-fit flex items-start">
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="cursor-grab active:cursor-grabbing shrink-0"
                      >
                        {renderNestedNode(child)}
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </PureCSSLoopBlock>
          );
        }

        return (
          <PureCSSBlock
            category={node.category}
            type={node.type}
            label={node.label}
            stepValue={node.stepValue}
            textValue={node.textValue}
            isActive={false}
            isPalette={false}
            onRemove={() => handleRemoveChildFromLoop(node.instanceId)}
            onStepValueChange={(val) => handleUpdateNestedStepValue(node.instanceId, val)}
            onTextValueChange={(val) => handleUpdateNestedTextValue(node.instanceId, val)}
          />
        );
      };

      return (
        <Reorder.Item key={block.instanceId} value={block} layout className="w-fit flex items-start">
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="cursor-grab active:cursor-grabbing shrink-0"
          >
            <PureCSSLoopBlock 
              type={block.type}
              label={block.label}
              repeatCount={block.repeatCount ?? 1}
              isActive={isActive}
              isPalette={false}
              onRemove={() => handleRemoveBlock(indexInProgram)}
              onRepeatCountChange={(val) => handleUpdateRepeatCount(block.instanceId, val)}
              onAddChild={(blockDef) => handleAddChildToLoop(block.instanceId, blockDef)}
            >
              <Reorder.Group 
                axis="y" 
                values={block.children || []} 
                onReorder={(newChildren) => handleReorderChildren(block.instanceId, newChildren)}
                className="w-full flex flex-col space-y-[2px] items-start"
              >
                <AnimatePresence>
                  {(block.children || []).map((child) => (
                    <Reorder.Item key={child.instanceId} value={child} layout className="w-fit flex items-start">
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="cursor-grab active:cursor-grabbing shrink-0"
                      >
                        {renderNestedNode(child)}
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </PureCSSLoopBlock>
          </motion.div>
        </Reorder.Item>
      );
    }

    return (
      <Reorder.Item key={block.instanceId} value={block} layout className="w-fit flex items-start">
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="cursor-grab active:cursor-grabbing shrink-0"
        >
          <PureCSSBlock 
            category={block.category}
            type={block.type}
            label={block.label}
            stepValue={block.stepValue}
            textValue={block.textValue}
            isActive={isActive}
            isPalette={false}
            onRemove={() => handleRemoveBlock(indexInProgram)}
            onStepValueChange={(val) => handleUpdateStepValue(block.instanceId, val)}
            onTextValueChange={(val) => handleUpdateNestedTextValue(block.instanceId, val)}
          />
        </motion.div>
      </Reorder.Item>
    );
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
      className="z-40 transition-all duration-100 relative overflow-visible"
    >
      {/* Inner Liquid Glass Panel (Strictly overflow-hidden so ::before radial reflection never leaks!) */}
      <div className={`liquid-glass w-full h-full flex flex-col justify-center relative overflow-hidden ${
        isCollapsed 
          ? 'w-auto h-9 max-h-9 !min-h-0 px-3 py-0 rounded-full cursor-pointer border-[0.5px] border-white/20 shadow-xl max-w-fit' 
          : 'p-5 rounded-3xl min-w-[340px] min-h-[140px]'
      }`}>
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

      {/* Caret Toggle Button on Right Edge (Center Height) */}
      {!isCollapsed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleExpand();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-[100] w-10 h-10 p-2.5 rounded-full bg-white/95 border border-slate-300 flex items-center justify-center text-slate-800 hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 select-none"
          title={isExpanded ? 'Collapse Editor Width' : 'Expand Editor Width'}
        >
          {isExpanded ? (
            <IconChevronLeft className="w-5 h-5 text-slate-900 stroke-[2.5]" />
          ) : (
            <IconChevronRight className="w-5 h-5 text-slate-900 stroke-[2.5]" />
          )}
        </button>
      )}

      {/* Header Drag Handle */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className={`w-full flex items-center justify-between cursor-grab active:cursor-grabbing select-none flex-shrink-0 ${
          isCollapsed ? 'h-full pb-0 border-b-0 space-x-1.5' : 'pb-3 border-b border-slate-900/15'
        }`}
      >
        <div className={`flex items-center space-x-2.5 ${isCollapsed ? 'border-r border-slate-900/15 pr-2 mr-0.5' : ''}`}>
          <IconGripHorizontal className="w-3.5 h-3.5 text-slate-800 opacity-80" />

          {/* Logo & Title Text (Block Editor when on blocks, Code Editor when on code) */}
          <span className="text-[11px] font-black text-slate-950 font-mono tracking-wide flex items-center space-x-1 whitespace-nowrap">
            <IconPuzzle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>{isIdeMode ? 'Code Editor' : 'Block Editor'}</span>
          </span>

          {/* TEXTLESS TOGGLE SWITCH AFTER TITLE AND LOGO (WORLDS 2-5) */}
          {(activeWorldId >= 2 || isWorld2) && !isCollapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                const nextIde = !isIdeMode;
                setIsIdeMode(nextIde);
                if (nextIde) {
                  setIdeCodeText(convertProgramToText(program, activeWorldId));
                }
              }}
              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-slate-600/80 transition-colors duration-200 ease-in-out focus:outline-none shadow-inner p-0.5 bg-slate-800"
              title={isIdeMode ? 'Switch to Block Editor' : 'Switch to Code Editor'}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-amber-400 shadow-md ring-0 transition duration-200 ease-in-out ${
                  isIdeMode ? 'translate-x-4 bg-amber-300' : 'translate-x-0 bg-amber-400'
                }`}
              />
            </button>
          )}

          {/* LANGUAGE LOGO AFTER THE TOGGLE SWITCH IN CODE EDITOR MODE */}
          {isIdeMode && (activeWorldId >= 2 || isWorld2) && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center ml-0.5"
            >
              {renderLanguageLogo(activeWorldId)}
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-1.5" onClick={(e) => isCollapsed && e.stopPropagation()}>
          {!isCollapsed && (
            /* Speed Controls Pill */
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
          {isIdeMode ? (
            <div className="pt-1 flex flex-col flex-1 min-h-0 space-y-2 w-full h-full relative text-slate-100 font-mono">
              {/* IDE Text Area Editor Container */}
              <div className="flex-1 w-full relative bg-slate-950/95 border border-slate-800 rounded-3xl overflow-hidden flex flex-col p-4 shadow-2xl min-h-0">
                <div className="flex-1 flex space-x-3 overflow-hidden min-h-0 relative pr-16 pb-12">
                  {/* Line Numbers Column */}
                  <div
                    ref={lineNumbersRef}
                    className="text-slate-600 text-xs sm:text-sm text-right select-none font-mono py-0.5 pr-2.5 border-r border-slate-800/80 flex flex-col shrink-0 overflow-y-auto scrollbar-none h-full"
                  >
                    {Array.from({ length: Math.max(ideCodeText.split('\n').length, 1) }).map((_, idx) => (
                      <div key={idx} className="h-6 leading-6 font-mono shrink-0">
                        {idx + 1}
                      </div>
                    ))}
                    <div className="h-16 shrink-0" />
                  </div>

                  {/* Code Input Area */}
                  <textarea
                    ref={textareaRef}
                    value={ideCodeText}
                    onChange={(e) => setIdeCodeText(e.target.value)}
                    onScroll={handleTextareaScroll}
                    spellCheck={false}
                    className="flex-1 bg-transparent text-slate-100 text-xs sm:text-sm font-mono resize-none focus:outline-none leading-6 tracking-wide selection:bg-purple-900 selection:text-white h-full overflow-y-auto py-0.5"
                    placeholder="Write code here..."
                  />
                </div>

                {/* Floating Action Buttons at Bottom Right of IDE with Swirl Framer Motion Animation */}
                <AnimatePresence>
                  {isIdeMode && (
                    <motion.div
                      key="ide-floating-actions"
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                      className="absolute bottom-2 right-4 z-50 flex items-center -space-x-4 pointer-events-auto filter drop-shadow-2xl"
                    >
                      {/* RESET BUTTON (STANDALONE SVG) */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.15, rotate: -10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          soundManager.playClick();
                          setIdeCodeText(getInitialIdeCode(activeWorldId));
                        }}
                        className="relative w-12 h-12 sm:w-14 sm:h-14 focus:outline-none cursor-pointer border-0 bg-transparent p-0 shrink-0"
                        title="Reset Code to Starter Template"
                      >
                        <Image
                          src="/IDE_Reset.svg"
                          alt="Reset Code"
                          fill
                          className="object-contain"
                        />
                      </motion.button>

                      {/* COPY BUTTON (STANDALONE SVG) */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          soundManager.playClick();
                          navigator.clipboard.writeText(ideCodeText);
                        }}
                        className="relative w-12 h-12 sm:w-14 sm:h-14 focus:outline-none cursor-pointer border-0 bg-transparent p-0 shrink-0"
                        title="Copy Code to Clipboard"
                      >
                        <Image
                          src="/IDE_Copy.svg"
                          alt="Copy Code"
                          fill
                          className="object-contain"
                        />
                      </motion.button>

                      {/* RUN BUTTON (STANDALONE SVG) */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          soundManager.playClick();
                          if (onRunCode) {
                            onRunCode(program, speed);
                          }
                        }}
                        className="relative w-12 h-12 sm:w-14 sm:h-14 focus:outline-none cursor-pointer border-0 bg-transparent p-0 shrink-0"
                        title="Run Code"
                      >
                        <Image
                          src="/IDE_Run.svg"
                          alt="Run Code"
                          fill
                          className="object-contain"
                        />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
          <div 
            style={{ height: `${topSectionPercent}%` }} 
            className="w-full flex items-stretch gap-2 flex-shrink-0 min-h-[90px] relative"
          >
            {/* Heroes & Categories Selector Column */}
            <div 
              style={{ width: `${heroesPercent}%` }}
              className="flex flex-col space-y-3 h-full overflow-y-auto pl-2 pr-1 flex-shrink-0"
            >
              {/* Heroes Sub-section */}
              <div className="flex flex-col space-y-1.5">
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

              {/* Categories Sub-section Under Heroes */}
              <div className="flex flex-col space-y-1.5 pt-2 border-t border-slate-900/10 w-full">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">CATEGORIES</span>
                <div className="flex flex-wrap gap-1.5 w-full">
                  {categoryTabs.filter(tab => isWorld2 || tab.id !== 'html').map((tab) => {
                    const isSelected = activeCategory === tab.id || (activeCategory === 'controls' && tab.id === 'control');
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          soundManager.playClick();
                          setActiveCategory(tab.id);
                        }}
                        className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-black transition text-center whitespace-normal break-words leading-tight border shadow-sm ${
                          isSelected
                            ? 'ring-2 ring-amber-400 scale-105 border-white shadow-md'
                            : 'opacity-75 hover:opacity-100 border-transparent'
                        } ${tab.color}`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Draggable Horizontal Splitter */}
            <div
              onPointerDown={handleHorizontalSplitPointerDown}
              className="w-2.5 h-full cursor-col-resize bg-slate-300/60 hover:bg-amber-400 rounded-full flex items-center justify-center transition flex-shrink-0 select-none shadow-sm"
              title="Drag horizontally to adjust Heroes & Categories vs Palette split width"
            >
              <IconGripVertical className="w-3 h-3 text-slate-700 opacity-70 pointer-events-none" />
            </div>

            {/* Block Palette Column */}
            <div className="flex-1 flex flex-col space-y-1.5 h-full overflow-hidden">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-900 lowercase tracking-widest">
                  palette ({activeCategory.toLowerCase()})
                </span>
              </div>

              <div className="bg-white/50 rounded-2xl border border-slate-300/80 h-full overflow-y-auto w-full shadow-inner p-2 relative flex flex-col justify-between">
                <div 
                  style={{
                    transform: `scale(${paletteZoomScale})`,
                    transformOrigin: 'top left',
                    width: `${100 / Math.max(0.1, paletteZoomScale)}%`,
                  }}
                  className="flex flex-wrap items-start content-start gap-2 transition-transform duration-150 ease-out"
                >
                  {filteredPalette.map((block) => {
                    const isLoop = isLoopBlockType(block.type);

                    return (
                      <div
                        key={block.type}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify(block));
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={(e) => handleAddBlock(block, e as any)}
                        className="cursor-grab active:cursor-grabbing hover:brightness-105 transition-all shrink-0"
                        title="Click or drag to drop in code stack"
                      >
                        {isLoop ? (
                          <PureCSSLoopBlock 
                            type={block.type}
                            label={block.label}
                            repeatCount={block.repeatCount ?? 1}
                            isPalette={true}
                          />
                        ) : (
                          <PureCSSBlock 
                            category={block.category}
                            type={block.type} 
                            label={block.label} 
                            stepValue={block.stepValue}
                            textValue={block.textValue}
                            isPalette={true} 
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Floating Palette Zoom Controls */}
                <div className="sticky bottom-0 right-0 ml-auto pt-1 z-30 pointer-events-auto shrink-0">
                  <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full border border-slate-300 shadow-md">
                    <button
                      onClick={() => { soundManager.playClick(); setPaletteZoomScale(z => Math.max(0.5, Math.round((z - 0.15) * 100) / 100)); }}
                      disabled={paletteZoomScale <= 0.5}
                      className="p-1 rounded-full text-slate-700 hover:text-slate-950 hover:bg-amber-400/50 disabled:opacity-30 transition cursor-pointer"
                      title="Zoom Out Palette (-15%)"
                    >
                      <IconZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { soundManager.playClick(); setPaletteZoomScale(1); }}
                      className="px-1 text-[10px] font-mono font-black text-slate-800 hover:text-amber-600 transition cursor-pointer"
                      title="Reset Palette Zoom (100%)"
                    >
                      {Math.round(paletteZoomScale * 100)}%
                    </button>
                    <button
                      onClick={() => { soundManager.playClick(); setPaletteZoomScale(z => Math.min(1.75, Math.round((z + 0.15) * 100) / 100)); }}
                      disabled={paletteZoomScale >= 1.75}
                      className="p-1 rounded-full text-slate-700 hover:text-slate-950 hover:bg-amber-400/50 disabled:opacity-30 transition cursor-pointer"
                      title="Zoom In Palette (+15%)"
                    >
                      <IconZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
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

          {/* Interlocking Code Stack Dropzone: Single Unified Reorderable Code Stack Column */}
          <div 
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              try {
                const json = e.dataTransfer.getData('application/json');
                if (json) {
                  const blockDef = JSON.parse(json);
                  if (program.length < (maxBlocks ?? 25)) {
                    soundManager.playSnap();
                    const newBlock: CodeBlock = {
                      ...blockDef,
                      instanceId: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    };
                    setProgram((prev) => [...prev, newBlock]);
                  } else {
                    soundManager.playError();
                  }
                }
              } catch (err) {}
            }}
            ref={codeStackContainerRef}
            className={`relative flex-1 min-h-[120px] overflow-y-auto flex flex-col space-y-2 p-3 rounded-2xl border transition-all w-full shadow-inner items-start ${
              isDraggingOver 
                ? 'bg-amber-400/20 border-2 border-dashed border-amber-400 ring-4 ring-amber-400/30' 
                : 'bg-white/50 border-slate-300/80'
            }`}
          >
            {/* Zoomable Container Wrapper */}
            <div
              style={{
                transform: `scale(${codeStackZoomScale})`,
                transformOrigin: 'top left',
                width: `${100 / Math.max(0.1, codeStackZoomScale)}%`,
              }}
              className="transition-transform duration-150 ease-out flex-1 w-full flex flex-col space-y-3"
            >
              {isWorld2 ? (
                <div className="w-full flex items-start space-x-14 overflow-x-auto pb-24 min-h-[220px]">
                  {/* Left Stack: Events / Motion Blocks */}
                  <div className="flex flex-col items-start min-w-[200px] pb-24 min-h-[200px]">
                    <Reorder.Group 
                      axis="y" 
                      values={motionBlocks} 
                      onReorder={setMotionBlocks} 
                      className="w-full flex flex-col items-start space-y-[-2px] pb-24 min-h-[180px]"
                    >
                      <AnimatePresence>
                        {motionBlocks.map((block, index) => {
                          const originalIndex = program.findIndex(b => b.instanceId === block.instanceId);
                          const isActive = activeStepIndex === originalIndex;
                          return renderBlockNode(block, originalIndex, isActive);
                        })}
                      </AnimatePresence>
                    </Reorder.Group>
                  </div>

                  {/* Right Stack: HTML Hat & HTML Blocks */}
                  <div className="flex flex-col items-start min-w-[200px] pl-6 border-l-2 border-dashed border-slate-300/80 pb-24 min-h-[200px]">
                    <Reorder.Group 
                      axis="y" 
                      values={htmlBlocks} 
                      onReorder={setHtmlBlocks} 
                      className="w-full flex flex-col items-start space-y-[-2px] pb-24 min-h-[180px]"
                    >
                      <AnimatePresence>
                        {htmlBlocks.map((block, index) => {
                          const originalIndex = program.findIndex(b => b.instanceId === block.instanceId);
                          const isActive = activeStepIndex === originalIndex;
                          return renderBlockNode(block, originalIndex, isActive);
                        })}
                      </AnimatePresence>
                    </Reorder.Group>
                  </div>
                </div>
              ) : (
                <Reorder.Group 
                  axis="y" 
                  values={program} 
                  onReorder={(newProg) => {
                    const hats = newProg.filter(b => b.type === 'when_flag_clicked' || b.type === 'when_html_started');
                    const rest = newProg.filter(b => b.type !== 'when_flag_clicked' && b.type !== 'when_html_started');
                    setProgram([...hats, ...rest]);
                  }} 
                  className="w-full flex flex-col items-start space-y-[-2px] pb-24 min-h-[200px]"
                >
                  <AnimatePresence>
                    {program.map((block, index) => {
                      const isActive = activeStepIndex === index;
                      return renderBlockNode(block, index, isActive);
                    })}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </div>

            {/* Floating Code Stack Zoom Control Widget locked to bottom-right of stack dropzone */}
            <div className="sticky bottom-0 right-0 ml-auto pt-1 z-50 pointer-events-auto shrink-0 shadow-lg">
              <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full border border-slate-300 shadow-md">
                <button
                  onClick={() => { soundManager.playClick(); setCodeStackZoomScale(z => Math.max(0.5, Math.round((z - 0.15) * 100) / 100)); }}
                  disabled={codeStackZoomScale <= 0.5}
                  className="p-1 rounded-full text-slate-700 hover:text-slate-950 hover:bg-amber-400/50 disabled:opacity-30 transition cursor-pointer"
                  title="Zoom Out Code Stack (-15%)"
                >
                  <IconZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { soundManager.playClick(); setCodeStackZoomScale(1); }}
                  className="px-1 text-[10px] font-mono font-black text-slate-800 hover:text-amber-600 transition cursor-pointer"
                  title="Reset Code Stack Zoom (100%)"
                >
                  {Math.round(codeStackZoomScale * 100)}%
                </button>
                <button
                  onClick={() => { soundManager.playClick(); setCodeStackZoomScale(z => Math.min(1.75, Math.round((z + 0.15) * 100) / 100)); }}
                  disabled={codeStackZoomScale >= 1.75}
                  className="p-1 rounded-full text-slate-700 hover:text-slate-950 hover:bg-amber-400/50 disabled:opacity-30 transition cursor-pointer"
                  title="Zoom In Code Stack (+15%)"
                >
                  <IconZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            </div>

          </>
          )}
        </div>
      )}
    </div>

  </motion.div>
  );
};
