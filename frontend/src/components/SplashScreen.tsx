'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { soundManager } from '@/utils/sound';

interface SplashScreenProps {
  onStartGame: () => void;
  onOpenAuth: () => void;
  onCodeSubmit?: (code: string) => Promise<boolean>;
  username: string;
  role: string;
  groupName: string;
  totalXP: number;
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

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onStartGame,
  onOpenAuth,
  onCodeSubmit,
  username,
  role,
  groupName,
  totalXP,
}) => {
  const [gameCode, setGameCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeStatus, setCodeStatus] = useState<string | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 4) {
      val = `${val.slice(0, 4)}-${val.slice(4)}`;
    }
    setGameCode(val);
  };

  const handleStart = async () => {
    soundManager.playClick();
    if (gameCode.trim() && onCodeSubmit) {
      setIsSubmitting(true);
      setCodeStatus('Validating Code...');
      const ok = await onCodeSubmit(gameCode.trim());
      setIsSubmitting(false);
      if (ok) {
        onStartGame();
      } else {
        setCodeStatus('Invalid Code. Contact your Teacher or Guardian.');
      }
    } else {
      onStartGame();
    }
  };

  const handleAuth = () => {
    soundManager.playClick();
    onOpenAuth();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0906] select-none font-varela overflow-hidden"
    >
      {/* Background Image with High Transparency Blur Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/full_maze.jpeg"
          alt="Full Maze Background"
          fill
          className="object-cover object-center filter brightness-90 contrast-110 blur-xl scale-105 opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" />
      </div>

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

      {/* Main Badge Wooden Sign Board Container matching LevelWelcomeModal pop screen verbatim */}
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

        {/* Top Right Session Auth Button using locked.svg without circle */}
        <button
          type="button"
          onClick={handleAuth}
          className="absolute top-6 right-6 z-40 p-1 transition transform hover:scale-110 active:scale-95 cursor-pointer drop-shadow-lg"
          title="Session Auth & Database Config"
        >
          <div className="relative w-10 h-10 sm:w-14 sm:h-14">
            <Image
              src="/locked.svg"
              alt="Session Auth Lock"
              fill
              className="object-contain"
            />
          </div>
        </button>

        {/* Content Overlay directly matching badge_sample.jpg / LevelWelcomeModal layout */}
        <div className="relative z-10 flex flex-col justify-between h-full pt-6 pb-8 px-8 sm:px-12">
          
          {/* 1. TOP GREEN LEAF RIBBON: PUZZLEPRO */}
          <div className="text-center pt-8 sm:pt-10">
            <span className="inline-block px-4 py-1 text-xs sm:text-sm font-black font-varela uppercase tracking-tighter text-white">
              PUZZLEPRO
            </span>
          </div>

          {/* 2. CENTER WOODEN BOARD: Monkey Sprite Avatar & 3D Game Code Input */}
          <div className="text-center my-auto pt-1 sm:pt-2 space-y-0 max-w-[68%] sm:max-w-[62%] mx-auto flex flex-col items-center justify-center">
            {/* Monkey 1 Avatar Header (layered behind the input field) */}
            <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 drop-shadow-xl transform hover:scale-105 transition -mb-5 sm:-mb-7 pointer-events-none">
              <Image
                src="/monkey1.svg"
                alt="Monkey Explorer"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* 3D INPUT FIELD: ENTER GAME CODE (layered in front of monkey) */}
            <div className="w-full pt-0 pb-1 px-1 relative z-20">
              <input
                type="text"
                value={gameCode}
                onChange={handleCodeChange}
                maxLength={9}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStart();
                  }
                }}
                placeholder="ENTER GAME CODE"
                className="w-full px-3 py-1.5 sm:py-2 text-center text-xs sm:text-sm font-black font-varela uppercase tracking-wider text-amber-950 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 border-2 border-amber-800/90 rounded-xl shadow-[0_4px_0_0_rgba(120,53,15,0.9),0_6px_12px_rgba(0,0,0,0.4)] focus:shadow-[0_2px_0_0_rgba(120,53,15,0.9),0_3px_6px_rgba(0,0,0,0.4)] focus:translate-y-0.5 focus:outline-none placeholder:text-amber-900/50 transition cursor-text"
              />
              {codeStatus && (
                <p className="text-[10px] text-amber-200 font-bold mt-1 drop-shadow animate-pulse">
                  {codeStatus}
                </p>
              )}
            </div>
          </div>

          {/* 3. BOTTOM GRASS BASE: Zooming Map.svg / Quest.svg Button */}
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
              onClick={handleStart}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full transition cursor-pointer flex-shrink-0 drop-shadow-2xl z-30"
              title="Start Level"
            >
              <Image src="/Login.svg" alt="Login Start Button" fill className="object-contain" priority />
            </motion.button>
          </div>

        </div>

        {/* LOCKED LOWER LEVEL TEXT: Absolute fixed position sitting cleanly on lower ribbon */}
        <div className="absolute bottom-[120px] sm:bottom-[136px] left-0 right-0 text-center z-20 pointer-events-none">
          <span className="font-black font-varela uppercase tracking-tighter text-white text-sm sm:text-base drop-shadow-md">
            WELCOME
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
