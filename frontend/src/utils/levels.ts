import { LevelConfig, PathWaypoint, AdventureConfig, WorldConfig } from '@/types/game';

// Level 1 specific track waypoints (4-tile straight vertical axis in center of Level 1 SVG, FINISH on tile 4)
export const LEVEL_1_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 50.16, yPercent: 37.6, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 50.16, yPercent: 46.0, type: 'normal' },
  { index: 2, r: 2, c: 0, xPercent: 50.16, yPercent: 54.5, type: 'normal' },
  { index: 3, r: 3, c: 0, xPercent: 50.16, yPercent: 63.0, type: 'goal', label: 'FINISH' },
];

// Level 2.1.1 specific track waypoints (aligned with 2_1_1.svg track center at xPercent 46.03)
export const LEVEL_2_1_1_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 46.03, yPercent: 27.2, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 46.03, yPercent: 40.8, type: 'normal' },
  { index: 2, r: 2, c: 0, xPercent: 46.03, yPercent: 54.4, type: 'normal' },
  { index: 3, r: 3, c: 0, xPercent: 46.03, yPercent: 68.0, type: 'normal' },
  { index: 4, r: 4, c: 0, xPercent: 46.03, yPercent: 81.4, type: 'goal', label: 'FINISH' },
];

// Level 2 specific track waypoints (straight vertical axis in center of Level 2 SVG)
export const LEVEL_2_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 49.44, yPercent: 35.7, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 49.44, yPercent: 42.4, type: 'normal' },
  { index: 2, r: 2, c: 0, xPercent: 49.44, yPercent: 49.1, type: 'normal' },
  { index: 3, r: 3, c: 0, xPercent: 49.44, yPercent: 55.8, type: 'normal' },
  { index: 4, r: 4, c: 0, xPercent: 49.44, yPercent: 62.5, type: 'normal' },
  { index: 5, r: 5, c: 0, xPercent: 49.44, yPercent: 69.2, type: 'goal', label: 'FINISH' },
];

// Level 3 specific track waypoints (Obstacle avoidance track)
export const LEVEL_3_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 50.16, yPercent: 35.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 50.16, yPercent: 44.0, type: 'normal' },
  { index: 2, r: 2, c: 0, xPercent: 50.16, yPercent: 53.0, type: 'normal' },
  { index: 3, r: 2, c: 1, xPercent: 62.0, yPercent: 53.0, type: 'normal' },
  { index: 4, r: 3, c: 1, xPercent: 62.0, yPercent: 65.0, type: 'normal' },
  { index: 5, r: 3, c: 0, xPercent: 50.16, yPercent: 65.0, type: 'goal', label: 'FINISH' },
];

// Level 4 specific track waypoints (Energy crystal collectible)
export const LEVEL_4_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 48.0, yPercent: 32.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 48.0, yPercent: 41.0, type: 'normal' },
  { index: 2, r: 2, c: 0, xPercent: 48.0, yPercent: 50.0, type: 'normal' },
  { index: 3, r: 2, c: 1, xPercent: 60.0, yPercent: 50.0, type: 'coin', label: 'ENERGY CRYSTAL' },
  { index: 4, r: 3, c: 1, xPercent: 60.0, yPercent: 60.0, type: 'normal' },
  { index: 5, r: 4, c: 1, xPercent: 60.0, yPercent: 70.0, type: 'goal', label: 'FINISH' },
];

// Level 5 specific track waypoints (Treasure trail multi-collectible)
export const LEVEL_5_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 42.0, yPercent: 30.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 42.0, yPercent: 40.0, type: 'normal' },
  { index: 2, r: 1, c: 1, xPercent: 52.0, yPercent: 40.0, type: 'coin', label: 'CRYSTAL 1' },
  { index: 3, r: 1, c: 2, xPercent: 62.0, yPercent: 40.0, type: 'normal' },
  { index: 4, r: 2, c: 2, xPercent: 62.0, yPercent: 52.0, type: 'coin', label: 'CRYSTAL 2' },
  { index: 5, r: 3, c: 2, xPercent: 62.0, yPercent: 64.0, type: 'normal' },
  { index: 6, r: 3, c: 1, xPercent: 52.0, yPercent: 64.0, type: 'coin', label: 'CRYSTAL 3' },
  { index: 7, r: 3, c: 0, xPercent: 42.0, yPercent: 64.0, type: 'goal', label: 'FINISH' },
];

// Level 6 specific track waypoints (Danger ahead hazard avoidance)
export const LEVEL_6_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 45.0, yPercent: 28.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 45.0, yPercent: 38.0, type: 'normal' },
  { index: 2, r: 1, c: 1, xPercent: 55.0, yPercent: 38.0, type: 'shell', effect: 'back_2', label: 'HAZARD PIT' },
  { index: 3, r: 2, c: 0, xPercent: 45.0, yPercent: 48.0, type: 'normal' },
  { index: 4, r: 3, c: 0, xPercent: 45.0, yPercent: 58.0, type: 'normal' },
  { index: 5, r: 3, c: 1, xPercent: 55.0, yPercent: 58.0, type: 'coin', label: 'CRYSTAL' },
  { index: 6, r: 4, c: 1, xPercent: 55.0, yPercent: 68.0, type: 'goal', label: 'FINISH' },
];

// Level 7 specific track waypoints (Watch your step alternative safe routes)
export const LEVEL_7_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 38.0, yPercent: 28.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 38.0, yPercent: 40.0, type: 'normal' },
  { index: 2, r: 1, c: 1, xPercent: 50.0, yPercent: 40.0, type: 'shell', effect: 'back_2', label: 'PIT' },
  { index: 3, r: 2, c: 0, xPercent: 38.0, yPercent: 52.0, type: 'normal' },
  { index: 4, r: 2, c: 1, xPercent: 50.0, yPercent: 52.0, type: 'star', effect: 'advance_3', label: 'SUPER STAR' },
  { index: 5, r: 2, c: 2, xPercent: 62.0, yPercent: 52.0, type: 'normal' },
  { index: 6, r: 3, c: 2, xPercent: 62.0, yPercent: 64.0, type: 'coin', label: 'COIN' },
  { index: 7, r: 4, c: 2, xPercent: 62.0, yPercent: 76.0, type: 'goal', label: 'FINISH' },
];

// Level 8 specific track waypoints (Hidden rewards bonus star quest)
export const LEVEL_8_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 35.0, yPercent: 25.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 35.0, yPercent: 36.0, type: 'normal' },
  { index: 2, r: 1, c: 1, xPercent: 47.0, yPercent: 36.0, type: 'coin', label: 'COIN' },
  { index: 3, r: 1, c: 2, xPercent: 59.0, yPercent: 36.0, type: 'star', effect: 'advance_3', label: 'SUPER STAR' },
  { index: 4, r: 2, c: 2, xPercent: 59.0, yPercent: 48.0, type: 'normal' },
  { index: 5, r: 2, c: 1, xPercent: 47.0, yPercent: 48.0, type: 'shell', effect: 'back_2', label: 'HAZARD' },
  { index: 6, r: 3, c: 2, xPercent: 59.0, yPercent: 60.0, type: 'normal' },
  { index: 7, r: 4, c: 2, xPercent: 59.0, yPercent: 72.0, type: 'coin', label: 'COIN' },
  { index: 8, r: 4, c: 1, xPercent: 47.0, yPercent: 72.0, type: 'goal', label: 'FINISH' },
];

