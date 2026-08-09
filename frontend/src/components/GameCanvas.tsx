'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  IconTarget, 
  IconTrash, 
  IconRotateClockwise, 
  IconCheck, 
  IconZoomIn, 
  IconZoomOut, 
  IconGripHorizontal, 
  IconX,
  IconHammer,
  IconWorld,
  IconBolt,
  IconTrophy,
  IconCoin,
  IconFlag
} from '@tabler/icons-react';
import { LevelConfig, PathWaypoint } from '@/types/game';
import { BoardCharacterSprite } from '@/components/BoardCharacterSprite';
import { soundManager } from '@/utils/sound';
import { GAME_ENGINE_API_URL } from '@/utils/api';
import { getCdnUrl, preloadNextLevelImage } from '@/utils/cdn';

const HTML_BLOCK_CONFIGS: Record<string, { color: string; label: string; border: string }> = {
  doctype: { color: '#7E22CE', label: '<!doctype html>', border: '#6B21A8' },
  doctype_html: { color: '#7E22CE', label: '<!doctype html>', border: '#6B21A8' },
  html: { color: '#2563EB', label: '<html>', border: '#1D4ED8' },
  html_tag: { color: '#2563EB', label: '<html>', border: '#1D4ED8' },
  head: { color: '#FF9100', label: '<head>', border: '#E65100' },
  head_tag: { color: '#FF9100', label: '<head>', border: '#E65100' },
  title: { color: '#E91E63', label: '<title>', border: '#C2185B' },
  title_tag: { color: '#E91E63', label: '<title>', border: '#C2185B' },
};

