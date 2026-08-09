'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingOverlayProps {
  isLoading: boolean;
  spriteSrc?: string;
  isQuickZoom?: boolean;
  message?: string;
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({
  isLoading,
  spriteSrc = '/monkey1.svg',
  isQuickZoom = false,
  message = 'Loading Coding Adventure...',
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-950 select-none pointer-events-auto"
        >
          {/* Glowing Ambient Halo behind Monkey */}
          <motion.div
            animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-amber-400/20 blur-2xl pointer-events-none"
          />

          {/* Monkey Sprite Container with Smooth Slow Zooming In and Out Animation */}
          <motion.div
            animate={
              isQuickZoom
                ? { scale: [0.8, 1.35, 0.85, 1.35, 0.85, 1.35, 1], rotate: [-4, 4, -4, 4, 0] }
                : { scale: [0.8, 1.3, 0.8], rotate: [-2, 2, -2] }
            }
            transition={{
              duration: 1.6,
              repeat: isQuickZoom ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-36 h-36 sm:w-48 sm:h-48 filter drop-shadow-[0_16px_36px_rgba(251,191,36,0.4)]"
          >
            <Image
              src={spriteSrc}
              alt="Monkey Loading Animation"
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Loading Subtitle */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-6 flex flex-col items-center gap-1.5"
          >
            <p className="text-sm sm:text-base font-semibold text-amber-300 tracking-wide uppercase font-mono">
              {message}
            </p>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping delay-150" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping delay-300" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