// Level 9 specific track waypoints (Treasure hunt exploration)
export const LEVEL_9_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 32.0, yPercent: 22.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 32.0, yPercent: 34.0, type: 'normal' },
  { index: 2, r: 1, c: 1, xPercent: 44.0, yPercent: 34.0, type: 'coin', label: 'COIN 1' },
  { index: 3, r: 1, c: 2, xPercent: 56.0, yPercent: 34.0, type: 'normal' },
  { index: 4, r: 1, c: 3, xPercent: 68.0, yPercent: 34.0, type: 'coin', label: 'COIN 2' },
  { index: 5, r: 2, c: 3, xPercent: 68.0, yPercent: 46.0, type: 'normal' },
  { index: 6, r: 3, c: 3, xPercent: 68.0, yPercent: 58.0, type: 'star', effect: 'advance_3', label: 'STAR' },
  { index: 7, r: 3, c: 2, xPercent: 56.0, yPercent: 58.0, type: 'coin', label: 'COIN 3' },
  { index: 8, r: 3, c: 1, xPercent: 44.0, yPercent: 58.0, type: 'normal' },
  { index: 9, r: 4, c: 1, xPercent: 44.0, yPercent: 70.0, type: 'goal', label: 'FINISH' },
];

// Level 10 specific track waypoints (Choose wisely path optimization)
export const LEVEL_10_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 30.0, yPercent: 20.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 30.0, yPercent: 32.0, type: 'normal' },
  { index: 2, r: 1, c: 1, xPercent: 42.0, yPercent: 32.0, type: 'shell', effect: 'back_2', label: 'TRAP' },
  { index: 3, r: 2, c: 0, xPercent: 30.0, yPercent: 44.0, type: 'coin', label: 'SAFE COIN' },
  { index: 4, r: 2, c: 1, xPercent: 42.0, yPercent: 44.0, type: 'normal' },
  { index: 5, r: 2, c: 2, xPercent: 54.0, yPercent: 44.0, type: 'star', effect: 'advance_3', label: 'BOOST' },
  { index: 6, r: 2, c: 3, xPercent: 66.0, yPercent: 44.0, type: 'normal' },
  { index: 7, r: 3, c: 3, xPercent: 66.0, yPercent: 56.0, type: 'coin', label: 'COIN' },
  { index: 8, r: 3, c: 2, xPercent: 54.0, yPercent: 56.0, type: 'normal' },
  { index: 9, r: 4, c: 2, xPercent: 54.0, yPercent: 68.0, type: 'goal', label: 'FINISH' },
];

// Level 11 specific track waypoints (Explorer's Trial multi-hazard trial)
export const LEVEL_11_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 25.0, yPercent: 18.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 25.0, yPercent: 30.0, type: 'normal' },
  { index: 2, r: 1, c: 1, xPercent: 37.0, yPercent: 30.0, type: 'coin', label: 'COIN 1' },
  { index: 3, r: 1, c: 2, xPercent: 49.0, yPercent: 30.0, type: 'normal' },
  { index: 4, r: 1, c: 3, xPercent: 61.0, yPercent: 30.0, type: 'shell', effect: 'back_2', label: 'TRAP' },
  { index: 5, r: 1, c: 4, xPercent: 73.0, yPercent: 30.0, type: 'star', effect: 'advance_3', label: 'STAR' },
  { index: 6, r: 2, c: 4, xPercent: 73.0, yPercent: 44.0, type: 'normal' },
  { index: 7, r: 2, c: 3, xPercent: 61.0, yPercent: 44.0, type: 'coin', label: 'COIN 2' },
  { index: 8, r: 2, c: 2, xPercent: 49.0, yPercent: 44.0, type: 'normal' },
  { index: 9, r: 3, c: 2, xPercent: 49.0, yPercent: 58.0, type: 'coin', label: 'COIN 3' },
  { index: 10, r: 3, c: 3, xPercent: 61.0, yPercent: 58.0, type: 'normal' },
  { index: 11, r: 4, c: 3, xPercent: 61.0, yPercent: 72.0, type: 'goal', label: 'FINISH' },
];

// Level 12 specific track waypoints (Journey Home final mastery track)
export const LEVEL_12_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 20.0, yPercent: 15.0, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 20.0, yPercent: 27.0, type: 'normal' },
  { index: 2, r: 1, c: 1, xPercent: 32.0, yPercent: 27.0, type: 'coin', label: 'COIN 1' },
  { index: 3, r: 1, c: 2, xPercent: 44.0, yPercent: 27.0, type: 'normal' },
  { index: 4, r: 1, c: 3, xPercent: 56.0, yPercent: 27.0, type: 'shell', effect: 'back_2', label: 'HAZARD 1' },
  { index: 5, r: 1, c: 4, xPercent: 68.0, yPercent: 27.0, type: 'star', effect: 'advance_3', label: 'SUPER STAR' },
  { index: 6, r: 1, c: 5, xPercent: 80.0, yPercent: 27.0, type: 'normal' },
  { index: 7, r: 2, c: 5, xPercent: 80.0, yPercent: 42.0, type: 'coin', label: 'COIN 2' },
  { index: 8, r: 2, c: 4, xPercent: 68.0, yPercent: 42.0, type: 'normal' },
  { index: 9, r: 2, c: 3, xPercent: 56.0, yPercent: 42.0, type: 'shell', effect: 'back_2', label: 'HAZARD 2' },
  { index: 10, r: 2, c: 2, xPercent: 44.0, yPercent: 42.0, type: 'coin', label: 'COIN 3' },
  { index: 11, r: 3, c: 2, xPercent: 44.0, yPercent: 57.0, type: 'star', effect: 'advance_3', label: 'BOOST' },
  { index: 12, r: 3, c: 3, xPercent: 56.0, yPercent: 57.0, type: 'normal' },
  { index: 13, r: 3, c: 4, xPercent: 68.0, yPercent: 57.0, type: 'coin', label: 'FINAL COIN' },
  { index: 14, r: 4, c: 4, xPercent: 68.0, yPercent: 75.0, type: 'goal', label: 'FINISH' },
];

