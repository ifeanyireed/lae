'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { IconTrophy, IconStar, IconArrowRight, IconShirt } from '@tabler/icons-react';
import { soundManager } from '@/utils/sound';

interface VictoryModalProps {
  levelTitle: string;
  stars: number;
  xpEarned: number;
  onNextLevel: () => void;
  onOpenCustomizer: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelTitle,
  stars = 3,
  xpEarned = 250,
  onNextLevel,
  onOpenCustomizer,
}) => {
  useEffect(() => {
    soundManager.playEquip();

    // Launch Confetti Explosion
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="w-full max-w-md liquid-glass rounded-3xl p-6 sm:p-8 border border-slate-300 text-center flex flex-col items-center space-y-5 relative shadow-2xl"
      >
        <div className="glass-glint" />

        {/* Hero Trophy Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-400 border border-amber-600 flex items-center justify-center shadow-md animate-bounce">
          <IconTrophy className="w-9 h-9 text-slate-950" />
        </div>

        {/* Victory Title */}
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-wide uppercase">STAGE CLEARED!</h2>
          <p className="text-xs font-black text-slate-800">{levelTitle}</p>
        </div>

        {/* 3-Star Rating Row */}
        <div className="flex items-center space-x-2 my-1">
          {[1, 2, 3].map((starIndex) => (
            <motion.div
              key={starIndex}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: starIndex * 0.2 }}
            >
              <IconStar 
                className={`w-8 h-8 ${
                  starIndex <= stars 
                    ? 'text-amber-500 fill-amber-400 drop-shadow' 
                    : 'text-slate-300 fill-slate-200'
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* XP Badge */}
        <div className="bg-white/80 border border-slate-300 px-4 py-1.5 rounded-full font-black text-slate-950 text-xs shadow-sm flex items-center space-x-1.5">
          <span>+</span>
          <span className="text-amber-600 font-mono text-sm">{xpEarned} XP</span>
          <span>REWARD</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <button
            onClick={() => { soundManager.playClick(); onOpenCustomizer(); }}
            className="px-4 py-3 rounded-full bg-white/80 border border-slate-300 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 hover:bg-white transition shadow-sm cursor-pointer"
          >
            <IconShirt className="w-4 h-4 text-amber-600" />
            <span>CUSTOMIZER</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(); onNextLevel(); }}
            className="px-4 py-3 rounded-full bg-amber-400 border border-amber-600 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 hover:bg-amber-300 transition shadow-sm cursor-pointer"
          >
            <span>NEXT STAGE</span>
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>

      </motion.div>
    </div>
  );
};
