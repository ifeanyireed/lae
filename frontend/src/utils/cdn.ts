export const CDN_BASE_URL = (process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.resultspro.ng/assets').replace(/\/+$/, '');

// Unique timestamp key to force immediate browser and CDN cache invalidation when assets update
const ASSET_VERSION_KEY = `2.1.1_${Date.now()}`;

// Local assets stored directly in /public directory that should bypass external CDN URL
const LOCAL_PUBLIC_ASSETS = ['/2_1_1.svg', '/scroll.svg', '/play.svg', '/reset.svg', '/start.svg', '/monkey1.svg'];

/**
 * Returns full URL for an asset, appending CDN_BASE_URL (or local public path for local files),
 * including a cache-busting query parameter to force browser & CDN cache refresh.
 */
export function getCdnUrl(assetPath: string, cacheBust: boolean = true): string {
  if (!assetPath) return '';
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    const queryJoin = assetPath.includes('?') ? '&' : '?';
    return cacheBust ? `${assetPath}${queryJoin}v=${ASSET_VERSION_KEY}` : assetPath;
  }
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  const query = cacheBust ? `?v=${ASSET_VERSION_KEY}` : '';

  // If asset is present locally in /public directory, serve directly from local server
  if (LOCAL_PUBLIC_ASSETS.includes(cleanPath)) {
    return `${cleanPath}${query}`;
  }

  return `${CDN_BASE_URL}${encodeURI(cleanPath)}${query}`;
}

/**
 * Preloads image in browser memory for smooth instant level transitions
 */
export function preloadNextLevelImage(adventureId: number, nextLevelNumber: number, worldId: number = 1): void {
  if (typeof window === 'undefined') return;
  const nextLevelPath = getCdnUrl(`/${worldId}_${adventureId}_${nextLevelNumber}.svg`);
  
  // 1. Browser Image Object Preload
  const img = new window.Image();
  img.src = nextLevelPath;

  // 2. Link Preload Tag Insertion
  const existingLink = document.querySelector(`link[rel="preload"][href="${nextLevelPath}"]`);
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = nextLevelPath;
    document.head.appendChild(link);
  }
}