export const ADVENTURE_1: AdventureConfig = {
  id: 1,
  slug: 'the-lost-monkey-explorer',
  title: 'The Lost Monkey Explorer',
  concept: 'Sequencing',
  icon: '🐵',
  story: `A friendly little monkey has crash-landed in the Whispering Forest. Its navigation system is broken, and only by giving it the correct instructions can it find its way home. Every level repairs a little more of the monkey's memory and unlocks the path ahead.`,
  learningObjective: `Put instructions in order; Follow and create simple sequences; Navigate using movement commands; Plan a route before execution.`,
  totalLevels: 12,
  levels: [
    {
      id: 1,
      adventureId: 1,
      worldId: 1,
      levelNumber: 1,
      title: 'Power Up!',
      description: 'Learn that a robot only acts when given instructions.',
      objective: 'Learn that a robot only acts when given instructions.',
      mechanic: 'Basic Movement',
      bgImage: '/1_1_1.svg',
      waypoints: LEVEL_1_WAYPOINTS,
      availableBlocks: ['move_forward'],
      maxBlocks: 5,
    },
    {
      id: 2,
      adventureId: 1,
      worldId: 1,
      levelNumber: 2,
      title: 'First Steps',
      description: 'Create a longer sequence of instructions.',
      objective: 'Create a longer sequence of instructions.',
      mechanic: 'Sequential Execution',
      bgImage: '/1_1_2.svg',
      waypoints: LEVEL_2_WAYPOINTS,
      availableBlocks: ['move_forward'],
      maxBlocks: 8,
    },
    {
      id: 3,
      adventureId: 1,
      worldId: 1,
      levelNumber: 3,
      title: 'Around the Tree',
      description: 'Navigate around an obstacle.',
      objective: 'Navigate around an obstacle.',
      mechanic: 'Turning',
      bgImage: '/1_1_3.svg',
      waypoints: LEVEL_3_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around'],
      maxBlocks: 10,
    },
    {
      id: 4,
      adventureId: 1,
      worldId: 1,
      levelNumber: 4,
      title: 'Energy Crystal',
      description: 'Collect your first item before reaching the goal.',
      objective: 'Collect your first item before reaching the goal.',
      mechanic: 'Collectibles',
      bgImage: '/1_1_4.svg',
      waypoints: LEVEL_4_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around'],
      maxBlocks: 10,
    },
    {
      id: 5,
      adventureId: 1,
      worldId: 1,
      levelNumber: 5,
      title: 'Treasure Trail',
      description: 'Collect every energy crystal on the path.',
      objective: 'Collect every energy crystal on the path.',
      mechanic: 'Planning & Collectibles',
      bgImage: '/1_1_5.svg',
      waypoints: LEVEL_5_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 12,
    },
    {
      id: 6,
      adventureId: 1,
      worldId: 1,
      levelNumber: 6,
      title: 'Danger Ahead',
      description: 'Reach the finish without touching dangerous tiles.',
      objective: 'Reach the finish without touching dangerous tiles.',
      mechanic: 'Hazard Avoidance',
      bgImage: '/1_1_6.svg',
      waypoints: LEVEL_6_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 12,
    },
    {
      id: 7,
      adventureId: 1,
      worldId: 1,
      levelNumber: 7,
      title: 'Watch Your Step!',
      description: 'Find a safe route around a pit.',
      objective: 'Find a safe route around a pit.',
      mechanic: 'Alternative Paths',
      bgImage: '/1_1_7.svg',
      waypoints: LEVEL_7_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 12,
    },
    {
      id: 8,
      adventureId: 1,
      worldId: 1,
      levelNumber: 8,
      title: 'Hidden Rewards',
      description: 'Explore to collect optional stars before finishing.',
      objective: 'Explore to collect optional stars before finishing.',
      mechanic: 'Bonus Objectives',
      bgImage: '/1_1_8.svg',
      waypoints: LEVEL_8_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 15,
    },
    {
      id: 9,
      adventureId: 1,
      worldId: 1,
      levelNumber: 9,
      title: 'Treasure Hunt',
      description: 'Collect all treasures and return safely to the finish.',
      objective: 'Collect all treasures and return safely to the finish.',
      mechanic: 'Route Planning',
      bgImage: '/1_1_9.svg',
      waypoints: LEVEL_9_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 15,
    },
    {
      id: 10,
      adventureId: 1,
      worldId: 1,
      levelNumber: 10,
      title: 'Choose Wisely',
      description: 'Find the safest and smartest path through the maze.',
      objective: 'Find the safest and smartest path through the maze.',
      mechanic: 'Path Optimization',
      bgImage: '/1_1_10.svg',
      waypoints: LEVEL_10_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 15,
    },
    {
      id: 11,
      adventureId: 1,
      worldId: 1,
      levelNumber: 11,
      title: 'Explorer\'s Trial',
      description: 'Combine everything you\'ve learned to solve a complex maze.',
      objective: 'Combine everything you\'ve learned to solve a complex maze.',
      mechanic: 'Integrated Trial',
      bgImage: '/1_1_11.svg',
      waypoints: LEVEL_11_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 20,
    },
    {
      id: 12,
      adventureId: 1,
      worldId: 1,
      levelNumber: 12,
      title: 'Journey Home',
      description: 'Guide the robot through its final mission and help it return home.',
      objective: 'Guide the robot through its final mission and help it return home.',
      mechanic: 'Mastery Challenge',
      bgImage: '/1_1_12.svg',
      waypoints: LEVEL_12_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 25,
    },
  ],
};

export const ADVENTURE_2: AdventureConfig = {
  id: 2,
  slug: 'the-crystal-cave',
  title: 'The Crystal Cave',
  concept: 'Loops',
  icon: '💎',
  story: `The Monkey enters a magical cave filled with glowing crystals. Many paths repeat, and doing the same action over and over is too slow. The Monkey discovers the power of Repeat.`,
  learningObjective: `Repeat instructions efficiently; Master loop counts and pattern repetition.`,
  totalLevels: 12,
  levels: [
    'Repeating Steps',
    'Crystal Corridor',
    'Mine All Crystals',
    'Climbing the Spiral',
    'Crossing the Bridge',
    'Repeat ×3',
    'Repeat ×5',
    'Loop the Tunnel',
    'The Crystal Maze',
    'Save Energy',
    'Master the Loop',
    'Crystal Guardian (Boss)'
  ].map((name, i) => ({
    id: 200 + i + 1,
    adventureId: 2,
    worldId: 1,
    levelNumber: i + 1,
    title: name,
    description: `Adventure 2: Master loops and repeats in ${name}.`,
    objective: `Use repeat loops to complete ${name}.`,
    mechanic: 'Loops (Repeat)',
    bgImage: `/1_2_${(i % 12) + 1}.svg`,
    waypoints: LEVEL_1_WAYPOINTS,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
    maxBlocks: 15,
  })),
};

