'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Star, Play } from 'lucide-react';
import { soundManager } from '@/utils/sound';

export interface LevelProgress {
  levelNumber: number;
  title: string;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  score: number;
}

interface AdventureMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (levelIndex: number) => void;
  currentLevelIndex: number;
  levelsProgress: LevelProgress[];
  totalXP: number;
  groupName?: string;
}

export const AdventureMapModal: React.FC<AdventureMapModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  currentLevelIndex,
  levelsProgress,
  totalXP,
  groupName = 'Jungle Explorers Group A',
}) => {
  const [lockedVibrateIdx, setLockedVibrateIdx] = React.useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-4xl bg-amber-950/95 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 z-30 shadow-2xl overflow-hidden font-varela select-none max-h-[88vh] flex flex-col"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-amber-600/40 pb-4 mb-4 z-10 shrink-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
                <Image src="/Map.svg" alt="Map Icon" fill className="object-contain" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-black font-varela text-amber-200 uppercase tracking-tight">
                  ADVENTURE MAP
                </h2>
                <p className="text-xs sm:text-sm font-bold text-amber-400">
                  PuzzlePro &bull; {groupName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full border border-amber-600 font-black text-xs shadow-sm flex items-center space-x-1">
                <span className="text-amber-950">⚡</span>
                <span>{totalXP} XP</span>
              </div>

              <button
                onClick={() => { soundManager.playClick(); onClose(); }}
                className="p-2 rounded-full bg-amber-900/80 hover:bg-amber-800 text-amber-200 hover:text-white transition border border-amber-500/40 cursor-pointer shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 12-Level Grid Path */}
          <div className="overflow-y-auto flex-1 pr-2 py-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {levelsProgress.map((lvl, idx) => {
              const isCurrent = currentLevelIndex === idx;
              const isUnlocked = lvl.unlocked || idx === 0 || idx <= currentLevelIndex;

              return (
                <motion.div
                  key={`lvl-node-${lvl.levelNumber}`}
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (isUnlocked) {
                      soundManager.playClick();
                      onSelectLevel(idx);
                      onClose();
                    } else {
                      soundManager.playError();
                      setLockedVibrateIdx(idx);
                      setTimeout(() => setLockedVibrateIdx(null), 1200);
                    }
                  }}
                  className={`relative rounded-2xl p-4 flex flex-col items-center justify-between border-2 transition select-none ${
                    isUnlocked
                      ? isCurrent
                        ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-amber-300 text-slate-950 ring-4 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.8)] cursor-pointer'
                        : 'bg-amber-900/80 hover:bg-amber-800/90 border-amber-400/60 text-amber-100 cursor-pointer shadow-lg'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-500 cursor-pointer filter grayscale'
                  }`}
                >
                  {/* Badge Level Indicator */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-full ${
                      isUnlocked ? (isCurrent ? 'bg-slate-950 text-amber-300' : 'bg-amber-950 text-amber-200') : 'bg-slate-800 text-slate-500'
                    }`}>
                      LEVEL {lvl.levelNumber}
                    </span>

                    {isUnlocked ? (
                      <span className="text-[10px] font-black uppercase text-amber-300">
                        {lvl.completed ? 'COMPLETED' : (isCurrent ? 'ACTIVE' : 'READY')}
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-amber-500/80 animate-pulse" />
                    )}
                  </div>

                  {/* Icon Thumbnail: Monkey Sprite + Locked SVG overlay (vibrates monkey & 3x zooms locked.svg) */}
                  <motion.div
                    animate={lockedVibrateIdx === idx ? {
                      x: [-12, 12, -10, 10, -6, 6, -3, 3, 0],
                      rotate: [-6, 6, -4, 4, -2, 2, 0],
                    } : {}}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="w-14 h-14 sm:w-16 sm:h-16 relative my-2 flex items-center justify-center"
                  >
                    <Image
                      src={`/monkey${((lvl.levelNumber - 1) % 23) + 1}.svg`}
                      alt={lvl.title}
                      fill
                      className={`object-contain transition ${isUnlocked ? 'filter drop-shadow-md' : 'filter grayscale opacity-40'}`}
                    />

                    {isUnlocked ? (
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 z-10 filter drop-shadow-md">
                        <Image
                          src="/maze_finish.svg"
                          alt="Activated Level"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <motion.div
                        className="absolute inset-0 z-20"
                        animate={lockedVibrateIdx === idx ? {
                          scale: [1, 2.2, 1, 2.2, 1, 2.2, 1],
                        } : {}}
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                      >
                        <Image
                          src="/locked.svg"
                          alt="Locked Level"
                          fill
                          className="object-contain drop-shadow-xl"
                        />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Title & Stars */}
                  <div className="text-center w-full mt-1">
                    <h4 className={`text-xs sm:text-sm font-black uppercase tracking-tight line-clamp-1 ${
                      isCurrent ? 'text-slate-950' : 'text-amber-100'
                    }`}>
                      {lvl.title}
                    </h4>

                    {/* Star Rating Display */}
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={`star-${lvl.levelNumber}-${starIdx}`}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= (lvl.stars || (lvl.completed ? 3 : 0))
                              ? 'text-amber-400 fill-amber-400 drop-shadow'
                              : 'text-slate-600 fill-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
