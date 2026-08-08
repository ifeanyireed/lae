'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Star, ArrowLeft } from 'lucide-react';
import { soundManager } from '@/utils/sound';
import { ALL_ADVENTURES, ALL_WORLDS } from '@/utils/levels';
import { getCdnUrl } from '@/utils/cdn';

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
  userRole?: string;
}

export const AdventureMapModal: React.FC<AdventureMapModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  currentLevelIndex,
  levelsProgress,
  totalXP,
  groupName = 'Jungle Explorers Group A',
  userRole = 'user',
}) => {
  const [lockedVibrateIdx, setLockedVibrateIdx] = useState<number | null>(null);
  const [selectedAdvId, setSelectedAdvId] = useState<number | null>(null);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);

  if (!isOpen) return null;

  const isAdmin = userRole === 'admin';
  const currentWorld = ALL_WORLDS.find((w) => w.id === selectedWorldId) || ALL_WORLDS[0];
  const currentAdv = currentWorld.adventures.find((a) => a.id === selectedAdvId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-amber-600/40 pb-4 mb-4 z-10 shrink-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {currentAdv ? (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedAdvId(null);
                  }}
                  className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex-shrink-0 transition transform hover:scale-110 active:scale-95 cursor-pointer z-20"
                >
                  <Image src="/Back.svg" alt="Back to Adventures" fill className="object-contain" />
                </button>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
                  <Image src="/Map.svg" alt="Map Icon" fill className="object-contain" />
                </div>
              )}

              <div>
                <h2 className="text-xl sm:text-3xl font-black font-varela text-amber-200 uppercase tracking-tight">
                  {currentAdv ? currentAdv.title : currentWorld.name}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-amber-400 mt-0.5">
                  {currentAdv ? currentAdv.story : currentWorld.description}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-600/50">
                  {currentWorld.name}
                </span>
                <span className="text-xs text-amber-200 font-mono">
                  {currentWorld.language} • {currentWorld.theme}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-100 mt-1">
                {currentAdv ? currentAdv.title : 'Select an Adventure'}
              </h2>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                if (currentAdv) {
                  setSelectedAdvId(null);
                } else {
                  onClose();
                }
              }}
              className="p-2 rounded-xl bg-amber-900/60 text-amber-200 hover:bg-amber-800 transition cursor-pointer border border-amber-500/40"
              title="Close or Back"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Temporary World Selector Bar (Left Vertical Sidebar) */}
          {isAdmin && !currentAdv && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col space-y-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-300 shadow-2xl items-center">
              <span className="text-[10px] font-black text-slate-950 px-1 font-mono uppercase tracking-wider text-center max-w-[70px] leading-tight">
                Admin Worlds
              </span>
              <div className="w-full h-px bg-slate-300 my-1" />
              {ALL_WORLDS.map((w) => (
                <button
                  key={`adv-modal-world-${w.id}`}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedWorldId(w.id);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 shadow-sm text-center ${
                    selectedWorldId === w.id
                      ? 'bg-amber-400 text-slate-950 border border-amber-600 ring-2 ring-amber-500 scale-105'
                      : 'bg-white/90 text-slate-950 border border-slate-300 hover:bg-amber-400'
                  }`}
                >
                  World {w.id}
                </button>
              ))}
            </div>
          )}

          {/* TIER 1: TOP LEVEL ADVENTURES DIRECTORY VIEW (Monkeys & Padlocks styling) */}
          {!currentAdv ? (
            <div className="overflow-y-auto flex-1 pr-1 py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {currentWorld.adventures.map((adv) => {
                const advMonkeyImg = `/monkey${12 + adv.id}.svg`;
                const isAdvUnlocked = adv.id === 1 || isAdmin;
                const isVibrating = lockedVibrateIdx === adv.id;

                return (
                  <motion.div
                    key={`adv-node-${adv.id}`}
                    whileHover={isAdvUnlocked ? { scale: 1.05 } : {}}
                    whileTap={isAdvUnlocked ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (isAdvUnlocked) {
                        soundManager.playClick();
                        setSelectedAdvId(adv.id);
                      } else {
                        soundManager.playError();
                        setLockedVibrateIdx(adv.id);
                        setTimeout(() => setLockedVibrateIdx(null), 1200);
                      }
                    }}
                    className={`relative rounded-2xl p-3 flex flex-col items-center justify-between border-2 transition select-none cursor-pointer group ${
                      isAdvUnlocked
                        ? 'border-amber-400/80 bg-amber-900/90 hover:bg-amber-800 text-amber-100 shadow-xl'
                        : 'border-slate-700/60 bg-slate-900/70 text-slate-400 filter grayscale'
                    }`}
                  >
                    {/* Badge Indicator */}
                    <div className="w-full flex items-center justify-between mb-1">
                      <span className={`text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-full ${
                        isAdvUnlocked ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        ADV {adv.id}
                      </span>
                      <span className={`text-[10px] sm:text-xs font-black uppercase font-mono ${
                        isAdvUnlocked ? 'text-amber-300' : 'text-slate-500'
                      }`}>
                        {adv.concept}
                      </span>
                    </div>

                    {/* Monkey Sprite Thumbnail + Finish / 3x Zooming Lock Badge */}
                    <motion.div
                      animate={isVibrating ? {
                        x: [-12, 12, -10, 10, -6, 6, -3, 3, 0],
                        rotate: [-6, 6, -4, 4, -2, 2, 0],
                      } : {}}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="w-24 h-24 sm:w-28 sm:h-28 relative my-1 flex items-center justify-center flex-shrink-0"
                    >
                      <Image
                        src={getCdnUrl(advMonkeyImg)}
                        alt={adv.title}
                        fill
                        className={`object-contain transition ${isAdvUnlocked ? 'filter drop-shadow-md group-hover:scale-105' : 'opacity-40'}`}
                      />

                      <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 z-10 filter drop-shadow-lg">
                        {isAdvUnlocked ? (
                          <Image
                            src={getCdnUrl("/maze_finish.svg")}
                            alt="Adventure Unlocked"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <motion.div
                            className="relative w-full h-full"
                            animate={isVibrating ? {
                              scale: [1, 2.2, 1, 2.2, 1, 2.2, 1],
                            } : {}}
                            transition={{ duration: 0.9, ease: 'easeInOut' }}
                          >
                            <Image
                              src={getCdnUrl("/locked.svg")}
                              alt="Locked Adventure"
                              fill
                              className="object-contain drop-shadow-xl"
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Title & Concept Name */}
                    <div className="text-center w-full mt-1">
                      <h4 className={`text-xs sm:text-sm font-black uppercase tracking-tight line-clamp-1 transition ${
                        isAdvUnlocked ? 'text-amber-100 group-hover:text-white' : 'text-slate-500'
                      }`}>
                        {adv.title}
                      </h4>
                      <span className={`text-xs font-black mt-0.5 block ${
                        isAdvUnlocked ? 'text-emerald-400' : 'text-slate-600'
                      }`}>
                        12 Levels
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* TIER 2: SELECTED ADVENTURE 12-LEVEL GRID VIEW */
            <div className="overflow-y-auto flex-1 pr-2 py-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {currentAdv.levels.map((lvl, idx) => {
                const lvlProg = levelsProgress[idx];
                const isCurrent = currentLevelIndex === idx && selectedAdvId === (currentAdv.id || 1);
                const isAdmin = userRole === 'admin';
                const isUnlocked = isAdmin || (lvlProg?.unlocked || lvlProg?.completed || idx === 0);

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
                          {lvlProg?.completed ? 'COMPLETED' : (isCurrent ? 'ACTIVE' : 'READY')}
                        </span>
                      ) : (
                        <Lock className="w-4 h-4 text-amber-500/80 animate-pulse" />
                      )}
                    </div>

                    {/* Icon Thumbnail */}
                    <motion.div
                      animate={lockedVibrateIdx === idx ? {
                        x: [-12, 12, -10, 10, -6, 6, -3, 3, 0],
                        rotate: [-6, 6, -4, 4, -2, 2, 0],
                      } : {}}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="w-14 h-14 sm:w-16 sm:h-16 relative my-2 flex items-center justify-center"
                    >
                      <Image
                        src={getCdnUrl(`/monkey${((lvl.levelNumber - 1) % 23) + 1}.svg`)}
                        alt={lvl.title}
                        fill
                        className={`object-contain transition ${isUnlocked ? 'filter drop-shadow-md' : 'filter grayscale opacity-40'}`}
                      />

                      {isUnlocked ? (
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 z-10 filter drop-shadow-md">
                          <Image
                            src={getCdnUrl("/maze_finish.svg")}
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
                              starIdx <= (lvlProg?.stars || (lvlProg?.completed ? 3 : 0))
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
          )}

          {/* Maze Items Legend / Key Bar */}
          <div className="border-t border-amber-600/30 pt-3 mt-3 flex items-center justify-center sm:justify-between flex-wrap gap-2 z-10 shrink-0 bg-amber-900/40 px-3 py-2 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center space-x-1 mr-1">
              <span>🔑</span>
              <span>MAZE KEY:</span>
            </span>

            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2.5 text-[10px] font-bold text-amber-200">
              <div className="flex items-center space-x-1.5 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-600/30">
                <div className="w-4 h-4 relative shrink-0">
                  <Image src="/maze_start.svg" alt="Start Pipe" fill className="object-contain" />
                </div>
                <span>Start Pipe</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-600/30">
                <div className="w-4 h-4 relative shrink-0">
                  <Image src="/maze_finish.svg" alt="Goal Finish" fill className="object-contain" />
                </div>
                <span>Goal Finish</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-600/30">
                <div className="w-4 h-4 relative shrink-0">
                  <Image src="/coin.svg" alt="Gold Coin" fill className="object-contain" />
                </div>
                <span>Gold Coin</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-600/30">
                <div className="w-4 h-4 relative shrink-0">
                  <Image src="/maze_star.svg" alt="Advance 3" fill className="object-contain" />
                </div>
                <span>Advance 3</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-600/30">
                <div className="w-4 h-4 relative shrink-0">
                  <Image src="/maze_dander.svg" alt="Go Back" fill className="object-contain" />
                </div>
                <span>Go Back</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-600/30">
                <div className="w-4 h-4 relative shrink-0">
                  <Image src="/maze_pit.svg" alt="Reset to Start" fill className="object-contain" />
                </div>
                <span>Reset to Start</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
