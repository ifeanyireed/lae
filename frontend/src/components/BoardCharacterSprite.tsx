'use client';

import React from 'react';
import Image from 'next/image';

interface BoardCharacterSpriteProps {
  selectedCharacter?: string;
  className?: string;
}

export const BoardCharacterSprite: React.FC<BoardCharacterSpriteProps> = ({ className = "w-14 h-14" }) => {
  return (
    <div className={`relative flex items-center justify-center z-[100] ${className}`}>
      <Image
        src="/monkey1.svg"
        alt="Monkey 1 Sprite"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
};
