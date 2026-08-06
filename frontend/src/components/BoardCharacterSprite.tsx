'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface BoardCharacterSpriteProps {
  selectedCharacter?: string;
  className?: string;
  spriteSrc?: string;
  flipX?: boolean;
  isZoomingQuickly?: boolean;
  isJumping?: boolean;
}

export const BoardCharacterSprite: React.FC<BoardCharacterSpriteProps> = ({
  className = "w-14 h-14",
  spriteSrc = "/monkey1.svg",
  flipX = false,
  isZoomingQuickly = false,
  isJumping = false,
}) => {
  return (
    <motion.div
      animate={
        isZoomingQuickly ? {
          scale: [1, 1.45, 0.85, 1.45, 0.85, 1.45, 0.85, 1.45, 0.85, 1],
        } : isJumping ? {
          y: [0, -35, 0],
          scale: [1, 1.25, 1],
        } : {}
      }
      transition={
        isJumping
          ? { duration: 0.5, ease: 'easeOut' }
          : { duration: 1.2, ease: 'easeInOut' }
      }
      className={`relative flex items-center justify-center z-[100] ${className}`}
      style={{
        transform: flipX ? 'scaleX(-1)' : 'none',
        transition: 'transform 0.2s ease-in-out',
      }}
    >
      <Image
        src={spriteSrc}
        alt="Monkey Character Sprite"
        fill
        className="object-contain drop-shadow-md"
        priority
      />
    </motion.div>
  );
};