export const ADVENTURE_3: AdventureConfig = {
  id: 3,
  slug: 'the-enchanted-jungle',
  title: 'The Enchanted Jungle',
  concept: 'Conditionals',
  icon: '🌿',
  story: `The jungle is alive. Bridges appear and disappear, gates open with keys, and animals react differently depending on what the Monkey finds. The Monkey must learn to make decisions.`,
  learningObjective: `Make decisions based on situations; Use logic branches (If / Else).`,
  totalLevels: 12,
  levels: [
    'The Locked Gate',
    'Find the Key',
    'Hungry Crocodile',
    'Choose the Safe Bridge',
    'Rain or Sunshine',
    'If You Find a Banana...',
    'If Danger, Turn Away',
    'Two Jungle Paths',
    'Rescue the Baby Monkey',
    'Jungle Puzzle',
    'Smart Decisions',
    'Escape the Temple (Boss)'
  ].map((name, i) => ({
    id: 300 + i + 1,
    adventureId: 3,
    worldId: 1,
    levelNumber: i + 1,
    title: name,
    description: `Adventure 3: Make smart decisions in ${name}.`,
    objective: `Use conditionals to pass ${name}.`,
    mechanic: 'If / Else Logic',
    bgImage: `/1_3_${(i % 12) + 1}.svg`,
    waypoints: LEVEL_1_WAYPOINTS,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
    maxBlocks: 15,
  })),
};

export const ADVENTURE_4: AdventureConfig = {
  id: 4,
  slug: 'monkeys-treasure-island',
  title: "Monkey's Treasure Island",
  concept: 'Variables',
  icon: '🏝️',
  story: `The Monkey lands on an island where bananas, coins, gems, and hearts are collected and counted. Progress depends on keeping track of resources.`,
  learningObjective: `Store and update information; Track scores, inventories, and counters.`,
  totalLevels: 12,
  levels: [
    'Count Your Bananas',
    'Collect 5 Coins',
    'Spend a Coin',
    'Gain a Heart',
    'Lose a Heart',
    'Open the Treasure Chest',
    'Keep Score',
    'Enough Bananas?',
    'Collect Everything',
    'Trade with the Pirate',
    'Treasure Race',
    'Island Champion (Boss)'
  ].map((name, i) => ({
    id: 400 + i + 1,
    adventureId: 4,
    worldId: 1,
    levelNumber: i + 1,
    title: name,
    description: `Adventure 4: Track variables and resources in ${name}.`,
    objective: `Manage counters and variables in ${name}.`,
    mechanic: 'Variables & Counters',
    bgImage: `/1_4_${(i % 12) + 1}.svg`,
    waypoints: LEVEL_1_WAYPOINTS,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
    maxBlocks: 15,
  })),
};

export const ADVENTURE_5: AdventureConfig = {
  id: 5,
  slug: 'the-monkey-inventors-workshop',
  title: "The Monkey Inventor's Workshop",
  concept: 'Functions',
  icon: '⚙️',
  story: `The Monkey becomes an inventor. Instead of repeating long instruction sequences, it creates reusable "Monkey Moves" that can be used again and again.`,
  learningObjective: `Reuse groups of instructions; Define and call modular functions.`,
  totalLevels: 12,
  levels: [
    'Build Your First Function',
    'Call the Function',
    'Cross Every Bridge',
    'Banana Collector',
    'Build a Ladder',
    'Repeat Your Function',
    'Two Different Functions',
    'Function Challenge',
    'Fix the Broken Function',
    'Workshop Puzzle',
    'Inventor\'s Test',
    'Master Inventor (Boss)'
  ].map((name, i) => ({
    id: 500 + i + 1,
    adventureId: 5,
    worldId: 1,
    levelNumber: i + 1,
    title: name,
    description: `Adventure 5: Build modular functions in ${name}.`,
    objective: `Create reusable function moves in ${name}.`,
    mechanic: 'Functions & Reusability',
    bgImage: `/1_5_${(i % 12) + 1}.svg`,
    waypoints: LEVEL_1_WAYPOINTS,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
    maxBlocks: 20,
  })),
};

export const ALL_ADVENTURES: AdventureConfig[] = [
  ADVENTURE_1,
  ADVENTURE_2,
  ADVENTURE_3,
  ADVENTURE_4,
  ADVENTURE_5,
];

function createAdv(
  worldId: number,
  advId: number,
  title: string,
  concept: string,
  icon: string,
  story: string,
  learningObjective: string,
  project: string,
  levelNames: string[],
  mechanic: string = 'Interactive Coding'
): AdventureConfig {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: advId,
    worldId,
    slug,
    title,
    concept,
    icon,
    story,
    learningObjective,
    project,
    totalLevels: levelNames.length,
    levels: levelNames.map((name, i) => ({
      id: worldId * 1000 + advId * 100 + i + 1,
      worldId,
      adventureId: advId,
      levelNumber: i + 1,
      title: name,
      description: name,
      objective: name,
      mechanic,
      bgImage: `/${worldId}_${advId}_${i + 1}.svg`,
      waypoints: (worldId === 2 && advId === 1 && i === 0) ? LEVEL_2_1_1_WAYPOINTS : LEVEL_1_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 15,
    })),
  };
}

// ----------------------------------------------------
// WORLD 2: THE DIGITAL KINGDOM (HTML — Build the World)
// ----------------------------------------------------
export const W2A1 = createAdv(
  2, 1, 'The Empty Land', 'HTML Document Structure', '🏰',
  'The Monkey discovers an abandoned digital kingdom. Nothing exists yet. There are no houses, schools, shops, parks, or castles. The Monkey becomes the Kingdom Builder. The child learns that HTML is the structure of everything.',
  'Master HTML document structure: <html>, <head>, <body>, <title>, and foundational tags.',
  'Create your first web page. A blank webpage becomes the Kingdom\'s foundation.',
  ['Welcome Builder', 'The HTML Skeleton', 'Head & Body', 'Add a Title', 'Save the Kingdom', 'View Your Page', 'Add Your First Content', 'Repair the Structure', 'Missing Tags', 'Complete Document', 'Builder Challenge', 'Kingdom Foundation'],
  'HTML Structure'
);

export const W2A2 = createAdv(
  2, 2, 'Building the Village', 'Headings & Paragraphs', '🏡',
  'The Monkey builds the first village structures using headings and text blocks to label houses and tell stories.',
  'Learn HTML headings (<h1> to <h6>), paragraphs (<p>), and text formatting (<b>, <i>, <br>).',
  'Label and structure the village buildings and announcements.',
  ['The First Sign', 'Heading High', 'Village Stories', 'Words That Matter', 'Bold the Important', 'Italic Messages', 'Break the Line', 'Build the Town Square', 'Fix the Village Text', 'The Perfect Announcement', 'Village Builder Challenge', 'Welcome Square'],
  'HTML Text & Headings'
);

