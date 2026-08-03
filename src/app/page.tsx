'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomizerLeaderboard } from '@/components/CustomizerLeaderboard';
import { BlocklyEditor, CodeBlock } from '@/components/BlocklyEditor';
import { GameCanvas } from '@/components/GameCanvas';
import { VictoryModal } from '@/components/VictoryModal';
import { ActionTooltip } from '@/components/ActionTooltip';
import { PUZZLE_LEVELS } from '@/utils/levels';
import { PathWaypoint } from '@/types/game';
import { soundManager } from '@/utils/sound';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'studio' | 'customizer' | 'map'>('studio');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('monkey');

  const [characterName, setCharacterName] = useState('Monkey');
  const [equippedHat, setEquippedHat] = useState('knight_helmet');
  const [totalXP, setTotalXP] = useState(450);

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [customWaypoints, setCustomWaypoints] = useState<PathWaypoint[] | null>(null);

  const currentLevel = PUZZLE_LEVELS[currentLevelIndex];
  const waypoints = customWaypoints || currentLevel.waypoints || [];

  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [collectedCoins, setCollectedCoins] = useState<number[]>([]);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // Scratch Editor Program State
  const [program, setProgram] = useState<CodeBlock[]>([
    { instanceId: 'default-1', type: 'move_forward', label: 'move forward', category: 'motion', blockClass: 'block-motion', stepValue: 10 },
    { instanceId: 'default-2', type: 'turn_right', label: 'if touching path', category: 'events', blockClass: 'block-events' },
    { instanceId: 'default-3', type: 'say_hello', label: 'say 1 step', category: 'looks', blockClass: 'block-looks' },
    { instanceId: 'default-4', type: 'repeat', label: 'repeat until obstacle', category: 'control', blockClass: 'block-control', repeatCount: 3 },
  ]);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick();
  };

  const handleToggleFullscreen = () => {
    soundManager.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleCustomizerConfirm = (name: string, hat: string) => {
    setCharacterName(name);
    setEquippedHat(hat);
    setActiveTab('studio');
  };

  const handleResetLevel = () => {
    setIsRunning(false);
    setActiveStepIndex(null);
    setCurrentWaypointIndex(0);
    setCollectedCoins([]);
    setSpeechBubble(null);
  };

  const handleClearAllBlocks = () => {
    soundManager.playClick();
    setProgram([]);
    handleResetLevel();
  };

  const handleReturnToStartPos = () => {
    soundManager.playClick();
    setIsRunning(false);
    setActiveStepIndex(null);
    setCurrentWaypointIndex(0);
    setSpeechBubble('Back at START Pipe!');
  };

  const handleSelectLevel = (index: number) => {
    soundManager.playClick();
    setCurrentLevelIndex(index);
    setCustomWaypoints(null);
    setCurrentWaypointIndex(0);
    setCollectedCoins([]);
    setSpeechBubble(null);
    setIsRunning(false);
    setActiveStepIndex(null);
    setShowVictoryModal(false);
    setActiveTab('studio');
  };

  const handleUpdateWaypoints = (newWaypoints: PathWaypoint[]) => {
    setCustomWaypoints(newWaypoints);
  };

  // Path-Graph Execution Engine
  const handleRunProgram = async (blocksToRun?: CodeBlock[], speed = 1) => {
    const codeBlocks = blocksToRun || program;
    if (isRunning || waypoints.length === 0 || codeBlocks.length === 0) {
      if (codeBlocks.length === 0) soundManager.playError();
      return;
    }

    setIsRunning(true);
    handleResetLevel();

    let pathIdx = 0;
    const coinsCollectedSoFar: number[] = [];
    const stepDelay = Math.max(250, 750 / speed);

    const flatSteps: Array<{ action: string; blockIndex: number; distance: number }> = [];
    codeBlocks.forEach((block, idx) => {
      const stepVal = block.stepValue || 1;
      if (block.type === 'repeat') {
        const count = block.repeatCount || 3;
        for (let i = 0; i < count; i++) {
          flatSteps.push({ action: 'move_forward', blockIndex: idx, distance: 1 });
        }
      } else {
        flatSteps.push({ action: block.type, blockIndex: idx, distance: stepVal > 5 ? 1 : stepVal });
      }
    });

    for (let i = 0; i < flatSteps.length; i++) {
      const step = flatSteps[i];
      setActiveStepIndex(step.blockIndex);

      await new Promise(res => setTimeout(res, stepDelay));

      if (step.action === 'move_forward' || step.action === 'jump') {
        const dist = step.action === 'jump' ? 2 : step.distance;

        // Check Strict Track Bounds
        const targetStepIndex = pathIdx + dist;
        if (targetStepIndex >= waypoints.length) {
          soundManager.playError();
          setSpeechBubble('Oops! Moved off the maze track! Code failed!');
          setIsRunning(false);
          setActiveStepIndex(null);
          return;
        }

        soundManager.playStep();
        pathIdx = targetStepIndex;
        setCurrentWaypointIndex(pathIdx);

        const currentWp = waypoints[pathIdx];

        // 1. Check Coin Tile Logic
        if (currentWp.type === 'coin' && !coinsCollectedSoFar.includes(pathIdx)) {
          coinsCollectedSoFar.push(pathIdx);
          setCollectedCoins([...coinsCollectedSoFar]);
          soundManager.playCoin();
          setSpeechBubble('Got a Coin!');
        }

        // 2. Check Super Star Tile Logic (Advance 3 spaces)
        if (currentWp.type === 'star') {
          soundManager.playEquip();
          setSpeechBubble('SUPER STAR! ADVANCE +3 SPACES!');
          await new Promise(res => setTimeout(res, 500));
          pathIdx = Math.min(waypoints.length - 1, pathIdx + 3);
          setCurrentWaypointIndex(pathIdx);
        }

        // 3. Check Red Shell Hazard Tile Logic (Go back 2 spaces)
        if (currentWp.type === 'shell') {
          soundManager.playError();
          setSpeechBubble('Ouch! Red Shell! GO BACK 2 SPACES!');
          await new Promise(res => setTimeout(res, 600));
          pathIdx = Math.max(0, pathIdx - 2);
          setCurrentWaypointIndex(pathIdx);
        }

        // 4. Check Finish Pipe Goal
        if (currentWp.type === 'goal' || pathIdx === waypoints.length - 1) {
          setSpeechBubble('MAZE CLEARED!');
          soundManager.playEquip();
          setTotalXP(prev => prev + 250);
          setIsRunning(false);
          setActiveStepIndex(null);
          setTimeout(() => {
            setShowVictoryModal(true);
          }, 500);
          return;
        }

      } else if (step.action === 'say_hello') {
        soundManager.playClick();
        setSpeechBubble('Navigating the Figma Maze Track!');
      } else if (step.action === 'play_sound') {
        soundManager.playEquip();
      }
    }

    setIsRunning(false);
    setActiveStepIndex(null);

    if (pathIdx === waypoints.length - 1) {
      setSpeechBubble('MAZE CLEARED!');
      setShowVictoryModal(true);
    } else {
      setSpeechBubble(`At Tile #${pathIdx + 1}! Add more move blocks to reach FINISH!`);
    }
  };

  // Right Side Vertical Category Toolbar SVGs
  const rightCornerControls = [
    { id: 'motion', svg: '/Motion.svg', title: 'Motion' },
    { id: 'looks', svg: '/Looks.svg', title: 'Looks' },
    { id: 'sound', svg: '/Sound.svg', title: 'Sound' },
    { id: 'events', svg: '/Events.svg', title: 'Events' },
    { id: 'controls', svg: '/Controls.svg', title: 'Controls' },
    { id: 'vars', svg: '/Vars.svg', title: 'Variables' },
    { id: 'setup', svg: '/Setup.svg', title: 'Setup' },
    { id: 'exit', svg: '/Exit.svg', title: 'Exit' },
  ];

  return (
    <main className="min-h-screen bg-[#0d0906] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/images/board_game_tabletop_bg.jpg" 
          alt="Tabletop Desk Background" 
          fill 
          className="object-cover object-center opacity-75 filter brightness-90 saturate-125"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0906] via-transparent to-[#0d0906]/60" />
      </div>

      {/* Top Application Header Bar */}
      <header className="w-full px-4 sm:px-8 py-3 flex items-center justify-end z-30 relative min-h-[72px] pointer-events-none">

        {/* Center Top Header Switcher: ABSOLUTELY DEAD CENTERED HORIZONTALLY */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center -space-x-1.5 sm:-space-x-2.5 md:-space-x-3 pointer-events-auto z-30">
          {/* 1. Quest / Studio Button */}
          <ActionTooltip label="Quest / Tabletop Studio" position="bottom">
            <button
              onClick={() => { soundManager.playClick(); setActiveTab('studio'); }}
              className={`relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-30 p-0 ${
                activeTab === 'studio' 
                  ? 'opacity-100' 
                  : 'filter grayscale opacity-100 hover:grayscale-0'
              }`}
            >
              <Image src="/Quest.svg" alt="Quest Studio" fill className="object-contain" />
            </button>
          </ActionTooltip>

          {/* 2. Leaderboard & Customize Button */}
          <ActionTooltip label="Leaderboard & Customizer" position="bottom">
            <button
              onClick={() => { soundManager.playClick(); setActiveTab('customizer'); }}
              className={`relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-20 p-0 ${
                activeTab === 'customizer' 
                  ? 'opacity-100' 
                  : 'filter grayscale opacity-100 hover:grayscale-0'
              }`}
            >
              <Image src="/Leaderboard.svg" alt="Leaderboard" fill className="object-contain" />
            </button>
          </ActionTooltip>

          {/* 3. Map Button */}
          <ActionTooltip label="Maze Treasure Map" position="bottom">
            <button
              onClick={() => { soundManager.playClick(); setActiveTab('map'); }}
              className={`relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-10 p-0 ${
                activeTab === 'map' 
                  ? 'opacity-100' 
                  : 'filter grayscale opacity-100 hover:grayscale-0'
              }`}
            >
              <Image src="/Map.svg" alt="Maze Map" fill className="object-contain" />
            </button>
          </ActionTooltip>
        </div>

        {/* Right Corner Controls */}
        <div className="flex items-center justify-center -space-x-2 sm:-space-x-3 md:-space-x-4 pointer-events-auto z-30">
          {/* 1. Mute / Unmute SFX Button */}
          <ActionTooltip label={isMuted ? 'Unmute SFX' : 'Mute SFX'} position="bottom">
            <button
              onClick={handleToggleMute}
              className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-50"
            >
              <Image 
                src={isMuted ? '/Mute SFX.svg' : '/Unmute SFX.svg'} 
                alt={isMuted ? 'Mute SFX' : 'Unmute SFX'} 
                fill 
                className="object-contain" 
              />
            </button>
          </ActionTooltip>

          {/* 2. Notification Button */}
          <ActionTooltip label="Notifications" position="bottom">
            <button
              onClick={() => { soundManager.playClick(); }}
              className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-40"
            >
              <Image src="/Notification.svg" alt="Notification" fill className="object-contain" />
            </button>
          </ActionTooltip>

          {/* 3. Settings Button */}
          <ActionTooltip label="Settings" position="bottom">
            <button
              onClick={() => { soundManager.playClick(); }}
              className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-30"
            >
              <Image src="/Settings.svg" alt="Settings" fill className="object-contain" />
            </button>
          </ActionTooltip>

          {/* 4. Profile Button */}
          <ActionTooltip label="Character Profile" position="bottom">
            <button
              onClick={() => { soundManager.playClick(); setActiveTab('customizer'); }}
              className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-20"
            >
              <Image src="/Profile.svg" alt="Profile" fill className="object-contain" />
            </button>
          </ActionTooltip>

          {/* 5. Fullscreen Button */}
          <ActionTooltip label="Fullscreen Mode" position="bottom">
            <button
              onClick={handleToggleFullscreen}
              className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-10"
            >
              <Image src="/Fullscreen.svg" alt="Fullscreen" fill className="object-contain" />
            </button>
          </ActionTooltip>
        </div>

      </header>

      {/* Main View Area */}
      <div className="flex-1 p-0 flex flex-col items-center justify-center relative z-20">
        
        {/* MAZE CANVAS IS PERMANENTLY RENDERED ON-SCREEN AS THE BASE BOARD SCREEN */}
        <div className="w-full h-full relative z-10">
          <GameCanvas 
            level={currentLevel}
            playerPos={{ r: waypoints[currentWaypointIndex]?.r || 0, c: waypoints[currentWaypointIndex]?.c || 0, dir: 'S' }}
            currentWaypointIndex={currentWaypointIndex}
            collectedCoins={collectedCoins}
            speechBubble={speechBubble}
            equippedHat={equippedHat}
            characterName={characterName}
            selectedCharacter={selectedCharacter}
            onUpdateWaypoints={handleUpdateWaypoints}
          />

          {/* FLOATING COLLAPSIBLE SCRATCH BLOCK EDITOR MODAL (STUDIO TAB) */}
          {activeTab === 'studio' && (
            <div className="fixed left-6 bottom-6 z-40">
              <BlocklyEditor 
                availableBlocks={currentLevel.availableBlocks}
                maxBlocks={currentLevel.maxBlocks}
                onRunCode={(p, s) => handleRunProgram(p, s)}
                onReset={handleResetLevel}
                onReturnToStart={handleReturnToStartPos}
                isRunning={isRunning}
                activeStepIndex={activeStepIndex}
                selectedCharacter={selectedCharacter}
                onSelectCharacter={setSelectedCharacter}
                program={program}
                setProgram={setProgram}
              />
            </div>
          )}
        </div>

        {/* OVERLAY MODAL 1: LEADERBOARD & CUSTOMIZER */}
        <AnimatePresence>
          {activeTab === 'customizer' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pt-12 sm:pt-16 pb-6 px-4 bg-slate-950/50 backdrop-blur-sm pointer-events-auto overflow-y-auto">
              <motion.div
                key="customizer-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl flex justify-center"
              >
                <CustomizerLeaderboard 
                  onClose={() => setActiveTab('studio')}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* TREASURE MAP VIEW - STAGGERED RISING LEVEL IMAGES ANIMATION */}
        <AnimatePresence>
          {activeTab === 'map' && (
            <motion.div
              key="map-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2 sm:p-3 bg-slate-950/50 backdrop-blur-sm pointer-events-auto overflow-y-auto"
            >
              {/* Back Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('studio');
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-300 hover:text-white font-medium text-[10px] sm:text-xs bg-white/10 border border-white/20 px-2.5 py-1 rounded-full transition cursor-pointer"
              >
                ✕ Close Map
              </button>

              {/* Map Title Header */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6 mb-2"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white tracking-tight drop-shadow-md">
                  Loops and functions (Ages 5 - 8)
                </h1>
              </motion.div>

              <motion.div
                key="treasure-map-grid"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.05,
                    },
                  },
                  exit: {
                    opacity: 0,
                    transition: {
                      staggerChildren: 0.05,
                      staggerDirection: -1,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-6 gap-3 sm:gap-5 max-w-5xl w-full py-4"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const levelNum = i + 1;
                  const puzzleIndex = i % PUZZLE_LEVELS.length;
                  const monkeyImg = levelNum % 2 === 1 ? '/monkey1.svg' : '/monkey2.svg';

                  return (
                    <motion.div
                      key={`level-${levelNum}`}
                      variants={{
                        hidden: { opacity: 0, y: 50, scale: 0.8 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: { type: 'spring', stiffness: 350, damping: 22 },
                        },
                        exit: {
                          opacity: 0,
                          y: 40,
                          scale: 0.8,
                          transition: { duration: 0.15 },
                        },
                      }}
                      onClick={() => {
                        soundManager.playClick();
                        handleSelectLevel(puzzleIndex);
                        setActiveTab('studio');
                      }}
                      className="flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105 active:scale-95 group"
                    >
                      {/* Image Container with Bottom-Right Status Badge */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0 mb-1">
                        <Image 
                          src={monkeyImg} 
                          alt={`Level ${levelNum}`} 
                          fill 
                          className={`object-contain transition ${levelNum > 1 ? 'filter grayscale opacity-55' : ''}`} 
                          priority 
                        />
                        
                        {/* Doubled Status Badge in Bottom Right Corner */}
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 z-10 filter drop-shadow-lg">
                          <Image 
                            src={levelNum === 1 ? '/maze_finish.svg' : '/locked.svg'} 
                            alt={levelNum === 1 ? 'Finished' : 'Locked'} 
                            fill 
                            className="object-contain" 
                          />
                        </div>
                      </div>

                      {/* Title under image */}
                      <span className={`text-[10px] sm:text-xs font-normal tracking-normal transition ${
                        levelNum === 1 ? 'text-amber-300 font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        Level {levelNum}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FIXED BOTTOM-CENTER ACTION BUTTONS - STAGGERED ONE-BY-ONE FLOW ANIMATION */}
      <AnimatePresence>
        {activeTab === 'studio' && (
          <motion.div
            key="bottom-action-bar"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.09,
                  delayChildren: 0.04,
                },
              },
              exit: {
                opacity: 0,
                transition: {
                  staggerChildren: 0.07,
                  staggerDirection: -1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center -space-x-2 sm:-space-x-3 md:-space-x-4 pointer-events-auto"
          >
            {/* Reset / Clear Button */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.7 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } },
                exit: { opacity: 0, y: 40, scale: 0.7, transition: { duration: 0.15 } },
              }}
            >
              <ActionTooltip label="Clear Code Program" position="top">
                <button
                  onClick={handleClearAllBlocks}
                  disabled={isRunning}
                  className="relative w-11 h-11 xs:w-13 xs:h-13 sm:w-15 sm:h-15 md:w-18 md:h-18 lg:w-22 lg:h-22 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <Image src="/reset.svg" alt="Clear Program" fill className="object-contain" />
                </button>
              </ActionTooltip>
            </motion.div>

            {/* Start Position Button */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.7 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } },
                exit: { opacity: 0, y: 40, scale: 0.7, transition: { duration: 0.15 } },
              }}
              className="z-10"
            >
              <ActionTooltip label="Return to START Pipe" position="top">
                <button
                  onClick={handleReturnToStartPos}
                  disabled={isRunning}
                  className="relative w-11 h-11 xs:w-13 xs:h-13 sm:w-15 sm:h-15 md:w-18 md:h-18 lg:w-22 lg:h-22 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <Image src="/start.svg" alt="Return to Start" fill className="object-contain" />
                </button>
              </ActionTooltip>
            </motion.div>

            {/* Play / Run Code Button */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.7 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } },
                exit: { opacity: 0, y: 40, scale: 0.7, transition: { duration: 0.15 } },
              }}
              className="z-20"
            >
              <ActionTooltip label="Run Code Program" position="top">
                <button
                  onClick={() => handleRunProgram()}
                  disabled={isRunning || program.length === 0}
                  className={`relative w-11 h-11 xs:w-13 xs:h-13 sm:w-15 sm:h-15 md:w-18 md:h-18 lg:w-22 lg:h-22 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 ${
                    isRunning ? 'animate-pulse' : ''
                  }`}
                >
                  <Image src="/play.svg" alt="Run Code" fill className="object-contain" />
                </button>
              </ActionTooltip>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT SIDE FLOATING VERTICAL SVG BUTTONS - STAGGERED ONE-BY-ONE FLOW ANIMATION */}
      <AnimatePresence>
        {activeTab === 'studio' && (
          <motion.div
            key="right-vertical-bar"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.07,
                  delayChildren: 0.04,
                },
              },
              exit: {
                opacity: 0,
                transition: {
                  staggerChildren: 0.05,
                  staggerDirection: -1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-1 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center -space-y-3.5 sm:-space-y-5 md:-space-y-6 lg:-space-y-7 pointer-events-auto"
          >
            {rightCornerControls.map((ctrl) => (
              <motion.div
                key={ctrl.id}
                variants={{
                  hidden: { opacity: 0, x: 40, scale: 0.7 },
                  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } },
                  exit: { opacity: 0, x: 40, scale: 0.7, transition: { duration: 0.15 } },
                }}
              >
                <ActionTooltip label={ctrl.title} position="left">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      if (ctrl.id === 'setup' || ctrl.id === 'exit') {
                        setActiveTab('customizer');
                      } else {
                        setActiveTab('studio');
                      }
                    }}
                    className="relative w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0"
                  >
                    <Image 
                      src={ctrl.svg} 
                      alt={ctrl.title} 
                      fill 
                      className="object-contain"
                    />
                  </button>
                </ActionTooltip>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <VictoryModal
          levelTitle={currentLevel.title}
          stars={3}
          xpEarned={250}
          onNextLevel={() => {
            setShowVictoryModal(false);
            if (currentLevelIndex < PUZZLE_LEVELS.length - 1) {
              handleSelectLevel(currentLevelIndex + 1);
            } else {
              handleSelectLevel(0);
            }
          }}
          onOpenCustomizer={() => {
            setShowVictoryModal(false);
            setActiveTab('customizer');
          }}
        />
      )}

    </main>
  );
}
