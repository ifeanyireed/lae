'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({
  isLoading,
  message = 'Synchronizing Adventure Data...',
}) => {
  const confettiItems = [
    { src: '/confetti1.svg', posClass: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', size: 'w-7 h-7 sm:w-9 sm:h-9' },
    { src: '/confetti2.svg', posClass: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2', size: 'w-6 h-6 sm:w-8 sm:h-8' },
    { src: '/confetti3.svg', posClass: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', size: 'w-7 h-7 sm:w-9 sm:h-9' },
    { src: '/confetti4.svg', posClass: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2', size: 'w-6 h-6 sm:w-8 sm:h-8' },
  ];

  const outerConfetti = [
    { src: '/confetti2.svg', posClass: 'top-2 left-2', size: 'w-5 h-5 sm:w-7 sm:h-7' },
    { src: '/confetti4.svg', posClass: 'top-2 right-2', size: 'w-6 h-6 sm:w-8 sm:h-8' },
    { src: '/confetti1.svg', posClass: 'bottom-2 right-2', size: 'w-5 h-5 sm:w-7 sm:h-7' },
    { src: '/confetti3.svg', posClass: 'bottom-2 left-2', size: 'w-6 h-6 sm:w-8 sm:h-8' },
  ];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 bg-slate-950/65 backdrop-blur-lg select-none font-varela pointer-events-auto"
        >
          {/* Central Monkey Sprite Container with Swirling Waves & Confetti */}
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 flex items-center justify-center">
            
            {/* Wave Ring 1 - Primary Expanding Wave */}
            <motion.div
              animate={{
                scale: [0.8, 1.8, 2.4],
                opacity: [0.95, 0.4, 0],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.7)]"
            />

            {/* Wave Ring 2 - Secondary Expanding Wave */}
            <motion.div
              animate={{
                scale: [0.8, 1.8, 2.4],
                opacity: [0.95, 0.4, 0],
              }}
              transition={{
                duration: 2.4,
                delay: 0.8,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full border-4 border-emerald-400/75 shadow-[0_0_30px_rgba(52,211,153,0.6)]"
            />

            {/* Swirling Confetti Wave Orbit Ring 1 (Clockwise Swirl) */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                rotate: { duration: 3.5, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute inset-[-14px] sm:inset-[-20px] rounded-full border-2 border-dashed border-amber-300/50"
            >
              {confettiItems.map((item, index) => (
                <motion.div
                  key={`inner-confetti-${index}`}
                  animate={{
                    rotate: [0, -360],
                    scale: [0.9, 1.2, 0.9],
                  }}
                  transition={{
                    rotate: { duration: 3.5, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 },
                  }}
                  className={`absolute ${item.posClass} ${item.size} filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}
                >
                  <Image
                    src={item.src}
                    alt="Swirling Confetti Wave"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Swirling Confetti Wave Orbit Ring 2 (Counter-Clockwise Outer Swirl) */}
            <motion.div
              animate={{
                rotate: -360,
                scale: [1.15, 0.95, 1.15],
              }}
              transition={{
                rotate: { duration: 5.5, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute inset-[-30px] sm:inset-[-42px] rounded-full border border-dashed border-emerald-400/40"
            >
              {outerConfetti.map((item, index) => (
                <motion.div
                  key={`outer-confetti-${index}`}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.25, 1],
                  }}
                  transition={{
                    rotate: { duration: 5.5, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 },
                  }}
                  className={`absolute ${item.posClass} ${item.size} filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}
                >
                  <Image
                    src={item.src}
                    alt="Outer Swirling Confetti Wave"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Center Monkey 1 Avatar */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-24 h-24 sm:w-32 sm:h-32 z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
            >
              <Image
                src="/monkey1.svg"
                alt="Loading Monkey"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Loading Subtext */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 text-center z-20"
          >
            <p className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-200 drop-shadow-md animate-pulse">
              {message}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-amber-400/70 uppercase tracking-widest mt-1">
              PuzzlePro Platform Engine
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