export const W2A3 = createAdv(
  2, 3, 'Roads & Signs', 'Lists & Links', '🪧',
  'Connect the village with paths, bulleted lists, and navigation links between locations.',
  'Master ordered (<ol>), unordered (<ul>) lists, and anchor hyper-links (<a>).',
  'Create kingdom navigation menus and path checklists.',
  ['The First Road', 'Make a List', 'The Numbered Path', 'Kingdom Checklist', 'Build a Sign', 'Open the Gate', 'Link the Village', 'Navigation Road', 'Repair the Roads', 'Connect the Kingdom', 'Road Builder Challenge', 'Kingdom Navigation'],
  'HTML Lists & Links'
);

export const W2A4 = createAdv(
  2, 4, 'The Art Gallery', 'Images & Media', '🎨',
  'Display the royal artwork using image tags, alt attributes, and media elements.',
  'Embed images (<img>), understand src and alt attributes, and manage image dimensions.',
  'Build the Royal Art Gallery showcase.',
  ['The Empty Gallery', 'Hang a Picture', 'The Kingdom Image', 'Picture Paths', 'Name the Artwork', 'The Missing Description', 'Resize the Gallery', 'Arrange the Artwork', 'Repair the Gallery', 'Gallery Challenge', 'Curator\'s Test', 'Kingdom Gallery'],
  'HTML Images & Media'
);

export const W2A5 = createAdv(
  2, 5, 'The Marketplace', 'Tables & Inventory', '🧺',
  'Organize merchant goods into tables with rows, columns, and headers.',
  'Construct tables (<table>, <tr>, <td>, <th>) and manage structured data.',
  'Build the Village Marketplace product catalogue.',
  ['Open the Market', 'Meet the Rows', 'Build a Column', 'Create a Table', 'Market Headings', 'Add the Products', 'Fill the Catalogue', 'Repair the Market', 'Organize the Prices', 'Market Challenge', 'Merchant\'s Test', 'Village Market'],
  'HTML Tables'
);

export const W2A6 = createAdv(
  2, 6, 'The Messenger', 'Forms & Inputs', '📜',
  'Send messages across the kingdom using forms, text fields, radio buttons, and submit actions.',
  'Create interactive forms (<form>, <input>, <label>, <button>).',
  'Build the Royal Messenger registration office.',
  ['The First Message', 'Meet the Input', 'Ask a Question', 'Add a Label', 'Choose an Option', 'The Submit Button', 'Build the Message Form', 'Repair the Registration', 'The Missing Field', 'Messenger Challenge', 'Registration Test', 'Royal Registration Office'],
  'HTML Forms & Inputs'
);

export const W2A7 = createAdv(
  2, 7, 'Royal Library', 'Semantic HTML', '📚',
  'Organize royal documents using semantic tags like header, nav, main, section, article, and footer.',
  'Master semantic HTML5 structure (<header>, <nav>, <section>, <article>, <footer>).',
  'Build the Royal Library document archive.',
  ['Enter the Library', 'Meet the Header', 'Build the Main Hall', 'Create a Section', 'Write an Article', 'Open the Aside', 'Build the Footer', 'Organize the Library', 'Repair the Structure', 'Librarian\'s Challenge', 'Royal Knowledge Test', 'Royal Library'],
  'Semantic HTML5'
);

export const W2A8 = createAdv(
  2, 8, 'The Great City', 'Multi-page Website', '🌆',
  'Combine everything learned to build a full multi-page website for the Digital Kingdom.',
  'Assemble multi-page site navigation, consistent headers, and cohesive HTML layout.',
  'Publish Digital Kingdom v1.0.',
  ['Build the Homepage', 'Create the About Page', 'Open Contact', 'Add the Gallery', 'Connect the Pages', 'Build the Navigation', 'Organize the City', 'Repair the Website', 'The Missing Page', 'City Builder Challenge', 'Kingdom Website Test', 'Digital Kingdom v1'],
  'Web Architecture'
);

export const WORLD_2: WorldConfig = {
  id: 2,
  slug: 'the-digital-kingdom',
  name: 'World 2 — The Digital Kingdom',
  description: 'Build the World. The Monkey discovers an abandoned digital kingdom and becomes the Kingdom Builder.',
  language: 'HTML',
  theme: 'Build the World',
  adventures: [W2A1, W2A2, W2A3, W2A4, W2A5, W2A6, W2A7, W2A8],
};

