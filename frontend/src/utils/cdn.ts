export const CDN_BASE_URL = (process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.resultspro.ng/assets').replace(/\/+$/, '');

/**
 * Returns full URL for an asset, appending CDN_BASE_URL for background & heavy assets
 */
export function getCdnUrl(assetPath: string): string {
  if (!assetPath) return '';
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${CDN_BASE_URL}${encodeURI(cleanPath)}`;
}

/**
 * Preloads image in browser memory for smooth instant level transitions
 */
export function preloadNextLevelImage(adventureId: number, nextLevelNumber: number): void {
  if (typeof window === 'undefined') return;
  const nextLevelPath = getCdnUrl(`/1_${adventureId}_${nextLevelNumber}.svg`);
  
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
