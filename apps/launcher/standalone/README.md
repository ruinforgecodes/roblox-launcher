# RuinForge Launcher

RuinForge Launcher is a separate Windows desktop application with an original RuinForge interface. It does not launch XMCL or reuse XMCL's screens. It stores Minecraft in a RuinForge-owned profile folder, supports Microsoft device-code sign-in, imports Modrinth `.mrpack` profiles, and installs the included RuinForge 26.3/Fabric pack.

The application is built with Electron and the MIT-licensed `minecraft-launcher-core` game-install/launch library. Microsoft passwords are entered only on Microsoft's site. The refresh token is saved with Electron `safeStorage` and is never written to a plaintext account file. Modrinth downloads are restricted to Modrinth's official CDN and checked against the pack's SHA-1 hashes before they are installed. Java 25 is discovered locally or downloaded from Eclipse Adoptium only after its published SHA-256 checksum has been verified.

## Windows installer

See [`release/RuinForge-Launcher-0.1.0-setup.exe`](../../../release/RuinForge-Launcher-0.1.0-setup.exe). This prototype is an unsigned x64 installer. Windows may show an unknown-publisher or SmartScreen warning. A public release should be code-signed and hosted on a RuinForge-owned HTTPS site with an independently published checksum.

Sign in with the Microsoft account that owns Minecraft Java Edition. If that Microsoft account uses a Gmail address, enter that address on Microsoft's sign-in page; signing in to Google alone cannot verify Minecraft ownership. This app uses the RuinForge public Microsoft Application (client) ID; the app registration must support personal Microsoft accounts and device-code sign-in. Never create or embed a client secret.

If sign-in reports `AADSTS70002` or says the client must be marked as mobile, the app registration needs its desktop/public-client settings updated in Microsoft Entra: open **App registrations > RuinForge > Authentication**, add the **Mobile and desktop applications** platform, then enable **Allow public client flows** in **Advanced settings**. Only an administrator of the app registration can change these settings.

If Microsoft accepts the one-time code but the launcher reports HTTP 403 from the Minecraft game-session service, that alone does not mean Java ownership is missing. Verify that [minecraft.net](https://www.minecraft.net/) and the official Minecraft Launcher show your Java profile for this exact Microsoft account, then retry after signing out and back in to Microsoft in your browser. The launcher shows a support reference if Microsoft returns one. Do not purchase the game again based only on this error.

If Xbox itself returns HTTP 403, sign in at [xbox.com](https://www.xbox.com/) with the same Microsoft account and complete its Xbox profile setup. If the profile already exists, check the account's region and age/family restrictions.

## Build on Windows x64

- Node.js 22.16 or newer.
- A compatible RuinForge Microsoft desktop app client ID.
- A stable internet connection for the installer, Java, Minecraft, Fabric, and mod downloads.

Copy `.env.example` to `.env` and set `RUINFORGE_MICROSOFT_CLIENT_ID` to the public application client ID. Then run:

```powershell
npm install
npm test
npm run build
```

The installer is written to `release-build\RuinForge-Launcher-0.1.0-setup.exe`. To test the development app locally, run `npm start`.

The included `.mrpack` targets Minecraft Java 26.3 and Fabric Loader 0.20.1. Importable `.mrpack` profiles live in the repository's `release` folder.
