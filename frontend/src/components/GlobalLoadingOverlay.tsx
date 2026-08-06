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
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md select-none pointer-events-auto"
        >
          {/* Monkey1 Zooming In & Out Consistently with Smooth Motion */}
          <motion.div
            animate={{
              scale: [0.85, 1.25, 0.85],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-28 h-28 sm:w-36 sm:h-36 filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
          >
            <Image
              src="/monkey1.svg"
              alt="Loading Monkey"
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
