'use client';

import React, { useState, useEffect } from 'react';
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
import { PUZZLE_LEVELS, ADVENTURE_1, ALL_ADVENTURES, ALL_WORLDS } from '@/utils/levels';
import { PathWaypoint, LevelConfig } from '@/types/game';
import { soundManager } from '@/utils/sound';
import { GAME_ENGINE_API_URL, PLAYER_SERVICE_API_URL } from '@/utils/api';
import { getCdnUrl } from '@/utils/cdn';
import { verifyEmbedToken } from '@/services/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'studio' | 'customizer' | 'map'>('map');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('monkey');

  const [characterName, setCharacterName] = useState('Monkey');
  const [equippedHat, setEquippedHat] = useState('knight_helmet');
  const [totalXP, setTotalXP] = useState(0);

  const [showSplash, setShowSplash] = useState(true);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [isVerifyingEmbed, setIsVerifyingEmbed] = useState<boolean>(false);

  // Embeddable Engine User & Host Handshake Session Context
  const [userContext, setUserContext] = useState({
    id: 1,
    username: 'Explorer',
    role: 'admin' as 'admin' | 'user', // Default admin role for dev; updated by Host Platform token or Auth modal
    groupId: 1,
    groupName: 'Jungle Explorers Group A',
    avatar: '/monkey1.svg',
    totalXP: 0,
    totalScore: 0,
    totalStars: 0,
  });

  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedAdventureId, setSelectedAdventureId] = useState<number | null>(null);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [lockedVibrateLevelIndex, setLockedVibrateLevelIndex] = useState<number | null>(null);

  const [adventureTitle, setAdventureTitle] = useState<string>(ADVENTURE_1.title);
  const [adventureStory, setAdventureStory] = useState<string>(ADVENTURE_1.story);
  const [dbLevels, setDbLevels] = useState<LevelConfig[]>(PUZZLE_LEVELS);
  const [facingSegmentIndex, setFacingSegmentIndex] = useState<number>(0);
  const [currentHeading, setCurrentHeading] = useState<'N' | 'E' | 'S' | 'W'>('S');
  const [levelFailCount, setLevelFailCount] = useState<number>(0);
  const [overrideSpriteSrc, setOverrideSpriteSrc] = useState<string | null>(null);
  const [isZoomingQuickly, setIsZoomingQuickly] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [loadingSpriteSrc, setLoadingSpriteSrc] = useState<string>('/monkey1.svg');

  const getInitialHeading = (wps: PathWaypoint[]): 'N' | 'E' | 'S' | 'W' => {
    if (!wps || wps.length === 0) return 'S';
    if (wps[0]?.initialHeading) return wps[0].initialHeading;
    if (wps.length < 2) return 'S';
    const dx = (wps[1].xPercent ?? 0) - (wps[0].xPercent ?? 0);
    const dy = (wps[1].yPercent ?? 0) - (wps[0].yPercent ?? 0);
    if (Math.abs(dy) >= Math.abs(dx)) {
      return dy >= 0 ? 'S' : 'N';
    } else {
      return dx >= 0 ? 'E' : 'W';
    }
  };

  const findNextWaypointInHeading = (currWp: PathWaypoint, heading: 'N' | 'E' | 'S' | 'W', wps: PathWaypoint[]): PathWaypoint | null => {
    if (!currWp || !wps || wps.length === 0) return null;

    let closestWp: PathWaypoint | null = null;
    let minDistance = Infinity;

    for (const wp of wps) {
      if (wp.index === currWp.index) continue;
      const dx = (wp.xPercent ?? 0) - (currWp.xPercent ?? 0);
      const dy = (wp.yPercent ?? 0) - (currWp.yPercent ?? 0);
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      let isMatchingDirection = false;
      if (heading === 'E' && dx > 1.5 && absDy < 5.0) isMatchingDirection = true;
      if (heading === 'W' && dx < -1.5 && absDy < 5.0) isMatchingDirection = true;
      if (heading === 'S' && dy > 1.5 && absDx < 5.0) isMatchingDirection = true;
      if (heading === 'N' && dy < -1.5 && absDx < 5.0) isMatchingDirection = true;

      if (isMatchingDirection) {
        const dist = Math.hypot(dx, dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestWp = wp;
        }
      }
    }

    return closestWp;
  };

  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(true);
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
    fetch(`${PLAYER_SERVICE_API_URL}/api/v1/player/progress?user_id=${userID}`)
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
        const { username, role, groupName, groupId, xp, worldId, world_id } = event.data;
        const assignedWorld = worldId || world_id || 1;
        setSelectedWorldId(assignedWorld);
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

    fetch(`${PLAYER_SERVICE_API_URL}/api/v1/player/handshake`, {
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
          const assignedWorld = data.user.world_id || data.user.worldId || data.user.assigned_world_id || data.user.world || 1;
          setSelectedWorldId(assignedWorld);
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
    fetch(`${GAME_ENGINE_API_URL}/api/v1/game/adventures`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.adventures && data.adventures.length > 0) {
          const adv = data.adventures[0];
          if (adv.title) setAdventureTitle(adv.title);
          if (adv.story) setAdventureStory(adv.story);
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    const advId = selectedAdventureId || 1;
    const currentWorld = ALL_WORLDS.find((w) => w.id === selectedWorldId) || ALL_WORLDS[0];
    const currentAdv = currentWorld.adventures.find((a) => a.id === advId) || currentWorld.adventures[0];
    const defaultLevels = currentAdv.levels;
    setDbLevels(defaultLevels);

    fetch(`${GAME_ENGINE_API_URL}/api/v1/game/levels?world_id=${selectedWorldId}&adventure_id=${advId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.levels && data.levels.length > 0) {
          setDbLevels(
            data.levels.map((l: any, idx: number) => {
              const lvlNum = l.level_number || idx + 1;
              const expectedWaypoints = defaultLevels[idx]?.waypoints || [];
              let savedWps: PathWaypoint[] | null = null;

              if (typeof l.waypoints === 'string' && l.waypoints.trim().startsWith('[')) {
                try {
                  savedWps = JSON.parse(l.waypoints);
                } catch (e) {}
              } else if (Array.isArray(l.waypoints) && l.waypoints.length > 0) {
                savedWps = l.waypoints;
              }

              if (!savedWps || savedWps.length === 0) {
                try {
                  const localWps = localStorage.getItem(`level_waypoints_w${selectedWorldId}_adv${advId}_lvl${lvlNum}`) || 
                                   localStorage.getItem(`level_waypoints_world${selectedWorldId}_adv${advId}_lvl${lvlNum}`);
                  if (localWps) {
                    savedWps = JSON.parse(localWps);
                  }
                } catch (e) {}
              }

              let savedMaxBlocks: number | null = l.max_blocks || l.maxBlocks || null;
              if (!savedMaxBlocks) {
                try {
                  const localMax = localStorage.getItem(`level_maxblocks_w${selectedWorldId}_adv${advId}_lvl${lvlNum}`);
                  if (localMax) {
                    savedMaxBlocks = parseInt(localMax);
                  }
                } catch (e) {}
              }

              return {
                ...(defaultLevels[idx] || {}),
                id: l.id || idx + 1,
                worldId: selectedWorldId,
                adventureId: advId,
                levelNumber: lvlNum,
                title: defaultLevels[idx]?.title || l.title || `Level ${lvlNum}`,
                objective: defaultLevels[idx]?.objective || l.objective || '',
                mechanic: defaultLevels[idx]?.mechanic || l.mechanic || '',
                bgImage: defaultLevels[idx]?.bgImage || `/${selectedWorldId}_${advId}_${lvlNum}.svg`,
                maxBlocks: savedMaxBlocks || defaultLevels[idx]?.maxBlocks || 15,
                availableBlocks: defaultLevels[idx]?.availableBlocks || l.available_blocks || l.availableBlocks || ['move_forward', 'turn_left', 'turn_right', 'turn_around'],
                waypoints: (savedWps && savedWps.length > 0) ? savedWps : expectedWaypoints,
              };
            })
          );
        }
      })
      .catch(() => {});
  }, [selectedAdventureId, selectedWorldId]);

  React.useEffect(() => {
    // 1. Check for iFrame Embed Token in URL query params (Checklist 1-9)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const embedToken = searchParams.get('org_token') || searchParams.get('embed_token') || searchParams.get('token');
      if (embedToken) {
        setIsGlobalLoading(true);
        setLoadingMessage('Verifying iFrame Embed Token...');
        verifyEmbedToken(embedToken).then((res) => {
          setIsGlobalLoading(false);
          if (!res.valid) {
            setEmbedError(res.error || 'iFrame Embed Authentication Failed: Invalid or Expired Token');
          } else {
            setEmbedError(null);
            if (res.player_session_token) {
              try {
                sessionStorage.setItem('puzzlepro_session_token', res.player_session_token);
                localStorage.setItem('puzzlepro_session_token', res.player_session_token);
              } catch (e) {}
            }
            if (res.organisation) {
              setUserContext((prev) => ({
                ...prev,
                groupName: res.organisation?.name || prev.groupName,
              }));
            }
            setShowSplash(false);
          }
        });
        return;
      }
    }

    // 2. Session Auto Re-authenticate on Refresh from Database using JWT/Session API
    let savedToken: string | null = null;
    let savedCode: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        savedToken = localStorage.getItem('puzzlepro_session_token') || sessionStorage.getItem('puzzlepro_session_token');
        savedCode = localStorage.getItem('puzzlepro_session_code') || sessionStorage.getItem('puzzlepro_session_code');
      }
    } catch (e) {}

    if (savedToken || savedCode) {
      setIsGlobalLoading(true);
      setLoadingMessage('Restoring Session...');
      const verifyUrl = savedToken
        ? `${PLAYER_SERVICE_API_URL}/api/v1/player/verify-session?token=${encodeURIComponent(savedToken)}`
        : `${PLAYER_SERVICE_API_URL}/api/v1/player/verify-session?code=${encodeURIComponent(savedCode || '')}`;

      fetch(verifyUrl, {
        headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.valid && data.user) {
            if (data.token) {
              try {
                localStorage.setItem('puzzlepro_session_token', data.token);
                sessionStorage.setItem('puzzlepro_session_token', data.token);
              } catch (e) {}
            }
            try {
              if (typeof window !== 'undefined') {
                const savedLvl = localStorage.getItem('puzzlepro_active_level');
                if (savedLvl !== null) {
                  const lvlIdx = parseInt(savedLvl, 10);
                  if (!isNaN(lvlIdx) && lvlIdx >= 0) setCurrentLevelIndex(lvlIdx);
                }
              }
            } catch (e) {}

            const userXp = data.user.total_xp ?? 0;
            const assignedWorld = data.user.world_id || data.user.worldId || data.user.assigned_world_id || data.user.world || 1;
            setSelectedWorldId(assignedWorld);
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
            setShowWelcomeModal(false);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsGlobalLoading(false);
        });
    } else {
      const timer = setTimeout(() => {
        setIsGlobalLoading(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, []);

  // Re-evaluate initial heading whenever active level or waypoints update from database
  React.useEffect(() => {
    const activeWps = customWaypoints || currentLevel?.waypoints || [];
    if (activeWps.length >= 2) {
      setCurrentHeading(getInitialHeading(activeWps));
    }
  }, [currentLevelIndex, customWaypoints, dbLevels]);

  const currentWorld = ALL_WORLDS.find((w) => w.id === selectedWorldId) || ALL_WORLDS[0];
  const currentAdv = currentWorld.adventures.find((a) => a.id === selectedAdventureId) || currentWorld.adventures[0];
  const activeAdventureLevels = currentAdv?.levels || PUZZLE_LEVELS;
  const currentLevel = (dbLevels[currentLevelIndex] && dbLevels[currentLevelIndex].adventureId === currentAdv.id && (dbLevels[currentLevelIndex].worldId || 1) === currentWorld.id)
    ? dbLevels[currentLevelIndex]
    : activeAdventureLevels[currentLevelIndex] || activeAdventureLevels[0];
  const waypoints = customWaypoints || currentLevel.waypoints || [];

  const levelInfo: LevelInfo = {
    id: currentLevel.id,
    levelNumber: currentLevel.levelNumber || currentLevelIndex + 1,
    title: currentLevel.title,
    objective: currentLevel.objective || currentLevel.description || 'Complete mission goal.',
    mechanic: currentLevel.mechanic || 'Sequential Execution',
    svgMap: currentLevel.bgImage || `/${selectedWorldId || 1}_${selectedAdventureId || 1}_${currentLevelIndex + 1}.svg`,
    maxBlocks: currentLevel.maxBlocks,
    totalLevels: currentAdv.totalLevels || 12,
    adventureTitle: currentAdv.title || adventureTitle || ADVENTURE_1.title,
    story: currentAdv.story || adventureStory || ADVENTURE_1.story,
    worldId: currentWorld.id,
    worldName: currentWorld.name,
    worldLanguage: currentWorld.language,
    worldTheme: currentWorld.theme,
  };

  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [collectedCoins, setCollectedCoins] = useState<number[]>([]);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('motion');

  // Scratch Editor Program State (Default initial blocks: 'when flag clicked' + 'HTML' hat block)
  const [program, setProgram] = useState<CodeBlock[]>([
    {
      instanceId: 'default-when-clicked',
      type: 'when_flag_clicked',
      label: 'when flag clicked',
      category: 'events',
      blockClass: 'block-events',
    },
    {
      instanceId: 'default-html-hat',
      type: 'when_html_started',
      label: 'HTML',
      category: 'html',
      blockClass: 'bg-purple-700 text-white border-purple-900 font-bold',
    },
  ]);

  // Helper to check if a specific block type is present anywhere in program (including nested blocks)
  const hasBlockInTree = (blocks: CodeBlock[], targetType: string): boolean => {
    return blocks.some(b => {
      if (b.type === targetType) return true;
      if (b.children && b.children.length > 0) {
        return hasBlockInTree(b.children, targetType);
      }
      return false;
    });
  };

  const isHtmlBlockTile = (type?: string): boolean => {
    if (!type) return false;
    return [
      'doctype', 'doctype_html',
      'html_tag', 'html',
      'head_tag', 'head',
      'title_tag', 'title',
      'body_tag', 'body',
      'h1_tag', 'h1',
      'p_tag', 'p',
      'list_tag', 'list',
      'link_tag', 'link',
      'img_tag', 'img'
    ].includes(type);
  };

  const getBlockLabel = (wpType: string): string => {
    if (wpType === 'doctype' || wpType === 'doctype_html') return '<!doctype html>';
    if (wpType === 'html_tag' || wpType === 'html') return '<html>';
    if (wpType === 'head_tag' || wpType === 'head') return '<head>';
    if (wpType === 'title_tag' || wpType === 'title') return '<title>';
    return `<${wpType}>`;
  };

  const isHtmlBlockInProgram = (wpType: string, blocks: CodeBlock[]): boolean => {
    let reqTypes: string[] = [wpType];
    if (wpType === 'doctype' || wpType === 'doctype_html') reqTypes = ['doctype', 'doctype_html'];
    if (wpType === 'html_tag' || wpType === 'html') reqTypes = ['html_tag', 'html'];
    if (wpType === 'head_tag' || wpType === 'head') reqTypes = ['head_tag', 'head'];
    if (wpType === 'title_tag' || wpType === 'title') reqTypes = ['title_tag', 'title'];
    if (wpType === 'body_tag' || wpType === 'body') reqTypes = ['body_tag', 'body'];
    if (wpType === 'h1_tag' || wpType === 'h1') reqTypes = ['h1_tag', 'h1'];
    if (wpType === 'p_tag' || wpType === 'p') reqTypes = ['p_tag', 'p'];
    if (wpType === 'list_tag' || wpType === 'list') reqTypes = ['list_tag', 'list'];
    if (wpType === 'link_tag' || wpType === 'link') reqTypes = ['link_tag', 'link'];
    if (wpType === 'img_tag' || wpType === 'img') reqTypes = ['img_tag', 'img'];
    return reqTypes.some(t => hasBlockInTree(blocks, t));
  };

  // Helper to extract nested title text from html_tag -> head_tag -> title_tag -> text_input block
  const getTitleTextFromTree = (blocks: CodeBlock[]): string | null => {
    for (const block of blocks) {
      if (block.type === 'html_tag' && block.children) {
        for (const headNode of block.children) {
          if (headNode.type === 'head_tag' && headNode.children) {
            for (const titleNode of headNode.children) {
              if (titleNode.type === 'title_tag' && titleNode.children) {
                for (const textNode of titleNode.children) {
                  if (textNode.type === 'text_input' || textNode.textValue) {
                    return textNode.textValue || textNode.label || 'Title';
                  }
                }
              }
            }
          }
        }
      }

      if (block.type === 'title_tag' && block.children) {
        for (const textNode of block.children) {
          if (textNode.type === 'text_input' || textNode.textValue) {
            return textNode.textValue || textNode.label || 'Title';
          }
        }
      }

      if (block.children && block.children.length > 0) {
        const found = getTitleTextFromTree(block.children);
        if (found) return found;
      }
    }
    return null;
  };

  const hasDoctype = hasBlockInTree(program, 'doctype');
  const hasHtmlTag = hasBlockInTree(program, 'html_tag');
  const isWorld2 = selectedWorldId === 2 || (currentLevel && currentLevel.worldId === 2);
  const titleText = getTitleTextFromTree(program);

  // Sync HTML Hat block for World 2 vs World 1
  useEffect(() => {
    if (isWorld2) {
      setProgram((prev) => {
        if (!prev.some((b) => b.type === 'when_html_started')) {
          return [
            {
              instanceId: 'default-when-clicked',
              type: 'when_flag_clicked',
              label: 'when flag clicked',
              category: 'events',
              blockClass: 'block-events',
            },
            {
              instanceId: 'default-html-hat',
              type: 'when_html_started',
              label: 'HTML',
              category: 'html',
              blockClass: 'bg-purple-700 text-white border-purple-900 font-bold',
            },
            ...prev.filter((b) => b.type !== 'when_flag_clicked'),
          ];
        }
        return prev;
      });
    } else {
      setProgram((prev) => prev.filter((b) => b.category !== 'html' && b.type !== 'when_html_started'));
    }
  }, [isWorld2]);

  // Proximity Guide Effect: When sprite is on a tile next to an HTML tile, instruct user to add the block under the HTML stack
  useEffect(() => {
    if (isRunning) return;
    const wps = customWaypoints || currentLevel?.waypoints || [];
    if (wps.length === 0) return;

    const currentWp = wps[currentWaypointIndex] || wps[0];
    if (!currentWp) return;

    const heading = currentHeading || 'S';
    const nextWp = findNextWaypointInHeading(currentWp, heading, wps) || wps[currentWaypointIndex + 1];

    if (nextWp && nextWp.type && isHtmlBlockTile(nextWp.type)) {
      const hasBlock = isHtmlBlockInProgram(nextWp.type, program);
      if (!hasBlock) {
        if (nextWp.type === 'head' || nextWp.type === 'head_tag') {
          setSpeechBubble(`💡 Guide: Nest the <head> tag inside the <html> tag!`);
        } else if (nextWp.type === 'title' || nextWp.type === 'title_tag') {
          setSpeechBubble(`💡 Guide: Nest the <title> tag inside the <head> tag!`);
        } else if (nextWp.type === 'html' || nextWp.type === 'html_tag') {
          setSpeechBubble(`💡 Guide: Add the <html> tag under <!doctype html>!`);
        } else if (nextWp.type === 'doctype' || nextWp.type === 'doctype_html') {
          setSpeechBubble(`💡 Guide: Add <!doctype html> at the top of the HTML stack!`);
        } else {
          const label = getBlockLabel(nextWp.type);
          setSpeechBubble(`💡 Guide: Next tile is ${label}! Add the ${label} block under the HTML stack!`);
        }
      }
    }
  }, [currentWaypointIndex, customWaypoints, currentLevel, program, currentHeading, isRunning]);

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
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('puzzlepro_active_level', index.toString());
        if (selectedAdventureId) {
          localStorage.setItem('puzzlepro_active_adv', selectedAdventureId.toString());
        }
      }
    } catch (e) {}
    setLevelsProgress((prev) =>
      prev.map((l, idx) => {
        if (idx === index || idx <= currentLevelIndex + 1) {
          return { ...l, unlocked: true };
        }
        return l;
      })
    );
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

  const handleUpdateMaxBlocks = (newMaxBlocks: number) => {
    setDbLevels((prev) =>
      prev.map((l, idx) => {
        if (idx === currentLevelIndex) {
          return { ...l, maxBlocks: newMaxBlocks };
        }
        return l;
      })
    );
  };

  // Path-Graph Execution Engine
  const handleRunProgram = async (blocksToRun?: CodeBlock[], speed = 1) => {
    const rawBlocks = blocksToRun || program;
    const codeBlocks = rawBlocks.filter((b) => b.category !== 'html');
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
      } else if (block.type === 'move_forward' || block.type === 'turn_left' || block.type === 'turn_right' || block.type === 'turn_around') {
        const count = Math.max(1, Math.min(10, stepVal));
        for (let i = 0; i < count; i++) {
          flatSteps.push({ action: block.type, blockIndex: idx, distance: 1 });
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
      } else if (step.action === 'turn_around') {
        soundManager.playClick();
        setSpeechBubble('Turning Around 180°!');
        const reverseMap: Record<string, 'N' | 'E' | 'S' | 'W'> = { N: 'S', S: 'N', E: 'W', W: 'E' };
        heading = reverseMap[heading] || 'S';
        setCurrentHeading(heading);
        await new Promise(res => setTimeout(res, stepDelay));
      } else if (step.action === 'jump') {
        const jumpDistance = Math.max(1, step.distance || 2);
        soundManager.playEquip();
        setSpeechBubble(`Jumping ${jumpDistance} spaces!`);
        setIsJumping(true);

        let targetWp: PathWaypoint | null = waypoints[pathIdx];
        for (let j = 0; j < jumpDistance; j++) {
          if (!targetWp) break;
          targetWp = findNextWaypointInHeading(targetWp, heading, waypoints);
        }

        if (!targetWp) {
          soundManager.playError();
          const newFailCount = levelFailCount + 1;
          setLevelFailCount(newFailCount);

          if (newFailCount <= 3) {
            setLoadingSpriteSrc('/monkey17.svg');
            setSpeechBubble('Jumped off track! (Try again)');
          } else {
            setLoadingSpriteSrc('/monkey14.svg');
            setSpeechBubble('Jumped off track! Returning to START!');
          }

          setIsGlobalLoading(true);
          setIsZoomingQuickly(true);
          await new Promise(res => setTimeout(res, 1850));
          setIsZoomingQuickly(false);
          setIsGlobalLoading(false);
          setLoadingSpriteSrc('/monkey1.svg');

          setIsRunning(false);
          setActiveStepIndex(null);
          setIsJumping(false);
          handleReturnToStartPos();
          return;
        }

        pathIdx = targetWp.index;
        setCurrentWaypointIndex(pathIdx);
        setFacingSegmentIndex(pathIdx);

        const currentWpNew = waypoints[pathIdx];
        if (currentWpNew.type === 'coin' && !coinsCollectedSoFar.includes(pathIdx)) {
          setSpeechBubble('Standing on a Coin! Use "collect coin" block to collect it!');
        }

        await new Promise(res => setTimeout(res, stepDelay));
        setIsJumping(false);
      } else if (step.action === 'collect_coin') {
        const currentWp = waypoints[pathIdx];
        if (currentWp.type === 'coin' && !coinsCollectedSoFar.includes(pathIdx)) {
          coinsCollectedSoFar.push(pathIdx);
          setCollectedCoins([...coinsCollectedSoFar]);
          soundManager.playCoin();
          setSpeechBubble('Collected Gold Coin! 🪙');
        } else if (coinsCollectedSoFar.includes(pathIdx)) {
          soundManager.playClick();
          setSpeechBubble('Already collected this coin!');
        } else {
          soundManager.playError();
          setSpeechBubble('No coin here to collect!');
        }
        await new Promise(res => setTimeout(res, stepDelay));
      } else if (step.action === 'move_forward') {
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
          await new Promise(res => setTimeout(res, 1850));
          setIsZoomingQuickly(false);
          setIsGlobalLoading(false);
          setLoadingSpriteSrc('/monkey1.svg');

          setIsRunning(false);
          setActiveStepIndex(null);
          handleReturnToStartPos();
          return;
        }

        // Check if approaching an HTML block that has NOT been added to the board (program)
        if (nextWp.type && isHtmlBlockTile(nextWp.type) && !isHtmlBlockInProgram(nextWp.type, program)) {
          soundManager.playError();
          const newFailCount = levelFailCount + 1;
          setLevelFailCount(newFailCount);

          setLoadingSpriteSrc('/monkey17.svg');
          if (nextWp.type === 'head' || nextWp.type === 'head_tag') {
            setSpeechBubble(`Missing <head> block! Nest the <head> tag inside the <html> tag! Returning to START!`);
          } else if (nextWp.type === 'title' || nextWp.type === 'title_tag') {
            setSpeechBubble(`Missing <title> block! Nest the <title> tag inside the <head> tag! Returning to START!`);
          } else {
            const label = getBlockLabel(nextWp.type);
            setSpeechBubble(`Missing ${label} block on board! Returning to START!`);
          }

          setIsGlobalLoading(true);
          setIsZoomingQuickly(true);
          await new Promise(res => setTimeout(res, 1850));
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

        // 1. Check Coin Tile (Non-automatic coin hint)
        if (currentWpNew.type === 'coin' && !coinsCollectedSoFar.includes(pathIdx)) {
          setSpeechBubble('Standing on a Coin! Use "collect coin" block to collect it!');
        }

        // 1b. Check HTML Block Tiles
        if (currentWpNew.type && isHtmlBlockTile(currentWpNew.type)) {
          if (!isHtmlBlockInProgram(currentWpNew.type, program)) {
            soundManager.playError();
            const newFailCount = levelFailCount + 1;
            setLevelFailCount(newFailCount);

            const label = getBlockLabel(currentWpNew.type);
            setLoadingSpriteSrc('/monkey17.svg');
            setSpeechBubble(`Missing ${label} block on board! Returning to START!`);

            setIsGlobalLoading(true);
            setIsZoomingQuickly(true);
            await new Promise(res => setTimeout(res, 1850));
            setIsZoomingQuickly(false);
            setIsGlobalLoading(false);
            setLoadingSpriteSrc('/monkey1.svg');

            setIsRunning(false);
            setActiveStepIndex(null);
            handleReturnToStartPos();
            return;
          }

          setSpeechBubble(`Standing on ${getBlockLabel(currentWpNew.type)} tile!`);
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

        // 3b. Check Maze Pit Hazard Tile Logic (Fell into pit -> triggers failure animation and sends back to START)
        if (currentWpNew.type === 'pit') {
          soundManager.playError();
          const newFailCount = levelFailCount + 1;
          setLevelFailCount(newFailCount);

          if (newFailCount <= 3) {
            setLoadingSpriteSrc('/monkey17.svg');
            setSpeechBubble('Fell into Maze Pit! (Try again)');
          } else {
            setLoadingSpriteSrc('/monkey14.svg');
            setSpeechBubble('Fell into Maze Pit! Returning to START!');
          }

          setIsGlobalLoading(true);
          setIsZoomingQuickly(true);
          await new Promise(res => setTimeout(res, 1850));
          setIsZoomingQuickly(false);
          setIsGlobalLoading(false);
          setLoadingSpriteSrc('/monkey1.svg');

          setIsRunning(false);
          setActiveStepIndex(null);
          handleReturnToStartPos();
          return;
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

    const totalCoinsInLevel = waypoints.filter(w => w.type === 'coin').length;
    const isAllCoinsCollected = totalCoinsInLevel === 0 || coinsCollectedSoFar.length >= totalCoinsInLevel;

    if (pathIdx === waypoints.length - 1) {
      if (!isAllCoinsCollected) {
        soundManager.playError();
        const newFailCount = levelFailCount + 1;
        setLevelFailCount(newFailCount);

        if (newFailCount <= 3) {
          setLoadingSpriteSrc('/monkey17.svg');
          setSpeechBubble('Missed coins! Collect all coins before finishing!');
        } else {
          setLoadingSpriteSrc('/monkey14.svg');
          setSpeechBubble('Missed coins! Returning to START!');
        }

        setIsGlobalLoading(true);
        setIsZoomingQuickly(true);
        await new Promise(res => setTimeout(res, 1850));
        setIsZoomingQuickly(false);
        setIsGlobalLoading(false);
        setLoadingSpriteSrc('/monkey1.svg');

        handleReturnToStartPos();
        return;
      }

      setSpeechBubble('MAZE CLEARED!');
      soundManager.playEquip();

      setLoadingSpriteSrc('/monkey18.svg');
      setIsGlobalLoading(true);
      setIsZoomingQuickly(true);
      await new Promise(res => setTimeout(res, 1850));
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

      // Immediately unlock next level locally in levelsProgress state
      const clearedLvlNum = currentLevel.levelNumber;
      setLevelsProgress((prev) =>
        prev.map((l, idx) => {
          if (l.levelNumber === clearedLvlNum) {
            return { ...l, completed: true, unlocked: true, stars: 3 };
          }
          if (idx === currentLevelIndex + 1) {
            return { ...l, unlocked: true };
          }
          return l;
        })
      );

      // Strategic Point 2: Write Stage Completion Event to Database
      fetch(`${PLAYER_SERVICE_API_URL}/api/v1/player/events`, {
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
    { id: 'html', svg: '/Setup.svg', title: 'HTML Tags' },
    { id: 'setup', svg: '/Setup.svg', title: 'Setup' },
    { id: 'exit', svg: '/Exit.svg', title: 'Exit' },
  ];

  // Strategic Point 3: Fetch Progress on Code Login
  const handleCodeSubmit = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch(`${PLAYER_SERVICE_API_URL}/api/v1/player/code-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data && data.success && data.user) {
        if (data.token) {
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('puzzlepro_session_token', data.token);
              sessionStorage.setItem('puzzlepro_session_token', data.token);
              localStorage.setItem('puzzlepro_session_code', code);
              sessionStorage.setItem('puzzlepro_session_code', code);
            }
          } catch (e) {}
        }
        const userXp = data.user.total_xp ?? 0;
        const assignedWorld = data.user.world_id || data.user.worldId || data.user.assigned_world_id || data.user.world || 1;
        setSelectedWorldId(assignedWorld);
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
    <main className="w-screen h-screen overflow-hidden text-slate-100 flex flex-col font-sans relative bg-slate-950">
      
      {/* Global Framer Motion Wave Loading & Sprite Animation Overlay - Placed at Top of Tree to Block Flash on Refresh */}
      <GlobalLoadingOverlay
        isLoading={isGlobalLoading}
        spriteSrc={loadingSpriteSrc}
        isQuickZoom={isZoomingQuickly}
      />
      
      {/* Refuse game load if iFrame Embed Token is invalid, expired, or domain mismatch */}
      {embedError && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="bg-slate-900 border-2 border-red-500/50 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center gap-4 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-md">
              <svg className="w-10 h-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Embed Authorization Refused</h2>
              <p className="text-xs font-medium text-red-300 mt-2 leading-relaxed bg-red-950/50 p-3 rounded-xl border border-red-800/40">
                {embedError}
              </p>
            </div>
            <div className="text-[10px] text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-white/10 w-full text-left leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">Server-Side Security Enforcement:</span>
              • Signed HMAC Token Signature Check<br />
              • Expiration & Domain Origin Check<br />
              • Business Entitlements Validated
            </div>
          </div>
        </div>
      )}

      {/* Background Image */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Image 
          src={getCdnUrl('/full_maze.jpeg')} 
          alt="Full Maze Background" 
          fill 
          className="object-cover object-center filter brightness-95 contrast-105 blur-lg scale-105 opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" />
      </div>

      {/* Top Application Header Bar - Only Visible After Logging In / Starting Game */}
      {!showSplash && (
        <header className="fixed top-0 left-0 right-0 z-[100] w-full px-4 sm:px-8 py-3 flex items-center justify-end min-h-[72px] pointer-events-none">

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
      )}

      {/* Main View Area */}
      <div className="flex-1 w-full h-full p-0 flex flex-col items-center justify-center relative z-20 overflow-hidden pt-[72px]">
        
        {/* MAZE CANVAS IS PERMANENTLY RENDERED ON-SCREEN AS THE BASE BOARD SCREEN */}
        <div className="w-full h-full relative z-10">

          {/* WORLD 2 KINGDOM SCROLL: Mounted to the right beside sidebar buttons, just below top menu */}
          <AnimatePresence>
            {isWorld2 && (hasDoctype || hasHtmlTag) && (
              <motion.div
                key="world2-right-scroll"
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed top-16 sm:top-18 md:top-20 right-0 xs:-right-3 sm:-right-6 md:-right-8 lg:-right-10 z-30 w-[360px] xs:w-[420px] sm:w-[500px] md:w-[580px] lg:w-[660px] h-[65vh] sm:h-[76vh] md:h-[84vh] lg:h-[88vh] pointer-events-none flex flex-col items-center justify-center pt-2 sm:pt-3"
              >
                <div 
                  className={`relative w-full h-full transition-all duration-700 select-none flex items-center justify-center opacity-100 ${
                    hasHtmlTag
                      ? 'grayscale-0 opacity-100 filter drop-shadow-[0_0_35px_rgba(251,191,36,0.85)] brightness-105 saturate-125'
                      : 'grayscale opacity-100 brightness-75 contrast-75 drop-shadow-none'
                  }`}
                >
                  <Image 
                    src="/scroll.svg" 
                    alt="World 2 Kingdom Scroll" 
                    fill 
                    className="object-fill rounded-2xl opacity-100"
                    priority
                  />

                  {/* TITLE TEXT DISPLAYED ON TOP FOLD OF THE SCROLL */}
                  {titleText && (
                    <motion.div
                      key={titleText}
                      initial={{ opacity: 0, scale: 0.9, y: -6 }}
                      animate={{ opacity: 0.8, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                      className="absolute top-7 sm:top-9 md:top-10 left-1/2 -translate-x-1/2 z-30 font-sans font-normal text-slate-900 opacity-80 text-[10px] sm:text-xs md:text-sm text-center px-4 max-w-[78%] truncate pointer-events-none drop-shadow-sm select-none"
                    >
                      {titleText}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <GameCanvas 
            level={currentLevel}
            selectedWorldId={selectedWorldId}
            selectedAdventureId={selectedAdventureId || undefined}
            currentWaypointIndex={currentWaypointIndex}
            currentHeading={currentHeading}
            facingSegmentIndex={facingSegmentIndex}
            overrideSpriteSrc={overrideSpriteSrc}
            isZoomingQuickly={isZoomingQuickly}
            isJumping={isJumping}
            collectedCoins={collectedCoins}
            speechBubble={speechBubble}
            equippedHat={equippedHat}
            characterName={characterName}
            selectedCharacter={selectedCharacter}
            onUpdateWaypoints={handleUpdateWaypoints}
            onUpdateMaxBlocks={handleUpdateMaxBlocks}
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
                isWorld2={isWorld2}
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

        {/* TREASURE MAP VIEW - 2-TIER ADVENTURES DIRECTORY & LEVEL SUB-PAGES */}
        <AnimatePresence>
          {activeTab === 'map' && (
            <motion.div
              key="map-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-5 pt-20 sm:pt-24 pb-14 bg-slate-950/85 backdrop-blur-md pointer-events-auto overflow-hidden w-screen h-screen"
            >
              {/* Top Left Back Button */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    if (selectedAdventureId !== null) {
                      setSelectedAdventureId(null);
                    } else {
                      try {
                        localStorage.removeItem('puzzlepro_session_token');
                        sessionStorage.removeItem('puzzlepro_session_token');
                        localStorage.removeItem('puzzlepro_session_code');
                        sessionStorage.removeItem('puzzlepro_session_code');
                      } catch (e) {}
                      setShowSplash(true);
                      setActiveTab('studio');
                    }
                  }}
                  className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer flex-shrink-0 z-50"
                >
                  <Image src="/Back.svg" alt="Back" fill className="object-contain" />
                </button>
              </div>

              {/* Bottom Center Horizontal Admin World Navigator */}
              {userContext.role === 'admin' && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md p-1.5 px-3 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto scale-90 sm:scale-95 transition-all duration-200">
                  <span className="text-[9px] font-medium text-amber-400 font-mono uppercase tracking-wider shrink-0 hidden xs:inline">
                    Admin Worlds:
                  </span>
                  <div className="flex items-center space-x-1">
                    {ALL_WORLDS.map((w) => (
                      <button
                        key={`map-page-world-${w.id}`}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedWorldId(w.id);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all duration-200 cursor-pointer shrink-0 border ${
                          selectedWorldId === w.id
                            ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm scale-105'
                            : 'bg-slate-900/90 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        World {w.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Title Header */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full text-center py-2 px-4 flex flex-col items-center shrink-0 z-30"
              >
                {selectedAdventureId === null ? (
                  <>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                      {currentWorld.name}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-emerald-400 mt-1 max-w-2xl mx-auto drop-shadow-sm">
                      {currentWorld.description}
                    </p>
                  </>
                ) : (
                  (() => {
                    const currAdv = currentWorld.adventures.find(a => a.id === selectedAdventureId) || currentWorld.adventures[0];
                    return (
                      <>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                          {selectedWorldId || currentWorld.id || 1} . {currAdv.id} . {currAdv.title}
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-emerald-400 mt-1 max-w-2xl mx-auto drop-shadow-sm">
                          {currAdv.story}
                        </p>
                      </>
                    );
                  })()
                )}
              </motion.div>

              {/* TIER 1: TOP LEVEL ADVENTURES DIRECTORY PAGE (Monkeys & Padlocks styling) */}
              {selectedAdventureId === null ? (
                <div className="flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden my-auto py-2 z-20">
                  <motion.div
                    key="adventures-directory-grid"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                      },
                      exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
                    }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 w-full max-h-full items-center justify-items-center overflow-hidden"
                  >
                    {currentWorld.adventures.map((adv) => {
                      const monkeyNum = (((adv.id + 11) % 23) + 1);
                      const advMonkeyImg = `/monkey${monkeyNum}.svg`;
                      const isAdvUnlocked = adv.id === 1 || userContext.role === 'admin';
                      const isVibrating = lockedVibrateLevelIndex === adv.id;

                      return (
                        <motion.div
                          key={`adv-dir-card-${adv.id}`}
                          variants={{
                            hidden: { opacity: 0, y: 50, scale: 0.8 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } },
                            exit: { opacity: 0, y: 40, scale: 0.8, transition: { duration: 0.15 } },
                          }}
                          onClick={() => {
                            if (isAdvUnlocked) {
                              soundManager.playClick();
                              setSelectedAdventureId(adv.id);
                              setAdventureTitle(adv.title);
                              setAdventureStory(adv.story);
                            } else {
                              soundManager.playError();
                              setLockedVibrateLevelIndex(adv.id);
                              setTimeout(() => setLockedVibrateLevelIndex(null), 1200);
                            }
                          }}
                          className="flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105 active:scale-95 group select-none"
                        >
                          {/* Image Container with Bottom-Right Status Badge */}
                          <motion.div
                            animate={isVibrating ? {
                              x: [-12, 12, -10, 10, -6, 6, -3, 3, 0],
                              rotate: [-6, 6, -4, 4, -2, 2, 0],
                            } : {}}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 relative flex-shrink-0 mb-1"
                          >
                            <Image 
                              src={getCdnUrl(advMonkeyImg)} 
                              alt={`Adventure ${adv.id}: ${adv.title}`} 
                              fill 
                              className={`object-contain transition ${isAdvUnlocked ? 'filter drop-shadow-md group-hover:scale-105' : 'filter grayscale opacity-50'}`} 
                              priority 
                            />
                            
                            {/* Status Badge: Finish flag or 3x Zooming Locked Icon */}
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 z-10 filter drop-shadow-lg">
                              {isAdvUnlocked ? (
                                <Image 
                                  src="/maze_finish.svg" 
                                  alt="Unlocked Adventure" 
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
                                    alt="Locked Adventure" 
                                    fill 
                                    className="object-contain drop-shadow-xl" 
                                  />
                                </motion.div>
                              )}
                            </div>
                          </motion.div>

                          {/* Title & Concept Name under image */}
                          <div className="flex flex-col items-center text-center mt-1 max-w-[150px]">
                            <span className={`text-xs sm:text-sm font-bold tracking-wide transition leading-tight line-clamp-2 ${
                              isAdvUnlocked ? 'text-amber-300 group-hover:text-amber-200' : 'text-slate-500'
                            }`}>
                              {adv.title}
                            </span>
                            <span className={`text-[10px] sm:text-xs font-mono font-bold uppercase mt-0.5 ${
                              isAdvUnlocked ? 'text-emerald-400' : 'text-slate-600'
                            }`}>
                              {adv.concept}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              ) : (
                /* TIER 2: SUB-LEVELS GRID FOR SELECTED ADVENTURE */
                <div className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-auto py-2 z-20">
                  <motion.div
                    key="treasure-map-grid"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                      },
                      exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
                    }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="grid grid-cols-6 gap-2 sm:gap-4 w-full max-h-full items-center justify-items-center overflow-hidden"
                  >
                  {(currentWorld.adventures.find(a => a.id === selectedAdventureId) || currentWorld.adventures[0]).levels.map((lvlConfig, i) => {
                    const levelNum = i + 1;
                    const monkeyImg = `/monkey${((levelNum - 1) % 23) + 1}.svg`;
                    const levelTitle = lvlConfig?.title || `Level ${levelNum}`;
                    const lvlProg = levelsProgress[i];
                    const isAdmin = userContext.role === 'admin';
                    const isUnlocked = isAdmin || (lvlProg?.unlocked || lvlProg?.completed || i === 0);
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
                        {/* Image Container with Bottom-Right Status Badge */}
                        <motion.div
                          animate={isVibrating ? {
                            x: [-12, 12, -10, 10, -6, 6, -3, 3, 0],
                            rotate: [-6, 6, -4, 4, -2, 2, 0],
                          } : {}}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                          className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0 mb-1"
                        >
                          <Image 
                            src={getCdnUrl(monkeyImg)} 
                            alt={`Level ${levelNum}: ${levelTitle}`} 
                            fill 
                            className={`object-contain transition ${isUnlocked ? 'filter drop-shadow-md' : 'filter grayscale opacity-50'}`} 
                            priority 
                          />
                          
                          {/* Status Badge: Finish flag or Locked Icon */}
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
                </div>
              )}
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
        userRole={userContext.role}
      />

      {/* Game Application Launcher Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onStartGame={() => {
              setShowSplash(false);
              setShowWelcomeModal(false);
              setSelectedAdventureId(null);
              setActiveTab('map');
            }}
            onCodeSubmit={async (code) => {
              const ok = await handleCodeSubmit(code);
              if (ok) {
                setShowSplash(false);
                setShowWelcomeModal(false);
                setSelectedAdventureId(null);
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

    </main>
  );
}
