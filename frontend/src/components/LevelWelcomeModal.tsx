'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Play, X, Award } from 'lucide-react';
import { soundManager } from '@/utils/sound';

export interface LevelInfo {
  id: number;
  levelNumber: number;
  title: string;
  objective: string;
  mechanic: string;
  svgMap: string;
  maxBlocks: number;
  totalLevels: number;
  adventureTitle: string;
  story: string;
}

interface LevelWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLevel: () => void;
  levelInfo: LevelInfo;
}

const CONFETTI_SVGS = [
  '/confetti1.svg',
  '/confetti2.svg',
  '/confetti3.svg',
  '/confetti4.svg',
];

const CONFETTI_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  svg: CONFETTI_SVGS[i % CONFETTI_SVGS.length],
  left: (i * 5.3 + 12) % 95,
  size: 40 + ((i * 17) % 80),
  duration: 15 + ((i * 3) % 10),
  delay: (i * 0.45) % 6,
  rotation: (i * 73) % 360,
  sway: -30 + ((i * 25) % 60),
}));

export const LevelWelcomeModal: React.FC<LevelWelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartLevel,
  levelInfo,
}) => {
  if (!isOpen) return null;

  const handleStart = () => {
    soundManager.playClick();
    onStartLevel();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Dark Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Slow Falling Confetti Snow Animation */}
        <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden z-20">
          {CONFETTI_PARTICLES.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                y: -160,
                x: `${particle.left}vw`,
                rotate: particle.rotation,
                opacity: 0.9,
              }}
              animate={{
                y: [-160, 1200],
                x: [`${particle.left}vw`, `calc(${particle.left}vw + ${particle.sway}px)`],
                rotate: particle.rotation + 360,
                opacity: [0.9, 1, 0.85, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                top: 0,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
            >
              <Image
                src={particle.svg}
                alt="Confetti"
                width={particle.size}
                height={particle.size}
                className="object-contain"
              />
            </motion.div>
          ))}
        </div>

        {/* Main Badge Wooden Sign Board Container matching badge_sample.jpg */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-[540px] aspect-[4029/3386] z-30 flex flex-col justify-between select-none font-varela"
        >
          {/* Background Wooden Frame SVG */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/badge_banner.svg"
              alt="Badge Banner Background"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Top Right Close Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="absolute top-8 right-8 z-40 p-2 rounded-full bg-amber-950/80 hover:bg-amber-900 text-amber-200 hover:text-white transition border-2 border-amber-400/60 cursor-pointer shadow-xl"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content Overlay directly matching badge_sample.jpg layout */}
          <div className="relative z-10 flex flex-col justify-between h-full pt-6 pb-8 px-8 sm:px-12">
            
            {/* 1. TOP GREEN LEAF RIBBON: PUZZLEPRO */}
            <div className="text-center pt-8 sm:pt-10">
              <span className="inline-block px-4 py-1 text-xs sm:text-sm font-black font-varela uppercase tracking-tighter text-white">
                PUZZLEPRO
              </span>
            </div>

            {/* 2. CENTER WOODEN BOARD: Level Title ("Power Up") & Mechanics */}
            <div className="text-center my-auto pt-6 sm:pt-10 mt-2 sm:mt-3 space-y-2 max-w-[68%] sm:max-w-[62%] mx-auto flex flex-col items-center justify-center">
              <h1 className="font-black font-varela uppercase tracking-tighter text-white text-2xl sm:text-3xl md:text-4xl leading-[0.88] drop-shadow-md break-words text-balance px-2 pt-3 sm:pt-5">
                {levelInfo.title}
              </h1>

              {/* LOWER WOODEN RIBBON AREA: "BASIC MOVEMENT" */}
              <div className="pt-1">
                <span className="font-black font-varela uppercase tracking-tighter text-white text-xs sm:text-sm md:text-base drop-shadow-md">
                  BASIC MOVEMENT
                </span>
              </div>
            </div>

            {/* 3. BOTTOM GRASS BASE: Zooming Map.svg Button */}
            <div className="pt-1 pb-2 text-center max-w-xs mx-auto w-full flex justify-center">
              <motion.button
                animate={{
                  scale: [1, 0.75, 1.1, 0.75, 1.1, 0.75, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.15, filter: 'brightness(1.18)' }}
                whileTap={{ scale: 0.90 }}
                onClick={handleStart}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full transition cursor-pointer flex-shrink-0 drop-shadow-2xl z-30"
                title="Start Level"
              >
                <Image src="/Quest.svg" alt="Start Level Quest Button" fill className="object-contain" priority />
              </motion.button>
            </div>

          </div>

          {/* LOCKED LOWER LEVEL 1 TEXT: Absolute fixed position sitting cleanly on lower ribbon */}
          <div className="absolute bottom-[120px] sm:bottom-[136px] left-0 right-0 text-center z-20 pointer-events-none">
            <span className="font-black font-varela uppercase tracking-tighter text-white text-sm sm:text-base drop-shadow-md">
              LEVEL {levelInfo.levelNumber}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
