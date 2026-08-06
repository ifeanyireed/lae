'use client';

import React from 'react';
import Image from 'next/image';

interface BoardCharacterSpriteProps {
  selectedCharacter?: string;
  className?: string;
  spriteSrc?: string;
  flipX?: boolean;
}

export const BoardCharacterSprite: React.FC<BoardCharacterSpriteProps> = ({
  className = "w-14 h-14",
  spriteSrc = "/monkey1.svg",
  flipX = false,
}) => {
  return (
    <div
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
    </div>
  );
};
