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
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md select-none pointer-events-auto"
        >
          {/* Monkey Sprite Container with Smooth Heartbeat Pulsation Animation */}
          <motion.div
            animate={{
              scale: [0.92, 1.18, 1.02, 1.25, 0.92],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            className="relative w-36 h-36 sm:w-48 sm:h-48 filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.75)]"
          >
            <Image
              src={spriteSrc}
              alt="Monkey Loading Heartbeat Animation"
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
