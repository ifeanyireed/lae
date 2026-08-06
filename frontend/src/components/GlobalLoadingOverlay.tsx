'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingOverlayProps {
  isLoading: boolean;
  spriteSrc?: string;
  isQuickZoom?: boolean;
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({
  isLoading,
  spriteSrc = '/monkey1.svg',
  isQuickZoom = false,
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md select-none pointer-events-auto"
        >
          {/* Monkey Sprite Container with Smooth Zooming Animation Matching Loading Overlay */}
          <motion.div
            animate={
              isQuickZoom
                ? { scale: [1, 1.3, 0.85, 1.3, 0.85, 1.3, 0.85, 1.3, 0.85, 1.3, 1] }
                : { scale: [0.85, 1.25, 0.85] }
            }
            transition={{
              duration: 1.8,
              repeat: isQuickZoom ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-32 h-32 sm:w-44 sm:h-44 filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
          >
            <Image
              src={spriteSrc}
              alt="Monkey Animation"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