// ----------------------------------------------------
// WORLD 3: THE KINGDOM COMES ALIVE (CSS — Design the World)
// ----------------------------------------------------
export const W3A1 = createAdv(3, 1, 'Paint the Kingdom', 'CSS Colors & Backgrounds', '🎨', 'Transform the gray digital kingdom with vibrant colors and rich backgrounds.', 'Master CSS color rules, background-color, and hex/HSL colors.', 'Paint the village walls.', ['The Gray Kingdom', 'Choose a Color', 'Paint the Walls', 'Color the Text', 'Kingdom Backgrounds', 'The Color Palette', 'Paint the Village', 'Match the Kingdom', 'Repair the Colors', 'Designer Challenge', 'Royal Color Test', 'Painted Kingdom']);
export const W3A2 = createAdv(3, 2, 'Royal Fashion', 'CSS Typography & Borders', '👑', 'Style fonts, headings, and borders across the kingdom.', 'Master font-family, font-size, text-align, and border styling.', 'Dress the village in royal typography.', ['Choose a Font', 'Change the Letters', 'Make It Bigger', 'Make It Smaller', 'Space the Words', 'Royal Borders', 'Style the Headings', 'Dress the Village', 'Repair the Styles', 'Fashion Challenge', 'Royal Designer Test', 'Kingdom Style']);
export const W3A3 = createAdv(3, 3, 'Interior Designer', 'CSS Box Model', '🛋️', 'Control spacing, padding, margins, and borders around palace rooms.', 'Master CSS Box Model: content, padding, border, and margin.', 'Decorate palace rooms.', ['Enter the Room', 'Meet the Box', 'Add Padding', 'Create a Margin', 'Build a Border', 'Control the Space', 'Decorate the Rooms', 'Fix the Box', 'The Crowded Palace', 'Interior Challenge', 'Master Designer Test', 'Perfect Rooms']);
export const W3A4 = createAdv(3, 4, 'Streets & Layouts', 'CSS Flexbox Layouts', '🛣️', 'Align buildings and streets using flexible box layouts.', 'Master display: flex, justify-content, align-items, and flex-direction.', 'Arrange kingdom streets.', ['The Messy Streets', 'Meet Flexbox', 'Row or Column', 'Align the Buildings', 'Space the Houses', 'Center the Town', 'Position the Castle', 'Arrange the Streets', 'Repair the Layout', 'Town Planner Challenge', 'Layout Test', 'Perfect Streets']);
export const W3A5 = createAdv(3, 5, 'City Planner', 'CSS Grid Layouts', '🏙️', 'Design 2D city neighborhoods with CSS grid rows and columns.', 'Master display: grid, grid-template-columns, and grid-gap.', 'Grid the kingdom city.', ['Meet the Grid', 'Create a Row', 'Create a Column', 'Build the Neighborhood', 'Place the Houses', 'Span the Streets', 'Design the Blocks', 'Grid the City', 'Repair the Neighborhood', 'City Planner Challenge', 'Grid Master Test', 'Kingdom City']);
export const W3A6 = createAdv(3, 6, 'Garden Designer', 'CSS Animations & Transitions', '🌺', 'Add hover effects and smooth transitions to bring gardens to life.', 'Master CSS hover, transition, and keyframe animation.', 'Animate the living gardens.', ['The Sleeping Garden', 'Meet Hover', 'Make It Move', 'Smooth Transitions', 'Open the Flowers', 'Moving Gardens', 'Animate the Kingdom', 'Bring the Garden Alive', 'Repair the Animation', 'Garden Challenge', 'Animation Test', 'Living Gardens']);
export const W3A7 = createAdv(3, 7, 'Mobile Builders', 'Responsive Design & Media Queries', '📱', 'Make the kingdom look beautiful on phones, tablets, and desktops.', 'Master media queries (@media) and fluid layouts.', 'Adapt kingdom to mobile screens.', ['The Tiny Kingdom', 'Meet Responsive Design', 'The First Breakpoint', 'Resize the Village', 'Mobile Navigation', 'Flexible Images', 'Tablet Kingdom', 'Phone Kingdom', 'Repair Every Screen', 'Responsive Challenge', 'Device Test', 'Kingdom Everywhere']);
export const W3A8 = createAdv(3, 8, 'Festival Decoration', 'CSS Components & Effects', '🎪', 'Design cards, badges, and buttons with shadows and glassmorphism.', 'Master box-shadow, border-radius, and UI component styling.', 'Decorate the kingdom festival.', ['Prepare the Festival', 'Build a Card', 'Design a Button', 'Create a Badge', 'Add Shadows', 'Add Effects', 'Style the Festival', 'Build the Celebration', 'Repair the Components', 'Festival Challenge', 'Royal Design Test', 'Kingdom Festival']);
export const W3A9 = createAdv(3, 9, 'Kingdom Makeover', 'CSS Redesign & Themes', '🪄', 'Revamp existing kingdom structures with modern theme palettes.', 'Master CSS variables (--color-primary) and theme switching.', 'Execute the Kingdom Makeover.', ['The Old Kingdom', 'Choose a New Style', 'Redesign the Village', 'Redesign the Market', 'Redesign the Library', 'Redesign the Palace', 'Unify the Kingdom', 'Fix the Visuals', 'Polish the Details', 'Makeover Challenge', 'Designer\'s Final Test', 'The New Kingdom']);
export const W3A10 = createAdv(3, 10, 'The Grand Palace', 'Advanced CSS Architecture', '🏰', 'Architect the complete visual styling of the Royal Palace.', 'Combine Flexbox, Grid, Box Model, and Typography in complex UI.', 'Style the Grand Palace.', ['Palace Blueprint', 'Build the Entrance', 'Design the Great Hall', 'Style the Royal Rooms', 'Connect the Palace', 'Make It Responsive', 'Add the Final Details', 'Test Every Room', 'Repair the Palace', 'Grand Palace Challenge', 'Royal Designer\'s Trial', 'The Beautiful Kingdom']);
export const W3A11 = createAdv(3, 11, 'The Royal Design Academy', 'CSS Mastery Exercises', '🎓', 'Solve rapid-fire CSS design challenges.', 'Test comprehensive knowledge of all CSS properties.', 'Earn Master Designer certification.', ['Enter the Academy', 'Color Mastery', 'Typography Trial', 'Spacing Trial', 'Box Model Trial', 'Flexbox Trial', 'Grid Trial', 'Responsive Trial', 'Animation Trial', 'Design Combination', 'Master Designer Challenge', 'Royal Design Master']);
export const W3A12 = createAdv(3, 12, 'The Kingdom Showcase', 'Final CSS Capstone', '🏆', 'Present the complete, beautifully styled kingdom.', 'Deploy a fully styled, responsive, animated web showcase.', 'Deliver the Kingdom Showcase.', ['The Showcase Begins', 'Choose Your Best Work', 'Polish the Homepage', 'Perfect the Gallery', 'Perfect the Navigation', 'Perfect the Components', 'Test Every Screen', 'Fix the Final Details', 'Kingdom Inspection', 'Showcase Challenge', 'Grand Design Trial', 'Kingdom Showcase']);

export const WORLD_3: WorldConfig = {
  id: 3,
  slug: 'the-kingdom-comes-alive',
  name: 'World 3 — The Kingdom Comes Alive',
  description: 'Design the World. Style the kingdom with CSS colors, typography, flexbox, grid, and animations.',
  language: 'CSS',
  theme: 'Design the World',
  adventures: [W3A1, W3A2, W3A3, W3A4, W3A5, W3A6, W3A7, W3A8, W3A9, W3A10, W3A11, W3A12],
};

