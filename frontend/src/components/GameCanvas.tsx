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
  IconHammer
} from '@tabler/icons-react';
import { LevelConfig, PathWaypoint } from '@/types/game';
import { BoardCharacterSprite } from '@/components/BoardCharacterSprite';
import { soundManager } from '@/utils/sound';
import { API_BASE_URL } from '@/utils/api';

interface GameCanvasProps {
  level: LevelConfig;
  playerPos: { r: number; c: number; dir: 'N' | 'E' | 'S' | 'W' };
  currentWaypointIndex: number;
  collectedCoins: number[];
  speechBubble: string | null;
  equippedHat: string;
  characterName: string;
  selectedCharacter: string;
  onUpdateWaypoints?: (newWaypoints: PathWaypoint[]) => void;
  userRole?: string;
  totalXP?: number;
  levelScore?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  currentWaypointIndex,
  collectedCoins,
  selectedCharacter,
  onUpdateWaypoints,
  speechBubble,
  userRole = 'user',
  totalXP = 250,
  levelScore = 0,
}) => {
  const dragControls = useDragControls();

  const defaultWaypoints = level.waypoints || [];
  const [liveWaypoints, setLiveWaypoints] = useState<PathWaypoint[]>(defaultWaypoints);
  
  React.useEffect(() => {
    setLiveWaypoints(level.waypoints || []);
  }, [level]);

  const currentWaypoint = liveWaypoints[currentWaypointIndex] || liveWaypoints[0] || { xPercent: 35, yPercent: 15 };

  // Determine Monkey Sprite Face & Orientation (X-axis vs Y-axis)
  const calculateSpriteOrientation = () => {
    if (!liveWaypoints || liveWaypoints.length === 0) {
      return { spriteSrc: '/monkey1.svg', flipX: false };
    }

    let currIdx = currentWaypointIndex;
    let nextIdx = currentWaypointIndex + 1;

    if (nextIdx >= liveWaypoints.length) {
      currIdx = Math.max(0, liveWaypoints.length - 2);
      nextIdx = liveWaypoints.length - 1;
    }

    const wpCurr = liveWaypoints[currIdx];
    const wpNext = liveWaypoints[nextIdx];

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
        spriteSrc: '/monkey1_forward_x.png',
        flipX: dx < 0, // Flip horizontally if moving West / left
      };
    }

    // If movement vector is along Y-axis (vertical)
    return {
      spriteSrc: '/monkey1.svg',
      flipX: false,
    };
  };

  const { spriteSrc: activeSpriteSrc, flipX: activeFlipX } = calculateSpriteOrientation();

  // Interactive Zoom State: Clamped strictly between 1.0x (100% fully stretched) and 3.0x (300%)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

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
        localStorage.setItem(`level_waypoints_${level.levelNumber}`, JSON.stringify(liveWaypoints));
      }
    } catch (e) {}

    if (onUpdateWaypoints) onUpdateWaypoints(liveWaypoints);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/levels/${level.levelNumber}/waypoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level_number: level.levelNumber,
          waypoints: liveWaypoints,
        }),
      });
      if (res.ok) {
        console.log(`✅ Level ${level.levelNumber} waypoints saved to MySQL database!`);
      }
    } catch (err) {
      console.warn('DB save API call warning:', err);
    } finally {
      setIsSavingToDB(false);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="w-full h-full min-h-screen fixed inset-0 z-10 flex flex-col justify-between overflow-hidden font-sans bg-[#0d0906]">
      
      {/* Top Floating Control Bar - Compact Sticky/Fixed to Top Left */}
      <div className="no-board-click fixed top-2 sm:top-3 left-2 sm:left-4 z-[9999] flex items-center space-x-1 sm:space-x-1.5 liquid-glass px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border-[0.5px] border-white/20 shadow-md max-w-fit pointer-events-auto">
        
        <div className="flex items-center space-x-0.5 sm:space-x-1 border-r border-slate-900/15 pr-1.5 sm:pr-2.5 mr-0.5">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={() => { 
              soundManager.playClick(); 
              setZoomLevel(prev => Math.max(1.0, Math.round((prev - 0.1) * 10) / 10)); 
            }}
            className="w-6 h-6 sm:w-7.5 sm:h-7.5 rounded-full bg-white/90 border border-slate-300 flex items-center justify-center text-slate-800 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer shadow-sm pointer-events-auto shrink-0 select-none active:scale-90"
            title="Zoom Out (Min 100% Fully Stretched)"
          >
            <IconZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 pointer-events-none" />
          </button>
          
          <span className="text-[9px] sm:text-[11px] font-black text-slate-950 font-mono w-6 sm:w-8 text-center select-none pointer-events-none">
            {Math.round(zoomLevel * 100)}%
          </span>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={() => { 
              soundManager.playClick(); 
              setZoomLevel(prev => Math.min(3.0, Math.round((prev + 0.1) * 10) / 10)); 
            }}
            className="w-6 h-6 sm:w-7.5 sm:h-7.5 rounded-full bg-white/90 border border-slate-300 flex items-center justify-center text-slate-800 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer shadow-sm pointer-events-auto shrink-0 select-none active:scale-90"
            title="Zoom In"
          >
            <IconZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 pointer-events-none" />
          </button>

          {/* Quick Zoom Presets */}
          <div className="hidden xs:flex items-center space-x-0.5 pl-0.5">
            <button
              type="button"
              onClick={() => { soundManager.playClick(); setZoomLevel(1.0); }}
              className="px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 border border-slate-300 text-[9px] sm:text-[10px] font-black text-slate-800 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer shadow-sm pointer-events-auto select-none active:scale-95"
              title="Reset Zoom to 100%"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => { soundManager.playClick(); setZoomLevel(1.5); }}
              className="px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 border border-slate-300 text-[9px] sm:text-[10px] font-black text-slate-800 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer shadow-sm pointer-events-auto select-none active:scale-95"
              title="Zoom to 150%"
            >
              150%
            </button>
          </div>
        </div>

        {/* User Total XP Badge */}
        <div className="bg-amber-400 text-slate-950 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-amber-600 font-black text-[9px] sm:text-[11px] shadow-sm flex items-center space-x-1 select-none">
          <span className="text-amber-900">⚡</span>
          <span>{totalXP} XP</span>
        </div>

        {/* Level Score Badge */}
        <div className="bg-emerald-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-600 font-black text-[9px] sm:text-[11px] shadow-sm flex items-center space-x-1 select-none">
          <span>🏆</span>
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
        <div className="bg-amber-400 text-slate-950 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-600 font-black text-[9px] sm:text-[11px] shadow-sm flex items-center space-x-1 select-none pointer-events-none">
          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative flex-shrink-0 pointer-events-none">
            <Image src="/coin.svg" alt="Coin" fill className="object-contain pointer-events-none" />
          </div>
          <span>{collectedCoins.length}/{liveWaypoints.filter(w => w.type === 'coin').length}</span>
        </div>
      </div>

      {/* Main FULL-SCREEN MAZE DISPLAY */}
      <div 
        onWheel={handleWheelZoom}
        className="w-full h-full fixed inset-0 z-10 flex items-center justify-center overflow-hidden bg-[#0d0906]"
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
            src={level.bgImage || `/The Lost Monkey Explorer - Level ${level.levelNumber || level.id || 1}.svg`} 
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

                {/* 6. Normal Path Badge - Only visible during Track Mapper calibration */}
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
                        <option value="goal">Finish Pipe</option>
                      </select>

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
