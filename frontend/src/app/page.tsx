'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomizerLeaderboard } from '@/components/CustomizerLeaderboard';
import { BlocklyEditor, CodeBlock } from '@/components/BlocklyEditor';
import { GameCanvas } from '@/components/GameCanvas';
import { VictoryModal } from '@/components/VictoryModal';
import { ActionTooltip } from '@/components/ActionTooltip';
import { LevelWelcomeModal, LevelInfo } from '@/components/LevelWelcomeModal';
import { AdventureMapModal, LevelProgress } from '@/components/AdventureMapModal';
import { SplashScreen } from '@/components/SplashScreen';
import { GlobalLoadingOverlay } from '@/components/GlobalLoadingOverlay';
import { ADVENTURE_1, PUZZLE_LEVELS } from '@/utils/levels';
import { PathWaypoint, LevelConfig } from '@/types/game';
import { soundManager } from '@/utils/sound';
import { API_BASE_URL } from '@/utils/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'studio' | 'customizer' | 'map'>('studio');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('monkey');

  const [characterName, setCharacterName] = useState('Monkey');
  const [equippedHat, setEquippedHat] = useState('knight_helmet');
  const [totalXP, setTotalXP] = useState(0);

  const [showSplash, setShowSplash] = useState(true);

  // Embeddable Engine User & Host Handshake Session Context
  const [userContext, setUserContext] = useState({
    id: 1,
    username: 'Admin_Explorer',
    role: 'admin' as 'admin' | 'user', // Default admin role for dev; updated by Host Platform token or Auth modal
    groupId: 1,
    groupName: 'Jungle Explorers Group A',
    avatar: '/monkey1.svg',
    totalXP: 0,
    totalScore: 0,
    totalStars: 0,
  });

  const [showMapModal, setShowMapModal] = useState(false);
  const [levelsProgress, setLevelsProgress] = useState<LevelProgress[]>(
    PUZZLE_LEVELS.map((l, idx) => ({
      levelNumber: l.levelNumber,
      title: l.title,
      unlocked: idx === 0,
      completed: false,
      stars: 0,
      score: 0,
    }))
  );

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [customWaypoints, setCustomWaypoints] = useState<PathWaypoint[] | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [lockedVibrateLevelIndex, setLockedVibrateLevelIndex] = useState<number | null>(null);

  const [adventureTitle, setAdventureTitle] = useState<string>(ADVENTURE_1.title);
  const [adventureStory, setAdventureStory] = useState<string>(ADVENTURE_1.story);
  const [dbLevels, setDbLevels] = useState<LevelConfig[]>(PUZZLE_LEVELS);
  const [facingSegmentIndex, setFacingSegmentIndex] = useState<number>(0);
  const [currentHeading, setCurrentHeading] = useState<'N' | 'E' | 'S' | 'W'>('S');
  const [levelFailCount, setLevelFailCount] = useState<number>(0);
  const [overrideSpriteSrc, setOverrideSpriteSrc] = useState<string | null>(null);
  const [isZoomingQuickly, setIsZoomingQuickly] = useState<boolean>(false);
  const [loadingSpriteSrc, setLoadingSpriteSrc] = useState<string>('/monkey1.svg');

  const getInitialHeading = (wps: PathWaypoint[]): 'N' | 'E' | 'S' | 'W' => {
    if (!wps || wps.length < 2) return 'S';
    const dx = (wps[1].xPercent ?? 0) - (wps[0].xPercent ?? 0);
    const dy = (wps[1].yPercent ?? 0) - (wps[0].yPercent ?? 0);
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? 'E' : 'W';
    } else {
      return dy >= 0 ? 'S' : 'N';
    }
  };

  const findNextWaypointInHeading = (currWp: PathWaypoint, heading: 'N' | 'E' | 'S' | 'W', wps: PathWaypoint[]): PathWaypoint | null => {
    if (!currWp || !wps) return null;
    for (const wp of wps) {
      if (wp.index === currWp.index) continue;
      const dx = (wp.xPercent ?? 0) - (currWp.xPercent ?? 0);
      const dy = (wp.yPercent ?? 0) - (currWp.yPercent ?? 0);
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (heading === 'E' && dx > 1.5 && absDy < 3.5) return wp;
      if (heading === 'W' && dx < -1.5 && absDy < 3.5) return wp;
      if (heading === 'S' && dy > 1.5 && absDx < 3.5) return wp;
      if (heading === 'N' && dy < -1.5 && absDx < 3.5) return wp;
    }
    return null;
  };

  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Synchronizing Adventure Data...');

  // Database Progress Sync Helper
  const syncProgressFromDB = (dbProgress: any[]) => {
    if (!Array.isArray(dbProgress) || dbProgress.length === 0) return;
    const completedSet = new Set<number>();
    const starsMap = new Map<number, number>();
    const scoreMap = new Map<number, number>();

    dbProgress.forEach((p: any) => {
      const lvlNum = p.level_number || p.levelNumber;
      if (p.completed) completedSet.add(lvlNum);
      if (p.stars) starsMap.set(lvlNum, p.stars);
      if (p.score) scoreMap.set(lvlNum, p.score);
    });

    setLevelsProgress((prev) =>
      prev.map((l, idx) => {
        const lvlNum = l.levelNumber || idx + 1;
        const isComp = completedSet.has(lvlNum);
        const isPrevComp = idx === 0 || completedSet.has(idx); // previous level completed
        return {
          ...l,
          completed: isComp,
          unlocked: idx === 0 || isComp || isPrevComp,
          stars: starsMap.get(lvlNum) ?? (isComp ? 3 : 0),
          score: scoreMap.get(lvlNum) ?? 0,
        };
      })
    );
  };

  const fetchUserProgressFromDB = (userID: number) => {
    if (!userID || userID <= 0) return;
    setIsGlobalLoading(true);
    setLoadingMessage('Fetching Adventure Map Progress...');
    fetch(`${API_BASE_URL}/api/v1/engine/progress?user_id=${userID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          if (data.total_xp !== undefined) {
            setTotalXP(data.total_xp);
            setUserContext((prev) => ({ ...prev, totalXP: data.total_xp }));
          }
          if (data.progress) {
            syncProgressFromDB(data.progress);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsGlobalLoading(false);
      });
  };

  // Strategic Point 1: Handshake and Initial Load Sync from Database
  React.useEffect(() => {
    const handleHostMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'HOST_AUTH_HANDSHAKE') {
        const { username, role, groupName, groupId, xp } = event.data;
        setUserContext((prev) => ({
          ...prev,
          username: username || prev.username,
          role: role === 'admin' ? 'admin' : 'user',
          groupId: groupId || prev.groupId,
          groupName: groupName || prev.groupName,
          totalXP: xp ?? prev.totalXP,
        }));
      }
    };
    window.addEventListener('message', handleHostMessage);

    fetch(`${API_BASE_URL}/api/v1/engine/handshake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userContext.username,
        role: userContext.role,
        group_name: userContext.groupName,
        xp: userContext.totalXP,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.user) {
          const userXp = data.user.total_xp ?? 0;
          setTotalXP(userXp);
          setUserContext((prev) => ({
            ...prev,
            id: data.user.id || prev.id || 1,
            username: data.user.username || prev.username,
            role: (data.user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
            groupId: data.user.group_id || 1,
            groupName: data.user.group_name || 'Jungle Explorers Group A',
            avatar: data.user.avatar || '/monkey1.svg',
            totalXP: userXp,
            totalStars: data.user.total_stars ?? 0,
          }));
          if (data.progress) {
            syncProgressFromDB(data.progress);
          }
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('message', handleHostMessage);
    };
  }, []);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/adventures`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.adventures && data.adventures.length > 0) {
          const adv = data.adventures[0];
          if (adv.title) setAdventureTitle(adv.title);
          if (adv.story) setAdventureStory(adv.story);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/v1/levels`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.levels && data.levels.length > 0) {
          setDbLevels((prev) =>
            data.levels.map((l: any, idx: number) => {
              const lvlNum = l.level_number || idx + 1;
              const expectedWaypoints = PUZZLE_LEVELS[idx]?.waypoints || [];
              let savedWps = null;

              if (l.waypoints && Array.isArray(l.waypoints) && l.waypoints.length > 0) {
                savedWps = l.waypoints;
              }

              return {
                ...(prev[idx] || {}),
                id: l.id || idx + 1,
                levelNumber: lvlNum,
                title: l.title || prev[idx]?.title || `Level ${lvlNum}`,
                objective: l.objective || prev[idx]?.objective || '',
                mechanic: l.mechanic || prev[idx]?.mechanic || '',
                waypoints: savedWps || expectedWaypoints,
              };
            })
          );
        }
      })
      .catch(() => {});

    // Session Auto Re-authenticate on Refresh from Database using JWT/Session API
    let savedCode: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        savedCode = sessionStorage.getItem('puzzlepro_session_code') || localStorage.getItem('puzzlepro_session_code');
      }
    } catch (e) {}

    if (savedCode) {
      setIsGlobalLoading(true);
      setLoadingMessage('Restoring Session...');
      fetch(`${API_BASE_URL}/api/v1/engine/verify-session?code=${encodeURIComponent(savedCode)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.user) {
            const userXp = data.user.total_xp ?? 0;
            setTotalXP(userXp);
            setUserContext({
              id: data.user.id || 1,
              username: data.user.username || 'Explorer',
              role: (data.user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
              groupId: data.user.group_id || 1,
              groupName: data.user.group_name || 'Jungle Explorers Group A',
              avatar: data.user.avatar || '/monkey1.svg',
              totalXP: userXp,
              totalScore: 0,
              totalStars: data.user.total_stars ?? 0,
            });
            if (data.progress) {
              syncProgressFromDB(data.progress);
            }
            setShowSplash(false);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsGlobalLoading(false);
        });
    }
  }, []);

  const currentLevel = dbLevels[currentLevelIndex] || PUZZLE_LEVELS[currentLevelIndex] || ADVENTURE_1.levels[0];
  const waypoints = customWaypoints || currentLevel.waypoints || [];

  const levelInfo: LevelInfo = {
    id: currentLevel.id,
    levelNumber: currentLevel.levelNumber || currentLevelIndex + 1,
    title: currentLevel.title,
    objective: currentLevel.objective || currentLevel.description,
    mechanic: currentLevel.mechanic || 'Sequential Execution',
    svgMap: currentLevel.bgImage || `/The Lost Monkey Explorer - Level ${currentLevelIndex + 1}.svg`,
    maxBlocks: currentLevel.maxBlocks,
    totalLevels: ADVENTURE_1.totalLevels,
    adventureTitle: adventureTitle || ADVENTURE_1.title,
    story: adventureStory || ADVENTURE_1.story,
  };

  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [collectedCoins, setCollectedCoins] = useState<number[]>([]);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('motion');

  // Scratch Editor Program State (Default initial blocks: ONLY 'when flag clicked')
  const [program, setProgram] = useState<CodeBlock[]>([
    {
      instanceId: 'default-when-clicked',
      type: 'when_flag_clicked',
      label: 'when flag clicked',
      category: 'events',
      blockClass: 'block-events',
    },
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
    setProgram([
      {
        instanceId: 'default-when-clicked',
        type: 'when_flag_clicked',
        label: 'when flag clicked',
        category: 'events',
        blockClass: 'block-events',
      },
    ]);
    handleResetLevel();
  };

  const handleReturnToStartPos = () => {
    soundManager.playClick();
    setIsRunning(false);
    setActiveStepIndex(null);
    setCurrentWaypointIndex(0);
    setFacingSegmentIndex(0);
    setCurrentHeading(getInitialHeading(waypoints));
    setSpeechBubble('Back at START Pipe!');
  };

  const handleSelectLevel = (index: number) => {
    soundManager.playClick();
    setCurrentLevelIndex(index);
    setCustomWaypoints(null);
    setCurrentWaypointIndex(0);
    setFacingSegmentIndex(0);
    const selectedLvlWps = dbLevels[index]?.waypoints || PUZZLE_LEVELS[index]?.waypoints || [];
    setCurrentHeading(getInitialHeading(selectedLvlWps));
    setCollectedCoins([]);
    setSpeechBubble(null);
    setIsRunning(false);
    setActiveStepIndex(null);
    setShowVictoryModal(false);
    setShowWelcomeModal(true);
    setActiveTab('studio');
    setLevelFailCount(0);
    setOverrideSpriteSrc(null);
    setIsZoomingQuickly(false);
    // Remove all previous blocks on new level, resetting to default 'when flag clicked'
    setProgram([
      {
        instanceId: 'default-when-clicked',
        type: 'when_flag_clicked',
        label: 'when flag clicked',
        category: 'events',
        blockClass: 'block-events',
      },
    ]);
  };

  const handleUpdateWaypoints = (newWaypoints: PathWaypoint[]) => {
    setCustomWaypoints(newWaypoints);
    setDbLevels((prev) =>
      prev.map((l, idx) => {
        if (idx === currentLevelIndex) {
          return { ...l, waypoints: newWaypoints };
        }
        return l;
      })
    );
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
    let heading: 'N' | 'E' | 'S' | 'W' = getInitialHeading(waypoints);
    setCurrentHeading(heading);
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
      } else if (block.type === 'move_forward') {
        const count = Math.max(1, Math.min(10, stepVal));
        for (let i = 0; i < count; i++) {
          flatSteps.push({ action: 'move_forward', blockIndex: idx, distance: 1 });
        }
      } else if (block.type !== 'when_flag_clicked' && block.type !== 'when_space_pressed') {
        flatSteps.push({ action: block.type, blockIndex: idx, distance: stepVal > 5 ? 1 : stepVal });
      }
    });

    if (flatSteps.length === 0) {
      soundManager.playError();
      setSpeechBubble('Add movement blocks under "when flag clicked" to start!');
      setIsRunning(false);
      return;
    }

    for (let i = 0; i < flatSteps.length; i++) {
      const step = flatSteps[i];
      setActiveStepIndex(step.blockIndex);

      await new Promise(res => setTimeout(res, stepDelay));

      if (step.action === 'turn_right') {
        soundManager.playClick();
        setSpeechBubble('Turning Right!');
        const rightMap: Record<string, 'N' | 'E' | 'S' | 'W'> = { N: 'E', E: 'S', S: 'W', W: 'N' };
        heading = rightMap[heading];
        setCurrentHeading(heading);
        await new Promise(res => setTimeout(res, stepDelay));
      } else if (step.action === 'turn_left') {
        soundManager.playClick();
        setSpeechBubble('Turning Left!');
        const leftMap: Record<string, 'N' | 'E' | 'S' | 'W'> = { N: 'W', W: 'S', S: 'E', E: 'N' };
        heading = leftMap[heading];
        setCurrentHeading(heading);
        await new Promise(res => setTimeout(res, stepDelay));
      } else if (step.action === 'move_forward' || step.action === 'jump') {
        const currentWp = waypoints[pathIdx];
        const nextWp = findNextWaypointInHeading(currentWp, heading, waypoints);

        if (!nextWp) {
          soundManager.playError();
          const newFailCount = levelFailCount + 1;
          setLevelFailCount(newFailCount);

          if (newFailCount <= 3) {
            setLoadingSpriteSrc('/monkey17.svg');
            setSpeechBubble('Oops! Off track! (Try again)');
          } else {
            setLoadingSpriteSrc('/monkey14.svg');
            setSpeechBubble('Oops! Returning to START!');
          }

          setIsGlobalLoading(true);
          setIsZoomingQuickly(true);
          await new Promise(res => setTimeout(res, 950));
          setIsZoomingQuickly(false);
          setIsGlobalLoading(false);
          setLoadingSpriteSrc('/monkey1.svg');

          setIsRunning(false);
          setActiveStepIndex(null);
          handleReturnToStartPos();
          return;
        }

        soundManager.playStep();
        pathIdx = nextWp.index;
        setCurrentWaypointIndex(pathIdx);

        const currentWpNew = waypoints[pathIdx];

        // 1. Check Coin Tile Logic
        if (currentWpNew.type === 'coin' && !coinsCollectedSoFar.includes(pathIdx)) {
          coinsCollectedSoFar.push(pathIdx);
          setCollectedCoins([...coinsCollectedSoFar]);
          soundManager.playCoin();
          setSpeechBubble('Got a Coin!');
        }

        // 2. Check Super Star Tile Logic (Advance 3 spaces)
        if (currentWpNew.type === 'star') {
          soundManager.playEquip();
          setSpeechBubble('SUPER STAR! ADVANCE +3 SPACES!');
          await new Promise(res => setTimeout(res, 500));
          pathIdx = Math.min(waypoints.length - 1, pathIdx + 3);
          setCurrentWaypointIndex(pathIdx);
        }

        // 3. Check Red Shell Hazard Tile Logic (Go back 2 spaces)
        if (currentWpNew.type === 'shell') {
          soundManager.playError();
          setSpeechBubble('Ouch! Red Shell! GO BACK 2 SPACES!');
          await new Promise(res => setTimeout(res, 600));
          pathIdx = Math.max(0, pathIdx - 2);
          setCurrentWaypointIndex(pathIdx);
        }

        // 4. Check Finish Pipe Goal - Flag goal reached on current step
        if (currentWpNew.type === 'goal' || pathIdx === waypoints.length - 1) {
          setSpeechBubble('Reached Goal Pipe!');
        }

        // Auto update facing segment if next step is not a turn block
        const nextStepAction = flatSteps[i + 1]?.action;
        if (nextStepAction !== 'turn_right' && nextStepAction !== 'turn_left') {
          setFacingSegmentIndex(pathIdx);
        }

      } else if (step.action === 'turn_right' || step.action === 'turn_left') {
        soundManager.playClick();
        setSpeechBubble(step.action === 'turn_right' ? 'Turning Right!' : 'Turning Left!');
        setFacingSegmentIndex(pathIdx);
        await new Promise(res => setTimeout(res, stepDelay));
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
      soundManager.playEquip();

      setLoadingSpriteSrc('/monkey18.svg');
      setIsGlobalLoading(true);
      setIsZoomingQuickly(true);
      await new Promise(res => setTimeout(res, 950));
      setIsZoomingQuickly(false);
      setIsGlobalLoading(false);
      setLoadingSpriteSrc('/monkey1.svg');

      const earnedXP = 250;
      const earnedScore = 1420;

      setTotalXP(prev => prev + earnedXP);
      setUserContext(prev => ({
        ...prev,
        totalXP: prev.totalXP + earnedXP,
        totalScore: prev.totalScore + earnedScore,
      }));

      // Strategic Point 2: Write Stage Completion Event to Database
      fetch(`${API_BASE_URL}/api/v1/engine/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userContext.id,
          level_number: currentLevel.levelNumber,
          stars: 3,
          score: earnedScore,
          xp_earned: earnedXP,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) {
            if (data.total_xp !== undefined) {
              setTotalXP(data.total_xp);
              setUserContext((prev) => ({ ...prev, totalXP: data.total_xp }));
            }
            if (data.progress) {
              syncProgressFromDB(data.progress);
            }
          }
        })
        .catch(() => {});

      setShowVictoryModal(true);
    } else {
      setSpeechBubble(`At Tile #${pathIdx + 1}! Need exact steps to reach FINISH!`);
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

  // Strategic Point 3: Fetch Progress on Code Login
  const handleCodeSubmit = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/engine/code-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data && data.success && data.user) {
        const userXp = data.user.total_xp ?? 0;
        const loggedUser = {
          id: data.user.id || 1,
          username: data.user.username || 'Explorer',
          role: (data.user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
          groupId: data.user.group_id || 1,
          groupName: data.user.group_name || 'Jungle Explorers Group A',
          avatar: data.user.avatar || '/monkey1.svg',
          totalXP: userXp,
          totalScore: 0,
          totalStars: data.user.total_stars ?? 0,
        };
        setUserContext(loggedUser);
        setTotalXP(userXp);
        if (data.progress) {
          syncProgressFromDB(data.progress);
        }
        soundManager.playEquip();
        return true;
      }
    } catch {}
    return false;
  };

  return (
    <main className="min-h-screen bg-[#0d0906] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Image 
          src="/full_maze.jpeg" 
          alt="Full Maze Background" 
          fill 
          className="object-cover object-center filter brightness-90 contrast-110 blur-xl scale-105 opacity-65"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0906]/60 via-[#0d0906]/35 to-[#0d0906]/50 backdrop-blur-md" />
      </div>

      {/* Top Application Header Bar */}
      <header className="w-full px-4 sm:px-8 py-3 flex items-center justify-end z-30 relative min-h-[72px] pointer-events-none">

        {/* Center Top Header Switcher: ABSOLUTELY DEAD CENTERED HORIZONTALLY */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center -space-x-1.5 sm:-space-x-2.5 md:-space-x-3 pointer-events-auto z-30">
          {/* 1. Quest / Studio Button: Resumes Last Uncompleted Level Automatically */}
          <ActionTooltip label="Quest / Tabletop Studio (Resume Adventure)" position="bottom">
            <button
              onClick={() => {
                soundManager.playClick();
                const uncompletedIdx = levelsProgress.findIndex((l) => !l.completed);
                const targetIdx = uncompletedIdx !== -1 ? uncompletedIdx : 0;
                handleSelectLevel(targetIdx);
                setActiveTab('studio');
              }}
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

          {/* 3. Map Button: Strategic Point 4 - Fetch Latest Progress from DB on Opening Map */}
          <ActionTooltip label="Maze Treasure Map" position="bottom">
            <button
              onClick={() => {
                soundManager.playClick();
                fetchUserProgressFromDB(userContext.id);
                setActiveTab('map');
              }}
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

          {/* 2. Mission Objectives Button */}
          <ActionTooltip label="Level Objectives & Story" position="bottom">
            <button
              onClick={() => { soundManager.playClick(); setShowWelcomeModal(true); }}
              className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-45"
            >
              <Image src="/Quest.svg" alt="Objectives" fill className="object-contain" />
            </button>
          </ActionTooltip>

          {/* 3. Notification Button */}
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

          {/* 4. Profile / Auth Session Button */}
          <ActionTooltip label={`Explorer Profile (${userContext.role.toUpperCase()})`} position="bottom">
            <button
              onClick={() => { soundManager.playClick(); setShowSplash(true); }}
              className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-20"
            >
              <Image src="/Profile.svg" alt="Profile Auth" fill className="object-contain" />
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
            currentWaypointIndex={currentWaypointIndex}
            currentHeading={currentHeading}
            facingSegmentIndex={facingSegmentIndex}
            overrideSpriteSrc={overrideSpriteSrc}
            isZoomingQuickly={isZoomingQuickly}
            collectedCoins={collectedCoins}
            speechBubble={speechBubble}
            equippedHat={equippedHat}
            characterName={characterName}
            selectedCharacter={selectedCharacter}
            onUpdateWaypoints={handleUpdateWaypoints}
            userRole={userContext.role}
            totalXP={userContext.totalXP}
            levelScore={userContext.totalScore}
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
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
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
                  groupId={userContext.groupId}
                  groupName={userContext.groupName}
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

              {/* Map Title Header - Read from Database */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6 mb-2 px-4"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {adventureTitle}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-emerald-400 mt-1 max-w-xl mx-auto drop-shadow-sm">
                  {adventureStory}
                </p>
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
                  const monkeyImg = `/monkey${((levelNum - 1) % 23) + 1}.svg`;
                  const lvlConfig = dbLevels[i] || PUZZLE_LEVELS[i] || ADVENTURE_1.levels[i];
                  const levelTitle = lvlConfig?.title || `Level ${levelNum}`;
                  const lvlProg = levelsProgress[i];
                  const isUnlocked = lvlProg?.unlocked || i === 0 || i <= currentLevelIndex;
                  const isCompleted = lvlProg?.completed;
                  const isVibrating = lockedVibrateLevelIndex === i;

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
                        if (isUnlocked) {
                          soundManager.playClick();
                          handleSelectLevel(i);
                          setActiveTab('studio');
                        } else {
                          soundManager.playError();
                          setLockedVibrateLevelIndex(i);
                          setTimeout(() => setLockedVibrateLevelIndex(null), 1200);
                        }
                      }}
                      className="flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105 active:scale-95 group"
                    >
                      {/* Image Container with Bottom-Right Status Badge (Vibrates monkey and zooms locked.svg 3x) */}
                      <motion.div
                        animate={isVibrating ? {
                          x: [-12, 12, -10, 10, -6, 6, -3, 3, 0],
                          rotate: [-6, 6, -4, 4, -2, 2, 0],
                        } : {}}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0 mb-1"
                      >
                        <Image 
                          src={monkeyImg} 
                          alt={`Level ${levelNum}: ${levelTitle}`} 
                          fill 
                          className={`object-contain transition ${isUnlocked ? 'filter drop-shadow-md' : 'filter grayscale opacity-50'}`} 
                          priority 
                        />
                        
                        {/* Status Badge: Finish flag or 3x Zooming Locked Icon */}
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 z-10 filter drop-shadow-lg">
                          {isUnlocked ? (
                            <Image 
                              src="/maze_finish.svg" 
                              alt="Activated Level" 
                              fill 
                              className="object-contain" 
                            />
                          ) : (
                            <motion.div
                              className="relative w-full h-full"
                              animate={isVibrating ? {
                                scale: [1, 2.2, 1, 2.2, 1, 2.2, 1],
                              } : {}}
                              transition={{ duration: 0.9, ease: 'easeInOut' }}
                            >
                              <Image 
                                src="/locked.svg" 
                                alt="Locked Level" 
                                fill 
                                className="object-contain" 
                              />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>

                      {/* Title & Level Name under image */}
                      <div className="flex flex-col items-center text-center mt-1 max-w-[120px]">
                        <span className={`text-[11px] sm:text-xs font-black tracking-wide transition ${
                          isUnlocked ? (i === currentLevelIndex ? 'text-amber-300' : 'text-slate-200 group-hover:text-amber-200') : 'text-slate-500'
                        }`}>
                          Level {levelNum}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition leading-tight line-clamp-2">
                          {levelTitle}
                        </span>
                      </div>
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
                        const categoryMap: Record<string, string> = {
                          motion: 'motion',
                          looks: 'looks',
                          sound: 'sound',
                          events: 'events',
                          controls: 'control',
                          vars: 'vars',
                        };
                        const cat = categoryMap[ctrl.id] || 'all';
                        setSelectedCategory(cat);
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

      {/* Level Welcome Framer Motion Modal */}
      <LevelWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => {
          setShowWelcomeModal(false);
          setActiveTab('map');
        }}
        onStartLevel={() => setShowWelcomeModal(false)}
        levelInfo={levelInfo}
      />

      {/* Adventure Progress Map Modal */}
      <AdventureMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSelectLevel={handleSelectLevel}
        currentLevelIndex={currentLevelIndex}
        levelsProgress={levelsProgress}
        totalXP={userContext.totalXP}
        groupName={userContext.groupName}
      />

      {/* Game Application Launcher Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onStartGame={() => {
              setShowSplash(false);
              setShowWelcomeModal(false);
              setActiveTab('map');
            }}
            onCodeSubmit={async (code) => {
              const ok = await handleCodeSubmit(code);
              if (ok) {
                setShowSplash(false);
                setShowWelcomeModal(false);
                setActiveTab('map');
              }
              return ok;
            }}
            username={userContext.username}
            role={userContext.role}
            groupName={userContext.groupName}
            totalXP={userContext.totalXP}
          />
        )}
      </AnimatePresence>

      {/* Global Framer Motion Wave Loading & Sprite Animation Overlay over blurred destination screen */}
      <GlobalLoadingOverlay
        isLoading={isGlobalLoading}
        spriteSrc={loadingSpriteSrc}
        isQuickZoom={isZoomingQuickly}
      />

    </main>
  );
}
