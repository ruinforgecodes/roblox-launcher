# RuinForge Launcher

RuinForge is a Windows desktop launcher for **Roblox experiences**: sign in with Roblox, browse a catalog, keep a library of favorites, pick a server, and hand the experience to the official Roblox Player.

The interface is original to RuinForge. The launcher is built with Electron, uses Roblox OAuth 2.0 (authorization code + PKCE) for sign-in, and talks to the Roblox Player through Roblox's own deep link — it never asks for a Roblox password and never touches `.ROBLOSECURITY` cookies or authentication tickets.

## What it does

- **Roblox sign-in** — opens `roblox.com` in the default browser, receives the loopback callback on `http://127.0.0.1:53682/oauth/callback`, exchanges the code with PKCE, and stores only the refresh token (Electron `safeStorage`).
- **Discover** — search across experience name, creator, genre, and tags; filter by genre; sort by popularity, rating, recency, or A–Z.
- **Library** — favorites, recently played, and experiences launched through RuinForge, plus a local asset-cache summary.
- **Servers** — suggested servers per experience with region, ping, and capacity; quick join picks the lowest-ping server.
- **Launching** — checks for the installed Roblox Player, then opens `roblox://experiences/start?placeId=…` and falls back to the web start URL. The Roblox Player keeps its own session, so RuinForge hands off instead of injecting credentials.
- **Downloads** — Player/asset-cache status, update checks, optional module installs, and a storage overview.
- **Settings** — launch behaviour, graphics preset, preferred region, data folders, and account management.

## Preview build

The repository's preview environment serves `src/index.html` + `src/renderer.js` in a browser. There is no Electron IPC and no Roblox OAuth redirect there, so the renderer detects the missing desktop API and runs in a **clearly labelled preview mode**:

- sign-in is simulated with sample profiles (no real Roblox account is contacted);
- launching plays the real hand-off sequence as a simulation;
- the experience catalog is original sample data, not live Roblox data;
- favorites, settings, and downloads are kept in the page's local storage (the preview may reset them when the environment reloads).

The strict Content-Security-Policy is applied by the Electron shell as a response header (`src/main.cjs`), so the packaged app stays locked down even though `index.html` no longer carries a `meta` CSP tag.

Nothing in the preview mode claims a real session or launch. The Windows build uses the real paths described above.

## Build on Windows x64

Requirements: Node.js 22.16 or newer, a Roblox OAuth 2.0 app, and an internet connection.

1. Create an OAuth 2.0 app at <https://create.roblox.com/dashboard/credentials> and add the redirect URI `http://127.0.0.1:53682/oauth/callback`.
2. Copy `.env.example` to `.env` and set `RUINFORGE_ROBLOX_CLIENT_ID`. Set `RUINFORGE_ROBLOX_CLIENT_SECRET` only if your app is a confidential client.
3. Run:

```powershell
npm ci
npm test
npm run build
```

The installer is written to `release-build\RuinForge-Launcher-1.0.0-setup.exe`. Run `npm start` for the development app.

`npm test` runs the Node test suite for the Roblox OAuth helpers (`src/roblox.test.cjs`).

## Notes and limits

- The Roblox Player must be installed once from <https://www.roblox.com/download>. RuinForge detects it under `%LOCALAPPDATA%\Roblox\Versions`.
- Roblox does not expose a way for a third-party launcher to sign the Player in with an OAuth token. The Player uses the Roblox session already on the PC; RuinForge opens the experience and cannot read the in-game session.
- The installer is unsigned unless you add code signing. Windows may show an unknown-publisher or SmartScreen warning.
- RuinForge is an independent project. It is not affiliated with, endorsed by, or sponsored by Roblox Corporation.