interface GameCanvasProps {
  level: LevelConfig;
  selectedWorldId?: number;
  selectedAdventureId?: number;
  currentWaypointIndex: number;
  currentHeading?: 'N' | 'E' | 'S' | 'W';
  facingSegmentIndex?: number;
  overrideSpriteSrc?: string | null;
  isZoomingQuickly?: boolean;
  isJumping?: boolean;
  collectedCoins?: number[];
  speechBubble?: string | null;
  equippedHat?: string;
  characterName?: string;
  selectedCharacter?: string;
  onUpdateWaypoints?: (newWaypoints: PathWaypoint[]) => void;
  onUpdateMaxBlocks?: (newMaxBlocks: number) => void;
  userRole?: string;
  totalXP?: number;
  levelScore?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  selectedWorldId,
  selectedAdventureId,
  currentWaypointIndex,
  currentHeading,
  facingSegmentIndex,
  overrideSpriteSrc,
  isZoomingQuickly = false,
  isJumping = false,
  collectedCoins = [],
  selectedCharacter,
  onUpdateWaypoints,
  onUpdateMaxBlocks,
  speechBubble,
  userRole = 'user',
  totalXP = 250,
  levelScore = 0,
}) => {
  const dragControls = useDragControls();

  const defaultWaypoints = level.waypoints || [];
  const [liveWaypoints, setLiveWaypoints] = useState<PathWaypoint[]>(defaultWaypoints);
  const [maxBlocksAllowed, setMaxBlocksAllowed] = useState<number>(level.maxBlocks || 15);
  
  React.useEffect(() => {
    if (level.waypoints && level.waypoints.length > 0) {
      setLiveWaypoints(level.waypoints);
    }
    if (level.maxBlocks) {
      setMaxBlocksAllowed(level.maxBlocks);
    }
  }, [level.levelNumber, level.waypoints, level.maxBlocks]);

  const currentWaypoint = liveWaypoints[currentWaypointIndex] || liveWaypoints[0] || { xPercent: 35, yPercent: 15 };

  // Determine Monkey Sprite Face & Orientation (X-axis vs Y-axis)
  const calculateSpriteOrientation = () => {
    if (overrideSpriteSrc) {
      return { spriteSrc: overrideSpriteSrc, flipX: false };
    }

    if (currentHeading) {
      if (currentHeading === 'E') return { spriteSrc: '/monkey1_forward_right_x.svg', flipX: false };
      if (currentHeading === 'W') return { spriteSrc: '/monkey1_forward_left_x.svg', flipX: false };
      if (currentHeading === 'S') return { spriteSrc: '/monkey1.svg', flipX: false };
      if (currentHeading === 'N') return { spriteSrc: '/monkey1_backward_y.svg', flipX: false };
    }

    if (!liveWaypoints || liveWaypoints.length === 0) {
      return { spriteSrc: '/monkey1.svg', flipX: false };
    }

    let segmentStartIdx = facingSegmentIndex !== undefined ? facingSegmentIndex : currentWaypointIndex;
    let segmentEndIdx = segmentStartIdx + 1;

    if (segmentEndIdx >= liveWaypoints.length) {
      segmentStartIdx = Math.max(0, liveWaypoints.length - 2);
      segmentEndIdx = liveWaypoints.length - 1;
    }

    const wpCurr = liveWaypoints[segmentStartIdx];
    const wpNext = liveWaypoints[segmentEndIdx];

    if (!wpCurr || !wpNext) {
      return { spriteSrc: '/monkey1.svg', flipX: false };
    }

    const dx = (wpNext.xPercent ?? 0) - (wpCurr.xPercent ?? 0);
    const dy = (wpNext.yPercent ?? 0) - (wpCurr.yPercent ?? 0);

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // If movement vector is along X-axis (horizontal)
    if (absDx >= absDy) {
      return {
        spriteSrc: dx >= 0 ? '/monkey1_forward_right_x.svg' : '/monkey1_forward_left_x.svg',
        flipX: false,
      };
    }

    // If movement vector is along Y-axis (vertical)
    return {
      spriteSrc: dy >= 0 ? '/monkey1.svg' : '/monkey1_backward_y.svg',
      flipX: false,
    };
  };

  const { spriteSrc: activeSpriteSrc, flipX: activeFlipX } = calculateSpriteOrientation();

  // Interactive Zoom State: Clamped strictly between 1.0x (100% fully stretched) and 3.0x (300%)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Preload next level stage background image in advance
  React.useEffect(() => {
    const worldId = level.worldId || 1;
    const advId = level.adventureId || 1;
    const currentNum = level.levelNumber || level.id || 1;
    preloadNextLevelImage(advId, currentNum + 1, worldId);
  }, [level.worldId, level.adventureId, level.levelNumber, level.id]);

  const rawBgPath = level.bgImage || `/${level.worldId || 1}_${level.adventureId || 1}_${level.levelNumber || level.id || 1}.svg`;
  const bgCdnUrl = getCdnUrl(rawBgPath);

  // Detached Floating Figma Track Mapper Modal State
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [draggingWaypointIndex, setDraggingWaypointIndex] = useState<number | null>(null);
  const [builderModalSize, setBuilderModalSize] = useState({ width: 576, height: 320 });

  const boardRef = useRef<HTMLDivElement>(null);

  const handleResizePointerDown = (edge: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = builderModalSize.width;
    const startHeight = builderModalSize.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (edge.includes('right')) newWidth = Math.max(340, startWidth + deltaX);
      if (edge.includes('left')) newWidth = Math.max(340, startWidth - deltaX);
      if (edge.includes('bottom')) newHeight = Math.max(160, startHeight + deltaY);
      if (edge.includes('top')) newHeight = Math.max(160, startHeight - deltaY);

      setBuilderModalSize({ width: newWidth, height: newHeight });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Handle Mouse Wheel Zooming
  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(3.0, Math.round((prev + 0.1) * 10) / 10));
    } else {
      setZoomLevel(prev => Math.max(1.0, Math.round((prev - 0.1) * 10) / 10));
    }
  };

  // Convert Mouse Pointer (ClientX, ClientY) to Exact Un-scaled Relative Percentages (0-100%)
  const getRelativePercent = (clientX: number, clientY: number) => {
    if (!boardRef.current) return { xPercent: 50, yPercent: 50 };
    const rect = boardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, Math.round((x / rect.width) * 1000) / 10));
    const yPercent = Math.max(0, Math.min(100, Math.round((y / rect.height) * 1000) / 10));

    return { xPercent, yPercent };
  };

  // Click on canvas to add new waypoint
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!calibrationMode || draggingWaypointIndex !== null || target.closest('.no-board-click')) return;

    const { xPercent, yPercent } = getRelativePercent(e.clientX, e.clientY);

    soundManager.playClick();

    const newIndex = liveWaypoints.length;
    const newWp: PathWaypoint = {
      index: newIndex,
      xPercent,
      yPercent,
      type: newIndex === 0 ? 'start' : 'normal',
      label: `Tile #${newIndex + 1}`,
    };

    const updated = [...liveWaypoints, newWp];
    setLiveWaypoints(updated);
    if (onUpdateWaypoints) onUpdateWaypoints(updated);
  };

  // Start direct pointer dragging on a waypoint
  const handlePointerDownWaypoint = (index: number, e: React.PointerEvent) => {
    if (!calibrationMode) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    soundManager.playSnap();
    setDraggingWaypointIndex(index);
  };

  // Smooth real-time pointer move while dragging
  const handlePointerMoveWaypoint = (index: number, e: React.PointerEvent) => {
    if (draggingWaypointIndex !== index || !boardRef.current) return;
    e.stopPropagation();

    const { xPercent, yPercent } = getRelativePercent(e.clientX, e.clientY);

    const updated = liveWaypoints.map(wp => 
      wp.index === index ? { ...wp, xPercent, yPercent } : wp
    );
    setLiveWaypoints(updated);
    if (onUpdateWaypoints) onUpdateWaypoints(updated);
  };

  // Stop dragging waypoint
  const handlePointerUpWaypoint = (index: number, e: React.PointerEvent) => {
    if (draggingWaypointIndex === index) {
      e.stopPropagation();
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingWaypointIndex(null);
      soundManager.playClick();
    }
  };

  // Update position via numeric X% and Y% input controls
  const handleUpdatePosition = (index: number, field: 'xPercent' | 'yPercent', val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    const updated = liveWaypoints.map(wp => 
      wp.index === index ? { ...wp, [field]: clamped } : wp
    );
    setLiveWaypoints(updated);
    if (onUpdateWaypoints) onUpdateWaypoints(updated);
  };

  const handleUpdateTileType = (index: number, newType: PathWaypoint['type']) => {
    soundManager.playClick();
    let effect: PathWaypoint['effect'] = undefined;
    if (newType === 'star') effect = 'advance_3';
    if (newType === 'shell') effect = 'back_2';

    const updated = liveWaypoints.map(wp => 
      wp.index === index ? { ...wp, type: newType, effect } : wp
    );
    setLiveWaypoints(updated);
    if (onUpdateWaypoints) onUpdateWaypoints(updated);
  };

  const handleUpdateStartHeading = (index: number, initialHeading: 'N' | 'E' | 'S' | 'W') => {
    soundManager.playClick();
    const updated = liveWaypoints.map(wp => 
      wp.index === index ? { ...wp, initialHeading } : wp
    );
    setLiveWaypoints(updated);
    if (onUpdateWaypoints) onUpdateWaypoints(updated);
  };

  const handleDeleteWaypoint = (index: number) => {
    soundManager.playClick();
    const filtered = liveWaypoints.filter(wp => wp.index !== index).map((wp, i) => ({
      ...wp,
      index: i,
    }));
    setLiveWaypoints(filtered);
    if (onUpdateWaypoints) onUpdateWaypoints(filtered);
  };

  const handleDeleteAllPoints = () => {
    soundManager.playClick();
    setLiveWaypoints([]);
    if (onUpdateWaypoints) onUpdateWaypoints([]);
  };

  const [isSavingToDB, setIsSavingToDB] = useState(false);

  const handleSaveMaze = async () => {
    soundManager.playEquip();
    setIsSavingToDB(true);
    setSavedSuccess(true);

    // 1. Save locally to browser storage for instant reload persistence
    try {
      if (typeof window !== 'undefined') {
        const advId = level.adventureId || 1;
        const worldId = level.worldId || selectedWorldId || 1;
        localStorage.setItem(`level_waypoints_w${worldId}_adv${advId}_lvl${level.levelNumber}`, JSON.stringify(liveWaypoints));
        localStorage.setItem(`level_waypoints_world${worldId}_adv${advId}_lvl${level.levelNumber}`, JSON.stringify(liveWaypoints));
        localStorage.setItem(`level_maxblocks_w${worldId}_adv${advId}_lvl${level.levelNumber}`, maxBlocksAllowed.toString());
      }
    } catch (e) {}

    if (onUpdateWaypoints) onUpdateWaypoints(liveWaypoints);
    if (onUpdateMaxBlocks) onUpdateMaxBlocks(maxBlocksAllowed);

    try {
      const res = await fetch(`${GAME_ENGINE_API_URL}/api/v1/game/admin/levels/waypoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world_id: level.worldId || selectedWorldId || 1,
          adventure_id: level.adventureId || 1,
          level_number: level.levelNumber,
          max_blocks: maxBlocksAllowed,
          waypoints: liveWaypoints,
        }),
      });
      if (res.ok) {
        console.log(`✅ Level ${level.levelNumber} waypoints & max blocks (${maxBlocksAllowed}) saved to MySQL database!`);
      }
    } catch (err) {
      console.warn('DB save API call warning:', err);
    } finally {
      setIsSavingToDB(false);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="w-full h-full min-h-screen fixed inset-0 z-10 flex flex-col justify-between overflow-hidden font-sans bg-transparent">
      
      {/* Top Floating Control Bar - Compact Sticky/Fixed to Top Left */}
      <div className="no-board-click fixed top-2 sm:top-3 left-2 sm:left-4 z-[9999] flex items-center space-x-1 sm:space-x-1.5 liquid-glass px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border-[0.5px] border-white/20 shadow-md max-w-fit pointer-events-auto">
        
        {/* World, Adventure & Level Index Flag Badge */}
        <div className="bg-white/90 text-slate-950 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-300 shadow-md font-black text-[9px] sm:text-[11px] flex items-center space-x-1 sm:space-x-1.5 select-none" title="World . Adventure . Level Index">
          <IconFlag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500 shrink-0 pointer-events-none" />
          <span className="font-black font-varela tracking-tighter text-slate-950">
            {level.worldId || selectedWorldId || 1} . {level.adventureId || selectedAdventureId || 1} . {level.levelNumber || level.id || 1}
          </span>
        </div>

        {/* User Total XP Badge */}
        <div className="bg-white/90 text-slate-950 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-300 shadow-md font-black text-[9px] sm:text-[11px] flex items-center space-x-1 sm:space-x-1.5 select-none">
          <IconBolt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500 shrink-0 pointer-events-none" />
          <span>{totalXP} XP</span>
        </div>

        {/* Level Score Badge */}
        <div className="bg-white/90 text-slate-950 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-300 shadow-md font-black text-[9px] sm:text-[11px] flex items-center space-x-1 sm:space-x-1.5 select-none">
          <IconTrophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500 shrink-0 pointer-events-none" />
          <span>{levelScore} PTS</span>
        </div>

        {/* Admin Track Mapper Toggle Button - Only visible for Admin role */}
        {userRole === 'admin' && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setCalibrationMode(prev => !prev);
            }}
            className={`no-board-click px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-black transition flex items-center space-x-1 cursor-pointer pointer-events-auto shadow-md select-none active:scale-95 ${
              calibrationMode 
                ? 'bg-amber-400 text-slate-950 border border-amber-600 ring-2 ring-amber-500 scale-105' 
                : 'bg-white/90 text-slate-950 border border-slate-300 hover:bg-amber-400'
            }`}
            title="Toggle Track Mapper Modal"
          >
            <IconHammer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950 pointer-events-none" />
            <span className="pointer-events-none">{calibrationMode ? 'Hide Mapper' : 'Track Mapper'}</span>
          </button>
        )}

        {/* Collected Coins Badge */}
        <div className="bg-white/90 text-slate-950 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-300 shadow-md font-black text-[9px] sm:text-[11px] flex items-center space-x-1 sm:space-x-1.5 select-none pointer-events-none">
          <IconCoin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500 shrink-0 pointer-events-none" />
          <span>{collectedCoins.length}/{liveWaypoints.filter(w => w.type === 'coin').length}</span>
        </div>
      </div>

      {/* Floating Canvas Board Zoom Controls at Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-auto select-none">
        <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-300 shadow-md">
          <button
            type="button"
            onClick={() => { soundManager.playClick(); setZoomLevel(prev => Math.max(1.0, Math.round((prev - 0.1) * 10) / 10)); }}
            disabled={zoomLevel <= 1.0}
            className="p-1 rounded-full text-slate-700 hover:text-slate-950 hover:bg-amber-400/50 disabled:opacity-30 transition cursor-pointer"
            title="Zoom Out Canvas (-10%)"
          >
            <IconZoomOut className="w-3.5 h-3.5 pointer-events-none" />
          </button>
          <button
            type="button"
            onClick={() => { soundManager.playClick(); setZoomLevel(1.0); }}
            className="px-1 text-[10px] font-mono font-black text-slate-800 hover:text-amber-600 transition cursor-pointer"
            title="Reset Canvas Zoom (100%)"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={() => { soundManager.playClick(); setZoomLevel(prev => Math.min(3.0, Math.round((prev + 0.1) * 10) / 10)); }}
            disabled={zoomLevel >= 3.0}
            className="p-1 rounded-full text-slate-700 hover:text-slate-950 hover:bg-amber-400/50 disabled:opacity-30 transition cursor-pointer"
            title="Zoom In Canvas (+10%)"
          >
            <IconZoomIn className="w-3.5 h-3.5 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* Main FULL-SCREEN MAZE DISPLAY */}
      <div 
        onWheel={handleWheelZoom}
        className="w-full h-full fixed inset-0 z-10 flex items-center justify-center overflow-hidden bg-transparent"
      >
        <div 
          ref={boardRef}
          onClick={handleBoardClick}
          style={{ transform: `scale(${zoomLevel})` }}
          className={`w-full h-full relative overflow-hidden transform-gpu transition-transform duration-100 ${
            calibrationMode ? 'cursor-crosshair ring-4 ring-amber-400' : ''
          }`}
        >
          {/* Dynamic Level-Specific SVG / JPEG Background Artwork */}
          <Image 
            src={bgCdnUrl} 
            alt={level.title || "Level Maze Artwork"} 
            fill 
            unoptimized
            className="object-cover opacity-95 filter brightness-105 saturate-110 pointer-events-none select-none"
            priority
          />

          {/* Connected Waypoint Track Path Polyline Overlay - Only visible during Track Mapper calibration */}
          {calibrationMode && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={liveWaypoints.map(w => `${w.xPercent ?? 50},${w.yPercent ?? 50}`).join(' ')}
                fill="none"
                stroke="rgba(251, 191, 36, 0.65)"
                strokeWidth="4"
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}

          {/* Pixel-Exact Waypoint Handles */}
          {liveWaypoints.map((wp) => {
            const isPlayerHere = currentWaypointIndex === wp.index;
            const isCollected = collectedCoins.includes(wp.index);
            const isDragging = draggingWaypointIndex === wp.index;
            const posX = wp.xPercent ?? 50;
            const posY = wp.yPercent ?? 50;

            return (
              <div
                key={`wp-${wp.index}`}
                onPointerDown={(e) => handlePointerDownWaypoint(wp.index, e)}
                onPointerMove={(e) => handlePointerMoveWaypoint(wp.index, e)}
                onPointerUp={(e) => handlePointerUpWaypoint(wp.index, e)}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                className={`waypoint-handle-btn no-board-click -translate-x-1/2 -translate-y-1/2 absolute w-10 h-10 rounded-full flex items-center justify-center transition-transform z-20 ${
                  calibrationMode 
                    ? 'cursor-grab active:cursor-grabbing hover:scale-125 touch-none' 
                    : 'pointer-events-none'
                } ${isDragging ? 'scale-130 ring-4 ring-amber-400 z-50 shadow-[0_0_25px_rgba(251,191,36,1)]' : ''}`}
              >
                {/* 1. START Green Warp Pipe (maze_start.svg) - Offset slightly left of the waypoint point */}
                {wp.type === 'start' && (
                  <div className="w-10 h-10 relative flex items-center justify-center filter drop-shadow-md -translate-x-[65%]">
                    <Image src="/maze_start.svg" alt="Start Pipe" fill className="object-contain" />
                  </div>
                )}

                {/* 2. FINISH Goal Pipe (maze_finish.svg) */}
                {wp.type === 'goal' && (
                  <div className="w-10 h-10 relative flex items-center justify-center filter drop-shadow-md animate-bounce">
                    <Image src="/maze_finish.svg" alt="Finish Pipe" fill className="object-contain" />
                  </div>
                )}

                {/* 3. Gold Coin Tile (coin.svg) */}
                {wp.type === 'coin' && !isCollected && (
                  <motion.div 
                    animate={{ rotateY: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-8 h-8 relative flex items-center justify-center filter drop-shadow-md"
                  >
                    <Image src="/coin.svg" alt="Gold Coin" fill className="object-contain" />
                  </motion.div>
                )}

                {/* 4. Super Star Tile (maze_star.svg) */}
                {wp.type === 'star' && (
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="w-9 h-9 relative flex items-center justify-center filter drop-shadow-lg"
                  >
                    <Image src="/maze_star.svg" alt="Super Star" fill className="object-contain" />
                  </motion.div>
                )}

                {/* 5. Danger Hazard Tile (maze_dander.svg) */}
                {wp.type === 'shell' && (
                  <div className="w-9 h-9 relative flex items-center justify-center filter drop-shadow-lg animate-pulse">
                    <Image src="/maze_dander.svg" alt="Danger Hazard" fill className="object-contain" />
                  </div>
                )}

                {/* 6. Maze Pit Hazard Tile (maze_pit.svg) */}
                {wp.type === 'pit' && (
                  <div className="w-10 h-10 relative flex items-center justify-center filter drop-shadow-lg animate-pulse">
                    <Image src="/maze_pit.svg" alt="Maze Pit" fill className="object-contain" />
                  </div>
                )}

                {/* 7. HTML Block Tiles (doctype html, html, head, title) using /html.svg with assigned block color */}
                {wp.type && HTML_BLOCK_CONFIGS[wp.type] && (
                  <motion.div 
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="relative flex flex-col items-center justify-center filter drop-shadow-md group"
                    title={HTML_BLOCK_CONFIGS[wp.type].label}
                  >
                    <div className="w-8 h-8 relative flex items-center justify-center">
                      <div 
                        className="w-7 h-7 transition-transform group-hover:scale-115"
                        style={{
                          backgroundColor: HTML_BLOCK_CONFIGS[wp.type].color,
                          WebkitMaskImage: 'url(/html.svg)',
                          maskImage: 'url(/html.svg)',
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                        }}
                      />
                    </div>
                    <span 
                      className="text-[8px] font-mono font-black text-white px-1.5 py-0.5 rounded-md shadow-md border whitespace-nowrap -mt-0.5"
                      style={{ 
                        backgroundColor: HTML_BLOCK_CONFIGS[wp.type].color, 
                        borderColor: HTML_BLOCK_CONFIGS[wp.type].border 
                      }}
                    >
                      {HTML_BLOCK_CONFIGS[wp.type].label}
                    </span>
                  </motion.div>
                )}

                {/* 8. Normal Path Badge - Only visible during Track Mapper calibration */}
                {wp.type === 'normal' && calibrationMode && (
                  <div className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-slate-950 text-slate-950 font-mono font-black text-[10px] flex items-center justify-center shadow-lg">
                    {wp.index + 1}
                  </div>
                )}
              </div>
            );
          })}

          {/* Main Player Explorer Sprite - Positioned directly on board, animating strictly along the track axis */}
          {liveWaypoints.length > 0 && currentWaypoint && (
            <motion.div
              initial={false}
              animate={{
                left: `${currentWaypoint.xPercent ?? 50}%`,
                top: `${currentWaypoint.yPercent ?? 50}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24,
                mass: 0.8,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-[100] pointer-events-none"
            >
              {/* Organic Glass Thought Bubble - Absolutely positioned above the sprite */}
              <AnimatePresence>
                {speechBubble && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -54, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white/90 backdrop-blur-md text-slate-800 text-xs px-4 py-1.5 rounded-full border border-white/60 whitespace-nowrap z-[110] pointer-events-none flex items-center justify-center shadow-lg"
                  >
                    <div className="absolute inset-x-3 top-0.5 h-0.5 rounded-full bg-white/60 pointer-events-none" />
                    <span className="text-slate-800 font-bold tracking-wide">{speechBubble}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Monkey Character Sprite */}
              <div className="w-10 h-10 relative transform hover:scale-110 transition z-[100] flex items-center justify-center">
                <BoardCharacterSprite
                  selectedCharacter={selectedCharacter}
                  spriteSrc={activeSpriteSrc}
                  flipX={activeFlipX}
                  isZoomingQuickly={isZoomingQuickly}
                  isJumping={isJumping}
                />
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* DETACHED FLOATING TRACK MAPPER MODAL WITH 8-EDGE RESIZING */}
      <AnimatePresence>
        {calibrationMode && (
          <motion.div 
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.05}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            style={{ width: `${builderModalSize.width}px`, height: `${builderModalSize.height}px` }}
            className="no-board-click fixed bottom-24 left-1/2 -translate-x-1/2 z-[99999] liquid-glass rounded-3xl border-2 border-amber-500 p-5 flex flex-col space-y-3 overflow-auto min-w-[340px] min-h-[160px] pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
          >
            <div className="glass-glint" />

            {/* 4-Edge & 4-Corner Resizing Handles */}
            <div 
              onPointerDown={(e) => handleResizePointerDown('top', e)} 
              className="absolute top-0 left-3 right-3 h-2 cursor-ns-resize z-50 hover:bg-amber-400/30 rounded-t-xl transition"
            />
            <div 
              onPointerDown={(e) => handleResizePointerDown('bottom', e)} 
              className="absolute bottom-0 left-3 right-3 h-2 cursor-ns-resize z-50 hover:bg-amber-400/30 rounded-b-xl transition"
            />
            <div 
              onPointerDown={(e) => handleResizePointerDown('left', e)} 
              className="absolute top-3 bottom-3 left-0 w-2 cursor-ew-resize z-50 hover:bg-amber-400/30 rounded-l-xl transition"
            />
            <div 
              onPointerDown={(e) => handleResizePointerDown('right', e)} 
              className="absolute top-3 bottom-3 right-0 w-2 cursor-ew-resize z-50 hover:bg-amber-400/30 rounded-r-xl transition"
            />
            <div 
              onPointerDown={(e) => handleResizePointerDown('top-left', e)} 
              className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-amber-400/60 rounded-tl-xl transition"
            />
            <div 
              onPointerDown={(e) => handleResizePointerDown('top-right', e)} 
              className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-amber-400/60 rounded-tr-xl transition"
            />
            <div 
              onPointerDown={(e) => handleResizePointerDown('bottom-left', e)} 
              className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-amber-400/60 rounded-bl-xl transition"
            />
            <div 
              onPointerDown={(e) => handleResizePointerDown('bottom-right', e)} 
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-amber-400/60 rounded-br-xl transition"
            />

            {/* Header Drag Handle */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-between pb-2.5 border-b border-slate-900/15 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
            >
              <div className="flex items-center space-x-2">
                <IconGripHorizontal className="w-4 h-4 text-slate-800 opacity-80" />
                <span className="text-xs font-black text-slate-950">Track Mapper Modal ({liveWaypoints.length} Tiles)</span>
              </div>

              <div className="flex items-center space-x-2" onPointerDown={(e) => e.stopPropagation()}>
                {/* Max Blocks Allowed Input */}
                <div className="flex items-center space-x-1.5 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-400 shadow-sm" onPointerDown={(e) => e.stopPropagation()}>
                  <span className="text-[11px] font-black text-amber-950 uppercase tracking-tight whitespace-nowrap">Max Blocks:</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={maxBlocksAllowed}
                    onChange={(e) => setMaxBlocksAllowed(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-11 px-1 py-0.5 rounded-full bg-white text-slate-950 text-xs font-black text-center border border-amber-500 outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                    title="Edit Maximum Blocks Allowed for this Level"
                  />
                </div>

                {/* Delete All Points Button */}
                <button
                  type="button"
                  onClick={handleDeleteAllPoints}
                  className="px-3 py-1 rounded-full bg-red-500/20 border border-red-600/40 text-red-950 text-xs font-black flex items-center space-x-1 hover:bg-red-600 hover:text-white transition cursor-pointer"
                  title="Delete all waypoints"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                  <span>Delete All Points</span>
                </button>

                {/* Save Maze Button */}
                <button
                  type="button"
                  onClick={handleSaveMaze}
                  disabled={isSavingToDB}
                  className="bg-amber-400 text-slate-950 border border-amber-600 px-3.5 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-sm hover:bg-amber-300 transition cursor-pointer disabled:opacity-50"
                >
                  {savedSuccess ? <IconCheck className="w-3.5 h-3.5 text-slate-950" /> : null}
                  <span>{isSavingToDB ? 'Saving...' : savedSuccess ? 'Saved to DB!' : 'Save Maze to DB'}</span>
                </button>

                {/* Close Floating Track Mapper Modal */}
                <button
                  type="button"
                  onClick={() => setCalibrationMode(false)}
                  className="w-7 h-7 rounded-full bg-white/80 border border-slate-300 flex items-center justify-center text-slate-800 hover:text-slate-950 transition cursor-pointer shadow-sm"
                  title="Close Modal"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Waypoint List */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {liveWaypoints.length === 0 ? (
                <p className="text-xs font-black text-slate-900 text-center py-4">
                  Click anywhere on the board image or drag markers to map out your maze track!
                </p>
              ) : (
                liveWaypoints.map((wp) => (
                  <div 
                    key={`editor-${wp.index}`}
                    className="flex flex-wrap items-center justify-between bg-white/70 p-2.5 rounded-2xl border border-slate-300/80 gap-2 shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-950 border border-blue-600/40">
                        #{wp.index + 1}
                      </span>
                      
                      {/* Reposition Inputs */}
                      <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-950 font-bold">
                        <span>X:</span>
                        <input
                          type="number"
                          value={wp.xPercent ?? 0}
                          onChange={(e) => handleUpdatePosition(wp.index, 'xPercent', parseFloat(e.target.value) || 0)}
                          className="w-12 px-1 py-0.5 rounded-full bg-white text-slate-950 text-center border border-slate-400 font-black outline-none shadow-inner"
                        />
                        <span>% Y:</span>
                        <input
                          type="number"
                          value={wp.yPercent ?? 0}
                          onChange={(e) => handleUpdatePosition(wp.index, 'yPercent', parseFloat(e.target.value) || 0)}
                          className="w-12 px-1 py-0.5 rounded-full bg-white text-slate-950 text-center border border-slate-400 font-black outline-none shadow-inner"
                        />
                        <span>%</span>
                      </div>
                    </div>

                    {/* Tile Logic Selector */}
                    <div className="flex items-center space-x-2">
                      <select
                        value={wp.type || 'normal'}
                        onChange={(e) => handleUpdateTileType(wp.index, e.target.value as PathWaypoint['type'])}
                        className="bg-white text-slate-950 font-black text-xs px-2.5 py-1 rounded-full border border-slate-400 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
                      >
                        <option value="start">Start Pipe</option>
                        <option value="normal">Normal Tile</option>
                        <option value="coin">Gold Coin</option>
                        <option value="star">Super Star (Advance +3)</option>
                        <option value="shell">Danger Hazard (Go Back 2)</option>
                        <option value="pit">Maze Pit (Reset to Start)</option>
                        <optgroup label="HTML Blocks">
                          <option value="doctype">DOCTYPE HTML (&lt;!doctype html&gt;)</option>
                          <option value="html_tag">HTML Tag (&lt;html&gt;)</option>
                          <option value="head_tag">HEAD Tag (&lt;head&gt;)</option>
                          <option value="title_tag">TITLE Tag (&lt;title&gt;)</option>
                        </optgroup>
                        <option value="goal">Finish Pipe</option>
                      </select>

                      {wp.type === 'start' && (
                        <select
                          value={wp.initialHeading || 'S'}
                          onChange={(e) => handleUpdateStartHeading(wp.index, e.target.value as 'N' | 'E' | 'S' | 'W')}
                          className="bg-amber-100 text-slate-950 font-black text-xs px-2 py-1 rounded-full border border-amber-400 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
                          title="Start Facing Direction"
                        >
                          <option value="S">South (Facing Down Y-axis)</option>
                          <option value="E">East (Facing Right X-axis)</option>
                          <option value="W">West (Facing Left X-axis)</option>
                          <option value="N">North (Facing Up Y-axis)</option>
                        </select>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteWaypoint(wp.index)}
                        className="text-slate-600 hover:text-red-600 transition p-1"
                        title="Delete tile point"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
