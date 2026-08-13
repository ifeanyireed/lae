  To optimize additional or future files added to the project, you can use the newly created automated script:
  ──────
  ### ⚡ Method 1: Using NPM Commands (Recommended)

  Whenever you add new SVG files, character JPGs, or image assets to frontend/public/:

  1. Optimize All Assets in frontend/public/:
    cd frontend
    npm run optimize:assets

      • What it does:
          • Automatically extracts embedded high-res raster PNGs inside SVGs, downscales them, and compresses them with maximum PIL optimization (reducing 3 MB SVGs to ~200–300 KB).
          • Compacts vector SVGs by stripping unnecessary XML metadata/whitespace.
          • Resizes and compresses JPGs (saving 90%+ space while maintaining visual quality).

  2. Sync / Deploy Optimized Assets to the CDN:
    cd frontend
    npm run cdn:deploy

      • What it does:
          • Automatically uploads all optimized SVGs, JPGs, PNGs, and videos from frontend/public/ directly to Hostinger CDN (https://cdn.resultspro.ng/assets/) over SFTP, creating
          nested subdirectories automatically as needed.

admin@puzzlepro.com / admin123