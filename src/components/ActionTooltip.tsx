'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionTooltipProps {
  label: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delayMs?: number;
  children: React.ReactNode;
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label,
  position = 'bottom',
  delayMs = 1200,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHovered(false);
  };

  const handleClick = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHovered(false);
  };

  const positionClasses = {
    bottom: 'top-full mt-4 left-1/2 -translate-x-1/2',
    top: 'bottom-full mb-4 left-1/2 -translate-x-1/2',
    left: 'right-full mr-4 top-1/2 -translate-y-1/2',
    right: 'left-full ml-4 top-1/2 -translate-y-1/2',
  };

  const animationVariants = {
    bottom: { initial: { opacity: 0, y: -10, scale: 0.85 }, animate: { opacity: 1, y: 0, scale: 1 } },
    top: { initial: { opacity: 0, y: 10, scale: 0.85 }, animate: { opacity: 1, y: 0, scale: 1 } },
    left: { initial: { opacity: 0, x: 10, scale: 0.85 }, animate: { opacity: 1, x: 0, scale: 1 } },
    right: { initial: { opacity: 0, x: -10, scale: 0.85 }, animate: { opacity: 1, x: 0, scale: 1 } },
  };

  return (
    <div 
      className="relative inline-flex items-center justify-center pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={animationVariants[position].initial}
            animate={animationVariants[position].animate}
            exit={animationVariants[position].initial}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`absolute z-[100] pointer-events-none whitespace-nowrap ${positionClasses[position]}`}
          >
            {/* Oval White Bubble */}
            <div className="relative bg-white/85 backdrop-blur-md text-slate-800 text-[10px] sm:text-[12px] px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full border border-white/50 flex items-center justify-center relative overflow-visible shadow-sm">
              
              {/* Ultra Tiny Water Droplet Sheen Highlight */}
              <div className="absolute inset-x-3 top-0.5 h-0.5 rounded-full bg-white/60 pointer-events-none" />

              {/* Label Text */}
              <span className="text-slate-700 font-medium tracking-wide">
                {label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
