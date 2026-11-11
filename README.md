# RuinForge Launcher Source

This folder contains the standalone RuinForge Launcher source code, its branding and build scripts, automated tests, and the included Minecraft 26.3 modpack. It does not contain the compiled installer or installed dependencies.

## Build on Windows

1. Install Node.js 22.16 or newer.
2. Open PowerShell in `apps\launcher\standalone`.
3. Copy `.env.example` to `.env` and set `RUINFORGE_MICROSOFT_CLIENT_ID` to your public Microsoft app client ID. Do not put a client secret or account password in this file.
4. Run:

   ```powershell
   npm ci
   npm test
   npm run build
   ```

The Windows installer will be created in `apps\launcher\standalone\release-build`.

The source archive intentionally excludes `node_modules`, generated build output, the local `.env`, and generated configuration so it stays small and contains no local sign-in configuration. Its locked dependencies are recorded in `package-lock.json`. The bundled profile is at `release\RuinForge-Client-3.26.3+mc26.3.mrpack`.

See `apps\launcher\standalone\README.md` for sign-in setup and project details.