// ----------------------------------------------------
// WORLD 4: BRING THE KINGDOM TO LIFE (JavaScript — Awaken the World)
// ----------------------------------------------------
export const W4A1 = createAdv(4, 1, 'Sparks of Magic', 'JS Variables & Interactivity', '⚡', 'Awaken the kingdom with JavaScript variables and click handlers.', 'Master let, const, strings, numbers, and basic click events.', 'Light the first magic torch.', ['Discover the Magic', 'Create a Variable', 'Store a Secret', 'Light the Torch', 'Press the Button', 'Hear the Click', 'Change the Kingdom', 'Control the Torch', 'Repair the Magic', 'Magic Challenge', 'Apprentice Trial', 'First Spark']);
export const W4A2 = createAdv(4, 2, 'Talking Objects', 'DOM Events & Listeners', '💬', 'Listen for clicks, hovers, and inputs on kingdom doors and gates.', 'Master addEventListener, click events, and DOM manipulation.', 'Operate the castle gates.', ['The Silent Door', 'Listen for a Click', 'Open the Door', 'Close the Door', 'Move the Gate', 'Talk to the Button', 'Create an Event', 'Control the Castle', 'Repair the Signals', 'Event Challenge', 'Royal Mechanism Test', 'Talking Kingdom']);
export const W4A3 = createAdv(4, 3, 'Magic Decisions', 'JS Conditionals (If / Else)', '🧙', 'Program guards and magic doors to make smart decisions.', 'Master if, else if, else, and comparison operators (==, ===, >, <).', 'Program the Guard Gate.', ['The Guard\'s Question', 'Meet If', 'Choose a Path', 'Unlock with If', 'Meet Else', 'Two Possible Roads', 'Guard the Castle', 'Make the Decision', 'Repair the Rules', 'Decision Challenge', 'Royal Guard Test', 'The Magic Gate']);
export const W4A4 = createAdv(4, 4, 'Endless Machines', 'JS Loops (For / While)', '⚙️', 'Automate windmills and water wheels with repetition loops.', 'Master for loops, while loops, and loop counters.', 'Power the endless machines.', ['The Turning Wheel', 'Meet the Loop', 'Repeat the Spell', 'Count the Turns', 'Build a Windmill', 'Power the Water Wheel', 'Repeat with Purpose', 'Control the Machine', 'Stop the Loop', 'Machine Challenge', 'Automation Test', 'Endless Machines']);
export const W4A5 = createAdv(4, 5, 'Magic Scrolls', 'JS Functions & Parameters', '📜', 'Package spells into reusable JavaScript functions.', 'Master function declarations, parameters, arguments, and return values.', 'Write the Royal Spellbook.', ['The First Spell', 'Create a Function', 'Cast the Spell', 'Give It Instructions', 'Add Parameters', 'Return the Magic', 'Build a Spellbook', 'Reuse the Spells', 'Repair the Spell', 'Wizard Challenge', 'Function Trial', 'Royal Spellbook']);
export const W4A6 = createAdv(4, 6, 'Treasure Vault', 'JS Arrays & Operations', '💎', 'Store and manage treasures in JavaScript arrays.', 'Master array creation, push, pop, index access, and array length.', 'Organize the Treasure Vault.', ['Enter the Vault', 'Meet the Array', 'Store the Treasures', 'Find the Treasure', 'Add More Treasures', 'Remove a Treasure', 'Count the Inventory', 'Search the Vault', 'Organize the Treasure', 'Vault Challenge', 'Inventory Trial', 'Royal Treasure Vault']);
export const W4A7 = createAdv(4, 7, 'Citizens', 'JS Objects & Properties', '🧑‍🤝‍🧑', 'Represent kingdom citizens with JavaScript objects and properties.', 'Master Object literals, key-value pairs, property access, and updates.', 'Register the Kingdom Citizens.', ['Meet the Citizens', 'Create an Object', 'Give a Citizen a Name', 'Add Citizen Details', 'Find a Citizen', 'Change Their Details', 'Build the Citizen List', 'Create an NPC', 'Bring the Citizens Alive', 'Citizen Challenge', 'Royal Records Test', 'Kingdom Citizens']);
export const W4A8 = createAdv(4, 8, 'Festival Games', 'JS Timers & Game Logic', '🎯', 'Build reaction time games, quizzes, and memory challenges.', 'Master setInterval, setTimeout, score counters, and state updating.', 'Launch the Festival Games.', ['Open the Festival', 'Build a Reaction Game', 'Start the Timer', 'Count the Score', 'Build a Quiz', 'Check the Answer', 'Create a Memory Game', 'Track the Player', 'Add the Final Rules', 'Festival Challenge', 'Game Builder Trial', 'Kingdom Game Festival']);
export const W4A9 = createAdv(4, 9, 'Royal Marketplace', 'JS Shopping Cart Logic', '🛒', 'Build interactive shopping carts and total price calculators.', 'Master array iteration (forEach, map), price calculations, and DOM rendering.', 'Operate the Royal Marketplace.', ['Open the Marketplace', 'Display the Products', 'Choose an Item', 'Add to the Cart', 'Count the Price', 'Remove an Item', 'Calculate the Total', 'Confirm the Order', 'Build the Checkout', 'Marketplace Challenge', 'Royal Merchant Trial', 'Interactive Marketplace']);
export const W4A10 = createAdv(4, 10, 'Kingdom Simulator', 'JS State Management', '🔮', 'Simulate resource flow, citizen health, and event triggers.', 'Master state objects, event handling, and game loop integration.', 'Run the Kingdom Simulator.', ['Enter the Simulator', 'Build the Kingdom State', 'Control the Citizens', 'Manage Resources', 'Trigger Events', 'Create the Rules', 'Connect the Systems', 'Test the Kingdom', 'Repair the Simulation', 'Simulator Challenge', 'Royal Engineer Trial', 'Kingdom Simulator']);
export const W4A11 = createAdv(4, 11, 'The Magic Academy', 'JS Comprehensive Review', '🏛️', 'Prove mastery over all core JavaScript concepts.', 'Pass comprehensive JS coding challenges.', 'Earn Master Coder title.', ['Enter the Academy', 'Variables Trial', 'Events Trial', 'Conditions Trial', 'Loops Trial', 'Functions Trial', 'Arrays Trial', 'Objects Trial', 'Game Logic Trial', 'Magic Combination', 'Master Coder Trial', 'JavaScript Mastery']);
export const W4A12 = createAdv(4, 12, 'The Awakening', 'Final JS Capstone', '🌟', 'Awaken every part of the kingdom with interactive JavaScript.', 'Deploy a fully interactive JavaScript kingdom web app.', 'Awaken the Living Kingdom.', ['The Kingdom Sleeps', 'Wake the Village', 'Open the Gates', 'Activate the Machines', 'Call the Citizens', 'Start the Festival', 'Connect Every System', 'Test the Kingdom', 'Repair the Magic', 'Awakening Challenge', 'Final Magic Trial', 'The Living Kingdom']);

export const WORLD_4: WorldConfig = {
  id: 4,
  slug: 'bring-the-kingdom-to-life',
  name: 'World 4 — Bring the Kingdom to Life',
  description: 'Awaken the World. Program interactivity with JavaScript events, functions, arrays, objects, and game logic.',
  language: 'JavaScript',
  theme: 'Awaken the World',
  adventures: [W4A1, W4A2, W4A3, W4A4, W4A5, W4A6, W4A7, W4A8, W4A9, W4A10, W4A11, W4A12],
};

