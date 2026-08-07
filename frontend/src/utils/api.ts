export const GAME_ENGINE_API_URL = (
  process.env.NEXT_PUBLIC_GAME_ENGINE_URL || 'https://game-engine-service.onrender.com'
).replace(/\/$/, '');

export const PLAYER_SERVICE_API_URL = (
  process.env.NEXT_PUBLIC_PLAYER_SERVICE_URL || 'https://player-service.onrender.com'
).replace(/\/$/, '');

export const API_BASE_URL = GAME_ENGINE_API_URL;
