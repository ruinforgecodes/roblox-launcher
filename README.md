# RuinForge Launcher Source

This folder contains the standalone **RuinForge** launcher for Windows: a Roblox experience launcher with Roblox OAuth sign-in, a discoverable catalog, a library, server selection, launch hand-off to the official Roblox Player, download management, and settings.

The former Minecraft/Fabric/Microsoft implementation has been replaced. `src/main.cjs` now runs the Roblox OAuth loopback flow and the Player hand-off; `src/roblox.cjs` holds the OAuth and launch-link helpers.

## Preview

The browser preview serves the launcher interface from `apps/launcher/standalone/src` on port 3000. Because a browser cannot run Electron IPC or complete Roblox's OAuth redirect, the preview runs in a labelled simulation mode with sample experience data. See `apps/launcher/standalone/README.md` for what is real and what is simulated.

## Build on Windows

1. Install Node.js 22.16 or newer.
2. Open PowerShell in `apps\launcher\standalone`.
3. Copy `.env.example` to `.env` and set `RUINFORGE_ROBLOX_CLIENT_ID` (from <https://create.roblox.com/dashboard/credentials>). Register `http://127.0.0.1:53682/oauth/callback` as the redirect URI.
4. Run:

   ```powershell
   npm ci
   npm test
   npm run build
   ```

The Windows installer will be created in `apps\launcher\standalone\release-build`.

The source archive intentionally excludes `node_modules`, generated build output, the local `.env`, and the generated `src/generated-config.cjs`. Its locked dependencies are recorded in `package-lock.json`.
