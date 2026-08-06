'use client';

import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';
import { soundManager } from '@/utils/sound';

interface VictoryModalProps {
  levelTitle?: string;
  stars?: number;
  xpEarned?: number;
  onNextLevel: () => void;
  onOpenCustomizer?: () => void;
  onClose?: () => void;
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

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelTitle = 'Level Complete',
  stars = 3,
  xpEarned = 250,
  onNextLevel,
  onOpenCustomizer,
  onClose,
}) => {
  useEffect(() => {
    soundManager.playEquip();

    // Launch Confetti Explosion
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const handleNext = () => {
    soundManager.playClick();
    onNextLevel();
  };

  const handleDismiss = () => {
    soundManager.playClick();
    if (onClose) {
      onClose();
    } else {
      onNextLevel();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Dark Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
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

        {/* Main Badge Wooden Sign Board Container matching badge_banner.svg */}
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
            onClick={handleDismiss}
            className="absolute top-8 right-8 z-40 p-2 rounded-full bg-amber-950/80 hover:bg-amber-900 text-amber-200 hover:text-white transition border-2 border-amber-400/60 cursor-pointer shadow-xl"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content Overlay matching LevelWelcomeModal & badge_banner.svg layout */}
          <div className="relative z-10 flex flex-col justify-between h-full pt-6 pb-8 px-8 sm:px-12">
            
            {/* 1. TOP GREEN LEAF RIBBON: STAGE CLEARED! */}
            <div className="text-center pt-8 sm:pt-10">
              <span className="inline-block px-4 py-1 text-xs sm:text-sm font-black font-varela uppercase tracking-tighter text-white">
                STAGE CLEARED!
              </span>
            </div>

            {/* 2. CENTER WOODEN BOARD: 3-Star Rating */}
            <div className="text-center my-auto pt-2 space-y-2">
              {/* 3-Star Rating Row using /maze_star.svg */}
              <div className="flex items-center justify-center space-x-2 pt-1">
                {[1, 2, 3].map((starIndex) => (
                  <motion.div
                    key={starIndex}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 18, delay: starIndex * 0.15 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0 drop-shadow-lg"
                  >
                    <Image
                      src="/maze_star.svg"
                      alt="Star"
                      fill
                      className={`object-contain transition ${starIndex <= stars ? 'brightness-110' : 'grayscale opacity-40'}`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* LOWER WOODEN RIBBON AREA: "+250 XP REWARD" */}
              <div className="pt-1">
                <span className="font-black font-varela uppercase tracking-tighter text-amber-300 text-sm sm:text-base drop-shadow-md">
                  +{xpEarned} XP REWARD
                </span>
              </div>
            </div>

            {/* 3. BOTTOM GRASS BASE: Zooming next_stage.svg Button */}
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
                onClick={handleNext}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full transition cursor-pointer flex-shrink-0 drop-shadow-2xl z-30"
                title="Next Stage"
              >
                <Image src="/next_stage.svg" alt="Next Stage Button" fill className="object-contain" priority />
              </motion.button>
            </div>

          </div>

          {/* LOWER LEVEL TEXT: Absolute fixed position sitting cleanly on lower ribbon */}
          <div className="absolute bottom-[120px] sm:bottom-[136px] left-0 right-0 text-center z-20 pointer-events-none">
            <span className="font-black font-varela uppercase tracking-tighter text-white text-sm sm:text-base drop-shadow-md">
              NEXT STAGE
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
