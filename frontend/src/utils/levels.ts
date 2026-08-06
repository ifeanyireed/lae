import { LevelConfig, PathWaypoint, AdventureConfig } from '@/types/game';

// Level 1 specific track waypoints (4-tile straight vertical axis in center of Level 1 SVG, FINISH on tile 4)
export const LEVEL_1_WAYPOINTS: PathWaypoint[] = [
  { index: 0, r: 0, c: 0, xPercent: 50.16, yPercent: 37.6, type: 'start', label: 'START', initialHeading: 'S' },
  { index: 1, r: 1, c: 0, xPercent: 50.16, yPercent: 46.0, type: 'normal' },
  { index: 2, r: 2, c: 0, xPercent: 50.16, yPercent: 54.5, type: 'normal' },
  { index: 3, r: 3, c: 0, xPercent: 50.16, yPercent: 63.0, type: 'goal', label: 'FINISH' },
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
  story: `A friendly little robot has crash-landed in the Whispering Forest. Its navigation system is broken, and only by giving it the correct instructions can it find its way home. Every level repairs a little more of the robot's memory and unlocks the path ahead.`,
  learningObjective: `Follow and create simple sequences; Understand that instructions execute in order; Navigate using movement commands; Plan a route before execution; Collect required items while completing a task; Recognize and avoid hazards; Debug simple mistakes; Complete increasingly complex algorithmic challenges.`,
  totalLevels: 12,
  levels: [
    {
      id: 1,
      levelNumber: 1,
      title: 'Power Up!',
      description: 'Learn that a robot only acts when given instructions.',
      objective: 'Learn that a robot only acts when given instructions.',
      mechanic: 'Basic Movement',
      bgImage: '/The Lost Monkey Explorer - Level 1.svg',
      waypoints: LEVEL_1_WAYPOINTS,
      availableBlocks: ['move_forward'],
      maxBlocks: 5,
    },
    {
      id: 2,
      levelNumber: 2,
      title: 'First Steps',
      description: 'Create a longer sequence of instructions.',
      objective: 'Create a longer sequence of instructions.',
      mechanic: 'Sequential Execution',
      bgImage: '/The Lost Monkey Explorer - Level 2.svg',
      waypoints: LEVEL_2_WAYPOINTS,
      availableBlocks: ['move_forward'],
      maxBlocks: 8,
    },
    {
      id: 3,
      levelNumber: 3,
      title: 'Around the Tree',
      description: 'Navigate around an obstacle.',
      objective: 'Navigate around an obstacle.',
      mechanic: 'Turning',
      bgImage: '/The Lost Monkey Explorer - Level 3.svg',
      waypoints: LEVEL_3_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around'],
      maxBlocks: 10,
    },
    {
      id: 4,
      levelNumber: 4,
      title: 'Energy Crystal',
      description: 'Collect your first item before reaching the goal.',
      objective: 'Collect your first item before reaching the goal.',
      mechanic: 'Collectibles',
      bgImage: '/The Lost Monkey Explorer - Level 4.svg',
      waypoints: LEVEL_4_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around'],
      maxBlocks: 10,
    },
    {
      id: 5,
      levelNumber: 5,
      title: 'Treasure Trail',
      description: 'Collect every energy crystal on the path.',
      objective: 'Collect every energy crystal on the path.',
      mechanic: 'Planning & Collectibles',
      bgImage: '/The Lost Monkey Explorer - Level 5.svg',
      waypoints: LEVEL_5_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 12,
    },
    {
      id: 6,
      levelNumber: 6,
      title: 'Danger Ahead',
      description: 'Reach the finish without touching dangerous tiles.',
      objective: 'Reach the finish without touching dangerous tiles.',
      mechanic: 'Hazard Avoidance',
      bgImage: '/The Lost Monkey Explorer - Level 6.svg',
      waypoints: LEVEL_6_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 12,
    },
    {
      id: 7,
      levelNumber: 7,
      title: 'Watch Your Step!',
      description: 'Find a safe route around a pit.',
      objective: 'Find a safe route around a pit.',
      mechanic: 'Alternative Paths',
      bgImage: '/The Lost Monkey Explorer - Level 7.svg',
      waypoints: LEVEL_7_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 12,
    },
    {
      id: 8,
      levelNumber: 8,
      title: 'Hidden Rewards',
      description: 'Explore to collect optional stars before finishing.',
      objective: 'Explore to collect optional stars before finishing.',
      mechanic: 'Bonus Objectives',
      bgImage: '/The Lost Monkey Explorer - Level 8.svg',
      waypoints: LEVEL_8_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 15,
    },
    {
      id: 9,
      levelNumber: 9,
      title: 'Treasure Hunt',
      description: 'Collect all treasures and return safely to the finish.',
      objective: 'Collect all treasures and return safely to the finish.',
      mechanic: 'Route Planning',
      bgImage: '/The Lost Monkey Explorer - Level 9.svg',
      waypoints: LEVEL_9_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 15,
    },
    {
      id: 10,
      levelNumber: 10,
      title: 'Choose Wisely',
      description: 'Find the safest and smartest path through the maze.',
      objective: 'Find the safest and smartest path through the maze.',
      mechanic: 'Path Optimization',
      bgImage: '/The Lost Monkey Explorer - Level 10.svg',
      waypoints: LEVEL_10_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 15,
    },
    {
      id: 11,
      levelNumber: 11,
      title: 'Explorer\'s Trial',
      description: 'Combine everything you\'ve learned to solve a complex maze.',
      objective: 'Combine everything you\'ve learned to solve a complex maze.',
      mechanic: 'Integrated Trial',
      bgImage: '/The Lost Monkey Explorer - Level 11.svg',
      waypoints: LEVEL_11_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 20,
    },
    {
      id: 12,
      levelNumber: 12,
      title: 'Journey Home',
      description: 'Guide the robot through its final mission and help it return home.',
      objective: 'Guide the robot through its final mission and help it return home.',
      mechanic: 'Mastery Challenge',
      bgImage: '/The Lost Monkey Explorer - Level 12.svg',
      waypoints: LEVEL_12_WAYPOINTS,
      availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'turn_around', 'repeat'],
      maxBlocks: 25,
    },
  ],
};

export const PUZZLE_LEVELS: LevelConfig[] = ADVENTURE_1.levels;
