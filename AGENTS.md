# AGENTS.md

This file documents AI-assisted development work on Content Checkmate.

## Session: Netlify Deployment & Wavedepth Branding (Jan 2025)

### Infrastructure: Static SPA to Netlify Server-Side Proxy

- **Adapter swap**: Replaced `@sveltejs/adapter-static` with `@sveltejs/adapter-netlify`
- **Server-side API proxy**: Created `src/routes/api/analyze/+server.ts` and `src/routes/api/usage/+server.ts` to proxy Gemini API calls server-side, keeping the API key secure
- **Rate limiting**: Implemented via Netlify Blobs (`src/lib/server/rateLimit.ts`) — 5 checks/IP/day, 100 global/day, IP addresses SHA-256 hashed
- **Shared prompt logic**: Extracted `src/lib/shared/prompts.ts` so client and server use identical analysis prompts
- **Two usage modes**:
  - **Community mode** (default): Server proxies Gemini calls, rate-limited, no key needed
  - **Own-key mode**: User provides their own Gemini API key for unlimited direct calls

### Branding & UI

- **Wavedepth branding**: Footer with "Made by wavedepth" logo, header help panel with "A wavedepth project" credit
- **Custom domain**: Deployed to Netlify at checkmycontent.com with Cloudflare DNS
- **Umami analytics**: Added self-hosted tracking via stats.wavedepth.com
- **Exclusion rule labels**: Replaced slashes with "&" for natural text wrapping on mobile
- **Font loading**: IBM Plex Sans loaded via `@fontsource` packages
- **Mobile responsive**: Tested and fixed layouts across viewport sizes

### Video Removed

- Removed video file support (images only) to simplify the analysis flow and reduce proxy costs

### Promo Video

- **Remotion framework**: 8-scene composition at 1024x768, 30fps
- **Mascot interstitial**: Dedicated Scene2MascotReveal with 350x350px mascot, spring animation, 3D rotation, pulsing glow
- **Extended CTA end card**: Scene7CTA holds static for 13s with logo, tagline, platform badges, and checkmycontent.com URL
- **AI-generated audio**:
  - Background music via Google Lyria RealTime API (WebSocket streaming, 110 BPM, synth pads)
  - Voiceover via Gemini TTS (gemini-2.5-flash-preview-tts, Orus voice)
  - Mixed with ffmpeg: voice on top, music at 15% volume, 4s fade-out
- **Final output**: ~38s, 3.7MB MP4 with audio

### Key Files Created

| File | Purpose |
|------|---------|
| `netlify.toml` | Netlify build config |
| `src/lib/shared/prompts.ts` | Shared analysis prompt logic |
| `src/lib/server/rateLimit.ts` | Netlify Blobs rate limiting |
| `src/lib/server/geminiProxy.ts` | Server-side Gemini API proxy |
| `src/routes/api/analyze/+server.ts` | POST endpoint for content analysis |
| `src/routes/api/usage/+server.ts` | GET endpoint for usage info |
| `promo-video/src/scenes/Scene2MascotReveal.tsx` | Mascot reveal interstitial scene |
| `static/wavedepth-logo.png` | Wavedepth logo asset |
| `static/mascot.png` | Content Checkmate mascot asset |

### Key Files Modified

| File | Changes |
|------|---------|
| `svelte.config.js` | Switched to Netlify adapter |
| `src/lib/stores/settings.svelte.ts` | Community/own-key mode, usage tracking |
| `src/lib/services/gemini.ts` | Proxy vs direct calls based on mode |
| `src/lib/components/layout/Header.svelte` | 4-column help panel, wavedepth credit |
| `src/lib/components/layout/Footer.svelte` | Wavedepth branding, removed model picker |
| `src/lib/components/analysis/FileUpload.svelte` | Image-only upload |
| `src/lib/data/policies.ts` | Exclusion labels with "&" instead of "/" |
| `src/app.html` | Umami analytics script |
| `promo-video/src/ContentCheckmatePromo.tsx` | 8-scene timeline, 40s duration |
| `promo-video/src/scenes/Scene7CTA.tsx` | Persistent end card with URL |