// ----------------------------------------------------
// WORLD 5: THE MASTER ENGINEER (Python — Power the World)
// ----------------------------------------------------
export const W5A1 = createAdv(5, 1, 'Engine Start', 'Python Basics & Output', '🚀', 'Power the kingdom\'s central generators with Python print statements and variables.', 'Master Python syntax, print(), variables, and data types (str, int, float).', 'Start the Power Generator.', ['Enter the Engine Room', 'Meet Python', 'Print the First Message', 'Create a Variable', 'Store Energy', 'Read the Engine', 'Start the Generator', 'Control the Power', 'Repair the Engine', 'Engineer Challenge', 'Engine Trial', 'Power Generator']);
export const W5A2 = createAdv(5, 2, 'Energy Control', 'Python Math & User Input', '⚡', 'Read sensor inputs and perform calculations on the power grid.', 'Master input(), int(), float(), arithmetic operators (+, -, *, /).', 'Operate the Power Station.', ['Measure the Energy', 'Ask for Input', 'Read the Numbers', 'Add the Power', 'Subtract the Load', 'Multiply the Energy', 'Calculate the Output', 'Control the Station', 'Repair the Calculations', 'Energy Challenge', 'Power Engineer Trial', 'Power Station']);
export const W5A3 = createAdv(5, 3, 'Smart Machines', 'Python Conditionals', '🤖', 'Program automated doors and safety systems with Python logic.', 'Master if, elif, else, and Boolean expressions (True, False, and, or, not).', 'Program Automatic Doors.', ['Meet the Smart Door', 'Ask a Question', 'Make a Decision', 'Open with If', 'Close with Else', 'Add More Rules', 'Program the Door', 'Build a Smart Machine', 'Repair the Logic', 'Machine Challenge', 'Automation Trial', 'Automatic Doors']);
export const W5A4 = createAdv(5, 4, 'Factory Line', 'Python Loops & Automation', '🏭', 'Automate product manufacturing with Python loops.', 'Master for loops, while loops, range(), and break/continue.', 'Run the Kingdom Factory.', ['Enter the Factory', 'Meet the Loop', 'Repeat a Task', 'Count the Products', 'Build the Conveyor', 'Automate the Factory', 'Control the Production', 'Stop the Machine', 'Repair the Factory', 'Factory Challenge', 'Automation Engineer Trial', 'Kingdom Factory']);
export const W5A5 = createAdv(5, 5, 'Robot Workers', 'Python Modular Functions', '🦾', 'Delegate tasks to autonomous Python robot workers.', 'Master def function creation, parameters, return statements, and scope.', 'Deploy the Robot Workforce.', ['Meet the Robots', 'Create a Function', 'Give a Robot a Task', 'Add Instructions', 'Send the Robot', 'Give It Parameters', 'Build Robot Tasks', 'Coordinate the Workers', 'Repair the Robots', 'Robot Challenge', 'Engineering Trial', 'Robot Workforce']);
export const W5A6 = createAdv(5, 6, 'Warehouse', 'Python Lists & Inventories', '📦', 'Manage kingdom stock and shipping with Python lists.', 'Master list creation, append(), remove(), len(), and indexing.', 'Manage the Kingdom Warehouse.', ['Enter the Warehouse', 'Create an Inventory', 'Add an Item', 'Remove an Item', 'Find an Item', 'Count the Stock', 'Organize the Inventory', 'Track the Products', 'Repair the Warehouse', 'Inventory Challenge', 'Warehouse Engineer Trial', 'Kingdom Warehouse']);
export const W5A7 = createAdv(5, 7, 'City Records', 'Python Dictionaries', '🗄️', 'Store citizen data in key-value Python dictionaries.', 'Master dictionary creation, key lookup, value updates, and dict methods.', 'Build the Citizen Database.', ['Enter the Records Room', 'Meet Dictionaries', 'Create a Citizen Record', 'Add Citizen Data', 'Find a Citizen', 'Update a Record', 'Search the Database', 'Organize the Records', 'Repair the Database', 'Records Challenge', 'Data Engineer Trial', 'Citizen Database']);
export const W5A8 = createAdv(5, 8, 'Research Lab', 'Python File Handling', '🔬', 'Save and load experiment data from files.', 'Master open(), read(), write(), and file context managers (with open).', 'Build the Research Lab log.', ['Enter the Laboratory', 'Create a File', 'Write the Data', 'Read the Data', 'Save the Results', 'Load the Results', 'Build a Research Log', 'Organize the Files', 'Repair the Records', 'Research Challenge', 'Laboratory Trial', 'Kingdom Research Lab']);
export const W5A9 = createAdv(5, 9, 'AI Workshop', 'Python Algorithms & Logic', '🧠', 'Design intelligent algorithms for decision-making systems.', 'Master algorithmic thinking, pattern matching, and problem decomposition.', 'Program the Intelligent Kingdom.', ['Enter the AI Workshop', 'Meet the Algorithm', 'Break Down the Problem', 'Find a Pattern', 'Make a Decision', 'Build a Simple Algorithm', 'Automate a Task', 'Teach the Machine', 'Test the Solution', 'AI Challenge', 'Master Engineer Trial', 'Intelligent Kingdom']);
export const W5A10 = createAdv(5, 10, 'Kingdom Core', 'Python System Integration', '🌌', 'Integrate all engineering subsystems into the Kingdom Core.', 'Combine functions, data structures, loops, and file storage into a central system.', 'Power the Kingdom Core.', ['Enter the Kingdom Core', 'Start the System', 'Connect the Machines', 'Manage the Citizens', 'Control the Resources', 'Read the Kingdom Data', 'Automate the Kingdom', 'Build the Core Logic', 'Test Every System', 'Repair the Core', 'Master Engineer Challenge', 'Kingdom Core']);
export const W5A11 = createAdv(5, 11, 'The Engineer\'s Academy', 'Python Comprehensive Review', '📐', 'Demonstrate complete Python engineering proficiency.', 'Solve complex Python software engineering problems.', 'Earn Master Engineer certification.', ['Enter the Academy', 'Python Foundations', 'Variables Trial', 'Input & Math Trial', 'Conditions Trial', 'Loops Trial', 'Functions Trial', 'Lists Trial', 'Dictionaries Trial', 'Files & Algorithms', 'Engineering Challenge', 'Master Engineer Trial']);
export const W5A12 = createAdv(5, 12, 'The Digital Kingdom', 'Final Python Capstone', '👑', 'Power and automate the entire Digital Kingdom.', 'Deploy a complete Python backend system powering the entire Digital Kingdom.', 'The Digital Kingdom Master System.', ['The Final Blueprint', 'Power the Kingdom', 'Connect the Systems', 'Manage the Citizens', 'Automate the Machines', 'Protect the Data', 'Run the Kingdom', 'Find the Final Problem', 'Repair the Kingdom', 'Final Engineering Challenge', 'Master Engineer\'s Trial', 'The Digital Kingdom']);

export const WORLD_5: WorldConfig = {
  id: 5,
  slug: 'the-master-engineer',
  name: 'World 5 — The Master Engineer',
  description: 'Power the World. Master backend programming, data structures, automation, and algorithms with Python.',
  language: 'Python',
  theme: 'Power the World',
  adventures: [W5A1, W5A2, W5A3, W5A4, W5A5, W5A6, W5A7, W5A8, W5A9, W5A10, W5A11, W5A12],
};

export const WORLD_1: WorldConfig = {
  id: 1,
  slug: 'world-1',
  name: 'World 1 — Monkey Explorers',
  description: 'Master Sequencing, Loops, Conditionals, Variables, and Functions.',
  language: 'Block Coding',
  theme: 'Logic & Movement',
  adventures: [ADVENTURE_1, ADVENTURE_2, ADVENTURE_3, ADVENTURE_4, ADVENTURE_5],
};

export const ALL_WORLDS: WorldConfig[] = [
  WORLD_1,
  WORLD_2,
  WORLD_3,
  WORLD_4,
  WORLD_5,
];

export const PUZZLE_LEVELS: LevelConfig[] = ADVENTURE_1.levels;
