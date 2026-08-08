export interface CustomItem {
  id: string;
  name: string;
  category: 'hats' | 'tops' | 'bottoms' | 'shoes' | 'hair' | 'glasses' | 'accessories';
  image: string;
  unlocked: boolean;
  levelRequired?: number;
  description?: string;
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  level: number;
  scoreLabel: string;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface PathWaypoint {
  index: number;
  r?: number;
  c?: number;
  xPercent?: number; // 0-100% relative X position on Figma board
  yPercent?: number; // 0-100% relative Y position on Figma board
  type?: 'start' | 'goal' | 'coin' | 'star' | 'shell' | 'pit' | 'question_block' | 'vine' | 'normal' | 'doctype' | 'html_tag' | 'head_tag' | 'title_tag' | 'html' | 'head' | 'title' | 'doctype_html';
  label?: string;
  effect?: 'advance_3' | 'back_2' | 'shortcut';
  initialHeading?: 'N' | 'E' | 'S' | 'W';
}

export interface LevelConfig {
  id: number;
  worldId?: number;
  adventureId?: number;
  levelNumber: number;
  title: string;
  subtitle?: string;
  description: string;
  objective: string;
  mechanic: string;
  adventureTitle?: string;
  story?: string;
  gridSize?: { rows: number; cols: number };
  startPos?: { r: number; c: number; dir: 'N' | 'E' | 'S' | 'W' };
  targetPos?: { r: number; c: number };
  bgImage?: string; // Custom Figma / SVG maze image URL/path
  waypoints: PathWaypoint[];
  availableBlocks: string[];
  maxBlocks: number;
  rewardItem?: CustomItem;
}

export interface AdventureConfig {
  id: number;
  worldId?: number;
  slug: string;
  title: string;
  concept: string;
  icon: string;
  story: string;
  learningObjective: string;
  project?: string;
  totalLevels: number;
  levels: LevelConfig[];
}

export interface WorldConfig {
  id: number;
  slug: string;
  name: string;
  description: string;
  language?: string;
  theme?: string;
  adventures: AdventureConfig[];
}
