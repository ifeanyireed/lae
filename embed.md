# Complete PuzzlePro iFrame Embedding Implementation Guide

This document contains the complete technical specification, configuration, and implementation history for embedding the **PuzzlePro** gamified coding adventure platform on **SkillUp Learning Academy** (`www.skilluplearningacademy.com`).

---

## 1. Integration Architecture & URL Specifications

| Property | Value / Endpoint |
| :--- | :--- |
| **Host Website Domain** | `www.skilluplearningacademy.com` |
| **Embed Page Route** | `https://www.skilluplearningacademy.com/puzzlepro` |
| **iFrame Target Engine** | `https://learn2earnhq.com/embed?org_token=TOKEN_SKIL_9901` |
| **Backend Microservice API** | Render API (`https://player-service-bttg.onrender.com`) |
| **Google Ads Verification** | `https://www.learn2earnhq.com/ads.txt` |
| **Email Proxy API** | `https://resultspro.ng/email_proxy/api/send-email.php` |

---

## 2. SkillUp Website Repository (`ifeanyireed/skill_up`)

### A. Clean Fullscreen Embed Page (`/puzzlepro`)
- File: `src/pages/PuzzleProPage.tsx`
- Renders a 100vw × 100vh fixed iframe (`position: fixed`, `inset: 0`, `border: 0`, `zIndex: 999999`).
- Removes all headers, footers, hero banners, margins, and outer containers on `/puzzlepro`.
- **Embed Snippet**:
  ```html
  <iframe src="https://learn2earnhq.com/embed?org_token=TOKEN_SKIL_9901" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
  ```

### B. Header & Footer Navigation Buttons
- **Header (`src/components/Header.tsx`)**: Added **`PuzzlePro`** button immediately after `Check-In Portal` in both desktop navigation and mobile drawer.
- **Footer (`src/components/Footer.tsx`)**: Added **`PuzzlePro`** button immediately after `Check-In Portal` in the Contact & Support column and under Navigation links.
- **Client-Side SPA Routing**: Uses React Router `NavLink to="/puzzlepro"` so clicking the button navigates internally on the same website without opening a new tab or leaving the domain.

### C. SkillUp Logo Overlay
- File: `src/pages/PuzzleProPage.tsx`
- Added a floating SkillUp Academy logo overlay at the bottom-left corner of `/puzzlepro` (`position: fixed`, `bottom: 1.25rem`, `left: 1.25rem`, `zIndex: 9999999`).
- Styled with dark glassmorphism backdrop (`backdropFilter: blur(12px)`). Clicking the logo routes users back to the home page (`/`).

### D. Server Rewrite & Page Refresh Rules (Preventing 404 & Blank Page)
- **Vite Multi-Page App (MPA) Bundling (`vite.config.ts`)**: Created `puzzlepro.html` at root and configured `rollupOptions.input` so Vite bundles `index.html` and `puzzlepro.html` into production JS/CSS assets.
- **Automated Post-Build Copy Plugin (`copy-puzzlepro-index`)**: Custom post-build plugin in `vite.config.ts` copies `dist/puzzlepro.html` into `dist/puzzlepro/index.html` with production script links (`/assets/main-Cn6_jTfP.js` and `/assets/main-CwSQ6SRd.css`).
- **Hostinger LiteSpeed / Apache Rules (`public/.htaccess`)**: Added `FallbackResource /index.html` and `RewriteRule ^(.*)$ /index.html [L]`.
- **Netlify & Vercel Fallback Rules**: Added `public/_redirects` (`/* /index.html 200`) and `vercel.json` (`rewrites`).

---

## 3. Learn2Earn Engine Repository (`ifeanyireed/lae`)

### A. Next.js Static Route Handler for `/embed`
- File: `frontend/src/app/embed/page.tsx`
- Prerendered during Next.js static export (`output: 'export'`), creating `/embed/index.html` to serve requests targeting `https://www.learn2earnhq.com/embed`.
- Updated `frontend/src/app/page.tsx` to handle `org_token`, `embed_token`, and `token` query parameters.

### B. Mandatory Student Access Code Login
- File: `frontend/src/app/page.tsx`
- Configured iframe embed verification to keep the **Login / Access Code screen** (`SplashScreen`) active (`setShowSplash(true)`).
- All students visiting `/puzzlepro` must enter their individual student access code (e.g. `83920193`, `ADMN-2026`).
- Upon access code verification, individual student profiles (*Alex Johnson*, *Sarah Williams*, etc.), stars, XP, and level progress load.

### C. Backend Token Seeding & Domain Authorization
- **Database Seeding (`player_service/internal/database/schema.go`)**: Seeded `TOKEN_SKIL_9901` for *SkillUp Learning Academy* (`org_skil_9901`) with `domain = 'skilluplearningacademy.com'`.
- **Domain Whitelist (`player_service/internal/handlers/handlers.go`)**: Authorized `skilluplearningacademy.com`, `www.skilluplearningacademy.com`, platform host domains (`learn2earnhq.com`, `resultspro.ng`), and `localhost`.
- **Error Message Sanitization**: Removed internal security enforcement text from the error modal and sanitized 403 error messages (`"Domain authorization failed: Embed token is not authorized."`).

### D. Smooth Heartbeat Monkey Loading Overlay
- File: `frontend/src/components/GlobalLoadingOverlay.tsx`
- Enhanced with smooth Framer Motion heartbeat pulsation animation:
  ```tsx
  animate={{ scale: [0.92, 1.18, 1.02, 1.25, 0.92] }}
  transition={{ duration: 1.6, repeat: Infinity, ease: [0.4, 0.0, 0.2, 1] }}
  ```
- Uses solid `bg-slate-950` backdrop with `z-[999999]` to block background image flashes on initial load.

---

## 4. Verification & Testing History

- **Google Ads `ads.txt` Endpoint**: Verified live via `curl -i https://www.learn2earnhq.com/ads.txt` $\rightarrow$ `HTTP 200 OK` (`google.com, pub-5968977408464822, DIRECT, f08c47fec0942fa0`).
- **Next.js Production Build**: `npm run build` completed with 11 prerendered static routes (`/`, `/ads.txt`, `/controls`, `/embed`, `/families`, `/schools`, `/onboarding`).
- **Vite Production Build**: `npx vite build` completed in 4.86s, generating bundled `dist/index.html` and `dist/puzzlepro/index.html`.
- **Git Repositories**: All commits built cleanly and pushed to `main` on both **`ifeanyireed/lae`** and **`ifeanyireed/skill_up`**.
