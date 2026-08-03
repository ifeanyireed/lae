'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  IconTrophy, 
  IconX
} from '@tabler/icons-react';
import { soundManager } from '@/utils/sound';

interface CustomizerLeaderboardProps {
  onClose: () => void;
}

export const CustomizerLeaderboard: React.FC<CustomizerLeaderboardProps> = ({
  onClose,
}) => {
  const leaderboards = [
    { rank: 1, name: 'Alex_Master', score: 1420, avatar: '/images/character1.jpg', badge: 'CHAMPION' },
    { rank: 2, name: 'Monkey Coder', score: 1250, avatar: '/images/character2.jpg', badge: 'PRO' },
    { rank: 3, name: 'Swamp_Runner', score: 980, avatar: '/images/character3.jpg', badge: 'STAR' },
    { rank: 4, name: 'CodeNinja_99', score: 870, avatar: '/images/character4.jpg', badge: 'EXPERT' },
    { rank: 5, name: 'PixelQuest', score: 620, avatar: '/images/character5.jpg', badge: 'ROOKIE' },
    { rank: 6, name: 'BananaKing', score: 540, avatar: '/images/character6.jpg', badge: 'TOP 10' },
    { rank: 7, name: 'ScratchWizard', score: 490, avatar: '/images/character7.jpg', badge: 'TOP 10' },
    { rank: 8, name: 'TurboJumper', score: 410, avatar: '/images/character8.jpg', badge: 'TOP 10' },
    { rank: 9, name: 'CosmicMonkey', score: 350, avatar: '/images/character9.jpg', badge: 'TOP 10' },
    { rank: 10, name: 'MazeMaster_X', score: 290, avatar: '/images/character10.jpg', badge: 'TOP 10' },
  ];

  const textColors = [
    { rankBg: 'bg-amber-400 text-amber-950 border-amber-600', name: 'text-amber-900', badge: 'bg-amber-400/30 text-amber-950 border-amber-500/40', score: 'text-amber-700' },
    { rankBg: 'bg-emerald-400 text-emerald-950 border-emerald-600', name: 'text-emerald-900', badge: 'bg-emerald-400/30 text-emerald-950 border-emerald-500/40', score: 'text-emerald-700' },
    { rankBg: 'bg-sky-400 text-sky-950 border-sky-600', name: 'text-sky-900', badge: 'bg-sky-400/30 text-sky-950 border-sky-500/40', score: 'text-sky-700' },
    { rankBg: 'bg-purple-400 text-purple-950 border-purple-600', name: 'text-purple-900', badge: 'bg-purple-400/30 text-purple-950 border-purple-500/40', score: 'text-purple-700' },
    { rankBg: 'bg-rose-400 text-rose-950 border-rose-600', name: 'text-rose-900', badge: 'bg-rose-400/30 text-rose-950 border-rose-500/40', score: 'text-rose-700' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 flex flex-col max-h-[80vh] border border-white/60 relative overflow-hidden z-10 shadow-xl"
    >
      {/* Sticky Header Bar with identical transparent background */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-900/15 pb-4 bg-transparent">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Scaled Up Standalone Finish Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex-shrink-0">
            <Image src="/maze_finish.svg" alt="Finish Icon" fill className="object-contain" />
          </div>

          {/* Title and Subtitle Column */}
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-medium text-slate-950 tracking-tight leading-tight">
              Leaderboard
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight mt-0.5">
              Top Tabletop Scratch Coders & Explorers
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => { soundManager.playClick(); onClose(); }}
          className="w-8.5 h-8.5 rounded-full bg-slate-950/10 border border-slate-900/20 flex items-center justify-center text-slate-950 hover:bg-slate-950/20 transition cursor-pointer shadow-sm"
        >
          <IconX className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* SCROLLABLE LEADERBOARD LIST WITH STAGGERED RISING ROW ANIMATION */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.07,
              delayChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        className="divide-y divide-slate-900/15 py-1 overflow-y-auto max-h-[55vh] pr-1.5 scrollbar-thin"
      >
        {leaderboards.map((user, index) => {
          const color = textColors[index % textColors.length];
          return (
            <motion.div
              key={user.rank}
              variants={{
                hidden: { opacity: 0, y: 35, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 350, damping: 24 },
                },
              }}
              className="py-3 px-2 flex items-center justify-between transition hover:bg-slate-900/5"
            >
              <div className="flex items-center space-x-3.5">
                <span className={`w-7 h-7 rounded-full font-mono font-black text-xs flex items-center justify-center shadow-sm border ${color.rankBg}`}>
                  #{user.rank}
                </span>
                <div className="w-8.5 h-8.5 relative flex-shrink-0 rounded-full overflow-hidden border border-slate-400 shadow-sm">
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className={`text-base font-bold ${color.name}`}>{user.name}</h4>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${color.badge}`}>
                  {user.badge}
                </span>
                <span className={`text-base font-black font-mono tracking-tight ${color.score}`}>
                  {user.score} XP
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
